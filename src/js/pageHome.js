import { communication } from './communication';
import { global } from './global';
import { initialisation } from './initialisation';
import { Contact, model } from './model';
import { formFunc, ui } from './ui';
import { user } from './user';

export { pageHome };

class pageHome {
	static template = v =>
		global.template`<homeHeader>	
	<buttonIcon onclick="pageHome.openLanguage()" class="homeIconSearch left top"${v.classLanguage}>
		<span class="lang">${v.language}</span>
	</buttonIcon>
	<buttonIcon onclick="ui.navigation.goTo(&quot;search&quot;)" class="homeIconSearch left top"${v.classSearch}>
		<img src="images/search.svg" />
	</buttonIcon>
	<buttonIcon onclick="ui.navigation.goTo(&quot;settings&quot;,event)" class="right top">
		<img src="images/contact.svg" />
	</buttonIcon>
	<homeTitle onclick="ui.navigation.goTo(&quot;settings&quot;)">
		<img source="logo.svg" />
	</homeTitle>
</homeHeader>
<homeBody>
	<buttontext class="bgColor homeButton" onclick="ui.navigation.goTo(&quot;whatToDo&quot;)" style="width:80%;">
		<span class="homeWTD">${ui.l('wtd.todayIWant')}</span><img source="rocket.svg" />
	</buttontext><br/>
	<buttontext class="bgColor homeButton" onclick="ui.navigation.goTo(&quot;locations&quot;)" style="width:70%;">
		<badge name="badgeLocations" class="bgColor pulse">0</badge>
		<span>${ui.l('locations.homeButton')}</span> <img source="location.svg" />
	</buttontext ><br/>
	<buttontext class="bgColor homeButton" onclick="ui.navigation.goTo(&quot;contacts&quot;)" style="width:60%;">
		<badge name="badgeContacts" class="bgColor pulse">0</badge>
		<span>${ui.l('contacts.homeButton')}</span><img source="network.svg" />
	</buttontext>
</homeBody >
<buttonIcon onclick="pageHome.openNotifications()" class="left bottom pulse highlight" style="display:none;">
	<badgeNotifications></badgeNotifications>
	<img source="news.svg" />
</buttonIcon>
<buttonIcon onclick="ui.navigation.goTo(&quot;info&quot;,event)" class="center bottom">
	<img source="info.svg" />
</buttonIcon>
<buttonIcon onclick="bluetooth.toggle()" id="homeIconBluetooth" class="right bottom">
	<img source="bluetooth.svg" />
</buttonIcon>`;
	static init() {
		var e = ui.q('home');
		if (e.innerHTML)
			return;
		e.innerHTML = pageHome.template({
			language: global.language,
			classLanguage: user.contact ? ' style="display:none;"' : '',
			classSearch: user.contact ? '' : ' style="display:none;"'
		});
		formFunc.image.replaceSVGs();
		formFunc.initFields('home');
		initialisation.reposition();
	}
	static openLanguage() {
		ui.navigation.openPopup(ui.l('langSelect'),
			'<div style="text-align:center;padding:2em 0;"><a class="langSelectImg bgColor' + (global.language == 'DE' ? ' pressed' : '') + '" onclick="initialisation.setLanguage(&quot;DE&quot;)" l="DE">Deutsch</a>' +
			'<a class="langSelectImg bgColor' + (global.language == 'EN' ? ' pressed' : '') + '" onclick="initialisation.setLanguage(&quot;EN&quot;)" l="EN">English</a></div>');
	}
	static openNotifications() {
		communication.ajax({
			url: global.server + 'action/notifications',
			responseType: 'json',
			success(r) {
				var e = ui.q('badgeNotifications');
				e.innerHTML = '0';
				ui.css(e.parentNode, 'display', 'none');
				for (var i = 1; i < r.length; i++) {
					var v = model.convert(new Contact(), r, i);
					var m = { message: global.date.formatDate(global.date.server2Local(v.contactNotification.createdAt)) + '<br/>' + v.pseudonym + ' ' + v.contactNotification.text };
					if (v.contactNotification.action)
						m.additionalData = { exec: v.contactNotification.action };
					communication.notification.open(m);
				}
			}
		});
	}
}