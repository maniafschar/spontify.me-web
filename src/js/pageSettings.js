import { bluetooth } from './bluetooth';
import { communication } from './communication';
import { global } from './global';
import { Contact, Location, model } from './model';
import { pageContact } from './pageContact';
import { ui, formFunc } from './ui';
import { user } from './user';
import { details } from './details';
import { pageLocation } from './pageLocation';
import { pageInfo } from './pageInfo';
import { pageLogin } from './pageLogin';
import { lists } from './lists';
import { pageEvent } from './pageEvent';
import QRCodeStyling from 'qr-code-styling';

export { pageSettings };

class pageSettings {
	static currentSettings = null;
	static template = v =>
		global.template`<tabHeader>
	<tab onclick="pageSettings.selectTab(0)" class="tabActive">
		${ui.l('settings.tabProfile')}
	</tab>
	<tab onclick="pageSettings.selectTab(1)">
		${ui.l('settings.tabSkills')}
	</tab>
	<tab onclick="pageSettings.selectTab(2)">
		${ui.l('settings.tabLegal')}
	</tab>
</tabHeader>
<tabBody>
	<div style="padding:0 0.5em 2em 0.5em;">${v.settings1}</div>
	<div style="padding:0 0.5em 2em 0.5em;">${v.settings2}</div>
	<div style="text-align:left;">${v.settings3}</div>
</tabBody><save class="highlightColor" onclick="pageSettings.save()">&check;</save>`;
	static templateSettings1 = v =>
		global.template`<field>
	<label>${ui.l('pseudonym')}</label>
	<value>
		<input name="pseudonym" value="${v['contact.pseudonym']}" />
	</value>
</field>
<field>
	<label>${ui.l('email')}</label>
	<value>
		<input type="email" name="email" value="${user.email}" onblur="pageSettings.checkUnique();" />
	</value>
</field>
<field>
	<label>${ui.l('picture')}</label>
	<value style="text-align:center;">
		<input-image src="${v.image}" name="image"></input-image>
	</value>
</field>
<field>
	<label>${ui.l('settings.description')}</label>
	<value>
		<textarea name="description" maxlength="1000">${v['contact.description']}</textarea>
	</value>
</field>
<field>
	<label>${ui.l('settings.urls')}</label>
	<value>
		<textarea name="urls" maxlength="1000" placeholder="${ui.l('settings.urlsHint')}">${v['contact.urls']}</textarea>
	</value>
</field>
<field>
	<label>${ui.l('birthday')}</label>
	<value>
		<input-date type="date" name="data" value="${v.birthday}" min="${v.birthdayMin}" max="${v.birthdayMax}"></input-date>
	</value>
</field>
<field>
	<label>${ui.l('gender')}</label>
	<value class="checkbox">
		<input-checkbox type="radio" name="gender" value="2" label="female" ${v.gender2}></input-checkbox>
		<input-checkbox type="radio" name="gender" value="1" label="male" ${v.gender1}></input-checkbox>
		<input-checkbox type="radio" name="gender" value="3" label="divers" ${v.gender3}></input-checkbox>
	</value>
</field>
<field>
	<label>${ui.l('settings.lang')}</label>
	<value class="checkbox">
		<input-checkbox type="radio" name="language" value="DE" label="Deutsch" ${v.langDE}></input-checkbox>
		<input-checkbox type="radio" name="language" value="EN" label="English" ${v.langEN}></input-checkbox>
	</value>
</field>
<field>
	<label>${ui.l('settings.teaser')}</label>
	<value class="checkbox">
		<input-checkbox name="teaser" value="true" label="settings.teaserLabel" ${v.teaser}></input-checkbox>
	</value>
</field>
<field>
	<label>${ui.l('settings.search')}</label>
	<value class="checkbox">
		<input-checkbox name="search" value="true" label="settings.searchPseudonym" ${v.search}></input-checkbox>
		<explain>${ui.l('settings.searchPseudonymHint')}</explain>
	</value>
</field>
<qrcodeDescription>${ui.l('settings.qrcode')}</qrcodeDescription>
<qrcode></qrcode>
<input type="hidden" name="skills" value="${v['contact.skills']}" />
<input type="hidden" name="skillsText" value="${v['contact.skillsText']}" />
<input type="hidden" name="verified" value="true" />`;
	static templateSettings2 = v =>
		global.template`<field>
	<label>${ui.l('settings.skills')}</label>
	<value>
		<input-hashtags ids="${v.skills}" text="${v.skillsText}" transient="true"></input-hashtags>
	</value>
</field>
<field>
	<label>${ui.l('settings.genderInterest')}</label>
	<value>
		<input-checkbox name="genderInterest2" label="settings.genderInterestFemale"
			onclick="pageSettings.toggleGenderSlider(this)" ${v.genderInterest2} transient="true"></input-checkbox>
		<input-slider type="range" min="18" max="99" value="${v['contact.ageFemale']}" name="ageFemale"></input-slider>
		<br />
		<input-checkbox name="genderInterest1" label="settings.genderInterestMale"
			onclick="pageSettings.toggleGenderSlider(this)" ${v.genderInterest1} transient="true"></input-checkbox>
		<input-slider type="range" min="18" max="99" value="${v['contact.ageMale']}" name="ageMale"></input-slider>
		<br />
		<input-checkbox name="genderInterest3" label="settings.genderInterestDivers"
			onclick="pageSettings.toggleGenderSlider(this)" ${v.genderInterest3} transient="true"></input-checkbox>
		<input-slider type="range" min="18" max="99" value="${v['contact.ageDivers']}" name="ageDivers"></input-slider>
	</value>
	<genderSelectHint onclick="pageSettings.selectTab(0)">${ui.l('settings.genderSelectHint')}</genderSelectHint>
</field>
<paypalFees></paypalFees>
<br/>
<dialogButtons>
<button-text onclick="pageSettings.preview()" label="settings.preview"></button-text>
</dialogButtons>`;
	static templateSettings3 = v =>
		global.template`<button-text class="settingsButton" onclick="pageInfo.toggleInfoBlock(&quot;settings tabBody .notification&quot;)" label="settings.myNotifications"></button-text><br/>
<div class="notification" class="notifications" style="display:none;padding:0.5em 1em 1em 1em;">
	<input-checkbox value="true" name="notificationNews" label="notification.news" ${v['contact.notificationNews']} ${v.hideNotificationNews}></input-checkbox>
	<br />
	<input-checkbox value="true" name="notificationChat" label="notification.chat" ${v['contact.notificationChat']}></input-checkbox>
	<br />
	<input-checkbox value="true" name="notificationFriendRequest" label="notification.friendRequest" ${v['contact.notificationFriendRequest']}></input-checkbox>
	<br />
	<input-checkbox value="true" name="notificationBirthday" label="notification.birthday" ${v['contact.notificationBirthday']}></input-checkbox>
	<br />
	<input-checkbox value="true" name="notificationEngagement" label="notification.engagement" ${v['contact.notificationMarkEvent']}></input-checkbox>
	<br />
	<input-checkbox value="true" name="notificationVisitProfile" label="notification.visitProfile" ${v['contact.notificationVisitProfile']}></input-checkbox>
	<br />
	<input-checkbox value="true" name="notificationVisitLocation" label="notification.visitLocation" ${v['contact.notificationVisitLocation']}></input-checkbox>
	<br />
	<input-checkbox value="true" name="notificationMarkEvent" label="notification.markEvent" ${v['contact.notificationMarkEvent']}></input-checkbox>
</div>
<button-text class="settingsButton" onclick="pageSettings.toggleBlocked()" label="contacts.blocked"></button-text><br/>
<div id="blocked" style="display:none;"></div>
<button-text onclick="ui.toggleHeight(&quot;#delete&quot;)" class="settingsButton" label="settings.delete"></button-text><br/>
<div id="delete" style="display:none;margin:0 1em 1em 1em;">
<div style="margin:0.25em 0 0.5em 0.5em;">${ui.l('settings.deleteProfileHint')}</div>
<div>
<input-checkbox name="deletionReason" label="settings.deleteReasonTechnical" value="technical" transient="true" onclick="ui.toggleHeight(&quot;hintDelete.hint1&quot;)"></input-checkbox>
<hintDelete class="hint1" style="display:none;">${ui.l('settings.hintDeleteReasonTechnical')}</hintDelete>
</div>
<div>
<input-checkbox name="deletionReason" label="settings.deleteReasonComplex" value="complex" transient="true" onclick="ui.toggleHeight(&quot;hintDelete.hint2&quot;)"></input-checkbox>
<hintDelete class="hint2" style="display:none;">${ui.l('settings.hintDeleteReasonComplex')}</hintDelete>
</div>
<div>
<input-checkbox name="deletionReason" label="settings.deleteReasonMessages" value="messages" transient="true" onclick="ui.toggleHeight(&quot;hintDelete.hint3&quot;)"></input-checkbox>
<hintDelete class="hint3" style="display:none;">${ui.l('settings.hintDeleteReasonMessages')}</hintDelete>
</div>
<div>
<input-checkbox name="deletionReason" label="settings.deleteReasonMolested" value="molested" transient="true" onclick="ui.toggleHeight(&quot;hintDelete.hint4&quot;)"></input-checkbox>
<hintDelete class="hint4" style="display:none;">${ui.l('settings.hintDeleteReasonMolested')}</hintDelete>
</div>
<div>
<input-checkbox name="deletionReason" label="settings.deleteReasonExpectation" value="expectation" transient="true" onclick="ui.toggleHeight(&quot;hintDelete.hint5&quot;)"></input-checkbox>
<hintDelete class="hint5" style="display:none;">${ui.l('settings.hintDeleteReasonExpectation')}</hintDelete>
</div>
<div>
<input-checkbox name="deletionReason" label="settings.deleteReasonBenefit" value="benefit" transient="true" onclick="ui.toggleHeight(&quot;hintDelete.hint6&quot;)"></input-checkbox>
<hintDelete class="hint6" style="display:none;">${ui.l('settings.hintDeleteReasonBenefit')}</hintDelete>
</div>
<div>
<input-checkbox name="deletionReason" label="settings.deleteReasonNothing" value="nothing" transient="true" onclick="ui.toggleHeight(&quot;hintDelete.hint7&quot;)"></input-checkbox>
<hintDelete class="hint7" style="display:none;">${ui.l('settings.hintDeleteReasonNothing')}</hintDelete>
</div>
<errorHint class="checkbox"></errorHint>
<textarea id="deleteAccountFeedback" placeholder="${ui.l('settings.deleteProfileFeedbackHint')}" maxlength="2000"></textarea>
<errorHint class="textarea"></errorHint>
<div style="margin-top:1em;text-align:center;">
<button-text onclick="pageSettings.deleteProfile()" label="settings.deleteProfile"></button-text>
</div>
</div>
${v.info}`;

