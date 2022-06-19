import { communication, FB } from './communication';
import { details } from './details';
import { geoData } from './geoData';
import { global } from './global';
import { lists } from './lists';
import { pageHome } from './pageHome';
import { pageInfo } from './pageInfo';
import { pageLocation } from './pageLocation';
import { pageLogin } from './pageLogin';
import { pageSettings } from './pageSettings';
import { ui, formFunc } from './ui';
import { user } from './user';

export { initialisation, DragObject };

class initialisation {
	static execLocation = null;
	static hideStatusBar = true;
	static recoverInvoked = false;
	static videoText = '';
	static getStyle(oElm, strCssRule) {
		var s = '';
		if (document.defaultView && document.defaultView.getComputedStyle)
			s = document.defaultView.getComputedStyle(oElm, '').getPropertyValue(strCssRule);
		else if (oElm.currentStyle) {
			strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1) {
				return p1.toUpperCase();
			});
			s = oElm.currentStyle[strCssRule];
		}
		return s;
	}
	static init() {
		if (!global.isBrowser() && initialisation.videoText) {
			var e = ui.q('preloader');
			var s = e.innerHTML;
			initialisation.statusBar();
			e.innerHTML = '<div id="videoIntro" style="text-align:center;font-size:1.3em;padding:0 1em 2em 1em;line-height:2em;transition:opacity .5s ease-out;">' + initialisation.videoText + '</div>';
			setTimeout(function () {
				ui.css('#videoIntro', 'opacity', 0);
				setTimeout(function () {
					e.innerHTML = s;
					initialisation.init();
				}, 500);
			}, 5000);
			initialisation.videoText = null;
			return;
		}
		var f = function () {
			if (ui.cssValue('content > *', 'display')) {
				ui.css('preloader', 'opacity', 0);
				setTimeout(function () {
					var e = ui.q('preloader');
					if (e)
						e.outerHTML = '';
					e = ui.q('#preloader');
					if (e)
						e.outerHTML = '';
				}, 500);
			} else
				setTimeout(f, 500);
		};
		setTimeout(f, 2500);
		global.serverImg = global.server.substring(0, global.server.lastIndexOf('/', global.server.length - 2)) + '/med/';
		window.onerror = function (message, url, line, column, error) {
			if (url && (url.lastIndexOf('fmg.js') + 6 == url.length || url.lastIndexOf('lang') + 6 == url.lastIndexOf('.js')))
				communication.sendError('uncaughtExecption:\n' + message + '\n' + url + ': ' + line + '/' + column + '\n' + JSON.stringify(error));
			communication.currentCalls.splice(0, communication.currentCalls.length);
			ui.css('progressbar', 'display', 'none');
		};
		var t, el = document.createElement('fakeelement');
		var transitions = {
			animation: 'animationend',
			OAnimation: 'oAnimationEnd',
			MozAnimation: 'animationend',
			WebkitAnimation: 'webkitAnimationEnd'
		};
		for (t in transitions) {
			if (el.style[t] !== undefined) {
				ui.navigation.animationEvent = transitions[t];
				break;
			}
		}
		user.scale = global.getDevice() == 'phone' && ui.q('body').clientWidth < 360 ? 0.8 : 1;
		initialisation.reposition();
		initialisation.setLanguage((navigator.language || navigator.userLanguage).toLowerCase().indexOf('en') > -1 ? 'EN' : 'DE', initialisation.initPostProcessor);
	}
	static initApp() {
		window.Keyboard.automaticScrollToTopOnHiding = true;
		ui.on(window, 'keyboardDidHide', function () {
			window.scrollTo(0, 0);
		});
		cordova.plugins.backgroundMode.on('activate', function () {
			cordova.plugins.backgroundMode.disableWebViewOptimizations();
		});
		cordova.plugins.backgroundMode.setDefaults({ silent: true });
		initialisation.statusBar();
		universalLinks.subscribe(null, function (e) {
			if (e.path) {
				if (e.url.indexOf(global.server.substring(0, global.server.indexOf('/', 9))) == 0) {
					var s = e.url.substring(global.server.indexOf('/', 9));
					if (s.length < 2)
						return;
					global.url = s;
				} else
					global.url = e.url;
			}
		});
		universalLinks.subscribe('fb', function (e) {
			FB.oauthCallback(e.url)
		});
		window.open = cordova.InAppBrowser.open;
		ui.on('content > *, home', 'click', function (event) {
			if (event.screenY > 0 && event.screenY < parseInt(ui.cssValue('main', 'padding-top')) + 5 * ui.emInPX) {
				event.preventDefault();
				initialisation.hideStatusBar = !initialisation.hideStatusBar;
				initialisation.statusBar();
			}
		});
		if (global.getOS() == 'android') {
			ui.on(window, 'keyboardDidShow', function (e) {
				ui.css('main', 'height', window.innerHeight - e.keyboardHeight);
			});
			ui.on(window, 'keyboardDidHide', function () {
				ui.css('main', 'height', '');
			});
			ui.on(document, 'backbutton', ui.navigation.goBack);
		}
		ui.on(document, 'pause', function () {
			global.paused = true;
			geoData.pause();
			if (!user.contact)
				communication.setApplicationIconBadgeNumber(0);
			user.save({ active: false });
		});
		ui.on(document, 'resume', function () {
			global.paused = false;
			geoData.init();
			user.save({ active: true });
			if (global.getParam('r'))
				initialisation.showStartDialogs();
		});
	}
	static initPostProcessor() {
		ui.css('content > .content', 'display', 'none');
		ui.css('main>buttonIcon', 'display', 'none');
		ui.css('main', 'display', '');
		if (!global.isBrowser())
			initialisation.initApp();
		ui.html('head title', global.appTitle);
		pageHome.init();
		communication.login.autoLogin(initialisation.showStartDialogs);
		window.onresize = initialisation.reposition;
		ui.on(window, 'orientationchange', initialisation.reposition);
		ui.on(window, 'popstate', ui.navigation.goBack);
		ui.on('main', 'touchstart', function (e) {
			e = e.target;
			if (!document.activeElement || e == document.activeElement)
				return;
			if (!ui.classContains(e, 'sendButton') && !ui.classContains(e, 'quote') && !ui.parents(e, 'chatConversation'))
				document.activeElement.blur();
		});
		ui.on(window, 'wheel', function (event) {
			if (event.ctrlKey) {
				if (!event.defaultPrevented)
					event.preventDefault();
				formFunc.image.zoom(event, event.deltaY);
			}
		});
		ui.on(window, 'touchmove', function (event) {
			if (event.touches.length > 1)
				event.preventDefault();
		});
		ui.on('detail', 'click', function (event) {
			if (event.target.nodeName != 'INPUT')
				ui.navigation.goTo(ui.q('detail').getAttribute('type'));
		});
		ui.on('popup', 'click', function (event) {
			var s = event.target.nodeName;
			if (s != 'INPUT' && s != 'TEXTAREA')
				ui.navigation.hidePopup();
		});
		ui.swipe('detail', function (dir) {
			if (dir == 'left')
				details.swipeLeft();
			else if (dir == 'right')
				details.swipeRight();
		}, 'detailButtons');
		ui.swipe('settings2', function (dir) {
			if (dir == 'right')
				ui.navigation.goTo('settings', null, true);
			else if (dir == 'left')
				ui.navigation.goTo('settings3');
		});
		ui.swipe('settings3', function (dir) {
			if (dir == 'right')
				ui.navigation.goTo('settings2', null, true);
		});
		ui.swipe('settings', function (dir) {
			if (dir == 'left')
				pageSettings.open2();
		}, 'input,textarea,img,slider');
		ui.swipe('contacts', function (dir, event) {
			if (dir == 'left')
				ui.navigation.openSwipeLeftUI(event);
			else if (dir == 'right')
				lists.removeListEntryUI(event);
		}, 'input,listScroll');
		ui.swipe('locations', function (dir, event) {
			if (dir == 'left')
				ui.navigation.openSwipeLeftUI(event);
			else if (dir == 'right')
				lists.removeListEntryUI(event);
		}, 'input,listScroll,map');
		ui.swipe('info', function (dir) {
			if (dir == 'left')
				pageLogin.goToRegister();
			else if (dir == 'right')
				pageLogin.goToRegister();
		}, 'textarea');
		ui.swipe('alert', function (dir) {
			if (dir == 'up')
				communication.notification.clear();
		});
		setTimeout(function () {
			communication.ajax({
				url: global.server + 'action/marketing/' + global.language,
				responseType: 'json',
				error() { },
				success(e) {
					pageInfo.initMarketing(e);
					if (!e.text)
						return;
					var f = function () {
						if (ui.cssValue('popup', 'display') != 'none' || ui.q('alert').innerHTML)
							setTimeout(f, 3000);
						//else
						//communication.notification.open({ message: '<b>' + e.title + '</b><br/>' + e.text + (e.action ? ' ' + ui.l('locations.clickForMoreDetails') : ''), additionalData: { exec: e.action } });
					};
					f.call();
				}
			})
		}, 8000);
	}
	static onLoad() {
		if (global.isBrowser())
			initialisation.init();
		else
			ui.on(document, 'deviceready', initialisation.init, false);
	}
	static openZoom(event) {
		var name = event.target.parentNode.getAttribute('name');
		if (!name || name.indexOf('_disp') < 0)
			ui.navigation.openPopup(ui.l('settings.scale'),
				'<input name="zoom" type="radio" label="' + ui.l('settings.scale0') + '" onclick="initialisation.zoom()" value="0.8"' + (user.scale == 0.8 ? ' checked' : '') + '/>' +
				'<input name="zoom" type="radio" label="' + ui.l('settings.scale1') + '" onclick="initialisation.zoom()" value="1.0"' + (user.scale == 1.0 ? ' checked' : '') + '/>' +
				'<input name="zoom" type="radio" label="' + ui.l('settings.scale2') + '" onclick="initialisation.zoom()" value="1.2"' + (user.scale == 1.2 ? ' checked' : '') + '/>' +
				'<input name="zoom" type="radio" label="' + ui.l('settings.scale3') + '" onclick="initialisation.zoom()" value="1.4"' + (user.scale == 1.4 ? ' checked' : '') + '/>');
	}
	static reposition() {
		if (!ui.q('body div'))
			return;
		var w1 = window.innerWidth ? window.innerWidth : screen.width;
		var h1 = window.innerHeight ? window.innerHeight : screen.height;
		var wOrg = !window.orientation ? w1 : Math.abs(window.orientation) == 90 ? Math.max(h1, w1) : Math.min(h1, w1), w = wOrg;
		var f = 16;
		if (global.getDevice() == 'computer') {
			ui.css('.bgWeb', 'display', 'block');
			if (w < 600)
				f = w / 600 * f;
			else if (w < 1200)
				w = 600;
			else {
				f = f + (w - 1200) / 1800 * f;
				w = w * 0.5;
			}
			ui.css('main', 'margin-left', (-w / 2) + 'px');
			ui.css('main', 'width', w + 'px');
			ui.classRemove('main', 'app');
			ui.attr('#imgStoreApple', 'src', 'images/storeApple.png');
			ui.attr('#imgStoreGoogle', 'src', 'images/storeGoogle.png');
		} else {
			if (global.getDevice() == 'phone')
				f = 14;
			if (w > 600)
				f = f + w / 600;
			if (global.getDevice() == 'phone' && user.scale)
				f *= user.scale;
			ui.css('main', 'margin-left', 0);
			ui.css('main', 'width', '');
			ui.classAdd('main', 'app');
		}
		ui.css('body', 'font-size', f + 'px');
		ui.emInPX = parseFloat(initialisation.getStyle(document.body, 'font-size'));
		if (!ui.q('main'))
			return;
		lists.repositionThumb();
		if (wOrg / w > 1.6) {
			ui.css('add', 'width', ((wOrg - w) / 2) + 'px');
			ui.css('add', 'display', 'block');
		} else {
			ui.css('add', 'display', '');
			ui.html('descbox', '');
		}
	}
	static setLanguage(lang, exec) {
		if (global.language == lang)
			return;
		ui.classRemove('.langSelectImg', 'pressed');
		ui.classAdd('.langSelectImg[l="' + lang + '"]', 'pressed');
		communication.ajax({
			url: (window.location && window.location.href && window.location.href.indexOf(global.server) == 0 ? '/' : '') + 'js/lang/' + lang + '.json',
			responseType: 'json',
			error(r) {
				if (r.responseText && r.responseText.indexOf('categories') > -1 && r.responseText.indexOf('weekday') > -1)
					initialisation.setLanguageInternal(r.responseText, lang, exec);
			},
			success(r) {
				initialisation.setLanguageInternal(r, lang, exec);
			}
		});
	}
	static setLanguageInternal(s, lang, exec) {
		var oldLang = global.language;
		global.language = lang;
		var r = function (a) {
			for (var k in a) {
				if (typeof a[k] == 'string') {
					if (a[k].indexOf('${') > -1) {
						if (a[k].indexOf('${appTitle}') > -1)
							a[k] = a[k].replace(/\${appTitle}/g, global.appTitle);
						if (a[k].indexOf('${appVersion}') > -1)
							a[k] = a[k].replace(/\${appVersion}/g, global.appVersion);
						if (a[k].indexOf('${minLocations}') > -1)
							a[k] = a[k].replace(/\${minLocations}/g, global.minLocations);
						if (a[k].indexOf('${separator}') > -1)
							a[k] = a[k].replace(/\${separator}/g, global.separator);
					}
				} else
					r(a[k]);
			}
		}
		r(s.labels);
		ui.categories = s.categories;
		ui.attributes = s.attributes;
		ui.labels = s.labels;
		communication.ajax({
			url: (window.location && window.location.href && window.location.href.indexOf(global.server) == 0 ? '/' : '') + 'js/lang/' + lang + '.html',
			success(r) {
				r = r.split('\n\n');
				ui.labels['infoDSGVO'] = r[0];
				ui.labels['infoLegal'] = r[1];
			}
		});
		var e = ui.qa('#addLeft > buttontext');
		e[0].innerHTML = ui.l('home.DescLink');
		e[1].innerHTML = global.appTitle + ' blog';
		lists.resetLists();
		pageHome.init();
		if (exec)
			exec.call();
		if (user.contact && oldLang != global.language)
			user.save({ language: lang });
		ui.navigation.hidePopup();
	}
	static showLocation() {
		if (window.location && window.location.pathname && window.location.pathname.indexOf('loc_') > -1) {
			var id = window.location.pathname;
			id = id.substring(id.indexOf('_') + 1);
			if (id.indexOf('_') > 0)
				id = id.substring(0, id.indexOf('_'));
			id = !id || isNaN(id) ? '1' : id;
			if (/bot|crawler|spider|robot|crawling/i.test(navigator.userAgent))
				communication.ajax({
					url: global.server + 'db/one?query=location_anonymousList&search=' + encodeURIComponent('location.id=' + id),
					success(r) {
						ui.css('home', 'display', 'none');
						var s = v =>
							global.template`
URL: <a href="${v['location.url']}">${v['location.url']}</a><br>
Town: ${v['location.town']}<br>
Address: ${v['location.address']}<br>
Phone: ${v['location.telephone']}<br>
Longitude: ${v['location.longitude']}<br>
Latitude: ${v['location.latitude']}<br>
Description: ${v['location.description']}<br>
Parking: ${v['location.url']}${v['location.parkingText']}<br>
${v['location.parkingOption']}<br>
Quarter: ${v['location.quater']}<br>
Rating: ${v['location.rating']}<br>
Open: ${v['location.openTimesText']}<br>
Category: ${v['location.category']}<br>
Name: ${v['location.name']}<br>
Bank Holidays Closed: ${v['location.openTimesHankholiday']}<br>
Budget: ${v['location.budget']}<br>
Image: <img src="/med/${v['location.image']}"/><br>
Attributes: ${v['location.attr0']}<br>
${v['location.attr1']}<br>
${v['location.attr2']}<br>
${v['location.attr3']}<br>
${v['location.attr4']}<br>
${v['location.attr5']}<br>
${v['location.attr0Ex']}<br>
${v['location.attr1Ex']}<br>
${v['location.attr2Ex']}<br>
${v['location.attr3Ex']}<br>
${v['location.attr4Ex']}<br>
${v['location.attr5Ex']}<br>`;
						var e = ui.q('detail');
						e.innerHTML = s(r);
						ui.css(e, 'display', 'block');
					}
				});
			else
				details.open(id, 'location_anonymousList&search=' + encodeURIComponent('location.id=' + id), pageLocation.detailLocationEvent);
			var e = ui.q('home');
			ui.css(e, 'display', 'none');
			ui.classRemove(e, 'homeSlideIn animated');
			return true;
		}
		return false;
	}
	static showStartDialogs() {
		if (global.getParam('r')) {
			if (initialisation.recoverInvoked == true)
				return;
			initialisation.recoverInvoked = true;
			communication.login.removeCredentials();
			communication.login.recoverPasswordVerifyEmail(global.getParam('r'));
			if (global.isBrowser())
				history.pushState(null, null, window.location.origin);
		} else if (!initialisation.showLocation()) {
			var p = global.getParam();
			if (p) {
				setTimeout(function () {
					ui.navigation.autoOpen(p);
					if (global.isBrowser())
						history.pushState(null, null, window.location.origin);
				}, 1000);
			}
		}
	}
	static statusBar() {
		if (!global.isBrowser()) {
			try {
				if (initialisation.hideStatusBar) {
					StatusBar.show();
					StatusBar.hide();
				} else {
					StatusBar.hide();
					StatusBar.show();
				}
			} catch (e) {
			}
		}
	}
	static zoom() {
		user.scale = parseFloat(ui.val('[name="zoom"]:checked'));
		initialisation.reposition();
	}
}

