import QRCodeStyling from 'qr-code-styling';
import { communication } from '../communication';
import { details } from '../details';
import { DialogHint } from '../elements/DialogHint';
import { DialogPopup } from '../elements/DialogPopup';
import { InputHashtags } from '../elements/InputHashtags';
import { geoData } from '../geoData';
import { global, Strings } from '../global';
import { lists } from '../lists';
import { Contact, EventParticipate, Location, model } from '../model';
import { formFunc, ui } from '../ui';
import { user } from '../user';
import { pageContact } from './contact';
import { pageLocation } from './location';

export { pageEvent };

class pageEvent {
	static mapEdit = {
		canvas: null,
		load: null
	};
	static nearByExec = null;
	static popupValues;
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
field.checkbox {
	margin-bottom: -0.5em;
}
.answerPlus {
	text-align: right;
	font-size: 2em;
	position: absolute;
	width: 1.5em;
	cursor: pointer;
	z-index: 1;
	top: 0;
	padding-right: 0.2em;
	right: 0;
	height: 1.2em;
	line-height: 1.2;
}
clubs {
	position: relative;
 	display: block;
 }
mapEdit{
	display: block;
	height: 15em;
}
</style>
<form name="editElement" onsubmit="return false">
<input type="hidden" name="id" value="${v.id}"/>
<input type="hidden" name="locationId" value="${v.locationID}"/>
<input type="hidden" name="longitude" value="${v.longitude}" />
<input type="hidden" name="latitude" value="${v.latitude}" />
<input type="hidden" name="skills" value="${v.skills}" />
<input type="hidden" name="skillsText" value="${v.skillsText}" />
<div class="event">
	<tabHeader>
		<tab i="Location" onclick="pageEvent.setForm()" class="${v.activeLocation}">${ui.l('events.location')}</tab>
		<tab i="Online" onclick="pageEvent.setForm()" class="${v.activeOnlineEvent}">${ui.l('events.newOnlineEvent')}</tab>
		<tab i="Inquiry" onclick="pageEvent.setForm()" class="${v.activeInquiry}">${ui.l('events.newInquiry')}</tab>
		<tab i="Poll" onclick="pageEvent.setForm()" class="${v.activePoll}">${ui.l('events.newPoll')}</tab>
	</tabHeader>
	<tabBody>
	<explain class="type" style="display:none;">${ui.l('events.newInquiryDescription')}</explain>
	<field${v.eventNoHashtags}>
		<label>${ui.l('events.hashtags')}</label>
		<value>
			<input-hashtags ids="${v.skills}" text="${v.skillsText}" name="skills"></input-hashtags>
		</value>
	</field>
	<field name="startDate">
		<label class="date">${ui.l('events.start')}</label>
		<value>
			<input-date name="startDate" value="${v.startDate}" min="${v.dateMin}" max="${v.dateMax}" scroll="dialog-popup popupContent div"></input-date>
		</value>
	</field>
	<field name="mapEdit" style="display:none;">
		<label>${ui.l('events.locationMap')}</label>
		<value>
			<mapEdit></mapEdit>
		</value>
	</field>
	<field class="noWTDField checkbox">
		<label>${ui.l('events.repetition')}</label>
		<value>
			<input-checkbox type="radio" deselect="true" name="repetition" value="Week" label="events.repetition_Week" onclick="pageEvent.setForm()" ${v.repetition_Week}></input-checkbox>
			<input-checkbox type="radio" deselect="true" name="repetition" value="TwoWeeks" label="events.repetition_TwoWeeks" onclick="pageEvent.setForm()" ${v.repetition_TwoWeeks}></input-checkbox>
			<input-checkbox type="radio" deselect="true" name="repetition" value="Month" label="events.repetition_Month" onclick="pageEvent.setForm()" ${v.repetition_Month}></input-checkbox>
			<input-checkbox type="radio" deselect="true" name="repetition" value="Year" label="events.repetition_Year" onclick="pageEvent.setForm()" ${v.repetition_Year}></input-checkbox>
			<input-checkbox type="radio" deselect="true" name="repetition" value="Games" label="events.repetition_Games" onclick="pageEvent.setForm()" ${v.repetition_Games}${v.repetitionClubsStyle}></input-checkbox>
   			<clubs style="display:none;">${v.clubs}</clubs>
		</value>
	</field>
	<field class="noWTDField" name="endDate" style="display:none;">
		<label>${ui.l('events.end')}</label>
		<value>
			<input-date type="date" name="endDate" value="${v.endDate}" min="${v.dateMin}" max="${v.dateMax}"></input--date>
		</value>
	</field>
	<field class="noWTDField">
		<label class="description">${ui.l('description')}</label>
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
	<field class="poll"${v.pollDisplay}>
		<label>${ui.l('events.answers')}</label>
		<value>
			<input type="text" maxlength="250"${v.pollValue} />
			${v.pollInput}
			<div onclick="pageEvent.addAnswer()" class="answerPlus">+</div>
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
	<field${v.publish}>
		<label>${ui.l('events.publish')}</label>
		<value>
			<input-checkbox name="publish" label="events.publishCheckbox" value="true" ${v.publishValue}></input-checkbox>
		</value>
	</field>
	<div class="locationName" style="color:white;cursor:pointer;display:none;" onclick="pageEvent.selectLocation()">${v.locationName}</div>
	<dialogButtons>
		<button-text onclick="pageEvent.selectLocation()" label="events.selectLocation" class="selectLocation"></button-text>
		<button-text onclick="pageEvent.save()" label="save" class="save hidden"></button-text>
		<button-text onclick="pageLocation.deleteElement(${v.id},&quot;Event&quot;)" ${v.hideDelete} id="deleteElement" label="delete"></button-text>
	</dialogButtons>
	<popupHint></popupHint>
	</tabBody>
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
		global.template`<style>
detail text.description.event poll {
	display: block;
	margin-top: 0.75em;
	position: relative;
}
poll result {
	display: block;
	text-align: left;
}
poll result div indicator {
	background: var(--bg1start);
	opacity: 0.7;
	height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    display: inline-block;
	border-radius: 0.5em;
}
poll result value {
	z-index: 2;
    position: relative;
}
poll result div {
	position: relative;
	padding: 0.25em 0.5em;
    margin-top: 0.5em;
}
</style>
<text class="description event" ${v.oc}>
<div><span class="chatLinks${v.hideOwner}" onclick="ui.navigation.autoOpen(global.encParam(&quot;p=${v.event.contactId}&quot;),event)"><img ${v.imageEventOwner}/><br>${v.contact.pseudonym}</span></div>
<div class="date eventMargin">${v.date}${v.endDate}</div>
<div class="eventMargin">${v.text}</div>
<div class="eventMargin">${v.maxParticipants}</div>
<div class="price eventMargin">${v.eventPrice}</div>
<div class="eventMargin"><urls>${v.eventUrl}</urls></div>
<div class="reason eventMargin"></div>
<span class="eventParticipationButtons eventMargin"></span>
</text>`;
	static addAnswer() {
		var inputs = ui.qa('dialog-popup field.poll input');
		var e = document.createElement('input');
		e.style.marginTop = '0.5em';
		e.maxLength = inputs[0].maxLength;
		inputs[inputs.length - 1].after(e);
	}
	static checkPrice() {
		if (ui.q('dialog-popup [name="price"]').value > 0) {
			pageEvent.openSection('dialog-popup .paypal', !user.contact.authenticate);
			pageEvent.openSection('dialog-popup .picture', true);
			pageEvent.openSection('dialog-popup .url', true);
		} else {
			pageEvent.openSection('dialog-popup .paypal', false);
			pageEvent.openSection('dialog-popup .picture', false);
			pageEvent.openSection('dialog-popup .url', ui.q('dialog-popup tabHeader tab.tabActive').getAttribute('i') == 'Online');
		}
	}
	static detail(v) {
		v.eventParticipate = new EventParticipate();
		v.copyLinkHint = ui.l('copyLinkHint.event');
		if (v.event.repetition && v.event.repetition != 'Once' && v.event.repetition != 'Games') {
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
			if (v.event.contactId == user.contact.id && d >= global.date.getToday() && v.event.type != 'Poll')
				v.hideMePotentialParticipants = '';
			if (v.id.split('_').length > 1)
				communication.ajax({
					url: global.serverApi + 'db/list?query=event_listParticipateRaw&search=' + encodeURIComponent('eventParticipate.eventId=' + v.event.id
						+ (v.event.repetition == 'Once' ? '' : ' and eventParticipate.eventDate=cast(\'' + v.id.split('_')[1] + '\' as timestamp)')),
					webCall: 'event.detail',
					responseType: 'json',
					success(r) {
						if (ui.q('detail card[i="' + v.id + '"]')) {
							var count = {}, max = 0;
							for (var i = 1; i < r.length; i++) {
								var e = model.convert(new EventParticipate(), r, i);
								if (e.contactId == user.contact.id) {
									v.eventParticipate = e;
									if (v.event.type == 'Poll') {
										if (v.eventParticipate.state < 0)
											v.eventParticipate.state += 2 * 2147483647 - 2;
										for (var i2 = 0; Math.pow(2, i2) <= v.eventParticipate.state; i2++) {
											if ((v.eventParticipate.state & Math.pow(2, i2)) > 0)
												ui.attr('detail input-checkbox[name="poll' + v.id + '"][value="' + i2 + '"]', 'checked', 'true');
										}
									}
								}
								if (!count['state' + e.state])
									count['state' + e.state] = 0;
								if (++count['state' + e.state] > max)
									max = count['state' + e.state];
							}
							ui.q('detail card[i="' + v.id + '"] detailHeader').setAttribute('data', encodeURIComponent(JSON.stringify(v)));
							if (v.event.type == 'Poll') {
								if (r.length > 1)
									ui.q('detail card[i="' + v.id + '"] participantCount').innerHTML = ' (' + (r.length - 1) + ' ' + ui.l('events.participants') + ')';
								pageEvent.openPollResult(r, v.id);
							} else {
								ui.q('detail card[i="' + v.id + '"] .eventParticipationButtons').innerHTML = pageEvent.getParticipateButton(v, count['state1']);
								if (v.eventParticipate.state == 1) {
									ui.classAdd('detail card[i="' + v.id + '"] text.description.event', 'participate');
									ui.classRemove('detail  card[i="' + v.id + '"] div.ratingButton', 'hidden');
								} else if (v.eventParticipate.state == -1) {
									ui.classAdd('detail card[i="' + v.id + '"] text.description.event', 'canceled');
									ui.q('detail card[i="' + v.id + '"] .reason').innerHTML = ui.l('events.canceled') + (v.eventParticipate.reason ? ':<br/>' + v.eventParticipate.reason : '');
								}
							}
						}
					}
				});
		}
		if (v.event.price > 0)
			v.eventPrice = ui.l('events.priceDisp').replace('{0}', parseFloat(v.event.price).toFixed(2).replace('.', ','));
		else if (v.event.type == 'Online' || v.event.type == 'Location')
			v.eventPrice = ui.l('events.priceDisp0');
		if (v.event.maxParticipants)
			v.maxParticipants = ui.l('events.maxParticipants') + ':&nbsp;' + v.event.maxParticipants;
		if (v.event.contactId == user.clientId)
			v.hideOwner = ' hidden';
		else if (v.contact.imageList)
			v.imageEventOwner = 'src="' + global.serverImg + v.contact.imageList + '"';
		else
			v.imageEventOwner = 'source="contacts" style="padding:1em;"';
		if (v.event.type == 'Poll') {
			var end = global.date.getDateFields(v.event.endDate);
			d.setDate(end.day);
			d.setMonth(end.month);
			d.setYear(end.year);
			var data = JSON.parse(v.event.description);
			v.text = '<b>' + ui.l('events.newPoll') + '</b><br/>' + data.q.replace(/\n/g, '<br/>') + '<participantCount></participantCount><poll>';
			for (var i = 0; i < data.a.length; i++)
				v.text += '<input-checkbox type="radio" name="poll' + v.id + '" label="' + data.a[i] + '" value="' + (i + 1) + '"' + (d < new Date() ? ' readonly="true"' : ' onclick="pageEvent.saveParticipation()"') + '></input-checkbox>';
			v.text += '<result></result></poll>';
		} else
			v.text = Strings.replaceLinks(v.event.description).replace(/\n/g, '<br/>');
		v.hideMeFavorite = ' hidden';
		v.hideMeEvents = ' hidden';
		v.hideMeMarketing = ' hidden';
		if (v.event.url) {
			var h = new URL(v.event.url).hostname;
			while (h.indexOf('.') != h.lastIndexOf('.'))
				h = h.substring(h.indexOf('.') + 1);
			v.eventUrl = '<label class="multipleLabel" onclick="ui.navigation.openHTML(&quot;' + v.event.url + '&quot;)">' + (v.event.type == 'Online' ? ui.l('events.newOnlineEvent') + ': ' : '') + h.toLowerCase() + '</label>';
		}
		if (user.contact && user.contact.id == v.event.contactId)
			v.editAction = 'pageEvent.edit(' + v.locID + ',' + v.event.id + ')';
		else
			v.hideMeEdit = ' hidden';
		return pageEvent.templateDetail(v);
	}
	static edit(locationID, id) {
		if (!user.contact) {
			ui.navigation.openHint({ desc: 'teaserEvents', pos: '5%,-35%', size: '90%,auto', hinkyClass: 'bottom', hinky: 'left:4.5em;' });
			return;
		}
		if (!pageEvent.paypal.fee) {
			communication.ajax({
				url: global.serverApi + 'action/paypalKey',
				webCall: 'event.edit',
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
				url: global.serverApi + 'db/list?query=contact_listVideoCalls&search=' + encodeURIComponent('contactVideoCall.time>cast(\'' + global.date.local2server(d) + '\' as timestamp)'),
				webCall: 'event.edit',
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
		ui.navigation.closeMenu();
		if (id)
			pageEvent.editInternal(locationID, id, JSON.parse(decodeURIComponent(ui.q('detail card:last-child detailHeader').getAttribute('data'))).event);
		else
			pageEvent.editInternal(locationID);
	}
	static editInternal(locationID, id, v) {
		if (!id && user.get('event')) {
			v = user.get('event').values;
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
		if (v.publish)
			v.publishValue = ' checked="true"';
		if (!id || v.price > 0 && ui.q('detail card:last-child button-text participantCount')?.innerText.length)
			v.hideDelete = 'class="hidden"';
		d = global.date.getDateFields(new Date());
		v.today = d.year + '-' + d.month + '-' + d.day;
		v.id = id;
		v.locationID = locationID;
		v['repetition_' + v.repetition] = ' checked="true"';
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
		d = new Date();
		v.dateMin = d.toISOString().substring(0, 10);
		v.dateMax = new Date(d.setFullYear(d.getFullYear() + 5)).toISOString().substring(0, 10);
		if (id || locationID > 0) {
			if (locationID > 0) {
				var e = JSON.parse(decodeURIComponent(ui.q('detail card:last-child detailHeader').getAttribute('data')))
				v.locationName = e.name + '<br/>' + e.address.replace(/\n/g, global.separator);
			}
		} else
			pageEvent.locationsOfPastEvents();
		if (user.contact.type && user.contact.type.indexOf('admin') > -1)
			v.hideInquiry = 'class="hidden"';
		v.payplaSignUpHint = ui.l('events.paypalSignUpHint').replace('{0}', pageEvent.paypal.feeDate ?
			ui.l('events.paypalSignUpHintFee').replace('{0}', pageEvent.paypal.fee).replace('{1}', global.date.formatDate(pageEvent.paypal.feeDate)).replace('{2}', pageEvent.paypal.feeAfter)
			: pageEvent.paypal.fee);
		v.appointment = user.getAppointmentTemplate('authenticate');
		if (global.config.eventNoHashtags)
			v.eventNoHashtags = ' class="hidden"';
		if (v.type == 'Online')
			v.activeOnlineEvent = 'tabActive';
		else if (v.type == 'Inquiry')
			v.activeInquiry = 'tabActive';
		else if (v.type == 'Poll') {
			v.activePoll = 'tabActive';
			if (v.description) {
				try {
					var d = JSON.parse(v.description);
					v.description = d.q;
					v.pollDisplay = ' style="display:block;"';
					v.pollValue = ' value="' + d.a[0] + '"';
					v.pollInput = '';
					for (var i = 1; i < d.a.length; i++)
						v.pollInput += '<input type="text" maxlength="250" value="' + (d.a[i] ? d.a[i] : '') + '" style="margin-top:0.5em;"/>';
				} catch (e) { }
			}
		} else
			v.activeLocation = 'tabActive';
		if (global.config.club)
			v.hideOnlineEvent = 'class="hidden"';
		v.publish = global.config.publishingWall ? '' : ' class="hidden"';
		if (!v.latitude)
			v.latitude = geoData.getCurrent().lat;
		if (!v.longitude)
			v.longitude = geoData.getCurrent().lon;
		var skills = user.contact.skills?.split('\|');
		var s = '';
		if (skills) {
			for (var i = 0; i < skills.length; i++) {
				if (skills[i].indexOf(global.config.searchMandatory) == 0)
					s += '<input-checkbox type="radio" name="skills" value="' + skills[i] + '" label="' + InputHashtags.ids2Text(skills[i]) + '"' + (s ? '' : ' checked="true"') + '></input-checkbox>';
			}
			if (s && v.id)
				s += '<input-checkbox type="radio" name="skills" value="X" label="' + ui.l('events.skillsStopRepetition') + '"></input-checkbox>';
		}
		v.clubs = s ? s : ui.l('events.noClubs');
		if (!global.config.searchMandatory)
			v.repetitionClubsStyle = ' style="display:none;"';
		ui.navigation.openPopup(ui.l('events.' + (id ? 'edit' : 'new')), pageEvent.templateEdit(v), 'pageEvent.saveDraft()');
		setTimeout(pageEvent.setForm, 400);
		var selectable = function (value) {
			if (!value || value.length < 3 || value == 'Once' || value == 'Games')
				return;
			var e = ui.q('dialog-popup input-date[name="endDate"]');
			var startDate = ui.q('dialog-popup input-date[name="startDate"]');
			if (value && startDate.getAttribute('complete') == 'true') {
				var d = new Date(startDate.getAttribute('value')), s = '', maxDate = new Date(startDate.getAttribute('max'));
				while (true) {
					if (value == 'Week')
						d.setDate(d.getDate() + 7);
					else if (value == 'TwoWeeks')
						d.setDate(d.getDate() + 14);
					else if (value == 'Month')
						d.setMonth(d.getMonth() + 1);
					else if (value == 'Year')
						d.setFullYear(d.getFullYear() + 1);
					if (d > maxDate)
						break;
					s += d.toISOString().substring(0, 10);
				}
				e.setAttribute('selectable', s);
			} else
				e.removeAttribute('selectable');
		}
		ui.on('dialog-popup input-checkbox[name="repetition"]', 'Checkbox', function (event) {
			DialogHint.close();
			selectable(event.detail.value);
		});
		ui.on('dialog-popup input-date[name="startDate"]', 'Date', function (event) {
			if (event.detail.complete == 'true') {
				var e = ui.q('dialog-popup input-date[name="endDate"]');
				var d = new Date(event.detail.value);
				d.setDate(d.getDate() + 1);
				e.setAttribute('min', d.toISOString().substring(0, 10));
				e = ui.q('dialog-popup input-checkbox[name="repetition"][checked="true"]');
				selectable(e ? e.getAttribute('value') : null);
			}
		});
		selectable(v.repetition);
		pageEvent.popupValues = JSON.stringify(formFunc.getForm('dialog-popup form'));
		communication.loadMap('pageEvent.editMap');
	}
	static editMap() {
		if (!ui.q('dialog-popup mapEdit')) {
			setTimeout(pageEvent.editMap, 100);
			return;
		}
		pageEvent.mapEdit.canvas = new google.maps.Map(ui.q('dialog-popup mapEdit'), {
			mapTypeId: google.maps.MapTypeId.ROADMAP, disableDefaultUI: true, maxZoom: 16, center: new google.maps.LatLng(parseFloat(ui.val('dialog-popup [name="latitude"]')), parseFloat(ui.val('dialog-popup [name="longitude"]'))), zoom: 17
		});
		pageEvent.mapEdit.canvas.addListener('center_changed', function () {
			ui.q('dialog-popup [name="latitude"]').value = pageEvent.mapEdit.canvas.getCenter().lat();
			ui.q('dialog-popup [name="longitude"]').value = pageEvent.mapEdit.canvas.getCenter().lng();
		});
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
			var d2 = global.date.server2local(v.event.endDate ? v.event.endDate : v.event.startDate);
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
					if (v.event.repetition == 'Week')
						d1.setDate(d1.getDate() + 7);
					else if (v.event.repetition == 'TwoWeeks')
						d1.setDate(d1.getDate() + 14);
					else if (v.event.repetition == 'Month')
						d1.setMonth(d1.getMonth() + 1);
					else if (v.event.repetition == 'Year')
						d1.setFullYear(d1.getFullYear() + 1);
					else
						break;
				} while (v.event.repetition != 'Once' && v.event.repetition != 'Games' && d1 < d2);
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
		if (v.eventParticipate.state == -1 || v.event.type == 'Poll')
			return '';
		var futureEvent = pageEvent.getDate(v) > new Date();
		var text = '<detailButtons style="margin:1em 0;">';
		if (futureEvent) {
			if (false && v.event.locationId > 0 && (v.event.contactId == user.contact.id || v.eventParticipate.state == 1))
				text += '<button-text onclick="pageEvent.qrcode(' + (v.event.contactId == user.contact.id) + ')" label="events.qrcodeButton"></button-text><br/><br/>';
			if (v.event.price > 0 && user.contact.id != v.event.contactId) {
				if (!v.eventParticipate.state && v.contact.authenticate)
					text += '<button-text class="participation" onclick="pageLogin.paypal(' + v.contact.id + ')" label="events.participante"></button-text>';
			} else if (v.eventParticipate.state == 1 || !v.event.maxParticipants || participantCount < v.event.maxParticipants)
				text += '<button-text class="participation" onclick="pageEvent.saveParticipation()" label="events.participante' + (v.eventParticipate.state == 1 ? 'Stop' : '') + '"></button-text>';
		}
		if (participantCount > 0 || futureEvent)
			text += '<button-text onclick="pageEvent.toggleParticipants(event)"><participantCount>' + (participantCount > 0 ? participantCount + '&nbsp;' : '') + '</participantCount>' + ui.l('events.participants') + '</button-text>';
		text += '</detailButtons><text name="participants" style="margin:0 -1em;display:none;"></text>';
		return text;
	}
	static init() {
		if (!ui.q('events').innerHTML)
			ui.q('events').innerHTML = '<list-body></list-body>';
		if (!ui.q('events listResults list-row') && ui.navigation.getActiveID() != 'events')
			setTimeout(ui.navigation.openMenu, 500);
	}
	static listEvents(as) {
		if (!as.length)
			return '';
		var today = global.date.getToday();
		var s = '', v;
		var current = '';
		var name, text, flag1, flag2, flag3 = '', image, clazz;
		for (var i = 0; i < as.length; i++) {
			if (as[i] == 'outdated')
				s += '<listSeparator class="highlightColor strong">' + ui.l('events.outdated') + '</listSeparator>';
			else {
				v = as[i];
				var data = encodeURIComponent(JSON.stringify(v));
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
				flag2 = skills.total && skills.totalMatch ? parseInt('' + (skills.totalMatch / skills.total * 100 + 0.5)) + '%' : '';
				if (v._geolocationDistance && v.latitude)
					flag3 = '<compass style="transform:rotate('
						+ geoData.getAngel(geoData.getCurrent(), { lat: v.latitude, lon: v.longitude }) + 'deg);"></compass>';
				else if (v.contact.gender)
					flag3 = '<img source="gender' + v.contact.gender + '" />';
				if (v.name)
					name = t + ' ' + v.name;
				else
					name = t + ' ' + v.contact.pseudonym + (v.contact.age ? ' (' + v.contact.age + ')' : '');
				if (v.event.type == 'Poll') {
					var json = JSON.parse(v.event.description);
					text = json.q + '<br/>';
					for (var i2 = 0; i2 < json.a.length; i2++)
						text += json.a[i2].trim() + ', ';
					text = text.substring(0, text.length - 2).trim();
				} else {
					text = v.event.description;
					text += '<br/>' + (v.event.id && v.address ? v.address : skills.text());
				}
				clazz = v.locationFavorite.favorite ? ' favorite' : '';
				if (global.date.local2server(v.event.startDate).indexOf(v.eventParticipate.eventDate) == 0)
					clazz = v.eventParticipate.state == -1 ? ' canceled' : ' participate';
				if (v.event.imageList)
					image = v.event.imageList;
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
					oc = 'details.open(&quot;' + v.idDate + '&quot;,' + JSON.stringify({ webCall: 'event.listEvents', query: 'event_list', search: encodeURIComponent('event.id=' + v.event.id) }).replace(/"/g, '&quot;') + ',pageLocation.detailLocationEvent)';
				s += global.template`<list-row onclick="${oc}" i="${v.idDate}" class="event${clazz ? ' ' + clazz : ''}"
					data="${data}"	
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
				ui.navigation.closeMenu();
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
				document.dispatchEvent(new CustomEvent('List', { detail: { id: divID } }));
			}
		};
		lists.load(
			params,
			function (l) {
				events = l;
				render();
			});
		lists.load({
			webCall: 'event.loadEvents',
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
			webCall: 'event.loadPotentialParticipants',
			query: 'contact_list',
			distance: 50,
			latitude: geoData.getCurrent().lat,
			longitude: geoData.getCurrent().lon,
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
					webCall: 'event.locations',
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
			webCall: 'event.locationsOfPastEvents',
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
		ui.css('dialog-popup .locationName', 'display', 'block');
		ui.css('dialog-popup .locationName', 'height', '');
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
						pageEvent.saveParticipation(JSON.stringify(orderData));
				});
			}
		}).render('#paypal-button-container');
	}
	static openPollResult(r, id) {
		var render = function (r2) {
			if (ui.q('detail card[i="' + id + '"]')) {
				var count = [], votes = 0, labels = [];
				for (var i = 1; i < r2.length; i++) {
					var e = model.convert(new EventParticipate(), r2, i);
					for (var i2 = 0; Math.pow(2, i2) <= e.state; i2++) {
						if (e.state < 0)
							e.state += 2 * 2147483647 - 2;
						if ((e.state & Math.pow(2, i2)) > 0) {
							var key = ui.q('detail input-checkbox[name="poll' + id + '"][value="' + i2 + '"] label').innerText;
							count[key] = count[key] > 0 ? count[key] + 1 : 1;
							if (!labels.includes(key))
								labels.push(key);
							votes++;
						}
					}
				}
				labels.sort();
				var s = '';
				for (var i = 0; i < labels.length; i++) {
					var x = parseInt(count[labels[i]] / votes * 100 + 0.5);
					s += '<div><indicator style="width:' + x + '%;"></indicator><value>' + x + '%' + global.separator + labels[i] + '</value></div>';
				}
				ui.q('detail card[i="' + id + '"] poll>result').innerHTML = s;
			}
		};
		if (r)
			render(r);
		else
			communication.ajax({
				url: global.serverApi + 'db/list?query=event_listParticipateRaw&search=' + encodeURIComponent('eventParticipate.eventId=' + id.split('_')[0]),
				webCall: 'event.openPollResult',
				responseType: 'json',
				success: render
			});
	}
	static openSection(e, open) {
		if (!open && ui.cssValue(e, 'display').indexOf('none') < 0 || open && ui.cssValue(e, 'display').indexOf('none') > -1)
			ui.toggleHeight(e);
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
		var start = ui.q('dialog-popup input-date[name="startDate"]');
		var end = ui.q('dialog-popup input-date[name="endDate"]');
		var price = ui.q('dialog-popup [name="price"]');
		var text = ui.q('dialog-popup [name="description"]');
		var tags = ui.q('dialog-popup input-hashtags');
		var id = ui.val('dialog-popup [name="id"]');
		var repetition = ui.val('dialog-popup [name="repetition"][checked="true"]');
		var type = ui.q('dialog-popup tabHeader tab.tabActive').getAttribute('i');
		DialogPopup.setHint('');
		formFunc.resetError(start);
		formFunc.resetError(end);
		formFunc.resetError(text);
		formFunc.resetError(tags);
		formFunc.resetError(price);
		if (!global.config.eventNoHashtags) {
			if (!tags.getAttribute('ids') && !tags.getAttribute('text'))
				formFunc.setError(tags, 'error.hashtags');
			else
				formFunc.validation.filterWords(tags);
		}
		if (!text.value)
			formFunc.setError(text, 'error.description');
		else
			formFunc.validation.filterWords(text);
		if (start.getAttribute('complete') == 'false')
			formFunc.setError(start, 'events.errorDate');
		if (price.value > 0 && !user.contact.authenticate)
			formFunc.setError(price, 'events.errorAuthenticate');
		if (!price.value || price.value == 0) {
			ui.q('dialog-popup input-image').removeAttribute('value');
			if (type != 'Online')
				ui.q('dialog-popup input[name="url"]').value = '';
		}
		if (repetition && repetition != 'Games') {
			if (end.getAttribute('complete') == 'false')
				formFunc.setError(end, 'events.errorDateNoEnd');
		} else if (start.getAttribute('complete') == 'true')
			end.setAttribute('value', ui.val(start).substring(0, ui.val(start).lastIndexOf(' ')));
		var v = formFunc.getForm('dialog-popup form');
		if (!v.values.price)
			v.values.price = 0;
		var answers = ui.qa('dialog-popup field.poll input');
		if (!ui.q('dialog-popup [name="repetition"][checked="true"]') || v.values.type == 'Inquiry' || v.values.type == 'Poll')
			v.values.repetition = 'Once';
		if (type == 'Poll') {
			for (var i = 0; i < answers.length; i++)
				formFunc.validation.filterWords(answers[i]);
			var d = { q: v.values.description, a: [] };
			for (var i = 0; i < answers.length; i++) {
				if (answers[i].value)
					d.a.push(answers[i].value);
			}
			if (d.a.length < 2)
				formFunc.setError(answers[answers.length - 1], 'events.errorAnswer');
			else
				v.values.description = JSON.stringify(d);
		} else if (repetition == 'Games')
			v.values.skills = ui.val('dialog-popup clubs input-checkbox[checked="true"]');
		if (ui.q('dialog-popup errorHint')) {
			ui.q('dialog-popup popupContent>div').scrollTo({ top: 0, behavior: 'smooth' });
			return;
		}
		v.classname = 'Event';
		v.values.publishId = null;
		communication.ajax({
			url: global.serverApi + 'db/one' + (id ? '/' + id : ''),
			method: id ? 'PATCH' : 'POST',
			webCall: 'event.save',
			body: v,
			error(r) {
				if (r && r.responseText) {
					var e = JSON.parse(r.responseText);
					if (e.msg && e.msg.indexOf('exists:') == 0) {
						ui.navigation.openPopup(ui.l('attention'), ui.l('events.seriesExists').replace('{0}', ui.q('dialog-popup clubs input-checkbox[checked="true"] label').innerHTML)
							+ '<br/><br/><button-text onclick="ui.navigation.autoOpen(&quot;' + global.encParam('e=' + e.msg.substring(e.msg.indexOf(':') + 1).trim()) + '&quot;)">' + ui.l('events.open') + '</button-text>');
						return;
					}
				}
				communication.onError(r);
			},
			success(r) {
				if (v.values.repetition == 'Games') {
					communication.ajax({
						url: global.serverApi + 'db/one?query=contact_list&search=' + encodeURIComponent('contact.id=' + user.contact.id),
						responseType: 'json',
						webCall: 'event.save',
						success(r2) {
							if (r2['contact.storage'])
								user.contact.storage = JSON.parse(r2['contact.storage']);
						}
					});
				}
				ui.navigation.closePopup();
				user.remove('event');
				details.open(id ? ui.q('detail card:last-child').getAttribute('i') : r + '_' + global.date.local2server(v.values.startDate).substring(0, 10),
					{ webCall: 'event.save', query: 'event_list', search: encodeURIComponent('event.id=' + (id ? id : r)) },
					id ? function (l, id) { ui.q('detail card:last-child').innerHTML = pageLocation.detailLocationEvent(l, id); } : pageLocation.detailLocationEvent);
				pageEvent.refreshToggle();
				document.dispatchEvent(new CustomEvent('Event', { detail: { action: 'save', ...v } }));
			}
		});
	}
	static saveDraft() {
		if (pageEvent.popupValues != JSON.stringify(formFunc.getForm('dialog-popup form')))
			user.set('event', formFunc.getForm('dialog-popup form'));
	}
	static saveParticipation(order) {
		if (!user.contact)
			return;
		var e = JSON.parse(decodeURIComponent(ui.q('detail card:last-child detailHeader').getAttribute('data')));
		if (e.event.price > 0 && !user.contact.image) {
			ui.navigation.openPopup(ui.l('attention'), ui.l('events.participationNoImage') + '<br/><br/><button-text onclick="ui.navigation.goTo(&quot;settings&quot;)" label="settings.editProfile"></button-text>');
			return;
		}
		var button = ui.q('detail card:last-child button-text.participation');
		var d = { classname: 'EventParticipate', values: {} };
		var eventDate = e.id.split('_')[1];
		if (e.event.type == 'Poll') {
			d.values.state = 0;
			var v = ui.val('detail input-checkbox[name="poll' + e.id + '"][checked="true"]').split(global.separatorTech);
			for (var i = 0; i < v.length; i++) {
				if (v[i])
					d.values.state += Math.pow(2, parseInt(v[i]));
			}
			if (d.values.state > 2147483647)
				d.values.state -= 2 * 2147483647 + 2;
			d.values.eventId = e.event.id;
			d.values.eventDate = eventDate;
		} else if (e.eventParticipate.id) {
			d.values.state = e.eventParticipate.state == 1 ? -1 : 1;
			if (!ui.q('#stopParticipateReason')) {
				ui.navigation.openPopup(ui.l('events.stopParticipate'), ui.l('events.stopParticipateText') + '<br/><textarea id="stopParticipateReason" placeholder="' + ui.l('events.stopParticipateHint') + '" style="margin-top:0.5em;"></textarea><br/><br/><button-text style="margin-top:1em;" onclick="pageEvent.saveParticipation()" label="events.stopParticipateButton"></button-text>');
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
			url: global.serverApi + 'db/one' + (e.eventParticipate?.id ? '/' + e.eventParticipate.id : ''),
			webCall: 'event.saveParticipation',
			method: e.eventParticipate?.id ? 'PATCH' : 'POST',
			body: d,
			success(r) {
				e.eventParticipate.state = d.values.state;
				if (r) {
					e.eventParticipate.eventId = d.values.eventId;
					e.eventParticipate.eventDate = d.values.eventDate;
					e.eventParticipate.id = r;
				}
				ui.q('detail card:last-child detailHeader').setAttribute('data', encodeURIComponent(JSON.stringify(e)));
				var e2 = ui.q('detail card[i="' + e.event.id + '_' + eventDate + '"] button-text participantCount');
				if (e.event.type == 'Poll')
					pageEvent.openPollResult(null, e.event.id + '_' + eventDate);
				else {
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
				}
				ui.navigation.closePopup();
				if (order) {
					ui.navigation.closeHint();
					ui.q('detail .eventParticipationButtons button-text.participation').outerHTML = '';
				}
				if (e.event.type == 'Poll') {
					;
				} else {
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
			}
		});
	}
	static selectLocation() {
		ui.toggleHeight('dialog-popup .event', function () {
			ui.toggleHeight('dialog-popup .location');
		});
	}
	static selectTab(i) {
		if (ui.q('dialog-popup tabHeader tab.tabActive')?.getAttribute('onclick').indexOf(i) > 0)
			return;
		var animation = ui.q('dialog-popup tabBody').getAttribute('animation');
		if (animation && new Date().getTime() - animation < 500)
			return;
		ui.classRemove('dialog-popup tab', 'tabActive');
		ui.classAdd(ui.qa('dialog-popup tab')[i], 'tabActive');
		ui.q('dialog-popup tabBody').style.marginLeft = i * -100 + '%';
		ui.attr('dialog-popup tabBody', 'animation', new Date().getTime());
	}
	static selectVideoCall(e) {
		ui.classRemove('dialog-popup hour', 'selected');
		if (!ui.classContains(e, 'closed'))
			ui.classAdd(e, 'selected');
	}
	static setForm() {
		var repetition = ui.val('dialog-popup input-checkbox[name="repetition"][checked="true"]');
		pageEvent.openSection('dialog-popup clubs', repetition == 'Games');
		var b = ui.q('dialog-popup tabHeader tab.tabActive').getAttribute('i');
		var es = ui.qa('dialog-popup .noWTDField:not(field[name="endDate"])');
		for (var i = 0; i < es.length; i++)
			pageEvent.openSection(es[i], b == 'Online' || b == 'Location');
		if (b == 'Inquiry' || b == 'Poll')
			ui.html('dialog-popup explain.type', ui.l(b == 'Inquiry' ? 'events.newInquiryDescription' : 'events.newPollDescription'));
		pageEvent.openSection('dialog-popup field[name="startDate"]', repetition != 'Games' || b == 'Inquiry' || b == 'Poll');
		pageEvent.openSection('dialog-popup field[name="endDate"]', (b == 'Online' || b == 'Location') && repetition && repetition != 'Games');
		ui.q('dialog-popup .url label').innerText = ui.l(b == 'Online' ? 'events.urlOnlineEvent' : 'events.url');
		pageEvent.openSection('dialog-popup .url', b == 'Online');
		pageEvent.openSection('dialog-popup field[name="mapEdit"]', b == 'Inquiry');
		pageEvent.openSection('dialog-popup explain.type', b == 'Inquiry' || b == 'Poll');
		pageEvent.openSection('dialog-popup .locationName', b == 'Location');
		pageEvent.openSection('dialog-popup .poll', b == 'Poll');
		if (b == 'Location' && !ui.val('dialog-popup [name="id"]') && !ui.q('dialog-popup .event .locationName').innerText) {
			ui.classRemove('dialog-popup .event dialogButtons .selectLocation', 'hidden');
			ui.classAdd('dialog-popup .event dialogButtons .save', 'hidden');
		} else {
			ui.classRemove('dialog-popup .event dialogButtons .save', 'hidden');
			ui.classAdd('dialog-popup .event dialogButtons .selectLocation', 'hidden');
		}
		ui.q('dialog-popup label.date').innerText = ui.l();
		ui.html('dialog-popup label.date', ui.l('events.' + (b == 'Poll' ? 'end' : b ? 'start' : 'date')));
		ui.html('dialog-popup label.description', ui.l(b == 'Poll' ? 'events.descriptionPoll' : 'description'));
		ui.attr('dialog-popup textarea[name="description"]', 'placeholder', b == 'Inquiry' ? ui.l('events.newInquiryHint') : b == 'Poll' ? ui.l('events.newPollHint') : '');
		pageEvent.checkPrice();
	}
	static toggle(id) {
		var d = ui.q('detail card:last-child [name="events"]');
		if (d) {
			if (!d.innerHTML) {
				var field = ui.q('detail card:last-child').getAttribute('type');
				communication.ajax({
					url: global.serverApi + 'db/list?query=event_list&search=' + encodeURIComponent('event.' + field + 'Id=' + id) + '&distance=-1&latitude=' + geoData.getCurrent().lat + '&longitude=' + geoData.getCurrent().lon,
					webCall: 'event.toggle',
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
				if (v.event.imageList || v.imageList || v.event.type == 'Inquiry' && v.contact.imageList)
					image = v.event.imageList ? v.event.imageList : v.imageList ? v.imageList : v.contact.imageList;
				else
					image = 'events';
				text = v.event.description;
				if (v.event.price > 0)
					text += global.separator + ui.l('events.priceDisp').replace('{0}', parseFloat(v.event.price).toFixed(2).replace('.', ','));
				if (v.event.maxParticipants)
					text += global.separator + ui.l('events.maxParticipants') + ':&nbsp;' + v.event.maxParticipants;
				if (field == 'location')
					text += '<br/>' + v.name;
				var skills = ui.getSkills(v.event.id ? v.event : v.contact, 'list');
				var flag1 = v._geolocationDistance ? parseFloat(v._geolocationDistance).toFixed(v._geolocationDistance >= 9.5 || !v.id ? 0 : 1).replace('.', ',') : '';
				var flag2 = skills.total && skills.totalMatch ? parseInt('' + (skills.totalMatch / skills.total * 100 + 0.5)) + '%' : '';
				var flag3 = '';
				if (v._geolocationDistance && v.latitude)
					flag3 = '<compass style="transform:rotate('
						+ geoData.getAngel(geoData.getCurrent(), { lat: v.latitude, lon: v.longitude }) + 'deg);"></compass>';
				else if (v.contact.gender)
					flag3 = '<img source="gender' + v.contact.gender + '" />';
				s += global.template`<list-row
					class="event${v.eventParticipate.state == 1 ? ' participate' : v.eventParticipate.state == -1 ? 'canceled' : ''}"
					onclick="details.open(&quot;${idIntern}&quot;,${JSON.stringify({ webCall: 'event.toggleInternal', query: 'event_list', search: encodeURIComponent('event.id=' + v.event.id) }).replace(/"/g, '&quot;')},pageLocation.detailLocationEvent)"
					i="${idIntern}"
					title="${encodeURIComponent(title)}"
					text="${encodeURIComponent(text)}"
					flag1="${flag1}"
					flag2="${flag2}"
					flag3="${encodeURIComponent(flag3)}"
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
					webCall: 'event.toggleParticipants',
					query: 'event_listParticipate',
					latitude: geoData.getCurrent().lat,
					longitude: geoData.getCurrent().lon,
					distance: -1,
					limit: 0,
					search: encodeURIComponent('eventParticipate.state=1 and eventParticipate.eventId=' + id[0] + ' and eventParticipate.eventDate=cast(\'' + id[1] + '\' as timestamp) and eventParticipate.contactId=contact.id')
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
			url: global.serverApi + 'db/list?query=event_listParticipate&search=' + encodeURIComponent('eventParticipate.eventId=' + id[0] + ' and eventParticipate.eventDate=cast(\'' + id[1] + '\' as timestamp) and eventParticipate.contactId=' + u + ' and eventParticipate.contactId=contact.id'),
			webCall: 'event.verifyParticipation',
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
