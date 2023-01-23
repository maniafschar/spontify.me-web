import { bluetooth } from './bluetooth';
import { communication } from './communication';
import { geoData } from './geoData';
import { global } from './global';
import { hashtags } from './hashtags';
import { initialisation } from './initialisation';
import { intro } from './intro';
import { Contact, model } from './model';
import { pageChat } from './pageChat';
import { pageEvent } from './pageEvent';
import { formFunc, ui } from './ui';
import { user } from './user';

export { pageHome };

class pageHome {
	static badge = -1;
	static map;
	static template = v =>
		global.template`<homeHeader onclick="${v.clickHeader}"${v.logoSmall}>
	<img onclick="pageHome.openLocationPicker(event)" source="logo"/>
	${v.imgProfile}
	<text>${v.name}</text>
	<buttonIcon class="language${v.langButton}" onclick="pageHome.openLanguage(event)">
		<span>${v.lang}</span>
	</buttonIcon>
</homeHeader>
<homeBody>
<form name="editElement" onsubmit="return false">
<input type="hidden" name="type" value="${v.type}" />
${ui.l('home.labelTime')}<br/>
<input type="time" name="startDate" placeholder="HH:MM" step="900" value="${v.startDate}" /><br/>
${ui.l('home.labelSkill')}
<field>
<textarea name="hashtagsDisp" maxlength="250" onkeyup="pageHome.synchonizeTags(event)" style="height:2em;">${v.hashtagsDisp}</textarea>
<hashtags>${v.hashtagSelection}</hashtags>
</field>
<field><br/>
<textarea name="text" maxlength="250" placeholder="${ui.l('description')}" class="noDisp">${v.text}</textarea>
</field>
<dialogButtons>
<buttontext onclick="pageHome.saveEvent()" class="bgColor noDisp save">${ui.l('home.saveEvent')}</buttontext>
<buttontext onclick="pageLocation.deleteElement(${v.id},&quot;Event&quot;)" class="bgColor noDisp delete">${ui.l('delete')}</buttontext>
<popupHint></popupHint>
</dialogButtons>
</form>
</homeBody>`;
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
			if (!v.startDate) {
				var d = new Date().getHours() + 2;
				if (d > 23)
					d = 8;
				v.startDate = ('0' + d).slice(-2) + ':00';
			}
			v.hashtagSelection = hashtags.display();
			e.innerHTML = pageHome.template(v);
			formFunc.initFields('home');
			initialisation.reposition();
			var input = ui.q('home homeBody textarea[name="hashtagsDisp"]');
			var descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value');
			Object.defineProperty(input, 'value', {
				set: function () {
					var r = descriptor.set.apply(this, arguments);
					if (this.value) {
						ui.classRemove('home textarea[name="text"]', 'noDisp');
						ui.classRemove('home buttontext.save', 'noDisp');
					} else {
						ui.classAdd('home textarea[name="text"]', 'noDisp');
						ui.classAdd('home buttontext.save', 'noDisp');
					}
					return r;
				},
				get: function () {
					return descriptor.get.apply(this);
				}
			});
		}
		pageHome.initNotificationButton();
		if (user.contact)
			ui.html('home item.bluetooth text', ui.l(bluetooth.state == 'on' && user.contact.bluetooth ? 'bluetooth.activated' : 'bluetooth.deactivated'));
		var p = pageEvent.getParticipationNext();
		if (p && global.date.server2Local(p.eventDate).toDateString() == new Date().toDateString()) {
			var s = global.date.formatDate(p.event.startDate);
			s = s.substring(s.lastIndexOf(' ')).trim();
			// ui.q('home item.event text').innerHTML = s + ' ' + p.event.text;
			// ui.attr('home item.event', 'i', p.event.id);
		} else {
			//ui.q('home item.event text').innerHTML = ui.l('wtd.todayIWant');
			//ui.attr('home item.event', 'i', null);
		}
		formFunc.image.replaceSVGs();
		if (user.contact)
			ui.classAdd('home homeHeader svg>g', 'pure');
		pageHome.updateLocalisation();
		ui.css('navigation item.search', 'display', user.contact ? '' : 'none');
		ui.css('navigation item.info', 'display', user.contact ? 'none' : '');
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
	static openHintDescription() {
		intro.openHint({ desc: 'description', pos: '10%,5em', size: '80%,auto' });
	}
	static openLanguage(event) {
		event.stopPropagation();
		ui.navigation.openPopup(ui.l('langSelect'),
			'<div style="padding:1em 0;"><buttontext class="bgColor' + (global.language == 'DE' ? ' favorite' : '') + '" onclick="initialisation.setLanguage(&quot;DE&quot;)" l="DE">Deutsch</buttontext>' +
			'<buttontext class="bgColor' + (global.language == 'EN' ? ' favorite' : '') + '" onclick="initialisation.setLanguage(&quot;EN&quot;)" l="EN">English</buttontext></div>');
	}
	static openLocationPicker(event) {
		event.preventDefault();
		event.stopPropagation();
		if (user.contact) {
			communication.loadMap();
		} else
			intro.openHint({ desc: 'position', pos: '10%,5em', size: '80%,auto' });
	}
	static openLocationPickerDialog() {
		ui.navigation.openPopup(ui.l('home.locationPickerTitle'),
			'<mapPicker></mapPicker><br/>' +
			(geoData.manual ? '<buttontext class="bgColor" onclick="pageHome.resetLocationPicker()">' + ui.l('home.locationPickerReset') + '</buttontext>' : '') +
			'<buttontext class="bgColor" onclick="pageHome.saveLocationPicker()">' + ui.l('ready') + '</buttontext>', null, null,
			function () {
				pageHome.map = new google.maps.Map(ui.q('mapPicker'), { mapTypeId: google.maps.MapTypeId.ROADMAP, disableDefaultUI: true, maxZoom: 12, center: new google.maps.LatLng(geoData.latlon.lat, geoData.latlon.lon), zoom: 9 });
			});
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
		if (!user.contact) {
			intro.openHint({ desc: 'whatToDo', pos: '10%,5em', size: '80%,auto' });
			return;
		}
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
				pageEvent.initParticipation();
			}
		});
	}
	static saveLocationPicker() {
		geoData.save({ latitude: pageHome.map.getCenter().lat(), longitude: pageHome.map.getCenter().lng(), manual: true });
		ui.navigation.hidePopup();
	}
	static synchonizeTags(event) {
		hashtags.synchonizeTags(event);
		if (event.target.value) {
			ui.classRemove('home textarea[name="text"]', 'noDisp');
			ui.classRemove('home buttontext.save', 'noDisp');
		} else {
			ui.classAdd('home textarea[name="text"]', 'noDisp');
			ui.classAdd('home buttontext.save', 'noDisp');
		}
	}
	static toggleNotification() {
		if (!user.contact)
			intro.openHint({ desc: 'notification', pos: '-0.5em,-7em', size: '80%,auto', hinkyClass: 'bottom', hinky: 'right:1em;' });
		else if (!ui.q('notificationList>div'))
			intro.openHint({ desc: 'notificationEmpty', pos: '-0.5em,-7em', size: '80%,auto', hinkyClass: 'bottom', hinky: 'right:1em;' });
		else {
			if (ui.q('notificationList').style.display == 'none')
				pageChat.closeList();
			ui.toggleHeight('notificationList');
		}
	}
	static updateLocalisation() {
		ui.html('home svg text.position', geoData.currentTown);
	}
}