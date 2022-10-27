import { bluetooth } from './bluetooth';
import { communication } from './communication';
import { global } from './global';
import { initialisation } from './initialisation';
import { Contact, model } from './model';
import { formFunc, ui } from './ui';
import { user } from './user';

export { pageHome };

class pageHome {
	static badge = -1;
	static template = v =>
		global.template`<homeHeader>	
	<homeTitle onclick="ui.navigation.goTo(&quot;settings&quot;)">
		<img source="logo" />
	</homeTitle>
</homeHeader>
<homeBody>
	<buttonicon class="marketing"><span></span></buttonicon>
	<buttontext class="bgColor homeButton" onclick="ui.navigation.goTo(&quot;whatToDo&quot;)" style="width:80%;">
		<span class="homeWTD">${ui.l('wtd.todayIWant')}</span><img source="rocket" />
	</buttontext><br/>
	<buttontext class="bgColor homeButton" onclick="ui.navigation.goTo(&quot;locations&quot;)" style="width:70%;">
		<badge name="badgeLocations" class="bgColor pulse">0</badge>
		<span>${ui.l('locations.homeButton')}</span> <img source="location" />
	</buttontext ><br/>
	<buttontext class="bgColor homeButton" onclick="ui.navigation.goTo(&quot;contacts&quot;)" style="width:60%;">
		<badge name="badgeContacts" class="bgColor pulse">0</badge>
		<span>${ui.l('contacts.homeButton')}</span><img source="network" />
	</buttontext>
</homeBody>`;
	static closeList() {
		var e = ui.q('notificationList');
		if (ui.cssValue(e, 'display') != 'none')
			ui.toggleHeight(e);
	}
	static init() {
		var e = ui.q('home');
		if (!e.innerHTML) {
			e.innerHTML = pageHome.template({
				language: global.language,
				classLanguage: user.contact ? ' style="display:none;"' : '',
				classSearch: user.contact ? '' : ' style="display:none;"'
			});
			formFunc.initFields('home');
			initialisation.reposition();
			communication.ajax({
				url: global.server + 'action/marketing',
				method: 'GET',
				responseType: 'json',
				success(r) {
					if (r && r.label) {
						ui.q('buttonIcon.marketing>span').innerHTML = r.label;
						var e = ui.q('buttonIcon.marketing');
						e.setAttribute('onclick', 'ui.navigation.openHTML("' + r.action + '","sm_marketing");ui.q("buttonIcon.marketing").outerHTML=""');
						e.style.display = 'flex';
					}
				}
			});

		}
		var e = ui.q('buttonIcon.bottom.left');
		ui.buttonIcon(e, '<badgeNotifications>' + Math.max(pageHome.badge, 0) + '</badgeNotifications><img source="news"/>', 'pageHome.toggleNotification()');
		if (pageHome.badge > 0)
			ui.classAdd(e, 'pulse highlight');
		else
			ui.classRemove(e, 'pulse highlight');
		ui.buttonIcon('.bottom.center', 'info', 'ui.navigation.goTo("info")');
		ui.buttonIcon('.bottom.right', 'bluetooth', 'bluetooth.toggle()');
		if (bluetooth.state != 'on' || !user.contact || !user.contact.findMe)
			ui.classAdd('buttonIcon.bottom.right', 'bluetoothInactive');
		if (user.contact)
			ui.buttonIcon('.top.left', 'search', 'ui.navigation.goTo("search")');
		else
			ui.buttonIcon('.top.left', '<span class="lang">' + global.language + '</span>', 'pageHome.openLanguage()');
		ui.buttonIcon('.top.right', user.contact && user.contact.imageList ? user.contact.imageList : 'contact', 'ui.navigation.goTo("settings")');
	}
	static initNotification(d) {
		var s = '';
		for (var i = 1; i < d.length; i++) {
			var v = model.convert(new Contact(), d, i);
			if (v.imageList)
				v.image = global.serverImg + v.imageList;
			else
				v.image = 'images/contact.svg';
			s += '<div onclick="ui.navigation.autoOpen(&quot;' + v.contactNotification.id + '&quot;)" i="' + v.contactNotification.id + '"' + (v.contactNotification.seen == 0 ? ' class="highlightBackground"' : '') + '><img src="' + v.image + '"' + (v.imageList ? '' : ' class="bgColor" style="padding:0.6em;"') + '/><span>' + global.date.formatDate(v.contactNotification.createdAt) + ': ' + v.contactNotification.text + '</span></div>';
		}
		var e = ui.q('notificationList');
		e.innerHTML = s;
		e.removeAttribute('h');
		pageHome.badge = ui.qa('notificationList .highlightBackground').length;
	}
	static openLanguage() {
		ui.navigation.openPopup(ui.l('langSelect'),
			'<div style="text-align:center;padding:2em 0;"><a class="langSelectImg bgColor' + (global.language == 'DE' ? ' pressed' : '') + '" onclick="initialisation.setLanguage(&quot;DE&quot;)" l="DE">Deutsch</a>' +
			'<a class="langSelectImg bgColor' + (global.language == 'EN' ? ' pressed' : '') + '" onclick="initialisation.setLanguage(&quot;EN&quot;)" l="EN">English</a></div>');
	}
	static toggleNotification() {
		ui.toggleHeight('notificationList');
		if (pageHome.badge > 0) {
			communication.ajax({
				url: global.server + 'db/one',
				method: 'PUT',
				body: { classname: 'ContactNotification', id: ui.q('notificationList>div:first-child').getAttribute('i'), values: { seen: true } },
				success() {
					communication.ping();
				}
			});
		}
	}
}