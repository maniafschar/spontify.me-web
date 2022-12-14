import { bluetooth } from './bluetooth';
import { communication } from './communication';
import { events } from './events';
import { global } from './global';
import { initialisation } from './initialisation';
import { intro } from './intro';
import { Contact, model } from './model';
import { formFunc, ui } from './ui';
import { user } from './user';

export { pageHome };

class pageHome {
	static badge = -1;
	static marketing = null;
	static template = v =>
		global.template`<homeHeader>	
	<homeTitle onclick="ui.navigation.goTo(&quot;settings&quot;)">
		<img source="logo" />
	</homeTitle>
</homeHeader>
<homeBody>
	<buttontext class="bgColor homeButton" onclick="pageHome.newEvent()" style="width:80%;">
		<span class="homeWTD">${ui.l('wtd.todayIWant')}</span><img source="rocket" />
	</buttontext><br/>
	<buttontext class="bgColor homeButton" onclick="ui.navigation.goTo(&quot;locations&quot;)" style="width:70%;">
		<span>${ui.l('locations.homeButton')}</span> <img source="location" />
	</buttontext ><br/>
	<buttontext class="bgColor homeButton" onclick="ui.navigation.goTo(&quot;contacts&quot;)" style="width:60%;">
		<span>${ui.l('contacts.homeButton')}</span><img source="contact" />
	</buttontext>
</homeBody>`;
	static templateNewEvent = v =>
		global.template`<form name="editElement" onsubmit="return false">
<input type="hidden" name="locationId" />
<input type="hidden" name="type" value="${v.type}" />
<input type="hidden" name="visibility" value="${v.visibility}" />
<input type="checkbox" transient="true" onclick="pageHome.toggleLocation()" label="in einer Location" style="margin:1em 0 2em 0;"/>
<field class="location" style="display:none;">
<label style="padding-top:0;">${ui.l('events.location')}</label>
<value style="text-align:center;">
<input transient="true" name="location" onkeyup="events.locations()" />
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
	static init() {
		var e = ui.q('home');
		if (!e.innerHTML) {
			e.innerHTML = pageHome.template();
			formFunc.initFields('home');
			initialisation.reposition();
		}
		ui.buttonIcon('.bottom.left', '<badgeNotifications></badgeNotifications><img source="news"/>', 'pageHome.toggleNotification()');
		pageHome.initNotificationButton(true);
		ui.buttonIcon('.top.right', user.contact && user.contact.imageList ? user.contact.imageList : 'contact', 'ui.navigation.goTo("settings")');
		ui.buttonIcon('.bottom.center', 'info', 'ui.navigation.goTo("info")');
		ui.buttonIcon('.bottom.right', 'bluetooth', 'bluetooth.toggle()');
		if (bluetooth.state != 'on' || !user.contact || !user.contact.findMe)
			ui.classAdd('buttonIcon.bottom.right', 'bluetoothInactive');
		if (user.contact)
			ui.q('buttonIcon.top.left').style.display = 'none';
		else
			ui.buttonIcon('.top.left', '<span class="lang">' + global.language + '</span>', 'pageHome.openLanguage()');
		var p = events.getParticipationNext();
		if (p && global.date.server2Local(p.eventDate).toDateString() == new Date().toDateString()) {
			var s = global.date.formatDate(p.event.startDate);
			s = s.substring(s.lastIndexOf(' ')).trim();
			ui.q('buttontext .homeWTD').innerHTML = s + ' ' + p.event.text;
			ui.attr('buttontext .homeWTD', 'i', p.event.id);
		} else {
			ui.q('buttontext .homeWTD').innerHTML = ui.l('wtd.todayIWant');
			ui.attr('buttontext .homeWTD', 'i', null);
		}
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
	static initNotificationButton(force) {
		if (force || ui.navigation.getActiveID() == 'home') {
			if (pageHome.badge > 0)
				ui.classAdd('buttonIcon.bottom.left', 'pulse highlight');
			else
				ui.classRemove('buttonIcon.bottom.left', 'pulse highlight');
			if (ui.q('badgeNotifications'))
				ui.q('badgeNotifications').innerText = Math.max(pageHome.badge, 0);
		}
	}
	static newEvent() {
		if (user.contact) {
			var v = {};
			var id = ui.q('buttontext .homeWTD').getAttribute('i');
			var p = events.getParticipationNext(id);
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
				v.visibility = '2';
				v.type = 'o';
				v.category0 = ' checked';
				v.hideDelete = ' noDisp';
			}
			ui.navigation.openPopup(ui.l('wtd.todayIWant'), pageHome.templateNewEvent(v));
			events.locationsOfPastEvents();
		} else
			intro.openHint({ desc: 'whatToDo', pos: '10%,5em', size: '80%,auto' });
	}
	static openLanguage() {
		ui.navigation.openPopup(ui.l('langSelect'),
			'<div style="text-align:center;padding:2em 0;"><a class="langSelectImg bgColor' + (global.language == 'DE' ? ' pressed' : '') + '" onclick="initialisation.setLanguage(&quot;DE&quot;)" l="DE">Deutsch</a>' +
			'<a class="langSelectImg bgColor' + (global.language == 'EN' ? ' pressed' : '') + '" onclick="initialisation.setLanguage(&quot;EN&quot;)" l="EN">English</a></div>');
	}
	static reset() {
		pageHome.badge = -1;
		ui.html('notificationList', '');
	}
	static saveEvent() {
		formFunc.resetError(ui.q('popup form input[name="location"]'));
		formFunc.resetError(ui.q('popup form input[name="startDate"]'));
		formFunc.resetError(ui.q('popup form textarea[name="text"]'));
		var v = formFunc.getForm('popup form');
		var h = v.values.startDate.split(':')[0];
		if (!h)
			formFunc.setError(ui.q('popup form input[name="startDate"]'), 'events.errorDate')
		if (!v.values.text)
			formFunc.setError(ui.q('popup form textarea[name="text"]'), 'error.description');
		else
			formFunc.validation.filterWords(ui.q('popup form textarea[name="text"]'));
		if (ui.q('popup field.location').style.display != 'none' && !v.values.locationId)
			formFunc.setError(ui.q('popup input[name="location"]'), 'events.errorLocation');
		if (ui.q('popup errorHint'))
			return;
		var d = new Date();
		if (h < d.getHours())
			d.setDate(d.getDate() + 1);
		v.values.startDate = global.date.local2server(d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + v.values.startDate + ':00');
		v.classname = 'Event';
		v.id = ui.q('buttontext .homeWTD').getAttribute('i');
		communication.ajax({
			url: global.server + 'db/one',
			method: v.id ? 'PUT' : 'POST',
			body: v,
			success(r) {
				ui.navigation.hidePopup();
				ui.navigation.autoOpen(global.encParam('e=' + (r ? r : v.id)));
				events.init();
			}
		});
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
			intro.openHint({ desc: 'notification', pos: '0.5em,-4.5em', size: '80%,auto', hinkyClass: 'bottom', hinky: 'left:1em;' });
		else if (!ui.q('notificationList>div'))
			intro.openHint({ desc: 'notificationEmpty', pos: '0.5em,-4.5em', size: '80%,auto', hinkyClass: 'bottom', hinky: 'left:1em;' });
		else
			ui.toggleHeight('notificationList');
	}
}