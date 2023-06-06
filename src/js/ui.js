import { communication } from './communication';
import { details } from './details';
import { geoData } from './geoData';
import { global } from './global';
import { intro } from './intro';
import { pageChat } from './pageChat';
import { pageInfo } from './pageInfo';
import { pageLocation } from './pageLocation';
import { pageLogin } from './pageLogin';
import { pageContact } from './pageContact';
import { pageSettings } from './pageSettings';
import { user } from './user';
import { pageHome } from './pageHome';
import { lists } from './lists';
import { pageEvent } from './pageEvent';
import { pageSearch } from './pageSearch';

export { ui, formFunc };

class ui {
	static attributes = [];
	static categories = [];
	static emInPX = 0;
	static labels = [];
	static templateMenuEvents = () =>
		global.template`<container>
	<a style="display:none;">
		${ui.l('search.title')}
	</a><a onclick="ui.query.eventTickets()">
		${ui.l('events.myTickets')}
	</a><a onclick="ui.query.eventMy()">
		${ui.l('events.myEvents')}
	</a><a onclick="pageEvent.edit()">
		${ui.l('events.new')}
	</a>
</container>`;
	static templateMenuContacts = () =>
		global.template`<container>
    <a style="display:none;">
			${ui.l('search.title')}
    </a><a onclick="ui.query.contactFriends()">
		${ui.l('contacts.friendshipTitle')}
    </a><a onclick="ui.query.contactVisitees()">
		${ui.l('title.history')}
	</a><a onclick="ui.query.contactVisits()">
		${ui.l('title.visits')}
	</a>
</container>`;
	static adjustTextarea(e) {
		if (e && e.nodeName == 'TEXTAREA') {
			e.style.setProperty('height', '1px', 'important');
			var h = e.scrollHeight;
			if (h > ui.emInPX * 6)
				h = ui.emInPX * 6;
			h += 6;
			if (h < 2 * ui.emInPX)
				h = 2 * ui.emInPX;
			e.style.setProperty('height', h + 'px', 'important');
		}
	}
	static getSkills(compare, style) {
		var result = {
			skills: new Skills(),
			skillsText: new Skills(),
			categories: '',
			total: 0,
			totalMatch: 0,
			hint(contact) {
				var s = '<matchIndicatorHint><span><label class="multipleLabel highlightBackground">' + ui.l('contacts.matchIndicatorHintDescription1') + '</label></span></matchIndicatorHint>';
				s += '<matchIndicatorHint><span><label class="multipleLabel">' + ui.l('contacts.matchIndicatorHintDescription' + (contact ? 2 : 4)) + '</label></span></matchIndicatorHint>';
				s += '<matchIndicatorHint><span><label class="multipleLabel skillsFade">' + ui.l('contacts.matchIndicatorHintDescription3') + '</label></span></matchIndicatorHint>';
				return '<text class="popup matchIndicatorAttributesHint" style="display:none;" onclick="ui.toggleHeight(this)"><div>' + s + '</div></text>';
			},
			text() {
				var s = this.skills.toString(style);
				var s2 = this.skillsText.toString(style);
				if (s2)
					s += (s && style == 'list' ? ', ' : '') + s2;
				return s;
			}
		};
		var add2List = function (label, type, skill) {
			if (!label)
				return;
			var l = { label: label };
			if (type == 'fade')
				l.class = 'skillsFade';
			else if (type) {
				l.class = 'highlightBackground';
				result.totalMatch++;
			}
			skill.list.push(l);
		};
		var compareSkills, userSkills;
		userSkills = user.contact && user.contact.skills ? '|' + user.contact.skills + '|' : '';
		if (userSkills)
			result.total += userSkills.split('|').length - 2;
		if (compare.skills) {
			compareSkills = compare.skills.split('|');
			for (var i = 0; i < compareSkills.length; i++)
				add2List(InputHashtags.ids2Text(compareSkills[i]), userSkills.indexOf('|' + compareSkills[i] + '|') > -1, result.skills);
		}
		if (userSkills) {
			userSkills = userSkills.split('|');
			compareSkills = compare.skills ? '|' + compare.skills + '|' : '';
			for (var i = 0; i < userSkills.length; i++) {
				if (compareSkills.indexOf('|' + userSkills[i] + '|') < 0)
					add2List(InputHashtags.ids2Text(userSkills[i]), 'fade', result.skills);
			}
		}
		userSkills = user.contact && user.contact.skillsText ? '|' + user.contact.skillsText.toLowerCase() + '|' : '';
		if (userSkills)
			result.total += userSkills.split('|').length - 2;
		if (compare.skillsText) {
			compareSkills = compare.skillsText.toLowerCase().split('|');
			for (var i = 0; i < compareSkills.length; i++)
				add2List(compareSkills[i].trim(), userSkills.indexOf('|' + compareSkills[i].trim() + '|') > -1, result.skillsText);
		}
		if (userSkills) {
			userSkills = userSkills.split('|');
			compareSkills = compare.skillsText ? '|' + compare.skillsText.toLowerCase() + '|' : '';
			for (var i = 0; i < userSkills.length; i++) {
				if (compareSkills.indexOf('|' + userSkills[i] + '|') < 0)
					add2List(userSkills[i].trim(), 'fade', result.skillsText);
			}
		}
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
		lastPopup: null,

		animation(e, animation, exec) {
			if (typeof e == 'string')
				e = ui.q(e);
			if (ui.classContains(e, 'animated'))
				return;
			var s = 'popupSlideOut detailSlideOut detailBackSlideOut popupSlideIn detailSlideIn detailBackSlideIn slideUp slideDown';
			ui.classRemove(e, s);
			setTimeout(function () {
				ui.classAdd(e, animation);
				ui.classAdd(e, 'animated');
				ui.css(e, 'display', '');
				ui.on(e, ui.navigation.animationEvent, function () {
					ui.classRemove(e, 'animated ' + s);
					if (exec)
						exec.call();
				}, true);
			}, 100);
		},
		autoOpen(id, event) {
			if (!id)
				return false;
			if (event)
				event.stopPropagation();
			var f = function () {
				if (ui.q('#preloader'))
					setTimeout(f, 100);
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
					if (id.indexOf('chat=') != 0 && id.indexOf('m=') != 0) {
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
					ui.navigation.closePopup();
					if (idIntern.indexOf('l=') == 0)
						details.open(idIntern.substring(2), { webCall: 'ui.navigation.autoOpen(id,event)', query: 'location_list', search: encodeURIComponent('location.id=' + idIntern.substring(2)) }, pageLocation.detailLocationEvent);
					else if (idIntern.indexOf('e=') == 0)
						details.open(idIntern.substring(2), { webCall: 'ui.navigation.autoOpen(id,event)', query: 'event_list', search: encodeURIComponent('event.id=' + idIntern.substring(2, idIntern.indexOf('_') > 0 ? idIntern.indexOf('_') : idIntern.length)) }, pageLocation.detailLocationEvent);
					else if (idIntern.indexOf('f=') == 0)
						pageContact.sendRequestForFriendship(idIntern.substring(2));
					else if (idIntern.indexOf('q=') == 0)
						pageEvent.verifyParticipation(idIntern.substring(2));
					else if (idIntern.indexOf('=') == 1)
						details.open(idIntern.substring(2), { webCall: 'ui.navigation.autoOpen(id,event)', query: 'contact_list', search: encodeURIComponent('contact.id=' + idIntern.substring(2)) }, pageContact.detail);
				}
			};
			f.call();
		},
		fade(id, back, exec) {
			var newDiv = ui.q(id);
			var o = back ? 'detailBack' : 'detail';
			ui.classAdd(newDiv, o + 'SlideIn');
			ui.css(newDiv, 'display', 'block');
			ui.navigation.animation('content', o + 'SlideOut', function () {
				var e = ui.q('main');
				ui.css(e, 'overflow', '');
				e.scrollTop = 0;
				ui.css('content>.content:not(' + id + ')', 'display', 'none');
				ui.css('content>.content:not(' + id + ')', 'marginLeft', 0);
				ui.classRemove(newDiv, o + 'SlideIn');
				ui.css(newDiv, 'transform', '');
				if (id == 'home')
					ui.css('content>.content:not(home)', 'display', 'none');
				if (exec)
					exec.call();
			});
		},
		getActiveID() {
			var id;
			var e = ui.qa('content>[class*="SlideIn"]');
			if (!e || !e.length)
				e = ui.qa('content>.content:not([style*="none"])');
			if (e && e.length)
				id = e[e.length - 1].nodeName.toLowerCase();
			else
				id = 'home';
			if (id == 'home' && ui.cssValue(id, 'display') == 'none' && !ui.q('content.animated')) {
				ui.css('content>:not(home).content', 'display', 'none');
				ui.css(id, 'display', 'block');
			}
			return id;
		},
		goBack() {
			ui.navigation.goTo('home');
		},
		goTo(id, back) {
			if (ui.classContains('content', 'animated'))
				return;
			communication.notification.close();
			var currentID = ui.navigation.getActiveID();
			if (currentID == 'chat' && ui.q('content>chat:not([style*="none"])') && id != 'detail' && id != 'settings') {
				pageChat.close();
				return;
			}
			if (currentID == 'detail' && id == 'detail' && ui.qa('detail card').length > 1) {
				var e = ui.q('detail>div');
				ui.on(e, 'transitionend', function () {
					ui.css(e, 'transition', 'none');
					if (e.lastChild)
						e.lastChild.outerHTML = '';
					var x = e.clientWidth / ui.q('content').clientWidth;
					ui.css(e, 'width', x == 2 ? '' : ((x - 1) * 100) + '%');
					setTimeout(function () {
						ui.css(e, 'transition', null);
					}, 50);
				}, true);
				ui.css(e, 'margin-left', ((ui.qa('detail card').length - 2) * -100) + '%');
				return;
			}
			// AGBs opened from login, go back to login
			if (pageInfo.openSection == -2)
				pageInfo.openSection = -1;
			if (!user.contact && id != 'home' && id != 'info' && id != 'login' && id != 'detail') {
				intro.openHint({ desc: id, pos: '15%,-6em', size: '80%,auto', hinkyClass: 'bottom', hinky: 'right:' + (id == 'contacts' ? 9.375 : 40.625) + '%;' });
				return;
			}
			geoData.headingClear();
			if (document.activeElement)
				document.activeElement.blur();
			if (intro.currentStep < 0)
				intro.close();
			if (currentID == 'settings' && !pageSettings.save(id))
				return;
			if (!user.contact && currentID == 'login')
				pageLogin.saveDraft();
			if (id == 'settings' && pageSettings.init(function () { ui.navigation.goTo(id, back); }))
				return;
			if (id == 'info')
				pageInfo.init();
			else if (id == 'home')
				pageHome.init();
			else if (id == 'login')
				pageLogin.init();
			else if (id == 'contacts')
				pageContact.init();
			else if (id == 'search')
				pageSearch.init();
			else if (id == 'events')
				pageEvent.init();
			else if (id == 'chat')
				pageChat.init();
			pageChat.closeList();
			pageHome.closeList();
			ui.navigation.closePopup();
			if (currentID != id) {
				if (back == null) {
					var e = ui.q('navigation item.' + id);
					if (e) {
						var i1 = 0;
						while ((e = e.previousSibling) != null)
							i1++;
						e = ui.q('navigation item.' + currentID);
						if (e) {
							var i2 = 0;
							while ((e = e.previousSibling) != null)
								i2++;
							back = i2 > i1;
						}
					}
					if (back == null)
						back = currentID == 'detail' || currentID == 'login' || currentID == 'info' || currentID == 'settings';
				}
				if (back && currentID == 'detail') {
					e = ui.qa('detail card');
					if (e.length > 1) {
						ui.css('detail div', 'transition', 'none');
						for (var i = 0; i < e.length - 1; i++)
							e[i].outerHTML = '';
						e = ui.q('detail div');
						e.style.width = '100%';
						e.style.marginLeft = 0;
						setTimeout(function () {
							ui.css(e, 'transition', null);
							ui.navigation.goTo(id);
						}, 50);
						return;
					}
				}
				if (!back)
					ui.attr(id, 'from', currentID);
				lists.hideFilter();
				if (ui.q('locationPicker').style.display != 'none')
					ui.toggleHeight('locationPicker');
				ui.navigation.fade(id, back);
				ui.navigation.hideMenu();
				if (ui.q('navigation item.' + id)) {
					ui.classRemove('navigation item', 'active');
					ui.classAdd('navigation item.' + id, 'active');
				}
			}
		},
		closePopup() {
			ui.attr('popup', 'error');
			ui.attr('popup popupTitle', 'modal');
			var e = ui.q('popupTitle');
			if (!e || ui.cssValue('popup', 'display') != 'none' && e.getAttribute('modal') != 'true') {
				ui.navigation.animation(ui.q('popup'), 'popupSlideOut', ui.navigation.closePopupHard);
				ui.navigation.lastPopup = null;
				return true;
			}
			return false;
		},
		closePopupHard() {
			var e = ui.q('popup');
			ui.css(e, 'display', 'none');
			ui.html(e, '');
			ui.attr('popup', 'error');
			ui.attr('popup popupTitle', 'modal');
			ui.classRemove(e, 'animated popupSlideIn popupSlideOut');
		},
		hideMenu(exec) {
			if (ui.cssValue('menu', 'transform').indexOf('1') > 0)
				ui.navigation.toggleMenu();
			if (intro.currentStep < 0)
				intro.close();
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
			var p = ui.q('popup'), pt = ui.q('popupTitle'), visible = p.style.display != 'none';
			if (visible && pt && pt.getAttribute('modal') == 'true')
				return false;
			if (global.isBrowser() && location.href.indexOf('#') < 0)
				history.pushState(null, null, '#x');
			if (visible && ui.navigation.lastPopup == title + global.separatorTech + data)
				ui.navigation.closePopup();
			else if (data) {
				ui.navigation.lastPopup = title + global.separatorTech + data;
				data = '<popupContent><div>' + data + '</div></popupContent>';
				if (title)
					data = '<popupTitle' + (modal ? ' modal="true"' : '') + '><div>' + title + '</div></popupTitle>' + data;
				var f = function () {
					ui.navigation.setPopupContent(data, closeAction);
					ui.attr('popup', 'error', '');
					ui.navigation.animation(p, visible ? 'slideDown' : 'popupSlideIn');
					ui.css('popupContent', 'maxHeight', (ui.q('content').clientHeight - (title ? ui.q('popupTitle').clientHeight : 0) - 2 * ui.emInPX) + 'px');
					if (exec)
						exec.call();
				};
				intro.close();
				pageChat.closeList();
				communication.notification.close();
				if (!visible)
					f.call();
				else
					ui.navigation.animation(p, 'slideUp', f);
			} else
				ui.navigation.animation(p, 'popupSlideOut', ui.navigation.closePopupHard);
			return true;
		},
		openSwipeLeftUI(event) {
			var e = ui.parents(event.target, 'list-row');
			if (e)
				e.click();
		},
		selectTab(event) {
			var e = ui.parents(event.target, 'tab');
			ui.classRemove(e.parentNode.children, 'tabActive');
			ui.classAdd(e, 'tabActive');
			return e;
		},
		setPopupContent(s, closeAction) {
			var e = ui.q('popup');
			ui.css(e, 'display', 'none');
			ui.html(e, s);
			formFunc.initFields(ui.q('popup'));
			if (closeAction)
				e.setAttribute('close', closeAction);
			else
				e.removeAttribute('close');
		},
		toggleMenu(activeID) {
			if (!activeID)
				activeID = ui.navigation.getActiveID();
			setTimeout(function () {
				var e = ui.q('content>[class*="SlideIn"]');
				if (e && activeID.toLowerCase() != e.nodeName.toLowerCase())
					return;
				if (activeID == 'contacts')
					ui.html(ui.q('menu>div'), ui.templateMenuContacts());
				else if (activeID == 'events')
					ui.html(ui.q('menu>div'), ui.templateMenuEvents());
				e = ui.q('menu');
				e.setAttribute('type', activeID);
				ui.classAdd(ui.qa('menu a')[parseInt(ui.q(activeID).getAttribute('menuIndex'))], 'highlightMenu');
				ui.css(e, 'transform', e.style.transform.indexOf('1') > 0 ? 'scale(0)' : 'scale(1)')
			}, 10);
		}
	};
	static query = {
		contactFriends() {
			return lists.load({
				webCall: 'ui.query.contactFriends()',
				query: 'contact_list',
				distance: 100000,
				limit: 0,
				latitude: geoData.current.lat,
				longitude: geoData.current.lon,
				search: encodeURIComponent('contactLink.status=\'Friends\'')
			}, pageContact.listContacts, 'contacts', 'friends');
		},
		contactVisitees() {
			return lists.load({
				webCall: 'ui.query.contactVisitees()',
				query: 'contact_listVisit',
				distance: 100000,
				sort: false,
				latitude: geoData.current.lat,
				longitude: geoData.current.lon,
				search: encodeURIComponent('contactVisit.contactId2=contact.id and contactVisit.contactId=' + user.contact.id)
			}, pageContact.listContacts, 'contacts', 'visits');
		},
		contactVisits() {
			communication.ajax({
				url: global.serverApi + 'db/one',
				webCall: 'ui.query.contactVisits()',
				method: 'PUT',
				body: { classname: 'Contact', id: user.contact.id, values: { visitPage: global.date.local2server(new Date()) } }
			});
			return lists.load({
				webCall: 'ui.query.contactVisits()',
				query: 'contact_listVisit',
				distance: 100000,
				sort: false,
				latitude: geoData.current.lat,
				longitude: geoData.current.lon,
				search: encodeURIComponent('contactVisit.contactId=contact.id and contactVisit.contactId2=' + user.contact.id)
			}, pageContact.listContacts, 'contacts', 'profile');
		},
		eventMy() {
			pageEvent.loadEvents({
				webCall: 'ui.query.eventMy()',
				query: 'event_list',
				distance: 100000,
				latitude: geoData.current.lat,
				longitude: geoData.current.lon,
				search: encodeURIComponent('event.contactId=' + user.contact.id)
			});
		},
		eventTickets() {
			return lists.load({
				webCall: 'ui.query.eventTickets()',
				query: 'event_listParticipate',
				distance: 100000,
				latitude: geoData.current.lat,
				longitude: geoData.current.lon,
				search: encodeURIComponent('eventParticipate.contactId=' + user.contact.id + ' and event.contactId=contact.id')
			}, pageEvent.listTickets, 'events', 'eventsTicket');
		}
	}
	static l(id) {
		var s = ui.labels[id];
		if (!s && id.indexOf('.') > 0) {
			var i = id.split('.');
			if (ui.labels[i[0]])
				s = ui.labels[i[0]][i[1]];
		}
		if (!s) {
			communication.sendError('missing label: ' + id);
			return '';
		}
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
					e2.classList = (e2.classList.value + ' ' + valueSplit[i]).trim();
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
			if (document.defaultView && document.defaultView.getComputedStyle)
				value = document.defaultView.getComputedStyle(e2, '').getPropertyValue(css);
			else if (e2.currentStyle) {
				css = css.replace(/\-(\w)/g, function (m, p) {
					return p.toUpperCase();
				});
				value = e2.currentStyle[css];
			}
		});
		return value ? value : '';
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
	static parentsAny(e, nodeNames) {
		if (e && nodeNames) {
			nodeNames = nodeNames.toUpperCase().split(',');
			for (var i = 0; i < nodeNames.length; i++) {
				var e2 = e;
				while (e2 && e2.nodeName != nodeNames[i])
					e2 = e2.parentNode;
				if (e2)
					return e2;
			}
		}
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
		ui.on(e, 'touchstart', function (event) {
			if (!ui.parentsAny(event.target, exclude)) {
				e.startX = event.changedTouches[0].pageX;
				e.startY = event.changedTouches[0].pageY;
				e.startTime = new Date().getTime();
			}
		});
		ui.on(e, 'touchend', function (event) {
			if (!ui.parentsAny(event.target, exclude)) {
				var distX = event.changedTouches[0].pageX - e.startX;
				var distY = event.changedTouches[0].pageY - e.startY;
				var elapsedTime = new Date().getTime() - e.startTime;
				var swipedir = 'none', threshold = 100, restraint = 2000, allowedTime = 1000;
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
			e = ui.qa(e);
		var f = function (e) {
			if (!e || e.getAttribute('toggle') && new Date().getTime() - e.getAttribute('toggle') < 450)
				return;
			e.setAttribute('toggle', new Date().getTime());
			if (!e.getAttribute('h')) {
				var p = e.style.position;
				var d = e.style.display;
				e.style.visibility = 'hidden';
				e.style.display = 'block';
				e.style.height = '';
				e.style.position = 'absolute';
				e.setAttribute('h', e.offsetHeight);
				e.style.position = p;
				e.style.display = d;
				e.style.visibility = '';
			}
			var o = e.style.overflow;
			var t = e.style.transition;
			e.style.overflow = 'hidden';
			var expand = ui.cssValue(e, 'display') == 'none';
			e.style.height = (expand ? 0 : e.offsetHeight) + 'px';
			e.style.transition = 'height .4s ease-' + (expand ? 'in' : 'out');
			if (expand)
				e.style.display = 'block';
			setTimeout(function () {
				var h = parseInt(e.style.height);
				ui.on(e, 'transitionend', function () {
					e.style.overflow = o;
					e.style.transition = t;
					e.style.height = '';
					if (!expand) {
						e.style.display = 'none';
						e.setAttribute('h', h);
					}
					e.removeAttribute('toggle');
					if (exec)
						exec.call();
				}, true);
				e.style.height = expand ? e.getAttribute('h') + 'px' : 0;
			}, 10);
		}
		if (e.length)
			for (var i = 0; i < e.length; i++)
				f(e[i]);
		else
			f(e);
	}
	static val(id) {
		var e = ui.qa(id);
		if (e) {
			if (e.length == 1)
				return e[0].value
			var s = '';
			for (var i = 0; i < e.length; i++)
				s += global.separatorTech + e[i].value;
			return s.substring(1);
		}
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

class Skills {
	list = [];
	toString(style) {
		var s = '';
		this.list.sort(function (a, b) { return a.label > b.label ? 1 : -1 });
		for (var i = 0; i < this.list.length; i++) {
			if (style == 'list') {
				if (this.list[i].class == 'highlightBackground')
					s += ', ' + this.list[i].label;
			} else
				s += '<label class="multipleLabel' + (this.list[i].class ? ' ' + this.list[i].class : '') + '">' + this.list[i].label + '</label>';
		}
		if (s) {
			if (style == 'list')
				return s.substring(2);
			return '<skills>' + s + '</skills>';
		}
		return '';
	}
}

class formFunc {
	static dist = 0;

	static getForm(id) {
		var d = { values: {} }, cb = {};
		var e = ui.qa(id + ' textarea:not([transient="true"])');
		for (var i = 0; i < e.length; i++) {
			if (e[i].name)
				d.values[e[i].name] = e[i].value.replace(/\"/g, '&quot;').replace(/</g, '&lt;');
		}
		e = ui.qa(id + ' select:not([transient="true"])');
		for (var i = 0; i < e.length; i++) {
			if (e[i].name)
				d.values[e[i].name] = e[i].value;
		}
		e = ui.qa(id + ' input:not([transient="true"])');
		for (var i = 0; i < e.length; i++) {
			if (e[i].type == 'datetime-local')
				d.values[e[i].name] = global.date.local2server(e[i].value);
			else if (e[i].name)
				d.values[e[i].name] = e[i].value.replace(/\"/g, '&quot;').replace(/</g, '&lt;');
		}
		e = ui.qa(id + ' input-checkbox:not([transient="true"])');
		for (var i = 0; i < e.length; i++) {
			if (e[i].getAttribute('type') == 'radio') {
				if (e[i].getAttribute('checked') == 'true')
					d.values[e[i].getAttribute('name')] = e[i].getAttribute('value');
			} else {
				if (!cb[e[i].getAttribute('name')])
					cb[e[i].getAttribute('name')] = '';
				if (e[i].getAttribute('checked') == 'true')
					cb[e[i].getAttribute('name')] += global.separatorTech + e[i].getAttribute('value');
				else if (e[i].getAttribute('value') == 'true')
					cb[e[i].getAttribute('name')] += global.separatorTech + false;
			}
		}
		for (var k in cb)
			d.values[k] = cb[k].length > 0 ? cb[k].substring(1) : '';
		e = ui.qa(id + ' input-slider:not([transient="true"])');
		for (var i = 0; i < e.length; i++)
			d.values[e[i].getAttribute('name')] = e[i].getAttribute('value');
		e = ui.qa(id + ' input-hashtags:not([transient="true"])');
		for (var i = 0; i < e.length; i++) {
			d.values[e[i].getAttribute('name')] = e[i].getAttribute('ids');
			d.values[e[i].getAttribute('name') + 'Text'] = e[i].getAttribute('text');
		}
		e = ui.qa(id + ' input-image:not([transient="true"])');
		for (var i = 0; i < e.length; i++) {
			if (e[i].getAttribute('value'))
				d.values[e[i].getAttribute('name')] = e[i].getAttribute('value');
		}
		return d;
	}
	static svg = {
		data: {},
		fetch(id) {
			if (!formFunc.svg.data[id]) {
				formFunc.svg.data[id] = 1;
				communication.ajax({
					url: global.server + 'images/' + id + '.svg',
					webCall: 'ui.svg.fetch(id)',
					success(r) {
						var parser = new DOMParser();
						var xmlDoc = parser.parseFromString(r, "text/xml");
						formFunc.svg.data[id] = xmlDoc.getElementsByTagName('svg')[0].outerHTML;
						formFunc.svg.replaceAll();
					}
				});
			}
		},
		get(id) {
			return formFunc.svg.data[id];
		},
		replaceAll() {
			var imgs = ui.qa('img[source]');
			if (imgs) {
				for (var i = 0; i < imgs.length; i++) {
					var id = imgs[i].getAttribute('source');
					if (formFunc.svg.data[id]) {
						if (formFunc.svg.data[id] != 1) {
							var e = document.createElement('div');
							e.innerHTML = formFunc.svg.data[id];
							e.firstChild.onclick = imgs[i].onclick;
							imgs[i].parentNode.replaceChild(e.firstChild, imgs[i]);
						}
					} else
						formFunc.svg.fetch(id);
				}
			}
		}
	}
	static initFields(element) {
		var f = function () { document.body.scrollTop = 0; };
		var e = element.querySelectorAll('textarea');
		for (var i = 0; i < e.length; i++)
			e[i].onfocus = f;
		e = element.querySelectorAll('input');
		for (var i = 0; i < e.length; i++)
			ui.on(e, 'keypress', formFunc.pressDefaultButton);
	}
	static pressDefaultButton(event) {
		if (event.keyCode == 13) {
			var e = ui.parents(event.target, 'form');
			if (!e)
				e = ui.parents(event.target, 'popup');
			if (e)
				e = e.querySelector('.defaultButton');
			if (e)
				e.click();
		}
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
				error.classList.add('highlightColor');
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
	static validation = {
		badWords: [],
		badWordsReplacement: [],

		birthday(e) {
			formFunc.resetError(e);
			if (e.value.trim().length > 0) {
				try {
					var n = new Date(), d = global.date.getDateFields(e.value);
					var a = n.getFullYear() - d.year;
					if (n.getMonth() + 1 < d.month || (n.getMonth() + 1 == d.month && n.getDate() < d.day))
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
						formFunc.setError(e, 'settings.bday' + ex, [a < min ? min : max, a]);
					}
				} catch (e) {
					formFunc.setError(e, 'validation.wrong');
				}
			}
		},
		email(s) {
			if (s) {
				s.value = s.value.replace(/[^\p{L}\p{N}^\-_.@]/gu, '');
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
				if (formFunc.validation.badWords.length == 0) {
					var words = ' anal | anus | arsch| ass |bdsm|blowjob| boob|bukkake|bumse|busen| cock | cum |cunnilingus|dildo|ejacul|ejakul|erection|erektion|faschis|fascis|fick|fuck|goebbels|göring|hakenkreuz|himmler|hitler|hure| möse |nazi|neger|nsdap|nutte|orgasm|penis|porn|pussy|queer|schwanz| sex |sucker|tits|titten|vagina|vibrator|vögeln|whore|wigger|wixer'.split('|');
					for (var i = 0; i < words.length; i++) {
						var s2 = '', i3 = 0;
						for (var i2 = 0; i2 < words[i].length; i2++)
							s2 += words[i].charAt(i2) == ' ' ? '$' + ++i3 : '*';
						formFunc.validation.badWordsReplacement.push(s2);
						formFunc.validation.badWords.push(new RegExp(words[i].replace(/ /g, '([$£€.,;:_*&%#"\'!? -+)(}{\\][])'), 'ig'));
					}
				}
				for (var i = 0; i < formFunc.validation.badWords.length; i++)
					s = s.replace(formFunc.validation.badWords[i], formFunc.validation.badWordsReplacement[i]);
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
			var s = pageLogin.getRealPseudonym(e.value);
			if (s.length < 4)
				formFunc.setError(e, 'register.errorPseudonym');
			else if (s.match(pageLogin.regexPW))
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
}

class InputHashtags extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
		const style = document.createElement('style');
		style.textContent = `
hashtags {
	position: relative;
}

hashtags category {
	width: 30%;
	position: absolute;
	left: 0;
}

hashtags label {
	cursor: pointer;
	display: block;
	position: relative;
	padding: 0.25em 0.75em;
	text-align: left;
	overflow-x: hidden;
	text-overflow: ellipsis;
	border-radius: 1em;
	cursor: pointer;
}

hashtags>div {
	margin-left: 30%;
	display: none;
	overflow-y: auto;
	max-height: 17em;
}

hashtags label.selected {
	font-weight: bold;
}

hashtags category label.selected::after {
	content: '>';
	position: absolute;
	right: 0;
	top: 0.25em;
}

hashtagButton {
	font-size: 2em;
	position: absolute;
	right: 0;
	top: 0;
	padding: 0.2em;
	cursor: pointer;
	z-index: 1;
	color: black;
}

hashtagButton::before {
	content: '+';
}
settings field hashtags>div label,
search hashtags>div label {
	color: rgba(255, 255, 255, 0.4);
}

settings field hashtags>div label.selected,
search hashtags>div label.selected {
	color: white;
}`;
		this._root.appendChild(style);
		var element = document.createElement('hashtagButton');
		element.setAttribute('onclick', 'this.getRootNode().host.toggle(event)');
		this._root.appendChild(element);
		element = document.createElement('textarea');
		element.setAttribute('name', 'hashtagsDisp');
		element.setAttribute('part', 'textarea');
		element.setAttribute('maxlength', '250');
		element.setAttribute('transient', 'true');
		element.setAttribute('onkeyup', 'this.getRootNode().host.synchonizeTags(this.getRootNode())');
		element.setAttribute('style', 'height:2em;');
		element.textContent = InputHashtags.ids2Text(this.getAttribute('ids')) + (this.getAttribute('text') ? ' ' + this.getAttribute('text') : '').trim();
		this._root.appendChild(element);
		element = document.createElement('hashtags');
		element.setAttribute('style', 'display:none;');
		element.innerHTML = this.selection();
		this._root.appendChild(element);
		this.synchonizeTags(this._root);
		var r = this._root;
		setTimeout(function () { ui.adjustTextarea(r.querySelector('textarea')) }, 1000);
	}
	add(root, tag) {
		var e = root.querySelector('textarea');
		var s = e.value;
		if ((' ' + e.value + ' ').indexOf(' ' + tag + ' ') < 0)
			s += ' ' + tag;
		else
			s = s.replace(tag, '');
		while (s.indexOf('  ') > -1)
			s = s.replace('  ', ' ');
		e.value = s.trim();
		ui.adjustTextarea(e);
		this.synchonizeTags(root);
	}
	convert(hashtags) {
		var category = '';
		hashtags = hashtags.replace(/\n|\t|\r/g, ' ');
		for (var i = 0; i < ui.categories.length; i++) {
			for (var i2 = 0; i2 < ui.categories[i].values.length; i2++) {
				var t = ui.categories[i].values[i2].split('|');
				var i3 = hashtags.toLowerCase().indexOf(t[0].toLowerCase());
				if (i3 > -1) {
					category += '|' + i + '.' + t[1];
					hashtags = hashtags.substring(0, i3) + hashtags.substring(i3 + t[0].length);
				}
			}
		}
		if (category)
			category = category.substring(1);
		while (category.length > 255)
			category = category.substring(0, category.lastIndexOf('|'));
		hashtags = hashtags.trim();
		while (hashtags.indexOf('  ') > -1)
			hashtags = hashtags.replace('  ', ' ').trim();
		if (hashtags.length > 255)
			hashtags = hashtags.substring(0, 255);
		return { ids: category, text: hashtags.replace(/ /g, '|') };
	}
	static ids2Text(ids) {
		if (!ids)
			return '';
		var a = [];
		ids = ids.split('|');
		for (var i = 0; i < ids.length; i++) {
			var id = ids[i].split('\.');
			for (var i2 = 0; i2 < ui.categories[id[0]].values.length; i2++) {
				if (ui.categories[id[0]].values[i2].split('|')[1] == id[1]) {
					a.push(ui.categories[id[0]].values[i2].split('|')[0]);
					break;
				}
			}
		}
		a.sort(function (a, b) { return a.toLowerCase() > b.toLowerCase() ? 1 : -1 });
		return a.join(' ').trim();
	}
	selection() {
		var s = '<category>';
		for (var i = 0; i < ui.categories.length; i++)
			s += '<label ' + (i == 0 ? ' class="selected"' : '') + 'onclick="this.getRootNode().host.toggleSubCategories(this,' + i + ')">' + ui.categories[i].label + '</label>';
		s += '</category>';
		for (var i = 0; i < ui.categories.length; i++) {
			s += '<div' + (i == 0 ? ' style="display:block;"' : '') + '>';
			var subs = ui.categories[i].values.sort(function (a, b) { return a > b ? 1 : -1 });
			for (var i2 = 0; i2 < subs.length; i2++)
				s += '<label onclick="this.getRootNode().host.add(event.target.getRootNode(),&quot;' + subs[i2].split('|')[0] + '&quot;)">' + subs[i2].split('|')[0] + '</label>';
			s += '</div>';
		}
		return s;
	}
	synchonizeTags(root) {
		var textarea = root.querySelector('textarea');
		var tags = root.querySelector('hashtags').querySelectorAll('div>label');
		var s = textarea.value.toLowerCase();
		for (var i = 0; i < tags.length; i++)
			s.indexOf(tags[i].innerHTML.trim().toLowerCase()) < 0 ? ui.classRemove(tags[i], 'selected') : ui.classAdd(tags[i], 'selected');
		ui.adjustTextarea(textarea);
		var hts = this.convert(textarea.value);
		root.host.setAttribute('ids', hts.ids);
		root.host.setAttribute('text', hts.text);
	}
	toggle(event) {
		ui.toggleHeight(event.target.getRootNode().querySelector('hashtags'));
	}
	toggleSubCategories(e, i) {
		e = e.getRootNode().querySelector('hashtags');
		if (ui.classContains(e.querySelectorAll('category label')[i], 'selected'))
			return;
		var visibleBlock = e.querySelector('div[style*="block"]');
		ui.classRemove(e.querySelectorAll('category label.selected'), 'selected');
		ui.classAdd(e.querySelectorAll('category label')[i], 'selected');
		var a = e.querySelectorAll('div')[i];
		e.style.minHeight = '12em';
		var f = function () { ui.toggleHeight(a, function () { e.style.minHeight = null; }); };
		if (visibleBlock && visibleBlock != a)
			ui.toggleHeight(visibleBlock, f);
		else
			f.call();
	}
}
if (!customElements.get('input-hashtags'))
	customElements.define('input-hashtags', InputHashtags);

class InputCheckbox extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
		const style = document.createElement('style');
		style.textContent = `
label {
	cursor: pointer;
	display: inline-block;
	position: relative;
	text-align: left;
	width: auto;
	padding: 0.34em 1.25em;
	margin-left: 0.25em;
	margin-right: 0.25em;
	margin-bottom: 0.5em;
	left: -0.25em;
	color: black;
	background: rgba(255, 255, 255, 0.85);
	border-radius: 0.5em;
	transition: all .4s;
}
label>img {
	height: 3em;
	margin: -1em;
}
label:hover {
	color: black;
}
:host([checked="true"]) label {
	padding-left: 1.75em;
	padding-right: 0.75em;
	color: black;
}
:host([checked="true"]) label:before {
	position: absolute;
	content: '\\2713';
	left: 0.5em;
	opacity: 0.8;
}`;
		this._root.appendChild(style);
		this.setAttribute('onclick', 'this.toggleCheckbox(event)' + (this.getAttribute('onclick') ? ';' + this.getAttribute('onclick') : ''));
		var element = document.createElement('label');
		element.textContent = this.getAttribute('label');
		this._root.appendChild(element);
	}
	toggleCheckbox(event) {
		var e = event.target;
		if (e.getAttribute('type') == 'radio') {
			if (e.getAttribute('checked') == 'true' && e.getAttribute('deselect') != 'true')
				return;
			ui.attr('input-checkbox[name="' + e.getAttribute('name') + '"][type="radio"]', 'checked', 'false');
		}
		e.setAttribute('checked', e.getAttribute('checked') == 'true' ? 'false' : 'true');
	}
}
if (!customElements.get('input-checkbox'))
	customElements.define('input-checkbox', InputCheckbox);

class InputImage extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
		const style = document.createElement('style');
		style.textContent = `
inputFile {
	position: relative;
	min-height: 2em;
	text-align: left;
	width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	border-radius: 0.5em;
	background: rgba(255, 255, 255, 0.85);
	display: block;
	color: black;
}

inputFile>span {
	padding: 0.36em 0.75em;
	display: inline-block;
}

inputFile close {
	position: absolute;
	height: 2.5em;
	top: 0;
	right: 0;
	width: 4em;
	z-index: 2;
	text-align: right;
	padding: 0.5em 0.75em;
	color: white;
	text-shadow: 0 0 0.15em rgba(0, 0, 0, 0.8);
}

inputFile desc {
	position: absolute;
	color: white;
	text-align: center;
	width: 100%;
	left: 0;
	bottom: 0;
	text-shadow: 0 0 0.15em rgba(0, 0, 0, 0.8);
	pointer-events: none;
}

inputFile rotate {
	position: absolute;
	left: 0;
	text-align: left;
	font-size: 2em;
	width: 1.25em;
	height: 2em;
	padding: 0.25em;
	color: white;
	top: 0;
	z-index: 2;
	filter: drop-shadow(0 0 0.05em rgba(0, 0, 0, 0.8));
}

input {
	opacity: 0;
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	cursor: pointer;
}

input+img {
	position: absolute;
	top: 0;
	right: 0;
	height: 100%;
	border-radius: 0 0.5em 0.5em 0;
}`;
		this._root.appendChild(style);
		var s = '', s2 = this.getAttribute('name'), element;
		if (global.isBrowser()) {
			element = document.createElement('inputFile');
			element.innerHTML = '<span>' + (this.getAttribute('hint') ? this.getAttribute('hint') : ui.l('fileUpload.select')) + '</span>';
			this._root.appendChild(element);
			element = document.createElement('input');
			element.setAttribute('type', 'file');
			element.setAttribute('onchange', 'this.getRootNode().host.preview(this)');
			element.setAttribute('accept', '.gif, .png, .jpg');
			this._root.appendChild(element);
		} else {
			element = document.createElement('div');
			element.setAttribute('class', 'appInput');
			element.innerHTML = '<buttontext class="bgColor" onclick="this.getRootNode().host.cameraPicture(&quot;' + element.nodeName + '&quot;,&quot;' + s2 + '&quot;,true)" style="border-radius:0.5em 0 0 0.5em;border-right:solid 1px rgba(255,255,255,0.1);">' + ui.l('camera.shoot') + '</buttontext>' +
				'<buttontext class="bgColor" onclick="this.getRootNode().host.cameraPicture(&quot;' + element.nodeName + '&quot;,&quot;' + s2 + '&quot;)" style="border-radius:0 0.5em 0.5em 0;">' + ui.l('camera.select') + '</buttontext>';
			this._root.appendChild(element);
		}
		element = document.createElement('img');
		element.setAttribute('class', 'icon');
		if (this.getAttribute('src'))
			element.setAttribute('src', this.getAttribute('src'));
		this._root.appendChild(element);
		const t = this;
		ui.on(window, 'wheel', function (event) {
			if (event.ctrlKey)
				t.zoom(event.deltaY);
		});
	}
	zoomDist = 0;
	cameraError(e) {
		if (!e || e.toLowerCase().indexOf('select') < 0)
			ui.navigation.openPopup(ui.l('attention'), ui.l('camera.notAvailabe').replace('{0}', e));
	}
	cameraPicture(id, name, camera) {
		navigator.camera.getPicture(this.cameraSuccess, this.cameraError,
			{ sourceType: camera ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY, destinationType: Camera.DestinationType.FILE_URI });
	}
	cameraSuccess(e) {
		this._root.querySelector('div').style.display = 'none';
		this._root.querySelector('inputFile').style.display = 'block';
		var t = this;
		window.resolveLocalFileSystemURL(e,
			function (fe) {
				fe.file(function (f) {
					t.preview2(f);
				}, t.cameraError);
			}, t.cameraError);
	}
	dataURItoBlob(dataURI) {
		var arr = dataURI.split(','), mime = arr[0].match(/:(.*?);/)[1];
		arr[1] = atob(arr[1]);
		var ab = new ArrayBuffer(arr[1].length);
		var ia = new Uint8Array(ab);
		for (var i = 0; i < arr[1].length; i++)
			ia[i] = arr[1].charCodeAt(i);
		return new Blob([ab], { type: mime });
	}
	hasImage() {
		var x = this._root.querySelector('img.preview');
		return x && x.getAttribute('src') && x.getAttribute('src').length > 100;
	}
	preview(e) {
		this.preview2(e.files && e.files.length > 0 ? e.files[0] : null);
	}
	preview2(file) {
		if (file) {
			var ePrev = this._root.querySelector('inputFile');
			ui.css(ePrev, 'z-index', 6);
			this._root.querySelector('img.icon').style.display = 'none';

			ui.html(ePrev, `
<close onclick="this.getRootNode().host.remove()">X</close>
<rotate onclick="this.getRootNode().host.rotate(this)">&#8635;</rotate>
<img class="preview"/>
<desc></desc>`);
			var img = this._root.querySelector('img.preview');
			new DragObject(img).ondrag = function (event, delta) {
				if (parseInt(delta.y) != 0) {
					var y = parseInt(ui.cssValue(img, 'margin-top')) + delta.y;
					if (y < 1 && y > -(img.clientHeight - img.getRootNode().querySelector('inputFile').clientHeight)) {
						ui.css(img, 'margin-top', y + 'px');
						img.getRootNode().host.update(img.getAttribute('src'));
					}
				}
				if (parseInt(delta.x) != 0) {
					var x = parseInt(ui.cssValue(img, 'margin-left')) + delta.x;
					if (x < 1 && x > -(img.clientWidth - img.getRootNode().querySelector('inputFile').clientWidth)) {
						ui.css(img, 'margin-left', x + 'px');
						img.getRootNode().host.update(img.getAttribute('src'));
					}
				}
			};
			ui.on(img, 'touchmove', function (event) {
				var d = img.getRootNode().host.previewCalculateDistance(event);
				if (d) {
					var zoom = Math.sign(img.getRootNode().host.zoomDist - d) * 5;
					if (zoom > 0)
						zoom /= event.scale;
					else
						zoom *= event.scale;
					console.log(event.scale, event);
					img.getRootNode().host.zoom(zoom);
					img.getRootNode().host.zoomDist = d;
				}
			});
			ui.on(img, 'touchstart', function (event) {
				var d = img.getRootNode().host.previewCalculateDistance(event);
				if (d)
					img.getRootNode().host.zoomDist = d;
			});
			this.previewInternal(file);
			ui.css('#popupSendImage', 'display', '');
		} else
			this.remove();
	}
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
	}
	previewInternal(f) {
		var reader = new FileReader();
		var t = this;
		reader.onload = function (r) {
			var img = t._root.querySelector('img.preview');
			if (img) {
				var image = new Image();
				image.onload = function () {
					var whOrg = image.naturalWidth + ' x ' + image.naturalHeight;
					var scaled = t.scale(image);
					var size = t.dataURItoBlob(scaled.data).size, sizeOrg = f.size, s, s2 = '', s0 = '';
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
					var disp = t._root.querySelector('inputFile');
					disp.querySelector('desc').innerHTML = x + global.separator + whOrg + '<br/>' + ui.l('fileUpload.ratio') + ' ' + (100 - size / sizeOrg * 100).toFixed(0) + '%<br/>' + s0 + s + global.separator + s2 + '<imagePreviewSize>' + scaled.width + ' x ' + scaled.height + '</imagePreviewSize>';
					img.src = r.target.result;
					t.update(r.target.result);
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
				};
				image.src = r.target.result;
			}
		};
		reader.readAsDataURL(f);
	}
	remove() {
		var e = this._root.querySelector('input');
		if (e) {
			e.value = '';
			var inputFile = this._root.querySelector('inputFile');
			ui.html(inputFile, '<span>' + (e.getAttribute('hint') ? e.getAttribute('hint') : ui.l('fileUpload.select')) + '</span>');
			inputFile.style.zIndex = null;
			inputFile.style.height = null;
			this._root.querySelector('img.icon').style.display = '';
			ui.css('#popupSendImage', 'display', 'none');
			this.removeAttribute('value');
			if (!global.isBrowser()) {
				this._root.querySelector('div').style.display = 'block';
				inputFile.style.display = 'none';
			}
		}
	}
	rotate(img) {
		img = img.getRootNode().querySelector('img.preview');
		var canvas = document.createElement('canvas'), w = img.naturalWidth, h = img.naturalHeight;
		canvas.width = h;
		canvas.height = w;
		var ctx = canvas.getContext('2d');
		var image = new Image();
		image.src = img.src;
		var t = this;
		image.onload = function () {
			var wh = t._root.querySelector('imagePreviewSize').innerHTML.split('x');
			ctx.clearRect(0, 0, w, h);
			ctx.rotate(0.5 * Math.PI);
			ctx.translate(0, -h);
			ctx.drawImage(image, 0, 0, w, h);
			var b = canvas.toDataURL('image/jpeg', 1);;
			img.src = b;
			t.setAttribute('value', '.' + b.substring(b.indexOf('/') + 1, b.indexOf(';')) + global.separatorTech + b.substring(b.indexOf(',') + 1));
			t._root.querySelector('imagePreviewSize').innerHTML = wh[1].trim() + ' x ' + wh[0].trim();
		};
	}
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
	}
	update(src) {
		const t = this;
		clearTimeout(t.lastUpdate);
		t.lastUpdate = setTimeout(function () {
			var img = new Image();
			var i = t._root.querySelector('img.preview');
			img.src = src;
			var ratio;
			if (i.clientHeight > i.clientWidth)
				ratio = i.naturalWidth / i.clientWidth;
			else
				ratio = i.naturalHeight / i.clientHeight;
			var x = -i.offsetLeft * ratio;
			var y = -i.offsetTop * ratio;
			var w = Math.min(i.parentElement.clientWidth, i.clientWidth) * ratio;
			var h = Math.min(i.parentElement.clientHeight, i.clientHeight) * ratio;
			var b = t.scale(img, x, y, w, h).data;
			// b = data:image/jpeg;base64,/9j/4AAQS...
			t.setAttribute('value', '.' + b.substring(b.indexOf('/') + 1, b.indexOf(';')) + global.separatorTech + b.substring(b.indexOf(',') + 1));
		}, 500);
	}
	zoom(delta) {
		var e = this._root.querySelector('img.preview');
		if (!e)
			return;
		var style = ('' + ui.cssValue(e, 'max-width')).indexOf('%') > 0 ? 'max-width' : 'max-height';
		var windowSize = style == 'max-width' ? e.parentElement.clientWidth : e.parentElement.clientHeight;
		var imageSize = style == 'max-width' ? e.naturalWidth : e.naturalHeight;
		var zoom = parseFloat(ui.cssValue(e, style)) - delta;
		if (zoom < 100)
			zoom = 100;
		else if (zoom / 100 * windowSize > imageSize)
			zoom = imageSize / windowSize * 100;
		zoom = parseInt('' + zoom);
		console.log(style + ' - ' + windowSize + ' - ' + imageSize + ' - ' + delta + ' - ' + zoom);
		if (zoom == parseInt(ui.cssValue(e, style)))
			return;
		ui.css(e, style, zoom + '%');
		var x = parseInt(ui.cssValue(e, 'margin-left')) + e.clientWidth * delta / 200;
		if (x + e.clientWidth < e.parentElement.clientWidth)
			x = e.parentElement.clientWidth - e.clientWidth;
		else if (x > 0)
			x = 0;
		var y = parseInt(ui.cssValue(e, 'margin-top')) + e.clientHeight * delta / 200;
		if (y + e.clientHeight < e.parentElement.clientHeight)
			y = e.parentElement.clientHeight - e.clientHeight;
		else if (y > 0)
			y = 0;
		ui.css(e, 'margin-left', x);
		ui.css(e, 'margin-top', y);
	}
}
if (!customElements.get('input-image'))
	customElements.define('input-image', InputImage);

class InputSlider extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
		const style = document.createElement('style');
		style.textContent = `
* {
	transform: translate3d(0, 0, 0);
}
thumb {
	position: absolute;
	top: 0;
	height: 3.7em;
	width: 5em;
	margin-left: -3.65em;
	line-height: 1.8;
	display: inline-block;
}
thumb.right{
	margin-left: -1.35em;
}
thumb span {
	position: absolute;
	top: 0;
	height: 100%;
	width: 2.5em;
	color: black;
	text-align: center;
	border-radius: 0.75em;
	background: rgba(255, 255, 255, 0.85);
	cursor: ew-resize;
}
thumb val {
	display: block;
}`;
		this._root.appendChild(style);
		var v = this.getAttribute('value')?.split(',');
		if (!v)
			v = ['0', '100'];
		var min = parseFloat(this.getAttribute('min')), max = parseFloat(this.getAttribute('max'));
		var delta = 100.0 / (max - min);
		if (!v[1] || parseFloat(v[1]) >= max || v[1] <= v[0] || parseFloat(v[1]) <= min)
			v[1] = '100';
		else
			v[1] = '' + ((parseFloat(v[1]) - min) * delta);
		if (!v[0] || parseFloat(v[0]) >= max || v[0] >= v[1] && this.getAttribute('type') == 'range' || parseFloat(v[0]) <= min)
			v[0] = '0';
		else
			v[0] = '' + ((parseFloat(v[0]) - min) * delta);
		var element = document.createElement('thumb');
		element.style.left = v[0] + '%';
		if (this.getAttribute('type') == 'range') {
			element.innerHTML = `<span style="right:0;"><val></val>${ui.l('slider.from')}</span>`;
			this._root.appendChild(element);
			element = document.createElement('thumb');
			element.style.left = v[1] + '%';
			element.classList.add('right');
			element.innerHTML = `<span style="left:0;"><val></val>${ui.l('slider.until')}</span>`;
		} else
			element.innerHTML = `<span style="right:0;"><val></val>${ui.l(this.getAttribute('label')) ? ui.l(this.getAttribute('label')) : this.getAttribute('label')}</span>`;
		this._root.appendChild(element);
		this.initSliderDrag(this._root.querySelectorAll('thumb'));
	}
	initSliderDrag(o) {
		var thumbLeft = o[0];
		var thumbRight = o[1];
		var update = this.updateSlider;
		var init = function (e) {
			var tmp = new DragObject(e);
			update(e);
			tmp.ondrag = function (event) {
				var slider = event.target;
				if (slider.nodeName == 'INPUT-SLIDER') {
					var x = ui.getEvtPos(event, true) - slider.getBoundingClientRect().x;
					if (!this.obj.classList.contains('right')) {
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
						update(this.obj);
					}
				}
			};
			tmp.ondrop = function () {
				this.obj.style.left = update(this.obj) + '%';
			};
		}
		init(thumbLeft);
		if (thumbRight)
			init(thumbRight);
	}
	updateSlider(e) {
		var h = e.getRootNode().host;
		var min = parseFloat(h.getAttribute('min'));
		var max = parseFloat(h.getAttribute('max'));
		var x = parseInt('' + (0.5 + parseFloat(e.style.left)));
		var v = parseInt('' + (0.5 + min + x * (max - min) / 100));
		var s = h.getAttribute('value')?.split(',');
		if (!s && h.getAttribute('type') == 'range')
			s = ['', ''];
		if (e.getAttribute('class')?.indexOf('right') > -1)
			s[1] = '' + v;
		else
			s[0] = '' + v;
		e.querySelector('val').innerText = v;
		h.setAttribute('value', s.join(','));
		if (h.getAttribute('callback'))
			eval(h.getAttribute('callback'));
		return x;
	}
}
if (!customElements.get('input-slider'))
	customElements.define('input-slider', InputSlider);

