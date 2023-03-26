import JSEncrypt from 'jsencrypt';
import { geoData } from './geoData';
import { global } from './global';
import { pageChat } from './pageChat';
import { pageLogin } from './pageLogin';
import { ui } from './ui';
import { user } from './user';
import { pageHome } from './pageHome';
import { pageInfo } from './pageInfo';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { Video } from './video';

export { communication, FB, Encryption };

class communication {
	static currentCalls = [];
	static mapScriptAdded = false;
	static pingExec = null;
	static sentErrors = [];

	static afterLogin() {
		communication.ping();
		WebSocket.init();
	}
	static ajax(param) {
		for (var i = 0; i < communication.currentCalls.length; i++) {
			if (communication.currentCalls[i].url == param.url &&
				communication.currentCalls[i].method == param.method &&
				communication.currentCalls[i].progressBar == param.progressBar &&
				communication.currentCalls[i].responseType == param.responseType &&
				JSON.stringify(communication.currentCalls[i].body) == JSON.stringify(param.body))
				return;
		}
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState == 4) {
				communication.hideProgressBar(param);
				var errorHandler = function () {
					xmlhttp.param = param;
					if (param.error)
						param.error(xmlhttp);
					else
						communication.onError(xmlhttp);
				};
				if (xmlhttp.status >= 200 && xmlhttp.status < 300) {
					if (communication.pingExec == null && xmlhttp.responseURL != global.serverApi + '/ping' && xmlhttp.responseURL.indexOf(global.serverApi) == 0)
						communication.ping();
					if (param.success) {
						var response = xmlhttp.responseText;
						if (param.responseType == 'json') {
							if (response) {
								try {
									response = JSON.parse(xmlhttp.responseText)
								} catch (e) {
									xmlhttp.error = e;
									errorHandler.call();
									return;
								}
							} else
								response = null;
						}
						param.success(response);
					}
				} else
					errorHandler.call();
			}
		};
		xmlhttp.open(param.method ? param.method : 'GET', param.url, true);
		if (param.url.indexOf(global.serverApi.substring(0, global.serverApi.lastIndexOf('/', global.serverApi.length - 2))) == 0) {
			param.id = new Date().getTime();
			communication.currentCalls.push(param);
			if (param.progressBar != false)
				ui.css('progressbar', 'display', '');
			xmlhttp.setRequestHeader('webCall', param.webCall);
			xmlhttp.setRequestHeader('client', '' + user.client);
			if (user.contact) {
				var c = communication.generateCredentials();
				xmlhttp.setRequestHeader('user', c.user);
				xmlhttp.setRequestHeader('salt', c.salt);
				xmlhttp.setRequestHeader('password', c.password);
			}
		}
		var data = param.body;
		if (data) {
			if (typeof data == 'string')
				xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			else {
				xmlhttp.setRequestHeader('Content-Type', 'application/json');
				data = JSON.stringify(data);
			}

		}
		xmlhttp.send(data);
	}
	static generateCredentials() {
		var d = new Date();
		var salt = ('' + (d.getTime() + d.getTimezoneOffset() * 60 * 1000) + Math.random()).replace(/[01]\./, '.');
		return {
			user: user.contact.id,
			salt: salt,
			password: Encryption.hash(user.password + salt + user.contact.id)
		}
	}
	static hideProgressBar(param) {
		var hideProgessBar = true;
		for (var i = communication.currentCalls.length - 1; i >= 0; i--) {
			if (communication.currentCalls[i].id == param.id)
				communication.currentCalls.splice(i, 1);
			else if (communication.currentCalls[i].progressBar != false)
				hideProgessBar = false;
		}
		if (hideProgessBar)
			ui.css('progressbar', 'display', 'none');
	}
	static loadMap(callback) {
		if (communication.mapScriptAdded) {
			var f = function () {
				if (ui.q('head script[t="map"]'))
					geoData.openLocationPickerDialog();
				else
					setTimeout(f, 100);
			}
			f.call();
		} else {
			communication.mapScriptAdded = true;
			communication.ajax({
				url: global.serverApi + 'action/google?param=js',
				responseType: 'text',
				webCall: 'communication.loadMap(callback)',
				success(r) {
					var script = document.createElement('script');
					script.src = r + '&callback=' + callback;
					script.setAttribute('t', 'map');
					document.head.appendChild(script);
				}
			});
		}
	}
	static notification = {
		push: null,

		close() {
			if (ui.cssValue('alert', 'display') != 'none') {
				ui.navigation.animation('alert', 'homeSlideOut',
					function () {
						ui.css('alert', 'display', 'none');
						ui.html('alert>div', '');
					});
			}
		},
		onError(e) {
			ui.navigation.openPopup(ui.l('attention'), ui.l('pushTokenError').replace('{0}', e.message));
		},
		open(e) {
			communication.setApplicationIconBadgeNumber(e.count);
			if (e.additionalData && e.additionalData.exec
				&& e.additionalData.exec.indexOf('chat') == 0
				&& ui.q('chat[i="' + e.additionalData.exec.substring(5) + '"]')
				&& ui.cssValue('chat', 'display') != 'none')
				pageChat.refresh();
			else
				communication.ping();
		},
		register() {
			if (global.isBrowser())
				return;
			communication.notification.push = window.PushNotification.init({
				android: {
					senderID: '688983380542'
				},
				ios: {
					alert: 'true',
					badge: true,
					sound: 'false'
				}
			});
			communication.notification.push.on('registration', communication.notification.saveToken);
			communication.notification.push.on('notification', communication.notification.open);
			communication.notification.push.on('error', communication.notification.onError);
		},
		saveToken(e) {
			user.save({ webCall: 'communication.notification.saveToken(e)', pushSystem: global.getOS(), pushToken: e.registrationId });
		}
	}
	static onError(r) {
		var s, status;
		if (r.status == 401) {
			if (r.responseText.indexOf('UsedSalt') > -1)
				return;
			pageLogin.resetAfterLogoff();
		} else if (r.status == 408) {
			// timeout, do nothing, most probably app wake up from sleep modus
		} else if (r.status < 200 || r.status > 501 || r.status == 400 && r.responseText && r.responseText.toLowerCase().indexOf(' connection ') > -1) {
			try {
				s = ui.l('error.noNetworkConnection');
			} catch (e) { }
			status = r.status;
			if (status == 0)
				status = 1;
		} else {
			var s2 = '';
			if (r.param) {
				s2 += '\n' + (r.param.method ? r.param.method : 'GET') + ' ' + r.param.url;
				if (r.param.body)
					s2 += '\nbody: ' + JSON.stringify(r.param.body);
			}
			s2 += '\npage: ' + ui.navigation.getActiveID();
			var last = communication.currentCalls[0];
			if (last)
				s2 += '\ncall: ' + JSON.stringify(last);
			s2 += '\nstatus: ' + r.status;
			if (r.responseText)
				s2 += '\nresponse: ' + r.responseText;
			if (r.error)
				s2 += '\nerror: ' + r.error;
			if (!r.status || r.status < 500)
				communication.sendError('communication.onError' + s2);
			try {
				s = ui.l('error.text') + '<br/>Status:&nbsp;' + r.status;
			} catch (e) { }
		}
		if (r.param && r.param.progressBar != false && s && r.param.webCall && r.param.url.indexOf(global.serverApi) == 0) {
			if (ui.q('popupHint') && ui.q('popup').style.display != 'none')
				ui.html('popupHint', s);
			else if (ui.q('popup').getAttribute('error') != status) {
				ui.navigation.openPopup(ui.l('attention'), s);
				if (status)
					ui.q('popup').setAttribute('error', status);
			}
		}
	}
	static ping() {
		clearTimeout(communication.pingExec);
		if (!user.contact || !user.contact.id)
			return;
		communication.pingExec = -1;
		communication.ajax({
			url: global.serverApi + 'action/ping',
			progressBar: false,
			webCall: 'communication.ping()',
			responseType: 'json',
			error() {
				clearTimeout(communication.pingExec);
				communication.pingExec = null;
			},
			success(r) {
				if (ui.q('popup').getAttribute('error'))
					ui.navigation.closePopup();
				var e = ui.q('head title');
				e.innerHTML = global.appTitle;
				if (!user.contact || r.userId != user.contact.id)
					return;
				var total = 0;
				var chat = 0;
				if (r.chat.new) {
					for (var i in r.chat.new) {
						chat++;
						if (ui.q('chat[i="' + i + '"]'))
							pageChat.refresh();
						else
							ui.classAdd('chatList [i="' + i + '"]', 'highlightBackground');
					}
				}
				var chatHash = r.chat.firstId + '|' + chat + '|' + Object.keys(r.chat.unseen).length;
				if (chatHash != ui.q('chatList').getAttribute('hash')) {
					pageChat.initActiveChats();
					ui.q('chatList').setAttribute('hash', chatHash);
				}
				total += chat;
				e = ui.q('badgeChats');
				if (chat) {
					ui.classAdd(e.parentNode, 'pulse highlight');
					ui.html(e, chat);
				} else {
					ui.classRemove(e.parentNode, 'pulse highlight');
					ui.html(e, '');
				}
				if (r.notification != pageHome.badge) {
					communication.ajax({
						url: global.serverApi + 'db/list?query=contact_listNotification',
						responseType: 'json',
						webCall: 'communication.ping()',
						success(r2) {
							pageHome.initNotification(r2);
						}
					});
				}
				total += r.notification;
				pageChat.refreshActiveChat(r.chat.unseen);
				if (r.recommend)
					pageInfo.socialShareDialog();
				if (total > 0)
					ui.q('head title').innerHTML = total + global.separator + global.appTitle;
				communication.setApplicationIconBadgeNumber(total);
				clearTimeout(communication.pingExec);
				communication.pingExec = setTimeout(communication.ping, ui.q('chat chatConversation') ? 3000 : 15000);
			}
		});
	}
	static reset() {
		WebSocket.stompClient.disconnect();
		communication.setApplicationIconBadgeNumber(0);
		pageLogin.removeCredentials();
		ui.attr('content > *', 'menuIndex', null);
		communication.notification.data = [];
		communication.currentCalls = [];
	}
	static sendError(text) {
		if (!text || !global.language)
			return;
		for (var i = 0; i < communication.sentErrors.length; i++) {
			if (communication.sentErrors[i] == text)
				return;
		}
		var body = 'TEXT\n\t' + text.replace(/\n/g, '\n\t');
		body += '\n\nCONTACTID\n\t' + (user.contact ? user.contact.id : '-');
		body += '\n\nAPPNAME\n\t' + navigator.appName;
		body += '\n\nAPPVERSION\n\t' + navigator.appVersion;
		body += '\n\nLANGUAGE\n\t' + navigator.language;
		body += '\n\nPLATFORM\n\t' + navigator.platform;
		body += '\n\nUSERAGENT\n\t' + navigator.userAgent;
		body += '\n\nDEVICE\n\t' + global.getDevice();
		body += '\n\nOS\n\t' + global.getOS();
		body += '\n\nVERSION\n\t' + global.appVersion;
		body += '\n\nLOCALIZED\n\t' + geoData.localized;
		body += '\n\nLANG\n\t' + global.language;
		communication.ajax({
			url: global.serverApi + 'action/notify',
			method: 'POST',
			webCall: 'communication.sendError(text)',
			body: 'text=' + encodeURIComponent(body),
			error(r) {
				console.log(r);
			},
			success() {
				communication.sentErrors.push(text);
			}
		});
	}
	static setApplicationIconBadgeNumber(total) {
		if (communication.notification.push && !isNaN(total))
			communication.notification.push.setApplicationIconBadgeNumber(function () { }, communication.notification.onError, total);
	}
	static wsSend(destination, body) {
		WebSocket.stompClient.send(destination, {}, JSON.stringify(body));
	}
};

