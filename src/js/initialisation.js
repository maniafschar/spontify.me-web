import { communication, FB } from './communication';
import { details } from './details';
import { geoData } from './geoData';
import { global } from './global';
import { lists } from './lists';
import { pageChat } from './pageChat';
import { pageEvent } from './pageEvent';
import { pageHome } from './pageHome';
import { pageLogin } from './pageLogin';
import { pageSearch } from './pageSearch';
import { pageSettings } from './pageSettings';
import { ui, formFunc } from './ui';
import { user } from './user';

export { initialisation, DragObject };

class initialisation {
	static execLocation = null;
	static hideStatusBar = true;
	static recoverInvoked = false;
	static init() {
		formFunc.image.replaceSVGs();
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
				setTimeout(f, 200);
		};
		setTimeout(f, 2000);
		global.serverImg = global.server.substring(0, global.server.lastIndexOf('/', global.server.length - 2)) + '/med/';
		window.onerror = function (message, url, line, column, error) {
			if (url && (url.lastIndexOf('fmg.js') + 6 == url.length || url.lastIndexOf('lang') + 6 == url.lastIndexOf('.js'))) {
				var last = Object.values(communication.currentCalls)[0];
				communication.sendError('uncaughtExecption:\nmessage: ' + message +
					'\ncall: ' + (last ? JSON.stringify(last) : '-') +
					'\npage: ' + ui.navigation.getActiveID() +
					'\ncolumn: ' + url + ': ' + line + '/' + column +
					'\nerror: ' + JSON.stringify(error));
			}
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
		if (cordova.plugins && cordova.plugins.backgroundMode) {
			cordova.plugins.backgroundMode.on('activate', function () {
				cordova.plugins.backgroundMode.disableWebViewOptimizations();
			});
			cordova.plugins.backgroundMode.setDefaults({ silent: true });
		}
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
		ui.on('content > *', 'click', function (event) {
			if ((ui.classContains(event.target, 'content') || !event.target.onclick && !event.target.parentElement.onclick && event.target.nodeName != 'INPUT') && event.screenY > 0 && event.screenY < parseInt(ui.cssValue('main', 'padding-top')) + 5 * ui.emInPX) {
				try {
					event.preventDefault();
				} catch (e) { }
				initialisation.hideStatusBar = !initialisation.hideStatusBar;
				initialisation.statusBar();
			}
		});
		ui.on(window, 'keyboardDidShow', function (e) {
			if (global.getOS() == 'android')
				ui.css('main', 'height', (window.innerHeight - e.keyboardHeight) + 'px');
			setTimeout(function () {
				var e2 = document.activeElement;
				if (e2)
					e2.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
			}, 100);
		});
		if (global.getOS() == 'android') {
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
				initialisation.recoverPassword();
		});
	}
	static initPostProcessor() {
		ui.css('content>:not(home).content', 'display', 'none');
		ui.css('main', 'display', '');
		if (!global.isBrowser())
			initialisation.initApp();
		ui.html('head title', global.appTitle);
		if (global.getParam('r')) {
			pageLogin.removeCredentials();
			initialisation.recoverPassword();
		} else
			pageLogin.autoLogin(initialisation.showStartDialogs);
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
			if (event.ctrlKey)
				formFunc.image.zoom(event, event.deltaY);
		});
		ui.on(window, 'touchmove', function (event) {
			if (event.touches.length > 1)
				try {
					event.preventDefault();
				} catch (e) { }
		});
		ui.on('detail', 'click', function (event) {
			var e = event.target;
			if (e.nodeName != 'INPUT' && e.nodeName != 'TEXTAREA') {
				while (e && e.getAttribute) {
					if (e.getAttribute('onclick'))
						return;
					e = e.parentNode;
				}
				ui.navigation.goTo(ui.qa('detail card').length > 1 ? 'detail' : ui.q('detail').getAttribute('from'));
			}
		});
		ui.on('popup', 'click', function (event) {
			var e = event.target;
			if (ui.parents(e, 'popupTitle') || !ui.q('popup input') && !ui.q('popup textarea') && !ui.q('popup mapPicker')) {
				while (e && e.getAttribute) {
					if (e.getAttribute('onclick') || ui.classContains(e, 'selectable'))
						return;
					e = e.parentNode;
				}
				e = ui.q('popup');
				if (e.getAttribute('close'))
					eval(e.getAttribute('close'));
				ui.navigation.closePopup();
			}
		});
		ui.on('chat', 'click', pageChat.close);
		ui.swipe('chat', function (dir, event) {
			if (dir == 'up' || dir == 'left' || dir == 'right') {
				if (ui.parents(event.target, 'chatConversation')) {
					if (pageChat.lastScroll + 500 > new Date().getTime())
						return;
					var e = ui.q('chatConversation');
					if (e.lastChild && e.lastChild.offsetHeight + e.lastChild.offsetTop > e.scrollTop + e.offsetHeight)
						return;
				}
				pageChat.close();
			}
		}, 'textarea');
		ui.swipe('detail', function (dir) {
			if (dir == 'left')
				details.swipeLeft();
			else if (dir == 'right')
				details.swipeRight();
		}, 'detailButtons');
		ui.swipe('settings', function (dir) {
			if (dir == 'right')
				pageSettings.swipeRight();
			else if (dir == 'left')
				pageSettings.swipeLeft();
		}, 'input,textarea,img,slider,thumb,val');
		ui.swipe('search', function (dir) {
			if (dir == 'left')
				pageSearch.swipeLeft();
			else if (dir == 'right')
				pageSearch.swipeRight();
		}, 'input,textarea,slider,thumb,val');
		ui.swipe('login', function (dir) {
			if (dir == 'left')
				pageLogin.swipeLeft();
			else if (dir == 'right')
				pageLogin.swipeRight();
		}, 'input');
		ui.swipe('home', function (dir) {
			if (dir == 'left')
				ui.navigation.goTo(user.contact ? 'search' : 'login');
			else if (dir == 'right')
				ui.navigation.goTo(user.contact ? 'contacts' : 'login', true);
		}, 'teaser');
		ui.swipe('info', function (dir) {
			if (dir == 'right')
				ui.navigation.goTo(ui.q('info').getAttribute('from'));
		}, 'textarea');
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
		var wOrg = global.getDevice() == 'computer' ?
			Math.min(window.innerWidth, window.innerHeight) :
			Math.min(screen.availWidth, screen.availHeight), w = wOrg;
		var f = 16;
		if (w < 600)
			f = w / 600 * f;
		else if (w < 1200)
			w = 600;
		else {
			f = f + (w - 1200) / 1800 * f;
			w = w * 0.5;
		}
		if (global.getDevice() == 'computer') {
			ui.css('.bgWeb', 'display', 'block');
			ui.css('main', 'margin-left', (-w / 2) + 'px');
			ui.css('main', 'width', w + 'px');
			ui.classRemove('body', 'app');
			ui.attr('#imgStoreApple', 'src', 'images/storeApple.png');
			ui.attr('#imgStoreGoogle', 'src', 'images/storeGoogle.png');
		} else {
			if (global.getDevice() == 'phone' && screen.availWidth < screen.availHeight)
				f = 14;
			if (w > 600)
				f = f + w / 600;
			if (global.getDevice() == 'phone')
				f *= 1.1;
			ui.css('main', 'margin-left', 0);
			ui.css('main', 'width', '');
			ui.classAdd('body', 'app');
		}
		ui.css('body', 'font-size', f + 'px');
		ui.emInPX = parseFloat(ui.cssValue(document.body, 'font-size'));
		if (window.innerWidth / w > 1.8) {
			ui.css('add', 'width', ((window.innerWidth - w) / 2) + 'px');
			ui.css('add', 'display', 'block');
		} else
			ui.css('add', 'display', '');
	}
	static reset() {
		initialisation.recoverInvoked = false;
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
		ui.labels = s.labels;
		communication.ajax({
			url: (window.location && window.location.href && window.location.href.indexOf(global.server) == 0 ? '/' : '') + 'js/lang/' + lang + '.html',
			success(r) {
				r = r.split('\n\n');
				ui.labels['infoDSGVO'] = r[0];
				ui.labels['infoLegal'] = r[1];
			}
		});
		ui.q('#addLeft > buttontext').innerHTML = global.appTitle + ' blog';
		ui.html('info', '');
		pageHome.init(true);
		if (exec)
			exec.call();
		if (user.contact && oldLang != global.language)
			user.save({ language: lang });
		ui.navigation.closePopup();
	}
	static recoverPassword() {
		if (user.contact || initialisation.recoverInvoked == true)
			return;
		initialisation.recoverInvoked = true;
		var e = pageLogin.getDraft() || {};
		pageLogin.removeCredentials();
		pageLogin.verifyEmail(global.getParam('r'), e.email ? e.email : '');
		if (global.isBrowser())
			history.pushState(null, null, window.location.origin);
	}
	static showStartDialogs() {
		var p = global.getParam();
		if (p) {
			if (p.indexOf('merchantIdInPayPal') > -1) {
				communication.ajax({
					url: global.server + 'action/paypalRegister',
					method: 'PUT',
					body: p,
					responseType: 'json',
					success(r) {
						if (r) {
							user.init(r);
							pageEvent.edit();
						}
					}
				});
			} else
				setTimeout(function () {
					ui.navigation.autoOpen(p);
				}, 100);
		}
		if (global.isBrowser())
			history.pushState(null, null, window.location.origin);
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
