import { communication } from './communication';
import { details } from './details';
import { geoData } from './geoData';
import { global } from './global';
import { DragObject } from './initialisation';
import { intro } from './intro';
import { pageChat } from './pageChat';
import { pageHome } from './pageHome';
import { pageInfo } from './pageInfo';
import { pageLocation } from './pageLocation';
import { pageLogin } from './pageLogin';
import { pageContact } from './pageContact';
import { pageWhatToDo } from './pageWhatToDo';
import { pageSearch } from './pageSearch';
import { pageSettings } from './pageSettings';
import { user } from './user';
import { FastButton } from './fastbutton';
import { Contact, model } from './model';

export { ui, formFunc };

class ui {
	static attributes = [];
	static categories = [];
	static emInPX = 0;
	static labels = [];
	static lastClick = '';
	static templateMenuLocation = () =>
		global.template`<div>
		${ui.l('locations.title')}
</div><container>
	<a onclick="communication.loadList(ui.query.locationAll(),pageLocation.listLocation,&quot;locations&quot;,&quot;list&quot;)">
		${ui.l('all')}
	</a><a onclick="communication.loadList(ui.query.locationMatches(),pageLocation.listLocation,&quot;locations&quot;,&quot;matches&quot;)">
		${ui.l('search.matches')}
	</a><a onclick="communication.loadList(ui.query.locationFavorites(),pageLocation.listLocation,&quot;locations&quot;,&quot;favorites&quot;)">
		${ui.l('locations.favoritesButton')}
	</a><a onclick="communication.loadList(ui.query.locationVisits(),pageLocation.listLocation,&quot;locations&quot;,&quot;visits&quot;)">
		${ui.l('title.history')}
	</a><a onclick="pageLocation.edit()">
		${ui.l('locations.new')}
	</a>
</container><div style="margin-top:1em;">
	${ui.l('events.title')}
</div>
<container>
	<a onclick="communication.loadList(ui.query.eventAll(),pageLocation.event.listEvents,&quot;locations&quot;,&quot;events&quot;)"
		style="border-bottom:none;">
		${ui.l('all')}
	</a><a onclick="communication.loadList(ui.query.eventMatches(),pageLocation.event.listEvents,&quot;locations&quot;,&quot;matches&quot;)"
		style="border-bottom:none;">
		${ui.l('search.matches')}
	</a><a onclick="communication.loadList(ui.query.eventMy(),pageLocation.event.listEventsMy,&quot;locations&quot;,&quot;eventsMy&quot;)"
		style="border:none;">
		${ui.l('events.myEvents')}
	</a>
</container>`;
	static templateMenuContacts = () =>
		global.template`<container>
    <a onclick="communication.loadList(ui.query.contactAll(),pageContact.listContacts,&quot;contacts&quot;,&quot;list&quot;)">
			${ui.l('all')}
    </a><a onclick="communication.loadList(ui.query.contactMatches(),pageContact.listContacts,&quot;contacts&quot;,&quot;matches&quot;)">
		${ui.l('search.matches')}
    </a><a onclick="communication.loadList(ui.query.contactFriends(),pageContact.listContacts,&quot;contacts&quot;,&quot;friends&quot;)">
		${ui.l('contacts.friendshipTitle')}
    </a><a onclick="communication.loadList(ui.query.contactVisitees(),pageContact.listContacts,&quot;contacts&quot;,&quot;visits&quot;)">
		${ui.l('title.history')}
	</a><a onclick="communication.loadList(ui.query.contactVisits(),pageContact.listVisits,&quot;contacts&quot;,&quot;profile&quot;)">
		${ui.l('title.visits')}
	</a><a onclick="pageContact.groups.open()" style="border-bottom:none;">
		${ui.l('group.action')}
	</a>
</container>`;
	static templateLanding = v =>
		global.template`<img src="images/splash.svg"/>
		<landingtitle>spontify.me</landingtitle>
		${v.infoAbout}
		<landingsubtitle onclick="intro.openIntro()">${ui.l('intro.open')}</landingsubtitle>
		<landingimages>
		<img onclick="ui.navigation.openHTML(&quot;https://play.google.com/store/apps/details?id=com.jq.findapp&quot;)"
		src="images/storeGoogle.png" />
		<img onclick="ui.navigation.openHTML(&quot;https://itunes.apple.com/de/app/id1508097300&quot;)"
		src="images/storeApple.png" />
		</landingimages>`;
	static addFastButton(id) {
		var e = ui.qa(id + ' [onclick]');
		for (var i = 0; i < e.length; i++) {
			new FastButton(e[i]);
			e[i].removeAttribute('onclick');
		}
	}
	static getAttributes(compare, style) {
		var result = {
			budget: '',
			text: '',
			total: 0,
			totalMatch: 0
		};
		var a, userAttr = user.contact.attrInterest || '';
		if (compare.idDisplay) {
			if (userAttr)
				result.total += userAttr.split('\u0015').length;
			if (compare.attr) {
				a = compare.attr.split('\u0015');
				for (var i = 0; i < a.length; i++) {
					var attr = ui.attributes[parseInt(a[i], 10)];
					if (userAttr.indexOf(a[i]) > -1) {
						result.text += style == 'list' ? ', ' + attr : '<label class="multipleLabel highlight">' + attr + '</label>';
						result.totalMatch++;
					} else if (style != 'list')
						result.text += '<label class="multipleLabel">' + attr + '</label>';
				}
			}
			userAttr = user.contact.attrInterestEx ? ',' + user.contact.attrInterestEx.toLowerCase() + ',' : '';
			if (userAttr)
				result.total += userAttr.split(',').length - 2;
			if (compare.attrEx) {
				a = compare.attrEx.toLowerCase().split(',');
				for (var i = 0; i < a.length; i++) {
					if (userAttr.indexOf(',' + a[i].trim() + ',') > -1) {
						result.text += style == 'list' ? ', ' + a[i].trim() : '<label class="multipleLabel highlight">' + a[i].trim() + '</label>';
						result.totalMatch++;
					} else if (style != 'list')
						result.text += '<label class="multipleLabel">' + a[i].trim() + '</label>';
				}
			}
		}
		for (var i = 0; i < ui.categories.length; i++) {
			userAttr = user.contact['attr' + i] || '';
			var compareHasCat = compare.category ? compare.category.indexOf(i) > -1 : compare['attr' + i] || compare['attr' + i + 'Ex'];
			if (userAttr && (compare.idDisplay || compareHasCat))
				result.total += userAttr.split('\u0015').length;
			if (compareHasCat) {
				result.text += style == 'list' ? ', ' + ui.categories[i].label : '</div><div><label class="multipleLabel' + (userAttr ? ' highlight' : '') + '">' + ui.categories[i].label + '</label>';
				if (userAttr)
					result.totalMatch++;
			}
			if (compare['attr' + i]) {
				a = compare['attr' + i].split('\u0015');
				for (var i2 = 0; i2 < a.length; i2++) {
					var attr = ui.categories[i].subCategories[parseInt(a[i2], 10)];
					if (userAttr.indexOf(a[i2]) > -1) {
						result.text += style == 'list' ? ', ' + attr : '<label class="multipleLabel highlight">' + attr + '</label>';
						result.totalMatch++;
					} else if (style != 'list')
						result.text += '<label class="multipleLabel">' + attr + '</label>';
				}
			}
			userAttr = user.contact['attr' + i + 'Ex'] ? ',' + user.contact['attr' + i + 'Ex'].toLowerCase() + ',' : '';
			if (userAttr && (compare.idDisplay || compareHasCat))
				result.total += userAttr.split(',').length - 2;
			if (compare['attr' + i + 'Ex']) {
				a = compare['attr' + i + 'Ex'].split(',');
				for (var i2 = 0; i2 < a.length; i2++) {
					if (userAttr.indexOf(',' + a[i2] + ',') > -1) {
						result.text += style == 'list' ? ', ' + a[i2].trim() : '<label class="multipleLabel highlight">' + a[i2].trim() + '</label>';
						result.totalMatch++;
					} else if (style != 'list')
						result.text += '<label class="multipleLabel">' + a[i2].trim() + '</label>';
				}
			}
		}
		if (user.contact.budget)
			result.total += user.contact.budget.split('\u0015').length;
		if (compare.budget) {
			var userBudget = user.contact.budget || '';
			var b = compare.budget.split('\u0015');
			for (var i = 0; i < b.length; i++) {
				var s = '', i2 = 0;
				var max = 1 + parseInt(b[i]);
				for (; i2 < max; i2++)
					s += ui.l('budget');
				if (max < 3) {
					s += '<span style="opacity:0.3;">';
					for (; i2 < 3; i2++)
						s += ui.l('budget');
					s += '</span>';
				}
				result.budget += '<label class="multipleLabel' + (userBudget.indexOf(b[i]) > -1 ? ' highlight' : '') + '">' + s + '</label>';
			}
			result.totalMatch += result.budget.split('highlight').length - 1;
		}
		if (result.text)
			result.text = style == 'list' ? result.text.substring(2) : '<div>' + result.text + '</div>';
		return result;
	}
	static getEvtPos(e, horizontal) {
		if (!e)
			e = window.event;
		if (horizontal) {
			if (e.touches && e.touches[0])
				return e.touches[0].pageX ? e.touches[0].pageX : e.touches[0].clientX + window.document.body.scrollLeft;
			if (e.changedTouches && e.changedTouches[0])
				return e.changedTouches[0].pageX ? e.changedTouches[0].pageX : e.changedTouches[0].clientX + window.document.body.scrollLeft;
			return e.pageX ? e.pageX : e.clientX + window.document.body.scrollLeft;
		}
		if (e.touches && e.touches[0])
			return e.touches[0].pageY ? e.touches[0].pageY : e.touches[0].clientY + window.document.body.scrollTop;
		if (e.changedTouches && e.changedTouches[0])
			return e.changedTouches[0].pageY ? e.changedTouches[0].pageY : e.changedTouches[0].clientY + window.document.body.scrollTop;
		return e.pageY ? e.pageY : e.clientY + window.document.body.scrollTop;
	}
	static navigation = {
		animationEvent: null,
		lastID: null,

		animation(e, c, exec) {
			if (typeof e == 'string')
				e = ui.q(e);
			if (ui.classContains(e, 'animated'))
				return;
			var s = 'listSlideOut popupSlideOut menuSlideOut homeSlideOut detailSlideOut detailBackSlideOut listSlideIn popupSlideIn menuSlideIn homeSlideIn detailSlideIn detailBackSlideIn slideUp slideDown';
			ui.classRemove(e, s);
			ui.classAdd(e, c + ' animated');
			ui.on(e, ui.navigation.animationEvent, function () {
				ui.classRemove(e, 'animated ' + s);
				if (exec)
					exec.call();
			}, true);
			ui.css(e, 'display', '');
		},
		autoOpen(id, closeAction) {
			if (!id)
				return false;
			var f = function () {
				if (ui.q('#preloader'))
					setTimeout(f, 500);
				else {
					if (id.indexOf('https://') == 0) {
						ui.navigation.openHTML(id);
						return;
					}
					if (id.indexOf('info') == 0) {
						if (id.length > 4)
							pageInfo.openSection = parseInt(id.substring(4));
						ui.navigation.goTo('info');
						return true;
					}
					if (id.indexOf('chat=') != 0 && id.indexOf('n=') != 0 && id.indexOf('m=') != 0) {
						id = global.decParam(id);
						if (!id)
							return false;
					}
					if (!user.contact && id.indexOf('l=') != 0)
						return false;
					if (id.indexOf('chat=') == 0) {
						pageChat.open(id.substring(5));
						return;
					}
					var idIntern = id.indexOf('&') > 0 ? id.substring(0, id.indexOf('&')) : id;
					var o = function (r) {
						if (!r)
							return;
						var s, title, type;
						if (idIntern.indexOf('l') == 0 || idIntern.indexOf('e') == 0) {
							s = pageLocation.detailLocationEvent(r, idIntern.substring(2));
							title = r['location.name'];
							type = 'locations';
						}
						else {
							s = pageContact.detail(r, idIntern.substring(2));
							title = r['contact.pseudonym'];
							type = 'contacts';
						}
						if (id.indexOf('='))
							id = id.substring(id.indexOf('=') + 1);
						ui.navigation.openPopup(title, '<detail i="' + id + '" class="mainBG" type="' + type + '" style="padding:0;">' + s + '</detail>', closeAction);
						geoData.updateCompass();
						return '';
					};
					if (idIntern.indexOf('l=') == 0)
						details.open('locations', idIntern.substring(2), 'location_list&search=' + encodeURIComponent('location.id=' + idIntern.substring(2)), o);
					else if (idIntern.indexOf('e=') == 0)
						details.open('locations', idIntern.substring(2), 'event_list&search=' + encodeURIComponent('event.id=' + idIntern.substring(2)), o);
					else if (idIntern.indexOf('n=') == 0) {
						communication.ajax({
							url: global.server + 'db/one?query=contact_notification&search=contactNotification.id=' + id.substring(2),
							responseType: 'json',
							success(r) {
								if (r && r.length > 1) {
									var e = {}, v = model.convert(new Contact(), r, 1);
									e.message = v.notification.text;
									if (v.notification.contactId != user.contact.id)
										e.message = v.pseudonym + ' ' + e.message;
									if (v.notification.action) {
										e.additionalData = {};
										e.additionalData.exec = v.notification.action;
									}
									communication.notification.open(e);
								}
							}
						});
					} else if (idIntern.indexOf('=') == 1)
						details.open('contacts', idIntern.substring(2), 'contact_list&search=' + encodeURIComponent('contact.id=' + idIntern.substring(2)), o);
				}
			};
			f.call();
		},
		fade(id, back, exec) {
			var oldID = ui.navigation.getActiveID();
			if (oldID == 'notifications')
				oldID = 'whattodo';
			var currentDiv = ui.q(id);
			var oldDiv = ui.q(oldID);
			if (id == 'whattodo' && ui.q('notifications listResults') && ui.cssValue('whattodobody', 'display') == 'none')
				ui.css('notifications', 'display', 'block');
			if (oldID == 'home' || id == 'home') {
				if (oldID == 'home')
					ui.css(currentDiv, 'display', 'block');
				ui.navigation.animation('home', 'homeSlide' + (id == 'home' ? 'In' : 'Out'), function () {
					ui.css('home', 'display', id == 'home' ? 'block' : 'none');
					ui.css(oldDiv, 'display', 'none');
					if (exec)
						exec.call();
				});
				return;
			}
			var o;
			if (back || oldID == 'detail')
				o = id == 'login' ? 'list' : 'detailBack';
			else if (id == 'detail' || id == 'settings2' && oldID == 'settings' || id == 'settings3')
				o = 'detail';
			else
				o = 'list';
			ui.classAdd(currentDiv, o + 'SlideIn');
			ui.css(currentDiv, 'display', 'block');
			if (ui.q('main.app') && (id == 'locations' || id == 'contacts'))
				ui.css('main', 'overflow', 'visible');
			ui.navigation.animation('content', o + 'SlideOut', function () {
				var e = ui.q('main');
				ui.css(e, 'overflow', '');
				e.scrollTop = 0;
				ui.css(oldDiv, 'display', 'none');
				ui.css(oldDiv, 'marginLeft', 0);
				ui.classRemove(currentDiv, o + 'SlideIn');
				ui.css(currentDiv, 'webkitTransform', '');
				if (exec)
					exec.call();
				if (user.contact) {
					var e = ui.q('login');
					if (e.innerHTML) {
						ui.css(e, 'display', 'none');
						ui.html(e, '');
					}
				}
			});
		},
		getActiveID() {
			var id = 'home';
			if (ui.cssValue(id, 'display') != 'none') {
				ui.css('content>.content', 'display', 'none');
				return id;
			}
			var e = ui.q('content>[class*="SlideIn"]');
			if (!e)
				e = ui.q('content>.content:not([style*="none"])');
			if (e)
				id = e.nodeName.toLowerCase();
			if (id == 'whattodo' && ui.q('notifications:not([style*="none"])'))
				id = 'notifications';
			if (id == 'home' && ui.cssValue(id, 'display') == 'none')
				ui.css(id, 'display', 'block');
			return id;
		},
		goBack() {
			if (ui.cssValue('popup', 'display') != 'none')
				ui.navigation.hidePopup();
			else if (ui.cssValue('chat', 'display') != 'none')
				pageChat.close();
			else {
				var id = ui.navigation.getActiveID();
				if (id == 'detail')
					details.swipeRight();
				else if (id == 'settings2')
					ui.navigation.goTo('settings');
				else if (id == 'settings3')
					ui.navigation.goTo('settings2');
				else
					ui.navigation.goTo('home');
			}
		},
		goTo(id, event, back) {
			if (!user.contact && id != 'home' && id != 'info') {
				if (id == 'whattodo' || id == 'locations' || id == 'contacts') {
					intro.openHint({ desc: id, pos: '10%,5em', size: '80%,auto', onclick: 'ui.navigation.goTo("login")' });
					return;
				}
				id = 'login';
			}
			geoData.headingClear();
			if (ui.classContains('content', 'animated') || ui.classContains('menu', 'animated') || pageChat.close())
				return;
			if (document.activeElement)
				document.activeElement.blur();
			if (!intro.introMode)
				intro.closeIntro();
			var oldID = ui.navigation.getActiveID();
			if (oldID == 'settings' && !pageSettings.save(id))
				return;
			if (!user.contact && oldID == 'login')
				pageLogin.saveDraft();
			if (oldID == 'settings3')
				pageSettings.save3();
			if (id.indexOf('settings') == 0 && pageSettings.init(function () { ui.navigation.goTo(id, event, back); }))
				return;
			else if (id == 'info')
				pageInfo.init();
			else if (id == 'login')
				pageLogin.init();
			else if (id == 'home')
				pageHome.init();
			else if (id == 'contacts')
				pageContact.init();
			else if (id == 'locations')
				pageLocation.init();
			else if (id == 'whattodo') {
				pageWhatToDo.init();
				if (oldID == 'notifications') {
					pageWhatToDo.closeNotifications();
					return;
				}
			} else if (id == 'search')
				pageSearch.init();
			pageChat.closeList();
			if (event)
				event.stopPropagation();
			ui.navigation.hidePopup();
			ui.css('main>buttonIcon', 'display', id == 'home' ? 'none' : '');
			var s = id;
			if (s == 'detail' && oldID == 'notifications')
				s = 'whattodo';
			else if (s != 'whattodo' && s != 'locations' && s != 'contacts' && s != 'whattodo' && s != 'login' && s != 'info' && s != 'search' && s.indexOf('settings') < 0)
				s = oldID;
			if (oldID != id) {
				ui.navigation.fade(id, back);
				ui.navigation.hideMenu();
			}
			ui.navigation.lastID = oldID;
		},
		hidePopup() {
			ui.attr('popup', 'error', '');
			if (ui.cssValue('popup', 'display') != 'none' && ui.q('popupTitle').getAttribute('modal') != 'true') {
				var e = ui.q('popupTitle');
				if (e)
					e.click();
				return true;
			}
			return false;
		},
		hidePopupHard() {
			var e = ui.q('popup');
			ui.css(e, 'display', 'none');
			ui.html(e, '');
			ui.attr('popup', 'error', '');
			ui.classRemove(e, 'animated popupSlideIn popupSlideOut');
		},
		hideMenu(exec) {
			if (ui.cssValue('menu', 'transform').indexOf('1') > 0)
				ui.navigation.toggleMenu();
			if (exec)
				exec.call();
		},
		openAGB() {
			pageInfo.openSection = 1;
			ui.navigation.goTo('info');
		},
		openHTML(url, name) {
			if (!name)
				name = global.appTitle;
			var e = window.open(url, name, 'location=no,hardwareback=no,toolbar=yes,closebuttoncaption=' + ui.l('back'));
			if (e && e.focus) {
				try {
					e.focus();
				} catch (e2) {
				}
			}
			return e;
		},
		openPopup(title, data, closeAction, modal, exec) {
			intro.closeIntro();
			var p = ui.q('popup'), visible = p.style.display != 'none';
			if (ui.classContains(p, 'animated') || visible && ui.q('popupTitle').getAttribute('modal') == 'true')
				return false;
			if (global.isBrowser() && location.href.indexOf('#') < 0)
				history.pushState(null, null, '#x');
			var t = ui.q('popupTitle') ? ui.q('popupTitle').innerText : null;
			if (t && t == title)
				ui.navigation.hidePopup();
			else if (data) {
				if (data.indexOf('<d') != 0)
					data = '<div style="text-align:center;padding:1em;">' + data + '</div>';
				data = '<popupTitle onclick="' + (closeAction ? 'if(' + closeAction + '!=false)' : '') + 'ui.navigation.openPopup();"' + (modal ? ' modal="true"' : '') + '>' + title + '</popupTitle><popupContent ts="' + new Date().getTime() + '">' + data + '</popupContent>';
				var f = function () {
					ui.navigation.setPopupContent(data);
					ui.attr('popup', 'error', '');
					ui.navigation.animation(p, visible ? 'slideDown' : 'popupSlideIn');
					ui.css('popupContent', 'maxHeight', (ui.q('content').clientHeight - ui.q('popupTitle').clientHeight) + 'px');
					if (exec)
						exec.call();
				};
				if (!visible)
					f.call();
				else
					ui.navigation.animation(p, 'slideUp', f);
			} else
				ui.navigation.animation(p, 'popupSlideOut', ui.navigation.hidePopupHard);
			return true;
		},
		openSwipeLeftUI(event) {
			var e = ui.parents(event.target, 'row');
			if (e)
				e.click();
		},
		selectTab(event) {
			var e = ui.parents(event.target, 'tab');
			ui.classRemove(e.parentNode.children, 'tabActive');
			ui.classAdd(e, 'tabActive');
			return e;
		},
		setPopupContent(s) {
			var e = ui.q('popup');
			ui.css(e, 'display', 'none');
			ui.html(e, s);
			formFunc.initFields('popup');
		},
		toggleMenu(activeID) {
			if (!activeID) {
				activeID = ui.navigation.getActiveID();
				if (activeID == 'notifications')
					activeID = 'whattodo';
			}
			var e = ui.q('menu');
			if (activeID == 'locations')
				ui.html(e, ui.templateMenuLocation());
			else if (activeID == 'contacts')
				ui.html(e, ui.templateMenuContacts());
			ui.addFastButton('menu');
			ui.classAdd(ui.qa('menu a')[parseInt(ui.q(activeID).getAttribute('menuIndex'))], 'menuHighlight');
			ui.css(e, 'transform', e.style.transform.indexOf('1') > 0 ? 'scale(0)' : 'scale(1)')
		}
	};
	static openDescription(event, id) {
		if (ui.classContains(event.target, 'avatar'))
			return;
		var e = ui.q('descbox');
		if (id && e.getAttribute('cid') != id) {
			if (!e.innerHTML || e.getAttribute('lang') != global.language) {
				var v = {};
				v.parent = 'descbox';
				v.infoAbout = pageInfo.templateAbout(v);
				e.innerHTML = ui.templateLanding(v);
				ui.attr(e, 'lang', global.language);
				ui.q('descbox #landing0').style.display = 'block';
			}
			if (ui.cssValue(e, 'transform').indexOf('0') > 0)
				ui.css(e, 'transform', 'scale(1)');
			ui.attr(e, 'cid', id);
		} else {
			ui.css(e, 'transform', 'scale(0)');
			ui.attr(e, 'cid', '');
		}
	}
	static query = {
		contactAll() {
			return 'query=contact_list&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&search=' + encodeURIComponent('contact.id<>' + user.contact.id);
		},
		contactMatches() {
			return 'query=contact_list&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&search=' + encodeURIComponent(pageSearch.getSearchMatchesContact());
		},
		contactFriends() {
			return 'query=contact_list&distance=100000&limit=500&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&search=' + encodeURIComponent('contactLink.id is not null');
		},
		contactVisitees() {
			return 'query=contact_listVisit&distance=100000&sort=false&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&search=' + encodeURIComponent('contactVisit.contactId2=contact.id and contactVisit.contactId=' + user.contact.id);
		},
		contactVisits() {
			communication.ajax({
				url: global.server + 'db/one',
				method: 'PUT',
				body: { classname: 'Contact', id: user.contact.id, values: { visitPage: new Date().toISOString() } }
			});
			return 'query=contact_listVisit&distance=100000&sort=false&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&search=' + encodeURIComponent('contactVisit.contactId=contact.id and contactVisit.contactId2=' + user.contact.id);
		},
		eventAll() {
			return 'query=event_listCurrent&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon;
		},
		eventMatches() {
			return 'query=event_listCurrent&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&search=' + encodeURIComponent(pageSearch.getSearchMatchesLocation());
		},
		eventMy() {
			return 'query=event_list&distance=100000&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&search=' + encodeURIComponent('event.contactId=' + user.contact.id);
		},
		locationAll() {
			return (user.contact ? 'query=location_list' : 'query=location_anonymousList') + '&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon;
		},
		locationFavorites() {
			return 'query=location_list&distance=100000&limit=500&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&search=' + encodeURIComponent('locationFavorite.id is not null');
		},
		locationMatches() {
			return 'query=location_list&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&search=' + encodeURIComponent(pageSearch.getSearchMatchesLocation());
		},
		locationVisits() {
			return 'query=location_listVisit&distance=100000&sort=false&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon;
		}
	}
	static l(id) {
		var s = ui.labels[id];
		if (!s && id.indexOf('.') > 0) {
			var i = id.split('.');
			if (ui.labels[i[0]])
				s = ui.labels[i[0]][i[1]];
		}
		if (!s)
			communication.sendError('ERROR label not found: ' + id);
		return s;
	}
	static off(e, type, f) {
		ui.x(e, function (e2) {
			e2.removeEventListener(type, f);
		});
	}
	static on(e, type, f, once) {
		ui.x(e, function (e2) {
			e2.addEventListener(type, f, { capture: type == 'touchstart' ? true : false, passive: true, once: once == true ? true : false });
		});
	}
	static q(path) {
		return document.querySelector(path);
	}
	static qa(path) {
		return document.querySelectorAll(path);
	}
	static attr(e, name, value) {
		var b = value || typeof value == 'string' || value == 0;
		ui.x(e, function (e2) {
			if (b)
				e2.setAttribute(name, value);
			else
				e2.removeAttribute(name);
		});
	}
	static class(e, value) {
		ui.x(e, function (e2) {
			e2.classList = value;
		});
	}
	static classAdd(e, value) {
		var valueSplit = value.split(' ');
		ui.x(e, function (e2) {
			var s = e2.classList ? ' ' + e2.classList.value + ' ' : '';
			for (var i = 0; i < valueSplit.length; i++) {
				if (s.indexOf(' ' + valueSplit[i] + ' ') < 0)
					e2.classList = (e2.classList.value + ' ' + value).trim();
			}
		});
	}
	static classContains(e, value) {
		var b = false;
		value = ' ' + value + ' ';
		ui.x(e, function (e2) {
			if (e2.classList && (' ' + e2.classList.value + ' ').indexOf(value) > -1)
				b = true;
		});
		return b;
	}
	static classRemove(e, value) {
		value = ' ' + value + ' ';
		ui.x(e, function (e2) {
			if (e2.classList) {
				var newList = '';
				for (var i = 0; i < e2.classList.length; i++) {
					if (value.indexOf(' ' + e2.classList[i] + ' ') < 0)
						newList += ' ' + e2.classList[i];
				}
				e2.classList = newList.trim();
			}
		});
	}
	static css(e, css, value) {
		ui.x(e, function (e2) {
			e2.style[css] = value;
		});
	}
	static cssValue(e, css) {
		var value;
		ui.x(e, function (e2) {
			value = window.getComputedStyle(e2, null).getPropertyValue(css);
		});
		return value;
	}
	static html(e, value) {
		ui.x(e, function (e2) {
			e2.innerHTML = value;
		});
	}
	static parents(e, nodeName) {
		if (e) {
			nodeName = nodeName.toUpperCase();
			while (e && e.nodeName != nodeName)
				e = e.parentNode;
		}
		return e;
	}
	static scrollTo(e, position, exec) {
		if (typeof e == 'string')
			e = ui.q(e);
		var scrollTopOrg = e.scrollTop;
		if (scrollTopOrg == position)
			return;
		const down = position > scrollTopOrg;
		const cosParameter = (down ? position - scrollTopOrg : scrollTopOrg - position) / 2;
		let scrollCount = 0, oldTimestamp = null;

		function step(newTimestamp) {
			if (oldTimestamp !== null) {
				scrollCount += Math.PI * (newTimestamp - oldTimestamp) / 400;
				if (scrollCount >= Math.PI) {
					e.scrollTop = position;
					if (exec)
						exec.call();
					return;
				}
				e.scrollTop = scrollTopOrg + (down ? 1 : -1) * (cosParameter - cosParameter * Math.cos(scrollCount));
			}
			oldTimestamp = newTimestamp;
			window.requestAnimationFrame(step);
		}
		window.requestAnimationFrame(step);
	}
	static swipe(e, exec, exclude) {
		if (typeof e == 'string')
			e = ui.q(e);
		exclude = exclude ? ',' + exclude.toUpperCase() + ',' : '';
		ui.on(e, 'touchstart', function (event) {
			if (exclude.indexOf(',' + event.target.nodeName + ',') < 0 && exclude.indexOf(',' + event.target.parentNode.nodeName + ',') < 0) {
				e.startX = event.changedTouches[0].pageX;
				e.startY = event.changedTouches[0].pageY;
				e.startTime = new Date().getTime();
			}
		});
		ui.on(e, 'touchend', function (event) {
			if (exclude.indexOf(',' + event.target.nodeName + ',') < 0 && exclude.indexOf(',' + event.target.parentNode.nodeName + ',') < 0) {
				var distX = event.changedTouches[0].pageX - e.startX;
				var distY = event.changedTouches[0].pageY - e.startY;
				var elapsedTime = new Date().getTime() - e.startTime;
				var swipedir = 'none', threshold = 60, restraint = 2000, allowedTime = 1000;
				if (elapsedTime <= allowedTime) {
					if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint)
						swipedir = distX < 0 ? 'left' : 'right';
					else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint)
						swipedir = distY < 0 ? 'up' : 'down';
				}
				exec(swipedir, event);
			}
		});
	}
	static toggleHeight(e, exec) {
		if (typeof e == 'string')
			e = ui.q(e);
		if (e.getAttribute('toggle'))
			return;
		if (!e.getAttribute('h')) {
			var p = e.style.position;
			var d = e.style.display;
			e.style.opacity = 0;
			e.style.display = 'block';
			e.style.position = 'absolute';
			e.setAttribute('h', e.offsetHeight);
			e.style.position = p;
			e.style.opacity = '';
			e.style.display = d ? d : 'none';
		}
		var o = e.style.overflow;
		var t = e.style.transition;
		e.style.overflow = 'hidden';
		e.setAttribute('toggle', true);
		if (ui.cssValue(e, 'display') == 'none') {
			e.style.transition = 'height .4s ease-out';
			e.style.display = 'block';
			e.style.height = 0;
			setTimeout(function () {
				e.style.height = e.getAttribute('h') + 'px';
				ui.on(e, 'transitionend', function () {
					e.style.overflow = o;
					e.style.transition = t;
					e.style.height = '';
					e.style.display = '';
					if (exec)
						exec.call();
					e.removeAttribute('toggle');
				}, true);
			}, 50);
		} else {
			e.style.transition = 'height .4s ease-in';
			e.style.height = e.offsetHeight + 'px';
			setTimeout(function () {
				e.style.height = 0;
				ui.on(e, 'transitionend', function () {
					e.style.overflow = o;
					e.style.transition = t;
					e.style.display = 'none';
					if (exec)
						exec.call();
					e.removeAttribute('toggle');
				}, true);
			}, 50);
		}
	}
	static val(id) {
		var e = ui.q(id);
		if (e)
			return e.value
		return '';
	}
	static x(e, f) {
		if (typeof e == 'string')
			e = ui.qa(e);
		if (!e)
			return;
		if (e.length) {
			for (var i = 0; i < e.length; i++)
				f(e[i]);
		} else if (e && typeof e.addEventListener == 'function')
			f(e);
	}
};

