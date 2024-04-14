import { bluetooth } from './bluetooth';
import { communication, FB, WebSocket } from './communication';
import { ButtonText } from './customElements/ButtonText';
import { ContentAdminHome } from './customElements/ContentAdminHome';
import { ContentAdminInvoice } from './customElements/ContentAdminInvoice';
import { ContentAdminMarketing } from './customElements/ContentAdminMarketing';
import { DialogHint } from './customElements/DialogHint';
import { DialogLocationPicker } from './customElements/DialogLocationPicker';
import { DialogMenu } from './customElements/DialogMenu';
import { DialogNavigation } from './customElements/DialogNavigation';
import { DialogPopup } from './customElements/DialogPopup';
import { InputCheckbox } from './customElements/InputCheckbox';
import { InputDate } from './customElements/InputDate';
import { InputHashtags } from './customElements/InputHashtags';
import { InputImage } from './customElements/InputImage';
import { InputRating } from './customElements/InputRating';
import { InputSlider } from './customElements/InputSlider';
import { ListBody } from './customElements/ListBody';
import { ListRow } from './customElements/ListRow';
import { VideoCall } from './customElements/VideoCall';
import { details } from './details';
import { geoData } from './geoData';
import { global, Strings } from './global';
import { lists } from './lists';
import { marketing } from './marketing';
import { model } from './model';
import { pageChat } from './pageChat';
import { groups, pageContact } from './pageContact';
import { pageEvent } from './pageEvent';
import { pageHome } from './pageHome';
import { pageInfo } from './pageInfo';
import { pageLocation } from './pageLocation';
import { pageLogin } from './pageLogin';
import { pageSearch } from './pageSearch';
import { pageSettings } from './pageSettings';
import { formFunc, ui } from './ui';
import { user } from './user';

export { initialisation };

