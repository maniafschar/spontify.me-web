import QRCodeStyling from "qr-code-styling";
import { communication } from "./communication";
import { details } from "./details";
import { geoData } from "./geoData";
import { global, Strings } from "./global";
import { hashtags } from "./hashtags";
import { intro } from "./intro";
import { lists } from "./lists";
import { Contact, EventParticipate, Location, model } from "./model";
import { pageContact } from "./pageContact";
import { pageLocation } from "./pageLocation";
import { pageLogin } from "./pageLogin";
import { formFunc, ui } from "./ui";
import { user } from "./user";

export { pageEvent };

class pageEvent {
	static nearByExec = null;
	static paypal = { fee: null, feeDate: null, feeAfter: null, currency: null, merchantUrl: null };
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
			<li onclick="pageEvent.locationSelected(-1)" class="highlightColor">${ui.l('events.newOnlineEvent')}</li>
			<li onclick="pageEvent.locationSelected(-2)" class="highlightColor">${ui.l('events.newWithoutLocation')}</li>
			<ul></ul>
			<explain style="margin-bottom:0.5em;">${ui.l('events.locationInputHintCreateNew')}</explain>
			<buttontext onclick="pageLocation.edit()" class="bgColor">${ui.l('locations.new')}</buttontext>
		</eventLocationInputHelper>
	</value>
</field>
<div class="event" ${v.styleEvent}>
<div class="locationName">${v.locationName}</div>
<field>
	<label style="padding-top:0;">${ui.l('events.hashtags')}</label>
	<value>
		<hashtagButton onclick="ui.toggleHeight(&quot;popup hashtags&quot;)"></hashtagButton>
		<textarea name="hashtagsDisp" maxlength="250" transient="true" onkeyup="hashtags.synchonizeTags(this)" style="height:2em;">${v.hashtagsDisp}</textarea>
		<hashtags style="display:none;">${v.hashtagSelection}</hashtags>
	</value>
</field>
<field class="noWTDField">
	<label>${ui.l('type')}</label>
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
<field class="noWTDField" name="endDate">
	<label>${ui.l('events.end')}</label>
	<value>
		<input type="date" name="endDate" placeholder="TT.MM.JJJJ" value="${v.endDate}" min="${v.today}" />
	</value>
</field>
<field>
	<label>${ui.l('description')}</label>
	<value>
		<textarea name="description" maxlength="1000">${v.description}</textarea>
	</value>
</field>
<field class="noWTDField">
	<label>${ui.l('events.maxParticipants')}</label>
	<value>
		<input type="number" name="maxParticipants" maxlength="250" value="${v.maxParticipants}" onmousewheel="return false;" />
	</value>
</field>
<field class="noWTDField">
	<label>${ui.l('events.price')}</label>
	<value>
		<input type="number" step="any" name="price" value="${v.price}" onkeyup="pageEvent.checkPrice()" onmousewheel="return false;" />
		<div class="paypal" style="display:none;">
			<explain>${v.payplaSignUpHint}</explain>
			<authenticate>
				<explain>${ui.l('events.paypalSignUpHintMeet')}</explain>
				<day d="${v.authenticateDay1Raw}">
					${v.authenticateDay1}
					<hour class="hour09"></hour>
					<hour class="hour10"></hour>
					<hour class="hour11"></hour>
					<hour class="hour12"></hour>
					<hour class="hour13"></hour>
					<hour class="hour14"></hour>
					<hour class="hour15"></hour>
					<hour class="hour16"></hour>
					<hour class="hour17"></hour>
				</day>
				<day d="${v.authenticateDay2Raw}">
					${v.authenticateDay2}
					<hour class="hour09"></hour>
					<hour class="hour10"></hour>
					<hour class="hour11"></hour>
					<hour class="hour12"></hour>
					<hour class="hour13"></hour>
					<hour class="hour14"></hour>
					<hour class="hour15"></hour>
					<hour class="hour16"></hour>
					<hour class="hour17"></hour>
				</day>
				<day d="${v.authenticateDay3Raw}">
					${v.authenticateDay3}
					<hour class="hour09"></hour>
					<hour class="hour10"></hour>
					<hour class="hour11"></hour>
					<hour class="hour12"></hour>
					<hour class="hour13"></hour>
					<hour class="hour14"></hour>
					<hour class="hour15"></hour>
					<hour class="hour16"></hour>
					<hour class="hour17"></hour>
				</day>
			</authenticate>
			<dialogButtons>
				<buttontext class="bgColor${v.hideVideoCallButton}" onclick="pageEvent.videoCall()">${ui.l('events.paypalSignUpButton')}</buttontext>
			</dialogButtons>
		</div>
	</value>
</field>
<field class="paid" style="display:none;">
	<label>${ui.l('picture')}</label>
	<value>
		<input type="file" name="image" accept=".gif, .png, .jpg" />
	</value>
</field>
<field class="url" style="display:none;">
	<label>${ui.l('events.url')}</label>
	<value>
		<input name="url" value="${v.url}" />
	</value>
</field>
<field class="unpaid noWTDField">
	<label>${ui.l('events.confirmLabel')}</label>
	<value>
		<input type="checkbox" name="eventconfirm" transient="true" label="${ui.l('events.confirm')}" value="1" ${v.confirm}/>
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
		global.template`<text class="description event" ${v.oc}>
<div><span class="chatLinks" onclick="ui.navigation.autoOpen(global.encParam(&quot;p=${v.event.contactId}&quot;),event)"><img src="${v.imageEventOwner}"><br>${v.contact.pseudonym}</span></div>
<div class="date eventMargin">${v.date}${v.endDate}</div>
<div class="eventMargin">${v.text}</div>
<div class="eventMargin">${v.eventMustBeConfirmed}</div>
<div class="eventMargin">${v.maxParticipants}</div>
<div class="price eventMargin">${v.eventPrice}</div>
<div class="eventMargin"><urls>${v.url}</urls></div>
<div class="reason eventMargin"></div>
<span class="eventParticipationButtons eventMargin"></span>
</text>`;
	static checkPrice() {
		var e = ui.q('popup .paypal');
		if (ui.q('popup [name="price"]').value > 0) {
			if (user.contact.authenticate && ui.cssValue(e, 'display') != 'none' ||
				!user.contact.authenticate && ui.cssValue(e, 'display') == 'none')
				ui.toggleHeight(e);
			if (ui.cssValue(e = ui.q('popup .unpaid'), 'display') != 'none')
				ui.toggleHeight(e, function () { ui.toggleHeight('popup .paid') });
			if (ui.cssValue(e = ui.q('popup .url'), 'display') == 'none')
				ui.toggleHeight(e);
		} else {
			if (ui.cssValue(e, 'display') != 'none')
				ui.toggleHeight(e);
			if (ui.cssValue(e = ui.q('popup .paid'), 'display') != 'none')
				ui.toggleHeight(e, function () { ui.toggleHeight('popup .unpaid') });
			if (ui.cssValue(e = ui.q('popup .url'), 'display') != 'none' &&
				ui.q('popup [name="locationId"]').value != -1)
				ui.toggleHeight(e);
		}
	}
	static detail(v) {
		v.eventParticipate = new EventParticipate();
		v.copyLinkHint = ui.l('copyLinkHint.event');
		if (v.event.type != 'o') {
			var s = global.date.formatDate(v.event.endDate);
			v.endDate = ' (' + ui.l('events.type_' + v.event.type) + ' ' + ui.l('to') + s.substring(s.indexOf(' ')) + ')';
		}
		var d = pageEvent.getDate(v);
		v.date = global.date.formatDate(d);
		if (d < global.date.getToday()) {
			v.date = '<eventOutdated>' + v.date;
			v[v.endDate ? 'endDate' : 'date'] += '</eventOutdated>';
		}
		if (user.contact) {
			if (v.event.contactId == user.contact.id && d >= global.date.getToday())
				v.hideMePotentialParticipants = '';
			communication.ajax({
				url: global.serverApi + 'db/list?query=event_listParticipateRaw&search=' + encodeURIComponent('eventParticipate.eventId=' + v.event.id + ' and eventParticipate.eventDate=\'' + v.id.split('_')[1] + '\''),
				webCall: 'pageEvent.detail(v)',
				responseType: 'json',
				success(r) {
					var count = 0;
					for (var i = 1; i < r.length; i++) {
						var e = model.convert(new EventParticipate(), r, i);
						if (e.contactId == user.contact.id)
							v.eventParticipate = e;
						if (e.state == 1)
							count++;
					}
					ui.q('detail card[i="' + v.id + '"] detailHeader').setAttribute('data', encodeURIComponent(JSON.stringify(v)));
					if (ui.q('detail card[i="' + v.id + '"]')) {
						ui.q('detail card[i="' + v.id + '"] .eventParticipationButtons').innerHTML = pageEvent.getParticipateButton(v, count);
						if (v.eventParticipate.state == 1) {
							ui.classAdd('detail card[i="' + v.id + '"] text.description.event', 'participate');
							ui.classRemove('detail  card[i="' + v.id + '"] div.ratingButton', 'noDisp');
						} else if (v.eventParticipate.state == -1) {
							ui.classAdd('detail card[i="' + v.id + '"] text.description.event', 'canceled');
							ui.q('detail card[i="' + v.id + '"] .reason').innerHTML = ui.l('events.canceled') + (v.eventParticipate.reason ? ':<br/>' + v.eventParticipate.reason : '');
						}
					}
				}
			});
		}
		if (v.event.price > 0)
			v.eventPrice = ui.l('events.priceDisp').replace('{0}', parseFloat(v.event.price).toFixed(2).replace('.', ','));
		else if (v.event.locationId)
			v.eventPrice = ui.l('events.priceDisp0');
		if (v.event.maxParticipants)
			v.maxParticipants = ui.l('events.maxParticipants') + ':&nbsp;' + v.event.maxParticipants;
		if (v.event.confirm == 1)
			v.eventMustBeConfirmed = ui.l('events.participationMustBeConfirmed');
		if (v.contact.imageList)
			v.imageEventOwner = global.serverImg + v.contact.imageList;
		else
			v.imageEventOwner = 'images/contact.svg" style="padding:1em;';
		v.text = Strings.replaceLinks(v.event.description).replace(/\n/g, '<br/>');
		v.hideMeFavorite = ' noDisp';
		v.hideMeEvents = ' noDisp';
		v.hideMeMarketing = ' noDisp';
		if (v.event.url) {
			var h = new URL(v.event.url).hostname;
			while (h.indexOf('.') != h.lastIndexOf('.'))
				h = h.substring(h.indexOf('.') + 1);
			v.url = '<label class="multipleLabel" onclick="ui.navigation.openHTML(&quot;' + v.event.url + '&quot;)">' + (v.event.locationId == -1 ? ui.l('events.newOnlineEvent') + ': ' : '') + h.toLowerCase() + '</label>';
		}
		if (user.contact && user.contact.id == v.event.contactId)
			v.editAction = 'pageEvent.edit(' + v.locID + ',' + v.event.id + ')';
		else
			v.hideMeEdit = ' noDisp';
		return pageEvent.templateDetail(v);
	}
	static edit(locationID, id) {
		if (!user.contact) {
			intro.openHint({ desc: 'teaserEvents', pos: '-1em,-45%', size: '80%,auto', hinkyClass: 'bottom', hinky: 'right:0.5em;' });
			return;
		}
		if (!pageEvent.paypal.fee) {
			communication.ajax({
				url: global.serverApi + 'action/paypalKey',
				webCall: 'pageEvent.edit(locationID,id)',
				responseType: 'json',
				success(r) {
					pageEvent.paypal.fee = r.fee;
					pageEvent.paypal.feeDate = r.feeDate;
					pageEvent.paypal.feeAfter = r.feeAfter;
					pageEvent.paypal.currency = r.currency;
					pageEvent.edit(locationID, id);
				}
			});
			return;
		}
		if (!user.contact.authenticate) {
			var d = global.date.getToday();
			d.setDate(d.getDate() + 1);
			communication.ajax({
				url: global.serverApi + 'db/list?query=contact_listVideoCalls&search=' + encodeURIComponent('contactVideoCall.time>\'' + global.date.local2server(d) + '\''),
				webCall: 'pageEvent.edit(locationID,id)',
				responseType: 'json',
				success(r) {
					for (var i = 1; i < r.length; i++) {
						var d = global.date.getDateFields(global.date.server2Local(r[i][0]));
						ui.classAdd('popup authenticate day[d="' + d.year + '-' + d.month + '-' + d.day + '"] .hour' + d.hour, 'closed');
						if (r[i][2] == user.contact.id) {
							ui.q('popup .paypal explain').innerHTML = ui.q('popup .paypal explain').innerHTML + '<br/><br/>' + ui.l('events.videoCallDateHint').replace('{0}', global.date.formatDate(r[i][0]));
							ui.q('popup .paypal authenticate').outerHTML = '';
							ui.q('popup .paypal dialogButtons').outerHTML = '';
						}
					}
				}
			});
		}
		ui.navigation.hideMenu();
		if (id)
			pageEvent.editInternal(locationID, id, JSON.parse(decodeURIComponent(ui.q('detail card:last-child detailHeader').getAttribute('data'))).event);
		else
			pageEvent.editInternal(locationID);
	}
	static editInternal(locationID, id, v) {
		if (!id && (locationID && user.get('event' + locationID) || !locationID && user.get('event'))) {
			v = user.get('event' + (locationID ? locationID : '')).values;
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
		if (!id || v.price > 0 && ui.q('detail card:last-child participantCount').innerText.length)
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
		if (id || locationID > 0) {
			v.classLocation = ' noDisp';
			if (locationID > 0) {
				var e = JSON.parse(decodeURIComponent(ui.q('detail card:last-child detailHeader').getAttribute('data')))
				v.locationName = e.name + '<br/>' + e.address.replace(/\n/g, global.separator);
			}
		} else {
			v.styleEvent = ' style="display:none;"';
			pageEvent.locationsOfPastEvents();
		}
		v.payplaSignUpHint = ui.l('events.paypalSignUpHint').replace('{0}', pageEvent.paypal.feeDate ?
			ui.l('events.paypalSignUpHintFee').replace('{0}', pageEvent.paypal.fee).replace('{1}', global.date.formatDate(pageEvent.paypal.feeDate)).replace('{2}', pageEvent.paypal.feeAfter)
			: pageEvent.paypal.fee);
		v.hashtagSelection = hashtags.display();
		v.hashtagsDisp = hashtags.ids2Text(v.skills) + (v.skillsText ? ' ' + v.skillsText : '').trim();
		var next = function (d) {
			d.setDate(d.getDate() + 1);
			if (d.getDay() == 0)
				d.setDate(d.getDate() + 1);
			return d;
		}
		d = next(new Date());
		v.authenticateDay1 = global.date.formatDate(d);
		v.authenticateDay1 = v.authenticateDay1.substring(0, v.authenticateDay1.lastIndexOf(' '));
		v.authenticateDay1Raw = global.date.local2server(d).substring(0, 10);
		d = next(d);
		v.authenticateDay2 = global.date.formatDate(d);
		v.authenticateDay2 = v.authenticateDay2.substring(0, v.authenticateDay2.lastIndexOf(' '));
		v.authenticateDay2Raw = global.date.local2server(d).substring(0, 10);
		d = next(d);
		v.authenticateDay3 = global.date.formatDate(d);
		v.authenticateDay3 = v.authenticateDay3.substring(0, v.authenticateDay3.lastIndexOf(' '));
		v.authenticateDay3Raw = global.date.local2server(d).substring(0, 10);
		ui.navigation.openPopup(ui.l('events.' + (id ? 'edit' : 'new')), pageEvent.templateEdit(v), 'pageEvent.saveDraft()');
		ui.attr('popup hour', 'onclick', 'pageEvent.selectVideoCall(this)');
		if (id)
			pageEvent.setForm();
	}
	static getCalendarList(data) {
		if (!data || data.length < 2)
			return '';
		var list = [];
		for (var i = 1; i < data.length; i++)
			list.push(model.convert(new Location(), data, i));
		var s;
		var today = global.date.getToday();
		var todayPlus14 = new Date();
		var actualEvents = [], otherEvents = [];
		todayPlus14.setDate(todayPlus14.getDate() + 13);
		todayPlus14.setHours(23);
		todayPlus14.setMinutes(59);
		todayPlus14.setSeconds(59);
		for (var i = 0; i < list.length; i++) {
			var v = list[i];
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
	static getDate(v) {
		var startDate = global.date.server2Local(v.event.startDate);
		if (!v.id.indexOf || v.id.indexOf('_') < 0)
			return startDate;
		var d = v.id.split('_')[1].split('-');
		return new Date(d[0], parseInt(d[1]) - 1, d[2], startDate.getHours(), startDate.getMinutes(), startDate.getSeconds());
	}
	static getId(v) {
		var id = v.event.id + '_';
		if (v.eventParticipate.eventDate)
			return id + v.eventParticipate.eventDate;
		return id + global.date.local2server(v.event.startDate).substring(0, 10);
	}
	static getParticipateButton(v, participantCount) {
		if (v.event.confirm && v.eventParticipate.state == -1)
			return '';
		var futureEvent = pageEvent.getDate(v) > new Date();
		var text = '<div style="margin:1em 0;">';
		if (futureEvent) {
			if (v.event.locationId > 0 && (v.event.contactId == user.contact.id || v.eventParticipate.state == 1))
				text += '<buttontext class="bgColor" onclick="pageEvent.qrcode(' + (v.event.contactId == user.contact.id) + ')">' + ui.l('events.qrcodeButton') + '</buttontext><br/><br/>';
			if (v.event.price > 0 && user.contact.id != v.event.contactId) {
				if (!v.eventParticipate.state && v.contact.authenticate)
					text += '<buttontext class="bgColor participation" onclick="pageLogin.paypal(' + v.contact.id + ')">' + ui.l('events.participante') + '</buttontext>';
			} else if (v.eventParticipate.state == 1 || !v.event.maxParticipants || participantCount < v.event.maxParticipants)
				text += '<buttontext class="bgColor participation" onclick="pageEvent.participate()">' + ui.l('events.participante' + (v.eventParticipate.state == 1 ? 'Stop' : '')) + '</buttontext>';
		}
		if (participantCount > 0 || futureEvent)
			text += '<buttontext class="bgColor" onclick="pageEvent.toggleParticipants(event)"><participantCount>' + (participantCount > 0 ? participantCount + '&nbsp;' : '') + '</participantCount>' + ui.l('events.participants') + '</buttontext>';
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
				webCall: 'pageEvent.init()',
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
				webCall: 'pageEvent.init()',
				success(r) {
					var e = new DOMParser().parseFromString(r, "text/xml").getElementsByTagName('svg')[0];
					e.setAttribute('fill', 'black');
					e.setAttribute('stroke', 'black');
					e.setAttribute('stroke-width', '20');
					pageLocation.map.svgMe = 'data:image/svg+xml;base64,' + btoa(e.outerHTML);
				}
			});
	}
	static listEvents(as) {
		if (!as.length)
			return '';
		var today = global.date.getToday();
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
				v._message = v.event.description + '<br/>';
				v.locID = v.id;
				pageLocation.listInfos(v);
				v._message += v._message1 ? v._message1 : v._message2 ? v._message2 : '';
				v.id = pageEvent.getId(v);
				v.badgeDisp = '';
				v.classFavorite = v.locationFavorite.favorite ? ' favorite' : '';
				if (global.date.local2server(v.event.startDate).indexOf(v.eventParticipate.eventDate) == 0)
					v.classFavorite = v.eventParticipate.state == -1 ? ' canceled' : ' participate';
				else
					v.badgeDisp = 'noDisp';
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
				v.oc = 'details.open(&quot;' + v.id + '&quot;,' + JSON.stringify({ webCall: 'pageEvent.listEvents(as)', query: 'event_list', search: encodeURIComponent('event.id=' + v.event.id) }).replace(/"/g, '&quot;') + ',pageLocation.detailLocationEvent)';
				s += pageLocation.templateList(v);
			}
		}
		return s;
	}
	static listTickets(r) {
		var as = [], ap = [], today = global.date.getToday();
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
		var s = pageEvent.listEvents(as), p = pageEvent.listEvents(ap);
		return (s ? '<listSeparator class="highlightColor strong">' + ui.l('events.ticketCurrent') + '</listSeparator>' + s : '') +
			(p ? '<listSeparator class="highlightColor strong">' + ui.l('events.ticketPast') + '</listSeparator>' + p : '');
	}
	static loadEvents(params) {
		var events = null, participations = null, divID = ui.navigation.getActiveID();
		var menuIndex = -1;
		ui.qa('menu a').forEach(function (e, i) { if (e.matches(':hover')) menuIndex = i; });
		if (divID == 'search')
			divID += ' tabBody>div.events';
		var render = function () {
			if (events != null && participations != null) {
				if (menuIndex > -1)
					ui.attr(divID, 'menuIndex', menuIndex);
				lists.setListDivs(divID);
				ui.navigation.hideMenu();
				var participate = {};
				for (var i = 1; i < participations.length; i++) {
					var e = model.convert(new EventParticipate(), participations, i);
					participate[e.eventId + '.' + e.eventDate] = e;
				}
				events = pageEvent.getCalendarList(events);
				for (var i = 0; i < events.length; i++) {
					if (events[i].event)
						events[i].eventParticipate = participate[events[i].event.id + '.' + global.date.local2server(events[i].event.startDate).substring(0, 10)] || {};
				}
				var s = pageEvent.listEvents(events);
				if (!s)
					s = lists.getListNoResults(divID.indexOf('.') ? divID.substring(divID.lastIndexOf('.') + 1) : divID, ui.navigation.getActiveID());
				ui.html(divID + ' listResults', s);
				var e = ui.q(divID + ' listBody');
				if (e)
					e.scrollTop = 0;
				lists.setListHint(divID);
			}
		};
		lists.load(
			params,
			function (l) {
				events = l;
				render();
			});
		lists.load({
			webCall: 'pageEvent.loadEvents(params)',
			query: 'event_listParticipateRaw',
			search: encodeURIComponent('eventParticipate.contactId=' + user.contact.id)
		}, function (l) {
			participations = l;
			render();
		});
	}
	static loadPotentialParticipants() {
		var i = ui.q('detail card:last-child').getAttribute('i');
		if (ui.q('detail card[i="' + i + '"] [name="potentialParticipants"] detailTogglePanel').innerText) {
			details.togglePanel(ui.q('detail card[i="' + i + '"] [name="potentialParticipants"]'));
			return;
		}
		var e = JSON.parse(decodeURIComponent(ui.q('detail card:last-child detailHeader').getAttribute('data')));
		var search = global.getRegEx('contact.skills', e.event.skills) + ' or ' + global.getRegEx('contact.skillsText', e.event.skillsText) + ' and contact.id<>' + user.contact.id;
		lists.load({
			webCall: 'pageEvent.loadPotentialParticipants()',
			query: 'contact_list',
			distance: 50,
			latitude: geoData.current.lat,
			longitude: geoData.current.lon,
			search: encodeURIComponent(search)
		}, function (r) {
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
					url: global.serverApi + 'action/searchLocation?search=' + encodeURIComponent(s),
					webCall: 'pageEvent.locations()',
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
			url: global.serverApi + 'db/list?query=event_list&search=' + encodeURIComponent('event.locationId>0 and event.contactId=' + user.contact.id),
			webCall: 'pageEvent.locationsOfPastEvents()',
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
		ui.q('popup input[name="locationId"]').value = e < 0 ? e : e.getAttribute('i');
		ui.q('popup .locationName').innerHTML = e == -1 ? ui.l('events.newOnlineEvent') : e == -2 ? ui.l('events.newWithoutLocation') : e.innerHTML;
		ui.toggleHeight('popup .location', function () {
			ui.toggleHeight('popup .event');
			pageEvent.setForm();
			if (ui.q('popup [name="hashtagsDisp"]').value)
				setTimeout(function () { ui.adjustTextarea(ui.q('popup [name="hashtagsDisp"]')); }, 500);
		});
	}
	static openPaypalPopup(email) {
		intro.openHint({ desc: '<br/><div id="paypal-button-container"></div>', pos: '15%,20vh', size: '70%,auto' });
		paypal.Buttons({
			createOrder: function (data, actions) {
				return actions.order.create({
					intent: "CAPTURE",
					purchase_units: [
						{
							amount: {
								currency_code: pageEvent.paypal.currency,
								value: '' + JSON.parse(decodeURIComponent(ui.q('detail card:last-child detailHeader').getAttribute('data'))).event.price
							},
							payee: {
								email_address: email
							}
						}
					]
				});
			},
			onApprove: function (data, actions) {
				console.log('data', data);
				console.log('actions', actions);
				actions.order.capture().then(function (orderData) {
					console.log('order', orderData);
					if (orderData.status == 'COMPLETED')
						pageEvent.participate(JSON.stringify(orderData));
				});
			}
		}).render('#paypal-button-container');
	}
	static participate(order) {
		var e = JSON.parse(decodeURIComponent(ui.q('detail card:last-child detailHeader').getAttribute('data')));
		if (e.event.price > 0 && !user.contact.image) {
			ui.navigation.openPopup(ui.l('attention'), ui.l('events.participationNoImage') + '<br/><br/><buttontext class="bgColor" onclick="ui.navigation.goTo(&quot;settings&quot;)">' + ui.l('settings.editProfile') + '</buttontext > ');
			return;
		}
		var button = ui.q('detail card:last-child buttontext.participation');
		var d = { classname: 'EventParticipate', values: {} };
		var eventDate = e.id.split('_')[1];
		if (e.eventParticipate.id) {
			d.values.state = e.eventParticipate.state == 1 ? -1 : 1;
			d.id = e.eventParticipate.id;
			if (e.event.confirm == 1) {
				if (!ui.q('#stopParticipateReason')) {
					ui.navigation.openPopup(ui.l('events.stopParticipate'), ui.l('events.stopParticipateText') + '<br/><textarea id="stopParticipateReason" placeholder="' + ui.l('events.stopParticipateHint') + '" style="margin-top:0.5em;"></textarea><buttontext class="bgColor" style="margin-top:1em;" onclick="pageEvent.participate()">' + ui.l('events.stopParticipateButton') + '</buttontext>');
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
			d.values.payment = order;
		}
		communication.ajax({
			url: global.serverApi + 'db/one',
			webCall: 'pageEvent.participate(order)',
			method: e.eventParticipate.id ? 'PUT' : 'POST',
			body: d,
			success(r) {
				e.eventParticipate.state = d.values.state;
				if (r) {
					e.eventParticipate.eventId = d.values.eventId;
					e.eventParticipate.eventDate = d.values.eventDate;
					e.eventParticipate.id = r;
				}
				ui.q('detail card:last-child detailHeader').setAttribute('data', encodeURIComponent(JSON.stringify(e)));
				var e2 = ui.q('detail card[i="' + e.event.id + '_' + eventDate + '"] participantCount');
				if (e.eventParticipate.state == '1') {
					ui.classRemove('detail card:last-child .event', 'canceled');
					ui.classRemove('row[i="' + e.event.id + '_' + eventDate + '"]', 'canceled');
					ui.classRemove('row[i="' + e.event.id + '_' + eventDate + '"] badge', 'noDisp');
					ui.classAdd('detail card:last-child .event', 'participate');
					ui.classAdd('row[i="' + e.event.id + '_' + eventDate + '"]', 'participate');
					ui.q('detail card:last-child .event .reason').innerHTML = '';
					if (e.event.confirm == '1')
						button.outerHTML = '';
					else
						button.innerText = ui.l('events.participanteStop');
					e2.innerHTML = e2.innerHTML ? (parseInt(e2.innerHTML) + 1) + ' ' : '1 ';
				} else {
					ui.classRemove('detail card:last-child .event', 'participate');
					ui.classRemove('row[i="' + e.event.id + '_' + eventDate + '"]', 'participate');
					ui.attr(button, 's', '1');
					button.innerText = ui.l('events.participante');
					ui.classAdd('detail card:last-child .event', 'canceled');
					ui.classAdd('row[i="' + e.event.id + '_' + eventDate + '"]', 'canceled');
					ui.q('detail card:last-child .event .reason').innerHTML = ui.l('events.canceled') + (d.values.reason ? ':<br/>' + d.values.reason : '');
					e2.innerHTML = e2.innerHTML && parseInt(e2.innerHTML) > 1 ? (parseInt(e2.innerHTML) - 1) + ' ' : '';
				}
				ui.navigation.closePopup();
				if (order) {
					intro.closeHint();
					ui.q('detail .eventParticipationButtons buttontext.participation').outerHTML = '';
				}
				e = ui.q('detail card:last-child[i="' + e.event.id + '_' + eventDate + '"] [name="participants"]');
				var f = function () {
					e.innerHTML = '';
					e.style.display = 'none';
					e.removeAttribute('h');
				};
				if (e.style.display == 'none')
					f.call();
				else
					ui.toggleHeight(e, f);
			}
		});
	}
	static qrcode(location) {
		var id = ui.q('detail card:last-child').getAttribute('i');
		new QRCodeStyling({
			width: 600,
			height: 600,
			data: global.server + '?' + global.encParam('q=' + id + (location ? '' : '|' + user.contact.id)),
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
				var a = e.address.replace(/<br \/>/g, '\n').replace(/<br\/>/g, '\n').split('\n');
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
					var a = e.event.description.split('\n');
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
		var text = ui.q('popup [name="description"]');
		var tags = ui.q('popup [name="hashtagsDisp"]');
		var id = ui.q('popup [name="id"]').value;
		ui.html('popup popupHint', '');
		formFunc.resetError(start);
		formFunc.resetError(end);
		formFunc.resetError(text);
		formFunc.resetError(tags);
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
		if (ui.q('popup [name="price"]').value > 0 && !user.contact.authenticate)
			formFunc.setError(ui.q('popup [name="price"]'), 'events.errorAuthenticate');
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
		if (!v.values.price)
			v.values.price;
		if (ui.q('popup errorHint')) {
			ui.q('popupContent>div').scrollTo({ top: 0, behavior: 'smooth' });;
			return;
		}
		if (ui.q('popup [name="type"]').checked)
			end.value = start.value.substring(0, start.value.lastIndexOf('T'));
		ui.q('popup [name="confirm"]').value = ui.q('popup [name="eventconfirm"]:checked') ? 1 : 0;
		v.classname = 'Event';
		if (id)
			v.id = id;
		communication.ajax({
			url: global.serverApi + 'db/one',
			method: id ? 'PUT' : 'POST',
			webCall: 'pageEvent.save()',
			body: v,
			success(r) {
				ui.navigation.closePopup();
				user.remove('event');
				details.open(id ? ui.q('detail card:last-child').getAttribute('i') : r + '_' + global.date.local2server(v.values.startDate).substring(0, 10), { webCall: 'pageEvent.save()', query: 'event_list', search: encodeURIComponent('event.id=' + (id ? id : r)) },
					id ? function (l, id) { ui.q('detail card:last-child').innerHTML = pageLocation.detailLocationEvent(l, id); } : pageLocation.detailLocationEvent);
				pageEvent.refreshToggle();
			}
		});
	}
	static saveDraft() {
		var v = hashtags.convert(ui.q('popup [name="hashtagsDisp"]').value);
		ui.q('popup input[name="skills"]').value = v.category;
		ui.q('popup input[name="skillsText"]').value = v.hashtags;
		user.set('event', formFunc.getForm('popup form'));
	}
	static selectVideoCall(e) {
		ui.classRemove('popup hour', 'selected');
		if (!ui.classContains(e, 'closed'))
			ui.classAdd(e, 'selected');
	}
	static setForm() {
		var b = ui.q('popup [name="type"]').checked;
		ui.q('popup label[name="startDate"]').innerText = ui.l('events.' + (b ? 'date' : 'start'));
		ui.css('popup field[name="endDate"]', 'display', b ? 'none' : '');
		b = ui.q('popup input[name="locationId"]').value;
		if (!b || b == -2) {
			ui.css('popup .noWTDField', 'display', 'none');
			ui.q('popup [name="price"]').value = null;
		}
		if (b == -1) {
			ui.q('popup .url label').innerText = ui.l('events.urlOnlineEvent');
			ui.css('popup .url', 'display', null);
		}
		pageEvent.checkPrice();
	}
	static toggle(id) {
		var d = ui.q('detail card:last-child [name="events"]');
		if (d) {
			if (!d.innerHTML) {
				var field = ui.q('detail card:last-child').getAttribute('type');
				communication.ajax({
					url: global.serverApi + 'db/list?query=event_list&search=' + encodeURIComponent('event.' + field + 'Id=' + id),
					webCall: 'pageEvent.toggle(id)',
					responseType: 'json',
					success(r) {
						pageEvent.toggleInternal(r, id, field);
					}
				});
			} else
				details.togglePanel(ui.q('detail card:last-child [name="events"]'));
		}
	}
	static toggleInternal(r, id, field) {
		var e = ui.q('detail card:last-child [name="events"]');
		if (!e)
			return;
		var bg = 'bgColor';
		var a = pageEvent.getCalendarList(r), newButton = field == 'contact' ? '' : '<br/><br/><buttontext onclick="pageEvent.edit(' + id + ')" class="' + bg + '">' + ui.l('events.new') + '</buttontext>';
		var s = '', v, text;
		var b = user.contact.id == id;
		if (b && e.getAttribute('active'))
			b = false;
		for (var i = 0; i < a.length; i++) {
			v = a[i];
			if (v.id) {
				v.bg = bg;
				var s2 = global.date.formatDate(v.event.startDate, 'weekdayLong');
				var date = global.date.getDateFields(v.event.startDate);
				date = date.year + '-' + date.month + '-' + date.day;
				var idIntern = v.event.id + '_' + date;
				s2 = global.date.getDateHint(v.event.startDate).replace('{0}', s2);
				var img;
				if (v.event.imageList || v.imageList || v.event.locationId == -2 && v.contact.imageList)
					img = global.serverImg + (v.event.imageList ? v.event.imageList : v.imageList ? v.imageList : v.contact.imageList);
				else
					img = 'images/event.svg" style="padding:1em;" class="' + bg;
				text = '';
				if (v.event.price > 0)
					text += global.separator + ui.l('events.priceDisp').replace('{0}', parseFloat(v.event.price).toFixed(2).replace('.', ','));
				if (v.event.maxParticipants)
					text += global.separator + ui.l('events.maxParticipants') + ':&nbsp;' + v.event.maxParticipants;
				if (v.event.confirm == 1)
					text += global.separator + ui.l('events.participationMustBeConfirmed');
				if (text)
					text = '<br/>' + text.substring(global.separator.length);
				text += '<br/>' + v.event.description;
				if (field == 'location')
					text = '<br/>' + v.name + text;
				s += '<row' + (v.eventParticipate.state == 1 ? ' class="participate"' : v.eventParticipate.state == -1 ? ' class="canceled"' : '') + ' onclick="details.open(&quot;' + idIntern + '&quot;,' + JSON.stringify({ webCall: 'pageEvent.toggleInternal(r,id,field)', query: 'event_list', search: encodeURIComponent('event.id=' + v.event.id) }).replace(/"/g, '&quot;') + ',pageLocation.detailLocationEvent)"><div><text>' + s2 + text + '</text><imageList><img src="' + img + '"/></imageList></div></row>';
			}
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
		var e = ui.q('detail card:last-child [name="participants"]');
		if (e) {
			if (e.innerHTML)
				ui.toggleHeight(e);
			else {
				var id = decodeURIComponent(ui.q('detail card:last-child').getAttribute('i')).split('_');
				lists.load({
					webCall: 'pageEvent.toggleParticipants(event)',
					query: 'event_listParticipate',
					latitude: geoData.current.lat,
					longitude: geoData.current.lon,
					distance: 100000,
					limit: 0,
					search: encodeURIComponent('eventParticipate.state=1 and eventParticipate.eventId=' + id[0] + ' and eventParticipate.eventDate=\'' + id[1] + '\' and eventParticipate.contactId=contact.id')
				}, function (l) {
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
			url: global.serverApi + 'db/list?query=event_listParticipate&search=' + encodeURIComponent('eventParticipate.eventId=' + id[0] + ' and eventParticipate.eventDate=\'' + id[1] + '\' and eventParticipate.contactId=' + u + ' and eventParticipate.contactId=contact.id'),
			webCall: 'pageEvent.verifyParticipation(id)',
			responseType: 'json',
			success(r) {
				if (r.length > 1) {
					var location = model.convert(new Contact(), r, 1);
					var date = location.eventParticipate.eventDate + location.event.startDate.substring(location.event.startDate.indexOf('T'));
					if (location.eventParticipate.state == 1)
						intro.openHint({ desc: '<title>' + location._locationName + '</title><br/>' + location._locationAddress.replace(/\n/g, '<br/>') + '<br/><br/>' + ui.l('events.qrcodeDate').replace('{0}', global.date.formatDate(date)) + '<br/>' + location.contact.pseudonym + '<br/><br/><qrCheck>&check;</qrCheck><img src="' + global.serverImg + location.contact.image + '" class="qrVerification"/>', pos: '5%,1em', size: '90%,auto' });
					else
						intro.openHint({ desc: '<title>' + location._locationName + '</title><br/>' + location._locationAddress.replace(/\n/g, '<br/>') + '<br/><br/>' + ui.l('events.qrcodeDate').replace('{0}', global.date.formatDate(date)) + '<br/>' + location.contact.pseudonym + '<br/><emphasis>' + ui.l('events.qrcodeCanceled').replace('{0}', global.date.formatDate(location.eventParticipate.modifiedAt)) + '</emphasis><qrCheck class="negative">&cross;</qrCheck><br/><br/><img src="' + global.serverImg + location.contact.image + '" class="qrVerification"/>', pos: '5%,1em', size: '90%,auto' });
				} else
					intro.openHint({ desc: '<title>' + ui.l('events.qrcodeButton') + '</title><br/>' + ui.l('events.qrcodeError'), pos: '5%,1em', size: '90%,auto' });
			}
		});
	}
	static videoCall() {
		if (ui.cssValue('popup authenticate', 'display') == 'none')
			ui.toggleHeight('popup authenticate');
		else {
			var e = ui.q('popup authenticate hour.selected');
			if (e) {
				e = global.date.local2server(ui.parents(e, 'day').getAttribute('d') + ' ' + e.getAttribute('class').replace(/[a-z ]/gi, '') + ':00:00');
				communication.ajax({
					url: global.serverApi + 'action/videoCall/' + e,
					webCall: 'pageEvent.videoCall()',
					method: 'POST',
					responseType: 'json',
					success(r) {
						ui.q('popup div.paypal dialogButtons').outerHTML = '';
						ui.q('popup div.paypal authenticate').outerHTML = '';
						ui.q('popup div.paypal explain').innerHTML = ui.l('events.videoCallDate').replace('{0}', global.date.formatDate(e));
					}
				});
			}
		}
	}
}