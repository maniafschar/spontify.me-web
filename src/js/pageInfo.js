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
<div id="infoVersion" onclick="pageInfo.openMap()" style="text-align:center;padding:2em 3em 1em 3em;cursor:pointer;">${ui.l('info.infoOther').replace('{0}', '<span id="infoLocalized"></span>')}</div>
<div style="text-align:center;">© ${new Date().getFullYear()} ${ui.l('info.copyright')}</div>`;
	static templateDesc = v =>
		global.template`<buttontext class="bgColor settings2Button" onclick="pageInfo.toggleInfoBlock(&quot;#info4&quot;)">
${ui.l('home.DescLink')}
</buttontext><br/>
<infoblock id="info4" style="display:none;">
<div>
	<subject style="padding-top:0;">${ui.l('info.block1Title')}</subject>
	<ul>
		<li>${ui.l('info.block1_1')}</li>
		<li>${ui.l('info.block1_2')}</li>
	</ul>
	<subject>${ui.l('info.block2Title')}</subject>
	<ul>
		<li>${ui.l('info.block2_1')}</li>
		<li>${ui.l('info.block2_2')}</li>
	</ul>
	<subject>${ui.l('info.block3Title')}</subject>
	<ul>
		<li>${ui.l('info.block3_1')}</li>
		<li>${ui.l('info.block3_2')}</li>
	</ul>
	<a style="margin-top:2em;display:block;cursor:pointer;${v['displayBlogButton']}" onclick="ui.navigation.openHTML(&quot;https://blog.spontify.me&quot;, &quot;blog_spontifyme&quot;)">${ui.l('info.link2blog')}</a>
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
			ui.navigation.openHTML('https://maps.google.com/maps?q=' + geoData.latlon.lat + ',' + geoData.latlon.lon + '%28Your+current+location%29');
		else
			ui.navigation.openPopup(ui.l('locations.serviceTitle'), ui.l('locations.serviceError').replace('{0}', geoData.currentStreet ? geoData.currentStreet : '-'));
	}
	static sendFeedback(text, exec) {
		if (!text || text.trim().length == 0)
			return;
		text = text.trim();
		if (text.length > 1800)
			text = text.substring(0, 1800);
		for (var i = 0; i < pageInfo.sentFeedback.length; i++) {
			if (pageInfo.sentFeedback[i] == text)
				return;
		}
		if (user.contact) {
			communication.ajax({
				url: global.server + 'db/one',
				method: 'POST',
				body: {
					classname: 'Chat',
					values: {
						note: text.replace(/</g, '&lt;')
					}
				},
				error(r) {
					var e = ui.q('feedbackHint');
					if (e)
						ui.html(e, ui.l('error.text'));
				},
				success(r) {
					pageInfo.sentFeedback.push(text);
					pageChat.initActiveChats();
					var e = ui.q('feedbackHint');
					if (e) {
						ui.css(e.parentNode, 'height', '');
						ui.html(e, ui.l('info.feedbackUploadSuccess'));
						setTimeout(function () {
							ui.html(e, '');
							ui.q('#feedbackText').value = '';
						}, 5000);
					}
					if (exec)
						exec.call();
				}
			});
		}
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
		ui.html('#infoLocalized', geoData.localized ? ui.l('info.localized').replace('{0}', geoData.currentTown + global.separator + geoData.currentStreet) : ui.l('info.notLocalized').replace('{0}', geoData.currentStreet ? geoData.currentStreet : '-'));
	}
}