class Encryption {
	static jsEncrypt = new JSEncrypt();

	static decAES(transitmessage, pass) {
		var key = CryptoJS.PBKDF2(pass, CryptoJS.enc.Hex.parse(transitmessage.substr(0, 32)), {
			"keySize": 256 / 32,
			"iterations": 100
		});
		return CryptoJS.AES.decrypt(transitmessage.substring(64), key, {
			"iv": CryptoJS.enc.Hex.parse(transitmessage.substr(32, 32)),
			"padding": CryptoJS.pad.Pkcs7,
			"mode": CryptoJS.mode.CBC
		}).toString(CryptoJS.enc.Utf8);
	}
	static encAES(msg, pass) {
		var salt = CryptoJS.lib.WordArray.random(128 / 8);
		var key = CryptoJS.PBKDF2(pass, salt, {
			"keySize": 256 / 32,
			"iterations": 100
		});
		var iv = CryptoJS.lib.WordArray.random(128 / 8);
		return salt.toString() + iv.toString() + CryptoJS.AES.encrypt(msg, key, {
			"iv": iv,
			"padding": CryptoJS.pad.Pkcs7,
			"mode": CryptoJS.mode.CBC
		}).toString();
	}
	static encPUB(s) {
		var enc = new JSEncrypt();
		enc.setPublicKey('MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAih4+Co9A7+3Hm6aUAHAG0LMjHgQ9ZxT+twg6aNtpg5fJvIApYAufImV5i/Tbv57M/Bmwj4kloONv4WaeUlbx4Vy0SVdPl2fpwTY/DhaS5DIiq3VYWQqjT/MHtMNBqX7tRHHZTBJzKEvKHig0sn2rdEMrZLcBErwbWPZpLz7RWFTbjkmAzxEbTKKGBSpqGO/l4xjZIVSrjKdBOtEdB8+Tw3lwNs2eGrx13rJCPY9VLocErw5CEgqdpgYXWmGOTsfqZjTODmavopTpupI7FMG3UG0Re8YE3Eju9aSsvTyjoBGoe9Gel/dTsZJeckTt5gTPiLr7khzFlZ7MVO75n4PnT4Gsc4YCBMQPlcJ4lv5JdfjwK+JTM/ZnSAezez3TzBz9SuSPck5vpEi6ug1LkUVOmjIXJBkwuGb7eYbRUG/1cj/7boCIZa8cNg2Ired2LKn2DVfurC1LH1U4p/oZGkGP3hd0aA6GD+2PJGZL9qhOSf1Bwuj+QFnHNhil2BV5Zou73KJ1ebCBmG77jkqtk02EMxFM6zPP4ViYmoMcxrSpG12fBWMJDdXaM9aEP0nkd62X7VOi3pHHEOaNnYe1AKV2u/IPApUyWnnrQJXzVag5wHcR1kDDd4G9nzccH1QyxBTJEuEoMYbsGQUyTYsOoSL0SvvOQAf/ukBCRAh90WgTkjsCAwEAAQ==');
		return enc.encrypt(s);
	}
	static hash(s) {
		return sha256.rstr2hex(sha256.rstr_sha256(sha256.str2rstr_utf8(s)))
	}
}

