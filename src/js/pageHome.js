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
	<homeHeader onclick="ui.navigation.goTo(&quot;${v['oc']}&quot;);">
		<buttonIcon onclick="ui.navigation.goTo(&quot;search&quot;);" style="left:0;text-align:left;">
			<img src="images/search.svg" />
		</buttonIcon>
		<buttonIcon onclick="ui.navigation.goTo(&quot;settings&quot;);" style="right:0;text-align:right;">
			<img src="images/contact.svg" />
		</buttonIcon>
		<homeTitle><img src="images/logoNew.svg" /></homeTitle>
		<homeSubTitle>${ui.l('appSubTitle')}</homeSubTitle>
	</homeHeader>
	<homeBody>
		<buttontext class="bgColor homeButton" onclick="ui.navigation.goTo(&quot;whattodo&quot;);" style="width:80%;">
			<badge name="badgeNotifications" class="bgColor2 pulse" style="right:-1.5em;top:8em;">0</badge>
			${ui.l('wtd.todayIWant')}<img src="images/logo.svg" />
		</buttontext><br/>
		<buttontext class="bgColor homeButton" onclick="ui.navigation.goTo(&quot;locations&quot;);" style="width:70%;">
			<badge name="badgeLocations" class="bgColor2 pulse" style="left:-1.5em;top:-1.5em;">0</badge>
			${ui.l('events.title')}<img src="images/location.svg" />
		</buttontext><br/>
		<buttontext class="bgColor homeButton" onclick="ui.navigation.goTo(&quot;contacts&quot;);" style="width:60%;">
			<badge name="badgeContacts" class="bgColor2 pulse" style="top:-1.5em;right:-1.5em;">0</badge>
			${ui.l('contacts.title')}<img src="images/contact.svg" />
		</buttontext>
		<homeStatus onclick="pageWhatToDo.wtd.open()"></homeStatus>
	</homeBody>
	<buttonIcon onclick="ui.navigation.goTo(&quot;info&quot;);" style="bottom:0;width:100%;">
		<img src="images/iconInfo.png" />
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
			ui.classAdd(e, 'bgColor2');
		} else {
			ui.attr(e, 'src', 'images/splash.svg');
			ui.classRemove(e, 'set');
			ui.classRemove(e, 'bgColor2');
		}
	}
	static openLanguage() {
		ui.navigation.openPopup(ui.l('langSelect'),
			'<div style="text-align:center;padding:2em 0;"><a class="langSelectImg bgColor' + (global.language == 'DE' ? ' pressed' : '') + '" onclick="initialisation.setLanguage(&quot;DE&quot;);" l="DE">Deutsch</a>' +
			'<a class="langSelectImg bgColor' + (global.language == 'EN' ? ' pressed' : '') + '" onclick="initialisation.setLanguage(&quot;EN&quot;);" l="EN">English</a></div>');
	}
	static showWTDOldMessages(button) {
		button.style.display = 'none';
		var e = button.nextSibling.style;
		e.display = e.display == 'block' ? 'none' : 'block';
	}
};