class ListRow extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
		const style = document.createElement('style');
		style.textContent = `
div {
	text-align: left;
	overflow: hidden;
	cursor: pointer;
	background: rgba(0, 0, 0, 0.08);
	margin: 1em 0 0.5em 0;
	height: 6em;
	transition: all 0.4s ease-out;
}

text {
	max-height: 5.5em;
	overflow: hidden;
	left: 6em;
	right: 4em;
	width: auto;
	position: absolute;
	white-space: nowrap;
	text-overflow: ellipsis;
	display: inline-block;
	padding: 0.75em 0 0 0.5em;
}

text title {
	padding-right: 1em;
	position: relative;
    display: block;
}

flag {
	position: absolute;
	right: 0.5em;
	width: 3em;
	top: 1.75em;
	opacity: 0.6;
	text-align: center;
}

flag>* {
	display: block;
	width: 100%;
}

flag img {
	height: 1em;
}

imagelist {
	height: 6em;
	width: 6em;
	left: 0;
	top: 0;
	position: absolute;
	text-align: center;
	overflow: hidden;
	margin: 0.5em 0.5em 0.5em 0;
	border-radius: 0 3em 3em 0;
	box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.3);
}

imagelist img {
	height: 100%;
	max-width: 100%;
	box-sizing: border-box;
}

imagelist img.default {
	padding: 1em;
}

imagelist img.present {
	position: absolute;
	left: 0;
	height: 2.5em;
	border-radius: 0;
}

imagelist svg {
	position: absolute;
	left: 0.25em;
	bottom: 0.25em;
	width: 1.5em;
	display: none;
}

:host.favorite imagelist svg {
	display: inline;
}

badge.authenticated,
:host.participate badge {
	background: green;
}

badge.authenticated::after,
:host.participate badge::after {
	content: '✓';
}

:host.canceled badge {
	background: red;
}

:host.canceled badge::after {
	content: '✗';
}

compass {
	width: 100%;
	display: block;
	margin-top: -0.25em;
	position: absolute;
	line-height: 1.5;
	opacity: 0.6;
	height: 1.5em;
	text-align: center;
	font-size: 1.5em;
}

compass::after {
	content: '↑';
}`;
		this._root.appendChild(style);
		var element = document.createElement('badge');
		element.setAttribute('part', 'badge');
		element.setAttribute('class', this.getAttribute('badge') ? this.getAttribute('badge') : 'hidden');
		this._root.appendChild(element);
		element = document.createElement('div');
		element.innerHTML = global.template`
<text>
	<title>${decodeURIComponent(this.getAttribute('title'))}</title>
	${decodeURIComponent(this.getAttribute('text'))}
</text>
<flag>
	<km part="km">${this.getAttribute('flag1')}</km>
	<span>${this.getAttribute('flag2') ? this.getAttribute('flag2') : '&nbsp;'}</span>
	${decodeURIComponent(this.getAttribute('flag3'))}
</flag>
<imagelist>
	<img src="${this.getAttribute('image')}" class="${!this.getAttribute('image') || this.getAttribute('image').indexOf('.svg') > 0 ? 'default" part="mainBG' : ''}" />
	<img source="favorite" />
</imagelist>`;
		this._root.appendChild(element);
		this.removeAttribute('title');
		this.removeAttribute('text');
		this.removeAttribute('flag1');
		this.removeAttribute('flag2');
		this.removeAttribute('flag3');
		this.removeAttribute('image');
		this.removeAttribute('badge');
	}
}
if (!customElements.get('list-row'))
	customElements.define('list-row', ListRow);

class DragObject {
	constructor(o) {
		o.drag = this;
		this.obj = o;
		this.startPos = null;
		var md = function (e) {
			o.ownerDocument.drag = o.drag;
			o.drag.start(e);
			var mu = function () {
				o.ownerDocument.onmouseup = o.ownerDocument.onmousemove = o.ownerDocument.ontouchmove = o.ownerDocument.ontouchend = null;
				o.ownerDocument.drag.ondrop();
				return false;
			};
			var mm = function (e) {
				if ((!e.changedTouches || e.changedTouches.length < 2)
					&& (!e.targetTouches || e.targetTouches.length < 2)
					&& (!e.touches || e.touches.length < 2))
					o.ownerDocument.drag.move(e);
				return false;
			};
			o.ownerDocument.onmousemove = mm;
			o.ownerDocument.ontouchmove = mm;
			o.ownerDocument.onmouseup = mu;
			o.ownerDocument.ontouchend = mu;
			if (e && e.stopPropagation)
				e.stopPropagation();
			return false;
		};
		this.obj.onmousedown = md;
		this.obj.ontouchstart = md;
	}
	ondrop() { }
	ondrag(event, delta) { }
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
}