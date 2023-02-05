import { communication } from './communication';
import { geoData } from './geoData';
import { global } from './global';
import { initialisation } from './initialisation';
import { pageChat } from './pageChat';
import { ui, formFunc } from './ui';
import { user } from './user';

export { pageInfo };

class pageInfo {
	static openSection = 4;
	static sentFeedback = [];
	static template = v =>
		global.template`<buttontext class="bgColor settings2Button" onclick="pageInfo.toggleInfoBlock(&quot;#info1&quot;)">
	${ui.l('info.legalTitle')}
</buttontext><br/>
<infoblock id="info1" style="display:none;" class="overflow">
	${ui.l('infoLegal')}
</infoblock>
<buttontext class="bgColor settings2Button" onclick="pageInfo.toggleInfoBlock(&quot;#info3&quot;)">
	${ui.l('info.dsgvoTitle')}
</buttontext><br/>
<infoblock id="info3" style="display:none;" class="overflow">
	${ui.l('infoDSGVO')}
</infoblock>
<buttontext class="bgColor settings2Button" onclick="pageInfo.toggleInfoBlock(&quot;#info2&quot;)">
	${ui.l('info.imprintTitle')}
</buttontext><br/>
<infoblock id="info2" style="display:none;">
	${ui.l('info.imprint')}
</infoblock>
<div id="infoVersion" onclick="pageInfo.openMap()" style="text-align:center;padding:2em 3em 1em 3em;cursor:pointer;">${ui.l('info.infoOther').replace('{0}', '<span class="infoLocalized"></span>')}</div>
<div style="text-align:center;">© ${new Date().getFullYear()} ${ui.l('info.copyright')}</div>`;
	static templateDesc = v =>
		global.template`<buttontext class="bgColor settings2Button" onclick="pageInfo.toggleInfoBlock(&quot;#info4&quot;)">
${ui.l('home.DescLink')}
</buttontext><br/>
<infoblock id="info4" style="display:none;">
<div>
	${ui.l('info.description')}
</div>
</infoblock>`;
	static init() {
		var e = ui.q('info');
		if (!e.innerHTML) {
			var v = {};
			v.displayBlogButton = '';
			e.innerHTML = pageInfo.templateDesc(v) + pageInfo.template(v);
			formFunc.initFields('info');
			if (!user.contact)
				ui.css('#socialShare', 'display', 'none');
			if (global.getDevice() == 'computer')
				initialisation.reposition();
		}
		if (pageInfo.openSection > -1) {
			ui.css('info infoblock', 'display', 'none');
			if (ui.cssValue('#info' + pageInfo.openSection, 'display') == 'none')
				setTimeout(function () {
					ui.q('#info' + pageInfo.openSection).previousElementSibling.previousElementSibling.click();
					pageInfo.openSection = pageInfo.openSection == 1 ? -2 : -1;
				}, 50);
		}
		pageInfo.updateLocalisation();
	}
	static openMap() {
		if (geoData.localized)
			ui.navigation.openHTML('https://maps.google.com/maps?q=' + geoData.current.lat + ',' + geoData.current.lon + '%28Your+current+location%29');
		else
			ui.navigation.openPopup(ui.l('locations.serviceTitle'), ui.l('locations.serviceError').replace('{0}', geoData.current.street ? geoData.current.street : '-'));
	}
	static socialShare(extra) {
		var msg = ui.l('info.socialShareText').replace('{0}', user.contact.idDisplay).replace('{1}', user.contact.gender == 1 ? '🙋‍♂️' : '🙋‍♀️');
		if (global.isBrowser())
			ui.navigation.openPopup(ui.l('sendSocialShare'), ui.l('info.socialShareBrowser') + '<infoblock class="selectable" style="margin-top:1em;">' + msg + '</infoblock>');
		else {
			window.plugins.socialsharing.shareWithOptions({
				message: msg,
				subject: global.appTitle + global.separator + ui.l('appSubTitle'),
				url: global.server.substring(0, global.server.indexOf('/', 10)) + (extra ? '?' + extra : '')
			}, initialisation.statusBar, initialisation.statusBar);
		}
	}
	static toggleInfoBlock(id, event) {
		if (event)
			event.stopPropagation();
		ui.toggleHeight(id);
	}
	static updateLocalisation() {
		ui.html('span.infoLocalized', geoData.localized ? ui.l('info.localized').replace('{0}', geoData.current.town + global.separator + geoData.current.street) : ui.l('info.notLocalized').replace('{0}', geoData.current.street ? geoData.current.street : '-'));
	}
}