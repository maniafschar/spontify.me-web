import { bluetooth } from './bluetooth';
import { communication } from './communication';
import { global } from './global';
import { initialisation } from './initialisation';
import { Contact, model } from './model';
import { pageInfo } from './pageInfo';
import { pageContact } from './pageContact';
import { ui, formFunc } from './ui';
import { user } from './user';
import { pageWhatToDo } from './pageWhatToDo';
import { details } from './details';
import { intro } from './intro';

export { pageSettings };

class pageSettings {
	static currentSettings = null;
	static currentSettings3 = null;
	static templateSettings1 = v =>
		global.template`<form name="myProfile">
	<field>
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
			<input type="file" name="image" hint="${ui.l('settings.imageHint')}" accept=".gif, .png, .jpg" />
		</value>
	</field>
	<field>
		<label>${ui.l('settings.guide')}</label>
		<value class="checkbox">
			<input type="checkbox" name="guide" value="true" label="${ui.l('settings.guideCheckbox')}"
				${v['guide']} />
			<explain>${ui.l('settings.guideCheckboxHint')}</explain>
		</value>
	</field>
	<field>
		<label>${ui.l('settings.aboutMe')}</label>
		<value>
			<textarea name="aboutMe" maxlength="250">${v['contact.aboutMe']}</textarea>
		</value>
	</field>
	<field>
		<label>${ui.l('birthday')}</label>
		<value class="checkbox">
			<input type="date" placeholder="TT.MM.JJJJ" name="birthday" maxlength="10" id="bd"
				value="${v['birthday']}" />
			<input type="radio" name="birthdayDisplay" value="2" label="${ui.l('settings.showBirthday')}"
				${v['birthdayDisplay2']} style="margin-top:0.5em;"/>
			<input type="radio" name="birthdayDisplay" value="1" label="${ui.l('settings.showAge')}"
				${v['birthdayDisplay1']} />
		</value>
	</field>
	<field>
		<label>${ui.l('gender')}</label>
		<value class="checkbox">
			<input type="radio" name="gender" value="2" label="${ui.l('female')}" ${v['gender2']} />
			<input type="radio" name="gender" value="1" label="${ui.l('male')}" ${v['gender1']} />
			<input type="radio" name="gender" value="3" label="${ui.l('divers')}" ${v['gender3']} />
		</value>
	</field>
	<field>
		<label>${ui.l('settings.genderInterest')}</label>
		<value>
			<input type="checkbox" name="genderInterest2" label="${ui.l('settings.genderInterestFemale')}"
				onclick="pageSettings.toggleGenderSlider(2)" ${v['genderInterest2']} transient="true" />
			<input type="text" id="settingsInterest2" slider="range" min="18" max="99" value="${v['contact.ageFemale']}"
				name="ageFemale" />
			<br />
			<input type="checkbox" name="genderInterest1" label="${ui.l('settings.genderInterestMale')}"
				onclick="pageSettings.toggleGenderSlider(1)" ${v['genderInterest1']} transient="true" />
			<input type="text" id="settingsInterest1" slider="range" min="18" max="99" value="${v['contact.ageMale']}"
				name="ageMale" />
			<br />
			<input type="checkbox" name="genderInterest3" label="${ui.l('settings.genderInterestDivers')}"
				onclick="pageSettings.toggleGenderSlider(3)" ${v['genderInterest3']} transient="true" />
			<input type="text" id="settingsInterest3" slider="range" min="18" max="99" value="${v['contact.ageDivers']}"
				name="ageDivers" />
		</value>
	</field>
	<field>
		<label>${ui.l('settings.budget')}</label>
		<value class="checkbox">
			<input type="checkbox" value="0" name="budget" label="${ui.l('budget')}" ${v['budget0']} />
			<input type="checkbox" value="1" name="budget" label="${ui.l('budget')}${ui.l('budget')}" ${v['budget1']} />
			<input type="checkbox" value="2" name="budget" label="${ui.l('budget')}${ui.l('budget')}${ui.l('budget')}" ${v['budget2']} />
		</value>
	</field>
	<field>
		<label>${ui.l('settings.lang')}</label>
		<value class="checkbox">
			<input type="radio" name="language" value="DE" label="Deutsch" ${v['langDE']} />
			<input type="radio" name="language" value="EN" label="English" ${v['langEN']} />
		</value>
	</field>
	<field>
		<label>${ui.l('settings.search')}</label>
		<value class="checkbox">
			<input type="checkbox" name="search" value="true" label="${ui.l('settings.searchPseudonym')}" ${v['search']} />
			<explain>${ui.l('settings.searchPseudonymHint')}</explain>
		</value>
	</field>
	<dialogButtons style="margin-top:1.5em;">
		<buttontext onclick="communication.login.logoff()" class="bgColor">${ui.l('logoff.title')}</buttontext>
		<buttontext onclick="pageSettings.preview()" class="bgColor">${ui.l('settings.preview')}</buttontext>
	</dialogButtons>
	<input type="hidden" name="verified" value="true" />
</form>
<settingsNav onclick="pageSettings.open2(event)" style="float:right;">></settingsNav>`;
	static templateSettings2 = v =>
		global.template`<div style="padding-top:1em;text-align:center;">${ui.l('attributesHint')}</div>
<div>
    <buttontext class="bgColor settings2Button"
        onclick="formFunc.openChoices(&quot;CONTACTATTRIB&quot;,&quot;pageSettings.saveAttributes&quot;)">${ui.l('settings.attributes')}</buttontext>
    <attributesDisplay>
        <input type="text" id="CONTACTATTRIB" multiplePopup="Attributes" saveAction="pageSettings.saveAttributes"
            valueEx="${v['attEx']}" value="${v['att']}" max="60" maxEx="250" />
    </attributesDisplay>
</div>
<div>
    <buttontext class="bgColor settings2Button"
        onclick="formFunc.openChoices(&quot;CONTACTATTRIBINTEREST&quot;,&quot;pageSettings.saveAttributes&quot;)">${ui.l('settings.interestedIn')}</buttontext>
    <attributesDisplay>
        <input type="text" id="CONTACTATTRIBINTEREST" multiplePopup="Attributes"
            saveAction="pageSettings.saveAttributes" valueEx="${v['attIntEx']}" value="${v['attInt']}" max="60"
            maxEx="250" />
    </attributesDisplay>
</div>
<div>
    <buttontext class="bgColor settings2Button"
        onclick="formFunc.openChoices(&quot;CONTACTATTRIB0&quot;,&quot;pageSettings.saveAttributes&quot;)">${ui.categories[0].label}</buttontext>
    <attributesDisplay>
        <input type="text" id="CONTACTATTRIB0" multiplePopup="Attributes0" saveAction="pageSettings.saveAttributes"
            valueEx="${v['att0Ex']}" value="${v['att0']}" max="60" maxEx="250" />
    </attributesDisplay>
</div>
<div>
    <buttontext class="bgColor settings2Button"
        onclick="formFunc.openChoices(&quot;CONTACTATTRIB1&quot;,&quot;pageSettings.saveAttributes&quot;)">${ui.categories[1].label}</buttontext>
    <attributesDisplay>
        <input type="text" id="CONTACTATTRIB1" multiplePopup="Attributes1" saveAction="pageSettings.saveAttributes"
            valueEx="${v['att1Ex']}" value="${v['att1']}" max="60" maxEx="250" />
    </attributesDisplay>
</div>
<div>
    <buttontext class="bgColor settings2Button"
        onclick="formFunc.openChoices(&quot;CONTACTATTRIB2&quot;,&quot;pageSettings.saveAttributes&quot;)">${ui.categories[2].label}</buttontext>
    <attributesDisplay>
        <input type="text" id="CONTACTATTRIB2" multiplePopup="Attributes2" saveAction="pageSettings.saveAttributes"
            valueEx="${v['att2Ex']}" value="${v['att2']}" max="60" maxEx="250" />
    </attributesDisplay>
</div>
<div>
    <buttontext class="bgColor settings2Button"
        onclick="formFunc.openChoices(&quot;CONTACTATTRIB3&quot;,&quot;pageSettings.saveAttributes&quot;)">${ui.categories[3].label}</buttontext>
    <attributesDisplay>
        <input type="text" id="CONTACTATTRIB3" multiplePopup="Attributes3" saveAction="pageSettings.saveAttributes"
            valueEx="${v['att3Ex']}" value="${v['att3']}" max="60" maxEx="250" />
    </attributesDisplay>
</div>
<div>
    <buttontext class="bgColor settings2Button"
        onclick="formFunc.openChoices(&quot;CONTACTATTRIB4&quot;,&quot;pageSettings.saveAttributes&quot;)">${ui.categories[4].label}</buttontext>
    <attributesDisplay>
        <input type="text" id="CONTACTATTRIB4" multiplePopup="Attributes4" saveAction="pageSettings.saveAttributes"
            valueEx="${v['att4Ex']}" value="${v['att4']}" max="60" maxEx="250" />
    </attributesDisplay>
</div>
<div>
    <buttontext class="bgColor settings2Button"
        onclick="formFunc.openChoices(&quot;CONTACTATTRIB5&quot;,&quot;pageSettings.saveAttributes&quot;)">${ui.categories[5].label}</buttontext>
    <attributesDisplay>
        <input type="text" id="CONTACTATTRIB5" multiplePopup="Attributes5" saveAction="pageSettings.saveAttributes"
            valueEx="${v['att5Ex']}" value="${v['att5']}" max="60" maxEx="250" />
    </attributesDisplay>
</div>
<settingsNav onclick="ui.navigation.goTo(&quot;settings&quot;,event,true)" style="float:left;">&lt;</settingsNav>
<settingsNav onclick="ui.navigation.goTo(&quot;settings3&quot;,event)" style="float:right;">></settingsNav>`;
	static templateSettings3 = v =>
		global.template`<buttontext class="bgColor settings2Button" onclick="pageInfo.toggleInfoBlock(&quot;#settings3Notifications&quot;)">${ui.l('wtd.myNotifications')}</buttontext><br/>
<div class="notification" id="settings3Notifications" style="display:none;">
	<div style="margin:0 0.5em 1em 0.5em;">
		<form name="myProfile3">
			<input type="checkbox" value="true" name="notificationChat" label="${ui.l('notification.chat')}" ${v['contact.notificationChat']}>
			<br />
			<input type="checkbox" value="true" name="notificationFriendRequest" label="${ui.l('notification.friendRequest')}" ${v['contact.notificationFriendRequest']}>
			<br />
			<input type="checkbox" value="true" name="notificationBirthday" label="${ui.l('notification.birthday')}" ${v['contact.notificationBirthday']}>
			<br />
			<input type="checkbox" value="true" name="notificationVisitProfile" label="${ui.l('notification.visitProfile')}" ${v['contact.notificationVisitProfile']}>
			<br />
			<input type="checkbox" value="true" name="notificationVisitLocation" label="${ui.l('notification.visitLocation')}" ${v['contact.notificationVisitLocation']}>
			<br />
			<input type="checkbox" value="true" name="notificationMarkEvent" label="${ui.l('notification.markEvent')}" ${v['contact.notificationMarkEvent']}>
		</form>
	</div>
</div>
<buttontext class="bgColor settings2Button" onclick="pageSettings.toggleBlocked()">${ui.l('contacts.blocked')}</buttontext><br/>
<div id="blocked" style="display:none;"></div>
<buttontext onclick="pageSettings.deleteProfile()" class="bgColor settings2Button">${ui.l('settings.delete')}</buttontext><br/>
<settingsNav onclick="ui.navigation.goTo(&quot;settings2&quot;,event,true)" style="float:left;">&lt;</settingsNav>`;

