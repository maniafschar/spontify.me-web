import { communication } from './communication';
import { details } from './details';
import { geoData } from './geoData';
import { global } from './global';
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
import { Contact, model } from './model';
import { initialisation } from './init';

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
	static openRating(id, search) {
		InputRating.open(id, search);
	}
	static navigation = {
		animationEvent: null,

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
		closeHint() {
			DialogHint.close();
		},
		closePopup() {
			return DialogPopup.close();
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
				ui.navigation.openHint({ desc: id, pos: '15%,-6em', size: '80%,auto', hinkyClass: 'bottom', hinky: 'right:' + (id == 'contacts' ? 9.375 : 40.625) + '%;margin-right:-1.5em;' });
				return;
			}
			geoData.headingClear();
			if (document.activeElement)
				document.activeElement.blur();
			if (DialogHint.currentStep < 0)
				ui.navigation.closeHint();
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
		hideMenu(exec) {
			if (ui.cssValue('menu', 'transform').indexOf('1') > 0)
				ui.navigation.toggleMenu();
			if (DialogHint.currentStep < 0)
				ui.navigation.closeHint();
			if (exec)
				exec.call();
		},
		openAGB() {
			pageInfo.openSection = 1;
			ui.navigation.goTo('info');
		},
		openHint(data) {
			DialogHint.openHint(data);
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
		openIntro(event) {
			if (event && event.target.nodeName == 'CLOSE')
				return;
			DialogHint.openIntro();
		},
		openPopup(title, data, closeAction, modal, exec) {
			return DialogPopup.open(title, data, closeAction, modal, exec);
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
				search: encodeURIComponent('eventParticipate.contactId=' + user.contact.id + ' and event.contactId=contact.id and contact.clientId=' + user.clientId)
			}, pageEvent.listTickets, 'events', 'eventsTicket');
		}
	}
	static l(id, dontReportMissingLabel) {
		if (!id)
			return '';
		var s = ui.labels[id];
		if (!s && id.indexOf('.') > 0) {
			var i = id.split('.');
			if (ui.labels[i[0]])
				s = ui.labels[i[0]][i[1]];
		}
		if (!s) {
			if (!dontReportMissingLabel)
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
		var e = ui.qa(path);
		return e.length ? e[0] : null;
	}
	static qa(path) {
		var i = path.indexOf('dialog-popup ');
		if (i > -1) {
			i += 13;
			return document.querySelector(path.substring(0, i))._root.querySelectorAll(path.substring(i));
		}
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
		ui.x(e, function (e2) {
			if (!e2 || e2.getAttribute('toggle') && new Date().getTime() - e2.getAttribute('toggle') < 450)
				return;
			e2.setAttribute('toggle', new Date().getTime());
			if (!e2.getAttribute('h')) {
				var p = e2.style.position;
				var d = e2.style.display;
				e2.style.visibility = 'hidden';
				e2.style.display = 'block';
				e2.style.height = '';
				e2.style.position = 'absolute';
				e2.setAttribute('h', e2.offsetHeight);
				e2.style.position = p;
				e2.style.display = d;
				e2.style.visibility = '';
			}
			var o = e2.style.overflow;
			var t = e2.style.transition;
			e2.style.overflow = 'hidden';
			var expand = ui.cssValue(e2, 'display').indexOf('none') > -1;
			e2.style.height = (expand ? 0 : e2.offsetHeight) + 'px';
			e2.style.transition = 'height .4s ease-' + (expand ? 'in' : 'out');
			if (expand)
				e2.style.display = 'block';
			setTimeout(function () {
				var h = parseInt(e2.style.height);
				ui.on(e2, 'transitionend', function () {
					e2.style.overflow = o;
					e2.style.transition = t;
					e2.style.height = '';
					if (!expand) {
						e2.style.setProperty('display', 'none', 'important');
						e2.setAttribute('h', h);
					}
					e2.removeAttribute('toggle');
					if (exec)
						console.log(exec);
					if (exec)
						exec.call();
				}, true);
				e2.style.height = expand ? e2.getAttribute('h') + 'px' : 0;
			}, 10);
		});
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
		var form = typeof id == 'string' ? ui.q(id) : id;
		var d = { values: {} }, cb = {};
		var e = form.querySelectorAll(' textarea:not([transient="true"])');
		for (var i = 0; i < e.length; i++) {
			if (e[i].name)
				d.values[e[i].name] = e[i].value.replace(/\"/g, '&quot;').replace(/</g, '&lt;');
		}
		e = form.querySelectorAll('select:not([transient="true"])');
		for (var i = 0; i < e.length; i++) {
			if (e[i].name)
				d.values[e[i].name] = e[i].value;
		}
		e = form.querySelectorAll('input:not([transient="true"])');
		for (var i = 0; i < e.length; i++) {
			if (e[i].type == 'datetime-local')
				d.values[e[i].name] = global.date.local2server(e[i].value);
			else if (e[i].name)
				d.values[e[i].name] = e[i].value.replace(/\"/g, '&quot;').replace(/</g, '&lt;');
		}
		e = form.querySelectorAll('input-checkbox:not([transient="true"])');
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
		e = form.querySelectorAll('input-slider:not([transient="true"])');
		for (var i = 0; i < e.length; i++)
			d.values[e[i].getAttribute('name')] = e[i].getAttribute('value');
		e = form.querySelectorAll('input-hashtags:not([transient="true"])');
		for (var i = 0; i < e.length; i++) {
			d.values[e[i].getAttribute('name')] = e[i].getAttribute('ids');
			d.values[e[i].getAttribute('name') + 'Text'] = e[i].getAttribute('text');
		}
		e = form.querySelectorAll('input-image:not([transient="true"])');
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
				var exec = function (r) {
					var parser = new DOMParser();
					var xmlDoc = parser.parseFromString(r, "text/xml");
					formFunc.svg.data[id] = xmlDoc.getElementsByTagName('svg')[0].outerHTML;
					formFunc.svg.replaceAll();
				};
				communication.ajax({
					url: 'images/' + id + '.svg',
					webCall: 'ui.svg.fetch(id)',
					error(r) {
						communication.ajax({
							url: global.server + 'images/' + id + '.svg',
							webCall: 'ui.svg.fetch(id)',
							success(r) {
								exec(r);
							}
						});
					},
					success(r) {
						exec(r);
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
				e = ui.parents(event.target, 'dialog-popup');
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

class ButtonText extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.textContent = `
span {
	background: linear-gradient(var(--bg2stop) 0%, var(--bg2start) 100%) center center / 100% no-repeat;
	outline: none !important;
}

:host>span:hover {
	background: var(--bg2stop);
}
		
:host(.favorite)>span::before {
	content: '✓';
	position: absolute;
	font-size: 2em;
	right: 0.15em;
	bottom: 0;
}
:host>span {
	position: relative;
	border-radius: 0.5em;
	cursor: pointer;
	padding: 1em 1.5em;
	min-height: 3em;
	line-height: 1;
	margin: 0 0.25em;
	white-space: nowrap;
	vertical-align: middle;
	overflow: hidden;
	text-overflow: ellipsis;
	color: var(--buttonText);
	box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.3);
	display: inline-block;
    box-sizing: border-box;
}

:host(.map)>span {
	position: absolute;
	width: 18em;
	left: 50%;
	margin-left: -9em;
	top: 4.25em;
	opacity: 0.8;
	font-size: 0.8em;
	display: none;
}

:host(.settingsButton)>span {
	margin: 1em 0 0.25em 0;
	border-radius: 0 2em 2em 0;
	z-index: 1;
}

:host(.settingsButtonRight)>span {
	margin: 1em 0 0.25em 0;
	float: right;
	border-radius: 2em 0 0 2em;
	clear: both;
}`;
		this._root.appendChild(style);
		this._root.appendChild(document.createElement('span'));
		this.tabIndex = 0;
		this.style.outline = 'none !important';
		this.attributeChangedCallback('label', null, this.getAttribute('label'));
		if (this.innerHTML) {
			this._root.querySelector('span').innerHTML = this.innerHTML;
			this.innerHTML = '';
		}
		this.addEventListener('keydown', function (event) {
			if (event.key == ' ')
				this.click();
		})
	}
	static get observedAttributes() { return ['label']; }
	attributeChangedCallback(name, oldValue, newValue) {
		if (name == 'label' && newValue && this._root.querySelector('span')) {
			var s = ui.l(newValue.trim(), true);
			this._root.querySelector('span').innerHTML = s ? s : newValue;
			this.removeAttribute('label');
		}
	}
}
if (!customElements.get('button-text'))
	customElements.define('button-text', ButtonText);

class DialogHint extends HTMLElement {
	static currentStep = -1;
	static lastHint = 0;
	static steps = [];

	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.textContent = `
.body,
:host(.body) {
	position: absolute;
	background: var(--bgHint);
	padding: 1em;
	border-radius: 0.5em;
	text-align: center;
	box-shadow: 0 0 1em rgba(0, 0, 0, 0.3);
}

close {
	position: absolute;
	right: 0;
	top: 0;
	width: 6em;
	height: 2.75em;
	text-align: right;
	padding: 0.25em 0.75em;
	cursor: pointer;
	font-weight: bold;
	z-index: 1;
	color: rgba(0, 0, 0, 0.2);
}

tab.tabActive {
	color: black;
}

tabBody {
	width: 100%;
	overflow-x: hidden;
}

tabBody>div {
	transition: all 0.4s ease-out;
	width: 200%;
}

tabBody>div>div {
	width: 50%;
	float: left;
	height: 22em;
	overflow-y: auto;
}

errorHint {
	color: red !important;
}

index {
	display: none;
}
b {
	margin-bottom: 0.5em;
	display: inline-block;
}

emphasis {
	font-weight: bold;
	color: var(--bg1start);
}

title {
	font-weight: bold;
	font-size: 1.3em;
	display: block;
	margin-bottom: 0.5em;
}

hinky {
	position: absolute;
	border-right: solid 1.5em transparent;
	border-left: solid 1.5em transparent;
	margin-left: -1.5em;
	z-index: 0;
}

hinky.top {
	top: -1em;
	border-bottom: solid 1.5em var(--bgHint);
}

hinky.bottom {
	bottom: -1em;
	border-top: solid 1.5em var(--bgHint);
}`;
		this._root.appendChild(style);
	}
	actionGoToSearch() {
		ui.navigation.goTo("search");
	}
	actionLogin() {
		setTimeout(function () { pageLogin.login("alpenherz@fan-club.online", "test1234",); }, 2000);
	}
	actionSearch() {
		ui.q('search .defaultButton').click();
	}
	actionZommMap() {
		eval('ui2.close()');
		setTimeout(function () {
			ui.q('body home mapcanvas').scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
			setTimeout(function () {
				ui.q('[aria-label=\"Vergrößern\"]').click();
				ui.q('[aria-label=\"Vergrößern\"]').click();
				ui.q('[aria-label=\"Vergrößern\"]').click();
			}, 500);
			setTimeout(function () { ui.q('[aria-label=\"Stadtplan anzeigen\"]').click() }, 1500);
		}, 500);
	}
	static close() {
		DialogHint.currentStep = -1;
		var e = ui.q('main:last-child dialog-hint');
		if (ui.cssValue(e, 'display') != 'block')
			return;
		ui.on(e, 'transitionend', function () {
			ui.attr(e, 'style');
			ui.attr(e, 'i');
			for (var i = e._root.children.length - 1; i > 0; i--)
				e._root.children[i].remove();
		}, true);
		ui.css(e, 'opacity', 0);
	}
	language(lang) {
		DialogHint.currentStep--;
		initialisation.setLanguage(lang);
	}
	static openHint(data) {
		if (new Date().getTime() / 60000 - DialogHint.lastHint < 4)
			return;
		if (data && data.action) {
			eval(data.action);
			if (data.action.indexOf('pageHome.openStatistics') > -1)
				return;
		}
		var e = ui.q('main:last-child dialog-hint'), body = (data.desc.indexOf(' ') > -1 ? data.desc : ui.l('intro.' + data.desc)), element;
		body = body.replace('<rating/>', '<br/><br/><input-rating ui="rating"></input-rating><br/><br/><input type="email" name="email" placeholder="Email"></input><br/><br/><textarea name="feedback" maxlength="1000"></textarea><br/><br/><button-text onclick="this.getRootNode().host.save()" name="feedback" label="✓" part="button-text"></button-text>');
		body = body.replace('<language/>', '<br/><br/><button-text ' + (global.language == 'DE' ? 'class="favorite"' : '') + ' onclick="this.getRootNode().host.language(&quot;DE&quot;)" l="DE" label="Deutsch" part="button-text"></button-text><button-text class="' + (global.language == 'EN' ? ' favorite' : '') + '" onclick="this.getRootNode().host.language(&quot;EN&quot;)" l="EN" label="English" part="button-text"></button-text>');
		if (e != ui.q('dialog-hint'))
			ui.q('dialog-hint').style.display = '';
		if (global.hash(data.desc) == e.getAttribute('i')) {
			ui.navigation.closeHint();
			return;
		}
		ui.css(e, 'display', 'block');
		if (body.indexOf('</input>') < 0)
			ui.attr(e, 'onclick', data.onclick ? data.onclick : DialogHint.currentStep > -1 ? 'ui.navigation.openIntro(event)' : 'ui.navigation.closeHint()');
		else
			e.removeAttribute('onclick');
		if (DialogHint.currentStep < 0 || DialogHint.currentStep == DialogHint.steps.length - 1) {
			if (e.getAttribute('i')) {
				ui.navigation.closeHint();
				setTimeout(function () {
					ui.navigation.openHint(data);
				}, 400);
				return;
			}
			ui.css(e, 'left', null);
			ui.css(e, 'right', null);
			ui.css(e, 'top', null);
			ui.css(e, 'bottom', null);
			element = document.createElement('span');
			element.innerHTML = body;
			e._root.appendChild(element);
		} else {
			element = document.createElement('div');
			element.innerHTML = body;
			e._root.appendChild(element);
			ui.css(e, 'left', 0);
			ui.css(e, 'right', 0);
			ui.css(e, 'top', 0);
			ui.css(e, 'bottom', 0);
			e = element;
		}
		ui.classAdd(e, 'body');
		if (!user.contact && DialogHint.currentStep < 0 && (location.pathname.length < 2 || location.pathname.indexOf('index.html') > 0)) {
			e._root.appendChild(document.createElement('br'));
			e._root.appendChild(document.createElement('br'));
			element = document.createElement('button-text');
			element.setAttribute('label', 'login.action');
			element.setAttribute('part', 'button-text');
			element.setAttribute('onclick', 'ui.navigation.goTo("login")');
			e._root.appendChild(element);
		}
		if (data.hinky) {
			element = document.createElement('hinky');
			element.setAttribute('class', data.hinkyClass);
			element.setAttribute('style', data.hinky);
			element.setAttribute('onclick', 'ui.navigation.closeHint()');
			e._root.appendChild(element);
		}
		element = document.createElement('close');
		element.innerText = 'x';
		element.setAttribute('onclick', 'ui.navigation.closeHint()');
		e._root.appendChild(element);
		if (data.pos.split(',')[0].indexOf('-') == 0) {
			ui.css(e, 'left', '');
			ui.css(e, 'right', data.pos.split(',')[0].substring(1));
		} else {
			ui.css(e, 'right', '');
			ui.css(e, 'left', data.pos.split(',')[0]);
		}
		if (data.pos.split(',')[1].indexOf('-') == 0) {
			ui.css(e, 'top', '');
			ui.css(e, 'bottom', data.pos.split(',')[1].substring(1));
		} else {
			ui.css(e, 'bottom', '');
			ui.css(e, 'top', data.pos.split(',')[1]);
		}
		if (data.size.split(',')[0].indexOf('-') == 0)
			ui.css(e, 'right', data.size.split(',')[0].substring(1));
		else
			ui.css(e, 'width', data.size.split(',')[0]);
		ui.css(e, 'height', data.size.split(',')[1]);
		ui.attr(ui.q('main:last-child dialog-hint'), 'i', global.hash(data.desc));
		formFunc.initFields(element);
		setTimeout(function () { ui.css('main:last-child dialog-hint', 'opacity', 1) }, 10);
	}
	static openIntro() {
		if (DialogHint.steps.length == 0) {
			DialogHint.steps.push({ desc: 'home', pos: '5%,5em', size: '90%,auto' });
			DialogHint.steps.push({ desc: 'home2', pos: '5%,7.5em', size: '90%,auto', action: 'this.getRootNode().host.actionLogin()' });
			DialogHint.steps.push({ desc: 'home3', pos: '5%,-55vh', size: '90%,auto', hinkyClass: 'bottom', hinky: 'left:50%;' });
			DialogHint.steps.push({ desc: 'home4', pos: '5%,-5em', size: '90%,auto', hinkyClass: 'bottom', hinky: 'left:35%;' });
			DialogHint.steps.push({ desc: 'searchExplained', pos: '10%,4em', size: '80%,auto', hinky: 'left:50%;', hinkyClass: 'top', action: 'this.getRootNode().host.actionGoToSearch()' });
			DialogHint.steps.push({ desc: 'search', pos: '5%,-5em', size: '90%,auto', action: 'this.getRootNode().host.actionSearch()' });
			DialogHint.steps.push({ desc: 'marketingStart', pos: '0.8em,5em', size: '80%,auto', hinky: 'left:1.6em;', hinkyClass: 'top', action: 'ui.navigation.goTo("home")' });
			DialogHint.steps.push({ desc: 'statisticsCharts', pos: '10%,15em', size: '80%,auto', action: 'pageHome.openStatistics(true)' });
			DialogHint.steps.push({ desc: 'statisticsCharts2', pos: '10%,26em', size: '80%,auto', hinky: 'left:50%;', hinkyClass: 'top', action: 'ui2.open(1)' });
			DialogHint.steps.push({ desc: 'statisticsMap', pos: '10%,2em', size: '80%,auto', hinky: 'left:50%;', hinkyClass: 'bottom', action: 'this.getRootNode().host.actionZommMap()' });
			DialogHint.steps.push({ desc: 'marketingQuestions', pos: '10%,12em', size: '80%,auto', action: 'ui2.goTo(2)' });
			DialogHint.steps.push({ desc: 'epilog', pos: '10%,8em', size: '80%,auto' });
		}
		if (DialogHint.currentStep == DialogHint.steps.length - 1) {
			ui.navigation.closeHint();
			return;
		}
		var e = ui.q('main:last-child hint');
		if (ui.cssValue(e, 'transform').indexOf('1') > -1) {
			if (e)
				e.click();
		}
		if (ui.cssValue('home', 'display') == 'none' && DialogHint.currentStep < 0)
			ui.navigation.goTo('home');
		ui.css(e, 'opacity', 0);
		DialogHint.currentStep++;
		if (ui.cssValue(e, 'display') == 'block')
			setTimeout(function () { ui.navigation.openHint(DialogHint.steps[DialogHint.currentStep]) }, 400);
		else
			ui.navigation.openHint(DialogHint.steps[DialogHint.currentStep]);
	}
	save() {
		if (formFunc.validation.email(ui.q('main:last-child hint input[name="email"]')) < 0)
			communication.ajax({
				url: global.serverApi + 'action/notify',
				webCall: 'ui.openIntro()',
				method: 'POST',
				body: 'text=' + encodeURIComponent(JSON.stringify(formFunc.getForm('main:last-child hint'))),
				success(r) {
					ui.navigation.openHint({ desc: 'Lieben Dank für Dein Feedback!', pos: '20%,12em', size: '60%,auto' });
				}
			});
	}
}
if (!customElements.get('dialog-hint'))
	customElements.define('dialog-hint', DialogHint);

class DialogPopup extends HTMLElement {
	static lastPopup = null;

	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.textContent = `
input:checked+label {
	background: var(--bg1stop) !important;
	color: black;
}

.multiple {
	max-height: 50vh;
	overflow-y: auto;
	margin-bottom: 1em;
}

.paypal {
	text-align: center;
	padding: 0.25em 0.5em 0 0.5em;
}

appointment {
	display: none;
	margin-top: 1em;
	position: relative;
}

appointment day {
	position: relative;
	width: 33%;
	overflow: hidden;
	display: block;
	float: left;
	padding: 0.5em;
}

appointment day hour {
	position: relative;
	height: 2em;
	width: 100%;
	display: block;
	overflow: hidden;
	margin: 0.5em 0;
	background: rgba(0, 0, 0, 0.1);
	border-radius: 0.5em;
	line-height: 2;
	cursor: pointer;
}

appointment day hour.closed {
	background-color: red;
	text-decoration: line-through;
	opacity: 0.25;
}

appointment day hour.selected {
	background-color: rgba(0, 255, 0, 0.9);
}

appointment day hour.selected::after {
	content: '✓';
	position: absolute;
	opacity: 0.2;
	font-size: 2em;
	top: 0.1em;
	line-height: 1;
}

appointment day hour.hour09::before {
	content: '9:00';
}

appointment day hour.hour10::before {
	content: '10:00';
}

appointment day hour.hour11::before {
	content: '11:00';
}

appointment day hour.hour12::before {
	content: '12:00';
}

appointment day hour.hour13::before {
	content: '13:00';
}

appointment day hour.hour14::before {
	content: '14:00';
}

appointment day hour.hour15::before {
	content: '15:00';
}

appointment day hour.hour16::before {
	content: '16:00';
}

appointment day hour.hour17::before {
	content: '17:00';
}
		
popupTitle {
	position: relative;
	display: block;
	height: 2.6em;
	z-index: 1;
	overflow: hidden;
}

popupTitle>div {
	white-space: nowrap;
	font-size: 1.3em;
	max-width: 90%;
	display: inline-block;
	background: rgba(250, 175, 100, 0.95);
	padding: 0.5em 1em;
	border-radius: 0.5em 0.5em 0 0;
	color: black;
	height: 100%;
	cursor: pointer;
	text-overflow: ellipsis;
}

popupHint {
	padding: 0.5em;
	text-align: center;
	display: block;
}

popupContent {
	display: flex;
	border-radius: 0.5em;
	background: linear-gradient(rgba(250, 175, 100, 0.95) 0%, rgba(209, 130, 60, 0.95) 100%);
	color: black;
}

popupContent>div {
	overflow-y: auto;
	overflow-x: hidden;
	border: solid 0.75em transparent;
	width: 100%;
}

 .highlightColor {
	color: var(--bg1start);
}

locationNameInputHelper,
eventLocationInputHelper {
	position: relative !important;
	display: block !important;
	max-height: 25em !important;
	overflow-y: auto !important;
	margin: 0.25em 0 !important;
}

ul {
	margin: 0;
	padding: 0;
}

locationNameInputHelper li,
eventLocationInputHelper li {
	list-style-type: none !important;
	background: rgba(0, 0, 0, 0.1) !important;
	padding: 0.5em !important;
	border-radius: 0.5em !important;
	cursor: pointer !important;
	margin: 0.5em !important;
	text-align: center !important;
	color: white !important;
}`;
		this._root.appendChild(style);
	}
	static close() {
		var e = ui.q('dialog-popup');
		e.removeAttribute('error');
		if (ui.cssValue(e, 'display') != 'none' && e.getAttribute('modal') != 'true') {
			ui.navigation.animation(e, 'popupSlideOut', e._root.getRootNode().host.closeHard);
			DialogPopup.lastPopup = null;
			return true;
		}
		return false;
	}
	closeHard() {
		var e = ui.q('dialog-popup');
		e.style.display = 'none';
		e.removeAttribute('error');
		e.removeAttribute('modal');
		ui.classRemove(e, 'animated popupSlideIn popupSlideOut');
		for (var i = e._root.children.length - 1; i > 0; i--)
			e._root.children[i].remove();
	}
	static open(title, data, closeAction, modal, exec) {
		var e = ui.q('dialog-popup'), visible = e.style.display != 'none';
		if (visible && e.getAttribute('modal') == 'true')
			return false;
		if (global.isBrowser() && location.href.indexOf('#') < 0)
			history.pushState(null, null, '#x');
		if (visible && ui.navigation.lastPopup == title + global.separatorTech + data)
			ui.navigation.closePopup();
		else if (data) {
			ui.navigation.lastPopup = title + global.separatorTech + data;
			var f = function () {
				e._root.getRootNode().host.closeHard();
				var element;
				if (title) {
					element = document.createElement('popupTitle');
					if (modal)
						e.setAttribute('modal', 'true');
					element.setAttribute('onclick', 'ui.navigation.closePopup()');
					var element2 = document.createElement('div');
					element2.innerText = title;
					element.appendChild(element2);
					e._root.appendChild(element);
				}
				element = document.createElement('popupContent');
				var element2 = document.createElement('div');
				element2.innerHTML = data;
				element.appendChild(element2);
				e._root.appendChild(element);
				ui.attr('dialog-popup input', 'part', 'input');
				ui.attr('dialog-popup input-hashtags', 'part', 'input-hashtags');
				ui.attr('dialog-popup input-image', 'part', 'input-image');
				ui.attr('dialog-popup textarea', 'part', 'textarea');
				ui.attr('dialog-popup label', 'part', 'label');
				ui.attr('dialog-popup li', 'part', 'li');
				ui.attr('dialog-popup explain', 'part', 'explain');
				ui.attr('dialog-popup field', 'part', 'field');
				ui.attr('dialog-popup value', 'part', 'value');
				ui.attr('dialog-popup dialogButtons', 'part', 'dialogButtons');
				ui.css(e, 'display', 'none');
				formFunc.initFields(e);
				if (closeAction)
					e.setAttribute('close', closeAction);
				else
					e.removeAttribute('close');
				e.removeAttribute('error');

				ui.navigation.animation(e, visible ? 'slideDown' : 'popupSlideIn');
				element.style.maxHeight = (ui.q('content').clientHeight - (title ? ui.q('dialog-popup popupTitle').clientHeight : 0) - 2 * ui.emInPX) + 'px';
				if (exec)
					exec.call();
			};
			ui.navigation.closeHint();
			pageChat.closeList();
			communication.notification.close();
			if (!visible)
				f.call();
			else
				ui.navigation.animation(e, 'slideUp', f);
		} else
			ui.navigation.animation(e, 'popupSlideOut', ui.navigation.closePopupHard);
		return true;
	}
}
if (!customElements.get('dialog-popup'))
	customElements.define('dialog-popup', DialogPopup);

class InputHashtags extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
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
	}
	connectedCallback() {
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
		this._root.appendChild(element);
		this.attributeChangedCallback('label', null, this.getAttribute('label'));
		this.tabIndex = 0;
		this.addEventListener('keydown', function (event) {
			if (event.key == ' ')
				this.click();
		})
	}
	static get observedAttributes() { return ['label']; }
	attributeChangedCallback(name, oldValue, newValue) {
		if (name == 'label' && newValue && this._root.querySelector('label')) {
			var s = ui.l(newValue, true);
			this._root.querySelector('label').textContent = s ? s : newValue;
			this.removeAttribute('label');
		}
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
	}
	connectedCallback() {
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

input+img,
.appInput+img {
	position: absolute;
	top: 0;
	right: 0;
	height: 100%;
	border-radius: 0 0.5em 0.5em 0;
}

button-image {
	padding: 0.34em 0.75em !important;
	width: 50% !important;
	position: relative !important;
	display: inline-block !important;
	text-align: left;
	box-sizing: border-box;
	background: rgba(255, 255, 255, 0.85);
	color: black;
}

button-image.left {
	border-radius: 0.5em 0 0 0.5em !important;
	border-right: solid 1px rgba(0, 0, 0, 0.3) !important;
}

button-image.right {
	border-radius: 0 0.5em 0.5em 0 !important;
}`;
		this._root.appendChild(style);
		var s = '', s2 = this.getAttribute('name'), element = document.createElement('inputFile');
		element.innerHTML = '<span>' + (this.getAttribute('hint') ? this.getAttribute('hint') : ui.l('fileUpload.select')) + '</span>';
		this._root.appendChild(element);
		if (global.isBrowser()) {
			element = document.createElement('input');
			element.setAttribute('type', 'file');
			element.setAttribute('onchange', 'this.getRootNode().host.preview(this)');
			element.setAttribute('accept', '.gif, .png, .jpg');
			this._root.appendChild(element);
		} else {
			element.style.display = 'none';
			element = document.createElement('div');
			element.setAttribute('class', 'appInput');
			element.innerHTML = '<button-image onclick="this.getRootNode().host.cameraPicture(true)" class="left">' + ui.l('camera.shoot') + '</button-image>' +
				'<button-image onclick="this.getRootNode().host.cameraPicture()" class="right">' + ui.l('camera.select') + '</button-image>';
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
	cameraPicture(camera) {
		var t = this;
		navigator.camera.getPicture(function (e) { t.cameraSuccess(t, e) }, t.cameraError,
			{ sourceType: camera ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY, destinationType: Camera.DestinationType.FILE_URI });
	}
	cameraSuccess(t, e) {
		t._root.querySelector('div').style.display = 'none';
		t._root.querySelector('inputFile').style.display = 'block';
		window.resolveLocalFileSystemURL(e,
			function (fe) {
				fe.file(function (f) {
					t.preview2(t, f);
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
		this.preview2(this, e.files && e.files.length > 0 ? e.files[0] : null);
	}
	preview2(t, file) {
		if (file) {
			var ePrev = t._root.querySelector('inputFile');
			ui.css(ePrev, 'z-index', 6);
			t._root.querySelector('img.icon').style.display = 'none';

			ui.html(ePrev, `
<close onclick="this.getRootNode().host.remove(this)">X</close>
<rotate onclick="this.getRootNode().host.rotate(this)">&#8635;</rotate>
<img class="preview" />
<desc></desc>`);
			var img = t._root.querySelector('img.preview');
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
			t.previewInternal(file);
			ui.css('#popupSendImage', 'display', '');
		} else
			t.remove(t);
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
	remove(t) {
		t = t.getRootNode();
		var e = t.querySelector('input');
		if (e)
			e.value = '';
		var inputFile = t.querySelector('inputFile');
		ui.html(inputFile, '<span>' + (t.host.getAttribute('hint') ? t.host.getAttribute('hint') : ui.l('fileUpload.select')) + '</span>');
		inputFile.style.zIndex = null;
		inputFile.style.height = null;
		t.querySelector('img.icon').style.display = '';
		ui.css('#popupSendImage', 'display', 'none');
		t.host.removeAttribute('value');
		if (!global.isBrowser()) {
			t.querySelector('div').style.display = 'block';
			inputFile.style.display = 'none';
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
			if (i) {
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
			} else
				t.setAttribute('value', '');
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

class InputRating extends HTMLElement {
	rating = `<ratingSelection style="font-size:2em;margin-top:0.5em;">
	<empty><span>☆</span><span onclick="this.getRootNode().host.rate(event,2)">☆</span><span
			onclick="this.getRootNode().host.rate(event,3)">☆</span><span onclick="this.getRootNode().host.rate(event,4)">☆</span><span
			onclick="this.getRootNode().host.rate(event,5)">☆</span></empty>
	<full><span onclick="this.getRootNode().host.rate(event,1)">★</span><span onclick="this.getRootNode().host.rate(event,2)">★</span><span
			onclick="this.getRootNode().host.rate(event,3)">★</span><span onclick="this.getRootNode().host.rate(event,4)">★</span><span
			onclick="this.getRootNode().host.rate(event,5)" style="display:none;">★</span></full>
	</ratingSelection>`;
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.textContent = `
detailRating {
	font-size: 1.5em;
	margin: 1em 0 0.75em 0;
	display: block;
	position: relative;
	cursor: pointer;
}

ratingHint {
	margin: 0 1em 1em 1em;
	display: block;
}

ratingHistory {
	display: block;
}

ratingHistory rating {
	display: block;
	background: transparent;
	padding: 0.5em;
	text-align: left;
	width: 100%;
	position: relative;
}

ratingHistory rating img {
	max-width: 100%;
	border-radius: 1em;
}

ratingHistory span {
	position: relative;
}

rating,
ratingSelection {
	position: relative;
	line-height: 1;
	display: inline-block;
	height: 1.5em;
}

rating empty,
ratingSelection empty {
	opacity: 0.3;
	position: relative;
}

rating full,
ratingSelection full {
	position: absolute;
	left: 0;
	overflow: hidden;
	top: 0;
	color: var(--bg2stop);
}

ratingSelection span {
	width: 2em;
	display: inline-block;
	position: relative;
	cursor: pointer;
}

input-image {
	position: relative;
	display: block;
	margin: 1em 0;
}`;
		this._root.appendChild(style);
		var element, id = this.getAttribute('id');
		var stars = '<empty>☆☆☆☆☆</empty><full style="width:{0}%;">★★★★★</full>';
		if (this.getAttribute('ui') == 'dialog') {
			var lastRating = JSON.parse(decodeURIComponent(this.getAttribute('lastRating'))), history = JSON.parse(decodeURIComponent(this.getAttribute('history')));
			this.removeAttribute('ui');
			this.removeAttribute('lastRating');
			this.removeAttribute('history');
			var hint, e = JSON.parse(decodeURIComponent(ui.q('detail card:last-child detailHeader').getAttribute('data')));
			if (!id) {
				var name = ui.q('detail:not([style*="none"]) card:last-child title, [i="' + id + '"] title').innerText.trim();
				hint = ui.l('rating.' + this.getAttribute('type')).replace('{0}', name);
			} else if (lastRating.createdAt)
				hint = ui.l('rating.lastRate').replace('{0}', global.date.formatDate(lastRating.createdAt)) + '<br/><br/><rating>' + stars.replace('{0}', lastRating.rating) + '</rating>';
			else if (pageEvent.getDate(e) > new Date())
				hint = ui.l('rating.notStarted');
			else if (e.eventParticipate.state != 1)
				hint = ui.l('rating.notParticipated');
			if (hint) {
				element = document.createElement('ratingHint');
				element.innerHTML = hint;
			} else {
				element = document.createElement('div');
				element.innerHTML = this.getForm(id);
			}
			this._root.appendChild(element);
			ui.html('detail card:last-child [name="favLoc"]', '');
			var s = '', date, pseudonym, description, img;
			for (var i = 1; i < history.length; i++) {
				var v = model.convert(new Contact(), history, i);
				date = global.date.formatDate(v.eventRating.createdAt);
				pseudonym = v.id == user.contact.id ? ui.l('you') : v.pseudonym;
				description = v.eventRating.description ? global.separator + v.eventRating.description : '';
				img = v.eventRating.image ? '<br/><img src="' + global.serverImg + v.eventRating.image + '"/>' : '';
				s += '<rating onclick="ui.navigation.autoOpen(&quot;' + global.encParam('p=' + v.id) + '&quot;,event)"><span>' + stars.replace('{0}', v.eventRating.rating) + '</span> ' + date + ' ' + pseudonym + description + img + '</rating > ';
			}
			if (s) {
				element = document.createElement('ratingHistory');
				element.innerHTML = s;
				this._root.appendChild(element);
			}
		} else if (this.getAttribute('ui') == 'rating') {
			element = document.createElement('div');
			element.innerHTML = this.rating;
			this._root.appendChild(element.children[0]);
			element = document.createElement('input');
			element.setAttribute('type', 'hidden');
			element.setAttribute('name', 'rating');
			element.setAttribute('value', '80');
			this._root.appendChild(element);
		} else {
			element = document.createElement('detailRating');
			element.setAttribute('onclick', 'ui.openRating(' + (this.getAttribute('type') == 'event' ? id : null) + ',"event.' + (this.getAttribute('type') == 'event' ? 'id' : this.getAttribute('type') + 'Id') + '=' + id + '")');
			element.innerHTML = '<ratingSelection>' + stars.replace('{0}', this.getAttribute('rating')) + '</ratingSelection>';
			this._root.appendChild(element);
		}
	}
	rate(event, x) {
		var e = event.target.getRootNode().querySelectorAll('ratingSelection > full span');
		ui.css(e, 'display', 'none');
		for (var i = 0; i < x; i++)
			ui.css(e[i], 'display', '');
		event.target.getRootNode().querySelector('[name="rating"]').value = x * 20;
		event.target.getRootNode().host.setAttribute('value', x * 20);
	}
	getForm(id) {
		var draft = user.get('rating' + id), participate = ui.q('detail card:last-child detailHeader').getAttribute('data');
		if (participate)
			participate = JSON.parse(decodeURIComponent(participate)).eventParticipate;
		if (draft)
			draft = draft.values.description;
		return `${this.rating}<form style="margin-top:1em;" onsubmit="return false">
	<input type="hidden" name="eventParticipateId" value="${participate && participate.id ? participate.id : ''}" />
	<input type="hidden" name="rating" value="80" />
	<field>
		<textarea maxlength="1000" placeholder="${ui.l('locations.shortDesc')}" name="description" part="textarea">${draft ? draft : ''}</textarea>
	</field>
	<field style="margin:0.5em 0 0 0;">
		<input-image></input-image>
	</field>
	<button-text onclick="this.getRootNode().host.save(event)" oId="${id}" style="margin-top:0.5em;" label="rating.save" part="button-text"></button-text>
</form>`;
	}
	static open(id, search) {
		var lastRating = null, history = null;
		if (!search)
			search = '';
		var render = function () {
			if (lastRating && history)
				ui.navigation.openPopup(ui.l('rating.title'), '<input-rating ui="dialog"' + (id ? ' id="' + id + '"' : '')
					+ (' type="' + (search.indexOf('contact') > -1 ? 'contact' : search.indexOf('location') > -1 ? 'location' : 'event') + '"')
					+ (history ? ' history="' + encodeURIComponent(JSON.stringify(history)) + '"' : '')
					+ (lastRating ? ' lastRating="' + encodeURIComponent(JSON.stringify(lastRating)) + '"' : '') + '></input-rating>');
		};
		if (id) {
			communication.ajax({
				url: global.serverApi + 'db/list?query=event_rating&search=' + encodeURIComponent('event.id=' + id + ' and eventParticipate.contactId=' + user.contact.id),
				webCall: 'ui.open(id,search)',
				responseType: 'json',
				success(r) {
					lastRating = r.length > 1 ? model.convert(new Contact(), r, r.length - 1).eventRating : {};
					render();
				}
			});
		} else
			lastRating = {};
		if (search) {
			communication.ajax({
				url: global.serverApi + 'db/list?query=event_rating&search=' + encodeURIComponent(search),
				webCall: 'ui.open(id,search)',
				responseType: 'json',
				success(r) {
					history = r;
					render();
				}
			});
		} else
			history = [];
		render();
	}
	save(event) {
		var e = event.target.getRootNode().querySelector('[name="description"]');
		ui.classRemove(e, 'dialogFieldError');
		if (event.target.getRootNode().querySelector('[name="rating"]').value < 25 && !e.value)
			formFunc.setError(e, 'rating.negativeRateValidation');
		else
			formFunc.validation.filterWords(e);
		if (event.target.getRootNode().querySelector('errorHint'))
			return;
		var v = formFunc.getForm(event.target.getRootNode().querySelector('form'));
		v.classname = 'EventRating';
		communication.ajax({
			url: global.serverApi + 'db/one',
			webCall: 'ui.open(id,search)',
			method: 'POST',
			body: v,
			success(r) {
				user.remove('rating');
				ui.navigation.closePopup();
				e = ui.q('detail card:last-child button-text[onclick*="ui.openRating"]');
				if (e)
					e.outerHTML = '';
			}
		});
	}
	disconnectedCallback() {
		var f = this.querySelector('form');
		if (f) {
			var v = formFunc.getForm(f);
			user.set('rating', v.values.description ? v : null);
		}
	}
}
if (!customElements.get('input-rating'))
	customElements.define('input-rating', InputRating);

class InputSlider extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
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

class ListBody extends HTMLElement {
	constructor() {
		super();
	}
	connectedCallback() {
		if (!this.innerHTML) {
			var id = ui.parents(this, 'contacts') ? 'contacts' : ui.parents(this, 'events') ? 'events' : '';
			var element = document.createElement('listHeader');
			element.innerHTML = '<buttonicon class="right bgColor" onclick="ui.navigation.toggleMenu()"><img source="menu"/></buttonicon><listTitle>' + ui.l(id + '.title').toLowerCase() + '</listTitle>'
				+ (id == 'contacts' ? '' : '<map style="display:none;"></map><button-text class="map" onclick="pageLocation.searchFromMap()" label="search.map"></button-text>');
			this.appendChild(element);
			var element = document.createElement('listBody');
			element.innerHTML = (id == 'contacts' ? '<groups style="display:none;"></groups>' : '') + '<listResults></listResults>';
			this.appendChild(element);
			formFunc.svg.replaceAll();
			if (id == 'contacts')
				ui.swipe('contacts>listBody', function (dir) {
					if (dir == 'left')
						ui.navigation.goTo('home', false);
					else if (dir == 'right')
						ui.navigation.goTo('events', true);
				});
			else if (id == 'events')
				ui.swipe('events>listBody', function (dir) {
					if (dir == 'left')
						ui.navigation.goTo('contacts');
					else if (dir == 'right')
						ui.navigation.goTo('search', true);
				});
		}
	}
}
if (!customElements.get('list-body'))
	customElements.define('list-body', ListBody);

class ListRow extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
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

:host(.favorite) imagelist svg {
	display: inline;
}

:host(.authenticated) badge,
:host(.participate) badge {
	background: green;
}

:host(.authenticated) badge::after,
:host(.participate) badge::after {
	content: '✓';
}

:host(.canceled) badge {
	background: red;
}

:host(.canceled) badge::after {
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
		element.setAttribute('part', 'badge');
		if (this.getAttribute('badge'))
			element.setAttribute('class', this.getAttribute('badge'));
		else if (this.getAttribute('class').indexOf('authenticated') < 0
			&& this.getAttribute('class').indexOf('canceled') < 0
			&& this.getAttribute('class').indexOf('participate') < 0)
			element.setAttribute('part', 'hidden');
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
	${this.getAttribute('flag3') ? decodeURIComponent(this.getAttribute('flag3')) : ''}
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