class DragObject {
	constructor(o) {
		o.drag = this;
		this.obj = o;
		this.startPos = null;
		this.obj.style.cursor = 'move';
		var md = function (e) {
			document.drag = o.drag;
			o.drag.start(e);
			var mu = function (e) {
				document.onmouseup = document.onmousemove = document.ontouchmove = document.ontouchend = null;
				document.drag.end(e);
				return false;
			};
			var mm = function (e) {
				if ((!e.changedTouches || e.changedTouches.length < 2)
					&& (!e.targetTouches || e.targetTouches.length < 2)
					&& (!e.touches || e.touches.length < 2))
					document.drag.move(e);
				return false;
			};
			document.onmousemove = mm;
			document.ontouchmove = mm;
			document.onmouseup = mu;
			document.ontouchend = mu;
			if (e && e.stopPropagation)
				e.stopPropagation();
			return false;
		};
		this.obj.onmousedown = md;
		this.obj.ontouchstart = md;
	}
	ondrop() {
		return true;
	}
	getPos() {
		return { x: this.obj.offsetLeft, y: this.obj.offsetTop };
	}
	getStartPos() {
		return this.startPos;
	}
	start(e) {
		this.startPos = { x: -ui.getEvtPos(e, true), y: -ui.getEvtPos(e) };
	}
	move(e) {
		this.ondrag(e, { x: ui.getEvtPos(e, true) + this.startPos.x, y: ui.getEvtPos(e) + this.startPos.y });
		this.start(e);
	}
	end(e) {
		this.ondrop(e);
		document.drag = null;
	}
}
