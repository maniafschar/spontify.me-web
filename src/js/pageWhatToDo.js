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
		global.template`<notifications style="display:none;" class="mainBG"></notifications>
<whattodotitle>
	<date>${v.date}</date>
	<navbutton onclick="pageWhatToDo.daily.next(false);" style="text-align:left;left:0;">&lt;</navbutton>
	<navbutton onclick="pageWhatToDo.daily.refresh();" style="left:33%;">&nbsp;</navbutton>
	<navbutton onclick="pageWhatToDo.daily.next(true);" style="text-align:right;right:0;">&gt;</navbutton>
</whattodotitle>
<tabHeader style="max-width:94%;margin-left:3%;">
	<tab class="tabActive" onclick="pageWhatToDo.daily.onClickTab(event,&quot;Birthdays&quot;);"
		style="max-width:38%;">
		<p>${ui.l('wtd.birthdays')}</p>
	</tab>
	<tab onclick="pageWhatToDo.daily.onClickTab(event,&quot;Offers&quot;);" style="max-width:38%;">
		<p>${ui.l('wtd.offers')}</p>
	</tab>
	<tab onclick="pageWhatToDo.daily.onClickTab(event,&quot;Events&quot;);" style="max-width:38%;">
		<p>${ui.l('events.title')}</p>
	</tab>
</tabHeader>
<tabBody>
	<whatToDoList id="dailyListBirthdays" style="display:block;"></whatToDoList>
	<whatToDoList id="dailyListOffers"></whatToDoList>
	<whatToDoList id="dailyListEvents"></whatToDoList>
</tabBody>
<buttontext id="wtdListsButton" onclick="pageWhatToDo.wtd.open();" class="bgColor">${ui.l('wtd.todayIWant')}</buttontext>
<whatToDoLists>
	<whattodotitle onclick="pageWhatToDo.wtd.open();"></whattodotitle>
	<tabHeader style="max-width:94%;margin-left:3%;">
		<tab class="tabActive" onclick="pageWhatToDo.wtd.onClickTab(event,&quot;Contacts&quot;);"
			style="max-width:32%;">
			<p>${ui.l('contacts.title')}</p>
		</tab>
		<tab onclick="pageWhatToDo.wtd.onClickTab(event,&quot;Locations&quot;);" style="max-width:32%;">
			<p>${ui.l('locations.title')}</p>
		</tab>
		<tab onclick="pageWhatToDo.wtd.onClickTab(event,&quot;Events&quot;);" style="max-width:32%;">
			<p>${ui.l('events.title')}</p>
		</tab>
	</tabHeader>
	<tabBody>
		<whatToDoList id="wtdListContacts" style="display:block;"></whatToDoList>
		<whatToDoList id="wtdListLocations"></whatToDoList>
		<whatToDoList id="wtdListEvents"></whatToDoList>
	</tabBody>
</whatToDoLists>`;
	static templateWTD = v =>
		global.template`<whatToDoDiv style="display:block;">
<value>
	<input type="checkbox" value="0" name="wtdCategories" label="${ui.l('category0')}" ${v['checked0']} />
	<input type="checkbox" value="1" name="wtdCategories" label="${ui.l('category1')}" ${v['checked1']} />
	<input type="checkbox" value="2" name="wtdCategories" label="${ui.l('category2')}" ${v['checked2']} />
	<input type="checkbox" value="3" name="wtdCategories" label="${ui.l('category3')}" ${v['checked3']} />
	<input type="checkbox" value="4" name="wtdCategories" label="${ui.l('category4')}" ${v['checked4']} />
	<input type="checkbox" value="5" name="wtdCategories" label="${ui.l('category5')}" ${v['checked5']} />
</value>
</whatToDoDiv>
<whatToDoDiv id="whatToDoLocation" onclick="${v['locOC']}" style="display:${v['locDisp']};cursor:pointer;">
	${v['locName']}
</whatToDoDiv>
<whatToDoDiv style="margin-top:1em;">
	${ui.l('wtd.time')}
	<value>
		<input class="whatToDoTime" type="time" id="messageTime" placeholder="HH:MM" value="${v['timeValue']}" style="margin-top:-0.5em;" />
	</value>
</whatToDoDiv>
<whatToDoDiv style="margin-top:1em;">
	<value>
		<input type="text" id="messageText" value="${v['currentText']}" choices="Messages"
			placeholder="${ui.l('wtd.ownTextHint')}" />
	</value>
</whatToDoDiv>
<div style="padding-top:1em;text-align:center;">
	<buttontext onclick="pageWhatToDo.wtd.save();" class="bgColor">
		${ui.l('wtd.action')}
	</buttontext>
	<buttontext onclick="pageWhatToDo.wtd.reset();" class="bgColor" style="${v['hideReset']}">
		${ui.l('wtd.actionReset')}
	</buttontext>
</div>`;
	static closeNotifications() {
		ui.css('whattodobody', 'display', '');
		var e = ui.q('notifications');
		ui.navigation.hideMenu();
		ui.navigation.animation(e, 'slideUp', function () {
			ui.css(e, 'display', 'none');
		});
	}
	static daily = {
		data: [],
		date: new Date(),

		getArray(tag) {
			if (!pageWhatToDo.daily.data[tag])
				pageWhatToDo.daily.data[tag] = [];
			return pageWhatToDo.daily.data[tag];
		},
		listBirthdays(r, tag) {
			if (tag) {
				pageWhatToDo.daily.getArray(tag)[0] = r;
				pageWhatToDo.daily.setDate(tag);
			}
			var s = pageContact.listContactsInternal(r);
			ui.html('#dailyListBirthdays', s ? s : '<whatToDoBody>' + ui.l('noResults.daily').replace('{0}', ui.l('wtd.birthdays')) + '</whatToDoBody>');
			if (s) {
				ui.addFastButton('dailyListBirthdays');
				ui.q('#dailyListBirthdays').lastChild.style.marginBottom = 0;
			}
		},
		listEvents(r, tag) {
			if (tag) {
				pageWhatToDo.daily.getArray(tag)[2] = r;
				pageWhatToDo.daily.setDate(tag);
			}
			var s = pageLocation.event.listEventsInternal(pageLocation.event.getCalendarList(r, null, pageWhatToDo.daily.date), pageWhatToDo.daily.date);
			ui.html('#dailyListEvents', s ? s : '<whatToDoBody>' + ui.l('noResults.daily').replace('{0}', ui.l('events.title')) + '</whatToDoBody>');
			if (s) {
				ui.addFastButton('dailyListEvents');
				ui.q('#dailyListEvents').lastChild.style.marginBottom = 0;
			}
		},
		listOffers(r, tag) {
			if (tag) {
				pageWhatToDo.daily.getArray(tag)[1] = r;
				pageWhatToDo.daily.setDate(tag);
			}
			var s = pageLocation.listLocationInternal(r);
			ui.html('#dailyListOffers', s ? s : '<whatToDoBody>' + ui.l('noResults.daily').replace('{0}', ui.l('wtd.offers')) + '</whatToDoBody>');
			if (s) {
				ui.addFastButton('dailyListOffers');
				ui.q('#dailyListOffers').lastChild.style.marginBottom = 0;
			}
		},
		loadListBirthdays(t) {
			if (!t)
				t = pageWhatToDo.daily.date;
			var tag = (t.getMonth() + 1) + '.' + t.getDate();
			var d = pageWhatToDo.daily.data[tag];
			if (d && d[0]) {
				pageWhatToDo.daily.setDate(tag);
				pageWhatToDo.daily.listBirthdays(d[0]);
			} else {
				var l = geoData.getLatLon();
				communication.loadList('latitude=' + l.lat + '&longitude=' + l.lon + '&distance=100000&query=contact_list&&search=' + encodeURIComponent('day(birthday)=' + t.getDate() + ' and month(birthday)=' + (t.getMonth() + 1) + ' and contactLink.status=\'Friends\''), function (l) { pageWhatToDo.daily.listBirthdays(l, tag) });
			}
		},
		loadListEvents(t) {
			if (!t)
				t = pageWhatToDo.daily.date;
			var tag = (t.getMonth() + 1) + '.' + t.getDate();
			var d = pageWhatToDo.daily.data[tag];
			if (d && d[2]) {
				pageWhatToDo.daily.setDate(tag);
				pageWhatToDo.daily.listEvents(d[2]);
			} else {
				var l = geoData.getLatLon();
				communication.loadList('latitude=' + l.lat + '&longitude=' + l.lon + '&query=event_listCurrent&&search=' + encodeURIComponent('eventParticipate.state=1 and eventParticipate.eventDate=\'' + t.getFullYear() + '-' + tag.replace('.', '-') + '\''), function (l) { pageWhatToDo.daily.listEvents(l, tag) });
			}
		},
		loadListOffers(t) {
			if (!t)
				t = pageWhatToDo.daily.date;
			var tag = (t.getMonth() + 1) + '.' + t.getDate();
			var d = pageWhatToDo.daily.data[tag];
			if (d && d[1]) {
				pageWhatToDo.daily.setDate(tag);
				pageWhatToDo.daily.listOffers(d[1]);
			} else if (t < new Date() && (t.getDate() != new Date().getDate() || t.getMonth() != new Date().getMonth() || t.getFullYear() != new Date().getFullYear())) {
				ui.html('#dailyListOffers', '<whatToDoBody>' + ui.l('noResults.daily').replace('{0}', ui.l('wtd.offers')) + '</whatToDoBody>');
				pageWhatToDo.daily.setDate(tag);
			} else {
				var d = t.getFullYear() + '-' + (t.getMonth() + 1) + '-' + t.getDate();
				var l = geoData.getLatLon();
				communication.loadList('latitude=' + l.lat + '&longitude=' + l.lon + '&query=location_list&search=' + encodeURIComponent('location.ownerId is not null and length(location.bonus)>0 and location.urlActive>=\'' + d + '\''), function (l) { pageWhatToDo.daily.listOffers(l, tag) });
			}
		},
		next(next) {
			var s = (pageWhatToDo.daily.date.getTime() - new Date().getTime()) / 86400000;
			if (next && s > 60 || !next && s < -60)
				return;
			var d = new Date(pageWhatToDo.daily.date.getTime());
			d.setDate(pageWhatToDo.daily.date.getDate() + (next ? 1 : -1));
			if (ui.cssValue('#dailyListBirthdays', 'display') == 'block')
				pageWhatToDo.daily.loadListBirthdays(d);
			else if (ui.cssValue('#dailyListOffers', 'display') == 'block')
				pageWhatToDo.daily.loadListOffers(d);
			else if (ui.cssValue('#dailyListEvents', 'display') == 'block')
				pageWhatToDo.daily.loadListEvents(d);
		},
		onClickTab(event, id) {
			ui.navigation.selectTab(event);
			ui.css('#dailyListBirthdays', 'display', '');
			ui.css('#dailyListOffers', 'display', '');
			ui.css('#dailyListEvents', 'display', '');
			var e = ui.q('#dailyList' + id);
			e.style.display = 'block';
			if (id == 'Birthdays')
				pageWhatToDo.daily.loadListBirthdays();
			else if (id == 'Offers')
				pageWhatToDo.daily.loadListOffers();
			else if (id == 'Events')
				pageWhatToDo.daily.loadListEvents();
		},
		refresh() {
			pageWhatToDo.daily.data = [];
			if (ui.cssValue('#dailyListBirthdays', 'display') == 'block')
				pageWhatToDo.daily.loadListBirthdays(new Date());
			else if (ui.cssValue('#dailyListOffers', 'display') == 'block')
				pageWhatToDo.daily.loadListOffers(new Date());
			else if (ui.cssValue('#dailyListEvents', 'display') == 'block')
				pageWhatToDo.daily.loadListEvents(new Date());
		},
		setDate(d) {
			if (d.indexOf('&t=') > -1)
				d = d.substring(d.indexOf('&t=') + 3);
			if (d.indexOf('&') > 0)
				d = d.substring(0, d.indexOf('&'));
			d = d.split('.');
			pageWhatToDo.daily.date.setHours(15);
			if (d[0] == 1 && pageWhatToDo.daily.date.getMonth() == 11)
				pageWhatToDo.daily.date.setFullYear(pageWhatToDo.daily.date.getFullYear() + 1);
			else if (d[0] == 12 && pageWhatToDo.daily.date.getMonth() == 0)
				pageWhatToDo.daily.date.setFullYear(pageWhatToDo.daily.date.getFullYear() - 1);
			pageWhatToDo.daily.date.setDate(d[1]);
			pageWhatToDo.daily.date.setMonth(d[0] - 1);
			var s = global.date.formatDate(pageWhatToDo.daily.date, 'weekdayLong');
			ui.html('whattodotitle date', global.date.getDateHint(pageWhatToDo.daily.date).replace('{0}', s.substring(0, s.lastIndexOf(' '))));
		}
	};
	static init() {
		if (!ui.q('whattodo').innerHTML) {
			communication.ajax({
				url: global.server + 'db/list?query=contact_what2do',
				responseType: 'json',
				success(r) {
					pageWhatToDo.wtd.list = [];
					for (var i = 1; i < r.length; i++)
						pageWhatToDo.wtd.list.push(model.convert(new ContactWhatToDo(), r, i));
					clearTimeout(pageWhatToDo.wtd.resetCall);
					var currentWtd = pageWhatToDo.wtd.getCurrentMessage();
					if (currentWtd && currentWtd.active) {
						pageWhatToDo.wtd.resetCall = setTimeout(pageWhatToDo.wtd.reset, global.date.getDate(currentWtd.time).getTime() - new Date().getTime() + 3600000);
						ui.html('homeStatus', pageWhatToDo.wtd.getDisplayMessage());
					}
					var v = [];
					v['date'] = global.date.formatDate(new Date(), 'weekdayLong');
					v['date'] = global.date.getDateHint(new Date()).replace('{0}', v['date'].substring(0, v['date'].lastIndexOf(' ')));
					ui.html('whattodo', pageWhatToDo.template(v));
					pageWhatToDo.wtd.initListButton();
					if (ui.cssValue('whatToDoLists', 'display') != 'none') {
						ui.css('#wtdListContacts', 'display', 'block');
						pageWhatToDo.wtd.loadListContacts();
					}
					pageWhatToDo.daily.loadListBirthdays();
					ui.addFastButton('whattodo');
				}
			});
		} else
			pageWhatToDo.wtd.initListButton();
		var e = ui.q('[name="badgeNotifications"]');
		if (e && e.innerText > 0)
			pageWhatToDo.openNotifications();
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
			var l = geoData.getLatLon();
			communication.loadList('query=contact_listNotification&latitude=' + l.lat + '&longitude=' + l.lon + '&distance=100000&sort=false', function (l) {
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
					user.save({ values: { notification: s } }, communication.ping);
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
	static wtd = {
		list: null,
		maxRadius: 50,
		resetCall: null,

		checkAttributeLocationsForList(id) {
			for (var i = 0; i < 6; i++) {
				if (user.contact['attr' + i] || user.contact['attr' + i + 'Ex'][i])
					return true;
			}
			ui.html('#wtdList' + id, '<whatToDoBody>' + lists.getListNoResults(id.toLowerCase(), 'matches') + '</whatToDoBody>');
			return false;
		},
		checkAttributeContactsForList() {
			if (!user.contact.attrInterest && !user.contact.attrInterestEx) {
				ui.html('#wtdListContacts', '<whatToDoBody>' + lists.getListNoResults('contacts', 'matches') + '</whatToDoBody>');
				return false;
			}
			return true;
		},
		getCurrentMessage() {
			if (pageWhatToDo.wtd.list && pageWhatToDo.wtd.list[0] && global.date.getDate(pageWhatToDo.wtd.list[0].time).getTime() > new Date().getTime() - 3600000)
				return pageWhatToDo.wtd.list[0];
		},
		getDisplayMessage() {
			var currentMessage = pageWhatToDo.wtd.getCurrentMessage();
			if (!currentMessage || !currentMessage.active)
				return '';
			var s = global.date.getDate(currentMessage.time), cats = currentMessage.keywords.split(',');
			s = s.getHours() + ':' + (s.getMinutes() < 10 ? '0' : '') + s.getMinutes();
			s = ui.l('wtd.autoNewsMe').replace('{0}', s);
			for (var i = 0; i < cats.length; i++)
				s += ui.l('category' + cats[i]) + (i < cats.length - 1 ? ' ' + ui.l('or') + ' ' : '');
			return ui.l('wtd.todayIWant') + ' ' + s;
		},
		getMessages() {
			var list = [];
			if (pageWhatToDo.wtd.list) {
				for (var i = 0; i < pageWhatToDo.wtd.list.length; i++) {
					if (pageWhatToDo.wtd.list[i].message)
						list.push(pageWhatToDo.wtd.list[i].message);
				}
			}
			return list;
		},
		initListButton() {
			var b = pageWhatToDo.wtd.getCurrentMessage();
			b = b && b.active;
			ui.css('whatToDoLists', 'display', b ? '' : 'none');
			ui.css('#wtdListsButton', 'display', b ? 'none' : '');
			if (b)
				ui.html('whatToDoLists whattodotitle', pageWhatToDo.wtd.getDisplayMessage());
		},
		listEvents(r) {
			var s = pageLocation.event.listEventsInternal(pageLocation.event.getCalendarList(r), new Date());
			ui.html('#wtdListEvents', s ? s : '<whatToDoBody>' + lists.getListNoResults('events', 'whatToDo') + '</whatToDoBody>');
			if (s) {
				ui.addFastButton('#wtdListEvents');
				ui.q('#wtdListEvents').lastChild.style.marginBottom = 0;
			}
		},
		listLocation(r) {
			var s = pageLocation.listLocationInternal(r);
			ui.html('#wtdListLocations', s ? s : '<whatToDoBody>' + lists.getListNoResults('locations', 'whatToDo') + '</whatToDoBody>');
			if (s) {
				ui.addFastButton('#wtdListLocations');
				ui.q('#wtdListLocations').lastChild.style.marginBottom = 0;
			}
		},
		listContact(r) {
			var s = pageContact.listContactsInternal(r);
			ui.html('#wtdListContacts', s ? s : '<whatToDoBody>' + lists.getListNoResults('contacts', 'whatToDo') + '</whatToDoBody>');
			if (s) {
				ui.addFastButton('#wtdListContacts');
				ui.q('#wtdListContacts').lastChild.style.marginBottom = 0;
			}
		},
		load(type, query, search, exec, field) {
			var currentWtd = pageWhatToDo.wtd.getCurrentMessage();
			if (currentWtd.keywords && pageWhatToDo.wtd.checkAttributeLocationsForList(type)) {
				var s = ' and (', s2 = currentWtd.keywords.split(',');
				for (var i = 0; i < s2.length; i++)
					s += field + ' like \'%' + s2[i] + '%\' or ';
				search += s.substring(0, s.length - 4) + ')';
				var l = currentWtd.locationLatitude ? currentWtd : geoData.getLatLon();
				communication.loadList('query=' + query + '&latitude=' + l.lat + '&longitude=' + l.lon + '&distance=' + pageWhatToDo.wtd.maxRadius + '&search=' + encodeURIComponent(search), exec);
			}
		},
		loadListEvents() {
			return pageWhatToDo.wtd.load('Events', 'event_listCurrent', pageSearch.getSearchMatchesLocation(), pageWhatToDo.wtd.listEvents, 'location.category');
		},
		loadListLocations() {
			return pageWhatToDo.wtd.load('Locations', 'location_list', pageSearch.getSearchMatchesLocation(), pageWhatToDo.wtd.listLocation, 'location.category');
		},
		loadListContacts() {
			return pageWhatToDo.wtd.load('Contacts', 'contact_list', pageSearch.getSearchMatchesContact(), pageWhatToDo.wtd.listContact, 'contactWhatToDo.keywords');
		},
		onClickTab(event, id) {
			ui.navigation.selectTab(event);
			ui.css('#wtdListContacts', 'display', '');
			ui.css('#wtdListLocations', 'display', '');
			ui.css('#wtdListEvents', 'display', '');
			var e = ui.q('#wtdList' + id);
			e.style.display = 'block';
			if (!e.innerHTML) {
				if (id == 'Locations')
					pageWhatToDo.wtd.loadListLocations();
				else if (id == 'Contacts')
					pageWhatToDo.wtd.loadListContacts();
				else if (id == 'Events')
					pageWhatToDo.wtd.loadListEvents();
			}
		},
		open() {
			ui.navigation.hideMenu();
			var v = [], currentWtd = pageWhatToDo.wtd.getCurrentMessage() || {};
			if (currentWtd.time) {
				var d = global.date.getDate(currentWtd.time);
				v['timeValue'] = (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
			} else {
				var h = (new Date().getHours() + 1) % 24;
				v['timeValue'] = h + ':00';
				if (h < 10)
					v['timeValue'] = '0' + v['timeValue'];
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
			v['hideReset'] = currentWtd.keywords ? '' : 'display:none;';
			v['currentText'] = currentWtd.text;
			if (currentWtd._locationName) {
				v['locName'] = ui.l('wtd.locationLink').replace('{0}', currentWtd._locationName);
				v['locOC'] = 'ui.navigation.autoOpen(&quot;' + global.encParam('l=' + currentWtd.locationId) + '&quot;);';
				v['locDisp'] = 'block';
			} else
				v['locDisp'] = 'none';
			v[currentWtd.text ? 'msgButtonDisp' : 'msgBodyDisp'] = 'display:none;';
			var f = null;
			if (currentWtd.locationName) {
				f = function () {
					var e = ui.q('#whatToDoLocation');
					var f = function (event) {
						event.stopPropagation();
						user.save({ values: { messageLocationId: '' } }, function () {
							currentWtd.locationId = null;
							ui.navigation.animation(e, 'homeSlideOut', function () {
								ui.css(e, 'display', 'none');
								ui.attr(e, 'remove', true);
							});
						}, true);
					};
					ui.swipe(e, function (dir) {
						if (dir == 'left' || dir == 'right')
							f();
					});
				};
			}
			v['displayFacebookPublish'] = user.contact.facebookLink ? '' : 'display:none;';
			ui.navigation.openPopup(ui.l('wtd.todayIWant'), pageWhatToDo.templateWTD(v), null, null, f);
		},
		refresh() {
			ui.html('#wtdListContacts', '');
			ui.html('#wtdListLocations', '');
			ui.html('#wtdListEvents', '');
			pageWhatToDo.wtd.initListButton();
			if (ui.cssValue('whatToDoLists', 'display') != 'none') {
				if (ui.cssValue('#wtdListLocations', 'display') != 'none')
					pageWhatToDo.wtd.loadListLocations();
				else if (ui.cssValue('#wtdListContacts', 'display') != 'none')
					pageWhatToDo.wtd.loadListContacts();
				else if (ui.cssValue('#wtdListEvents', 'display') != 'none')
					pageWhatToDo.wtd.loadListEvents();
			}
		},
		reset() {
			var currentWtd = pageWhatToDo.wtd.getCurrentMessage();
			if (currentWtd && currentWtd.active) {
				communication.ajax({
					url: global.server + 'db/one',
					method: 'PUT',
					body: { classname: 'ContactWhatToDo', id: currentWtd.id, values: { active: false } },
					success() {
						ui.navigation.hidePopup();
						ui.html('whattodo', '');
						if (ui.navigation.getActiveID() == 'whattodo')
							pageWhatToDo.init();
						ui.html('homeStatus', '');
					}
				});
			}
		},
		save() {
			formFunc.resetError(ui.q('[name="wtdCategories"]'));
			formFunc.resetError(ui.q('[name="messageTime"]'));
			var e = ui.qa('[name="wtdCategories"]:checked');
			if (!e.length)
				formFunc.setError(ui.q('[name="wtdCategories"]'), 'wtd.noCategoriesEntered');
			if (!ui.q('#messageTime').value)
				formFunc.setError(ui.q('#messageTime'), 'wtd.noTimeEntered');
			formFunc.validation.filterWords(ui.q('#messageText'));
			if (ui.q('popup errorHint') && ui.q('popup errorHint').innerText)
				return;
			var cats = '';
			for (var i = 0; i < e.length; i++)
				cats += ',' + e[i].value;
			cats = cats.substring(1);
			pageWhatToDo.wtd.saveInternal(cats, ui.q('#messageText').value, function () {
				if (ui.navigation.getActiveID() == 'whattodo')
					ui.navigation.hidePopup();
				else
					ui.navigation.goTo('whattodo');
			}, ui.q('#whatToDoLocation').getAttribute('remove') ? false : null);
		},
		saveInternal(cat, msg, exec, locID, postfix) {
			var currentWtd = pageWhatToDo.wtd.getCurrentMessage();
			var time = new Date(), hour = ui.q('#messageTime' + (postfix ? postfix : '')).value.split(':'), budget = '';
			var e = ui.qa('[name="messageBudget"]:checked');
			for (var i = 0; i < e.length; i++)
				budget += ',' + e[i].value;
			if (budget)
				budget = budget.substring(1);
			if (time.getHours() >= hour[0])
				time.setDate(time.getDate() + 1);
			time.setHours(hour[0]);
			time.setMinutes(hour[1]);
			time.setSeconds(0);
			time.setMilliseconds(0);
			time.setHours(time.getHours() - time.getTimezoneOffset() / 60);
			msg = msg.replace(/</g, '&lt;');
			var v = { classname: 'ContactWhatToDo', values: { active: true, keywords: cat, time: time.toISOString(), budget: budget, message: msg } };
			if (locID)
				v.values.locationId = locID;
			if (currentWtd)
				v.id = currentWtd.id;
			communication.ajax({
				url: global.server + 'db/one',
				method: currentWtd ? 'PUT' : 'POST',
				body: v,
				success() {
					pageWhatToDo.wtd.list = null;
					ui.html('whattodo', '');
					if (ui.navigation.getActiveID() == 'whattodo')
						pageWhatToDo.init();
					exec.call();
				}
			});
		},
		saveLocation(exec, cat, id) {
			pageWhatToDo.wtd.saveInternal(cat, '', exec, id, 'Detail');
		}
	}
};