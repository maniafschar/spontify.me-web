import { communication } from './communication';
import { geoData } from './geoData';
import { global } from './global';
import { initialisation } from './initialisation';
import { intro } from './intro';
import { pageLogin } from './pageLogin';
import { ui } from './ui';
import { user } from './user';

export { pageInfo };

class pageInfo {
	static openSection = 4;
	static sentFeedback = [];
	static template = v =>
		global.template`<button-text class="settingsButton" onclick="pageInfo.toggleInfoBlock(&quot;#info1&quot;)" label="info.legalTitle"></button-text><br/>
<infoblock id="info1" style="display:none;" class="overflow">
	${ui.l('infoLegal')}
</infoblock>
<button-text class="settingsButton" onclick="pageInfo.toggleInfoBlock(&quot;#info3&quot;)" label="info.dsgvoTitle"></button-text><br/>
<infoblock id="info3" style="display:none;" class="overflow">
	${ui.l('infoDSGVO')}
</infoblock>
<button-text class="settingsButton" onclick="pageInfo.toggleInfoBlock(&quot;#info2&quot;)" label="info.imprintTitle"></button-text><br/>
<infoblock id="info2" style="display:none;">
	${ui.l('info.imprint')}
</infoblock>`;
	static templateCopyright = v =>
		global.template`<div style="text-align:center;padding:2em 1em;clear:both;">${ui.l('info.infoOther')}<br/>© ${new Date().getFullYear()} ${ui.l('info.copyright')}</div>`;
	static templateDesc = v =>
		global.template`<button-text class="settingsButton" onclick="pageInfo.toggleInfoBlock(&quot;#info4&quot;)" label="home.DescLink"></button-text><br/>
<infoblock id="info4" style="display:none;">
<div>
	${v.description}
</div>
</infoblock>`;
	static init() {
		var e = ui.q('info');
		if (!e.innerHTML) {
			var render = function (v) {
				v.description = ui.l('info.description' + (user.clientId > 1 ? 'Fanclub' : '')).replace('{0}', v.fee).replace(/\{1}/g, global.appTitle.substring(0, global.appTitle.indexOf(global.separator)));
				e.innerHTML = pageInfo.templateDesc(v) + pageInfo.template() + pageInfo.templateCopyright();
				pageInfo.init();
			}
			communication.ajax({
				url: global.serverApi + 'action/paypalKey',
				webCall: 'pageInfo.init()',
				responseType: 'json',
				success(r) {
					render(r);
				},
				error() {
					render({ fee: 20 });
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
				intro.openHint({ desc: '<div style="margin:0 0.5em 1em 0.5em;">' + ui.l('info.recommend') + '</div><button-text style="margin-top:0.5em;" onclick="pageInfo.socialShare()" label="Yes"></button-text>', pos: '15%,20vh', size: '70%,auto' });
				setTimeout(function () {
					if (ui.q('hint button-text[onclick*="socialShare"]'))
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