import { bluetooth } from './bluetooth';
import { communication } from './communication';
import { geoData } from './geoData';
import { global } from './global';
import { hashtags } from './hashtags';
import { initialisation } from './initialisation';
import { intro } from './intro';
import { lists } from './lists';
import { Contact, Location, model } from './model';
import { pageChat } from './pageChat';
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
<teaser class="events">
	<title>${ui.l('events.title')}</title>
	<div></div>
	<buttonIcon onclick="pageEvent.edit()">+</buttonIcon>
</teaser>
<teaser class="contacts">
	<title>${ui.l('contacts.title')}</title>
	<div></div>
</teaser>
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
	static deleteEvent() {
		var id = ui.q('home homeBody form').getAttribute('i');
		if (id)
			communication.ajax({
				url: global.server + 'db/one',
				method: 'DELETE',
				body: { classname: 'Event', id: id },
				success(r) {
					pageHome.init(true);
				}
			});
	}
	static init(force) {
		var e = ui.q('home');
		if (force || !e.innerHTML) {
			var v = {};
			if (user.contact) {
				if (user.contact.imageList)
					v.imgProfile = '<img src="' + global.serverImg + user.contact.imageList + '"/>';
				else
					v.imgProfile = '<img src="images/contact.svg" style="box-shadow:none;"/>';
				v.logoSmall = ' class="logoSmall"';
				v.name = user.contact.pseudonym;
				v.infoButton = ' noDisp';
				v.langButton = ' noDisp';
				v.clickHeader = 'ui.navigation.goTo(&quot;settings&quot;)';
			} else {
				v.lang = global.language;
				v.clickHeader = 'pageHome.openHintDescription()';
			}
			e.innerHTML = pageHome.template(v);
			initialisation.reposition();
			var renderContacts = function (l) {
				var s = '', oc = user.contact ? null : 'intro.openHint({ desc: \'teaserContacts\', pos: \'10%,5em\', size: \'80%,auto\' })';
				for (var i = 1; i < l.length; i++) {
					var e = model.convert(new Contact(), l, i);
					s += '<card onclick="' + (oc ? oc : 'ui.navigation.autoOpen(&quot;' + global.encParam('p=' + e.id) + '&quot;)') + '"><img src="' + global.serverImg + e.imageList + '"/><text>' + e.pseudonym + '</text></card>';
				}
				ui.q('home teaser.contacts>div').innerHTML = s;
				ui.css('home teaser.contacts', 'opacity', 1);
			};
			var renderEvents = function (l) {
				var s = '', oc = user.contact ? null : 'intro.openHint({ desc: \'teaserEvents\', pos: \'10%,5em\', size: \'80%,auto\' })';
				for (var i = 1; i < l.length; i++) {
					var e = model.convert(new Location(), l, i);
					s += '<card onclick="' + (oc ? oc : 'ui.navigation.autoOpen(&quot;' + global.encParam('e=' + e.event.id) + '&quot;)') + '"><img src="' + global.serverImg + (e.imageList ? e.imageList : e.event.imageList) + '"/><text>' + e.event.text + '</text></card>';
				}
				ui.q('home teaser.events>div').innerHTML = s;
				ui.css('home teaser.events', 'opacity', 1);
			};
			if (user.contact) {
				lists.loadList('latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&query=contact_list&limit=20&search=' + encodeURIComponent('contact.imageList is not null'), renderContacts);
				lists.loadList('latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&query=event_list&limit=20&search=' + encodeURIComponent('event.imageList is not null or location.imageList is not null'), renderEvents);
			} else {
				communication.ajax({
					url: global.server + 'action/teaser/contacts',
					responseType: 'json',
					success(r) {
						renderContacts(r);
					}
				});
				communication.ajax({
					url: global.server + 'action/teaser/events',
					responseType: 'json',
					success(r) {
						renderEvents(r);
					}
				});
			}
		}
		pageHome.initNotificationButton();
		if (user.contact)
			ui.html('home item.bluetooth text', ui.l(bluetooth.state == 'on' && user.contact.bluetooth ? 'bluetooth.activated' : 'bluetooth.deactivated'));
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
			communication.loadMap('pageHome.openLocationPickerDialog');
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
		formFunc.resetError(ui.q('home input[name="startDate"]'));
		formFunc.resetError(ui.q('home textarea[name="text"]'));
		var t = ui.q('home textarea[name="hashtagsDisp"]');
		if (!t.value)
			formFunc.setError(t, 'error.hashtags');
		else
			formFunc.validation.filterWords(t);
		t = hashtags.convert(t.value);
		ui.q('home input[name="skills"]').value = t.category;
		ui.q('home input[name="skillsText"]').value = t.hashtags;
		var v = formFunc.getForm('home homeBody');
		var h = v.values.startDate.split(':')[0];
		if (!h)
			formFunc.setError(ui.q('home input[name="startDate"]'), 'events.errorDate')
		if (!v.values.text)
			formFunc.setError(ui.q('home textarea[name="text"]'), 'error.description');
		else
			formFunc.validation.filterWords(ui.q('home textarea[name="text"]'));
		if (ui.q('home errorHint'))
			return;
		var d = new Date();
		if (h < d.getHours())
			d.setDate(d.getDate() + 1);
		v.values.startDate = global.date.local2server(d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + v.values.startDate + ':00');
		v.classname = 'Event';
		v.id = ui.q('home homeBody form').getAttribute('i');
		communication.ajax({
			url: global.server + 'db/one',
			method: v.id ? 'PUT' : 'POST',
			body: v,
			success(r) {
				ui.navigation.hidePopup();
				ui.navigation.autoOpen(global.encParam('e=' + (r ? r : v.id)));
				pageHome.init(true);
			}
		});
	}
	static saveLocationPicker() {
		geoData.save({ latitude: pageHome.map.getCenter().lat(), longitude: pageHome.map.getCenter().lng(), manual: true });
		ui.navigation.hidePopup();
	}
	static synchonizeTags() {
		var e = ui.q('home textarea[name="hashtagsDisp"]');
		hashtags.synchonizeTags(e);
		if (e.value && ui.cssValue('home .eventText', 'display') == 'none')
			ui.toggleHeight('home .eventText');
		else if (!e.value && ui.cssValue('home .eventText', 'display') != 'none')
			ui.toggleHeight('home .eventText');
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