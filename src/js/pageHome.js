import { bluetooth } from './bluetooth';
import { communication } from './communication';
import { geoData } from './geoData';
import { global } from './global';
import { initialisation } from './initialisation';
import { intro } from './intro';
import { Contact, model } from './model';
import { pageEvent } from './pageEvent';
import { formFunc, ui } from './ui';
import { user } from './user';

export { pageHome };

class pageHome {
	static badge = -1;
	static map;
	static marketing = null;
	static template = v =>
		global.template`<homeHeader onclick="${v.clickHeader}"${v.logoSmall}>
	<img source="logo"/>
	${v.imgProfile}
	<text>${v.name}</text>
	<buttonIcon class="language${v.langButton}" onclick="pageHome.openLanguage(event)">
		<span>${v.lang}</span>
	</buttonIcon>
</homeHeader>
<homeBody>
<item class="position">
	<buttonIcon class="bgColor" onclick="pageHome.openLocationPicker()">
		<img source="location" />
	</buttonIcon>
	<text></text>
</item>
<item class="event">
	<buttonIcon class="bgColor" onclick="pageHome.newEvent()">
		<img source="rocket" />
	</buttonIcon>
	<text></text>
</item>
</homeBody>
<item class="bluetooth">
	<buttonIcon class="bgColor${v.bluetoothButton}" onclick="bluetooth.toggle()">
		<img source="bluetooth" />
	</buttonIcon>
	<buttonIcon class="bgColor${v.infoButton}" onclick="ui.navigation.goTo(&quot;info&quot;)">
		<img source="info" />
	</buttonIcon>
	<text>Info</text>
</item>`;
	static templateNewEvent = v =>
		global.template`<form name="editElement" onsubmit="return false">
<input type="hidden" name="locationId" />
<input type="hidden" name="type" value="${v.type}" />
<input type="checkbox" transient="true" onclick="pageHome.toggleLocation()" label="in einer Location" style="margin:1em 0 2em 0;"/>
<field class="location" style="display:none;">
<label style="padding-top:0;">${ui.l('events.location')}</label>
<value style="text-align:center;">
<input transient="true" name="location" onkeyup="pageEvent.locations()" />
<eventLocationInputHelper><explain>${ui.l('events.locationInputHint')}</explain></eventLocationInputHelper>
<buttontext onclick="pageLocation.edit()" class="bgColor eventLocationInputHelperButton">${ui.l('locations.new')}</buttontext>
</value>
</field>
<field class="category">
<value>
<input type="radio" value="0" name="category" label="${ui.categories[0].verb}" ${v.category0} />
<input type="radio" value="1" name="category" label="${ui.categories[1].verb}" ${v.category1} />
<input type="radio" value="2" name="category" label="${ui.categories[2].verb}" ${v.category2} />
<input type="radio" value="3" name="category" label="${ui.categories[3].verb}" ${v.category3} />
<input type="radio" value="4" name="category" label="${ui.categories[4].verb}" ${v.category4} />
<input type="radio" value="5" name="category" label="${ui.categories[5].verb}" ${v.category5} />
</value>
</field>
<field>
<label name="startDate">${ui.l('events.startHour')}</label>
<value>
<input type="time" name="startDate" placeholder="HH:MM" step="900" value="${v.startDate}" />
</value>
</field>
<field>
<label>${ui.l('description')}</label>
<value>
<textarea name="text" maxlength="1000">${v.text}</textarea>
</value>
</field>
<field>
<label>${ui.l('events.visibility')}</label>
<value>
<input type="radio" name="visibility" value="2" label="${ui.l('events.visibility2')}" ${v.visibility2} ${v.visibilityChecked2} />
<input type="radio" name="visibility" value="3" label="${ui.l('events.visibility3')}" ${v.visibility3} ${v.visibilityChecked3} />
</value>
</field>
<dialogButtons style="margin-bottom:0;">
<buttontext onclick="pageHome.saveEvent()" class="bgColor">${ui.l('save')}</buttontext>
<buttontext onclick="pageLocation.deleteElement(${v.id},&quot;Event&quot;)" class="bgColor${v.hideDelete}" id="deleteElement">${ui.l('delete')}</buttontext>
<popupHint></popupHint>
</dialogButtons>
</form>`;