class sha256 {
	static str2rstr_utf8(input) {
		var output = "";
		var i = -1;
		var x, y;

		while (++i < input.length) {
			/* Decode utf-16 surrogate pairs */
			x = input.charCodeAt(i);
			y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
			if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
				x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
				i++;
			}

			/* Encode output as utf-8 */
			if (x <= 0x7F)
				output += String.fromCharCode(x);
			else if (x <= 0x7FF)
				output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F),
					0x80 | (x & 0x3F));
			else if (x <= 0xFFFF)
				output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
					0x80 | ((x >>> 6) & 0x3F),
					0x80 | (x & 0x3F));
			else if (x <= 0x1FFFFF)
				output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
					0x80 | ((x >>> 12) & 0x3F),
					0x80 | ((x >>> 6) & 0x3F),
					0x80 | (x & 0x3F));
		}
		return output;
	}
	static rstr_sha256(s) {
		return sha256.binb2rstr(sha256.binb_sha256(sha256.rstr2binb(s), s.length * 8));
	}
	static rstr2hex(input) {
		var hex_tab = '0123456789abcdef';
		var output = '';
		var x;
		for (var i = 0; i < input.length; i++) {
			x = input.charCodeAt(i);
			output += hex_tab.charAt((x >>> 4) & 0x0F)
				+ hex_tab.charAt(x & 0x0F);
		}
		return output;
	}
	static rstr2binb(input) {
		var output = Array(input.length >> 2);
		for (var i = 0; i < output.length; i++)
			output[i] = 0;
		for (var i = 0; i < input.length * 8; i += 8)
			output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
		return output;
	}
	static binb_sha256(m, l) {
		var HASH = new Array(1779033703, -1150833019, 1013904242, -1521486534,
			1359893119, -1694144372, 528734635, 1541459225);
		var W = new Array(64);
		var a, b, c, d, e, f, g, h;
		var i, j, T1, T2;
		m[l >> 5] |= 0x80 << (24 - l % 32);
		m[((l + 64 >> 9) << 4) + 15] = l;
		for (i = 0; i < m.length; i += 16) {
			a = HASH[0];
			b = HASH[1];
			c = HASH[2];
			d = HASH[3];
			e = HASH[4];
			f = HASH[5];
			g = HASH[6];
			h = HASH[7];
			for (j = 0; j < 64; j++) {
				if (j < 16)
					W[j] = m[j + i];
				else
					W[j] = sha256.safe_add(sha256.safe_add(sha256.safe_add(sha256.sha256_Gamma1256(W[j - 2]), W[j - 7]), sha256.sha256_Gamma0256(W[j - 15])), W[j - 16]);
				T1 = sha256.safe_add(sha256.safe_add(sha256.safe_add(sha256.safe_add(h, sha256.sha256_Sigma1256(e)), sha256.sha256_Ch(e, f, g)), sha256.sha256_K[j]), W[j]);
				T2 = sha256.safe_add(sha256.sha256_Sigma0256(a), sha256.sha256_Maj(a, b, c));
				h = g;
				g = f;
				f = e;
				e = sha256.safe_add(d, T1);
				d = c;
				c = b;
				b = a;
				a = sha256.safe_add(T1, T2);
			}
			HASH[0] = sha256.safe_add(a, HASH[0]);
			HASH[1] = sha256.safe_add(b, HASH[1]);
			HASH[2] = sha256.safe_add(c, HASH[2]);
			HASH[3] = sha256.safe_add(d, HASH[3]);
			HASH[4] = sha256.safe_add(e, HASH[4]);
			HASH[5] = sha256.safe_add(f, HASH[5]);
			HASH[6] = sha256.safe_add(g, HASH[6]);
			HASH[7] = sha256.safe_add(h, HASH[7]);
		}
		return HASH;
	}
	static sha256_S(X, n) { return (X >>> n) | (X << (32 - n)); }
	static sha256_R(X, n) { return (X >>> n); }
	static sha256_Gamma0256(x) { return (sha256.sha256_S(x, 7) ^ sha256.sha256_S(x, 18) ^ sha256.sha256_R(x, 3)); }
	static sha256_Gamma1256(x) { return (sha256.sha256_S(x, 17) ^ sha256.sha256_S(x, 19) ^ sha256.sha256_R(x, 10)); }
	static sha256_Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }
	static sha256_Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }
	static sha256_Sigma0256(x) { return (sha256.sha256_S(x, 2) ^ sha256.sha256_S(x, 13) ^ sha256.sha256_S(x, 22)); }
	static sha256_Sigma1256(x) { return (sha256.sha256_S(x, 6) ^ sha256.sha256_S(x, 11) ^ sha256.sha256_S(x, 25)); }
	static sha256_K = new Array(
		1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993,
		-1841331548, -1424204075, -670586216, 310598401, 607225278, 1426881987,
		1925078388, -2132889090, -1680079193, -1046744716, -459576895, -272742522,
		264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986,
		-1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585,
		113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
		1695183700, 1986661051, -2117940946, -1838011259, -1564481375, -1474664885,
		-1035236496, -949202525, -778901479, -694614492, -200395387, 275423344,
		430227734, 506948616, 659060556, 883997877, 958139571, 1322822218,
		1537002063, 1747873779, 1955562222, 2024104815, -2067236844, -1933114872,
		-1866530822, -1538233109, -1090935817, -965641998
	);
	static safe_add(x, y) {
		var lsw = (x & 0xFFFF) + (y & 0xFFFF);
		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xFFFF);
	}
	static binb2rstr(input) {
		var output = "";
		for (var i = 0; i < input.length * 32; i += 8)
			output += String.fromCharCode((input[i >> 5] >>> (24 - i % 32)) & 0xFF);
		return output;
	}
}

