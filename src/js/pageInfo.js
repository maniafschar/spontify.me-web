import { communication } from './communication';
import { geoData } from './geoData';
import { global } from './global';
import { initialisation } from './initialisation';
import { pageChat } from './pageChat';
import { pageContact } from './pageContact';
import { ui, formFunc } from './ui';
import { user } from './user';

export { pageInfo };

class pageInfo {
	static openSection = 4;
	static sentFeedback = [];
	static template = v =>
		global.template`<div style="padding-top:0.5em;">
    <buttontext class="bgColor infoButton" onclick="pageInfo.toggleInfoBlock(&quot;#info4&quot;)">
        ${ui.l('home.DescLink')}
    </buttontext>
    <infoblock id="info4" style="display:none;">
        ${v['infoAbout']}
        <div id="infoVersion" onclick="pageInfo.openMap()" style="padding-top:1em;cursor:pointer;"></div>
    </infoblock>
    <buttontext class="bgColor infoButton" onclick="pageInfo.toggleInfoBlock(&quot;#info1&quot;)">
		${ui.l('info.legalTitle')}
    </buttontext>
    <infoblock id="info1" style="display:none;" class="overflow">
		${ui.l('infoLegal')}
    </infoblock>
    <buttontext class="bgColor infoButton" onclick="pageInfo.toggleInfoBlock(&quot;#info3&quot;)">
		${ui.l('info.dsgvoTitle')}
    </buttontext>
    <infoblock id="info3" style="display:none;" class="overflow">
		${ui.l('infoDSGVO')}
    </infoblock>
    <buttontext class="bgColor infoButton" onclick="pageInfo.toggleInfoBlock(&quot;#info2&quot;)">
		${ui.l('info.imprintTitle')}
    </buttontext>
    <infoblock id="info2" style="display:none;">
		${ui.l('info.imprint')}
    </infoblock>
    <buttontext class="bgColor infoButton${v['feedback']}" onclick="pageInfo.toggleInfoBlock(&quot;#info6&quot;)">
		${ui.l('info.feedback')}
    </buttontext>
    <div id="info6" style="display:none;">
        <textarea placeholder="${ui.l('info.feedbackHint')}" maxlength="2000" id="feedbackText"></textarea>
        <buttontext onclick="pageInfo.sendFeedback(ui.val(&quot;#feedbackText&quot;))"
            class="bgColor" style="margin-top:0.5em;">${ui.l('send')}
        </buttontext>
        <feedbackHint></feedbackHint>
    </div>
	<buttontext class="bgColor infoButton" onclick="pageInfo.toggleMarketing()"${v.marketingDisplay}>${v.marketingTitle}</buttontext>
	<div id="info5" style="display:none;margin-bottom:1em;"></div>
	<buttontext onclick="pageInfo.socialShare()" id="socialShare" class="bgColor infoButton">
		${ui.l('sendSocialShare')}
	</buttontext>
	<div style="text-align:center;color:white;padding-top:2em;">© ${new Date().getFullYear()} ${ui.l('info.copyright')}</div>
</div>`;
	static templateAbout = v =>
		global.template`<landingblock id="landing0">
	<landingsubject style="padding-top:0;">${ui.l('landing.block1Title')}</landingsubject>
	<ul>
		<li>${ui.l('landing.block1_1')}</li>
		<li>${ui.l('landing.block1_2')}</li>
	</ul>
	<landingsubject>${ui.l('landing.block2Title')}</landingsubject>
	<ul>
		<li>${ui.l('landing.block2_1')}</li>
		<li>${ui.l('landing.block2_2')}</li>
	</ul>
	<landingsubject>${ui.l('landing.block3Title')}</landingsubject>
	<ul>
		<li>${ui.l('landing.block3_1')}</li>
		<li>${ui.l('landing.block3_2')}</li>
	</ul>
	<a style="margin:2em 0 1em 0;display:block;cursor:pointer;${v['displayBlogButton']}" onclick="ui.navigation.openHTML(&quot;https://blog.spontify.me&quot;, &quot;blog_spontifyme&quot;)">${ui.l('info.link2blog')}</a>
</landingblock>
<landingsubtitle onclick="pageInfo.toggleInfoBlock(&quot;${v.parent} #landing3&quot;, event);">
	${ui.l('faq.title')}
</landingsubtitle>
<landingblock id="landing3" style="display:none;">
	<landingsubject style="padding-top:0;">${ui.l('faq.1')}</landingsubject>
	${ui.l('faq.1a')}
	<landingsubject>${ui.l('faq.2')}</landingsubject>
	${ui.l('faq.2a')}
	<landingsubject>${ui.l('faq.3')}</landingsubject>
	${ui.l('faq.3a')}
	<landingsubject>${ui.l('faq.4')}</landingsubject>
	${ui.l('faq.4a')}
	<landingsubject>${ui.l('faq.5')}</landingsubject>
	${ui.l('faq.5a')}
	<landingsubject>${ui.l('faq.6')}</landingsubject>
	${ui.l('faq.6a')}
</landingblock>`;
	static marketingTitle = '';