	static checkUnique() {
		if (user.email == ui.val('input[name="email"]'))
			formFunc.resetError(ui.q('input[name="email"]'));
		else
			communication.login.checkUnique(ui.q('input[name="email"]'));
	}
	static deleteProfile() {
		ui.navigation.openPopup(ui.l('settings.delete'), ui.l('deleteProfileHint') + '<br /><br /><textarea id="deleteAccountFeedback" placeholder="' + ui.l('deleteProfileFeedbackHint') + '" maxlength="2000"></textarea><div style="margin-top:1em;"><buttontext onclick="pageSettings.deleteProfileExec()" class="bgColor">' + ui.l('deleteProfileFinal') + '</buttontext></div>');
	}
	static deleteProfileExec() {
		if (ui.val('#deleteAccountFeedback'))
			pageInfo.sendFeedback('Delete Account Reason:\n' + ui.val('#deleteAccountFeedback'), pageSettings.deleteProfileExec2);
		else
			pageSettings.deleteProfileExec2();
	}
	static deleteProfileExec2() {
		communication.ajax({
			url: global.server + 'authentication/one',
			method: 'DELETE',
			success(r) {
				communication.login.resetAfterLogoff(true);
			}
		});
	}
	static getCurrentSettings3String() {
		var s = '' + (ui.q('settings3 [name="notificationChat"]:checked') ? 1 : 0);
		s += (ui.q('settings3 [name="notificationFriendRequest"]:checked') ? 1 : 0);
		s += (ui.q('settings3 [name="notificationBirthday"]:checked') ? 1 : 0);
		s += (ui.q('settings3 [name="notificationVisitProfile"]:checked') ? 1 : 0);
		s += (ui.q('settings3 [name="notificationVisitLocation"]:checked') ? 1 : 0);
		s += (ui.q('settings3 [name="notificationMarkEvent"]:checked') ? 1 : 0);
		return s;
	}
	static getCurrentSettingsString() {
		var s = ui.val('input[name="email"]') + '\u0015';
		s += ui.q('[name="image_disp"] img') + '\u0015';
		s += ui.val('textarea[name="aboutMe"]') + '\u0015';
		s += ui.val('input[name="birthday"]') + '\u0015';
		s += ui.val('input[name="birthdayDisplay"]:checked') + '\u0015';
		s += ui.val('input[name="gender"]:checked') + '\u0015';
		s += ui.val('input[name="ageFemale"]') + '\u0015';
		s += ui.val('input[name="ageMale"]') + '\u0015';
		s += ui.val('input[name="ageDivers"]') + '\u0015';
		s += (ui.q('input[name="genderInterest1"]:checked') ? 1 : 0) + '\u0015';
		s += (ui.q('input[name="genderInterest2"]:checked') ? 1 : 0) + '\u0015';
		s += (ui.q('input[name="genderInterest3"]:checked') ? 1 : 0) + '\u0015';
		s += ui.val('input[name="language"]:checked') + '\u0015';
		s += (ui.q('input[name="search"]:checked') ? 1 : 0) + '\u0015';
		s += (ui.q('input[name="guide"]:checked') ? 1 : 0) + '\u0015';
		s += ui.val('input[name="pseudonym"]') + '\u0015';
		var e = ui.qa('[name="budget"]');
		for (var i = 0; i < e.length; i++) {
			if (e[i].checked)
				s += i;
		}
		return s;
	}
	static getMultiplePopupValues(id) {
		var s = ui.val('#' + id).split(','), s2 = '';
		for (var i = 0; i < s.length; i++) {
			if (s[i].trim().length > 0)
				s2 += '\u0015' + (s[i] < 10 ? '00' : s[i] < 100 ? '0' : '') + Number(s[i]);
		}
		if (s2.length > 0)
			s2 = s2.substring(1);
		return s2;
	}
	static init(exec) {
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
					v['birthday'] = d;
					v['birthdayDisplay2'] = v['contact.birthdayDisplay'] == 2 ? ' checked' : '';
					v['birthdayDisplay1'] = v['contact.birthdayDisplay'] == 1 ? ' checked' : '';
					v['birthdayDisplay0'] = v['contact.birthdayDisplay'] == 0 ? ' checked' : '';
					v['contact.notificationChat'] = v['contact.notificationChat'] == 1 ? ' checked' : '';
					v['contact.notificationFriendRequest'] = v['contact.notificationFriendRequest'] == 1 ? ' checked' : '';
					v['contact.notificationBirthday'] = v['contact.notificationBirthday'] == 1 ? ' checked' : '';
					v['contact.notificationVisitProfile'] = v['contact.notificationVisitProfile'] == 1 ? ' checked' : '';
					v['contact.notificationVisitLocation'] = v['contact.notificationVisitLocation'] == 1 ? ' checked' : '';
					v['contact.notificationMarkEvent'] = v['contact.notificationMarkEvent'] == 1 ? ' checked' : '';
					v['langDE'] = v['contact.language'] == 'DE' ? ' checked' : '';
					v['langEN'] = v['contact.language'] == 'EN' ? ' checked' : '';
					v['budget0'] = v['contact.budget'] && v['contact.budget'].indexOf('0') > -1 ? ' checked' : '';
					v['budget1'] = v['contact.budget'] && v['contact.budget'].indexOf('1') > -1 ? ' checked' : '';
					v['budget2'] = v['contact.budget'] && v['contact.budget'].indexOf('2') > -1 ? ' checked' : '';
					v['gender1'] = v['contact.gender'] == 1 ? ' checked' : '';
					v['gender2'] = v['contact.gender'] == 2 ? ' checked' : '';
					v['gender3'] = v['contact.gender'] == 3 ? ' checked' : '';
					v['guide'] = v['contact.guide'] == 1 ? ' checked' : '';
					if (user.contact.image)
						v['userImage'] = global.serverImg + user.contact.image;
					else
						v['userImage'] = 'images/defaultProfile.png';
					if (v['contact.search'] == 1)
						v['search'] = ' checked';
					if (v['contact.ageMale'])
						v['genderInterest1'] = 'checked';
					if (v['contact.ageFemale'])
						v['genderInterest2'] = 'checked';
					if (v['contact.ageDivers'])
						v['genderInterest3'] = 'checked';
					v['forever'] = window.localStorage.getItem('autoLogin') ? '' : 'display:none;';
					ui.html('settings', pageSettings.templateSettings1(v));
					formFunc.initFields('settings');
					if (!v['contact.ageFemale'])
						ui.css(ui.q('#settingsInterest2').nextElementSibling, 'display', 'none');
					if (!v['contact.ageMale'])
						ui.css(ui.q('#settingsInterest1').nextElementSibling, 'display', 'none');
					if (!v['contact.ageDivers'])
						ui.css(ui.q('#settingsInterest3').nextElementSibling, 'display', 'none');
					pageSettings.init2();
					pageSettings.currentSettings = pageSettings.getCurrentSettingsString();
					if (exec)
						exec.call()
					ui.q('settings3').innerHTML = pageSettings.templateSettings3(v);
					formFunc.initFields('settings3');
					pageSettings.currentSettings3 = pageSettings.getCurrentSettings3String();
				}
			});
			if (!user.contact.attr && !user.contact.attr
				&& !user.contact.attrInterest && !user.contact.attrInterestEx
				&& !user.contact.attr0 && !user.contact.attrEx0
				&& !user.contact.attr1 && !user.contact.attrEx1
				&& !user.contact.attr2 && !user.contact.attrEx2
				&& !user.contact.attr3 && !user.contact.attrEx3
				&& !user.contact.attr4 && !user.contact.attrEx4
				&& !user.contact.attr5 && !user.contact.attrEx5) {
				if (ui.navigation.getActiveID() == 'settings')
					setTimeout(function () {
						if (ui.navigation.getActiveID() == 'settings')
							intro.openHint({ desc: 'goToSettings2', pos: '-1em,-5em', size: '60%,auto', onclick: 'ui.navigation.goTo(\'settings2\')' });
					}, 10000);
				else if (ui.navigation.getActiveID() == 'settings2')
					setTimeout(function () {
						if (ui.navigation.getActiveID() == 'settings2' && ui.cssValue('popup', 'display') == 'none')
							intro.openHint({ desc: 'settings2', pos: '1.5em,9em', size: '40%,auto', hinkyClass: 'top', hinky: 'left:1em' });
					}, 2000);
			}
			return true;
		}
	}
	static init2() {
		var v = [];
		v['att'] = user.contact.attr ? user.contact.attr.replace(/\u0015/g, ',') : '';
		v['attInt'] = user.contact.attrInterest ? user.contact.attrInterest.replace(/\u0015/g, ',') : '';
		for (var i = 0; i < ui.categories.length; i++)
			v['att' + i] = user.contact['attr' + i] ? user.contact['attr' + i].replace(/\u0015/g, ',') : '';
		v['attEx'] = user.contact.attrEx;
		v['attIntEx'] = user.contact.attrInterestEx;
		for (var i = 0; i < ui.categories.length; i++)
			v['att' + i + 'Ex'] = user.contact['attr' + i + 'Ex'] ? user.contact['attr' + i + 'Ex'].replace(/\u0015/g, ',') : '';
		ui.html('settings2', pageSettings.templateSettings2(v));
		formFunc.initFields('settings2');
	}
	static listContactsBlocked(l) {
		l[0].push('_message1');
		l[0].push('_message2');
		var v;
		for (var i = 1; i < l.length; i++) {
			v = model.convert(new Contact(), l, i);
			l[i].push(v.contactBlock.reason ? ui.l('contacts.blockReason' + v.contactBlock.reason) : '&nbsp;');
			l[i].push(v.contactBlock.note ? v.contactBlock.note : '&nbsp;');
		}
		var s = pageContact.listContactsInternal(l);
		var e = ui.q('#blocked');
		e.innerHTML = s ? s : '<div style="padding:0.5em;">' + ui.l('noResults.block') + '</div>';
		ui.toggleHeight(e);
	}
	static open2() {
		pageSettings.init();
		ui.navigation.goTo('settings2');
	}
	static preview() {
		if (pageSettings.currentSettings == pageSettings.getCurrentSettingsString())
			details.open(user.contact.id, 'contact_list&search=' + encodeURIComponent('contact.id=' + user.contact.id), pageContact.detail);
		else
			pageSettings.save('autoOpen');
	}
	static postSave(goToID) {
		if (pageSettings.currentSettings && pageSettings.currentSettings.split('\u0015')[0] != ui.val('input[name="email"]')) {
			communication.login.logoff();
			return;
		}
		user.contact.ageFemale = ui.val('input[name="ageFemale"]');
		user.contact.ageMale = ui.val('input[name="ageMale"]');
		user.contact.ageDivers = ui.val('input[name="ageDivers"]');
		user.contact.budget = ui.val('input[name="budget"]:checked');
		user.contact.pseudonym = ui.val('input[name="pseudonym"]');
		user.contact.gender = ui.val('input[name="gender"]:checked');
		ui.html('homeUsername', user.contact.pseudonym);
		if (ui.q('[name="image_disp"] img')) {
			communication.ajax({
				url: global.server + 'db/one?query=contact_list&search=' + encodeURIComponent('contact.id=' + user.contact.id),
				responseType: 'json',
				success(r) {
					user.contact.image = r['contact.image'];
					user.contact.imageList = r['contact.imageList'];
				}
			});
		}
		formFunc.image.remove('image');
		pageSettings.currentSettings = pageSettings.getCurrentSettingsString();
		pageSettings.resetError();
		if (goToID) {
			if (goToID == 'autoOpen')
				pageSettings.preview();
			else ui.navigation.goTo(goToID, null, true);
		}
		var l = ui.val('[name="language"]:checked');
		if (l != global.language)
			initialisation.setLanguage(l);
	}
	static resetError() {
		formFunc.resetError(ui.q('input[name="pseudonym"]'));
		formFunc.resetError(ui.q('input[name="email"]'));
		formFunc.resetError(ui.q('input[name="image"]'));
		formFunc.resetError(ui.q('input[name="birthday"]'));
		formFunc.resetError(ui.q('input[name="gender"]'));
		formFunc.resetError(ui.q('textarea[name="aboutMe"]'));
		formFunc.resetError(ui.q('#settingsInterest1'));
		formFunc.resetError(ui.q('#settingsInterest2'));
		formFunc.resetError(ui.q('#settingsInterest3'));
	}
	static resetEmailToOldValue() {
		ui.q('input[name="email"]').value = pageSettings.currentSettings.split('\u0015')[0];
		ui.navigation.hidePopup();
	}
	static save(goToID, saveNewEmail) {
		pageSettings.resetError();
		if (!user.contact || pageSettings.currentSettings == pageSettings.getCurrentSettingsString())
			return true;
		ui.html('#settingsHint', '');
		if (ui.q('settings input[name="genderInterest1"]:checked') ||
			ui.q('settingsinput[name="genderInterest2"]:checked') ||
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
		formFunc.validation.email(ui.q('input[name="email"]'));
		formFunc.validation.pseudonym(ui.q('input[name="pseudonym"]'));
		if (!ui.q('settings .dialogFieldError')) {
			if (pageSettings.currentSettings && pageSettings.currentSettings.split('\u0015')[0] != ui.val('input[name="email"]')) {
				if (saveNewEmail)
					ui.q('input[name="verified"]').value = 'false';
				else {
					ui.navigation.openPopup(ui.l('attention'), ui.l('settings.confirmEmailChange') + '<br /><buttontext class="bgColor" onclick="pageSettings.save(&quot;' + goToID + '&quot;,true);ui.navigation.hidePopup()" style="margin-top:1em;">' + ui.l('Yes') + '</buttontext><buttontext class="bgColor" onclick="pageSettings.resetEmailToOldValue()" style="margin-top:1em;">' + ui.l('No') + '</buttontext>');
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
			user.save(formFunc.getForm('myProfile'), () => pageSettings.postSave(goToID));
		}
		return false;
	}
	static save3() {
		if (!user.contact || pageSettings.currentSettings3 && pageSettings.currentSettings3 == pageSettings.getCurrentSettings3String())
			return true;
		user.save(formFunc.getForm('myProfile3'), () => pageSettings.currentSettings3 = pageSettings.getCurrentSettings3String());
	}
	static saveAttributes() {
		var v = { values: {} };
		for (var i = 0; i < ui.categories.length; i++) {
			v.values['attr' + i] = pageSettings.getMultiplePopupValues('CONTACTATTRIB' + i);
			v.values['attr' + i + 'Ex'] = ui.q('#CONTACTATTRIB' + i).getAttribute('valueEx');
		}
		v.values['attr'] = pageSettings.getMultiplePopupValues('CONTACTATTRIB');
		v.values['attrInterest'] = pageSettings.getMultiplePopupValues('CONTACTATTRIBINTEREST');
		v.values['attrEx'] = ui.q('#CONTACTATTRIB').getAttribute('valueEx');
		v.values['attrInterestEx'] = ui.q('#CONTACTATTRIBINTEREST').getAttribute('valueEx');
		user.save(v, function () {
			user.contact.attr = pageSettings.getMultiplePopupValues('CONTACTATTRIB');
			user.contact.attrInterest = pageSettings.getMultiplePopupValues('CONTACTATTRIBINTEREST');
			for (var i = 0; i < ui.categories.length; i++)
				user.contact['attr' + i] = pageSettings.getMultiplePopupValues('CONTACTATTRIB' + i);
			user.contact.attrEx = ui.q('#CONTACTATTRIB').getAttribute('valueEx');
			user.contact.attrInterestEx = ui.q('#CONTACTATTRIBINTEREST').getAttribute('valueEx');
			for (var i = 0; i < ui.categories.length; i++)
				user.contact['attr' + i + 'Ex'] = ui.q('#CONTACTATTRIB' + i).getAttribute('valueEx');
			bluetooth.reset();
			ui.html('whatToDo', '');
			pageWhatToDo.init();
		});
	}
	static setChoicesSelection(id, v) {
		ui.q('#' + id).value = v;
		setTimeout(function () {
			var e = ui.qa('input[name="inputHelper' + id + '"]');
			for (var i = 0; i < e.length; i++)
				e[i].checked = false;
		}, 1000);
	}
	static toggleBlocked() {
		var e = ui.q('#blocked');
		if (e.innerHTML)
			ui.toggleHeight(e, function () {
				ui.css(e, 'display', 'none');
				ui.html(e, '');
			});
		else
			communication.loadList('query=contact_listBlocked', pageSettings.listContactsBlocked);
	}
	static toggleGenderSlider(e) {
		ui.css(ui.q('#settingsInterest' + e).nextElementSibling, 'display', ui.q('input[name="genderInterest' + e + '"]').checked ? 'block' : 'none');
	}
	static unblockUser(id, blockId) {
		if (!ui.q('popup [i="' + id + '"]')) {
			ui.navigation.openPopup(ui.l('attention'), ui.l('contacts.unblock') + '<br /><br /><buttontext class="bgColor" i="' + id + '" onclick="pageSettings.unblockUser(' + id + ',' + blockId + ')">' + ui.l('Yes') + '</buttontext>');
			return;
		}
		communication.ajax({
			url: global.server + 'db/one',
			method: 'DELETE',
			body: { classname: 'ContactBlock', id: blockId },
			success() {
				ui.q('#blocked [i="' + id + '"]').outerHTML = '';
				ui.navigation.hidePopup();
				ui.q('infoblock#blocked').removeAttribute('h');
				if (!ui.q('settings3 #blocked row'))
					ui.css('settings3 #blocked', 'display', 'none');
			}
		});
	}
};