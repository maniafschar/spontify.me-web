import { communication } from './communication';
import { global } from './global';
import { initialisation } from './initialisation';
import { Contact, model } from './model';
import { formFunc, ui } from './ui';
import { user } from './user';

export { pageHome };

class pageHome {
	static template = v =>
		global.template`<div>
	<homeHeader>	
		<buttonIcon onclick="pageHome.openLanguage()" class="homeIconSearch"${v.classLanguage}>
			<span class="lang">${v.language}</span>
		</buttonIcon>
		<buttonIcon onclick="ui.navigation.goTo(&quot;search&quot;)" class="homeIconSearch"${v.classSearch}>
			<img src="images/search.svg" />
		</buttonIcon>
		<buttonIcon onclick="ui.navigation.goTo(&quot;settings&quot;,event)" style="right:0;text-align:right;">
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
	<buttonIcon onclick="pageHome.openNotifications()" style="bottom:0;left:0;display:none;" class="pulse highlight">
		<badgeNotifications></badgeNotifications>
		<img source="news.svg" />
	</buttonIcon>
	<buttonIcon onclick="ui.navigation.goTo(&quot;info&quot;,event)" style="bottom:0;left:50%;margin-left:-2em;">
		<img source="info.svg" />
	</buttonIcon>
	<buttonIcon onclick="bluetooth.toggle()" id="homeIconBluetooth" style="bottom:0;right:0;">
		<img source="bluetooth.svg" />
	</buttonIcon>
</div > `;
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
					var m = { message: global.date.formatDate(global.date.getDate(v.contactNotification.createdAt)) + '<br/>' + v.pseudonym + ' ' + v.contactNotification.text };
					if (v.contactNotification.action)
						m.additionalData = { exec: v.contactNotification.action };
					communication.notification.open(m);
				}
			}
		});
	}
}