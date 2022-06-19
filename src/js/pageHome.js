import { communication } from './communication';
import { geoData } from './geoData';
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
		<buttonIcon onclick="pageHome.openLanguage()" class="homeIconSearch">
			<span class="lang">${v.lang}</span>
		</buttonIcon>
		<buttonIcon onclick="ui.navigation.goTo(&quot;search&quot;)" class="homeIconSearch" style="display:none;">
			<img src="images/search.svg" />
		</buttonIcon>
		<buttonIcon onclick="ui.navigation.goTo(&quot;settings&quot;,event)" style="right:0;text-align:right;">
			<img src="images/contact.svg" />
		</buttonIcon>
		<homeTitle onclick="ui.navigation.goTo(&quot;settings&quot;)">
			<logo>
				<span>sp</span>
				<img src="images/location.svg" onload="formFunc.image.svgInject(this)" />
				<span>ntify</span><last>me</last>
			</logo>
			<homeSubTitle>${ui.l('appSubTitle')}</homeSubTitle>
		</homeTitle>
	</homeHeader>
	<homeBody>
		<buttontext class="bgColor homeButton" onclick="ui.navigation.goTo(&quot;whattodo&quot;)" style="width:80%;">
			<span class="homeWTD">${ui.l('wtd.todayIWant')}</span><img src="images/rocket.svg" onload="formFunc.image.svgInject(this)" />
		</buttontext><br/>
		<buttontext class="bgColor homeButton" onclick="ui.navigation.goTo(&quot;locations&quot;)" style="width:70%;">
			<badge name="badgeLocations" class="bgColor pulse">0</badge>
			<span>${ui.l('locations.title') + global.separator + ui.l('events.title')}</span><img src="images/location.svg" onload="formFunc.image.svgInject(this)" />
		</buttontext><br/>
		<buttontext class="bgColor homeButton" onclick="ui.navigation.goTo(&quot;contacts&quot;)" style="width:60%;">
			<badge name="badgeContacts" class="bgColor pulse">0</badge>
			<span>${ui.l('contacts.matching')}</span><img src="images/network.svg" onload="formFunc.image.svgInject(this)" />
		</buttontext>
	</homeBody>
	<buttonIcon onclick="pageHome.openNotifications()" style="bottom:0;left:0;display:none;" class="pulse">
		<badgeNotifications></badgeNotifications>
		<img src="images/news.svg" onload="formFunc.image.svgInject(this)" />
	</buttonIcon>
	<buttonIcon onclick="ui.navigation.goTo(&quot;info&quot;)" style="bottom:0;left:50%;margin-left:-2em;">
		<img src="images/info.svg" onload="formFunc.image.svgInject(this)" />
	</buttonIcon>
	<buttonIcon onclick="bluetooth.toggle()" id="homeIconBluetooth" style="bottom:0;right:0;">
		<img src="images/bluetooth.svg" onload="formFunc.image.svgInject(this)" />
	</buttonIcon>
</div>`;
	static init() {
		var e = ui.q('home');
		var contact = user.contact || new Contact();
		if (e.innerHTML && e.getAttribute('loggedOn') == contact.id)
			return;
		var v = {};
		v.username = contact.pseudonym ? contact.pseudonym : '';
		v.oc = contact.id ? 'settings' : 'login';
		v.lang = global.language;
		e.innerHTML = pageHome.template(v);
		ui.attr(e, 'loggedOn', contact.id);
		pageHome.initHomeImage();
		ui.addFastButton('home');
		formFunc.initFields('home');
		initialisation.reposition();
		ui.html('homeTown', geoData.currentTown);
	}
	static initHomeImage() {
		var e = ui.qa('homeImage > img');
		ui.css(e, 'padding', '');
		if (user.contact) {
			if (user.contact.image)
				ui.attr(e, 'src', global.serverImg + user.contact.image);
			else {
				ui.attr(e, 'src', 'images/contact.svg');
				ui.css(e, 'padding', '1em');
			}
			ui.classAdd(e, 'set');
			ui.classAdd(e, 'bgColor');
		} else {
			ui.attr(e, 'src', 'images/splash.svg');
			ui.classRemove(e, 'set');
			ui.classRemove(e, 'bgColor');
		}
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