import { communication } from './communication';
import { global } from './global';
import { lists } from './lists';
import { Contact, ContactWhatToDo, model } from './model';
import { pageLocation } from './pageLocation';
import { pageContact } from './pageContact';
import { pageSearch } from './pageSearch';
import { formFunc, ui } from './ui';
import { user } from './user';
import { geoData } from './geoData';

export { pageWhatToDo };

class pageWhatToDo {
	static template = v =>
		global.template`<whattodotitle onclick="pageWhatToDo.open()"></whattodotitle>
<div style="padding:0 1em;display:none;">
	<whatToDoDiv style="display:block;">
	<value>
		<input type="checkbox" value="0" name="wtdCategories" label="${ui.l('category0')}" ${v.checked0} />
		<input type="checkbox" value="1" name="wtdCategories" label="${ui.l('category1')}" ${v.checked1} />
		<input type="checkbox" value="2" name="wtdCategories" label="${ui.l('category2')}" ${v.checked2} />
		<input type="checkbox" value="3" name="wtdCategories" label="${ui.l('category3')}" ${v.checked3} />
		<input type="checkbox" value="4" name="wtdCategories" label="${ui.l('category4')}" ${v.checked4} />
		<input type="checkbox" value="5" name="wtdCategories" label="${ui.l('category5')}" ${v.checked5} />
	</value>
	</whatToDoDiv>
	<whatToDoDiv id="whatToDoLocation" onclick="${v.locOC}" style="display:${v.locDisp};cursor:pointer;">
		${v.locName}
	</whatToDoDiv>
	<whatToDoDiv>
		${ui.l('wtd.time')}<br/>
		<value>
			<input class="whatToDoTime" type="time" id="messageTime" placeholder="HH:MM" value="${v.timeValue}" />
		</value>
	</whatToDoDiv>
	<whatToDoDiv>
		<value>
			<input type="text" id="messageText" value="${v.currentText}" choices="Messages"
				placeholder="${ui.l('wtd.ownTextHint')}" />
		</value>
	</whatToDoDiv>
	<div style="margin-bottom:1em;">
		<buttontext onclick="pageWhatToDo.save()" class="bgColor">
			${ui.l('wtd.action')}
		</buttontext>
		<buttontext onclick="pageWhatToDo.reset()" class="bgColor reset">
			${ui.l('wtd.actionReset')}
		</buttontext>
	</div>
</div>
<whatToDoLists>
	<tabHeader style="max-width:94%;margin-left:3%;">
		<tab class="tabActive" onclick="pageWhatToDo.onClickTab(event,&quot;Contacts&quot;)"
			style="max-width:32%;">
			<p>${ui.l('contacts.title')}</p>
		</tab>
		<tab onclick="pageWhatToDo.onClickTab(event,&quot;Locations&quot;)" style="max-width:32%;">
			<p>${ui.l('locations.title')}</p>
		</tab>
		<tab onclick="pageWhatToDo.onClickTab(event,&quot;Events&quot;)" style="max-width:32%;">
			<p>${ui.l('events.title')}</p>
		</tab>
	</tabHeader>
	<tabBody>
		<whatToDoList id="wtdListContacts" style="display:block;"></whatToDoList>
		<whatToDoList id="wtdListLocations"></whatToDoList>
		<whatToDoList id="wtdListEvents"></whatToDoList>
	</tabBody>
</whatToDoLists>`;
	static list = null;
	static maxRadius = 50;
	static resetCall = null;
	static closeNotifications() {
		ui.css('whattodobody', 'display', '');
		var e = ui.q('notifications');
		ui.navigation.hideMenu();
		ui.navigation.animation(e, 'slideUp', function () {
			ui.css(e, 'display', 'none');
		});
	}
	static init() {
		if (!ui.q('whattodo').innerHTML) {
			communication.ajax({
				url: global.server + 'db/list?query=contact_what2do',
				responseType: 'json',
				success(r) {
					pageWhatToDo.list = [];
					for (var i = 1; i < r.length; i++)
						pageWhatToDo.list.push(model.convert(new ContactWhatToDo(), r, i));
					clearTimeout(pageWhatToDo.resetCall);
					var currentWtd = pageWhatToDo.getCurrentMessage();
					if (currentWtd && currentWtd.active)
						pageWhatToDo.resetCall = setTimeout(pageWhatToDo.reset, global.date.getDate(currentWtd.time).getTime() - new Date().getTime() + 3600000);
					var v = {}, currentWtd = pageWhatToDo.getCurrentMessage() || {};
					if (currentWtd.time) {
						var d = global.date.getDate(currentWtd.time);
						v.timeValue = (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
					} else {
						var h = (new Date().getHours() + 1) % 24;
						v.timeValue = h + ':00';
						if (h < 10)
							v.timeValue = '0' + v.timeValue;
					}
					if (currentWtd.keywords) {
						for (var i = 0; i < 6; i++) {
							if (currentWtd.keywords.indexOf(i) > -1)
								v['checked' + i] = ' checked';
						}
					}
					if (currentWtd.budget) {
						for (var i = 1; i < 5; i++) {
							if (currentWtd.budget.indexOf(i) > -1)
								v['checkedBudget' + i] = ' checked';
						}
					}
					v.hideReset = currentWtd.keywords ? '' : 'display:none;';
					v.currentText = currentWtd.text;
					if (currentWtd._locationName) {
						v.locName = ui.l('wtd.locationLink').replace('{0}', currentWtd._locationName);
						v.locOC = 'ui.navigation.autoOpen(&quot;' + global.encParam('l=' + currentWtd.locationId) + '&quot;,event)';
						v.locDisp = 'block';
					} else
						v.locDisp = 'none';
					v[currentWtd.text ? 'msgButtonDisp' : 'msgBodyDisp'] = 'display:none;';
					var f = null;
					if (currentWtd.locationName) {
						f = function () {
							var e = ui.q('#whatToDoLocation');
							var f = function (event) {
								event.stopPropagation();
								user.save({ messageLocationId: '' }, function () {
									currentWtd.locationId = null;
									ui.navigation.animation(e, 'homeSlideOut', function () {
										ui.css(e, 'display', 'none');
										ui.attr(e, 'remove', true);
									});
								});
							};
							ui.swipe(e, function (dir) {
								if (dir == 'left' || dir == 'right')
									f();
							});
						};
					}
					v.displayFacebookPublish = user.contact.facebookLink ? '' : 'display:none;';
					v.date = global.date.formatDate(new Date(), 'weekdayLong');
					v.date = global.date.getDateHint(new Date()).replace('{0}', v.date.substring(0, v.date.lastIndexOf(' ')));
					ui.html('whattodo', pageWhatToDo.template(v));
					pageWhatToDo.initListButton();
					if (ui.cssValue('whatToDoLists', 'display') != 'none') {
						ui.css('#wtdListContacts', 'display', 'block');
						pageWhatToDo.loadListContacts();
					}
					formFunc.initFields('whattodo');
					ui.addFastButton('whattodo');
				}
			});
		} else
			pageWhatToDo.initListButton();
	}
	static getNotificationText(text, created) {
		var s = global.date.formatDate(global.date.getDate(created));
		var t = global.string.replaceLinks('http', text);
		t = global.string.replaceLinks('https', t);
		return [s, t];
	}
	static openNotifications() {
		ui.scrollTo('whattodo', 0);
		var e = ui.q('notifications');
		if (!e.innerHTML || !ui.q('notifications listResults') || ui.q('[name="badgeNotifications"]').innerText != '0') {
			communication.loadList('query=contact_listNotification&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&distance=100000&sort=false', function (l) {
				var x = ui.q('[name="badgeNotifications"]').innerHTML;
				l[0].push('_message1');
				l[0].push('_message2');
				l[0].push('_badge');
				l[0].push('_badgeDisp');
				for (var i = 1; i < l.length; i++) {
					var v = model.convert(new Contact(), l, i);
					var t = pageWhatToDo.getNotificationText(v.contactNotification.text, v.contactNotification.createdAt);
					l[i].push(t[0]);
					l[i].push(t[1]);
					l[i].push(i <= x ? 1 : 0);
					l[i].push(i <= x ? 'block' : 'none');
				}
				var s = pageContact.listContactsInternal(l);
				if (!s)
					s = '<div style="padding:1em;">' + ui.l('notification.noNewsYet') + '</div>';
				lists.setListDivs('notifications', 'pageWhatToDo.closeNotifications()');
				ui.html('notifications listResults', s);
				ui.html('notifications listHeader listTitle', ui.l('wtd.myNotifications'));
				ui.css(e, 'display', '');
				ui.navigation.hideMenu();
				ui.navigation.animation(e, 'slideDown', function () {
					ui.css('whattodobody', 'display', 'none');
				});
				ui.addFastButton('notifications');
				ui.css('notifications listScroll', 'display', '');
				lists.repositionThumb('notifications');
				if (l.length > 1) {
					s = model.convert(new Contact(), l, 1).contactNotification.createdAt;
					for (var i = 2; i < l.length; i++) {
						var v = model.convert(new Contact(), l, i).contactNotification.createdAt;
						if (v > s)
							s = v;
					}
					if (s.indexOf('.') > 0)
						s = s.substring(0, s.lastIndexOf('.'));
					user.save({ notification: s }, communication.ping);
				}
			});
		} else {
			ui.navigation.hideMenu();
			ui.css(e, 'display', '');
			ui.navigation.animation(e, 'slideDown', function () {
				ui.css('whattodobody', 'display', 'none');
			});
		}
	}
	static toggleNotifications() {
		if (ui.cssValue('notifications', 'display') == 'none')
			pageWhatToDo.openNotifications();
		else
			pageWhatToDo.closeNotifications();
	}
	static checkAttributeLocationsForList(id) {
		for (var i = 0; i < 6; i++) {
			if (user.contact['attr' + i] || user.contact['attr' + i + 'Ex'][i])
				return true;
		}
		ui.html('#wtdList' + id, lists.getListNoResults(id.toLowerCase(), 'matches'));
		return false;
	}
	static checkAttributeContactsForList() {
		if (!user.contact.attrInterest && !user.contact.attrInterestEx) {
			ui.html('#wtdListContacts', lists.getListNoResults('contacts', 'matches'));
			return false;
		}
		return true;
	}
	static getCurrentMessage() {
		if (pageWhatToDo.list && pageWhatToDo.list[0] && global.date.getDate(pageWhatToDo.list[0].time).getTime() > new Date().getTime() - 3600000)
			return pageWhatToDo.list[0];
	}
	static getDisplayMessage() {
		var currentMessage = pageWhatToDo.getCurrentMessage();
		if (!currentMessage || !currentMessage.active)
			return ui.l('wtd.todayIWant');
		var s = global.date.getDate(currentMessage.time), cats = currentMessage.keywords.split(',');
		s = s.getHours() + ':' + (s.getMinutes() < 10 ? '0' : '') + s.getMinutes();
		s = ui.l('wtd.autoNewsMe').replace('{0}', s);
		for (var i = 0; i < cats.length; i++)
			s += ui.l('category' + cats[i]) + (i < cats.length - 1 ? ' ' + ui.l('or') + ' ' : '');
		return s;
	}
	static getMessages() {
		var list = [];
		if (pageWhatToDo.list) {
			for (var i = 0; i < pageWhatToDo.list.length; i++) {
				if (pageWhatToDo.list[i].message)
					list.push(pageWhatToDo.list[i].message);
			}
		}
		return list;
	}
	static getSearchContact() {
		var cats = pageWhatToDo.getCurrentMessage().keywords.split(','), s = '';
		for (var i = 0; i < cats.length; i++)
			s += '(length(contact.attr' + cats[i] + ')>0 or length(contact.attr' + cats[i] + 'Ex)>0) or ';
		if (s.length > 0)
			return ' and (' + s.substring(0, s.length - 4) + ')';
		return '';
	}
	static initListButton() {
		var b = pageWhatToDo.getCurrentMessage();
		b = b && b.active;
		ui.css('whatToDoLists', 'display', b ? '' : 'none');
		ui.css('whattodo>div buttonText.reset', 'display', b ? '' : 'none');
		if (!b)
			setTimeout(function () {
				if (ui.cssValue('whattodo', 'display') != 'none' && ui.cssValue('whattodo>div', 'display') == 'none')
					ui.toggleHeight('whattodo>div');
			}, 400);
		b = pageWhatToDo.getDisplayMessage();
		ui.html('whattodotitle', b);
		ui.html('home .homeWTD', b);
	}
	static listContact(r) {
		var s = pageContact.listContactsInternal(r);
		ui.html('#wtdListContacts', s ? s : lists.getListNoResults('contacts', 'whattodo'));
		if (s)
			ui.addFastButton('#wtdListContacts');
	}
	static listEvents(r) {
		var s = pageLocation.event.listEventsInternal(pageLocation.event.getCalendarList(r), new Date());
		ui.html('#wtdListEvents', s ? s : lists.getListNoResults('events', 'whattodo'));
		if (s)
			ui.addFastButton('#wtdListEvents');
	}
	static listLocation(r) {
		var s = pageLocation.listLocationInternal(r);
		ui.html('#wtdListLocations', s ? s : lists.getListNoResults('locations', 'whattodo'));
		if (s)
			ui.addFastButton('#wtdListLocations');
	}
	static load(type, query, search, exec) {
		var currentWtd = pageWhatToDo.getCurrentMessage();
		if (currentWtd.keywords && pageWhatToDo.checkAttributeLocationsForList(type)) {
			var l = currentWtd.locationLatitude ? currentWtd : geoData.latlon;
			communication.loadList('query=' + query + '&latitude=' + l.lat + '&longitude=' + l.lon + '&distance=' + pageWhatToDo.maxRadius + '&search=' + encodeURIComponent(search), exec);
		}
	}
	static loadListEvents() {
		return pageWhatToDo.load('Events', 'event_listCurrent', pageSearch.getSearchMatchesLocation(pageWhatToDo.getCurrentMessage().keywords), pageWhatToDo.listEvents);
	}
	static loadListLocations() {
		return pageWhatToDo.load('Locations', 'location_list', pageSearch.getSearchMatchesLocation(pageWhatToDo.getCurrentMessage().keywords), pageWhatToDo.listLocation);
	}
	static loadListContacts() {
		return pageWhatToDo.load('Contacts', 'contact_list', pageSearch.getSearchMatchesContact() + pageWhatToDo.getSearchContact(), pageWhatToDo.listContact);
	}
	static onClickTab(event, id) {
		ui.navigation.selectTab(event);
		ui.css('#wtdListContacts', 'display', '');
		ui.css('#wtdListLocations', 'display', '');
		ui.css('#wtdListEvents', 'display', '');
		var e = ui.q('#wtdList' + id);
		e.style.display = 'block';
		if (!e.innerHTML) {
			if (id == 'Locations')
				pageWhatToDo.loadListLocations();
			else if (id == 'Contacts')
				pageWhatToDo.loadListContacts();
			else if (id == 'Events')
				pageWhatToDo.loadListEvents();
		}
	}
	static open() {
		ui.toggleHeight('whattodo>div');
	}
	static refresh() {
		ui.html('#wtdListContacts', '');
		ui.html('#wtdListLocations', '');
		ui.html('#wtdListEvents', '');
		pageWhatToDo.initListButton();
		if (ui.cssValue('whatToDoLists', 'display') != 'none') {
			if (ui.cssValue('#wtdListLocations', 'display') != 'none')
				pageWhatToDo.loadListLocations();
			else if (ui.cssValue('#wtdListContacts', 'display') != 'none')
				pageWhatToDo.loadListContacts();
			else if (ui.cssValue('#wtdListEvents', 'display') != 'none')
				pageWhatToDo.loadListEvents();
		}
	}
	static reset() {
		var currentWtd = pageWhatToDo.getCurrentMessage();
		if (currentWtd && currentWtd.active) {
			communication.ajax({
				url: global.server + 'db/one',
				method: 'PUT',
				body: { classname: 'ContactWhatToDo', id: currentWtd.id, values: { active: false } },
				success() {
					currentWtd.active = false;
					pageWhatToDo.initListButton();
				}
			});
		}
	}
	static save() {
		formFunc.resetError(ui.q('[name="wtdCategories"]'));
		formFunc.resetError(ui.q('[name="messageTime"]'));
		var e = ui.qa('[name="wtdCategories"]:checked');
		if (!e.length)
			formFunc.setError(ui.q('[name="wtdCategories"]'), 'wtd.noCategoriesEntered');
		if (!ui.q('#messageTime').value)
			formFunc.setError(ui.q('#messageTime'), 'wtd.noTimeEntered');
		formFunc.validation.filterWords(ui.q('#messageText'));
		if (ui.q('whattodo errorHint') && ui.q('whattodo errorHint').innerText)
			return;
		var cats = '';
		for (var i = 0; i < e.length; i++)
			cats += ',' + e[i].value;
		cats = cats.substring(1);
		pageWhatToDo.saveInternal(cats, ui.q('#messageText').value, ui.q('#whatToDoLocation').getAttribute('remove') ? false : null);
	}
	static saveInternal(cat, msg, locID, postfix) {
		var currentWtd = pageWhatToDo.getCurrentMessage();
		var time = new Date(), hour = ui.q('#messageTime' + (postfix ? postfix : '')).value.split(':');
		if (time.getHours() >= hour[0])
			time.setDate(time.getDate() + 1);
		time.setHours(hour[0]);
		time.setMinutes(hour[1]);
		time.setSeconds(0);
		time.setMilliseconds(0);
		msg = msg.replace(/</g, '&lt;');
		var v = { classname: 'ContactWhatToDo', values: { active: true, keywords: cat, time: time.toISOString(), message: msg } };
		if (locID)
			v.values.locationId = locID;
		if (currentWtd)
			v.id = currentWtd.id;
		communication.ajax({
			url: global.server + 'db/one',
			method: currentWtd ? 'PUT' : 'POST',
			body: v,
			success(id) {
				if (currentWtd) {
					currentWtd.active = true;
					currentWtd.keywords = cat;
					currentWtd.message = msg;
					currentWtd.time = time;
					currentWtd.locationId = locID;
				} else
					pageWhatToDo.list.unshift({
						active: true,
						contactId: user.contact.id,
						id: id,
						keywords: cat,
						message: msg,
						time: time,
						locationId: locID
					});
				ui.q('#wtdListContacts').innerHTML = '';
				ui.q('#wtdListLocations').innerHTML = '';
				ui.q('#wtdListEvents').innerHTML = '';
				if (ui.cssValue('whattodo', 'display') != 'none')
					ui.toggleHeight('whattodo>div');
				id = ui.q('whattodolists whattodolist[style*=block]').id;
				if (id.indexOf('Contacts') > 0)
					pageWhatToDo.loadListContacts();
				else if (id.indexOf('Locations') > 0)
					pageWhatToDo.loadListLocations();
				else
					pageWhatToDo.loadListEvents();
				pageWhatToDo.initListButton();
				if (postfix == 'Detail')
					ui.html(ui.navigation.getActiveID() + ' [name="whattodo"] detailTogglePanel', ui.l('wtd.setStatusLocation'));
			}
		});
	}
	static saveLocation(cat, id) {
		pageWhatToDo.saveInternal(cat, '', id, 'Detail');
	}
}