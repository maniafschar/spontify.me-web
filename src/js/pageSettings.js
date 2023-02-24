import { bluetooth } from './bluetooth';
import { communication } from './communication';
import { global } from './global';
import { initialisation } from './initialisation';
import { Contact, Location, model } from './model';
import { pageContact } from './pageContact';
import { ui, formFunc } from './ui';
import { user } from './user';
import { details } from './details';
import { pageLocation } from './pageLocation';
import { pageInfo } from './pageInfo';
import { hashtags } from './hashtags';
import QRCodeStyling from 'qr-code-styling';
import { pageLogin } from './pageLogin';
import { lists } from './lists';
import { pageEvent } from './pageEvent';

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
	<label style="padding-top:1em;">${ui.l('pseudonym')}</label>
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
		<input type="file" name="image" hint="${ui.l('settings.imageHint')}" accept=".gif, .png, .jpg" ${v.image}/>
	</value>
</field>
<field>
	<label>${ui.l('settings.aboutMe')}</label>
	<value>
		<textarea name="aboutMe" maxlength="1000">${v['contact.aboutMe']}</textarea>
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
	<value class="checkbox">
		<input type="date" placeholder="TT.MM.JJJJ" name="birthday" maxlength="10" id="bd"
			value="${v.birthday}" />
		<input type="radio" name="birthdayDisplay" value="2" label="${ui.l('settings.showBirthday')}"
			${v.birthdayDisplay2} style="margin-top:0.5em;" />
		<input type="radio" name="birthdayDisplay" value="1" label="${ui.l('settings.showAge')}"
			${v.birthdayDisplay1} />
	</value>
</field>
<field>
	<label>${ui.l('gender')}</label>
	<value class="checkbox">
		<input type="radio" name="gender" value="2" label="${ui.l('female')}" ${v.gender2} />
		<input type="radio" name="gender" value="1" label="${ui.l('male')}" ${v.gender1} />
		<input type="radio" name="gender" value="3" label="${ui.l('divers')}" ${v.gender3} />
	</value>
</field>
<field>
	<label>${ui.l('settings.lang')}</label>
	<value class="checkbox">
		<input type="radio" name="language" value="DE" label="Deutsch" ${v.langDE} />
		<input type="radio" name="language" value="EN" label="English" ${v.langEN} />
	</value>
</field>
<field>
	<label>${ui.l('settings.teaser')}</label>
	<value class="checkbox">
		<input type="checkbox" name="teaser" value="true" label="${ui.l('settings.teaserLabel')}" ${v.teaser} />
	</value>
</field>
<field>
	<label>${ui.l('settings.search')}</label>
	<value class="checkbox">
		<input type="checkbox" name="search" value="true" label="${ui.l('settings.searchPseudonym')}" ${v.search} />
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
		<hashtagButton onclick="ui.toggleHeight(&quot;settings hashtags&quot;)"></hashtagButton>
		<textarea name="hashtagsDisp" maxlength="250" transient="true" onkeyup="hashtags.synchonizeTags(this)" style="height:2em;">${v.hashtagsDisp}</textarea>
		<hashtags style="display:none;">${v.hashtagSelection}</hashtags>
	</value>
</field>
<field>
	<label>${ui.l('settings.genderInterest')}</label>
	<value>
		<input type="checkbox" name="genderInterest2" label="${ui.l('settings.genderInterestFemale')}"
			onclick="pageSettings.toggleGenderSlider(2)" ${v.genderInterest2} transient="true" />
		<input type="text" id="settingsInterest2" slider="range" min="18" max="99" value="${v['contact.ageFemale']}"
			name="ageFemale" />
		<br />
		<input type="checkbox" name="genderInterest1" label="${ui.l('settings.genderInterestMale')}"
			onclick="pageSettings.toggleGenderSlider(1)" ${v.genderInterest1} transient="true" />
		<input type="text" id="settingsInterest1" slider="range" min="18" max="99" value="${v['contact.ageMale']}"
			name="ageMale" />
		<br />
		<input type="checkbox" name="genderInterest3" label="${ui.l('settings.genderInterestDivers')}"
			onclick="pageSettings.toggleGenderSlider(3)" ${v.genderInterest3} transient="true" />
		<input type="text" id="settingsInterest3" slider="range" min="18" max="99" value="${v['contact.ageDivers']}"
			name="ageDivers" />
	</value>
