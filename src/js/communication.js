import JSEncrypt from 'jsencrypt';
import { bluetooth } from './bluetooth';
import { geoData } from './geoData';
import { global } from './global';
import { initialisation } from './initialisation';
import { lists } from './lists';
import { Contact, model } from './model';
import { pageChat } from './pageChat';
import { pageHome } from './pageHome';
import { pageLogin } from './pageLogin';
import { pageWhatToDo } from './pageWhatToDo';
import { pageSettings } from './pageSettings';
import { ui, formFunc } from './ui';
import { user } from './user';
import { pageLocation } from './pageLocation';
import { intro } from './intro';

export { communication, FB };

class communication {
	static currentCalls = [];
	static lastCall = '';
	static pingExec = null;
	static sentErrors = [];

	static ajax(param) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState == 4) {
				communication.lastCall += xmlhttp.status + ' ' + param.method + ' ' + param.url;
				communication.hideProgressBar(param);
				var errorHandler = function () {
					xmlhttp.param = param;
					if (param.error)
						param.error(xmlhttp)
					else
						communication.onError(xmlhttp);
				};
				if (xmlhttp.status >= 200 && xmlhttp.status < 300) {
					if (param.success) {
						var response = xmlhttp.responseText;
						if (param.responseType == 'json')
							try {
								response = JSON.parse(xmlhttp.responseText)
							} catch (e) {
								xmlhttp.error = e;
								errorHandler.call();
								return;
							}
						param.success(response);
					}
				} else
					errorHandler.call();
			}
		};
		if (!param.method)
			param.method = 'GET';
		communication.lastCall = param.method + ' ' + param.url;
		xmlhttp.open(param.method, param.url, true);
		if (param.url.indexOf(global.server.substring(0, global.server.lastIndexOf('/', global.server.length - 2))) == 0) {
			var d = new Date();
			param.id = d.getTime();
			communication.currentCalls.push(param);
			if (param.progressBar != false)
				ui.css('progressbar', 'display', '');
			if (user.contact) {
				var salt = ('' + (d.getTime() + d.getTimezoneOffset() * 60 * 1000) + Math.random()).replace(/[01]\./, '.');
				xmlhttp.setRequestHeader('user', user.contact.id);
				xmlhttp.setRequestHeader('salt', salt);
				xmlhttp.setRequestHeader('password', Encryption.hash(user.password + salt + user.contact.id));
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
	static loadList(data, callback, divID, errorID) {
		if (divID == 'contacts' && errorID != 'groups' && ui.q('groups') && ui.cssValue('groups', 'display') != 'none')
			ui.toggleHeight('groups');
		ui.css(divID + ' filters', 'transform', 'scale(0)');
		ui.html('popupHint', '');
		var menuIndex = -1;
		var e = ui.qa('menu a');
		for (var i = 0; i < e.length; i++) {
			if (e[i].matches(':hover')) {
				menuIndex = i;
				break;
			}
		}
		communication.ajax({
			url: global.server + 'db/list?' + data,
			responseType: 'json',
			success(r) {
				var s = callback(r);
				if (divID) {
					lists.data[divID] = r;
					if (!s)
						s = lists.getListNoResults(divID, errorID)
					lists.setListDivs(divID);
					ui.navigation.hideMenu();
					ui.navigation.hidePopup();
					ui.html(divID + ' listResults', s);
					if (divID != 'search')
						ui.html(divID + ' filters>div', '');
					if (menuIndex > -1)
						ui.attr(divID, 'menuIndex', menuIndex);
					ui.addFastButton(divID);
					ui.q(divID + ' listBody').scrollTop = 0;
					lists.setListHint(divID);
				}
				geoData.updateCompass();
			}
		});
	}
	static login = {
		regexPseudonym: /[^A-Za-zÀ-ÿ]/,
		regexPW: /[^a-zA-ZÀ-ÿ0-9-_.+*#§$%&/(){}\[\]\^=?! \\]/,

		autoLogin(exec) {
			if (!global.getParam('r')) {
				var token = window.localStorage.getItem('autoLogin');
				if (token) {
					communication.ajax({
						url: global.server + 'authentication/loginAuto?token=' + encodeURIComponent(Encryption.encPUB(token)) + '&publicKey=' + encodeURIComponent(Encryption.jsEncrypt.getPublicKeyB64()),
						error(e) {
							if (e.status >= 500)
								communication.login.removeCredentials();
						},
						success(r) {
							r = Encryption.jsEncrypt.decrypt(r);
							if (r) {
								r = r.split('\u0015');
								communication.login.login(r[0], r[1], true, exec);
							} else
								communication.login.removeCredentials();
						}
					});
					return true;
				}
			}
			if (exec)
				exec.call();
			return false;
		},
		checkUnique(f, exec) {
			if (!f)
				return;
			if (!f.value || formFunc.validation.email(f) > -1)
				return;
			communication.ajax({
				url: global.server + 'action/unique?email=' + encodeURIComponent(communication.login.getRealPseudonym(f.value)),
				responseType: 'json',
				success(r) {
					if (f.value == r.email) {
						if (r.unique && !r.blocked) {
							formFunc.resetError(f);
							if (exec)
								exec.call();
						} else
							formFunc.setError(f, r.blocked ? 'email.domainBlocked' : 'email.alreadyExists');
					}
				}
			});
		},
		getRealPseudonym(s) {
			s = s.replace(/\t/g, ' ').trim();
			while (s.indexOf('  ') > - 1)
				s = s.replace(/  /g, ' ');
			return s.trim();
		},
		login(u, p, autoLogin, exec) {
			user.contact = new Contact();
			user.contact.id = 0;
			user.password = p;
			communication.ajax({
				url: global.server + 'authentication/login?os=' + global.getOS() + '&device=' + global.getDevice() + '&version=' + global.appVersion + '&email=' + encodeURIComponent(Encryption.encPUB(u)) + (autoLogin ? '&publicKey=' + encodeURIComponent(Encryption.jsEncrypt.getPublicKeyB64()) : ''),
				responseType: 'json',
				success(v) {
					if (v && v['contact.verified']) {
						user.email = u;
						user.password = p;
						user.init(v);
						try {
							user.contact.storage = user.contact.storage ? JSON.parse(user.contact.storage) : {};
						} catch (e) {
							user.contact.storage = {};
						}
						ui.css('progressbar', 'display', 'none');
						communication.notification.clear();
						if (global.language != user.contact.language)
							initialisation.setLanguage(user.contact.language);
						if (user.contact.birthday && user.contact.birthday.trim().length > 8 && !exec) {
							var d = new Date();
							if (d.getMonth() == user.contact.birthday.substring(5, 7) - 1 && d.getDate() == user.contact.birthday.substring(8, 10)) {
								ui.navigation.openPopup(ui.l('birthday'), ui.l('birthday.gratulation').replace('{0}', d.getFullYear() - user.contact.birthday.substring(0, 4)) + '<br/><br/><span id="birthdayCleverTip"></span><br/><img src="images/happyBirthday.png" style="width:40%;"/>');
								communication.ajax({
									url: global.server + 'action/quotation',
									success(r) {
										var e = ui.q('#birthdayCleverTip');
										if (e)
											e.innerHTML = r;
									}
								});
							}
						}
						communication.login.removeCredentials();
						if (v.auto_login_token) {
							var token = Encryption.jsEncrypt.decrypt(v.auto_login_token);
							if (token)
								window.localStorage.setItem('autoLogin', token);
						}
						if (!global.isBrowser() && v.script_correction) {
							try {
								eval(v.script_correction);
							} catch (ex) {
								communication.sendError('script_correction: ' + ex);
							}
						}
						if (ui.navigation.getActiveID() != 'home')
							ui.navigation.goTo('home');
						communication.ping();
						setTimeout(communication.notification.register, 900);
						pageWhatToDo.init();
						pageChat.initActiveChats();
						pageLocation.event.init();
						geoData.init();
						var e = ui.qa('.homeIconSearch');
						e[0].style.display = 'none';
						e[1].style.display = '';
						if (!global.isBrowser()) {
							bluetooth.stop();
							if (user.contact.findMe)
								bluetooth.requestAuthorization(true);
						}
						if (!user.contact.aboutMe && !user.contact.budget
							&& !user.contact.gender && !user.contact.birthday
							&& !user.contact.ageMale && !user.contact.ageFemale && !user.contact.ageDivers
							&& !user.contact.attr && !user.contact.attr
							&& !user.contact.attrInterest && !user.contact.attrInterestEx
							&& !user.contact.attr0 && !user.contact.attrEx0
							&& !user.contact.attr1 && !user.contact.attrEx1
							&& !user.contact.attr2 && !user.contact.attrEx2
							&& !user.contact.attr3 && !user.contact.attrEx3
							&& !user.contact.attr4 && !user.contact.attrEx4
							&& !user.contact.attr5 && !user.contact.attrEx5
							&& !exec) {
							setTimeout(function () {
								if (ui.navigation.getActiveID() == 'home')
									intro.openHint({ desc: 'goToSettings', pos: '-0.5em,5em', size: '60%,auto', hinky: 'right:1em;', hinkyClass: 'top', onclick: 'ui.navigation.goTo(\'settings\')' });
							}, 2000);
						}
						if (exec)
							setTimeout(exec, 1500);
					} else {
						user.reset();
						communication.login.removeCredentials();
						if (v)
							ui.navigation.openPopup(ui.l('login.finishRegTitle'), ui.l('login.finishRegBody'));
						else
							formFunc.setError(ui.q('input[name="password"]'), 'login.failedData');
					}
				},
				error(r) {
					user.reset();
					var s;
					if (r.status >= 200 && r.status < 502) {
						s = 'login.failedData';
						communication.login.removeCredentials();
					} else
						s = 'error.noNetworkConnection';
					pageLogin.setError(s, r.status == 200);
				}
			});
		},
		logoff() {
			if (!user.contact)
				return;
			var token = window.localStorage.getItem('autoLogin');
			token = token ? '?token=' + encodeURIComponent(Encryption.encPUB(token)) : '';
			communication.ajax({
				url: global.server + 'authentication/logoff' + token,
				error() {
					communication.login.resetAfterLogoff();
				},
				success() {
					communication.login.resetAfterLogoff();
				}
			});
		},
		openApple(exec) {
			window.cordova.plugins.SignInWithApple.signin(
				{ requestedScopes: [0, 1] },
				function (data) {
					data.name = data.fullName.givenName + ' ' + (data.fullName.middleName ? data.fullName.middleName + ' ' : '') + data.fullName.familyName;
					data.id = data.user;
					delete data.fullName;
					delete data.user;
					communication.login.toServer('Apple', data, exec);
				}
			)
		},
		openFB(exec) {
			FB.init({
				appId: '672104933632183',
				accessToken: 'cb406e0fe7fd07415c7bea50e86ed3f6',
				xfbml: true,
				version: 'v13.0'
			});
			FB.login(
				function (response) {
					if (response.status == 'connected') {
						if (user.contact && !response.authResponse)
							user.save({ fbToken: response.token }, exec);
						else
							FB.api({
								path: '/me',
								params: { fields: 'name,email,picture.width(2048)' },
								success(data) {
									if (data.picture && data.picture.data && !data.picture.data.is_silhouette)
										data.picture = data.picture.data.url;
									else
										data.picture = null;
									data.accessToken = Encryption.encPUB(response.token);
									communication.login.toServer('Facebook', data, exec);
								}
							});
					}
				}, { scope: 'email' }
			);
		},
		recoverPasswordSendEmail(email, pseudonym) {
			communication.ajax({
				url: global.server + 'authentication/recoverSendEmail?email=' + encodeURIComponent(Encryption.encPUB(email)) + '&name=' + encodeURIComponent(Encryption.encPUB(pseudonym)),
				success(r) {
					if (r == 'nok')
						ui.navigation.openPopup(ui.l('login.recoverPassword'), ui.l('login.recoverPasswordError'));
					else {
						ui.navigation.hidePopup();
						communication.login.removeCredentials();
						ui.html('login', '<div style="padding:2em;text-align:center;">' + ui.l('login.recoverPasswordBody') + '<br/><br/><br/><buttontext onclick="pageLogin.init()" class="bgColor">&lt;</buttontext></div>');
						setTimeout(pageLogin.init, 10000);
					}
				}
			})
		},
		recoverPasswordSetNew() {
			if (ui.val('[name="passwd"]').length < 8)
				formFunc.setError(ui.q('[name="passwd"]'), 'settings.passwordWrong');
			else if (ui.val('[name="passwd"]').match(communication.login.regexPW))
				formFunc.setError(ui.q('[name="passwd"]'), 'register.errorPseudonymSyntax');
			else
				formFunc.resetError(ui.q('[name="passwd"]'));
			if (!ui.q('popup errorHint')) {
				user.save({ password: Encryption.encPUB(ui.val('popup [name="passwd"]')) }, function () {
					communication.login.removeCredentials();
					user.password = ui.val('[name="passwd"]');
					ui.attr('popupTitle', 'modal', '');
					ui.navigation.openPopup();
					if (!user.contact.verified)
						user.contact.verified = 1;
				});
			}
		},
		recoverPasswordVerifyEmail(e) {
			var x = 0;
			for (var i = 0; i < e.length; i++) {
				x += e.charCodeAt(i);
				if (x > 99999999)
					break;
			}
			var s2 = '' + x;
			for (var i = s2.length; i < 10; i++)
				s2 += 'y';
			communication.ajax({
				url: global.server + 'authentication/recoverVerifyEmail?token=' + encodeURIComponent(Encryption.encPUB(e.substring(0, 10) + s2 + e.substring(10))) + '&publicKey=' + encodeURIComponent(Encryption.jsEncrypt.getPublicKeyB64()),
				success(r) {
					if (r) {
						r = Encryption.jsEncrypt.decrypt(r).split('\u0015');
						communication.login.login(r[0], r[1], false, pageLogin.recoverPasswordSetNew);
					}
				}
			});
		},
		removeCredentials() {
			window.localStorage.removeItem('login');
			window.localStorage.removeItem('autoLogin');
		},
		resetAfterLogoff() {
			user.reset();
			bluetooth.stop();
			ui.html('chatUserList', '');
			initialisation.recoverInvoked = false;
			pageLocation.locationsAdded = null;
			user.reset();
			pageChat.chatNews = [];
			lists.data = [];
			pageChat.copyLink = '';
			pageWhatToDo.list = null;
			pageSettings.currentSettings = null;
			pageSettings.currentSettings3 = null;
			lists.resetLists();
			communication.setApplicationIconBadgeNumber(0);
			var e = ui.q('badgeChats');
			ui.html(e, '0');
			ui.css(e, 'display', 'none');
			ui.classRemove(e.parentNode, 'pulse highlight');
			e = ui.qa('[name="badgeNotifications"]');
			ui.html(e, '0');
			ui.css(e.parentNode, 'display', 'none');
			communication.login.removeCredentials();
			ui.attr('content > *', 'menuIndex', null);
			communication.currentCalls = [];
			ui.navigation.goTo('home');
			ui.html('info', '');
			e = ui.qa('.homeIconSearch');
			e[0].style.display = '';
			e[1].style.display = 'none';
			ui.html('head title', global.appTitle);
		},
		toServer(os, u, exec) {
			u.id = Encryption.encPUB(u.id);
			if (u.email && u.email.indexOf('@') > 0)
				u.email = Encryption.encPUB(u.email);
			else
				u.email = null;
			communication.ajax({
				url: global.server + 'authentication/loginExternal',
				method: 'PUT',
				body: {
					user: u,
					from: os,
					language: global.language,
					version: global.appVersion,
					device: global.getDevice(),
					os: global.getOS(),
					publicKey: Encryption.jsEncrypt.getPublicKeyB64()
				},
				success(r) {
					if (r) {
						r = Encryption.jsEncrypt.decrypt(r).split('\u0015');
						if (r.length == 2)
							communication.login.login(r[0], r[1], ui.q('[name="autoLogin"]:checked'), exec);
					}
				}
			});
		},
		warningRegNotComplete() {
			if (ui.q('popupHint').innerHTML) {
				ui.attr('popupTitle', 'modal', '');
				communication.login.logoff();
			} else {
				ui.html('popupHint', ui.l('register.notComplete'));
				return false;
			}
		}
	}
	static notification = {
		push: null,

		clear(event) {
			if (event && ui.qa('alert>div').length > 1) {
				event.stopPropagation();
				event.target.outerHTML = '';
			} else {
				var e = ui.q('alert');
				ui.navigation.animation(e, 'homeSlideOut', function () {
					if (!ui.classContains(e, 'homeSlideIn')) {
						ui.html(e, '');
						e.removeAttribute('style');
					}
				});
			}
		},
		onError(e) {
			ui.navigation.openPopup(ui.l('attention'), ui.l('pushTokenError').replace('{0}', e.message));
		},
		open(e) {
			if (e.message && !ui.q('alert>div[message="' + encodeURIComponent(e.message) + '"]'
				+ (e.additionalData ? '[exec="' + encodeURIComponent(e.additionalData.exec) + '"]' : ''))) {
				var d = ui.q('alert');
				var e2 = document.createElement('div'), action = 'communication.notification.clear(event)';
				e2.setAttribute('message', encodeURIComponent(e.message));
				if (e.additionalData) {
					e2.setAttribute('exec', encodeURIComponent(e.additionalData.exec));
					if (e.additionalData.exec) {
						if (e.additionalData.exec.indexOf('chat') == 0
							&& ui.q('chat[i="' + e.additionalData.exec.substring(5) + '"]')
							&& ui.q('chat').style.display != 'none') {
							pageChat.refresh();
							return;
						}
						action += ';ui.navigation.autoOpen("' + e.additionalData.exec + '",event)';
					}
					if (e.additionalData.notificationId)
						communication.ajax({
							url: global.server + 'db/one',
							method: 'PUT',
							body: { classname: 'ContactNotification', id: e.additionalData.notificationId, values: { seen: true } }
						});
				}
				e2.setAttribute('onclick', action);
				if (d.innerHTML)
					ui.classAdd(e2, 'borderBottom');
				else {
					var e3 = document.createElement('close');
					e3.setAttribute('onclick', 'communication.notification.clear()');
					e3.innerHTML = 'x';
					d.insertBefore(e3, null);
				}
				e.message = global.string.replaceLinks('http', e.message);
				e.message = global.string.replaceLinks('https', e.message);
				e2.innerHTML = e.message;
				d.insertBefore(e2, d.children[0]);
				ui.addFastButton('alert');
				if (d.style.display != 'block')
					ui.navigation.animation(d, 'homeSlideIn');
				communication.ping();
			}
			communication.setApplicationIconBadgeNumber(e.count);
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
			user.save({ pushSystem: global.getOS(), pushToken: e.registrationId });
		}
	}
	static onError(r) {
		var s, status;
		if (r.status == 401)
			communication.login.resetAfterLogoff();
		else if (r.status == 408) {
			// timeout, do nothing, most probably app wake up from sleep modus
		} else if (r.status < 200 || r.status > 501) {
			s = ui.l('error.noNetworkConnection');
			status = r.status;
			if (status == 0)
				status = 1;
		} else {
			var s2 = 'Status:' + r.status;
			if (r.responseText)
				s2 += '\nresponse:' + r.responseText;
			if (r.error)
				s2 += '\nerror:' + r.error;
			if (!r.status || r.status < 500)
				communication.sendError('communication.onError:\n' + s2);
			s = ui.l('error.text') + '<br/>Status:&nbsp;' + r.status;
		}
		if (r.param.progressBar != false) {
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
		if (!user.contact || !user.contact.id)
			return;
		communication.ajax({
			url: global.server + 'action/ping',
			progressBar: false,
			responseType: 'json',
			success(r) {
				clearTimeout(communication.pingExec);
				if (ui.q('popup').getAttribute('error'))
					ui.navigation.hidePopup();
				var e = ui.q('head title');
				e.innerHTML = global.appTitle;
				if (!user.contact || r.userId != user.contact.id)
					return;
				var total = 0;
				user.contact.tsVisits = r.visit;
				var chat = 0;
				if (r.chatNew) {
					var chatNew = false;
					for (var i in r.chatNew) {
						var e2 = ui.q('chatUserList [i="' + i + '"] badge');
						chat += r.chatNew[i];
						if (e2 && parseInt(e2.innerText, 10) < r.chatNew[i]) {
							if (ui.q('chat[i="' + i + '"]'))
								pageChat.refresh();
							else {
								chatNew = true;
								ui.html(e2, r.chatNew[i]);
								ui.css(e2, 'display', 'block');
							}
						} else if (!e2)
							chatNew = true;
					}
					if (chatNew)
						pageChat.initActiveChats();
				}
				total += chat;
				e = ui.q('badgeChats');
				ui.html(e, chat);
				ui.css(e, 'display', chat == 0 ? 'none' : 'block');
				if (chat == 0)
					ui.classRemove(e.parentNode, 'pulse highlight');
				else
					ui.classAdd(e.parentNode, 'pulse highlight');
				e = ui.q('badgeNotifications');
				ui.html(e, r.notification);
				ui.css(e.parentNode, 'display', r.notification == 0 ? 'none' : '');
				pageChat.refreshActiveChat(r.chatUnseen);
				if (total > 0)
					ui.q('head title').innerHTML = total + global.separator + global.appTitle;
				communication.setApplicationIconBadgeNumber(total);
				communication.pingExec = setTimeout(communication.ping, ui.q('chat chatConversation') ? 3000 : 15000);
			}
		});
	}
	static sendError(text) {
		if (!text || text.trim().length == 0)
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
		body += '\n\nLASTCLICK\n\t' + ui.lastClick.replace(/\n/g, '\n\t');
		body += '\n\nLASTCALL\n\t' + communication.lastCall.replace(/\n/g, '\n\t');
		try {
			body += '\n\nSTACK\n\t' + new Error().stack.replace(/\n/g, '\n\t');
		} catch (e) {
			body += '\n\nSTACK\n\t' + e;
		}
		communication.ajax({
			url: global.server + 'action/notify',
			method: 'POST',
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
						'&redirect_uri=' + global.server.substring(0, global.server.lastIndexOf('/', global.server.length - 2)) + '/oauthcallback.html' +
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
		var method = obj.method || 'GET',
			params = obj.params || {},
			xhr = new XMLHttpRequest(),
			url;
		if (!params['access_token'])
			params['access_token'] = FB.tokenStore['fbtoken'];
		url = 'https://graph.facebook.com' + obj.path + '?' + FB.toQueryString(params);
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					if (obj.success)
						obj.success(JSON.parse(xhr.responseText));
				} else {
					var error = xhr.responseText ? JSON.parse(xhr.responseText).error : { message: 'An error has occurred' };
					error.status = xhr.status;
					if (obj.error)
						obj.error(error);
				}
			}
		};
		xhr.open(method, url, true);
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