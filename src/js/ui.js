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
import { DialogPopup } from './customElements/DialogPopup';
import { InputHashtags } from './customElements/InputHashtags';
import { DialogHint } from './customElements/DialogHint';
import { InputRating } from './customElements/InputRating';
import { DialogMenu } from './customElements/DialogMenu';
import { DialogLocationPicker } from './customElements/DialogLocationPicker';
import { VideoCall } from './customElements/VideoCall';
import { ContentAdminHome } from './customElements/ContentAdminHome';
import { DialogNavigation } from './customElements/DialogNavigation';
import { ContentAdminMarketing } from './customElements/ContentAdminMarketing';
import { ContentAdminInvoice } from './customElements/ContentAdminInvoice';

export { ui, formFunc, DragObject };

class ui {
	static attributes = [];
	static categories = [];
	static emInPX = 0;
	static labels = [];
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
	static initHeatmap() {
		ContentAdminHome.initHeatmap();
	}
	static openRating(id, search) {
		InputRating.open(id, search);
	}
	static startAdminCall() {
		VideoCall.startAdminCall();
	}
	static startVideoCall(id) {
		VideoCall.startVideoCall(id);
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
						exec();
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
					if (id.indexOf('news=') == 0) {
						pageHome.openNews(id.substring(5));
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
						details.open(idIntern.substring(2), { webCall: 'ui.navigation.autoOpen', query: 'location_list', search: encodeURIComponent('location.id=' + idIntern.substring(2)) }, pageLocation.detailLocationEvent);
					else if (idIntern.indexOf('e=') == 0)
						details.open(idIntern.substring(2), { webCall: 'ui.navigation.autoOpen', query: 'event_list', search: encodeURIComponent('event.id=' + idIntern.substring(2, idIntern.indexOf('_') > 0 ? idIntern.indexOf('_') : idIntern.length)) }, pageLocation.detailLocationEvent);
					else if (idIntern.indexOf('f=') == 0)
						pageContact.sendRequestForFriendship(idIntern.substring(2));
					else if (idIntern.indexOf('q=') == 0)
						pageEvent.verifyParticipation(idIntern.substring(2));
					else if (idIntern.indexOf('=') == 1)
						details.open(idIntern.substring(2), { webCall: 'ui.navigation.autoOpen', query: 'contact_list', search: encodeURIComponent('contact.id=' + idIntern.substring(2)) }, pageContact.detail);
				}
			};
			f.call();
		},
		closeHint() {
			DialogHint.close();
		},
		closeLocationPicker() {
			DialogLocationPicker.close();
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
					exec();
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
			VideoCall.init();
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
			else if (id == 'content-admin-home')
				ContentAdminHome.init();
			else if (id == 'content-admin-marketing')
				ContentAdminMarketing.init();
			else if (id == 'content-admin-invoice')
				ContentAdminInvoice.init();
			pageChat.closeList();
			pageHome.closeList();
			ui.navigation.closePopup();
			if (currentID != id) {
				if (back == null) {
					var e = ui.q('dialog-navigation item.' + id);
					if (e) {
						var i1 = 0;
						while ((e = e.previousSibling) != null)
							i1++;
						e = ui.q('dialog-navigation item.' + currentID);
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
				ui.navigation.closeLocationPicker();
				ui.navigation.fade(id, back);
				ui.navigation.hideMenu();
				DialogNavigation.highlight(id);
			}
		},
		hideMenu(exec) {
			DialogMenu.close(exec);
		},
		openAGB() {
			pageInfo.openSection = 1;
			ui.navigation.goTo('info');
		},
		openHint(data) {
			DialogHint.open(data);
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
		openLocationPicker(event, noSelection) {
			DialogLocationPicker.open(event, noSelection);
		},
		openLocationPickerDialog() {
			DialogLocationPicker.openDialog();
		},
		openIntro(event) {
			if (event) {
				event.preventDefault();
				event.stopPropagation();
				if (event.target.nodeName == 'CLOSE')
					return;
			}
			DialogHint.openIntro();
		},
		openPopup(title, data, closeAction, modal, exec) {
			return DialogPopup.open(title, data, closeAction, modal, exec);
		},
		toggleMenu(id) {
			DialogMenu.toggle(id);
		}
	};
	static query = {
		contactFriends() {
			return lists.load({
				webCall: 'ui.query.contactFriends',
				query: 'contact_list',
				distance: -1,
				limit: 0,
				latitude: geoData.current.lat,
				longitude: geoData.current.lon,
				search: encodeURIComponent('contactLink.status=\'Friends\'')
			}, pageContact.listContacts, 'contacts', 'friends');
		},
		contactVisitees() {
			return lists.load({
				webCall: 'ui.query.contactVisitees',
				query: 'contact_listVisit',
				distance: -1,
				sort: false,
				latitude: geoData.current.lat,
				longitude: geoData.current.lon,
				search: encodeURIComponent('contactVisit.contactId2=contact.id and contactVisit.contactId=' + user.contact.id)
			}, pageContact.listContacts, 'contacts', 'visits');
		},
		contactVisits() {
			communication.ajax({
				url: global.serverApi + 'db/one',
				webCall: 'ui.query.contactVisits',
				method: 'PUT',
				body: { classname: 'Contact', id: user.contact.id, values: { visitPage: global.date.local2server(new Date()) } }
			});
			return lists.load({
				webCall: 'ui.query.contactVisits',
				query: 'contact_listVisit',
				distance: -1,
				sort: false,
				latitude: geoData.current.lat,
				longitude: geoData.current.lon,
				search: encodeURIComponent('contactVisit.contactId=contact.id and contactVisit.contactId2=' + user.contact.id)
			}, pageContact.listContacts, 'contacts', 'profile');
		},
		eventMy() {
			pageEvent.loadEvents({
				webCall: 'ui.query.eventMy',
				query: 'event_list',
				distance: -1,
				latitude: geoData.current.lat,
				longitude: geoData.current.lon,
				search: encodeURIComponent('event.contactId=' + user.contact.id)
			});
		},
		eventTickets() {
			return lists.load({
				webCall: 'ui.query.eventTickets',
				query: 'event_listParticipate',
				distance: -1,
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
		var customElements = function (p) {
			if (path.indexOf(',') < 0) {
				var i = path.indexOf(p);
				if (i > -1 && path.indexOf(' ', i) > -1) {
					i = path.indexOf(' ', i);
					var path1 = path.substring(0, i);
					var path2 = path.substring(i).trim();
					var result = [];
					var e = document.querySelectorAll(path1);
					for (i = 0; i < e.length; i++) {
						var e2 = e[i]._root.querySelectorAll(path2);
						for (var i2 = 0; i2 < e2.length; i2++)
							result.push(e2[i2]);
					}
					return result;
				}
			}
		}
		var e = customElements('dialog-popup');
		if (!e)
			e = customElements('dialog-navigation');
		if (!e)
			e = customElements('dialog-hint');
		if (!e)
			e = customElements('dialog-menu');
		if (!e)
			e = customElements('video-call');
		if (!e)
			e = customElements('input-hashtags');
		if (!e)
			e = customElements('list-row');
		if (!e)
			e = customElements('content-admin-home');
		if (!e)
			e = customElements('content-admin-marketing');
		if (!e)
			e = customElements('content-admin-invoice');
		if (!e)
			e = document.querySelectorAll(path);
		return e;
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
					e2.classList = ((e2.classList ? e2.classList.value + ' ' : '') + valueSplit[i]).trim();
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
						exec();
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
						exec();
				}, true);
				e2.style.height = expand ? e2.getAttribute('h') + 'px' : 0;
			}, 10);
		});
	}
	static val(id) {
		var e = ui.qa(id);
		if (e) {
			if (e.length == 1)
				return e[0].nodeName == 'INPUT' || e[0].nodeName == 'TEXTAREA' ? e[0].value : e[0].getAttribute('value');
			var s = '';
			for (var i = 0; i < e.length; i++)
				s += global.separatorTech + e[i].getAttribute('value');
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
		e = form.querySelectorAll('input-rating:not([transient="true"])');
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
		fetch(id, img) {
			if (!formFunc.svg.data[id]) {
				formFunc.svg.data[id] = 1;
				var exec = function (r) {
					var parser = new DOMParser();
					var xmlDoc = parser.parseFromString(r, "text/xml");
					formFunc.svg.data[id] = xmlDoc.getElementsByTagName('svg')[0].outerHTML;
					formFunc.svg.replaceAll([img]);
				};
				communication.ajax({
					url: 'images/' + id + '.svg',
					webCall: 'ui.svg.fetch',
					error(r) {
						communication.ajax({
							url: global.server + 'images/' + id + '.svg',
							webCall: 'ui.svg.fetch',
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
		replaceAll(imgs) {
			if (!imgs)
				imgs = ui.qa('img[source]');
			if (imgs) {
				for (var i = 0; i < imgs.length; i++) {
					var id = imgs[i].getAttribute('source');
					if (formFunc.svg.data[id]) {
						if (formFunc.svg.data[id] == 1) {
							const img = imgs[i];
							setTimeout(function () { formFunc.svg.replaceAll([img]) }, 500);
						} else if (imgs[i].parentNode) {
							var e = document.createElement('div');
							e.innerHTML = formFunc.svg.data[id];
							e.firstChild.onclick = imgs[i].onclick;
							e.firstChild.setAttribute('class', imgs[i].getAttribute('class'));
							imgs[i].parentNode.replaceChild(e.firstChild, imgs[i]);
						}
					} else
						formFunc.svg.fetch(id, imgs[i]);
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