class formFunc {
	static cameraField = null;
	static dist = 0;

	static getDraft(id) {
		return user.contact.storage[id];
	}
	static getForm(id) {
		var d = { values: {} }, cb = {};
		var e = ui.qa('[name="' + id + '"] textarea');
		for (var i = 0; i < e.length; i++) {
			if (e[i].name)
				d.values[e[i].name] = e[i].value.replace(/\"/g, '&quot;').replace(/</g, '&lt;');
		}
		e = ui.qa('[name="' + id + '"] select');
		for (var i = 0; i < e.length; i++) {
			if (e[i].name)
				d.values[e[i].name] = e[i].value;
		}
		e = ui.qa('[name="' + id + '"] input');
		for (var i = 0; i < e.length; i++) {
			if (e[i].getAttribute('transient') != 'true') {
				if (e[i].name && e[i].type == 'file') {
					var f = ui.q('[name="' + e[i].name + 'Preview"]');
					if (f && f.getAttribute('src')) {
						var img = new Image();
						img.src = f.getAttribute('src');
						var ratio;
						if (f.clientHeight > f.clientWidth)
							ratio = f.naturalWidth / f.clientWidth;
						else
							ratio = f.naturalHeight / f.clientHeight;
						var x = -f.offsetLeft * ratio;
						var y = -f.offsetTop * ratio;
						var w = Math.min(f.parentElement.clientWidth, f.clientWidth) * ratio;
						var h = Math.min(f.parentElement.clientHeight, f.clientHeight) * ratio;
						var b = formFunc.image.scale(img, x, y, w, h).data;
						// b = data:image/jpeg;base64,/9j/4AAQS...
						d.values[e[i].name] = '.' + b.substring(b.indexOf('/') + 1, b.indexOf(';')) + '\u0015' + b.substring(b.indexOf(',') + 1);
					}
				} else if (e[i].type == 'radio') {
					if (e[i].checked)
						d.values[e[i].name] = e[i].value;
				} else if (e[i].type == 'checkbox') {
					if (!cb[e[i].name])
						cb[e[i].name] = '';
					if (e[i].checked)
						cb[e[i].name] += '\u0015' + e[i].value;
					else if (e[i].value == 'true')
						cb[e[i].name] += '\u0015false';
				} else if (e[i].name)
					d.values[e[i].name] = e[i].value.replace(/\"/g, '&quot;').replace(/</g, '&lt;');
			}
		}
		for (var k in cb)
			d.values[k] = cb[k].length > 0 ? cb[k].substring(1) : '';
		return d;
	}
	static image = {
		cameraError(e) {
			if (!e || e.toLowerCase().indexOf('select') < 0)
				ui.navigation.openPopup(ui.l('attention'), ui.l('camera.notAvailabe').replace('{0}', e));
		},
		cameraPicture(name, camera) {
			formFunc.cameraField = name;
			navigator.camera.getPicture(formFunc.image.cameraSuccess, formFunc.image.cameraError,
				{ sourceType: camera ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY, destinationType: Camera.DestinationType.FILE_URI });
		},
		cameraSuccess(e) {
			ui.css('[name="' + formFunc.cameraField + '_appInput"]', 'display', 'none');
			ui.css('[name="' + formFunc.cameraField + '_disp"]', 'display', 'block');
			window.resolveLocalFileSystemURL(e,
				function (fe) {
					fe.file(function (f) {
						formFunc.image.preview2(f, formFunc.cameraField);
						ui.css('popupSendImage', 'display', 'inline-block');
					}, formFunc.image.cameraError);
				}, formFunc.image.cameraError);
		},
		dataURItoBlob(dataURI) {
			var arr = dataURI.split(','), mime = arr[0].match(/:(.*?);/)[1];
			arr[1] = atob(arr[1]);
			var ab = new ArrayBuffer(arr[1].length);
			var ia = new Uint8Array(ab);
			for (var i = 0; i < arr[1].length; i++)
				ia[i] = arr[1].charCodeAt(i);
			return new Blob([ab], { type: mime });
		},
		hasImage(name) {
			var x = ui.q('[name="' + name + 'Preview"]');
			return x && x.getAttribute('src') && x.getAttribute('src').length > 100;
		},
		preview(e) {
			formFunc.image.preview2(e.files && e.files.length > 0 ? e.files[0] : null, e.getAttribute('name'));
		},
		preview2(file, name) {
			ui.attr('[name="' + name + '"]', 'rotateImage', 0);
			if (file) {
				var ePrev = ui.q('[name="' + name + '_disp"]');
				ui.css(ePrev, 'z-index', 999);
				var p = '<rotate onclick="formFunc.image.rotate(this)">&#8635;</rotate><img name="' + name + 'Preview"/>';
				ui.html(ePrev, '<close onclick="formFunc.image.remove(&quot;' + name + '&quot;)">X</close>' + p + '<desc></desc>');
				formFunc.image.previewInternal(file, name);
			} else
				formFunc.image.remove(name);
		},
		previewCalculateDistance(event) {
			var t;
			if (event.changedTouches && event.changedTouches.length > 0)
				t = event.changedTouches;
			else if (event.targetTouches && event.targetTouches.length > 0)
				t = event.targetTouches;
			else
				t = event.touches;
			if (t && t.length > 1)
				return Math.hypot(t[0].pageX - t[1].pageX, t[0].pageY - t[1].pageY);
		},
		previewInternal(f, name) {
			var reader = new FileReader();
			reader.onload = function (r) {
				var img = ui.q('[name="' + name + 'Preview"]');
				if (img) {
					var image = new Image();
					image.onload = function () {
						var whOrg = image.naturalWidth + ' x ' + image.naturalHeight;
						ui.attr('[name="' + name + '"]', 'rotateImage', 0);
						var scaled = formFunc.image.scale(image);
						var size = formFunc.image.dataURItoBlob(scaled.data).size, sizeOrg = f.size, s, s2 = '', s0 = '';
						if (size > 1024 * 1024) {
							if (size > 5 * 1024 * 1024) {
								s0 = '<span style="color:red;">';
								s2 = '</span>';
							}
							s = (size / 1024 / 1024).toFixed(1) + ' MB';
						} else if (size > 1024)
							s = (size / 1024).toFixed(1) + ' KB';
						else
							s = size + ' B';
						var x;
						if (sizeOrg > 1024 * 1024)
							x = (sizeOrg / 1024 / 1024).toFixed(1) + ' MB';
						else if (sizeOrg > 1024)
							x = (sizeOrg / 1024).toFixed(1) + ' KB';
						else
							x = sizeOrg + ' B';
						ui.q('[name="' + name + '_disp"] desc').innerHTML = x + global.separator + whOrg + '<br/>' + ui.l('fileUpload.ratio') + ' ' + (100 - size / sizeOrg * 100).toFixed(0) + '%<br/>' + s0 + s + global.separator + s2 + '<span id="imagePreviewSize">' + scaled.width + ' x ' + scaled.height + '</span>';
						img.src = r.target.result;
						var disp = ui.q('[name="' + name + '_disp"]');
						ui.css(disp, 'height', disp.clientWidth + 'px');
						if (image.naturalWidth > image.naturalHeight) {
							ui.css(img, 'max-height', '100%');
							if (image.naturalWidth > disp.clientWidth)
								ui.css(img, 'margin-left', -((Math.min(disp.clientHeight / image.naturalHeight, 1) * image.naturalWidth - disp.clientWidth) / 2) + 'px');
						} else {
							ui.css(img, 'max-width', '100%');
							if (image.naturalHeight > disp.clientHeight)
								ui.css(img, 'margin-top', -((Math.min(disp.clientWidth / image.naturalWidth, 1) * image.naturalHeight - disp.clientHeight) / 2) + 'px');
						}
						new DragObject(img).ondrag = function (event, delta) {
							if (parseInt(delta.y) != 0) {
								var y = parseInt(ui.cssValue(img, 'margin-top')) + delta.y;
								if (y < 1 && y > -(img.clientHeight - disp.clientHeight))
									ui.css(img, 'margin-top', y + 'px');
							}
							if (parseInt(delta.x) != 0) {
								var x = parseInt(ui.cssValue(img, 'margin-left')) + delta.x;
								if (x < 1 && x > -(img.clientWidth - disp.clientWidth))
									ui.css(img, 'margin-left', x + 'px');
							}
						};
						ui.on(img, 'touchmove', function (event) {
							var d = formFunc.image.previewCalculateDistance(event);
							if (d) {
								var zoom = Math.sign(formFunc.dist - d) * 5;
								if (zoom > 0)
									zoom /= event.scale;
								else
									zoom *= event.scale;
								formFunc.image.zoom(event, zoom);
								formFunc.dist = d;
							}
						});
						ui.on(img, 'touchstart', function (event) {
							var d = formFunc.image.previewCalculateDistance(event);
							if (d)
								formFunc.dist = d;
						});
					};
					image.src = r.target.result;
				}
			};
			reader.readAsDataURL(f);
		},
		remove(name) {
			var e = ui.q('[name="' + name + '"]');
			e.value = '';
			ui.attr(e, 'rotateImage', 0);
			var ePrev = ui.q('[name="' + name + '_disp"]');
			ui.css(ePrev, 'z-index', '');
			ui.html(ePrev, '<span>' + (e.getAttribute('hint') ? e.getAttribute('hint') : ui.l('fileUpload.select')) + '</span>');
			ui.css('[name="' + name + '_disp"]', 'height', '');
			if (!global.isBrowser()) {
				ui.css('[name="' + name + '_appInput"]', 'display', 'block');
				ui.css(ePrev, 'display', 'none');
				ui.css('popupSendImage', 'display', 'none');
			}
		},
		rotate(img) {
			if (!img.name)
				img = img.nextSibling;
			var canvas = document.createElement('canvas'), w = img.naturalWidth, h = img.naturalHeight;
			canvas.width = h;
			canvas.height = w;
			var ctx = canvas.getContext('2d');
			var image = new Image();
			image.src = img.src;
			image.onload = function () {
				var wh = ui.q('#imagePreviewSize').innerHTML.split('x');
				ctx.clearRect(0, 0, w, h);
				ctx.rotate(0.5 * Math.PI);
				ctx.translate(0, -h);
				ctx.drawImage(image, 0, 0, w, h);
				img.src = canvas.toDataURL('image/jpeg', 1);
				var e = ui.q('[name="' + img.name.substring(0, img.name.length - 7) + '"]');
				ui.attr(e, 'rotateImage', (90 + parseInt(e.getAttribute('rotateImage'), 10)) % 360);
				ui.q('#imagePreviewSize').innerHTML = wh[1].trim() + ' x ' + wh[0].trim();
			};
		},
		scale(image, x, y, w, h) {
			var canvas = document.createElement('canvas'), scale = 1, wOrg, hOrg;
			var ctx = canvas.getContext('2d'), max = 800;
			if (w) {
				wOrg = w;
				hOrg = h;
			} else {
				x = 0;
				y = 0;
				wOrg = image.naturalWidth;
				hOrg = image.naturalHeight;
				w = wOrg;
				h = hOrg;
			}
			if (w > h)
				scale = max / h;
			else
				scale = max / w;
			w = scale * w;
			h = scale * h;
			if (w > max) {
				wOrg = max / scale;
				w = max;
			} else if (h > max) {
				hOrg = max / scale;
				h = max;
			}
			canvas.width = max;
			canvas.height = max;
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(image, x, y, wOrg, hOrg, 0, 0, w, h);
			return { data: canvas.toDataURL('image/jpeg', 0.8), width: parseInt(w + 0.5), height: parseInt(h + 0.5) };
		},
		svgInject(img) {
			communication.ajax({
				url: img.src,
				success(r) {
					var parser = new DOMParser();
					var xmlDoc = parser.parseFromString(r, "text/xml");
					var svg = xmlDoc.getElementsByTagName('svg')[0];
					img.parentNode.replaceChild(svg, img);
				}
			});
		},
		zoom(event, delta) {
			var e = event.target;
			if (e.nodeName != 'IMG') {
				e = e.parentNode;
				for (var i = 0; i < e.children.length; i++)
					if (e.children[i].nodeName == 'IMG') {
						e = e.children[i];
						break;
					}
			}
			if (e && e.nodeName == 'IMG' && e.getAttribute('name') && e.getAttribute('name').indexOf('Preview') > 0) {
				var style = ('' + ui.cssValue(e, 'max-width')).indexOf('%') > 0 ? 'max-width' : 'max-height';
				var windowSize = style == 'max-width' ? e.parentNode.clientWidth : e.parentNode.clientHeight;
				var imageSize = style == 'max-width' ? e.naturalWidth : e.naturalHeight;
				var zoom = parseFloat(ui.cssValue(e, style)) - delta;
				if (zoom < 100)
					zoom = 100;
				else if (zoom / 100 * windowSize > imageSize)
					zoom = imageSize / windowSize * 100;
				zoom = parseInt(zoom);
				if (zoom == parseInt(ui.cssValue(e, style)))
					return;
				ui.css(e, style, zoom + '%');
				var x = parseInt(ui.cssValue(e, 'margin-left')) + e.clientWidth * delta / 200;
				if (x + e.clientWidth < e.parentNode.clientWidth)
					x = e.parentNode.clientWidth - e.clientWidth;
				else if (x > 0)
					x = 0;
				var y = parseInt(ui.cssValue(e, 'margin-top')) + e.clientHeight * delta / 200;
				if (y + e.clientHeight < e.parentNode.clientHeight)
					y = e.parentNode.clientHeight - e.clientHeight;
				else if (y > 0)
					y = 0;
				ui.css(e, 'margin-left', x);
				ui.css(e, 'margin-top', y);
			}
		}
	}
	static initFields(id) {
		var f = function () { document.body.scrollTop = 0; };
		var e = ui.qa(id + ' textarea');
		for (var i = 0; i < e.length; i++)
			e[i].onfocus = f;
		e = ui.qa(id + ' input');
		for (var i = 0; i < e.length; i++) {
			e[i].onfocus = function () { document.body.scrollTop = 0; }
			ui.on(e, 'keypress', formFunc.pressDefaultButton);
			if ((e[i].type === 'checkbox' || e[i].type === 'radio') && (!e[i].nextSibling || e[i].nextSibling.nodeName.toLowerCase() !== 'label'))
				e[i].outerHTML = e[i].outerHTML + '<label onclick="formFunc.toggleCheckbox(event)"' + (e[i].attributes['style'] ? ' style="' + e[i].attributes['style'].value + '"' : '') + (e[i].attributes['class'] ? ' class="' + e[i].attributes['class'].value + '"' : '') + '>' + e[i].attributes['label'].value + '</label>';
			else if (e[i].type === 'text' && e[i].getAttribute('choices')) {
				var a = eval('formFunc.inputHelper.get' + e[i].getAttribute('choices') + '();');
				var id2 = 'inputHelper' + e[i].id;
				var s = '';
				for (var i2 = 0; i2 < a.length; i2++)
					s += '<input type="radio"' + (e[i].attributes['class'] ? ' class="' + e[i].attributes['class'].value + '"' : '') + ' label="' + a[i2] + '" name="' + id2 + '" transient="true" style="background:none;" onclick="pageSettings.setChoicesSelection(&quot;' + e[i].id + '&quot;,&quot;' + a[i2] + '&quot;)"/>';
				var e2 = document.createElement('div');
				e2.style = (e[i].style.display === 'none' ? 'display:none;' : '') + 'margin-top:0.5em;';
				e2.id = id2;
				e2.innerHTML = s;
				e[i].parentNode.insertBefore(e2, e[i].nextSibling);
				formFunc.initFields('#' + id2);
				ui.on(e, 'focus', function (e) {
					ui.css('#' + id2, 'display', '');
				});
			} else if (e[i].type === 'text' && (e[i].getAttribute('multiple') || e[i].getAttribute('single'))) {
				var at = e[i].getAttribute('multiple') ? 'multiple' : 'single';
				var id2 = 'inputHelper' + e[i].id;
				if (!ui.q('#' + id2)) {
					var a = eval('formFunc.inputHelper.get' + e[i].getAttribute(at) + '();');
					if (a) {
						var a2 = [];
						for (var i2 = 0; i2 < a.length; i2++) {
							if (a[i2])
								a2.push(a[i2] + ',' + i2);
						}
						if (e[i].getAttribute('sort') != 'false')
							a2.sort();
						var s = '', v = e[i].value, v2 = ',';
						v = v.split(',');
						for (var i2 = 0; i2 < v.length; i2++)
							v2 += parseInt(v[i2], 10) + ',';
						var p;
						at = at === 'multiple' ? 'checkbox' : 'radio';
						for (var i2 = 0; i2 < a2.length; i2++) {
							p = a2[i2].lastIndexOf(',');
							s += '<input type="' + at + '" value="' + a2[i2].substring(p + 1) + '" label="' + a2[i2].substring(0, p) + '" name="' + id2 + '" transient="true"' + (v2.indexOf(a2[i2].substring(p) + ',') > -1 ? ' checked' : '') + (e[i].getAttribute('class') ? ' class="' + e[i].getAttribute('class') + '"' : '') + '/>';
						}
						var e2 = document.createElement('div');
						e2.setAttribute('class', 'multiple');
						e2.id = id2;
						e2.innerHTML = s;
						e[i].parentNode.insertBefore(e2, e[i].nextSibling);
						formFunc.initFields('#' + id2);
					}
					e[i].style.display = 'none';
				}
			} else if (e[i].type === 'text' && e[i].getAttribute('multiplePopup')) {
				if (e[i].nextElementSibling && e[i].nextElementSibling.nodeName == 'DIV')
					e[i].nextElementSibling.outerHTML = '';
				if (!e[i].id)
					e[i].id = new Date().getTime() + '.' + Math.random();
				var a = eval('formFunc.inputHelper.get' + e[i].getAttribute('multiplePopup') + '();');
				var a2 = [];
				if (a) {
					for (var i2 = 0; i2 < a.length; i2++)
						a2.push(a[i2] + ',' + i2);
				}
				a2.sort();
				var s = '', v = e[i].value, v2 = ',';
				v = v.split(',');
				for (var i2 = 0; i2 < v.length; i2++)
					v2 += parseInt(v[i2], 10) + ',';
				var p;
				for (var i2 = 0; i2 < a2.length; i2++) {
					p = a2[i2].lastIndexOf(',');
					if (v2.indexOf(a2[i2].substring(p) + ',') > -1)
						s += '<label class="multipleLabel">' + a2[i2].substring(0, p) + '</label>';
				}
				a2 = e[i].getAttribute('valueEx');
				if (a2) {
					a2 = a2.split(',');
					for (var i2 = 0; i2 < a2.length; i2++) {
						if (a2[i2].trim().length > 0)
							s += '<label class="multipleLabel">' + a2[i2].trim() + '</label>';
					}
				}
				var e2 = document.createElement('div');
				e2.setAttribute('onclick', 'formFunc.openChoices("' + e[i].id + '"' + (e[i].getAttribute('saveAction') ? ',"' + e[i].getAttribute('saveAction') + '"' : '') + ')');
				e2.innerHTML = s;
				e[i].parentNode.insertBefore(e2, e[i].nextSibling);
				e[i].style.display = 'none';
			} else if (e[i].type == 'text' && e[i].getAttribute('slider') && !ui.q('#' + e[i].id + '_left')) {
				var idSlider = e[i].id;
				var s = '';
				var max = e[i].getAttribute('max'), min = e[i].getAttribute('min');
				var v1 = e[i].value, v2 = 100;
				if (v1) {
					var delta = 100.0 / (max - min);
					v1 = v1.split(',');
					v2 = Number(v1[1]);
					v1 = Number(v1[0]);
					if (!v2 || v2 >= max || v2 <= v1 || v2 <= min)
						v2 = 100;
					else
						v2 = (v2 - min) * delta;
					if (!v1 || v1 >= max || v1 >= v2 && e[i].getAttribute('slider') == 'range' || v1 <= min)
						v1 = 0;
					else
						v1 = (v1 - min) * delta;
				} else
					v1 = 0;
				if (e[i].getAttribute('slider') == 'range')
					s += '<thumb style="left:' + v1 + '%;" id="' + idSlider + '_left"><span style="right:0;"><val></val>' + ui.l('slider.from') + '</span></thumb><thumb style="left:' + v2 + '%;margin-left:-1.35em;" id="' + idSlider + '_right"><span><val></val>' + ui.l('slider.until') + '</span></thumb>';
				else
					s += '<thumb style="left:' + v1 + '%;" id="' + idSlider + '_left"><span style="right:0;"><val></val>' + (ui.l(e[i].getAttribute('label')) ? ui.l(e[i].getAttribute('label')) : e[i].getAttribute('label')) + '</span></thumb>';
				var e2 = document.createElement('slider');
				e2.innerHTML = s;
				e[i].parentNode.insertBefore(e2, e[i].nextSibling);
				e[i].style.display = 'none';
				formFunc.initSliderDrag(ui.q('#' + idSlider + '_left'));
				formFunc.initSliderDrag(ui.q('#' + idSlider + '_right'));
			} else if (e[i].type == 'file') {
				if (!e[i].previousElementSibling) {
					if (!e[i].getAttribute('onchange'))
						e[i].setAttribute('onchange', 'formFunc.image.preview(this);');
					var s = '';
					if (!global.isBrowser()) {
						e[i].setAttribute('style', 'display:none;');
						var s2 = e[i].getAttribute('name');
						s = '<div name="' + s2 + '_appInput" class="appInput"><buttontext class="bgColor" onclick="formFunc.image.cameraPicture(&quot;' + s2 + '&quot;,true)">' + ui.l('camera.shoot') + '</buttontext>' +
							'<buttontext class="bgColor" onclick="formFunc.image.cameraPicture(&quot;' + s2 + '&quot;)">' + ui.l('camera.select') + '</buttontext></div>';
					}
					e[i].outerHTML = s + '<inputFile name="' + e[i].getAttribute('name') + '_disp" ' + (e[i].getAttribute('class') ? 'class="' + e[i].getAttribute('class') + '" ' : '') + (global.isBrowser() ? '' : ' style="display:none;"') + '><span>' + (e[i].getAttribute('hint') ? e[i].getAttribute('hint') : ui.l('fileUpload.select')) + '</span></inputFile>' + e[i].outerHTML;
				}
			}
		}
		ui.addFastButton(id);
	}
	static initSliderDrag(o) {
		if (o) {
			var tmp = new DragObject(o);
			formFunc.updateSlider(o.id);
			tmp.ondrag = function (e) {
				var id = '#' + this.obj.id.substring(0, this.obj.id.lastIndexOf('_'));
				var slider = ui.q(id).nextElementSibling;
				var thumbLeft = ui.q(id + '_left');
				var thumbRight = ui.q(id + '_right');
				var x = ui.getEvtPos(e, true) - slider.getBoundingClientRect().x;
				if (thumbLeft.id == this.obj.id) {
					if (x > thumbRight.offsetLeft)
						x = thumbRight.offsetLeft;
				} else if (x < thumbLeft.offsetLeft + thumbLeft.offsetWidth)
					x = thumbLeft.offsetLeft + thumbLeft.offsetWidth;
				if (x > slider.offsetWidth)
					x = slider.offsetWidth;
				else if (x < 0)
					x = 0;
				if (x != this.getPos().x) {
					this.obj.style.left = (x / slider.offsetWidth * 100) + '%';
					formFunc.updateSlider(this.obj.id);
				}
			};
			tmp.ondrop = function (e) {
				this.obj.style.left = formFunc.updateSlider(this.obj.id) + '%';
			};
		}
	}
	static inputHelper = {
		getAttributes() {
			return ui.attributes;
		},
		getAttributes0() {
			return ui.categories[0].subCategories;
		},
		getAttributes1() {
			return ui.categories[1].subCategories;
		},
		getAttributes2() {
			return ui.categories[2].subCategories;
		},
		getAttributes3() {
			return ui.categories[3].subCategories;
		},
		getAttributes4() {
			return ui.categories[4].subCategories;
		},
		getAttributes5() {
			return ui.categories[5].subCategories;
		},
		getMessages() {
			return pageWhatToDo.wtd.getMessages();
		},
		getSubCategories0() {
			return ui.categories[0].subCategories;
		},
		getSubCategories1() {
			return ui.categories[1].subCategories;
		},
		getSubCategories2() {
			return ui.categories[2].subCategories;
		},
		getSubCategories3() {
			return ui.categories[3].subCategories;
		},
		getSubCategories4() {
			return ui.categories[4].subCategories;
		},
		getSubCategories5() {
			return ui.categories[5].subCategories;
		}
	}
	static openChoices(id, exec) {
		var e = ui.q('#' + id);
		var v = e.getAttribute('valueEx');
		ui.navigation.openPopup(e.parentNode.parentNode.children[0].innerText.trim(), '<input id="' + id + 'HelperPopup" type="text" multiple="' + e.getAttribute('multiplePopup') + '" value="' + e.value + '"/>' + (v == null ? '<br/>' : '<input type="text" id="' + id + 'HelperPopupEx" value="' + v + '" placeholder="' + ui.l('contacts.blockReason100') + '" style="margin-bottom:0.5em;"' + (e.getAttribute('maxEx') ? ' maxlength="' + e.getAttribute('maxEx') + '"' : '') + '/>') + '<buttontext onclick="formFunc.setChoices(&quot;' + id + '&quot;' + (exec ? ',' + exec : '') + ')" class="bgColor">' + ui.l('ready') + '</buttontext><popupHint></popupHint>');
		formFunc.initFields('popup');
	}
	static pressDefaultButton(event) {
		if (event.keyCode === 13) {
			var e = ui.q('#defaultButton');
			if (e)
				e.click();
		}
	}
	static removeDraft(key) {
		var d = {};
		for (var k in user.contact.storage) {
			if (k != key)
				d[k] = user.contact.storage[k];
		}
		user.contact.storage = d;
		user.save({ values: { storage: JSON.stringify(user.contact.storage) } });
	}
	static resetError(e) {
		if (e) {
			ui.classRemove(e, 'dialogFieldError');
			e = e.parentNode;
			for (var i = 0; i < e.children.length; i++) {
				if (e.children[i].nodeName == 'ERRORHINT')
					e.children[i].outerHTML = '';
			}
		}
	}
	static saveDraft(key, value) {
		if (value) {
			user.contact.storage[key] = value;
			user.save({ values: { storage: JSON.stringify(user.contact.storage) } });
		} else
			formFunc.removeDraft(key);
	}
	static setChoices(id, exec) {
		var e = ui.q('#' + id);
		var e2 = ui.qa('#inputHelper' + id + 'HelperPopup > input:checked');
		if (e.getAttribute('max') && e2.length > e.getAttribute('max')) {
			ui.q('popupHint').innerHTML = ui.l('multipleValus.tooMany').replace('{0}', e.getAttribute('max')).replace('{1}', e2.length);
			return;
		}
		var s2 = '';
		for (var i = 0; i < e2.length; i++)
			s2 += ',' + e2[i].value;
		if (s2.length > 0)
			s2 = s2.substring(1);
		e.value = s2;
		ui.attr(e, 'valueEx', ui.q('#' + id + 'HelperPopupEx').value);
		e2 = e.parentNode;
		var removeID = false;
		if (!e2.id) {
			e2.id = e.id + '_parent';
			removeID = true;
		}
		formFunc.initFields('#' + e2.getAttribute('id'));
		if (removeID)
			ui.attr(e2, 'id', null);
		if (exec)
			exec.call();
		ui.navigation.hidePopup();
	}
	static setError(e, t, v) {
		if (e) {
			ui.classAdd(e, 'dialogFieldError');
			var e2 = e.parentNode;
			for (var i = 0; i < e2.children.length; i++) {
				if (e2.children[i].nodeName == 'ERRORHINT')
					ui.html(e2.children[i], '');
			}
			if (t) {
				var s = ui.l(t);
				if (v) {
					for (var i = 0; i < v.length; i++)
						s = s.replace('{' + i + '}', v[i]);
				}
				var error = document.createElement('errorHint');
				error.innerHTML = s;
				e2.append(error);
			}
			e2 = e2.parentNode;
			while (e2.nodeName == 'FIELD')
				e2 = e2.parentNode;
			if (e2)
				return e2.offsetTop;
			return 0;
		}
		return -1;
	}
	static toggleCheckbox(event) {
		var e = ui.parents(event.target, 'label');
		e = e.previousElementSibling;
		var resetType = false;
		if (e.getAttribute('type') == 'radio' && e.checked == true) {
			if (e.getAttribute('deselect') != 'true')
				return;
			resetType = true;
			ui.attr(e, 'type', 'checkbox');
		}
		e.click();
		if (resetType)
			ui.attr(e, 'type', 'radio');
		if (e.getAttribute('name') && e.getAttribute('name').indexOf('inputHelper') == 0) {
			var e2 = ui.q('#' + e.getAttribute('name').substring(11));
			if (ui.cssValue(e2, 'display') == 'none') {
				e = ui.qa('input[name="' + e.getAttribute('name') + '"]:checked');
				var s = '';
				for (var i = 0; i < e.length; i++)
					s += ',' + e[i].value;
				if (s.length > 0)
					s = s.substring(1);
				e2.value = s;
			}
		}
	}
	static updateSlider(id) {
		var t = ui.q('#' + id.substring(0, id.lastIndexOf('_')));
		var s = t.value;
		var x = parseInt(0.5 + parseFloat(ui.q('#' + id).style.left));
		var v = parseInt(0.5 + parseFloat(t.getAttribute('min')) + x * (parseFloat(t.getAttribute('max')) - parseFloat(t.getAttribute('min'))) / 100);
		if (s && s.indexOf(',') > -1) {
			s = s.split(',');
			s = id.indexOf('_right') > 0 ? s[0] + ',' + v : v + ',' + s[1];
		} else if (t.getAttribute('slider') == 'range')
			s = id.indexOf('_right') > 0 ? t.getAttribute('min') + ',' + v : v + ',' + t.getAttribute('max');
		else
			s = v;
		ui.html('#' + id + ' val', v);
		t.value = s;
		if (t.getAttribute('callback'))
			eval(t.getAttribute('callback'));
		return x;
	}
	static validation = {
		badWords: ' anal | anus | arsch| ass |bdsm|blowjob| boob|bukkake|bumse|busen| cock | cum |cunnilingus|dildo|ejacul|ejakul|erection|erektion|faschis|fascis|fick|fuck|goebbels|göring|hakenkreuz|himmler|hitler|hure| möse |nazi|neger|nsdap|nutte|orgasm|penis|porn|pussy|queer|schwanz| sex |sucker|tits|titten|vagina|vibrator|vögeln|whore|wigger|wixer'.split('|'),
		badWordsReplacement: null,

		birthday(s) {
			formFunc.resetError(s);
			if (s.value.trim().length > 0) {
				try {
					var n = new Date(), d = global.date.getDate(s.value);
					var a = n.getFullYear() - d.getFullYear();
					if (n.getMonth() < d.getMonth() || (n.getMonth() == d.getMonth() && n.getDate() < d.getDate()))
						a--;
					var min = 18, max = 100;
					if (a < min || a > max) {
						var ex;
						if (a < 0)
							ex = 'NotBorn';
						else if (a < min)
							ex = 'TooYoung';
						else if (a > 110)
							ex = 'TooOld2';
						else
							ex = 'TooOld';
						formFunc.setError(s, 'settings.bday' + ex, [a < min ? min : max, a]);
					}
				} catch (e) {
					formFunc.setError(s, 'validation.wrong');
				}
			}
		},
		email(s) {
			if (s) {
				var f = s.value.indexOf('@');
				var l = s.value.lastIndexOf('@');
				var ld = s.value.lastIndexOf('.');
				if (f != l || l > ld || l < 1 || ld < 3 || (s.value.length - ld) < 3) {
					formFunc.setError(s, 'settings.noEmail');
					return 1;
				}
				formFunc.resetError(s);
			}
			return -1;
		},
		filterWords(e) {
			var s = e.value;
			if (s) {
				s = ' ' + s + ' ';
				if (!formFunc.validation.badWordsReplacement) {
					formFunc.validation.badWordsReplacement = [];
					for (var i = 0; i < formFunc.validation.badWords.length; i++) {
						var s2 = '';
						for (var i2 = 0; i2 < formFunc.validation.badWords[i].length; i2++)
							s2 += formFunc.validation.badWords[i].charAt(i2) == ' ' ? ' ' : '*';
						formFunc.validation.badWordsReplacement.push(s2);
					}
				}
				for (var i = 0; i < formFunc.validation.badWords.length; i++)
					s = s.replace(new RegExp(formFunc.validation.badWords[i], 'ig'), formFunc.validation.badWordsReplacement[i]);
			}
			if (!s || s == ' ' + e.value + ' ')
				formFunc.resetError(e);
			else {
				e.value = s.substring(1, s.length - 1);
				formFunc.setError(e, 'filter.offensiveWords');
			}
		},
		pseudonym(e) {
			formFunc.resetError(e);
			var s = communication.login.getRealPseudonym(e.value);
			if (s.length < 8)
				formFunc.setError(e, 'register.errorPseudonym');
			else if (s.match(communication.login.regexPW))
				formFunc.setError(e, 'register.errorPseudonymSyntax');
			else
				formFunc.validation.filterWords(e);
		},
		url(s) {
			if (!s)
				return -1;
			var f = s.value.indexOf('://');
			var l = s.value.lastIndexOf('.');
			if (f < 3 || l < 10 || l < f)
				formFunc.setError(s, 'error.url');
			else
				formFunc.resetError(s);
		}
	}
};