</field>
<paypalFees></paypalFees>
<br/>
<dialogButtons>
<buttontext onclick="pageSettings.preview()" class="bgColor">${ui.l('settings.preview')}</buttontext>
</dialogButtons>`;
	static templateSettings3 = v =>
		global.template`<buttontext class="bgColor settingsButton" onclick="pageInfo.toggleInfoBlock(&quot;settings tabBody .notification&quot;)">${ui.l('settings.myNotifications')}</buttontext><br/>
<div class="notification" class="notifications" style="display:none;padding:0.5em 1em 1em 1em;">
	<input type="checkbox" value="true" name="notificationChat" label="${ui.l('notification.chat')}" ${v['contact.notificationChat']} />
	<br />
	<input type="checkbox" value="true" name="notificationFriendRequest" label="${ui.l('notification.friendRequest')}" ${v['contact.notificationFriendRequest']} />
	<br />
	<input type="checkbox" value="true" name="notificationBirthday" label="${ui.l('notification.birthday')}" ${v['contact.notificationBirthday']} />
	<br />
	<input type="checkbox" value="true" name="notificationEngagement" label="${ui.l('notification.engagement')}" ${v['contact.notificationMarkEvent']} />
	<br />
	<input type="checkbox" value="true" name="notificationVisitProfile" label="${ui.l('notification.visitProfile')}" ${v['contact.notificationVisitProfile']} />
	<br />
	<input type="checkbox" value="true" name="notificationVisitLocation" label="${ui.l('notification.visitLocation')}" ${v['contact.notificationVisitLocation']} />
	<br />
	<input type="checkbox" value="true" name="notificationMarkEvent" label="${ui.l('notification.markEvent')}" ${v['contact.notificationMarkEvent']} />