class FB {
	static FB_LOGIN_URL = 'https://www.facebook.com/dialog/oauth';
	static FB_LOGOUT_URL = 'https://www.facebook.com/logout.php';
	static tokenStore = window.sessionStorage;
	static fbAppId;
	static fbAccessToken = '';
	static baseURL = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
	static oauthRedirectURL = FB.baseURL + '/oauthcallback.html';
	static logoutRedirectURL = FB.baseURL + '/logoutcallback.html';
	static loginCallback;

	static init(params) {
		if (params.appId)
			FB.fbAppId = params.appId;
		else
			throw 'appId parameter not set in init()';
		if (params.accessToken)
			FB.fbAccessToken = params.accessToken;
		if (params.tokenStore)
			FB.tokenStore = params.tokenStore;
	}
	static isLoggedIn() {
		return FB.tokenStore['fbtoken'];
	}
	static login(callback, options) {
		if (FB.tokenStore['fbtoken']) {
			FB.api({
				path: '/debug_token',
				params: { input_token: FB.tokenStore['fbtoken'] },
				success: function (data) {
					if (data.data && data.data.is_valid)
						callback({ status: 'connected', token: FB.tokenStore['fbtoken'] });
					else {
						FB.tokenStore['fbtoken'] = '';
						FB.login(callback, options);
					}
				},
				error: function (data) {
					if (data.status == 0) {
						ui.navigation.openPopup(ui.l('attention'), ui.l('error.noNetworkConnection'));
						return;
					}
					FB.tokenStore['fbtoken'] = '';
					FB.login(callback, options);
				}
			});
			return;
		}
		var scope = '';
		if (!FB.fbAppId)
			return callback({ status: 'unknown', error: 'Facebook App Id not set.' });
		if (options && options.scope)
			scope = options.scope;
		FB.loginCallback = callback;
		var openInAppBrowser = function () {
			var loginWindow = ui.navigation.openHTML(FB.FB_LOGIN_URL + '?client_id=' + FB.fbAppId +
				'&redirect_uri=' + (global.isBrowser() ? FB.oauthRedirectURL : 'https://www.facebook.com/connect/login_success.html') +
				'&response_type=token&scope=' + scope);
			if (window.cordova)
				ui.on(loginWindow, 'loadstart', event => {
					if (event.url.indexOf("access_token=") > 0 || event.url.indexOf("error=") > 0) {
						setTimeout(loginWindow.close, 100);
						FB.oauthCallback(event.url);
					}
				}, true);
		};
		if (global.getOS() == 'android' && window.SafariViewController)
			window.SafariViewController.show(
				{
					url: FB.FB_LOGIN_URL + '?client_id=' + FB.fbAppId +
						'&redirect_uri=' + global.serverApi.substring(0, global.serverApi.lastIndexOf('/', global.serverApi.length - 2)) + '/oauthcallback.html' +
						'&response_type=token&scope=' + scope,
					hidden: false, // default false. You can use this to load cookies etc in the background (see issue #1 for details).
					animated: false, // default true, note that 'hide' will reuse this preference (the 'Done' button will always animate though)
					transition: null, // (this only works in iOS 9.1/9.2 and lower) unless animated is false you can choose from: curl, flip, fade, slide (default)
					enterReaderModeIfAvailable: false, // default false
					tintColor: "#00ffff", // default is ios blue
					barColor: "#0000ff", // on iOS 10+ you can change the background color as well
					controlTintColor: "#ffffff" // on iOS 10+ you can override the default tintColor
				},
				null,
				openInAppBrowser
			);
		else
			openInAppBrowser();
	}
	static oauthCallback(url) {
		var queryString, obj;
		if (url.indexOf("access_token=") > 0) {
			queryString = url.substr(url.indexOf('#') + 1);
			obj = FB.parseQueryString(queryString);
			FB.tokenStore['fbtoken'] = obj['access_token'];
			if (FB.loginCallback)
				FB.loginCallback({ status: 'connected', token: FB.tokenStore['fbtoken'] });
		} else if (url.indexOf("error=") > 0) {
			queryString = url.substring(url.indexOf('?') + 1, url.indexOf('#'));
			obj = FB.parseQueryString(queryString);
			if (FB.loginCallback)
				FB.loginCallback({ status: 'not_authorized', error: obj.error });
		} else if (FB.loginCallback)
			FB.loginCallback({ status: 'not_authorized' });
	}
	static logout(callback) {
		var logoutWindow,
			token = FB.tokenStore['fbtoken'];
		FB.tokenStore.removeItem('fbtoken');
		if (token) {
			logoutWindow = ui.navigation.openHTML(FB.FB_LOGOUT_URL + '?access_token=' + token + '&next=' + FB.logoutRedirectURL);
			if (window.cordova) {
				setTimeout(function () {
					logoutWindow.close();
				}, 700);
			}
		}
		if (callback)
			callback();
	}
	static api(obj) {
		var params = obj.params || {}, xhr = new XMLHttpRequest();
		if (!params['access_token'])
			params['access_token'] = FB.tokenStore['fbtoken'];
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status === 200)
					obj.success(JSON.parse(xhr.responseText));
				else {
					var error = xhr.responseText ? JSON.parse(xhr.responseText).error : { message: 'An error has occurred' };
					error.status = xhr.status;
					if (obj.error)
						obj.error(error);
				}
			}
		};
		xhr.open('GET', 'https://graph.facebook.com' + obj.path + '?' + FB.toQueryString(params), true);
		xhr.send();
	}
	static parseQueryString(queryString) {
		var qs = decodeURIComponent(queryString),
			obj = {},
			params = qs.split('&');
		params.forEach(function (param) {
			var splitter = param.split('=');
			obj[splitter[0]] = splitter[1];
		});
		return obj;
	}
	static toQueryString(obj) {
		var parts = [];
		for (var i in obj) {
			if (obj.hasOwnProperty(i))
				parts.push(i + "=" + encodeURIComponent(obj[i]));
		}
		return parts.join("&");
	}
}
class WebSocket {
	static stompClient;
	static init() {
		WebSocket.stompClient = Stomp.over(function () {
			return new SockJS(global.serverApi + 'ws/init')
		});
		WebSocket.stompClient.connect(communication.generateCredentials(), frame => {
			console.log('Connected: ' + frame);
			WebSocket.stompClient.subscribe(
				"/user/" + user.contact.id + "/video",
				message => {
					console.log('Got stomp message', message);
					var data = JSON.parse(message.body);
					if (data.offer)
						Video.onOffer(data);
					else if (data.answer)
						Video.onAnswer(data.answer);
					else if (data.candidate)
						Video.onCandidate(data.candidate);
				}
			);
		});
	}
}