	static clickNotification(id, action) {
		communication.ajax({
			url: global.server + 'db/one',
			method: 'PUT',
			body: {
				classname: 'ContactNotification',
				id: id,
				values: { seen: true }
			},
			success() {
				ui.navigation.autoOpen(action);
				communication.notification.close();
				communication.ping();
			}
		});
	}
	static closeList() {
		var e = ui.q('notificationList');
		if (ui.cssValue(e, 'display') != 'none')
			ui.toggleHeight(e);
	}
	static init(force) {
		var e = ui.q('home');
		if (force || !e.innerHTML) {
			var v = {};
			if (user.contact) {
				if (user.contact.imageList) {
					v.imgProfile = '<img src="' + global.serverImg + user.contact.imageList + '"/>';
					v.logoSmall = ' class="logoSmall"';
				}
				v.name = user.contact.pseudonym;
				v.infoButton = ' noDisp';
				v.langButton = ' noDisp';
				v.clickHeader = 'ui.navigation.goTo(&quot;settings&quot;)';
			} else {
				v.lang = global.language;
				v.bluetoothButton = ' noDisp';
				v.clickHeader = 'pageHome.openHintDescription()';
			}
			e.innerHTML = pageHome.template(v);
			formFunc.initFields('home');
			initialisation.reposition();
		}
		pageHome.initNotificationButton();
		if (user.contact)
			ui.q('home item.bluetooth text').innerHTML = ui.l(bluetooth.state == 'on' && user.contact.findMe ? 'bluetooth.activated' : 'bluetooth.deactivated');
		var p = pageEvent.getParticipationNext();
		if (p && global.date.server2Local(p.eventDate).toDateString() == new Date().toDateString()) {
			var s = global.date.formatDate(p.event.startDate);
			s = s.substring(s.lastIndexOf(' ')).trim();
			ui.q('home item.event text').innerHTML = s + ' ' + p.event.text;
			ui.attr('home item.event', 'i', p.event.id);
		} else {
			ui.q('home item.event text').innerHTML = ui.l('wtd.todayIWant');
			ui.attr('home item.event', 'i', null);
		}
		formFunc.image.replaceSVGs();
		if (user.contact)
			ui.classAdd('home svg>g', 'pure');
		pageHome.updateLocalisation();
	}
	static initNotification(d) {
		var f = function () {
			var e = ui.q('notificationList');
			if (e.getAttribute("toggle"))
				setTimeout(f, 500);
			else {
				var s = '';
				for (var i = 1; i < d.length; i++) {
					var v = model.convert(new Contact(), d, i);
					if (i == 1 && ui.q('notificationList div[i="' + v.contactNotification.id + '"]')) {
						pageHome.badge = 0;
						pageHome.initNotificationButton();
						return;
					}
					if (v.imageList)
						v.image = global.serverImg + v.imageList;
					else
						v.image = 'images/contact.svg';
					s += '<div onclick="pageHome.clickNotification(' + v.contactNotification.id + ',&quot;' + v.contactNotification.action + '&quot;)" ' + (v.contactNotification.seen == 0 ? ' class="highlightBackground"' : '') + '><img src="' + v.image + '"' + (v.imageList ? '' : ' class="bgColor" style="padding:0.6em;"') + '/><span>' + global.date.formatDate(v.contactNotification.createdAt) + ': ' + v.contactNotification.text + '</span></div>';
				}

				e.innerHTML = s;
				if (ui.cssValue(e, 'display') == 'none')
					e.removeAttribute('h');
				pageHome.badge = ui.qa('notificationList .highlightBackground').length;
				pageHome.initNotificationButton();
			}
		};
		f.call();
	}
	static initNotificationButton() {
		if (pageHome.badge > 0)
			ui.classAdd('navigation buttonIcon.notifications', 'pulse highlight');
		else
			ui.classRemove('navigation buttonIcon.notifications', 'pulse highlight');
		if (ui.q('badgeNotifications'))
			ui.q('badgeNotifications').innerText = Math.max(pageHome.badge, 0);
	}
	static newEvent() {
		if (user.contact) {
			if (!user.contact.image) {
				ui.navigation.openPopup(ui.l('attention'),
					ui.l('events.noImage') +
					'<br/><br/><buttontext class="bgColor" onclick="ui.navigation.goTo(&quot;settings&quot;)">' + ui.l('settings.edit') + '</buttontext>');
				return;
			}
			var v = {};
			var id = ui.q('home item.event').getAttribute('i');
			var p = pageEvent.getParticipationNext(id);
			if (id && p) {
				v.visibility = p.event.visibility;
				v.type = p.event.type;
				v.text = p.event.text;
				v.id = p.event.id;
				v.startDate = global.date.server2Local(p.event.startDate);
				v.startDate = ('0' + v.startDate.getHours()).slice(-2) + ':' + ('0' + v.startDate.getMinutes()).slice(-2);
				v['category' + p.event.category] = ' checked';
			} else {
				var d = new Date().getHours() + 2;
				if (d > 23)
					d = 8;
				v.startDate = ('0' + d).slice(-2) + ':00';
				v.visibility = user.contact.attr && user.contact.attrInterest ? 2 : 3;
				v.type = 'o';
				v.category0 = ' checked';
				v.hideDelete = ' noDisp';
			}
			v['visibilityChecked' + v.visibility] = ' checked="checked"';
			ui.navigation.openPopup(ui.l('wtd.todayIWant'), pageHome.templateNewEvent(v));
			pageEvent.locationsOfPastEvents();
		} else
			intro.openHint({ desc: 'whatToDo', pos: '10%,5em', size: '80%,auto' });
	}
	static openHintDescription() {
		intro.openHint({ desc: 'description', pos: '10%,5em', size: '80%,auto' });
	}
	static openLanguage(event) {
		event.stopPropagation();
		ui.navigation.openPopup(ui.l('langSelect'),
			'<div style="text-align:center;padding:2em 0;"><buttontext class="langSelectImg bgColor' + (global.language == 'DE' ? ' pressed' : '') + '" onclick="initialisation.setLanguage(&quot;DE&quot;)" l="DE">Deutsch</buttontext>' +
			'<buttontext class="langSelectImg bgColor' + (global.language == 'EN' ? ' pressed' : '') + '" onclick="initialisation.setLanguage(&quot;EN&quot;)" l="EN">English</buttontext></div>');
	}
	static openLocationPicker() {
		if (user.contact) {
			communication.loadMap(function () {
				ui.navigation.openPopup(ui.l('home.locationPickerTitle'),
					'<mapPicker></mapPicker><br/>' +
					'<buttontext class="bgColor" onclick="pageHome.resetLocationPicker()">' + ui.l('home.locationPickerReset') + '</buttontext>' +
					'<buttontext class="bgColor" onclick="pageHome.saveLocationPicker()">' + ui.l('ready') + '</buttontext>', null, null,
					function () {
						var delta = 0.3;
						pageHome.map = new google.maps.Map(ui.q('mapPicker'), { mapTypeId: google.maps.MapTypeId.ROADMAP, maxZoom: 13 });
						pageHome.map.fitBounds(new google.maps.LatLngBounds(
							new google.maps.LatLng(geoData.latlon.lat + delta, geoData.latlon.lon - delta), //south west
							new google.maps.LatLng(geoData.latlon.lat - delta, geoData.latlon.lon + delta) //north east
						));
					});
			});
		} else
			intro.openHint({ desc: 'position', pos: '10%,5em', size: '80%,auto' });
	}
	static reset() {
		pageHome.badge = -1;
		ui.html('notificationList', '');
		ui.html('home', '');
	}
	static resetLocationPicker() {
		geoData.resetLocationPicker();
		ui.navigation.hidePopup();
	}
	static saveEvent() {
		formFunc.resetError(ui.q('popup form input[name="location"]'));
		formFunc.resetError(ui.q('popup form input[name="startDate"]'));
		formFunc.resetError(ui.q('popup form input[name="visibility"]'));
		formFunc.resetError(ui.q('popup form textarea[name="text"]'));
		var v = formFunc.getForm('popup form');
		var h = v.values.startDate.split(':')[0];
		if (!h)
			formFunc.setError(ui.q('popup form input[name="startDate"]'), 'events.errorDate')
		if (!v.values.text)
			formFunc.setError(ui.q('popup form textarea[name="text"]'), 'error.description');
		else
			formFunc.validation.filterWords(ui.q('popup form textarea[name="text"]'));
		if (v.values.visibility == 2 && (!user.contact.attr || !user.contact.attrInterest))
			formFunc.setError(ui.q('popup input[name="visibility"]'), 'events.errorVisibility');
		if (ui.q('popup field.location').style.display != 'none' && !v.values.locationId)
			formFunc.setError(ui.q('popup input[name="location"]'), 'events.errorLocation');
		if (ui.q('popup errorHint'))
			return;
		var d = new Date();
		if (h < d.getHours())
			d.setDate(d.getDate() + 1);
		v.values.startDate = global.date.local2server(d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + v.values.startDate + ':00');
		v.classname = 'Event';
		v.id = ui.q('home item.event').getAttribute('i');
		communication.ajax({
			url: global.server + 'db/one',
			method: v.id ? 'PUT' : 'POST',
			body: v,
			success(r) {
				ui.navigation.hidePopup();
				ui.navigation.autoOpen(global.encParam('e=' + (r ? r : v.id)));
				pageEvent.init();
			}
		});
	}
	static saveLocationPicker() {
		geoData.save({ latitude: pageHome.map.getCenter().lat(), longitude: pageHome.map.getCenter().lng(), manual: true });
		ui.navigation.hidePopup();
	}
	static toggleLocation() {
		var e = ui.q('field.location');
		if (e.style.display == 'none') {
			e.style.display = '';
			ui.q('field.category').style.display = 'none';
		} else {
			e.style.display = 'none';
			ui.q('field.category').style.display = '';
		}
	}
	static toggleNotification() {
		if (!user.contact)
			intro.openHint({ desc: 'notification', pos: '-0.5em,-7em', size: '80%,auto', hinkyClass: 'bottom', hinky: 'right:1em;' });
		else if (!ui.q('notificationList>div'))
			intro.openHint({ desc: 'notificationEmpty', pos: '-0.5em,-7em', size: '80%,auto', hinkyClass: 'bottom', hinky: 'right:1em;' });
		else
			ui.toggleHeight('notificationList');
	}
	static updateLocalisation() {
		ui.q('home item.position text').innerHTML = geoData.currentTown;
	}
}