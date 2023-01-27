import QRCodeStyling from "qr-code-styling";
import { communication } from "./communication";
import { details } from "./details";
import { geoData } from "./geoData";
import { global } from "./global";
import { hashtags } from "./hashtags";
import { intro } from "./intro";
import { lists } from "./lists";
import { Contact, Event, Location, model } from "./model";
import { pageContact } from "./pageContact";
import { pageHome } from "./pageHome";
import { pageLocation } from "./pageLocation";
import { formFunc, ui } from "./ui";
import { user } from "./user";

export { pageEvent };

class pageEvent {
	static filter = null;
	static nearByExec = null;
	static paypal = null;
	static templateEdit = v =>
		global.template`<form name="editElement" onsubmit="return false">
<input type="hidden" name="id" value="${v.id}"/>
<input type="hidden" name="locationId" value="${v.locationID}"/>
<input type="hidden" name="confirm" />
<input type="hidden" name="skills" value="${v.skills}" />
<input type="hidden" name="skillsText" value="${v.skillsText}" />
<field class="location${v.classLocation}">
	<label style="padding-top:0;">${ui.l('events.location')}</label>
	<value style="text-align:center;">
		<input transient="true" name="location" onkeyup="pageEvent.locations()" />
		<eventLocationInputHelper><explain>${ui.l('events.locationInputHint')}</explain>
			<li onclick="pageEvent.locationSelected()" class="highlightColor">${ui.l('events.newOnlineEvent')}</li>
			<ul></ul>
			<explain style="margin-bottom:0.5em;">${ui.l('events.locationInputHintCreateNew')}</explain>
			<buttontext onclick="pageLocation.edit()" class="bgColor">${ui.l('locations.new')}</buttontext>
		</eventLocationInputHelper>
	</value>
</field>
<div class="event" ${v.styleEvent}>
<div class="locationName"></div>
<field>
	<label style="padding-top:0;">${ui.l('type')}</label>
	<value>
		<input type="radio" name="type" value="o" label="${ui.l('events.type_o')}" onclick="pageEvent.setForm()" ${v.type_o}/>
		<input type="radio" name="type" value="w1" label="${ui.l('events.type_w1')}" onclick="pageEvent.setForm()" ${v.type_w1}/>
		<input type="radio" name="type" value="w2" label="${ui.l('events.type_w2')}" onclick="pageEvent.setForm()" ${v.type_w2}/>
		<input type="radio" name="type" value="m" label="${ui.l('events.type_m')}" onclick="pageEvent.setForm()" ${v.type_m}/>
		<input type="radio" name="type" value="y" label="${ui.l('events.type_y')}" onclick="pageEvent.setForm()" ${v.type_y}/>
	</value>
</field>
<field>
	<label name="startDate">${ui.l('events.start')}</label>
	<value>
		<input type="datetime-local" name="startDate" placeholder="TT.MM.JJJJ HH:MM" value="${v.startDate}" step="900" min="${v.today}T00:00:00" />
	</value>
</field>
<field name="endDate">
	<label>${ui.l('events.end')}</label>
	<value>
		<input type="date" name="endDate" placeholder="TT.MM.JJJJ" value="${v.endDate}" min="${v.today}" />
	</value>
</field>
<field>
	<label>${ui.l('description')}</label>
	<value>
		<textarea name="text" maxlength="1000">${v.text}</textarea>
	</value>
</field>
<field>
	<label>${ui.l('events.maxParticipants')}</label>
	<value>
		<input type="number" name="maxParticipants" maxlength="250" value="${v.maxParticipants}" onmousewheel="return false;" />
	</value>
</field>
<field>
	<label>${ui.l('events.price')}</label>
	<value>
		<input type="number" step="any" name="price" value="${v.price}" onkeyup="pageEvent.checkPrice()" onmousewheel="return false;" />
		<explain class="paypal" style="display:none;">${ui.l('events.paypalSignUpHint')}
			<dialogButtons>
				<buttontext class="bgColor" onclick="pageEvent.signUpPaypal()">${ui.l('events.paypalSignUpButton')}</buttontext>
			</dialogButtons>
		</explain>
	</value>
</field>
<field class="paid" style="display:none;">
	<label>${ui.l('picture')}</label>
	<value>
		<input type="file" name="image" accept=".gif, .png, .jpg" />
	</value>
</field>
<div class="unpaid">
<field>
	<label>${ui.l('events.confirmLabel')}</label>
	<value>
		<input type="checkbox" name="eventconfirm" transient="true" label="${ui.l('events.confirm')}" value="1" ${v.confirm}/>
	</value>
</field>
<field>
	<label>${ui.l('events.visibility')}</label>
	<value>
		<input type="radio" name="visibility" value="2" label="${ui.l('events.visibility2')}" ${v.visibility2}/>
		<input type="radio" name="visibility" value="3" label="${ui.l('events.visibility3')}" ${v.visibility3}/>
	</value>
</field>
</div>
<field>
	<label>${ui.l('events.hashtags')}</label>
	<value>
		<textarea name="hashtagsDisp" maxlength="250" transient="true" onkeyup="ui.adjustTextarea(this)" style="height:2em;">${v.hashtagsDisp}</textarea>
		<hashtags>${v.hashtagSelection}</hashtags>
	</value>
</field>
<dialogButtons style="margin-bottom:0;">
	<buttontext onclick="pageEvent.save()" class="bgColor">${ui.l('save')}</buttontext>
	<buttontext onclick="pageLocation.deleteElement(${v.id},&quot;Event&quot;)" class="bgColor${v.hideDelete}" id="deleteElement">${ui.l('delete')}</buttontext>
	<popupHint></popupHint>
</dialogButtons>
</div>
</form>`;
	static templateDetail = v =>
		global.template`<text class="description${v.classParticipate}" ${v.oc}>
<div>${ui.l('events.createdBy')}<br/><span class="chatLinks" onclick="ui.navigation.autoOpen(global.encParam(&quot;p=${v.event.contactId}&quot;),event)"><img src="${v.imageEventOwner}"><br>${v.contact.pseudonym}</span></div>
<div class="date" d="${v.dateRaw}">${v.date}${v.endDate}</div>
<div>${v.event.text}</div>
<div>${v.eventMustBeConfirmed}</div>
<div class="price">${v.eventPrice}</div>
<div>${v.maxParticipants}</div>
<div>${v.reason}</div>
<span id="eventParticipants"></span>
${v.eventParticipationButtons}
</text>`;
	static checkPrice() {
		var e = ui.q('popup explain.paypal');
		if (ui.q('popup [name="price"]').value > 0) {
			if (user.contact.paypalMerchantId && ui.cssValue(e, 'display') != 'none' ||
				!user.contact.paypalMerchantId && ui.cssValue(e, 'display') == 'none')
				ui.toggleHeight(e);
			if (ui.cssValue(e = ui.q('popup .unpaid'), 'display') != 'none')
				ui.toggleHeight(e, function () { ui.toggleHeight('popup .paid') });
		} else {
			if (ui.cssValue(e, 'display') != 'none')
				ui.toggleHeight(e);
			if (ui.cssValue(e = ui.q('popup .paid'), 'display') != 'none')
				ui.toggleHeight(e, function () { ui.toggleHeight('popup .unpaid') });
		}
	}
	static detail(v) {
		v.copyLinkHint = ui.l('copyLinkHint.event');
		if (v.event.contactId != user.contact.id)
			v.hideMeEdit = ' noDisp';
		if (v.event.type != 'o') {
			var s = global.date.formatDate(v.event.endDate);
			v.endDate = ' (' + ui.l('events.type_' + v.event.type) + ' ' + ui.l('to') + ' ' + s.substring(s.indexOf(' ') + 1, s.lastIndexOf(' ')) + ')';
		}
		v.id = pageEvent.getId(v);
		if (('' + v.id).indexOf('_') < 0) {
			v.date = global.date.formatDate(v.event.startDate);
			v.date = '<eventOutdated>&nbsp;' + v.date;
			v[v.endDate ? 'endDate' : 'date'] += '&nbsp;</eventOutdated>';
		} else {
			var d = global.date.getDateFields(v.eventParticipate.eventDate);
			var d2 = global.date.getDateFields(v.event.startDate);
			d.hour = d2.hour;
			d.minute = d2.minute;
			v.dateRaw = d.year + '-' + d.month + '-' + d.day + 'T' + d.hour + ':' + d.minute + ':00';
			v.date = global.date.formatDate(d);
			v.eventParticipationButtons = pageEvent.getParticipateButton(v);
			if (v.eventParticipate.state == 1)
				v.classParticipate = ' participate';
			else if (p.state == -1 && v.event.confirm == 1) {
				v.classParticipate = ' canceled';
				v.reason = ui.l('events.canceled') + p.reason;
			}
			communication.ajax({
				url: global.server + 'db/list?query=contact_eventParticipateCount&search=' + encodeURIComponent('eventParticipate.state=1 and eventParticipate.eventId=' + v.event.id + ' and eventParticipate.eventDate=\'' + v.eventParticipate.eventDate + '\''),
				responseType: 'json',
				success(r) {
					if (r[1][0] > -1) {
						var e = ui.q('detail card[i="' + v.id + '"] participantCount');
						if (e && r[1][0] > 0)
							e.innerHTML = r[1][0] + ' ';
						if (!v.event.maxParticipants || r[1][0] < v.event.maxParticipants) {
							e = ui.q('detail card[i="' + v.id + '"] buttontext[pID]');
							if (e)
								e.style.display = '';
						}
					}
				}
			});
		}
		v.eventPrice = (v.event.price > 0 ? ui.l('events.priceDisp').replace('{0}', parseFloat(v.event.price).toFixed(2)) : ui.l('events.priceDisp0'));
		if (v.event.maxParticipants)
			v.maxParticipants = ui.l('events.maxParticipants') + ':&nbsp;' + v.event.maxParticipants;
		if (v.event.confirm == 1)
			v.eventMustBeConfirmed = ui.l('events.participationMustBeConfirmed');
		if (v.contact.imageList)
			v.imageEventOwner = global.serverImg + v.contact.imageList;
		else
			v.imageEventOwner = 'images/contact.svg" style="padding:1em;';
		v.hideMeFavorite = ' noDisp';
		v.hideMeEvents = ' noDisp';
		v.hideMeMarketing = ' noDisp';
		v.editAction = 'pageEvent.edit(' + v.locID + ',' + v.event.id + ')';
		return pageEvent.templateDetail(v);
	}
	static edit(locationID, id) {
		ui.navigation.hideMenu();
		if (id)
			pageEvent.editInternal(locationID, id, JSON.parse(decodeURIComponent(ui.q('detail card:last-child detailHeader').getAttribute('data'))).event);
		else
			pageEvent.editInternal(locationID);
	}
	static editInternal(locationID, id, v) {
		if (!id && (locationID && formFunc.getDraft('event' + locationID) || !locationID && formFunc.getDraft('event'))) {
			v = formFunc.getDraft('event' + (locationID ? locationID : '')).values;
			if (v.startDate &&
				global.date.server2Local(v.startDate).getTime() < new Date().getTime())
				v.startDate = null;
		}
		if (!v)
			v = {};
		var d;
		if (v.startDate) {
			d = global.date.getDateFields(global.date.server2Local(v.startDate));
			v.startDate = d.year + '-' + d.month + '-' + d.day + 'T' + d.hour + ':' + d.minute;
		}
		if (!id)
			v.hideDelete = ' noDisp';
		d = new Date();
		v.today = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
		v.id = id;
		v.locationID = locationID;
		if (!v.type || v.type == 'o')
			v.type_o = ' checked';
		if (v.type == 'w1')
			v.type_w1 = ' checked';
		if (v.type == 'w2')
			v.type_w2 = ' checked';
		if (v.type == 'm')
			v.type_m = ' checked';
		if (v.type == 'y')
			v.type_y = ' checked';
		if (v.confirm)
			v.confirm = ' checked';
		if (!v.visibility)
			v.visibility = '3';
		v['visibility' + v.visibility] = ' checked';
		if (!v.startDate) {
			d = new Date();
			d.setDate(d.getDate() + 1);
			v.startDate = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + 'T' + ('0' + d.getHours()).slice(-2) + ':00';
		}
		if (!v.endDate) {
			d = new Date();
			d.setMonth(d.getMonth() + 6);
			v.endDate = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
		}
		if (locationID)
			v.classLocation = ' noDisp';
		else {
			v.styleEvent = ' style="display:none;"';
			pageEvent.locationsOfPastEvents();
		}
		v.hashtagSelection = hashtags.display();
		ui.navigation.openPopup(ui.l('events.' + (id ? 'edit' : 'new')), pageEvent.templateEdit(v), 'pageEvent.saveDraft()');
		if (locationID)
			pageEvent.setForm();
	}
	static getCalendarList(data) {
		if (!data || data.length == 0)
			return '';
		var today = new Date();
		var s;
		var todayPlus14 = new Date();
		var actualEvents = [], otherEvents = [];
		today.setHours(0);
		today.setMinutes(0);
		today.setSeconds(0);
		todayPlus14.setDate(todayPlus14.getDate() + 13);
		todayPlus14.setHours(23);
		todayPlus14.setMinutes(59);
		todayPlus14.setSeconds(59);
		for (var i = 1; i < data.length; i++) {
			var v = model.convert(new Location(), data, i);
			var d1 = global.date.server2Local(v.event.startDate);
			var d2 = global.date.server2Local(v.event.endDate);
			var added = false;
			if (d1 < todayPlus14 && d2 > today) {
				if (v.event.type == 'w1') {
					while (d1 < today)
						d1.setDate(d1.getDate() + 7);
				} else if (v.event.type == 'w2') {
					while (d1 < today)
						d1.setDate(d1.getDate() + 14);
				} else if (v.event.type == 'm') {
					while (d1 < today)
						d1.setMonth(d1.getMonth() + 1);
				} else if (v.event.type == 'y') {
					while (d1 < today)
						d1.setFullYear(d1.getFullYear() + 1);
				}
				do {
					if (d1 > today && d1 < todayPlus14) {
						added = true;
						var v2 = JSON.parse(JSON.stringify(v));
						v2.event.startDate = new Date(d1.getTime());
						actualEvents.push(v2);
					}
					if (v.event.type == 'w1')
						d1.setDate(d1.getDate() + 7);
					else if (v.event.type == 'w2')
						d1.setDate(d1.getDate() + 14);
					else if (v.event.type == 'm')
						d1.setMonth(d1.getMonth() + 1);
					else if (v.event.type == 'y')
						d1.setFullYear(d1.getFullYear() + 1);
					else
						break;
				} while (v.event.type != 'o' && d1 < todayPlus14);
			}
			if (!added && user.contact.id == v.event.contactId) {
				v.event.startDate = global.date.server2Local(v.event.startDate);
				otherEvents.push(v);
			}
		}
		actualEvents.sort(function (a, b) { return a.event.startDate > b.event.startDate ? 1 : -1; });
		if (otherEvents.length > 0) {
			otherEvents.sort(function (a, b) { return a.event.startDate > b.event.startDate ? -1 : 1; });
			actualEvents.push('outdated');
			actualEvents = actualEvents.concat(otherEvents);
		}
		return actualEvents;
	}
	static getId(v) {
		var endDate = global.date.server2Local(v['event.endDate'] || v.event.endDate), today = new Date(), id = v.id || v['event.id'];
		today.setHours(0);
		today.setMinutes(0);
		today.setSeconds(0);
		if (('' + v.id).indexOf('_') < 0 && (endDate.getFullYear() > today.getFullYear() || endDate.getFullYear() == today.getFullYear() &&
			(endDate.getMonth() > today.getMonth() || endDate.getMonth() == today.getMonth() &&
				endDate.getDate() >= today.getDate()))) {
			var d = global.date.server2Local(v['event.startDate'] || v.event.startDate), t = v['event.type'] || v.event.type;
			if (t == 'w1') {
				while (d < today)
					d.setDate(d.getDate() + 7);
			} else if (t == 'w2') {
				while (d < today)
					d.setDate(d.getDate() + 14);
			} else if (t == 'm') {
				while (d < today)
					d.setMonth(d.getMonth() + 1);
			} else if (t == 'y') {
				while (d < today)
					d.setFullYear(d.getFullYear() + 1);
			}
			id += '_' + d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
		}
		return id;
	}
	static getParticipateButton(v) {
		if (v.event.confirm && v.eventParticipate.state == -1)
			return '';
		var text = '<div style="margin:1em 0;">';
		if (v.event.contactId == user.contact.id && v.event.locationId || v.eventParticipate.state == 1)
			text += '<buttontext class="bgColor" onclick="pageEvent.qrcode(' + (v.event.contactId == user.contact.id) + ')">' + ui.l('events.qrcodeButton') + '</buttontext><br/><br/>';
		text += '<buttontext pID="' + (v.eventParticipate.id ? v.eventParticipate.id : '') + '" s="' + (v.eventParticipate.id ? v.eventParticipate.state : '') + '" confirm="' + v.event.confirm + '" class="bgColor" onclick="pageEvent.participate(event)" max="' + (v.maxParticipants ? v.maxParticipants : 0) + '" style="display:none;">' + ui.l('events.participante' + (v.eventParticipate.state == 1 ? 'Stop' : '')) + '</buttontext>';
		text += '<buttontext class="bgColor" onclick="pageEvent.toggleParticipants(event)"><participantCount></participantCount>' + ui.l('events.participants') + '</buttontext>';
		text += '</div><text name="participants" style="margin:0 -1em;display:none;"></text>';
		return text;
	}
	static init() {
		if (!ui.q('events').innerHTML)
			lists.setListDivs('events');
		if (!ui.q('events listResults row'))
			setTimeout(ui.navigation.toggleMenu, 500);
		if (!pageLocation.map.svgLocation)
			communication.ajax({
				url: '/images/location.svg',
				success(r) {
					var e = new DOMParser().parseFromString(r, "text/xml").getElementsByTagName('svg')[0];
					e.setAttribute('fill', 'black');
					e.setAttribute('stroke', 'black');
					e.setAttribute('stroke-width', '60');
					pageLocation.map.svgLocation = 'data:image/svg+xml;base64,' + btoa(e.outerHTML);
				}
			});
		if (!pageLocation.map.svgMe)
			communication.ajax({
				url: '/images/contact.svg',
				success(r) {
					var e = new DOMParser().parseFromString(r, "text/xml").getElementsByTagName('svg')[0];
					e.setAttribute('fill', 'black');
					e.setAttribute('stroke', 'black');
					e.setAttribute('stroke-width', '20');
					pageLocation.map.svgMe = 'data:image/svg+xml;base64,' + btoa(e.outerHTML);
				}
			});
		if (!pageEvent.paypal && !user.contact.paypalMerchantId)
			communication.ajax({
				url: global.server + 'action/paypalSignUpSellerUrl',
				success(r) {
					pageEvent.paypal = r + '&displayMode=minibrowser';
				}
			});
	}
	static listEvents(l) {
		var activeID = ui.navigation.getActiveID()
		if (activeID == 'search')
			ui.attr('search', 'type', 'events');
		return pageEvent.listEventsInternal(pageEvent.getCalendarList(l));
	}
	static listEventsInternal(as) {
		if (!as.length)
			return '';
		var today = new Date();
		today.setHours(0);
		today.setMinutes(0);
		today.setSeconds(0);
		var s = '', v;
		var current = '';
		var bg = 'mainBG';
		for (var i = 0; i < as.length; i++) {
			if (as[i] == 'outdated')
				s += '<listSeparator class="highlightColor strong">' + ui.l('events.outdated') + '</listSeparator>';
			else {
				v = as[i];
				var startDate = global.date.server2Local(v.event.startDate);
				var s2 = global.date.formatDate(startDate, 'weekdayLong');
				var s3 = s2.substring(0, s2.lastIndexOf(' '));
				if (s3 != current) {
					current = s3;
					if (startDate >= today)
						s += '<listSeparator>' + global.date.getDateHint(startDate).replace('{0}', s3) + '</listSeparator>';
				}
				var t = global.date.formatDate(startDate);
				if (startDate >= today)
					t = t.substring(t.lastIndexOf(' ') + 1);
				if (v.name)
					v.name = t + ' ' + v.name;
				else {
					v.name = t + ' ' + v.contact.pseudonym + (v.contact.age ? ' (' + v.contact.age + ')' : '');
					v._message1 = hashtags.ids2Text(v.event.skills) + (v.event.skillsText ? ' ' + v.event.skillsText : '');
				}
				v._message = v.event.text + '<br/>';
				v.locID = v.id;
				pageLocation.listInfos(v);
				v._message += v._message1 ? v._message1 : v._message2 ? v._message2 : '';
				v.id = v.event.id;
				v.classFavorite = v.locationFavorite.favorite ? ' favorite' : '';
				if (v.eventParticipate.state == 1)
					v.classFavorite += ' participate';
				else if (v.eventParticipate.state == -1 && v.event.confirm == 1)
					v.classFavorite += ' canceled';
				if (startDate >= today) {
					var d = global.date.getDateFields(v.event.startDate);
					v.id += '_' + d.year + '-' + d.month + '-' + d.day;
				}
				v.classBGImg = v.imageList ? '' : bg;
				if (v.event.imageList)
					v.image = global.serverImg + v.event.imageList;
				else if (v.imageList)
					v.image = global.serverImg + v.imageList;
				else if (v.contact.imageList)
					v.image = global.serverImg + v.contact.imageList;
				else if (v.id)
					v.image = 'images/event.svg" style="padding: 1em;';
				else
					v.image = 'images/contact.svg" style="padding: 1em;';
				v.classBg = bg;
				v._geolocationDistance = v._geolocationDistance ? parseFloat(v._geolocationDistance).toFixed(v._geolocationDistance >= 9.5 ? 0 : 1).replace('.', ',') : '';
				v.type = 'Event';
				if (ui.navigation.getActiveID() == 'settings')
					v.oc = 'pageSettings.unblock(' + v.id + ',' + v.block.id + ')';
				else
					v.oc = 'details.open(&quot;' + v.id + '&quot;,&quot;location_listEvent&search=' + encodeURIComponent('event.id=' + v.event.id) + '&quot;,pageLocation.detailLocationEvent)';
				s += pageLocation.templateList(v);
			}
		}
		return s;
	}
	static listTickets(r) {
		var as = [], ap = [], today = new Date();
		today.setHours(0);
		today.setMinutes(0);
		today.setSeconds(0);
		for (var i = 1; i < r.length; i++) {
			var e = model.convert(new Location(), r, i);
			e.event.startDate = global.date.server2Local(e.eventParticipate.eventDate + e.event.startDate.substring(10));
			if (e.event.startDate >= today)
				as.push(e);
			else
				ap.push(e);
		}
		as.sort(function (a, b) { return a.event.startDate > b.event.startDate ? 1 : -1; });
		ap.sort(function (a, b) { return a.event.startDate > b.event.startDate ? -1 : 1; });
		var s = pageEvent.listEventsInternal(as),
			p = pageEvent.listEventsInternal(ap);
		return (s ? '<listSeparator class="highlightColor strong">' + ui.l('events.ticketCurrent') + '</listSeparator>' + s : '') +
			(p ? '<listSeparator class="highlightColor strong">' + ui.l('events.ticketPast') + '</listSeparator>' + p : '');
	}
	static loadPotentialParticipants() {
		var i = ui.q('detail card:last-child').getAttribute('i');
		if (ui.q('detail card[i="' + i + '"] [name="potentialParticipants"] detailTogglePanel').innerText) {
			details.togglePanel(ui.q('detail card[i="' + i + '"] [name="potentialParticipants"]'));
			return;
		}
		var e = JSON.parse(decodeURIComponent(ui.q('detail card:last-child detailHeader').getAttribute('data')));
		var search = (e.event.visibility == 2 ? global.getRegEx('contact.skills', e.event.skills) + ' or ' + global.getRegEx('contact.skillsText', e.event.skillsText) + ' and ' : '') +
			'contact.id<>' + user.contact.id;
		communication.loadList('query=contact_list&distance=50&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&search=' + encodeURIComponent(search),
			function (r) {
				var s = pageContact.listContacts(r);
				if (!s)
					s = ui.l('events.noPotentialParticipant');
				ui.q('detail card[i="' + i + '"] [name="potentialParticipants"] detailTogglePanel').innerHTML = s;
				details.togglePanel(ui.q('detail card[i="' + i + '"] [name="potentialParticipants"]'));
			});
	}
	static locations() {
		clearTimeout(pageEvent.nearByExec);
		var s = ui.q('popup input[name="location"]').value.trim();
		if (s.length > 3)
			pageEvent.nearByExec = setTimeout(function () {
				communication.ajax({
					url: global.server + 'action/searchLocation?search=' + encodeURIComponent(s),
					responseType: 'json',
					success(r) {
						var s = '', e = ui.q('popup eventLocationInputHelper ul');
						if (e) {
							for (var i = 0; i < r.length; i++)
								s += '<li i="' + r[i].id + '" onclick="pageEvent.locationSelected(this)">' + r[i].name + '<br/>' + r[i].address.replace(/\n/g, global.separator) + '</li>';
							e.innerHTML = s;
						}
					}
				});
			}, 1000);
	}
	static locationsOfPastEvents() {
		communication.ajax({
			url: global.server + 'db/list?query=location_listEvent&search=' + encodeURIComponent('event.locationId is not null and event.contactId=' + user.contact.id),
			responseType: 'json',
			success(r) {
				var s = '', processed = {};
				for (var i = 1; i < r.length; i++) {
					var l = model.convert(new Location(), r, i);
					if (!processed[l.id]) {
						s += '<li i="' + l.id + '" onclick="pageEvent.locationSelected(this)">' + l.name + '<br/>' + l.address.replace(/\n/g, global.separator) + '</li>';
						processed[l.id] = 1;
					}
				}
				if (s) {
					var i = 0;
					var f = function () {
						i++;
						var e = ui.q('popup eventLocationInputHelper ul');
						if (e)
							e.innerHTML = s;
						else if (i < 10)
							setTimeout(f, 50);
					};
					setTimeout(f, 50);
				}
			}
		});
	}
	static locationSelected(e) {
		ui.q('popup input[name="locationId"]').value = e ? e.getAttribute('i') : -1;
		ui.q('popup .locationName').innerHTML = e ? e.innerHTML : ui.l('events.newOnlineEvent');
		ui.toggleHeight('popup .location', function () {
			ui.toggleHeight('popup .event');
			pageEvent.setForm();
			if (ui.q('popup [name="hashtagsDisp"]').value)
				setTimeout(function () { ui.adjustTextarea(ui.q('popup [name="hashtagsDisp"]')); }, 500);
		});
	}
	static participate(event) {
		event.stopPropagation();
		var e = JSON.parse(decodeURIComponent(ui.q('detail card:last-child detailHeader').getAttribute('data')));
		if (e.event.price > 0 && !user.contact.image) {
			ui.navigation.openPopup(ui.l('attention'), ui.l('events.participationNoImage') + '<br/><br/><buttontext class="bgColor" onclick="ui.navigation.goTo(&quot;settings&quot;)">' + ui.l('settings.editProfile') + '</buttontext > ');
			return;
		}
		var button = event.target;
		var participateID = button.getAttribute('pID');
		var d = { classname: 'EventParticipate', values: {} };
		var eventDate = e.event.startDate.substring(0, 10);
		if (participateID) {
			d.values.state = button.getAttribute('s') == 1 ? -1 : 1;
			d.id = participateID;
			if (button.getAttribute('confirm') == 1) {
				if (!ui.q('#stopParticipateReason')) {
					ui.navigation.openPopup(ui.l('events.stopParticipate'), ui.l('events.stopParticipateText') + '<br/><textarea id="stopParticipateReason" placeholder="' + ui.l('events.stopParticipateHint') + '" style="margin-top:0.5em;"></textarea><buttontext class="bgColor" style="margin-top:1em;" pID="' + button.getAttribute('pID') + '" s="' + button.getAttribute('s') + '" confirm="1" onclick="pageEvent.participate(event)">' + ui.l('events.stopParticipateButton') + '</buttontext>');
					return;
				}
				if (!ui.q('#stopParticipateReason').value)
					return;
				d.values.reason = ui.q('#stopParticipateReason').value;
			}
		} else {
			d.values.state = 1;
			d.values.eventId = e.event.id;
			d.values.eventDate = eventDate;
		}
		communication.ajax({
			url: global.server + 'db/one',
			method: participateID ? 'PUT' : 'POST',
			body: d,
			success(r) {
				if (r)
					ui.attr(button, 'pID', r);
				var e = ui.q('detail card[i="' + e.event.id + '_' + eventDate + '"] participantCount');
				if (button.getAttribute('s') == '1') {
					ui.classRemove('detail card:last-child .event', 'participate');
					ui.classRemove('row[i="' + e.event.id + '_' + eventDate + '"]', 'participate');
					e.innerHTML = e.innerHTML && parseInt(e.innerHTML) > 1 ? (parseInt(e.innerHTML) - 1) + ' ' : '';
					if (button.getAttribute('confirm') == '1') {
						ui.classAdd('detail card:last-child .event', 'canceled');
						ui.classAdd('row[i="' + e.event.id + '_' + eventDate + '"]', 'canceled');
						ui.q('detail card:last-child buttontext[pID="' + participateID + '"]').outerHTML = '';
					} else {
						ui.attr(button, 's', '-1');
						button.innerText = ui.l('events.participante');
					}
				} else {
					ui.attr(button, 's', '1');
					button.innerText = ui.l('events.participanteStop');
					e.innerHTML = e.innerHTML ? (parseInt(e.innerHTML) + 1) + ' ' : '1 ';
					ui.classAdd('detail card:last-child .event', 'participate');
					ui.classAdd('row[i="' + e.event.id + '_' + eventDate + '"]', 'participate');
				}
				e = ui.q('detail card:last-child[i="' + e.event.id + '_' + eventDate + '"] [name="participants"]');
				e.innerHTML = '';
				e.removeAttribute('h');
				e.style.display = 'none';
				ui.navigation.hidePopup();
			}
		});
	}
	static qrcode(location) {
		var id = ui.q('detail card:last-child').getAttribute('i');
		new QRCodeStyling({
			width: 600,
			height: 600,
			data: global.server.substring(0, global.server.lastIndexOf('/', global.server.length - 2)) + '?' + global.encParam('q=' + id + (location ? '' : '|' + user.contact.id)),
			dotsOptions: {
				color: 'rgb(255, 220, 70)',
				type: 'square'
			},
			backgroundOptions: {
				color: 'transparent',
			}
		}).getRawData('png').then(function (qr) {
			var canvas = document.createElement('canvas');
			canvas.height = 1332;
			canvas.width = 888;
			var context = canvas.getContext('2d');
			var grd = context.createLinearGradient(0, 0, canvas.width, canvas.height);
			grd.addColorStop(0, 'rgb(70, 138, 180)');
			grd.addColorStop(1, 'rgb(25, 50, 100)');
			context.fillStyle = grd;
			context.fillRect(0, 0, canvas.width, canvas.height);
			context.fillStyle = 'white';
			var image = new Image();
			image.src = URL.createObjectURL(qr);
			image.onload = function () {
				context.drawImage(image, 144, 650);
				var e = JSON.parse(decodeURIComponent(ui.q('detail card:last-child detailHeader').getAttribute('data')));
				context.font = '60px Comfortaa';
				context.textAlign = 'center';
				context.textBaseline = 'top';
				var h = 80;
				context.fillText(e.name, canvas.width / 2, h);
				context.font = '30px Comfortaa';
				var a = e.address.split('\n');
				h += 40;
				for (var i = 0; i < a.length; i++) {
					h += 40;
					context.fillText(a[i], canvas.width / 2, h);
				}
				h += 60;
				a = ui.q('detail card:last-child text.description .date').innerHTML;
				if (a.indexOf(' (') > -1)
					a = a.substring(0, a.indexOf(' ('));
				context.fillText(ui.l('events.qrcodeDate').replace('{0}', a), canvas.width / 2, h);
				h += 60;
				if (location) {
					a = ui.q('detail card:last-child text.description .price').innerHTML;
					context.fillText(a, canvas.width / 2, h);
					var a = e.event.text.split('\n');
					h += 20;
					for (var i = 0; i < a.length; i++) {
						h += 40;
						context.fillText(a[i], canvas.width / 2, h);
					}
				} else
					context.fillText(ui.l('events.qrcodeConfirmation').replace('{0}', user.contact.pseudonym), canvas.width / 2, h);
				image = new Image();
				image.src = 'data:image/svg+xml;utf8,' + ui.q('home homeHeader svg').outerHTML;
				image.onload = function () {
					context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 655, 30, 200, image.naturalHeight / image.naturalWidth * 200);
					if (location)
						pageEvent.qrcodeExport(canvas);
					else {
						image = new Image();
						image.src = user.contact.image ? global.serverImg + user.contact.image : 'images/contact.svg';
						image.crossOrigin = 'anonymous';
						image.onload = function () {
							var r = 100;
							h = 520;
							context.arc(canvas.width / 2, h, r, 0, 2 * Math.PI, true);
							context.clip();
							context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, canvas.width / 2 - r, h - r, r * 2, image.naturalHeight / image.naturalWidth * r * 2);
							pageEvent.qrcodeExport(canvas);
						};
					}
				};
			};
		});
	}
	static qrcodeExport(canvas) {
		canvas.toBlob(blob => {
			var data = window.URL.createObjectURL(blob);
			var link = document.createElement('a');
			link.href = data;
			link.download = 'qr' + ui.q('detail card:last-child').getAttribute('i') + '.jpg';
			link.click();
		}, 'image/jpeg');
	}
	static refreshToggle() {
		var e = ui.q('detail card:last-child [name="events"]');
		if (e) {
			var id = ui.q('detail card:last-child').getAttribute('i');
			ui.toggleHeight(e, function () {
				e.innerHTML = '';
				pageEvent.toggle(id);
			});
		}
	}
	static save() {
		var d1, d2;
		var start = ui.q('popup input[name="startDate"]');
		var end = ui.q('popup input[name="endDate"]');
		var text = ui.q('popup [name="text"]');
		var tags = ui.q('popup [name="hashtagsDisp"]');
		var id = ui.q('popup [name="id"]').value;
		ui.html('popup popupHint', '');
		formFunc.resetError(start);
		formFunc.resetError(end);
		formFunc.resetError(text);
		formFunc.resetError(tags);
		formFunc.resetError(ui.q('popup input[name="visibility"]'));
		if (!tags.value)
			formFunc.setError(tags, 'error.hashtags');
		else
			formFunc.validation.filterWords(tags);
		if (!text.value)
			formFunc.setError(text, 'error.description');
		else
			formFunc.validation.filterWords(text);
		if (!start.value)
			formFunc.setError(start, 'events.errorDate');
		else {
			try {
				if (start.value.indexOf(':') < 0)
					throw 'NaN';
				d1 = global.date.local2server(start.value);
				if (!id && d1 < new Date())
					formFunc.setError(start, 'events.errorDateTooSmall');
			} catch (e) {
				formFunc.setError(start, 'events.errorDateFormat');
			}
		}
		if (ui.q('popup [name="price"]').value > 0 && !user.contact.paypalMerchantId)
			formFunc.setError(ui.q('popup [name="price"]'), 'events.errorActivatePaypal');
		if (!ui.q('popup [name="locationId"]').value)
			formFunc.setError(ui.q('popup input[name="location"]'), 'events.errorLocation');
		if (!ui.q('popup [name="type"]').checked) {
			if (!end.value)
				formFunc.setError(end, 'events.errorDateNoEnd');
			else {
				try {
					d2 = global.date.local2server(end.value);
					if (d1 && d1 > d2)
						formFunc.setError(end, 'events.errorDateEndTooSmall');
				} catch (e) {
					formFunc.setError(end, 'events.errorDateEndFormat');
				}
			}
		}
		var v = hashtags.convert(ui.q('popup [name="hashtagsDisp"]').value);
		ui.q('popup input[name="skills"]').value = v.category;
		ui.q('popup input[name="skillsText"]').value = v.hashtags;
		v = formFunc.getForm('popup form');
		if (v.values.visibility == 2 && (!user.contact.attr || !user.contact.attrInterest))
			formFunc.setError(ui.q('popup input[name="visibility"]'), 'events.errorVisibility');
		if (ui.q('popup errorHint'))
			return;
		if (ui.q('popup [name="type"]').checked)
			end.value = start.value.substring(0, start.value.lastIndexOf('T'));
		ui.q('popup [name="confirm"]').value = ui.q('popup [name="eventconfirm"]:checked') ? 1 : 0;
		v.classname = 'Event';
		if (id)
			v.id = id;
		communication.ajax({
			url: global.server + 'db/one',
			method: id ? 'PUT' : 'POST',
			body: v,
			success(r) {
				ui.navigation.hidePopup();
				formFunc.removeDraft('event');
				details.open(id ? id : r, 'location_listEvent&search=' + encodeURIComponent('event.id=' + r), id ? function (l, id) {
					ui.q('detail card:last-child').innerHTML = pageLocation.detailLocationEvent(l, id);
				} : pageLocation.detailLocationEvent);
				pageEvent.refreshToggle();
			}
		});
	}
	static saveDraft() {
		formFunc.saveDraft('event', formFunc.getForm('popup form'));
	}
	static setForm() {
		var b = ui.q('popup [name="type"]').checked;
		ui.q('popup label[name="startDate"]').innerText = ui.l('events.' + (b ? 'date' : 'start'));
		ui.css('popup field[name="endDate"]', 'display', b ? 'none' : '');
		pageEvent.checkPrice();
	}
	static signUpPaypal() {
		if (pageEvent.paypal) {
			pageEvent.saveDraft();
			ui.navigation.openHTML(pageEvent.paypal + '&displayMode=minibrowser', 'paypal');
		} else
			setTimeout(pageEvent.signUpPaypal, 100);
	}
	static toggle(id) {
		var d = ui.q('detail card:last-child[i="' + id + '"] [name="events"]');
		if (d) {
			if (!d.innerHTML) {
				var field = ui.q('detail card:last-child').getAttribute('type');
				communication.ajax({
					url: global.server + 'db/list?query=location_listEvent&search=' + encodeURIComponent('event.' + field + 'Id=' + id),
					responseType: 'json',
					success(r) {
						pageEvent.toggleInternal(r, id, field);
					}
				});
			} else
				details.togglePanel(ui.q('detail card:last-child[i="' + id + '"] [name="events"]'));
		}
	}
	static toggleInternal(r, id, field) {
		var e = ui.q('detail card:last-child[i="' + id + '"] [name="events"]');
		if (!e)
			return;
		var bg = 'bgColor';
		var a = pageEvent.getCalendarList(r), newButton = field == 'contact' ? '' : '<br/><br/><buttontext onclick="pageEvent.edit(' + id + ')" class="' + bg + '">' + ui.l('events.new') + '</buttontext>';
		var s = '', v, text;
		var b = user.contact.id == id;
		if (b && e.getAttribute('active'))
			b = false;
		for (var i = 1; i < a.length; i++) {
			v = a[i];
			v.bg = bg;
			var s2 = global.date.formatDate(v.event.startDate, 'weekdayLong');
			var date = global.date.getDateFields(v.event.startDate);
			date = date.year + '-' + date.month + '-' + date.day;
			var idIntern = v.event.id + '_' + date;
			s2 = global.date.getDateHint(v.event.startDate).replace('{0}', s2);
			var img;
			if (v.event.imageList || v.imageList)
				img = global.serverImg + (v.event.imageList ? v.event.imageList : v.imageList);
			else
				img = 'images/event.svg" class="' + bg;
			text = '';
			if (v.event.price > 0)
				text += global.separator + ui.l('events.priceDisp').replace('{0}', parseFloat(v.event.price).toFixed(2));
			if (v.event.maxParticipants)
				text += global.separator + ui.l('events.maxParticipants') + ':&nbsp;' + v.event.maxParticipants;
			if (v.event.confirm == 1)
				text += global.separator + ui.l('events.participationMustBeConfirmed');
			if (text)
				text = '<br/>' + text.substring(global.separator.length);
			text += '<br/>' + v.event.text;
			if (field == 'contact')
				text = '<br/>' + v.name + text;
			s += '<row' + (v.eventParticipate.state == 1 ? ' class="participate"' : v.eventParticipate.state == -1 ? ' class="canceled"' : '') + ' onclick="details.open(&quot;' + idIntern + '&quot;,&quot;location_listEvent&search=' + encodeURIComponent('event.id=' + v.event.id) + '&quot;,pageLocation.detailLocationEvent)"><div><text>' + s2 + text + '</text><imageList><img src="' + img + '"/></imageList></div></row>';
		}
		if (s)
			s += newButton;
		else
			s = '<detailTogglePanel>' + ui.l('events.noEvents') + newButton + '</detailTogglePanel>';
		e.innerHTML = s;
		details.togglePanel(e);
	}
	static toggleParticipants(event) {
		if (event.stopPropagation)
			event.stopPropagation();
		var e = ui.q('detail card:last-child[i="' + id.id + '_' + id.date + '"] [name="participants"]');
		if (e) {
			if (e.innerHTML)
				ui.toggleHeight(e);
			else {
				communication.loadList('query=contact_listEventParticipate&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&distance=100000&limit=0&search=' + encodeURIComponent('eventParticipate.state=1 and eventParticipate.eventId=' + id.id + ' and eventParticipate.eventDate=\'' + id.date + '\''), function (l) {
					e.innerHTML = l.length < 2 ? '<div style="margin-bottom:1em;">' + ui.l('events.noParticipant') + '</div>' : pageContact.listContacts(l);
					ui.toggleHeight(e);
					return '&nbsp;';
				});
			}
		}
	}
	static verifyParticipation(id) {
		var u = user.contact.id;
		id = id.split('_');
		if (id[1].indexOf('|') > -1) {
			u = id[1].split('\|');
			id[1] = u[0];
			u = u[1];
		}
		communication.ajax({
			url: global.server + 'db/list?query=contact_listEventParticipate&search=' + encodeURIComponent('eventParticipate.eventId=' + id[0] + ' and eventParticipate.eventDate=\'' + id[1] + '\' and eventParticipate.contactId=' + u),
			responseType: 'json',
			success(r) {
				if (r.length > 1) {
					var location = model.convert(new Location(), r, 1);
					var date = location.eventParticipate.eventDate + location.event.startDate.substring(location.event.startDate.indexOf('T'));
					if (location.eventParticipate.state == 1)
						intro.openHint({ desc: '<title>' + location.name + '</title><br/>' + location.address.replace(/\n/g, '<br/>') + '<br/><br/>' + ui.l('events.qrcodeDate').replace('{0}', global.date.formatDate(date)) + '<br/>' + location.contact.pseudonym + '<br/><br/><qrCheck>&check;</qrCheck><img src="' + global.serverImg + location.contact.image + '" class="qrVerification"/>', pos: '5%,1em', size: '90%,auto' });
					else
						intro.openHint({ desc: '<title>' + location.name + '</title><br/>' + location.address.replace(/\n/g, '<br/>') + '<br/><br/>' + ui.l('events.qrcodeDate').replace('{0}', global.date.formatDate(date)) + '<br/>' + location.contact.pseudonym + '<br/><emphasis>' + ui.l('events.qrcodeCanceled').replace('{0}', global.date.formatDate(location.eventParticipate.modifiedAt)) + '</emphasis><qrCheck class="negative">&cross;</qrCheck><br/><br/><img src="' + global.serverImg + location.contact.image + '" class="qrVerification"/>', pos: '5%,1em', size: '90%,auto' });
				} else
					intro.openHint({ desc: '<title>' + ui.l('events.qrcodeButton') + '</title><br/>' + ui.l('events.qrcodeError'), pos: '5%,1em', size: '90%,auto' });
			}
		});
	}
}