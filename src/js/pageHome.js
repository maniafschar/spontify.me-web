import { geoData } from './geoData';
import { global } from './global';
import { initialisation } from './initialisation';
import { Contact } from './model';
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
		<buttonIcon onclick="ui.navigation.goTo(&quot;settings&quot;)" style="right:0;text-align:right;">
			<img src="images/contact.svg" />
		</buttonIcon>
		<homeTitle onclick="ui.navigation.goTo(&quot;settings&quot;)">
			<logo>
				<span>sp</span>
				<img src="images/location.svg" onload="formFunc.image.svgInject(this)" />
				<span>ntify</span><last>me</last>
			</logo>
		</homeTitle>
		<homeSubTitle>${ui.l('appSubTitle')}</homeSubTitle>
	</homeHeader>
	<homeBody>
		<buttontext class="bgColor homeButton" onclick="ui.navigation.goTo(&quot;whattodo&quot;)" style="width:80%;">
			<badge name="badgeNotifications" class="bgColor pulse" style="right:-1.5em;top:8em;">0</badge>
			<span>${ui.l('wtd.todayIWant')}</span><img src="images/rocket.svg" onload="formFunc.image.svgInject(this)" />
		</buttontext><br/>
		<buttontext class="bgColor homeButton" onclick="ui.navigation.goTo(&quot;locations&quot;)" style="width:70%;">
			<badge name="badgeLocations" class="bgColor pulse" style="left:-1.5em;top:-1.5em;">0</badge>
			<span>${ui.l('locations.title') + global.separator + ui.l('events.title')}</span><img src="images/location.svg" onload="formFunc.image.svgInject(this)" />
		</buttontext><br/>
		<buttontext class="bgColor homeButton" onclick="ui.navigation.goTo(&quot;contacts&quot;)" style="width:60%;">
			<badge name="badgeContacts" class="bgColor pulse" style="top:-1.5em;right:-1.5em;">0</badge>
			<span>${ui.l('contacts.matching')}</span><img src="images/network.svg" onload="formFunc.image.svgInject(this)" />
		</buttontext>
		<homeStatus onclick="pageWhatToDo.wtd.open()"></homeStatus>
	</homeBody>
	<buttonIcon onclick="ui.navigation.goTo(&quot;info&quot;)" style="bottom:0;left:50%;margin-left:-2em;">
		<img src="images/info.svg" onload="formFunc.image.svgInject(this)" />
	</buttonIcon>
</div>`;
	static init() {
		var e = ui.q('home');
		var contact = user.contact || new Contact();
		if (e.innerHTML && e.getAttribute('loggedOn') == contact.id)
			return;
		var v = [];
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
	static showWTDOldMessages(button) {
		button.style.display = 'none';
		var e = button.nextSibling.style;
		e.display = e.display == 'block' ? 'none' : 'block';
	}
};