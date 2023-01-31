import { communication } from './communication';
import { details } from './details';
import { geoData } from './geoData';
import { global } from './global';
import { DragObject } from './initialisation';
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
		ui.css(e, 'height', '1px');
		var h = e.scrollHeight;
		if (h > ui.emInPX * 6)
			h = ui.emInPX * 6;
		ui.css(e, 'height', (h + 6) + 'px');
	}
	static getSkills(compare, style) {
		var result = {
			attributesCategories: [],
			attributesUser: new Attribute('user'),
			categories: '',
			total: 0,
			totalMatch: 0,
			textAttributes() {
				var s = this.attributesUser.toString(style);
				for (var i = 0; i < this.attributesCategories.length; i++) {
					var s2 = this.attributesCategories[i].toString(style);
					if (s2)
						s += (s && style == 'list' ? ', ' : '') + s2;
				}
				return s;
			}
		};
		var a, skills = user.contact.skills || '';
		var add2List = function (label, highlight, list) {
			var l = { label: label };
			if (highlight) {
				l.class = 'highlightBackground';
				result.totalMatch++;
			}
			list.list.push(l);
		};
		if (skills)
			result.total += skills.split('|').length;
		if (compare.skills) {
			a = compare.skills.split('|');
			for (var i = 0; i < a.length; i++)
				add2List(ui.attributes[parseInt(a[i], 10)], skills.indexOf(a[i]) > -1, result.attributesUser);
		}
		skills = user.contact.skillsText ? ',' + user.contact.skillsText.toLowerCase() + ',' : '';
		if (skills)
			result.total += skills.split('|').length - 2;
		if (compare.skillsText) {
			a = compare.skillsText.toLowerCase().split('|');
			for (var i = 0; i < a.length; i++)
				add2List(a[i].trim(), skills.indexOf('|' + a[i].trim() + '|') > -1, result.attributesUser);
		}
		for (var i = 0; i < ui.categories.length; i++) {
			skills = user.contact.skills || '';
			var compareHasCat = compare.category ? compare.category.indexOf(i) > -1 : compare['attr' + i] || compare['attr' + i + 'Ex'];
			if (skills && (compare.idDisplay || compareHasCat)) {
				result.total += skills.split(global.separatorTech).length + 1;
				result.categories += '/' + ui.categories[i].label;
			}
			result.attributesCategories.push(new Attribute('category' + i));
			if (compareHasCat)
				add2List(ui.categories[i].label, skills, result.attributesCategories[i]);
			if (compare['attr' + i]) {
				a = compare['attr' + i].split(global.separatorTech);
				for (var i2 = 0; i2 < a.length; i2++)
					add2List(ui.categories[i].values[parseInt(a[i2], 10)], skills.indexOf(a[i2]) > -1, result.attributesCategories[i]);
			}
			skills = user.contact['attr' + i + 'Ex'] ? ',' + user.contact['attr' + i + 'Ex'].toLowerCase() + ',' : '';
			if (skills && (compare.idDisplay || compareHasCat))
				result.total += skills.split(',').length - 2;
			if (compare['attr' + i + 'Ex']) {
				a = compare['attr' + i + 'Ex'].split(',');
				for (var i2 = 0; i2 < a.length; i2++)
					add2List(a[i2].trim(), skills.indexOf(',' + a[i2] + ',') > -1, result.attributesCategories[i]);
			}
		}
		if (result.categories)
			result.categories = result.categories.substring(1);
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
					ui.navigation.hidePopup();
					if (idIntern.indexOf('l=') == 0)
						details.open(idIntern.substring(2), 'location_list&search=' + encodeURIComponent('location.id=' + idIntern.substring(2)), pageLocation.detailLocationEvent);
					else if (idIntern.indexOf('e=') == 0)
						details.open(idIntern.substring(2), 'event_list&search=' + encodeURIComponent('event.id=' + idIntern.substring(2)), pageLocation.detailLocationEvent);
					else if (idIntern.indexOf('f=') == 0)
						pageContact.sendRequestForFriendship(idIntern.substring(2));
					else if (idIntern.indexOf('q=') == 0)
						pageEvent.verifyParticipation(idIntern.substring(2));
					else if (idIntern.indexOf('=') == 1)
						details.open(idIntern.substring(2), 'contact_list&search=' + encodeURIComponent('contact.id=' + idIntern.substring(2)), pageContact.detail);
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
				ui.css(e, 'margin-left', ((ui.qa('detail card').length - 2) * 100) + '%');
				return;
			}
			// AGBs opened from login, go back to login
			if (pageInfo.openSection == -2)
				pageInfo.openSection = -1;
			if (!user.contact && id != 'home' && id != 'info' && id != 'login') {
				intro.openHint({ desc: id, pos: '10%,6vh', size: '80%,auto' });
				return;
			}
			geoData.headingClear();
			if (document.activeElement)
				document.activeElement.blur();
			if (!intro.introMode)
				intro.closeHint();
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
			ui.navigation.hidePopup();
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
				ui.navigation.fade(id, back);
				ui.navigation.hideMenu();
				if (ui.q('navigation item.' + id)) {
					ui.classRemove('navigation item', 'active');
					ui.classAdd('navigation item.' + id, 'active');
				}
			}
		},
		hidePopup() {
			ui.attr('popup', 'error');
			ui.attr('popup popupTitle', 'modal');
			var e = ui.q('popupTitle');
			if (!e || ui.cssValue('popup', 'display') != 'none' && e.getAttribute('modal') != 'true') {
				ui.navigation.animation(ui.q('popup'), 'popupSlideOut', ui.navigation.hidePopupHard);
				ui.navigation.lastPopup = null;
				return true;
			}
			return false;
		},
		hidePopupHard() {
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
			intro.closeHint();
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
				ui.navigation.hidePopup();
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
				intro.closeHint();
				pageChat.closeList();
				communication.notification.close();
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
		setPopupContent(s, closeAction) {
			var e = ui.q('popup');
			ui.css(e, 'display', 'none');
			ui.html(e, s);
			formFunc.initFields('popup');
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
	static openMatchingAttributes(button) {
		var e = ui.q('detail card:last-child .matchIndicatorAttributesHint');
		if (e.style.display == 'none') {
			var attr = new Attribute(button.getAttribute('type')), index = ',';
			for (var i = 0; i < button.children.length; i++) {
				var label = button.children[i].innerHTML.trim();
				attr.list.push({ label: label, class: ui.classContains(button.children[i], 'highlightBackground') ? 'highlightBackground' : '' });
				index += label + ',';
			}
			var add2List = function (s) {
				if (s && index.indexOf(',' + s + ',') < 0)
					attr.list.push({ label: s, class: 'attributeFade' });
			}
			if (button.getAttribute('type') == 'user') {
				var a = user.contact.skills ? user.contact.skills.split('|') : [];
				for (var i = 0; i < a.length; i++)
					add2List(ui.attributes[parseInt(a[i], 10)]);
				a = user.contact.skillsText ? user.contact.skillsText.split('|') : [];
				for (var i = 0; i < a.length; i++)
					add2List(a[i].trim());
			}
			ui.q('detail card:last-child .matchIndicatorAttributesHint>div').innerHTML = attr.toString();
			e.style.top = (button.offsetTop + 2 * ui.emInPX) + 'px';
			e.style.height = '';
			e.removeAttribute('h');
		}
		ui.toggleHeight(e);
	}
	static query = {
		contactFriends() {
			return lists.loadList(
				'query=contact_list&distance=100000&limit=0&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&search=' + encodeURIComponent('contactLink.status=\'Friends\''),
				pageContact.listContacts, 'contacts', 'friends');
		},
		contactVisitees() {
			return lists.loadList(
				'query=contact_listVisit&distance=100000&sort=false&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&search=' + encodeURIComponent('contactVisit.contactId2=contact.id and contactVisit.contactId=' + user.contact.id),
				pageContact.listContacts, 'contacts', 'visits');
		},
		contactVisits() {
			communication.ajax({
				url: global.server + 'db/one',
				method: 'PUT',
				body: { classname: 'Contact', id: user.contact.id, values: { visitPage: global.date.local2server(new Date()) } }
			});
			return lists.loadList(
				'query=contact_listVisit&distance=100000&sort=false&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&search=' + encodeURIComponent('contactVisit.contactId=contact.id and contactVisit.contactId2=' + user.contact.id),
				pageContact.listContacts, 'contacts', 'profile');
		},
		eventMy() {
			pageEvent.loadEvents('query=event_list&distance=100000&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&search=' + encodeURIComponent('event.contactId=' + user.contact.id + ' and event.endDate<\'' + global.date.local2server(new Date()).substring(0, 10) + '\''));
		},
		eventTickets() {
			return lists.loadList(
				'query=event_list&distance=100000&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&search=' + encodeURIComponent('eventParticipate.contactId=' + user.contact.id),
				pageEvent.listTickets, 'events', 'eventsTicket');
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
			if (exclude.indexOf(',' + event.target.nodeName + ',') < 0 && (!event.target.parentNode || exclude.indexOf(',' + event.target.parentNode.nodeName + ',') < 0)) {
				e.startX = event.changedTouches[0].pageX;
				e.startY = event.changedTouches[0].pageY;
				e.startTime = new Date().getTime();
			}
		});
		ui.on(e, 'touchend', function (event) {
			if (exclude.indexOf(',' + event.target.nodeName + ',') < 0 && (!event.target.parentNode || exclude.indexOf(',' + event.target.parentNode.nodeName + ',') < 0)) {
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
			e = ui.q(e);
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
			ui.on(e, 'transitionend', function () {
				e.style.overflow = o;
				e.style.transition = t;
				e.style.height = '';
				if (!expand)
					e.style.display = 'none';
				e.removeAttribute('toggle');
				if (exec)
					exec.call();
			}, true);
			e.style.height = expand ? e.getAttribute('h') + 'px' : 0;
		}, 10);
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

class Attribute {
	list = [];
	type;
	constructor(type) {
		this.type = type;
	}
	toString(style) {
		var s = '', first;
		if (this.type.indexOf('category') == 0)
			first = this.list.shift();
		this.list.sort(function (a, b) { return a.label > b.label ? 1 : -1 });
		if (first)
			this.list.unshift(first);
		for (var i = 0; i < this.list.length; i++) {
			if (style == 'list') {
				if (this.list[i].class)
					s += ', ' + this.list[i].label;
			} else
				s += '<label class="multipleLabel' + (this.list[i].class ? ' ' + this.list[i].class : '') + '">' + this.list[i].label + '</label>';
		}
		if (s) {
			if (style == 'list')
				return s.substring(2);
			return '<attributes type="' + this.type + '" onclick="ui.openMatchingAttributes(this)">' + s + '</attributes>';
		}
		return '';
	}
}

class formFunc {
	static cameraField = null;
	static dist = 0;

	static getDraft(id) {
		return user.contact.storage[id];
	}
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
					d.values[e[i].name] = '.' + b.substring(b.indexOf('/') + 1, b.indexOf(';')) + global.separatorTech + b.substring(b.indexOf(',') + 1);
				}
			} else if (e[i].type == 'radio') {
				if (e[i].checked)
					d.values[e[i].name] = e[i].value;
			} else if (e[i].type == 'checkbox') {
				if (!cb[e[i].name])
					cb[e[i].name] = '';
				if (e[i].checked)
					cb[e[i].name] += global.separatorTech + e[i].value;
				else if (e[i].value == 'true')
					cb[e[i].name] += '\u0015false';
			} else if (e[i].type == 'datetime-local')
				d.values[e[i].name] = global.date.local2server(e[i].value);
			else if (e[i].name)
				d.values[e[i].name] = e[i].value.replace(/\"/g, '&quot;').replace(/</g, '&lt;');
		}
		for (var k in cb)
			d.values[k] = cb[k].length > 0 ? cb[k].substring(1) : '';
		return d;
	}
	static image = {
		svg: {},

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
		fetchSVG(id) {
			if (!formFunc.image.svg[id]) {
				formFunc.image.svg[id] = 1;
				communication.ajax({
					url: '/images/' + id + '.svg',
					success(r) {
						var parser = new DOMParser();
						var xmlDoc = parser.parseFromString(r, "text/xml");
						formFunc.image.svg[id] = xmlDoc.getElementsByTagName('svg')[0].outerHTML;
						formFunc.image.replaceSVGs();
					}
				});
			}
		},
		getSVG(id) {
			return formFunc.image.svg[id];
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
				ui.css('#popupSendImage', 'display', '');
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
			ui.css('#popupSendImage', 'display', 'none');
			if (!global.isBrowser()) {
				ui.css('[name="' + name + '_appInput"]', 'display', 'block');
				ui.css(ePrev, 'display', 'none');
			}
		},
		replaceSVGs() {
			var imgs = ui.qa('img[source]');
			if (imgs) {
				for (var i = 0; i < imgs.length; i++) {
					var id = imgs[i].getAttribute('source');
					if (formFunc.image.svg[id]) {
						if (formFunc.image.svg[id] != 1) {
							var e = document.createElement('div');
							e.innerHTML = formFunc.image.svg[id];
							e.firstChild.onclick = imgs[i].onclick;
							imgs[i].parentNode.replaceChild(e.firstChild, imgs[i]);
							if (global.language != 'DE' && id == 'logo')
								ui.classAdd('homeHeader svg>g', 'en');
						}
					} else
						formFunc.image.fetchSVG(id);
				}
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
		var e = ui.qa(id + ' textarea'), e2;
		for (var i = 0; i < e.length; i++)
			e[i].onfocus = f;
		e = ui.qa(id + ' input');
		for (var i = 0; i < e.length; i++) {
			e[i].onfocus = function () { document.body.scrollTop = 0; }
			ui.on(e, 'keypress', formFunc.pressDefaultButton);
			if ((e[i].type === 'checkbox' || e[i].type === 'radio') && (!e[i].nextSibling || e[i].nextSibling.nodeName.toLowerCase() !== 'label'))
				e[i].outerHTML = e[i].outerHTML + '<label onclick="formFunc.toggleCheckbox(event)"' + (e[i].attributes['style'] ? ' style="' + e[i].attributes['style'].value + '"' : '') + (e[i].attributes['class'] ? ' class="' + e[i].attributes['class'].value + '"' : '') + '>' + e[i].attributes['label'].value + '</label>';
			else if (e[i].type == 'text' && e[i].getAttribute('slider') && !ui.q('#' + e[i].id + '_left')) {
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
					s += '<thumb style="left:' + v1 + '%;" id="' + idSlider + '_left"><span style="right:0;"><val></val>' + ui.l('slider.from') + '</span></thumb><thumb style="left:' + v2 + '%;margin-left:-1.35em;" id="' + idSlider + '_right"><span style="left:0;"><val></val>' + ui.l('slider.until') + '</span></thumb>';
				else
					s += '<thumb style="left:' + v1 + '%;" id="' + idSlider + '_left"><span style="right:0;"><val></val>' + (ui.l(e[i].getAttribute('label')) ? ui.l(e[i].getAttribute('label')) : e[i].getAttribute('label')) + '</span></thumb>';
				e2 = document.createElement('slider');
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
						s = '<div name="' + s2 + '_appInput" class="appInput"><buttontext class="bgColor" onclick="formFunc.image.cameraPicture(&quot;' + s2 + '&quot;,true)" style="border-radius:0.5em 0 0 0.5em;border-right:solid 1px rgba(255,255,255,0.1);">' + ui.l('camera.shoot') + '</buttontext>' +
							'<buttontext class="bgColor" onclick="formFunc.image.cameraPicture(&quot;' + s2 + '&quot;)" style="border-radius:0 0.5em 0.5em 0;">' + ui.l('camera.select') + '</buttontext></div>';
					}
					e[i].outerHTML = s + '<inputFile name="' + e[i].getAttribute('name') + '_disp" ' + (e[i].getAttribute('class') ? 'class="' + e[i].getAttribute('class') + '" ' : '') + (global.isBrowser() ? '' : ' style="display:none;"') + '>' + '<span>' + (e[i].getAttribute('hint') ? e[i].getAttribute('hint') : ui.l('fileUpload.select')) + '</span></inputFile>' + e[i].outerHTML + (e[i].getAttribute('src') ? '<img src="' + e[i].getAttribute('src') + '"/>' : '');
				}
			}
		}
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
	static pressDefaultButton(event) {
		if (event.keyCode == 13) {
			var e = ui.parents(event.target, 'form').querySelector('.defaultButton');
			if (e)
				e.click();
		}
	}
	static removeDraft(key) {
		var d = {}, save = false;
		for (var k in user.contact.storage) {
			if (k == key)
				save = true;
			else
				d[k] = user.contact.storage[k];
		}
		if (save) {
			user.contact.storage = d;
			user.save({ storage: JSON.stringify(user.contact.storage) });
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
	static saveDraft(key, value) {
		if (value) {
			if (user.contact.storage[key] != value) {
				user.contact.storage[key] = value;
				user.save({ storage: JSON.stringify(user.contact.storage) });
			}
		} else
			formFunc.removeDraft(key);
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
		ui.q('#' + id + ' val').innerText = v;
		t.value = s;
		if (t.getAttribute('callback'))
			eval(t.getAttribute('callback'));
		return x;
	}
	static validation = {
		badWords: [],
		badWordsReplacement: [],

		birthday(s) {
			formFunc.resetError(s);
			if (s.value.trim().length > 0) {
				try {
					var n = new Date(), d = global.date.getDateFields(s.value);
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
						formFunc.setError(s, 'settings.bday' + ex, [a < min ? min : max, a]);
					}
				} catch (e) {
					formFunc.setError(s, 'validation.wrong');
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