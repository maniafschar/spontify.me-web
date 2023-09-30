import QRCodeStyling from 'qr-code-styling';
import { communication } from './communication';
import { details } from './details';
import { geoData } from './geoData';
import { global, Strings } from './global';
import { lists } from './lists';
import { Contact, EventParticipate, Location, model } from './model';
import { pageContact } from './pageContact';
import { pageHome } from './pageHome';
import { pageLocation } from './pageLocation';
import { formFunc, ui } from './ui';
import { user } from './user';
import { DialogPopup } from './customElements/DialogPopup';

export { pageEvent };

class pageEvent {
	static nearByExec = null;
	static paypal = { fee: null, feeDate: null, feeAfter: null, currency: null, merchantUrl: null };
	static templateEdit = v =>
		global.template`
<style>
.locationName {
	position: relative;
}
.locationName::after {
	content: '✎';
    height: 2em;
    display: inline-block;
    position: absolute;
    bottom: -0.25em;
    font-size: 2em;
    right: 0.75em;
    transform: rotate(80deg);
}
</style>
<form name="editElement" onsubmit="return false">
<input type="hidden" name="id" value="${v.id}"/>
<input type="hidden" name="locationId" value="${v.locationID}"/>
<input type="hidden" name="skills" value="${v.skills}" />
<input type="hidden" name="skillsText" value="${v.skillsText}" />
<div class="event">
	<div class="locationName" style="color:white;cursor:pointer;" onclick="pageEvent.selectLocation()">${v.locationName}</div>
	<field>
		<label>${ui.l('type')}</label>
		<value>
			<input-checkbox type="radio" name="type" transient="true" value="0" label="events.location" onclick="pageEvent.setForm()" ${v.typeLocation}></input-checkbox>
			<input-checkbox type="radio" name="type" transient="true" value="-1" label="events.newOnlineEvent" onclick="pageEvent.setForm()" ${v.typeOnlineEvent}></input-checkbox>
			<input-checkbox type="radio" name="type" transient="true" value="-2" label="events.newWithoutLocation" onclick="pageEvent.setForm()" ${v.typeWithoutLocation} ${v.hideWithoutLocation}></input-checkbox>
		</value>
	</field>
	<explain class="newWithoutLocation" style="display:none;">${ui.l('events.newWithoutLocationDescription')}</explain>
	<field${v.eventNoHashtags}>
		<label style="padding-top:0;">${ui.l('events.hashtags')}</label>
		<value>
			<input-hashtags ids="${v.skills}" text="${v.skillsText}" transient="true"></input-hashtags>
		</value>
	</field>
	<field class="noWTDField">
		<label>${ui.l('events.repetition')}</label>
		<value>
			<input-checkbox type="radio" deselect="true" name="repetition" value="w1" label="events.repetition_w1" onclick="pageEvent.setForm()" ${v.repetition_w1}></input-checkbox>
			<input-checkbox type="radio" deselect="true" name="repetition" value="w2" label="events.repetition_w2" onclick="pageEvent.setForm()" ${v.repetition_w2}></input-checkbox>
			<input-checkbox type="radio" deselect="true" name="repetition" value="m" label="events.repetition_m" onclick="pageEvent.setForm()" ${v.repetition_m}></input-checkbox>
			<input-checkbox type="radio" deselect="true" name="repetition" value="y" label="events.repetition_y" onclick="pageEvent.setForm()" ${v.repetition_y}></input-checkbox>
		</value>
	</field>
	<field>
		<label name="startDate">${ui.l('events.start')}</label>
		<value>
			<input type="datetime-local" name="startDate" placeholder="TT.MM.JJJJ HH:MM" value="${v.startDate}" step="900" min="${v.today}T00:00:00" />
		</value>
	</field>
	<field class="noWTDField" name="endDate" style="display:none;">
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
				${v.appointment}
			</div>
		</value>
	</field>
	<field class="picture" style="display:none;" name="image">
		<label>${ui.l('picture')}</label>
		<value>
			<input-image></input-image>
		</value>
	</field>
	<field class="url" style="display:none;">
		<label>${ui.l('events.url')}</label>
		<value>
			<input name="url" value="${v.url}" />
		</value>
	</field>
	<dialogButtons>
		<button-text onclick="pageEvent.selectLocation()" label="events.selectLocation" class="selectLocation"></button-text>
		<button-text onclick="pageEvent.save()" label="save" class="save hidden"></button-text>
		<button-text onclick="pageLocation.deleteElement(${v.id},&quot;Event&quot;)" ${v.hideDelete} id="deleteElement" label="delete"></button-text>
	</dialogButtons>
	<popupHint></popupHint>
</div>
<field class="location" style="display:none;">
	<label style="padding-top:0;">${ui.l('events.location')}</label>
	<value style="text-align:center;">
		<input transient="true" name="location" onkeyup="pageEvent.locations()" />
		<explain>${ui.l('events.locationInputHint')}</explain>
		<eventLocationInputHelper>
			<ul></ul>
		</eventLocationInputHelper>
		<explain>${ui.l('events.locationInputHintCreateNew')}</explain>
		<dialogButtons style="margin-top:0;">
			<button-text onclick="pageLocation.edit()" label="locations.new"></button-text>
		</dialogButtons>
	</value>
</field>
</form>`;
	static templateDetail = v =>
		global.template`<text class="description event" ${v.oc}>
<div><span class="chatLinks" onclick="ui.navigation.autoOpen(global.encParam(&quot;p=${v.event.contactId}&quot;),event)"><img src="${v.imageEventOwner}"><br>${v.contact.pseudonym}</span></div>
<div class="date eventMargin">${v.date}${v.endDate}</div>
<div class="eventMargin">${v.text}</div>
<div class="eventMargin">${v.maxParticipants}</div>
<div class="price eventMargin">${v.eventPrice}</div>
<div class="eventMargin"><urls>${v.url}</urls></div>
<div class="reason eventMargin"></div>
<span class="eventParticipationButtons eventMargin"></span>
</text>`;
	static checkPrice() {
		if (ui.q('dialog-popup [name="price"]').value > 0) {
			pageEvent.openSection('dialog-popup .paypal', !user.contact.authenticate);
			pageEvent.openSection('dialog-popup .picture', true);
			pageEvent.openSection('dialog-popup .url', true);
		} else {
			pageEvent.openSection('dialog-popup .paypal', false);
			pageEvent.openSection('dialog-popup .picture', false);
			pageEvent.openSection('dialog-popup .url', ui.val('dialog-popup [name="type"][checked="true"]') == -1);
		}
	}
	static detail(v) {
		v.eventParticipate = new EventParticipate();
		v.copyLinkHint = ui.l('copyLinkHint.event');
		if (v.event.repetition && v.event.repetition != 'o') {
			var s = global.date.formatDate(v.event.endDate);
			v.endDate = ' (' + ui.l('events.repetition_' + v.event.repetition) + ' ' + ui.l('to') + s.substring(s.indexOf(' ')) + ')';
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
				webCall: 'pageEvent.detail',
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
							ui.classRemove('detail  card[i="' + v.id + '"] div.ratingButton', 'hidden');
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
		if (v.contact.imageList)
			v.imageEventOwner = global.serverImg + v.contact.imageList;
		else
			v.imageEventOwner = 'images/contacts.svg" style="padding:1em;';
		v.text = Strings.replaceLinks(v.event.description).replace(/\n/g, '<br/>');
		v.hideMeFavorite = ' hidden';
		v.hideMeEvents = ' hidden';
		v.hideMeMarketing = ' hidden';
		if (v.event.url) {
			var h = new URL(v.event.url).hostname;
			while (h.indexOf('.') != h.lastIndexOf('.'))
				h = h.substring(h.indexOf('.') + 1);
			v.url = '<label class="multipleLabel" onclick="ui.navigation.openHTML(&quot;' + v.event.url + '&quot;)">' + (v.event.locationId == -1 ? ui.l('events.newOnlineEvent') + ': ' : '') + h.toLowerCase() + '</label>';
		}
		if (user.contact && user.contact.id == v.event.contactId)
			v.editAction = 'pageEvent.edit(' + v.locID + ',' + v.event.id + ')';
		else
			v.hideMeEdit = ' hidden';
		return pageEvent.templateDetail(v);
	}
	static edit(locationID, id) {
		if (!user.contact) {
			ui.navigation.openHint({ desc: 'teaserEvents', pos: '-0.5em,-63%', size: '95%,auto', hinkyClass: 'bottom', hinky: 'right:0;' });
			return;
		}
		if (!pageEvent.paypal.fee) {
			communication.ajax({
				url: global.serverApi + 'action/paypalKey',
				webCall: 'pageEvent.edit',
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
				webCall: 'pageEvent.edit',
				responseType: 'json',
				success(r) {
					for (var i = 1; i < r.length; i++) {
						var d = global.date.getDateFields(global.date.server2local(r[i][0]));
						ui.classAdd('dialog-popup appointment day[d="' + d.year + '-' + d.month + '-' + d.day + '"] .hour' + d.hour, 'closed');
						if (r[i][2]) {
							ui.q('dialog-popup .paypal explain').innerHTML = ui.q('dialog-popup .paypal explain').innerHTML + '<br/><br/>' + ui.l('events.videoCallDateHint').replace('{0}', global.date.formatDate(r[i][0]));
							if (ui.q('dialog-popup .paypal appointment'))
								ui.q('dialog-popup .paypal appointment').outerHTML = '';
							if (ui.q('dialog-popup .paypal dialogButtons'))
								ui.q('dialog-popup .paypal dialogButtons').outerHTML = '';
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
				global.date.server2local(v.startDate).getTime() < new Date().getTime())
				v.startDate = null;
		}
		if (!v)
			v = {};
		var d;
		if (v.startDate) {
			d = global.date.getDateFields(global.date.server2local(v.startDate));
			v.startDate = d.year + '-' + d.month + '-' + d.day + 'T' + d.hour + ':' + d.minute;
		}
		if (!id || v.price > 0 && ui.q('detail card:last-child participantCount')?.innerText.length)
			v.hideDelete = 'class="hidden"';
		d = global.date.getDateFields(new Date());
		v.today = d.year + '-' + d.month + '-' + d.day;
		v.id = id;
		v.locationID = locationID;
		if (!v.repetition || v.repetition == 'o')
			v.repetition_o = ' checked="true"';
		if (v.repetition == 'w1')
			v.repetition_w1 = ' checked="true"';
		if (v.repetition == 'w2')
			v.repetition_w2 = ' checked="true"';
		if (v.repetition == 'm')
			v.repetition_m = ' checked="true"';
		if (v.repetition == 'y')
			v.repetition_y = ' checked="true"';
		if (!v.startDate) {
			d = new Date();
			d.setDate(d.getDate() + 1);
			d = global.date.getDateFields(d);
			v.startDate = d.year + '-' + d.month + '-' + d.day + 'T' + d.hour + ':00';
		}
		if (!v.endDate) {
			d = new Date();
			d.setMonth(d.getMonth() + 6);
			d = global.date.getDateFields(d);
			v.endDate = d.year + '-' + d.month + '-' + d.day;
		}
		if (id || locationID > 0) {
			if (locationID > 0) {
				var e = JSON.parse(decodeURIComponent(ui.q('detail card:last-child detailHeader').getAttribute('data')))
				v.locationName = e.name + '<br/>' + e.address.replace(/\n/g, global.separator);
			}
		} else
			pageEvent.locationsOfPastEvents();
		if (user.contact.type && user.contact.type.indexOf('admin') > -1)
			v.hideWithoutLocation = 'class="hidden"';
		v.payplaSignUpHint = ui.l('events.paypalSignUpHint').replace('{0}', pageEvent.paypal.feeDate ?
			ui.l('events.paypalSignUpHintFee').replace('{0}', pageEvent.paypal.fee).replace('{1}', global.date.formatDate(pageEvent.paypal.feeDate)).replace('{2}', pageEvent.paypal.feeAfter)
			: pageEvent.paypal.fee);
		v.appointment = user.getAppointmentTemplate('authenticate');
		if (user.appConfig.eventNoHashtags)
			v.eventNoHashtags = ' class="hidden"';
		if (v.locationId == -1)
			v.typeOnlineEvent = 'checked="true"';
		else if (v.locationId == -2)
			v.typeWithoutLocation = 'checked="true"';
		else
			v.typeLocation = 'checked="true"';
		ui.navigation.openPopup(ui.l('events.' + (id ? 'edit' : 'new')), pageEvent.templateEdit(v), 'pageEvent.saveDraft()');
		if (id)
			pageEvent.setForm();
	}
	static getCalendarList(data) {
		if (!data || data.length < 2)
			return [];
		var list = [];
		for (var i = 1; i < data.length; i++)
			list.push(model.convert(new Location(), data, i));
		var s;
		var today = global.date.getToday();
		var actualEvents = [], otherEvents = [];
		for (var i = 0; i < list.length; i++) {
			var v = list[i];
			var d1 = global.date.server2local(v.event.startDate);
			var d2 = global.date.server2local(v.event.endDate);
			d2.setHours(23);
			d2.setMinutes(59);
			d2.setSeconds(59);
			var added = false;
			if (d2 > today) {
				do {
					if (d1 > today && d1 <= d2) {
						added = true;
						var v2 = JSON.parse(JSON.stringify(v));
						v2.event.startDate = new Date(d1.getTime());
						actualEvents.push(v2);
					}
					if (v.event.repetition == 'w1')
						d1.setDate(d1.getDate() + 7);
					else if (v.event.repetition == 'w2')
						d1.setDate(d1.getDate() + 14);
					else if (v.event.repetition == 'm')
						d1.setMonth(d1.getMonth() + 1);
					else if (v.event.repetition == 'y')
						d1.setFullYear(d1.getFullYear() + 1);
					else
						break;
				} while (v.event.repetition != 'o' && d1 < d2);
			}
			if (!added && user.contact && user.contact.id == v.event.contactId) {
				v.event.startDate = global.date.server2local(v.event.startDate);
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
		var startDate = global.date.server2local(v.event.startDate);
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
		if (v.eventParticipate.state == -1)
			return '';
		var futureEvent = pageEvent.getDate(v) > new Date();
		var text = '<div style="margin:1em 0;">';
		if (futureEvent) {
			if (false && v.event.locationId > 0 && (v.event.contactId == user.contact.id || v.eventParticipate.state == 1))
				text += '<button-text onclick="pageEvent.qrcode(' + (v.event.contactId == user.contact.id) + ')" label="events.qrcodeButton"></button-text><br/><br/>';
			if (v.event.price > 0 && user.contact.id != v.event.contactId) {
				if (!v.eventParticipate.state && v.contact.authenticate)
					text += '<button-text class="participation" onclick="pageLogin.paypal(' + v.contact.id + ')" label="events.participante"></button-text>';
			} else if (v.eventParticipate.state == 1 || !v.event.maxParticipants || participantCount < v.event.maxParticipants)
				text += '<button-text class="participation" onclick="pageEvent.participate()" label="events.participante' + (v.eventParticipate.state == 1 ? 'Stop' : '') + '"></button-text>';
		}
		if (participantCount > 0 || futureEvent)
			text += '<button-text onclick="pageEvent.toggleParticipants(event)"><participantCount>' + (participantCount > 0 ? participantCount + '&nbsp;' : '') + '</participantCount>' + ui.l('events.participants') + '</button-text>';
		text += '</div><text name="participants" style="margin:0 -1em;display:none;"></text>';
		return text;
	}
	static init() {
		if (!ui.q('events').innerHTML)
			ui.q('events').innerHTML = '<list-body></list-body>';
		if (!ui.q('events listResults list-row'))
			setTimeout(ui.navigation.toggleMenu, 500);
		if (!pageLocation.map.svgLocation)
			communication.ajax({
				url: '/images/locations.svg',
				webCall: 'pageEvent.init',
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
				url: '/images/contacts.svg',
				webCall: 'pageEvent.init',
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
		for (var i = 0; i < as.length; i++) {
			if (as[i] == 'outdated')
				s += '<listSeparator class="highlightColor strong">' + ui.l('events.outdated') + '</listSeparator>';
			else {
				v = as[i];
				var name, text, flag1, flag2, flag3 = '', image, clazz;
				var startDate = global.date.server2local(v.event.startDate);
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
				var skills = ui.getSkills(v.event.id ? v.event : v.contact, 'list');
				flag1 = v._geolocationDistance ? parseFloat(v._geolocationDistance).toFixed(v._geolocationDistance >= 9.5 || !v.id ? 0 : 1).replace('.', ',') : '';
				if (skills.total && skills.totalMatch / skills.total > 0)
					flag2 = parseInt('' + (skills.totalMatch / skills.total * 100 + 0.5)) + '%';
				if (v._geolocationDistance && v.latitude)
					flag3 = '<compass style="transform:rotate('
						+ geoData.getAngel(geoData.current, { lat: v.latitude, lon: v.longitude }) + 'deg);"></compass>';
				else if (v.contact.gender)
					flag3 = '<img source="gender' + v.contact.gender + '" />';
				if (v.name)
					name = t + ' ' + v.name;
				else
					name = t + ' ' + v.contact.pseudonym + (v.contact.age ? ' (' + v.contact.age + ')' : '');
				text = v.event.description + '<br/>';
				text += v.event.id && v.address ? v.address : skills.text();
				clazz = v.locationFavorite.favorite ? ' favorite' : '';
				if (global.date.local2server(v.event.startDate).indexOf(v.eventParticipate.eventDate) == 0)
					clazz = v.eventParticipate.state == -1 ? ' canceled' : ' participate';
				if (v.event.imageList)
					image = global.serverImg + v.event.imageList;
				else if (v.imageList)
					image = v.imageList;
				else if (v.contact.imageList)
					image = v.contact.imageList;
				else if (v.id)
					image = 'events';
				else
					image = 'contacts';
				var oc;
				v.idDate = pageEvent.getId(v);
				if (ui.navigation.getActiveID() == 'settings')
					oc = 'pageSettings.unblock(&quot;' + v.id + '&quot;,' + v.block.id + ')';
				else
					oc = 'details.open(&quot;' + v.idDate + '&quot;,' + JSON.stringify({ webCall: 'pageEvent.listEvents', query: 'event_list', search: encodeURIComponent('event.id=' + v.event.id) }).replace(/"/g, '&quot;') + ',pageLocation.detailLocationEvent)';
				s += global.template`<list-row onclick="${oc}" i="${v.idDate}" class="event${clazz ? ' ' + clazz : ''}"
					title="${encodeURIComponent(name)}"
					text="${encodeURIComponent(text)}"
					flag1="${flag1}"
					flag2="${flag2}"
					flag3="${encodeURIComponent(flag3)}"
					image="${image}"></list-row>`;
			}
		}
		return s;
	}
	static listTickets(r) {
		var as = [], ap = [], today = global.date.getToday();
		for (var i = 1; i < r.length; i++) {
			var e = model.convert(new Location(), r, i);
			e.event.startDate = global.date.server2local(e.eventParticipate.eventDate + e.event.startDate.substring(10));
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
	static loadEvents(params, filter) {
		var events = null, participations = null, divID = ui.navigation.getActiveID();
		var menuIndex = -1;
		ui.qa('dialog-menu a').forEach(function (e, i) { if (e.matches(':hover')) menuIndex = i; });
		if (divID == 'search')
			divID += ' tabBody>div.events';
		var render = function () {
			if (events != null && participations != null) {
				if (menuIndex > -1)
					ui.attr(divID, 'menuIndex', menuIndex);
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
				if (filter)
					filter(events);
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
			webCall: 'pageEvent.loadEvents',
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
			webCall: 'pageEvent.loadPotentialParticipants',
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
		var s = ui.q('dialog-popup input[name="location"]').value.trim();
		if (s.length > 3)
			pageEvent.nearByExec = setTimeout(function () {
				communication.ajax({
					url: global.serverApi + 'action/searchLocation?search=' + encodeURIComponent(s),
					webCall: 'pageEvent.locations',
					responseType: 'json',
					success(r) {
						var s = '', e = ui.q('dialog-popup eventLocationInputHelper ul');
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
			url: global.serverApi + 'db/list?query=event_list&search=' + encodeURIComponent('length(location.name)>0 and event.contactId=' + user.contact.id),
			webCall: 'pageEvent.locationsOfPastEvents',
			responseType: 'json',
			success(r) {
				var s = '', processed = {};
				for (var i = 1; i < r.length; i++) {
					var l = model.convert(new Location(), r, i);
					if (!processed[l.id]) {
						s += '<li i="' + l.id + '" onclick="pageEvent.locationSelected(this)">' + l.name + '<br/>' + l.address?.replace(/\n/g, global.separator) + '</li>';
						processed[l.id] = 1;
					}
				}
				if (s) {
					var i = 0;
					var f = function () {
						i++;
						var e = ui.q('dialog-popup eventLocationInputHelper ul');
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
		ui.q('dialog-popup input[name="locationId"]').value = e.getAttribute('i');
		ui.q('dialog-popup .locationName').innerHTML = e.innerHTML;
		ui.toggleHeight('dialog-popup .location', function () {
			ui.toggleHeight('dialog-popup .event');
			pageEvent.setForm();
		});
	}
	static openPaypalPopup(email) {
		ui.navigation.openHint({ desc: '<br/><div id="paypal-button-container"></div>', pos: '15%,20vh', size: '70%,auto' });
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
				actions.order.capture().then(function (orderData) {
					if (orderData.status == 'COMPLETED')
						pageEvent.participate(JSON.stringify(orderData));
				});
			}
		}).render('#paypal-button-container');
	}
	static openSection(e, open) {
		if (!open && ui.cssValue(e, 'display').indexOf('none') < 0 || open && ui.cssValue(e, 'display').indexOf('none') > -1)
			ui.toggleHeight(e);
	}
	static participate(order) {
		var e = JSON.parse(decodeURIComponent(ui.q('detail card:last-child detailHeader').getAttribute('data')));
		if (e.event.price > 0 && !user.contact.image) {
			ui.navigation.openPopup(ui.l('attention'), ui.l('events.participationNoImage') + '<br/><br/><button-text onclick="ui.navigation.goTo(&quot;settings&quot;)" label="settings.editProfile"></button-text > ');
			return;
		}
		var button = ui.q('detail card:last-child button-text.participation');
		var d = { classname: 'EventParticipate', values: {} };
		var eventDate = e.id.split('_')[1];
		if (e.eventParticipate.id) {
			d.values.state = e.eventParticipate.state == 1 ? -1 : 1;
			d.id = e.eventParticipate.id;
			if (!ui.q('#stopParticipateReason')) {
				ui.navigation.openPopup(ui.l('events.stopParticipate'), ui.l('events.stopParticipateText') + '<br/><textarea id="stopParticipateReason" placeholder="' + ui.l('events.stopParticipateHint') + '" style="margin-top:0.5em;"></textarea><br/><br/><button-text style="margin-top:1em;" onclick="pageEvent.participate()" label="events.stopParticipateButton"></button-text>');
				return;
			}
			if (!ui.q('#stopParticipateReason').value)
				return;
			d.values.reason = ui.q('#stopParticipateReason').value;
		} else {
			d.values.state = 1;
			d.values.eventId = e.event.id;
			d.values.eventDate = eventDate;
			d.values.payment = order;
		}
		communication.ajax({
			url: global.serverApi + 'db/one',
			webCall: 'pageEvent.participate',
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
					ui.classRemove('row[i="' + e.event.id + '_' + eventDate + '"] badge', 'hidden');
					ui.classAdd('detail card:last-child .event', 'participate');
					ui.classAdd('row[i="' + e.event.id + '_' + eventDate + '"]', 'participate');
					ui.q('detail card:last-child .event .reason').innerHTML = '';
					button.outerHTML = '';
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
					ui.navigation.closeHint();
					ui.q('detail .eventParticipationButtons button-text.participation').outerHTML = '';
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
				color: ui.cssValue(':root', '--bg2start'),
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
			grd.addColorStop(0, ui.cssValue(':root', '--bg1stop'));
			grd.addColorStop(1, ui.cssValue(':root', '--bg1start'));
			context.fillStyle = grd;
			context.fillRect(0, 0, canvas.width, canvas.height);
			context.fillStyle = ui.cssValue(':root', '--text');
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
						image.src = user.contact.image ? global.serverImg + user.contact.image : 'images/contacts.svg';
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
		var start = ui.q('dialog-popup input[name="startDate"]');
		var end = ui.q('dialog-popup input[name="endDate"]');
		var price = ui.q('dialog-popup [name="price"]');
		var text = ui.q('dialog-popup [name="description"]');
		var tags = ui.q('dialog-popup input-hashtags');
		var id = ui.q('dialog-popup [name="id"]').value;
		DialogPopup.setHint('');
		formFunc.resetError(start);
		formFunc.resetError(end);
		formFunc.resetError(text);
		formFunc.resetError(tags);
		formFunc.resetError(price);
		if (!user.appConfig.eventNoHashtags) {
			if (!tags.getAttribute('ids') && !tags.getAttribute('text'))
				formFunc.setError(tags, 'error.hashtags');
			else
				formFunc.validation.filterWords(tags);
			ui.q('dialog-popup input[name="skills"]').value = ui.q('dialog-popup input-hashtags').getAttribute('ids');
			ui.q('dialog-popup input[name="skillsText"]').value = ui.q('dialog-popup input-hashtags').getAttribute('text');
		}
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
		if (price.value > 0 && !user.contact.authenticate)
			formFunc.setError(price, 'events.errorAuthenticate');
		if (!price.value || price.value == 0) {
			ui.q('dialog-popup input-image').removeAttribute('value');
			ui.q('dialog-popup input[name="url"]').value = '';
		}
		if (ui.q('dialog-popup [name="repetition"][checked="true"]')) {
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
		} else
			end.value = start.value.substring(0, start.value.lastIndexOf('T'));
		var v = formFunc.getForm('dialog-popup form');
		if (!v.values.price)
			v.values.price = 0;
		if (ui.q('dialog-popup errorHint')) {
			ui.q('dialog-popup popupContent>div').scrollTo({ top: 0, behavior: 'smooth' });;
			return;
		}
		if (!ui.q('dialog-popup [name="repetition"][checked="true"]'))
			v.values.repetition = 'o';
		v.classname = 'Event';
		v.id = id;
		communication.ajax({
			url: global.serverApi + 'db/one',
			method: id ? 'PUT' : 'POST',
			webCall: 'pageEvent.save',
			body: v,
			success(r) {
				ui.navigation.closePopup();
				user.remove('event');
				details.open(id ? ui.q('detail card:last-child').getAttribute('i') : r + '_' + global.date.local2server(v.values.startDate).substring(0, 10),
					{ webCall: 'pageEvent.save', query: 'event_list', search: encodeURIComponent('event.id=' + (id ? id : r)) },
					id ? function (l, id) { ui.q('detail card:last-child').innerHTML = pageLocation.detailLocationEvent(l, id); } : pageLocation.detailLocationEvent);
				pageEvent.refreshToggle();
				pageHome.events = null;
				document.dispatchEvent(new CustomEvent('Event', { detail: { type: 'save', ...v } }));
			}
		});
	}
	static saveDraft() {
		ui.q('dialog-popup input[name="skills"]').value = ui.q('dialog-popup input-hashtags').getAttribute('ids');
		ui.q('dialog-popup input[name="skillsText"]').value = ui.q('dialog-popup input-hashtags').getAttribute('text');
		user.set('event', formFunc.getForm('dialog-popup form'));
	}
	static selectLocation() {
		ui.toggleHeight('dialog-popup .event', function () {
			ui.toggleHeight('dialog-popup .location');
		});
	}
	static selectVideoCall(e) {
		ui.classRemove('dialog-popup hour', 'selected');
		if (!ui.classContains(e, 'closed'))
			ui.classAdd(e, 'selected');
	}
	static setForm() {
		var b = ui.q('dialog-popup [name="repetition"][checked="true"]');
		ui.q('dialog-popup label[name="startDate"]').innerText = ui.l('events.' + (b ? 'start' : 'date'));
		pageEvent.openSection('dialog-popup field[name="endDate"]', b);
		b = ui.val('dialog-popup input-checkbox[name="type"][checked="true"]');
		var es = ui.qa('dialog-popup .noWTDField:not(field[name="endDate"])');
		for (var i = 0; i < es.length; i++)
			pageEvent.openSection(es[i], b != -2);
		ui.q('dialog-popup .url label').innerText = ui.l(b == -1 ? 'events.urlOnlineEvent' : 'events.url');
		pageEvent.openSection('dialog-popup .url', b == -1);
		pageEvent.openSection('dialog-popup .newWithoutLocation', b == -2);
		pageEvent.openSection('dialog-popup .locationName', b == 0);
		if (b == 0 && !ui.val('dialog-popup [name="id"]') && !ui.q('dialog-popup .event .locationName').innerText) {
			ui.classRemove('dialog-popup .event dialogButtons .selectLocation', 'hidden');
			ui.classAdd('dialog-popup .event dialogButtons .save', 'hidden');
		} else {
			ui.classRemove('dialog-popup .event dialogButtons .save', 'hidden');
			ui.classAdd('dialog-popup .event dialogButtons .selectLocation', 'hidden');
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
					webCall: 'pageEvent.toggle',
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
		var a = pageEvent.getCalendarList(r), newButton = field == 'contact' ? '' : '<br/><br/><button-text onclick="pageEvent.edit(' + id + ')" label="events.new"></button-text>';
		var s = '', v, text;
		var b = user.contact.id == id;
		if (b && e.getAttribute('active'))
			b = false;
		for (var i = 0; i < a.length; i++) {
			v = a[i];
			if (v.id) {
				var title = global.date.formatDate(v.event.startDate, 'weekdayLong');
				var date = global.date.getDateFields(v.event.startDate);
				date = date.year + '-' + date.month + '-' + date.day;
				var idIntern = v.event.id + '_' + date;
				title = global.date.getDateHint(v.event.startDate).replace('{0}', title);
				var image;
				if (v.event.imageList || v.imageList || v.event.locationId == -2 && v.contact.imageList)
					image = global.serverImg + (v.event.imageList ? v.event.imageList : v.imageList ? v.imageList : v.contact.imageList);
				else
					image = 'images/events.svg';
				text = '';
				if (v.event.price > 0)
					text += global.separator + ui.l('events.priceDisp').replace('{0}', parseFloat(v.event.price).toFixed(2).replace('.', ','));
				if (v.event.maxParticipants)
					text += global.separator + ui.l('events.maxParticipants') + ':&nbsp;' + v.event.maxParticipants;
				if (text)
					text = '<br/>' + text.substring(global.separator.length);
				text += '<br/>' + v.event.description;
				if (field == 'location')
					text = '<br/>' + v.name + text;
				s += global.template`<list-row
					${v.eventParticipate.state == 1 ? ' class="participate"' : v.eventParticipate.state == -1 ? ' class="canceled"' : ''}
					onclick="details.open(&quot;${idIntern}&quot;,${JSON.stringify({ webCall: 'pageEvent.toggleInternal', query: 'event_list', search: encodeURIComponent('event.id=' + v.event.id) }).replace(/"/g, '&quot;')},pageLocation.detailLocationEvent)"
					title="${encodeURIComponent(title)}"
					text="${encodeURIComponent(text)}"
					image="${image}">
					</list-row>`;
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
					webCall: 'pageEvent.toggleParticipants',
					query: 'event_listParticipate',
					latitude: geoData.current.lat,
					longitude: geoData.current.lon,
					distance: -1,
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
			webCall: 'pageEvent.verifyParticipation',
			responseType: 'json',
			success(r) {
				if (r.length > 1) {
					var location = model.convert(new Contact(), r, 1);
					var date = location.eventParticipate.eventDate + location.event.startDate.substring(location.event.startDate.indexOf('T'));
					if (location.eventParticipate.state == 1)
						ui.navigation.openHint({ desc: '<title>' + location._locationName + '</title>' + location._locationAddress.replace(/\n/g, '<br/>') + '<br/><br/>' + ui.l('events.qrcodeDate').replace('{0}', global.date.formatDate(date)) + '<br/>' + location.contact.pseudonym + '<br/><br/><qrCheck>&check;</qrCheck><img src="' + global.serverImg + location.contact.image + '" class="qrVerification"/>', pos: '5%,1em', size: '90%,auto' });
					else
						ui.navigation.openHint({ desc: '<title>' + location._locationName + '</title>' + location._locationAddress.replace(/\n/g, '<br/>') + '<br/><br/>' + ui.l('events.qrcodeDate').replace('{0}', global.date.formatDate(date)) + '<br/>' + location.contact.pseudonym + '<br/><emphasis>' + ui.l('events.qrcodeCanceled').replace('{0}', global.date.formatDate(location.eventParticipate.modifiedAt)) + '</emphasis><qrCheck class="negative">&cross;</qrCheck><br/><br/><img src="' + global.serverImg + location.contact.image + '" class="qrVerification"/>', pos: '5%,1em', size: '90%,auto' });
				} else
					ui.navigation.openHint({ desc: '<title>' + ui.l('events.qrcodeButton') + '</title>' + ui.l('events.qrcodeError'), pos: '5%,1em', size: '90%,auto' });
			}
		});
	}
}