</div>
<buttontext class="bgColor settingsButton" onclick="pageSettings.toggleBlocked()">${ui.l('contacts.blocked')}</buttontext><br/>
<div id="blocked" style="display:none;"></div>
<buttontext onclick="ui.toggleHeight(&quot;#delete&quot;)" class="bgColor settingsButton">${ui.l('settings.delete')}</buttontext><br/>
<div id="delete" style="display:none;margin:0 1em 1em 1em;">
<div style="margin:0.25em 0 0.5em 0.5em;">${ui.l('settings.deleteProfileHint')}</div>
<div>
<input type="checkbox" name="deletionReason" label="${ui.l('settings.deleteReason1')}" transient="true" onclick="ui.toggleHeight(&quot;hintDelete.hint1&quot;)" />
<hintDelete class="hint1" style="display:none;">${ui.l('settings.hintDeleteReason1')}</hintDelete>
</div>
<div>
<input type="checkbox" name="deletionReason" label="${ui.l('settings.deleteReason2')}" transient="true" onclick="ui.toggleHeight(&quot;hintDelete.hint2&quot;)" />
<hintDelete class="hint2" style="display:none;">${ui.l('settings.hintDeleteReason2')}</hintDelete>
</div>
<div>
<input type="checkbox" name="deletionReason" label="${ui.l('settings.deleteReason3')}" transient="true" onclick="ui.toggleHeight(&quot;hintDelete.hint3&quot;)" />
<hintDelete class="hint3" style="display:none;">${ui.l('settings.hintDeleteReason3')}</hintDelete>
</div>
<div>
<input type="checkbox" name="deletionReason" label="${ui.l('settings.deleteReason4')}" transient="true" onclick="ui.toggleHeight(&quot;hintDelete.hint4&quot;)" />
<hintDelete class="hint4" style="display:none;">${ui.l('settings.hintDeleteReason4')}</hintDelete>
</div>
<div>
<input type="checkbox" name="deletionReason" label="${ui.l('settings.deleteReason5')}" transient="true" onclick="ui.toggleHeight(&quot;hintDelete.hint5&quot;)" />
<hintDelete class="hint5" style="display:none;">${ui.l('settings.hintDeleteReason5')}</hintDelete>
</div>
<div>
<input type="checkbox" name="deletionReason" label="${ui.l('settings.deleteReason6')}" transient="true" onclick="ui.toggleHeight(&quot;hintDelete.hint6&quot;)" />
<hintDelete class="hint6" style="display:none;">${ui.l('settings.hintDeleteReason6')}</hintDelete>
</div>
<div>
<input type="checkbox" name="deletionReason" label="${ui.l('settings.deleteReason7')}" transient="true" onclick="ui.toggleHeight(&quot;hintDelete.hint7&quot;)" />
<hintDelete class="hint7" style="display:none;">${ui.l('settings.hintDeleteReason7')}</hintDelete>
</div>
<errorHint class="checkbox"></errorHint>
<textarea id="deleteAccountFeedback" placeholder="${ui.l('settings.deleteProfileFeedbackHint')}" maxlength="2000"></textarea>
<errorHint class="textarea"></errorHint>
<div style="margin-top:1em;text-align:center;">
<buttontext onclick="pageSettings.deleteProfile()" class="bgColor">${ui.l('settings.deleteProfile')}</buttontext>
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
		var reasons = ui.qa('input[name="deletionReason"]:checked');
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
		s = '\n' + ui.val('#deleteAccountFeedback').trim();
		while (s.indexOf('  ') > -1)
			s = s.replace(/  /g, ' ');
		var reasons = ui.qa('input[name="deletionReason"]:checked');
		for (var i = 0; i < reasons.length; i++)
			s = reasons[i].getAttribute('label') + '\n' + s;
		communication.ajax({
			url: global.server + 'db/one',
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
					url: global.server + 'authentication/one',
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
		s += global.separatorTech + ui.q('settings [name="image_disp"] img');
		s += global.separatorTech + ui.val('settings textarea[name="aboutMe"]');
		s += global.separatorTech + ui.val('settings textarea[name="urls"]');
		s += global.separatorTech + ui.val('settings input[name="birthday"]');
		s += global.separatorTech + ui.val('settings input[name="birthdayDisplay"]:checked');
		s += global.separatorTech + ui.val('settings input[name="gender"]:checked');
		s += global.separatorTech + ui.val('settings input[name="ageFemale"]');
		s += global.separatorTech + ui.val('settings input[name="ageMale"]');
		s += global.separatorTech + ui.val('settings input[name="ageDivers"]');
		s += global.separatorTech + (ui.q('settings input[name="genderInterest1"]:checked') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings input[name="genderInterest2"]:checked') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings input[name="genderInterest3"]:checked') ? 1 : 0);
		s += global.separatorTech + ui.val('settings input[name="language"]:checked');
		s += global.separatorTech + (ui.q('settings input[name="teaser"]:checked') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings input[name="search"]:checked') ? 1 : 0);
		s += global.separatorTech + ui.val('settings input[name="pseudonym"]');
		s += global.separatorTech + (ui.q('settings input[name="genderInterest1"]:checked') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings input[name="genderInterest2"]:checked') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings input[name="genderInterest3"]:checked') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings [name="notificationChat"]:checked') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings [name="notificationEngagement"]:checked') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings [name="notificationFriendRequest"]:checked') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings [name="notificationBirthday"]:checked') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings [name="notificationVisitProfile"]:checked') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings [name="notificationVisitLocation"]:checked') ? 1 : 0);
		s += global.separatorTech + (ui.q('settings [name="notificationMarkEvent"]:checked') ? 1 : 0);
		s += global.separatorTech + ui.val('settings textarea[name="hashtagsDisp"]');
		return s;
	}
	static getMultiplePopupValues(id) {
		var s = ui.val('#' + id).split(','), s2 = '';
		for (var i = 0; i < s.length; i++) {
			if (s[i].trim().length > 0)
				s2 += global.separatorTech + (s[i] < 10 ? '00' : s[i] < 100 ? '0' : '') + Number(s[i]);
		}
		if (s2.length > 0)
			s2 = s2.substring(1);
		return s2;
	}
	static init(exec) {
		ui.classRemove('navigation item', 'active');
		if (!ui.q('settings').innerHTML) {
			communication.ajax({
				url: global.server + 'db/one?query=contact_list&search=' + encodeURIComponent('contact.id=' + user.contact.id),
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
					v.birthdayDisplay2 = v['contact.birthdayDisplay'] == 2 ? ' checked' : '';
					v.birthdayDisplay1 = v['contact.birthdayDisplay'] == 1 ? ' checked' : '';
					v.birthdayDisplay0 = v['contact.birthdayDisplay'] == 0 ? ' checked' : '';
					v['contact.notificationChat'] = v['contact.notificationChat'] == 1 ? ' checked' : '';
					v['contact.notificationEngagement'] = v['contact.notificationEngagement'] == 1 ? ' checked' : '';
					v['contact.notificationFriendRequest'] = v['contact.notificationFriendRequest'] == 1 ? ' checked' : '';
					v['contact.notificationBirthday'] = v['contact.notificationBirthday'] == 1 ? ' checked' : '';
					v['contact.notificationVisitProfile'] = v['contact.notificationVisitProfile'] == 1 ? ' checked' : '';
					v['contact.notificationVisitLocation'] = v['contact.notificationVisitLocation'] == 1 ? ' checked' : '';
					v['contact.notificationMarkEvent'] = v['contact.notificationMarkEvent'] == 1 ? ' checked' : '';
					v.langDE = v['contact.language'] == 'DE' ? ' checked' : '';
					v.langEN = v['contact.language'] == 'EN' ? ' checked' : '';
					v.gender1 = v['contact.gender'] == 1 ? ' checked' : '';
					v.gender2 = v['contact.gender'] == 2 ? ' checked' : '';
					v.gender3 = v['contact.gender'] == 3 ? ' checked' : '';
					v.search = v['contact.search'] ? ' checked' : '';
					v.teaser = v['contact.teaser'] ? ' checked' : '';
					v.hashtagsDisp = (hashtags.ids2Text(v['contact.skills']) + ' ' + (v['contact.skillsText'] || '')).trim();
					if (v['contact.search'] == 1)
						v['search'] = ' checked';
					if (user.contact.imageList)
						v.image = 'src="' + global.serverImg + user.contact.imageList + '"';
					v.settings1 = pageSettings.templateSettings1(v);
					for (var i = 0; i < ui.categories.length; i++)
						v['att' + i + 'Ex'] = user.contact['attr' + i + 'Ex'] ? user.contact['attr' + i + 'Ex'].replace(/\u0015/g, ',') : '';
					v.hashtagSelection = hashtags.display();
					if (user.contact.ageMale)
						v.genderInterest1 = 'checked';
					if (user.contact.ageFemale)
						v.genderInterest2 = 'checked';
					if (user.contact.ageDivers)
						v.genderInterest3 = 'checked';
					v.settings2 = pageSettings.templateSettings2(v);
					v.info = pageInfo.template()
						+ '<buttontext class="bgColor settingsButtonRight" onclick="pageLogin.logoff()">' + ui.l('logoff.title') + '</buttontext>'
						+ '<buttontext class="bgColor settingsButtonRight" onclick="pageInfo.socialShare()">' + ui.l('settings.socialShare') + '</buttontext>'
						+ pageInfo.templateCopyright();
					v.settings3 = pageSettings.templateSettings3(v);
					ui.q('settings').innerHTML = pageSettings.template(v);
					communication.ajax({
						url: global.server + 'action/paypalKey',
						responseType: 'json',
						success(r) {
							ui.q('settings paypalFees').innerHTML = ui.l('settings.paypalFees').replace('{0}', r.feeDate ?
								'<br/>' + ui.l('events.paypalSignUpHintFee').replace('{0}', r.fee).replace('{1}', global.date.formatDate(r.feeDate)).replace('{2}', r.feeAfter)
								: r.fee);
						}
					});
					formFunc.initFields('settings');
					if (!v['contact.ageFemale'])
						ui.css(ui.q('#settingsInterest2').nextElementSibling, 'display', 'none');
					if (!v['contact.ageMale'])
						ui.css(ui.q('#settingsInterest1').nextElementSibling, 'display', 'none');
					if (!v['contact.ageDivers'])
						ui.css(ui.q('#settingsInterest3').nextElementSibling, 'display', 'none');
					if (v.hashtagsDisp)
						setTimeout(function () { hashtags.synchonizeTags(ui.q('settings textarea[name="hashtagsDisp"]')); }, 500);
					pageSettings.currentSettings = pageSettings.getCurrentSettings();
					if (exec)
						exec.call()
					var x = Math.min(300, ui.q('settings').offsetWidth - 2 * ui.emInPX);
					new QRCodeStyling({
						width: x,
						height: x,
						data: global.server.substring(0, global.server.lastIndexOf('/', global.server.length - 2)) + '?' + global.encParam('f=' + user.contact.id),
						dotsOptions: {
							color: 'rgb(255, 220, 70)',
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
	static listContactsBlocked(l) {
		l[0].push('_message1');
		l[0].push('_message2');
		var v;
		for (var i = 1; i < l.length; i++) {
			v = model.convert(new Contact(), l, i);
			l[i].push(v.block.reason ? ui.l('contacts.blockReason' + v.block.reason) : '&nbsp;');
			l[i].push(v.block.note ? v.block.note : '&nbsp;');
		}
		pageSettings.listBlocked('contact', pageContact.listContacts(l));
	}
	static listLocationsBlocked(l) {
		l[0].push('_message1');
		l[0].push('_message2');
		var v;
		for (var i = 1; i < l.length; i++) {
			v = model.convert(new Location(), l, i);
			l[i].push(v.block.reason ? ui.l('locations.blockReason' + v.block.reason) : '&nbsp;');
			l[i].push(v.block.note ? v.block.note : '&nbsp;');
		}
		pageSettings.listBlocked(l[0].includes('event.id') ? 'event' : 'location', pageLocation.listLocation(l));
	}
	static preview() {
		if (pageSettings.currentSettings == pageSettings.getCurrentSettings())
			details.open(user.contact.id, 'contact_list&search=' + encodeURIComponent('contact.id=' + user.contact.id), pageContact.detail);
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
		user.contact.gender = ui.val('settings input[name="gender"]:checked');
		user.contact.birthday = ui.val('settings input[name="birthday"]');
		user.contact.skills = hashtags.convert(ui.val('settings textarea[name="hashtagsDisp"]'));
		user.contact.skillsText = user.contact.skills.hashtags;
		user.contact.skills = user.contact.skills.category;
		user.contact.age = user.contact.birthday ? pageContact.getBirthday(user.contact.birthday).age : null;
		if (ui.q('[name="image_disp"] img')) {
			communication.ajax({
				url: global.server + 'db/one?query=contact_list&search=' + encodeURIComponent('contact.id=' + user.contact.id),
				responseType: 'json',
				success(r) {
					user.contact.image = r['contact.image'];
					user.contact.imageList = r['contact.imageList'];
					ui.q('home').innerHTML = '';
					var e = ui.q('settings input[name="image"]+img');
					if (e)
						e.setAttribute('src', global.serverImg + user.contact.imageList);
				}
			});
		}
		formFunc.image.remove('image');
		pageSettings.currentSettings = pageSettings.getCurrentSettings();
		bluetooth.reset();
		if (goToID) {
			if (goToID == 'autoOpen')
				pageSettings.preview();
			else
				ui.navigation.goTo(goToID, true);
		}
		var l = ui.val('[name="language"]:checked');
		if (l != global.language)
			initialisation.setLanguage(l);
		ui.css('settings save', 'display', '');
		ui.q('homeHeader text').innerText = user.contact.pseudonym;
	}
	static reset() {
		formFunc.resetError(ui.q('input[name="pseudonym"]'));
		formFunc.resetError(ui.q('input[name="email"]'));
		formFunc.resetError(ui.q('input[name="image"]'));
		formFunc.resetError(ui.q('input[name="birthday"]'));
		formFunc.resetError(ui.q('input[name="gender"]'));
		formFunc.resetError(ui.q('textarea[name="aboutMe"]'));
		formFunc.resetError(ui.q('textarea[name="urls"]'));
		formFunc.resetError(ui.q('#settingsInterest1'));
		formFunc.resetError(ui.q('#settingsInterest2'));
		formFunc.resetError(ui.q('#settingsInterest3'));
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
		if (ui.q('settings input[name="genderInterest1"]:checked') ||
			ui.q('settings input[name="genderInterest2"]:checked') ||
			ui.q('settings input[name="genderInterest3"]:checked')) {
			var e = ui.q('settings [name="birthday"]');
			if (!e.value)
				formFunc.setError(e, 'settings.bdayUsingInterrestedIn');
			if (!ui.q('settings [name="gender"]:checked'))
				formFunc.setError(ui.q('settings [name="gender"]'), 'settings.genderUsingInterrestedIn');
		}
		if (ui.q('settings [name="birthday"]').parentNode.lastChild.tagName != 'ERRORHINT')
			formFunc.validation.birthday(ui.q('input[name="birthday"]'));
		if (ui.q('input[name="guide"]:checked') && !ui.val('textarea[name="aboutMe"]'))
			formFunc.setError(ui.q('textarea[name="aboutMe"]'), 'settings.aboutMeEmpty');
		else if (ui.val('textarea[name="aboutMe"]'))
			formFunc.validation.filterWords(ui.q('textarea[name="aboutMe"]'));
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
				ui.navigation.openPopup(ui.l('attention'), ui.l('settings.confirmEmailChange') + '<br /><buttontext class="bgColor" onclick="pageSettings.save(&quot;' + goToID + '&quot;,true);ui.navigation.closePopup()" style="margin-top:1em;">' + ui.l('Yes') + '</buttontext><buttontext class="bgColor" onclick="pageSettings.resetEmailToOldValue()" style="margin-top:1em;">' + ui.l('No') + '</buttontext>');
				return false;
			}
		}
		if (!ui.q('input[name="genderInterest1"]:checked'))
			ui.q('#settingsInterest1').value = '';
		if (!ui.q('input[name="genderInterest2"]:checked'))
			ui.q('#settingsInterest2').value = '';
		if (!ui.q('input[name="genderInterest3"]:checked'))
			ui.q('#settingsInterest3').value = '';
		ui.q('textarea[name="aboutMe"]').value = ui.val('textarea[name="aboutMe"]').replace(/</g, '&lt;');
		ui.q('input[name="email"]').value = ui.val('input[name="email"]').trim().toLowerCase();
		var t = hashtags.convert(ui.q('settings textarea[name="hashtagsDisp"]').value);
		ui.q('settings input[name="skills"]').value = t.category;
		ui.q('settings input[name="skillsText"]').value = t.hashtags;
		user.save(formFunc.getForm('settings tabBody'), () => pageSettings.postSave(goToID));
	}
	static selectTab(i) {
		ui.classRemove('settings tab', 'tabActive');
		ui.classAdd(ui.qa('settings tab')[i], 'tabActive');
		ui.q('settings tabBody').style.marginLeft = i * -100 + '%';
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
			lists.loadList('query=contact_listBlocked&limit=0', pageSettings.listContactsBlocked);
			lists.loadList('query=location_listBlocked&limit=0', pageSettings.listLocationsBlocked);
			lists.loadList('query=event_listBlocked&limit=0', pageSettings.listLocationsBlocked);
		}
	}
	static toggleGenderSlider(e) {
		ui.css(ui.q('#settingsInterest' + e).nextElementSibling, 'display', ui.q('input[name="genderInterest' + e + '"]').checked ? 'block' : 'none');
	}
	static unblock(id, blockId) {
		if (!ui.q('popup [i="' + id + '"]')) {
			ui.navigation.openPopup(ui.l('attention'), ui.l('contacts.unblock').replace('{0}', ui.q('#blocked row[i="' + id + '"] title').innerText) + '<br /><br /><buttontext class="bgColor" i="' + id + '" onclick="pageSettings.unblock(' + id + ',' + blockId + ')">' + ui.l('Yes') + '</buttontext>');
			return;
		}
		communication.ajax({
			url: global.server + 'db/one',
			method: 'DELETE',
			body: { classname: 'Block', id: blockId },
			success() {
				var e = ui.q('settings #blocked [i="' + id + '"]');
				if (e)
					e.outerHTML = '';
				ui.navigation.closePopup();
				e = ui.q('settings #blocked');
				e.removeAttribute('h');
				if (!ui.q('settings #blocked row'))
					ui.css(e, 'display', 'none');
			}
		});
	}
};