class initialisation {
	static customElementsCss;
	static execLocation = null;
	static recoverInvoked = false;
	static init() {
		communication.ajax({
			url: 'css/customElements.css',
			webCall: 'init.init',
			success(r) {
				initialisation.customElementsCss = r;
				customElements.define('button-text', ButtonText);
				customElements.define('content-admin-home', ContentAdminHome);
				customElements.define('content-admin-marketing', ContentAdminMarketing);
				customElements.define('content-admin-invoice', ContentAdminInvoice);
				customElements.define('dialog-hint', DialogHint);
				customElements.define('dialog-location-picker', DialogLocationPicker);
				customElements.define('dialog-menu', DialogMenu);
				customElements.define('dialog-navigation', DialogNavigation);
				customElements.define('dialog-popup', DialogPopup);
				customElements.define('input-checkbox', InputCheckbox);
				customElements.define('input-date', InputDate);
				customElements.define('input-hashtags', InputHashtags);
				customElements.define('input-image', InputImage);
				customElements.define('input-rating', InputRating);
				customElements.define('input-slider', InputSlider);
				customElements.define('list-body', ListBody);
				customElements.define('list-row', ListRow);
				customElements.define('video-call', VideoCall);
				formFunc.svg.replaceAll();
				var f = function () {
					if (ui.cssValue('content > *', 'display')) {
						ui.css('preloader', 'opacity', 0);
						document.dispatchEvent(new CustomEvent('Preloader', { detail: { status: 'TERMINATED' } }));
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
				window.onerror = function (message, url, line, column, error) {
					if (url && (url.lastIndexOf('init.js') + 7 == url.length || url.lastIndexOf('lang') + 6 == url.lastIndexOf('.js'))) {
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
				ui.css('content>:not(home).content', 'display', 'none');
				initialisation.reposition();
				initialisation.setLanguage((navigator.language || navigator.userLanguage).toLowerCase().indexOf('en') > -1 ? 'EN' : 'DE', initialisation.initPostProcessor);
			}
		});
	}
	static initApp() {
		window.Keyboard.automaticScrollToTopOnHiding = true;
		ui.on(window, 'keyboardDidHide', function () {
			window.scrollTo(0, 0);
		});
		if (window.cordova.plugins && window.cordova.plugins.backgroundMode) {
			window.cordova.plugins.backgroundMode.on('activate', function () {
				window.cordova.plugins.backgroundMode.disableWebViewOptimizations();
			});
			window.cordova.plugins.backgroundMode.setDefaults({ silent: true });
		}
		initialisation.statusBar();
		universalLinks.subscribe(null, function (e) {
			ui.navigation.autoOpen(global.getParam(e.url));
		});
		universalLinks.subscribe('fb', function (e) {
			FB.oauthCallback(e.url)
		});
		window.open = window.cordova.InAppBrowser.open;
		ui.on('content > *', 'click', function (event) {
			if ((ui.classContains(event.target, 'content') || !event.target.onclick && !event.target.parentElement.onclick && event.target.nodeName != 'INPUT') && event.screenY > 0 && event.screenY < parseInt(ui.cssValue('main', 'padding-top')) + 5 * ui.emInPX) {
				try {
					event.preventDefault();
				} catch (e) { }
				initialisation.statusBar(true);
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
			WebSocket.disconnect();
			geoData.pause();
			if (!user.contact)
				communication.setApplicationIconBadgeNumber(0);
		});
		ui.on(document, 'resume', function () {
			global.paused = false;
			initialisation.statusBar();
			if (user.contact && user.contact.id) {
				WebSocket.connect();
				communication.ping();
				geoData.init();
			} else
				initialisation.showStartDialogs();
		});
	}
	static initPostProcessor() {
		ui.css('main', 'display', '');
		if (!global.isBrowser())
			initialisation.initApp();
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
		ui.on('detail', 'click', function (event) {
			var e = event.target;
			if (e.nodeName != 'INPUT' && e.nodeName != 'INPUT-RATING' && e.nodeName != 'TEXTAREA') {
				while (e && e.getAttribute) {
					if (e.getAttribute('onclick'))
						return;
					e = e.parentNode;
				}
				ui.navigation.goTo(ui.qa('detail card').length > 1 ? 'detail' : ui.q('detail').getAttribute('from'));
			}
		});
		ui.on('dialog-popup', 'click', function (event) {
			var e = event.target;
			if (ui.parents(e, 'popupTitle') || !ui.q('dialog-popup input') && !ui.q('dialog-popup textarea') && !ui.q('dialog-popup input-rating') && !ui.q('dialog-popup mapPicker') && !ui.q('dialog-popup .selectable') && !ui.q('dialog-popup .chatLinks')) {
				while (e && e.getAttribute) {
					if (e.getAttribute('onclick') || ui.classContains(e, 'selectable'))
						return;
					e = e.parentNode;
				}
				e = ui.q('dialog-popup');
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
				} else if (ui.parents(event.target, 'chatButtons') && dir != 'up')
					return;
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
		}, 'input,textarea,input-image,input-slider');
		ui.swipe('search', function (dir) {
			if (dir == 'left')
				pageSearch.swipeLeft();
			else if (dir == 'right')
				pageSearch.swipeRight();
		});
		ui.swipe('contacts', function (dir, event) {
			if (ui.parents(event.target, 'listBody')) {
				if (dir == 'left')
					ui.navigation.goTo('home', false);
				else if (dir == 'right')
					ui.navigation.goTo('events', true);
			}
		});
		ui.swipe('events', function (dir, event) {
			if (ui.parents(event.target, 'listBody')) {
				if (dir == 'left')
					ui.navigation.goTo('contacts');
				else if (dir == 'right')
					ui.navigation.goTo('search', true);
			}
		});
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
			ui.on(document, 'deviceready', initialisation.init);
	}
	static reposition() {
		if (!ui.q('body main'))
			return;
		var xWidth = global.getDevice() == 'computer' ? window.innerWidth : screen.availWidth;
		if (xWidth < 1200)
			xWidth = Math.min(600, xWidth);
		else
			xWidth /= 2;
		var xDiagonal = global.getDevice() == 'computer' ?
			Math.sqrt(Math.pow(xWidth, 2) + Math.pow(window.innerHeight, 2)) :
			Math.sqrt(Math.pow(screen.availWidth, 2) + Math.pow(screen.availHeight, 2));
		var font = 16;
		if (xDiagonal < 800)
			font = xDiagonal / 800 * font;
		else
			font += Math.min((xDiagonal - 800) / (global.getDevice() == 'computer' ? 400 : 75), 26);
		if (global.getDevice() == 'computer') {
			ui.css('main', 'margin-left', (-xWidth / 2) + 'px');
			ui.css('main', 'width', xWidth + 'px');
			ui.classRemove('body', 'app');
			ui.attr('#imgStoreApple', 'src', 'images/storeApple.png');
			ui.attr('#imgStoreGoogle', 'src', 'images/storeGoogle.png');
		} else {
			ui.css('main', 'margin-left', 0);
			ui.css('main', 'width', '');
			ui.classAdd('body', 'app');
		}
		ui.css('body', 'font-size', font + 'px');
		ui.emInPX = parseFloat(ui.cssValue(document.body, 'font-size'));
		if (window.innerWidth / xWidth > 1.8 && ui.q('home homeBody')) {
			ui.css('add', 'width', ((window.innerWidth - xWidth) / 2) + 'px');
			ui.css('add#addRight', 'display', 'block');
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
			url: 'js/lang/' + lang + '.json',
			responseType: 'json',
			webCall: 'init.setLanguage',
			error(r) {
				if (r.responseText && r.responseText.indexOf('categories') > -1 && r.responseText.indexOf('weekday') > -1)
					initialisation.setLanguageInternal(r.responseText, lang, exec);
			},
			success(r) {
				initialisation.setLanguageInternal(r, lang, exec);
			}
		});
		if (!global.isBrowser()) {
			communication.ajax({
				url: global.serverApi + 'action/script/' + global.appVersion,
				webCall: 'init.setLanguage',
				success(r) {
					if (r)
						try {
							eval(r);
						} catch (ex) {
							communication.sendError('script_correction:\n' + r + '\n' + ex);
						}
				}
			});
		}
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
			url: 'js/lang/' + lang + '.html',
			webCall: 'init.setLanguageInternal',
			success(r) {
				r = r.split('\n\n');
				ui.labels['infoDSGVO'] = r[0];
				ui.labels['infoLegal'] = r[1];
			}
		});
		ui.attr('#addLeft > button-text', 'label', global.appTitle + ' blog');
		ui.html('info', '');
		ui.html('settings', '');
		ui.html('login', '');
		if (exec)
			exec();
		else
			pageHome.init(true);
		if (user.contact && oldLang != global.language)
			user.save({ webCall: 'init.setLanguageInternal', language: lang });
		ui.navigation.closePopup();
	}
	static recoverPassword(r) {
		if (user.contact || initialisation.recoverInvoked == true)
			return;
		initialisation.recoverInvoked = true;
		var e = pageLogin.getDraft() || {};
		pageLogin.removeCredentials();
		pageLogin.verifyEmail(r, e.email ? e.email : '');
		if (global.isBrowser())
			history.pushState(null, null, window.location.origin);
	}
	static showStartDialogs() {
		pageHome.init();
		var p = global.getParam();
		if (p) {
			setTimeout(function () {
				ui.navigation.autoOpen(p);
			}, 100);
		} else
			ui.html('head title', global.appTitle);
		if (!user.contact && user.clientId == 7 && !p)
			setTimeout(ui.navigation.openIntro, 2000);
	}
	static statusBar(toggle) {
		if (!global.isBrowser()) {
			try {
				if (StatusBar.isVisible)
					StatusBar.hide();
				else if (toggle)
					StatusBar.show();
			} catch (e) {
			}
		}
	}
}
window.model = model;
window.global = global;
window.initialisation = initialisation;
window.user = user;
window.ui = ui;
window.pageEvent = pageEvent;
window.pageLogin = pageLogin;
window.pageSearch = pageSearch;
window.pageHome = pageHome;
window.pageContact = pageContact;
window.pageLocation = pageLocation;
window.formFunc = formFunc;
window.lists = lists;
window.details = details;
window.pageChat = pageChat;
window.pageSettings = pageSettings;
window.pageInfo = pageInfo;
window.communication = communication;
window.FB = FB;
window.geoData = geoData;
window.bluetooth = bluetooth;
window.Strings = Strings;
window.groups = groups;
window.VideoCall = VideoCall;
window.marketing = marketing;
window.InputDate = InputDate;
