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
		global.template`<div style="padding:0.5em 0;">
    <buttontext class="bgColor infoButton" onclick="pageInfo.toggleInfoBlock(&quot;#info4&quot;);">
        ${ui.l('home.DescLink')}
    </buttontext>
    <infoblock id="info4" style="padding-top:0.5em;display:none;">
        ${v['infoAbout']}
        <div id="infoVersion" onclick="pageInfo.openMap();" style="padding-top:1em;cursor:pointer;"></div>
    </infoblock>
    <buttontext class="bgColor infoButton" onclick="pageInfo.toggleInfoBlock(&quot;#info1&quot;);">
		${ui.l('info.legalTitle')}
    </buttontext>
    <infoblock id="info1" style="display:none;" class="overflow">
		${ui.l('infoLegal')}
    </infoblock>
    <buttontext class="bgColor infoButton" onclick="pageInfo.toggleInfoBlock(&quot;#info3&quot;);">
		${ui.l('info.dsgvoTitle')}
    </buttontext>
    <infoblock id="info3" style="display:none;" class="overflow">
		${ui.l('infoDSGVO')}
    </infoblock>
    <buttontext class="bgColor infoButton" onclick="pageInfo.toggleInfoBlock(&quot;#info2&quot;);">
		${ui.l('info.imprintTitle')}
    </buttontext>
    <infoblock id="info2" style="display:none;">
		${ui.l('info.imprint')}
    </infoblock>
    <buttontext class="bgColor infoButton${v['feedback']}" onclick="pageInfo.toggleInfoBlock(&quot;#info6&quot;);">
		${ui.l('info.feedback')}
    </buttontext>
    <infoblock id="info6" style="display:none;">
        <textarea placeholder="${ui.l('info.feedbackHint')}" maxlength="2000" id="feedbackText" style="height:10em;width:90%;"></textarea>
        <buttontext onclick="pageInfo.sendFeedback(ui.val(&quot;#feedbackText&quot;), null, null, true);"
            class="bgColor2" style="margin-top:0.5em;">${ui.l('send')}
        </buttontext>
        <feedbackHint></feedbackHint>
    </infoblock>
	<buttontext onclick="pageInfo.socialShare();" id="socialShare" class="bgColor2 infoButton">
		${ui.l('sendSocialShare')}
	</buttontext>
	<div style="position:relative;display:block;padding-top:1.5em;">© ${new Date().getFullYear()} ${ui.l('info.copyright')}</div>
</div>`;
	static templateAbout = v =>
		global.template`<landingsubtitle onclick="pageInfo.toggleInfoBlock(&quot;${v.parent} #landing0&quot;, event);" style="padding-top:0;">
			${ui.l('appSubTitle')}
		</landingsubtitle>
		<landingblock id="landing0">
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
			<a style="margin:2em 0 1em 0;color:rgb(0,0,100);display:block;cursor:pointer;${v['displayBlogButton']}" onclick="ui.navigation.openHTML(&quot;https://blog.findapp.online&quot;, &quot;blog_findapp&quot;)">${ui.l('info.link2blog')}</a>
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

	static init() {
		var e = ui.q('info');
		if (!e.innerHTML) {
			var v = [];
			v.feedback = user.contact ? '' : ' noDisp';
			v.server = global.server;
			v.url = global.server + 'store';
			v.parent = 'info';
			v.divID = 'info';
			v.displayBlogButton = '';
			v.infoAbout = pageInfo.templateAbout(v);
			if (user.contact)
				v.url = v.url + '?c=' + user.contact.id;
			else
				v.styleRecommentFB = ' style="display:none;"';
			e.innerHTML = pageInfo.template(v) + e.innerHTML;
			formFunc.initFields('info');
			ui.addFastButton('info');
			ui.css(ui.q('info landingsubtitle'), 'display', 'none');
			if (!user.contact)
				ui.css('#socialShare', 'display', 'none');
			if (global.getDevice() == 'computer')
				initialisation.reposition();
		}
		if (pageInfo.openSection > -1) {
			ui.css('info infoblock', 'display', 'none');
			setTimeout(function () {
				pageInfo.toggleInfoBlock('#info' + pageInfo.openSection);
				pageInfo.openSection = -1;
			}, 50);
		}
		ui.html('#infoVersion', ui.l('info.infoOther').replace('{0}', '<span id="infoLocalized"></span>'));
		pageInfo.updateLocalisation();
	}
	static openMap() {
		if (geoData.localized == true) {
			var l = geoData.getLatLon();
			ui.navigation.openHTML('https://maps.google.com/maps?q=' + l.lat + ',' + l.lon + '%28Your+current+location%29');
		} else
			ui.navigation.openPopup(ui.l('locations.serviceTitle'), ui.l('locations.serviceError').replace('{0}', geoData.localized ? geoData.localized : '-'));
	}
	static sendFeedback(text, stack, exec, feedback) {
		if (!text || text.trim().length == 0)
			return;
		text = text.trim();
		if (text.length > 1800)
			text = text.substring(0, 1800);
		for (var i = 0; i < pageInfo.sentFeedback.length; i++) {
			if (pageInfo.sentFeedback[i] == text)
				return;
		}
		if (stack == true) {
			try {
				var s2 = new Error();
				stack = s2.stack;
			} catch (e) {
				stack = e;
			}
			if (!stack)
				stack = 'stack could not be evaluated!';
			else if (stack.length > 450)
				stack = stack.substring(0, 450);
		} else
			stack = '';
		if (!stack)
			stack = '-';
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
						cookies: navigator.cookieEnabled,
						language: navigator.language,
						platform: navigator.platform,
						useragent: navigator.userAgent,
						device: global.getDevice(),
						version: global.appVersion,
						localized: geoData.localized && geoData.localized.indexOf && geoData.localized.length > 50 ? geoData.localized.substring(0, 50) : geoData.localized,
						lang: global.language,
						stack: stack,
						type: feedback ? 'FEEDBACK' : 'BUG'
					}
				},
				error(r) {
					var e = ui.q('feedbackHint');
					if (e && feedback)
						ui.html(e, ui.l('error.text'));
				},
				success(r) {
					pageInfo.sentFeedback.push(text);
					if (exec)
						exec.call();
					var e = ui.q('feedbackHint');
					if (e && feedback) {
						pageChat.initActiveChats();
						ui.css(e.parentNode, 'height', '');
						ui.html(e, ui.l('info.feedbackUploadSuccess'));
						setTimeout(function () {
							ui.html(e, '');
							ui.q('#feedbackText').value = '';
						}, 5000);
					}
				}
			});
		} else {
			communication.ajax({
				url: global.server + 'action/notify',
				method: 'POST',
				body: 'text=' + encodeURIComponent('text:' + text + '\nappname:' + navigator.appName + '\nappversion:' + navigator.appVersion + '\ncookies:' + navigator.cookieEnabled + '\nlanguage:' + navigator.language + '\nplatform:' + navigator.platform + '\nuseragent:' + navigator.userAgent + '\ndevice:' + global.getDevice() + '\nversion:' + global.appVersion + '\nlocalized:' + (geoData.localized && geoData.localized.indexOf && geoData.localized.length > 50 ? geoData.localized.substring(0, 50) : geoData.localized) + '\nlang:' + global.language + '\nstack:' + stack),
				error(r) {
					console.log(r);
				},
				success() {
					if (exec)
						exec.call();
				}
			});
		}
	}
	static socialShare(extra) {
		var msg = ui.l('info.socialShareText').replace('{0}', user.contact.pseudonym + ' ' + ui.l('or') + ' ' + user.contact.idDisplay).replace('{1}', user.contact.gender == 1 ? '🙋‍♂️' : '🙋‍♀️');
		if (global.isBrowser())
			ui.navigation.openPopup(ui.l('sendSocialShare'), ui.l('info.socialShareBrowser') + '<textarea readonly="true" onclick="this.setSelectionRange(0, this.value.length)" style="padding:1em 0 0 0;text-align:center;background:transparent;height:16em;">' + msg + '</textarea>');
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
		ui.html('#infoLocalized', geoData.localized == true ? ui.l('info.localized').replace('{0}', geoData.currentTown + global.separator + geoData.currentStreet) : ui.l('info.notLocalized').replace('{0}', geoData.localized ? geoData.localized : '-'));
	}
};