	static checkUnique() {
		if (user.email == ui.val('input[name="email"]'))
			formFunc.resetError(ui.q('input[name="email"]'));
		else
			pageLogin.checkUnique(ui.q('input[name="email"]'));
	}
	static deleteProfile() {
		ui.html('errorHint', '');
		var reasons = ui.qa('input-checkbox[name="deletionReason"][checked="true"]');
		if (!reasons.length) {
			ui.q('errorHint.checkbox').innerHTML = ui.l('settings.deleteChooseReason');
			return;
		}
		var s = ui.val('#deleteAccountFeedback').trim();
		while (s.indexOf('  ') > -1)
			s = s.replace(/  /g, ' ');
		if (!s || s.length < 10 || s.split(' ').length < 3) {
			ui.q('errorHint.textarea').innerHTML = s ? ui.l('settings.deleteExplainMoreWords') : ui.l('settings.deleteExplain');
			return;
		}
		for (var i = 0; i < reasons.length; i++)
			s = reasons[i].getAttribute('value') + '\n' + s;
		communication.ajax({
			url: global.serverApi + 'db/one',
			webCall: 'pageSettings.deleteProfile',
			method: 'POST',
			body: {
				classname: 'Ticket',
				values: {
					type: 'REGISTRATION',
					subject: 'Delete',
					note: s
				}
			},
			success() {
				communication.ajax({
					url: global.serverApi + 'authentication/one',
					webCall: 'pageSettings.deleteProfile',
					method: 'DELETE',
					success(r) {
						pageLogin.resetAfterLogoff();
					}
				});
			}
		});
	}
	static getCurrentSettings() {
		var s = ui.val('settings input[name="email"]');
		s += global.separatorTech + global.hash(ui.val('settings input-image[name="image"]'));
		s += global.separatorTech + ui.val('settings textarea[name="description"]');
		s += global.separatorTech + ui.val('settings textarea[name="urls"]');
		s += global.separatorTech + ui.val('settings input-date[name="birthday"]');
		s += global.separatorTech + ui.val('settings input-checkbox[name="gender"][checked="true"]');
		s += global.separatorTech + ui.val('settings input-slider[name="ageFemale"]');
		s += global.separatorTech + ui.val('settings input-slider[name="ageMale"]');
		s += global.separatorTech + ui.val('settings input-slider[name="ageDivers"]');
		s += global.separatorTech + (ui.q('settings input-checkbox[name="genderInterest1"][checked="true"]') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings input-checkbox[name="genderInterest2"][checked="true"]') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings input-checkbox[name="genderInterest3"][checked="true"]') ? 1 : 0);
		s += global.separatorTech + ui.val('settings input-checkbox[name="language"][checked="true"]');
		s += global.separatorTech + (ui.q('settings input-checkbox[name="teaser"][checked="true"]') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings input-checkbox[name="search"][checked="true"]') ? 1 : 0);
		s += global.separatorTech + ui.val('settings input[name="pseudonym"]');
		s += global.separatorTech + (ui.q('settings input-checkbox[name="genderInterest1"][checked="true"]') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings input-checkbox[name="genderInterest2"][checked="true"]') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings input-checkbox[name="genderInterest3"][checked="true"]') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings input-checkbox[name="notificationNews"][checked="true"]') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings input-checkbox[name="notificationChat"][checked="true"]') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings input-checkbox[name="notificationEngagement"][checked="true"]') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings input-checkbox[name="notificationFriendRequest"][checked="true"]') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings input-checkbox[name="notificationBirthday"][checked="true"]') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings input-checkbox[name="notificationVisitProfile"][checked="true"]') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings input-checkbox[name="notificationVisitLocation"][checked="true"]') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings input-checkbox[name="notificationMarkEvent"][checked="true"]') ? 1 : 0);
		s += global.separatorTech + ui.q('settings input-hashtags').getAttribute('ids');
		s += global.separatorTech + ui.q('settings input-hashtags').getAttribute('text');
		return s;
	}
	static init(exec) {
		ui.classRemove('dialog-navigation item', 'active');
		if (!ui.q('settings').innerHTML) {
			communication.ajax({
				url: global.serverApi + 'db/one?query=contact_list&search=' + encodeURIComponent('contact.id=' + user.contact.id),
				webCall: 'pageSettings.init',
				responseType: 'json',
				success(v) {
					var d = v['contact.birthday'];
					if (!d)
						d = '';
					else if (d.indexOf(' ') > 0)
						d = d.substring(0, d.indexOf(' '));
					user.contact.pseudonym = v['contact.pseudonym'];
					if (v['contact.image'])
						user.contact.image = v['contact.image'];
					if (v['contact.imageList'])
						user.contact.imageList = v['contact.imageList'];
					v.birthday = d;
					d = new Date();
					v.birthdayMax = (d = new Date(d.setFullYear(d.getFullYear() - 18))).toISOString().substring(0, 10);
					v.birthdayMin = new Date(d.setFullYear(d.getFullYear() - 81)).toISOString().substring(0, 10);
					v.hideNotificationNews = global.config.club ? '' : ' class="hidden"';
					v['contact.notificationNews'] = v['contact.notificationNews'] == 1 ? ' checked="true"' : '';
					v['contact.notificationChat'] = v['contact.notificationChat'] == 1 ? ' checked="true"' : '';
					v['contact.notificationEngagement'] = v['contact.notificationEngagement'] == 1 ? ' checked="true"' : '';
					v['contact.notificationFriendRequest'] = v['contact.notificationFriendRequest'] == 1 ? ' checked="true"' : '';
					v['contact.notificationBirthday'] = v['contact.notificationBirthday'] == 1 ? ' checked="true"' : '';
					v['contact.notificationVisitProfile'] = v['contact.notificationVisitProfile'] == 1 ? ' checked="true"' : '';
					v['contact.notificationVisitLocation'] = v['contact.notificationVisitLocation'] == 1 ? ' checked="true"' : '';
					v['contact.notificationMarkEvent'] = v['contact.notificationMarkEvent'] == 1 ? ' checked="true"' : '';
					v.langDE = v['contact.language'] == 'DE' ? ' checked="true"' : '';
					v.langEN = v['contact.language'] == 'EN' ? ' checked="true"' : '';
					v.gender1 = v['contact.gender'] == 1 ? ' checked="true"' : '';
					v.gender2 = v['contact.gender'] == 2 ? ' checked="true"' : '';
					v.gender3 = v['contact.gender'] == 3 ? ' checked="true"' : '';
					v.search = v['contact.search'] ? ' checked="true"' : '';
					v.teaser = v['contact.teaser'] ? ' checked="true"' : '';
					v.skills = v['contact.skills'];
					v.skillsText = v['contact.skillsText'];
					if (v['contact.search'] == 1)
						v.search = ' checked="true"';
					if (user.contact.imageList)
						v.image = global.serverImg + user.contact.imageList;
					v.settings1 = pageSettings.templateSettings1(v);
					if (user.contact.ageMale)
						v.genderInterest1 = 'checked="true"';
					if (user.contact.ageFemale)
						v.genderInterest2 = 'checked="true"';
					if (user.contact.ageDivers)
						v.genderInterest3 = 'checked="true"';
					v.settings2 = pageSettings.templateSettings2(v);
					v.info = pageInfo.template()
						+ '<button-text class="settingsButtonRight" onclick="pageLogin.logoff()" label="logoff.title"></button-text>'
						+ '<button-text class="settingsButtonRight" onclick="pageInfo.socialShare()" label="settings.socialShare"></button-text>'
						+ pageInfo.templateCopyright();
					v.settings3 = pageSettings.templateSettings3(v);
					ui.q('settings').innerHTML = pageSettings.template(v);
					communication.ajax({
						url: global.serverApi + 'action/paypalKey',
						webCall: 'pageSettings.init',
						responseType: 'json',
						success(r) {
							ui.q('settings paypalFees').innerHTML = ui.l('settings.paypalFees').replace('{0}', r.feeDate ?
								'<br/>' + ui.l('events.paypalSignUpHintFee').replace('{0}', r.fee).replace('{1}', global.date.formatDate(r.feeDate)).replace('{2}', r.feeAfter)
								: r.fee);
						}
					});
					formFunc.initFields(ui.q('settings'));
					if (!v['contact.ageFemale'])
						ui.css(ui.q('settings [name="ageFemale"]'), 'display', 'none');
					if (!v['contact.ageMale'])
						ui.css(ui.q('settings [name="ageMale"]'), 'display', 'none');
					if (!v['contact.ageDivers'])
						ui.css(ui.q('settings [name="ageDivers"]'), 'display', 'none');
					pageSettings.currentSettings = pageSettings.getCurrentSettings();
					if (exec)
						exec()
					var x = Math.min(300, ui.q('settings').offsetWidth - 2 * ui.emInPX);
					new QRCodeStyling({
						width: x,
						height: x,
						data: global.server + '?' + global.encParam('f=' + user.contact.id),
						dotsOptions: {
							color: ui.cssValue(':root', '--bg2start'),
							type: 'square'
						},
						backgroundOptions: {
							color: 'transparent',
						}
					}).append(ui.q('qrcode'));
				}
			});
			return true;
		}
	}
	static listBlocked(type, s) {
		var e = ui.q('#blocked');
		if (s) {
			var e2 = document.createElement('div');
			e2.innerHTML = s;
			for (var i = e2.childNodes.length - 1; i >= 0; i--)
				e.appendChild(e2.childNodes[0]);
			e2 = ui.q('#blocked>div');
			if (e2)
				e2.outerHTML = '';
		} else if (!e.innerHTML)
			e.innerHTML = '<div style="padding-left:1em;">' + ui.l('noResults.block') + '</div>';
		e.setAttribute(type, 'true');
		if (ui.cssValue(e, 'display') == 'none' && e.getAttribute('contact') && e.getAttribute('location') && e.getAttribute('event'))
			ui.toggleHeight(e);
	}
	static list(l, list, type) {
		l[0].push('_message1');
		l[0].push('_message2');
		var v;
		for (var i = 1; i < l.length; i++) {
			v = model.convert(new Contact(), l, i);
			l[i].push(v.block.reason ? ui.l('contacts.blockReason' + v.block.reason) : '&nbsp;');
			l[i].push(v.block.note ? v.block.note : '&nbsp;');
		}
		if (type == 'event') {
			var l2 = [];
			for (var i = 1; i < l.length; i++)
				l2.push(model.convert(new Location(), l, i));
			l = l2;
		}
		pageSettings.listBlocked(type, list(l));
	}
	static preview() {
		if (pageSettings.currentSettings == pageSettings.getCurrentSettings())
			details.open(user.contact.id, { webCall: 'pageSettings.preview', query: 'contact_list', search: encodeURIComponent('contact.id=' + user.contact.id) }, pageContact.detail);
		else
			pageSettings.save('autoOpen');
	}
	static postSave(goToID) {
		if (pageSettings.currentSettings && pageSettings.currentSettings.split(global.separatorTech)[0] != ui.val('input[name="email"]')) {
			pageLogin.logoff();
			return;
		}
		user.contact.ageFemale = ui.val('settings input[name="ageFemale"]');
		user.contact.ageMale = ui.val('settings input[name="ageMale"]');
		user.contact.ageDivers = ui.val('settings input[name="ageDivers"]');
		user.contact.pseudonym = ui.val('settings input[name="pseudonym"]');
		user.contact.gender = ui.val('settings input-checkbox[name="gender"][checked="true"]');
		user.contact.birthday = ui.val('settings input-date[name="birthday"]');
		user.contact.skills = ui.q('settings input-hashtags').getAttribute('ids');
		user.contact.skillsText = ui.q('settings input-hashtags').getAttribute('text');
		user.contact.skills = user.contact.skills.category;
		user.contact.age = user.contact.birthday ? pageContact.getBirthday(user.contact.birthday).age : null;
		pageSettings.currentSettings = pageSettings.getCurrentSettings();
		bluetooth.reset();
		if (goToID) {
			if (goToID == 'autoOpen')
				pageSettings.preview();
			else
				ui.navigation.goTo(goToID, true);
		}
		ui.css('settings save', 'display', '');
		if (ui.q('settings input-image img.preview')) {
			communication.ajax({
				url: global.serverApi + 'db/one?query=contact_list&search=' + encodeURIComponent('contact.id=' + user.contact.id),
				webCall: 'pageSettings.postSave',
				responseType: 'json',
				success(r) {
					user.contact.image = r['contact.image'];
					user.contact.imageList = r['contact.imageList'];
					ui.q('settings input-image img.icon').src = global.serverImg + user.contact.imageList;
					ui.q('settings input-image').remove();
					document.dispatchEvent(new CustomEvent('Settings', { detail: { action: 'save' } }));
				}
			});
		} else
			document.dispatchEvent(new CustomEvent('Settings', { detail: { action: 'save' } }));
	}
	static reset() {
		formFunc.resetError(ui.q('input[name="pseudonym"]'));
		formFunc.resetError(ui.q('input[name="email"]'));
		formFunc.resetError(ui.q('input-image[name="image"]'));
		formFunc.resetError(ui.q('input-date[name="birthday"]'));
		formFunc.resetError(ui.q('input[name="gender"]'));
		formFunc.resetError(ui.q('textarea[name="description"]'));
		formFunc.resetError(ui.q('textarea[name="urls"]'));
		formFunc.resetError(ui.q('settings [name="ageFemale"]'));
		formFunc.resetError(ui.q('settings [name="ageMale"]'));
		formFunc.resetError(ui.q('settings [name="ageDivers"]'));
	}
	static resetEmailToOldValue() {
		ui.q('input[name="email"]').value = pageSettings.currentSettings.split(global.separatorTech)[0];
		ui.navigation.closePopup();
	}
	static save(goToID, saveNewEmail) {
		if (!ui.q('settings').innerHTML)
			return true;
		pageSettings.reset();
		if (!user.contact || pageSettings.currentSettings == pageSettings.getCurrentSettings())
			return true;
		formFunc.validation.birthday(ui.q('input-date[name="birthday"]'));
		if (ui.q('input-checkbox[name="guide"][checked="true"]') && !ui.val('textarea[name="description"]'))
			formFunc.setError(ui.q('textarea[name="description"]'), 'settings.descriptionEmpty');
		else if (ui.val('textarea[name="description"]'))
			formFunc.validation.filterWords(ui.q('textarea[name="description"]'));
		var s = ui.val('textarea[name="urls"]').trim().replace(/\t/g, '');
		if (s) {
			if (s.indexOf(' ') > -1)
				formFunc.setError(ui.q('textarea[name="urls"]'), 'settings.urlsFormat');
			else {
				while (s.indexOf('\n\n') > -1)
					s = s.replace(/\n\n/g, '\n');
				ui.q('textarea[name="urls"]').value = s;
				s = s.split('\n');
				for (var i = 0; i < s.length; i++) {
					try {
						var h = new URL(s[i]);
						if (!h.hostname || !h.protocol)
							formFunc.setError(ui.q('textarea[name="urls"]'), 'settings.urlsFormat');
					} catch (e) {
						formFunc.setError(ui.q('textarea[name="urls"]'), 'settings.urlsFormat');
					}
				}
			}
		}
		formFunc.validation.email(ui.q('input[name="email"]'));
		formFunc.validation.pseudonym(ui.q('input[name="pseudonym"]'));
		if (ui.q('settings .dialogFieldError'))
			return false;
		if (pageSettings.currentSettings && pageSettings.currentSettings.split(global.separatorTech)[0] != ui.val('input[name="email"]')) {
			if (saveNewEmail)
				ui.q('input[name="verified"]').value = 'false';
			else {
				ui.navigation.openPopup(ui.l('attention'), ui.l('settings.confirmEmailChange') + '<br /><button-text onclick="pageSettings.save(&quot;' + goToID + '&quot;,true);ui.navigation.closePopup()" style="margin-top:1em;" label="Yes"></button-text><button-text onclick="pageSettings.resetEmailToOldValue()" style="margin-top:1em;" label="No"></button-text>');
				return false;
			}
		}
		var x = ui.q('settings input-checkbox[name="gender"][checked="true"]') && ui.val('settings input-date[name="birthday"]');
		if (!x || !ui.q('input-checkbox[name="genderInterest1"][checked="true"]'))
			ui.q('settings [name="ageMale"]').value = '';
		if (!x || !ui.q('input-checkbox[name="genderInterest2"][checked="true"]'))
			ui.q('settings [name="ageFemale"]').value = '';
		if (!x || !ui.q('input-checkbox[name="genderInterest3"][checked="true"]'))
			ui.q('settings [name="ageDivers"]').value = '';
		ui.q('textarea[name="description"]').value = ui.val('textarea[name="description"]').replace(/</g, '&lt;');
		ui.q('input[name="email"]').value = ui.val('input[name="email"]').trim().toLowerCase();
		ui.q('settings input[name="skills"]').value = ui.q('settings input-hashtags').getAttribute('ids');
		ui.q('settings input[name="skillsText"]').value = ui.q('settings input-hashtags').getAttribute('text');
		user.save({ webCall: 'pageSettings.save', ...formFunc.getForm('settings tabBody') }, () => pageSettings.postSave(goToID));
	}
	static selectTab(i) {
		ui.classRemove('settings tab', 'tabActive');
		ui.classAdd(ui.qa('settings tab')[i], 'tabActive');
		ui.q('settings tabBody').style.marginLeft = i * -100 + '%';
		ui.css('settings genderSelectHint', 'display', ui.q('settings input-checkbox[name="gender"][checked="true"]') && ui.val('settings input-date[name="birthday"]') ? 'none' : 'block');
	}
	static swipeLeft() {
		var m = ui.q('settings tabBody').style.marginLeft;
		m = !m ? 0 : parseInt(m);
		if (m > -200)
			pageSettings.selectTab(m / -100 + 1);
		else
			ui.navigation.goTo('home', false);
	}
	static swipeRight() {
		var m = parseInt(ui.q('settings tabBody').style.marginLeft);
		if (m < 0)
			pageSettings.selectTab(m / -100 - 1);
		else
			ui.navigation.goTo('home', true);
	}
	static toggleBlocked() {
		var e = ui.q('#blocked');
		if (e.innerHTML)
			ui.toggleHeight(e, function () {
				e.removeAttribute('h');
				e.removeAttribute('contact');
				e.removeAttribute('location');
				e.removeAttribute('event');
				e.style.display = 'none';
				e.innerHTML = '';
			});
		else {
			lists.load({
				webCall: 'pageSettings.toggleBlocked',
				query: 'contact_listBlocked',
				limit: 0
			}, function (l) { pageSettings.list(l, pageContact.listContacts, 'contact'); });
			lists.load({
				webCall: 'pageSettings.toggleBlocked',
				query: 'location_listBlocked',
				limit: 0
			}, function (l) { pageSettings.list(l, pageLocation.listLocation, 'location'); });
			lists.load({
				webCall: 'pageSettings.toggleBlocked',
				query: 'event_listBlocked',
				limit: 0
			}, function (l) { pageSettings.list(l, pageEvent.listEvents, 'event'); });
		}
	}
	static toggleGenderSlider(e) {
		ui.css(e.nextElementSibling, 'display', e.getAttribute('checked') == 'true' ? 'block' : 'none');
	}
	static unblock(id, blockId) {
		if (!ui.q('dialog-popup [i="' + id + '"]')) {
			ui.navigation.openPopup(ui.l('attention'), ui.l('contacts.unblock').replace('{0}', ui.q('#blocked row[i="' + id + '"] title').innerText) + '<br /><br /><button-text i="' + id + '" onclick="pageSettings.unblock(&quot;' + id + '&quot;,' + blockId + ')" label="Yes"></button-text>');
			return;
		}
		communication.ajax({
			url: global.serverApi + 'db/one',
			webCall: 'pageSettings.unblock',
			method: 'DELETE',
			body: { classname: 'Block', id: blockId },
			success() {
				var e = ui.q('settings #blocked [i="' + id + '"]');
				if (e)
					e.outerHTML = '';
				ui.navigation.closePopup();
				e = ui.q('settings #blocked');
				e.removeAttribute('h');
				if (!ui.q('settings #blocked list-row'))
					ui.css(e, 'display', 'none');
			}
		});
	}
};
