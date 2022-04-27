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
	<a href="loc_" style="position:absolute;opacity:0;">next</a>
	<homeImage>
		<img onclick="ui.navigation.goTo(&quot;${v.oc}&quot;);" />
	</homeImage>
	<homeHeader onclick="ui.navigation.goTo(&quot;${v.oc}&quot;);">
		<homeTitle>${global.appTitle}</homeTitle>
		<homeSubTitle>${ui.l('appSubTitle')}</homeSubTitle>
	</homeHeader>
	<homeBody>
		<homeButton class="bgColor button1" onclick="ui.navigation.goTo(&quot;locations&quot;);">
			<img src="images/location.svg" />
		</homeButton>
		<homeButton class="bgColor button2" onclick="pageHome.openLanguage();">
			<span class="lang">
				${v.lang}
			</span>
		</homeButton>
		<homeButton class="bgColor button3" onclick="intro.openIntro();">
			<img src="images/intro.svg" />
		</homeButton>
		<homeButton class="bgColor button4" onclick="ui.navigation.goTo(&quot;login&quot;);">
			<img src="images/login.svg" />
		</homeButton>
		<homeButtonSmall class="middle">
			<img onclick="ui.navigation.goTo(&quot;info&quot;);" class="bgColor2" src="images/iconInfo.png" />
		</homeButtonSmall>
	</homeBody>
</div>`;
	static templateLoggedIn = v =>
		global.template`<div>
	<homeImage>
		<img onclick="ui.navigation.goTo(&quot;${v['oc']}&quot;);" />
	</homeImage>
	<homeHeader onclick="ui.navigation.goTo(&quot;${v['oc']}&quot;);">
		<homeTitle><span>${global.appTitle}</span></homeTitle>
		<homeSubTitle><homeTown></homeTown> ${ui.l('homeWelcome')}
			<homeUsername>${v['username']}</homeUsername>!
		</homeSubTitle>
	</homeHeader>
	<homeBody>
		<homeButton class="bgColor button1" onclick="ui.navigation.goTo(&quot;locations&quot;);">
			<badge name="badgeLocations" class="bgColor2 pulse" style="left:-1.5em;top:-1.5em;">0</badge>
			<img src="images/location.svg" />
		</homeButton>
		<homeButton class="bgColor button2" onclick="ui.navigation.goTo(&quot;contacts&quot;);">
			<badge name="badgeContacts" class="bgColor2 pulse" style="top:-1.5em;right:-1.5em;">0</badge>
			<img src="images/contact.svg" />
		</homeButton>
		<homeButton class="bgColor button3" onclick="ui.navigation.goTo(&quot;search&quot;);">
			<img src="images/search.svg" />
		</homeButton>
		<homeButton class="bgColor button4" onclick="ui.navigation.goTo(&quot;whattodo&quot;);">
			<badge name="badgeNotifications" class="bgColor2 pulse" style="right:-1.5em;top:8em;">0</badge>
			<img src="images/logo.svg" />
		</homeButton>
		<homeButtonSmall>
			<img onclick="ui.navigation.goTo(&quot;info&quot;);" class="bgColor2" src="images/iconInfo.png" />
		</homeButtonSmall>
		<homeStatus onclick="pageWhatToDo.wtd.open()"></homeStatus>
	</homeBody>
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
		e.innerHTML = contact.id ? pageHome.templateLoggedIn(v) : pageHome.template(v);
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