import { bluetooth } from './bluetooth';
import { communication } from './communication';
import { global } from './global';
import { initialisation } from './initialisation';
import { formFunc, ui } from './ui';
import { user } from './user';

export { pageHome };

class pageHome {
	static template = v =>
		global.template`<homeHeader>	
	<homeTitle onclick="ui.navigation.goTo(&quot;settings&quot;)">
		<img source="logo" />
	</homeTitle>
</homeHeader>
<homeBody>
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
		}
		var e = ui.q('buttonIcon.bottom.left');
		ui.buttonIcon(e, '<badgeNotifications>' + communication.notification.data.length + '</badgeNotifications><img source="news" />', 'communication.notification.open()');
		ui.classAdd(e, 'pulse highlight');
		if (!communication.notification.data.length)
			ui.css(e, 'display', 'none');
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
	static openLanguage() {
		ui.navigation.openPopup(ui.l('langSelect'),
			'<div style="text-align:center;padding:2em 0;"><a class="langSelectImg bgColor' + (global.language == 'DE' ? ' pressed' : '') + '" onclick="initialisation.setLanguage(&quot;DE&quot;)" l="DE">Deutsch</a>' +
			'<a class="langSelectImg bgColor' + (global.language == 'EN' ? ' pressed' : '') + '" onclick="initialisation.setLanguage(&quot;EN&quot;)" l="EN">English</a></div>');
	}
}