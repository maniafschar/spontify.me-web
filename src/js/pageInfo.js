import { communication } from './communication';
import { geoData } from './geoData';
import { global } from './global';
import { initialisation } from './initialisation';
import { intro } from './intro';
import { pageLogin } from './pageLogin';
import { ui, formFunc } from './ui';
import { user } from './user';

export { pageInfo };

class pageInfo {
	static openSection = 4;
	static sentFeedback = [];
	static template = v =>
		global.template`<buttontext class="bgColor settingsButton" onclick="pageInfo.toggleInfoBlock(&quot;#info1&quot;)">
	${ui.l('info.legalTitle')}
</buttontext><br/>
<infoblock id="info1" style="display:none;" class="overflow">
	${ui.l('infoLegal')}
</infoblock>
<buttontext class="bgColor settingsButton" onclick="pageInfo.toggleInfoBlock(&quot;#info3&quot;)">
	${ui.l('info.dsgvoTitle')}
</buttontext><br/>
<infoblock id="info3" style="display:none;" class="overflow">
	${ui.l('infoDSGVO')}
</infoblock>
<buttontext class="bgColor settingsButton" onclick="pageInfo.toggleInfoBlock(&quot;#info2&quot;)">
	${ui.l('info.imprintTitle')}
</buttontext><br/>
<infoblock id="info2" style="display:none;">
	${ui.l('info.imprint')}
</infoblock>`;
	static templateCopyright = v =>
		global.template`<div style="text-align:center;padding:2em 1em;clear:both;">${ui.l('info.infoOther')}<br/>© ${new Date().getFullYear()} ${ui.l('info.copyright')}</div>`;
	static templateDesc = v =>
		global.template`<buttontext class="bgColor settingsButton" onclick="pageInfo.toggleInfoBlock(&quot;#info4&quot;)">
${ui.l('home.DescLink')}
</buttontext><br/>
<infoblock id="info4" style="display:none;">
<div>
	${ui.l('info.description').replace('{0}', v.fee)}
</div>
</infoblock>`;
	static init() {
		var e = ui.q('info');
		if (!e.innerHTML) {
			communication.ajax({
				url: global.serverApi + 'action/paypalKey',
				webCall: 'pageInfo.init()',
				responseType: 'json',
				success(r) {
					e.innerHTML = pageInfo.templateDesc(r) + pageInfo.template() + pageInfo.templateCopyright();
					pageInfo.init();
				}
			});
		} else if (pageInfo.openSection > -1) {
			ui.css('info infoblock', 'display', 'none');
			if (ui.cssValue('#info' + pageInfo.openSection, 'display') == 'none')
				setTimeout(function () {
					ui.q('#info' + pageInfo.openSection).previousElementSibling.previousElementSibling.click();
					pageInfo.openSection = pageInfo.openSection == 1 ? -2 : -1;
				}, 50);
		}
	}
	static openMap() {
		if (geoData.localized)
			ui.navigation.openHTML('https://maps.google.com/maps?q=' + geoData.current.lat + ',' + geoData.current.lon + '%28Your+current+location%29');
		else
			ui.navigation.openPopup(ui.l('locations.serviceTitle'), ui.l('locations.serviceError').replace('{0}', geoData.current.street ? geoData.current.street : '-'));
	}
	static socialShare() {
		var msg = ui.l('info.socialShareText').replace('{0}', user.contact.idDisplay).replace('{1}', user.contact.gender == 1 ? '🙋‍♂️' : '🙋‍♀️');
		if (global.isBrowser())
			ui.navigation.openPopup(ui.l('info.sendSocialShare'), ui.l('info.socialShareBrowser') + '<infoblock class="selectable" style="margin-top:1em;">' + msg.replace(/\n/g, '<br/>') + '<br/><br/>' + global.server + '</infoblock>');
		else {
			window.plugins.socialsharing.shareWithOptions({
				message: msg,
				subject: global.appTitle + global.separator + ui.l('appSubTitle'),
				url: global.server
			}, initialisation.statusBar, initialisation.statusBar);
		}
	}
	static socialShareDialog() {
		var f = function () {
			if (ui.navigation.getActiveID() == 'home' && pageLogin.timestamp && new Date().getTime() - pageLogin.timestamp > 10000) {
				intro.openHint({ desc: '<div style="margin:0 0.5em 1em 0.5em;">' + ui.l('info.recommend') + '</div><buttontext class="bgColor" style="margin-top:0.5em;" onclick="pageInfo.socialShare()">' + ui.l('Yes') + '</buttontext>', pos: '15%,20vh', size: '70%,auto' });
				setTimeout(function () {
					if (ui.q('hint buttontext[onclick*="socialShare"]'))
						user.save({ webCall: 'pageInfo.socialShareDialog()', recommend: global.date.local2server(new Date()) });
				}, 1500);
			} else
				setTimeout(pageInfo.socialShareDialog, 2000);
		}
		f.call();
	}
	static toggleInfoBlock(id, event) {
		if (event)
			event.stopPropagation();
		ui.toggleHeight(id);
	}
}