	static init() {
		var e = ui.q('info');
		if (!e.innerHTML) {
			var v = [];
			if (user.contact)
				v.marketingTitle = pageInfo.marketingTitle;
			else
				v.feedback = ' noDisp';
			if (!v.marketingTitle)
				v.marketingDisplay = ' style="display:none;"';
			v.server = global.server;
			v.url = global.server + 'store';
			v.parent = 'info';
			v.divID = 'info';
			v.displayBlogButton = '';
			v.infoAbout = pageInfo.templateAbout(v);
			if (user.contact)
				v.url = v.url + '?c=' + user.contact.id;
			e.innerHTML = pageInfo.template(v) + e.innerHTML;
			formFunc.initFields('info');
			ui.css(ui.q('info landingsubtitle'), 'display', 'none');
			if (!user.contact)
				ui.css('#socialShare', 'display', 'none');
			if (global.getDevice() == 'computer')
				initialisation.reposition();
		}
		if (pageInfo.openSection > -1) {
			ui.css('info infoblock', 'display', 'none');
			if (ui.cssValue('#info' + pageInfo.openSection, 'display') == 'none')
				setTimeout(function () {
					ui.q('#info' + pageInfo.openSection).previousElementSibling.click();
					pageInfo.openSection = pageInfo.openSection == 1 ? -2 : -1;
				}, 50);
		}
		ui.html('#infoVersion', ui.l('info.infoOther').replace('{0}', '<span id="infoLocalized"></span>'));
		pageInfo.updateLocalisation();
		ui.css('main>buttonIcon', 'display', 'none');
		ui.buttonIcon('.bottom.center', 'home', 'ui.navigation.goTo("home")');
		pageChat.buttonChat();
	}
	static initMarketing(d) {
		pageInfo.marketingTitle = d.title;
		var e = ui.q('#info5');
		if (e && d.title && user.contact) {
			e = e.previousElementSibling;
			e.innerText = d.title;
			ui.css(e, 'display', '');
		}
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
					classname: 'Feedback',
					values: {
						pseudonym: user.contact.pseudonym,
						text: text,
						os: global.getOS(),
						appname: navigator.appName,
						appversion: navigator.appVersion,
						language: navigator.language,
						platform: navigator.platform,
						useragent: navigator.userAgent,
						device: global.getDevice(),
						version: global.appVersion,
						localized: (geoData.currentTown ? geoData.currentTown + ' | ' : '') + geoData.currentStreet,
						lang: global.language
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
	static toggleMarketing() {
		var e = ui.q('#info5');
		if (e.innerHTML)
			ui.toggleHeight(e, function () {
				ui.css(e, 'display', 'none');
				ui.html(e, '');
			});
		else
			communication.ajax({
				url: global.server + 'action/marketing/result',
				responseType: 'json',
				success(r) {
					if (r.list)
						e.innerHTML = (r.text ? '<div style="cursor:pointer;margin:0 0.5em;background:rgba(255,255,255,0.6);padding:1em;border-radius:0.5em;text-align:center;"' + (r.action ? ' onclick="ui.navigation.autoOpen(&quot;' + r.action + '&quot;,event)"' : '') + '>' + r.text + '</div>' : '') + pageContact.listContacts(r.list);
					else if (r.html)
						e.innerHTML = r.html;
					ui.toggleHeight(e);
				}
			});
	}
	static updateLocalisation() {
		ui.html('#infoLocalized', geoData.localized ? ui.l('info.localized').replace('{0}', geoData.currentTown + global.separator + geoData.currentStreet) : ui.l('info.notLocalized').replace('{0}', geoData.currentStreet ? geoData.currentStreet : '-'));
	}
};
