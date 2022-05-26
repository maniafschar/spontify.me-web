import { communication } from './communication';
import { global } from './global';
import { formFunc, ui } from './ui';

export { pageLogin };

class pageLogin {
	static lastTab = 1;
	static timestamp = new Date().getTime();
	static templateForm = v =>
		global.template`<field>
		<label id="loginDialog">${ui.l('email')}</label>
		<value>
			<input type="email" name="email" maxlength="100" />
		</value>
	</field>
	<field>
		<label>${ui.l('login.password')}</label>
		<value>
			<input type="password" name="password" maxlength="30" />
		</value>
	</field>
	<field>
		<label></label>
		<value>
			<input type="checkbox" name="autoLogin" value="1" label="${ui.l('login.keepmeloggedon')}" ${v['keepLoggedIn']} />
		</value>
	</field>
	<dialogButtons>
		<buttontext onclick="pageLogin.fromForm()" class="bgColor" id="defaultButton">
			${ui.l('login.action')}
		</buttontext>
		<div style="padding:3em 0 1em 0;color:rgb(0,0,100);">${ui.l('login.alternative')}</div>
		<buttontext onclick="communication.login.openFB()" class="bgColor">
			Facebook
		</buttontext>
		<br />
		<br />
		<buttontext onclick="communication.login.openApple()" class="loginExternal"
			style="background:black;${v['hideApple']}">
			<svg xmlns="http://www.w3.org/2000/svg" width="1em" viewBox="0 0 170 170" version="1.1" height="1em">
				<path
					d="m150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929 0.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.429 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239 7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22 17.731-18.1 31.002 0.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-0.9 2.61-1.85 5.11-2.86 7.51zm-31.26-123.01c0 8.1021-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071 12.375-0.119-0.972-0.188-1.995-0.188-3.07 0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.3113 11.45-8.597 4.62-2.2516 8.99-3.4968 13.1-3.71 0.12 1.0831 0.17 2.1663 0.17 3.2409z"
					fill="#FFF" />
			</svg>&nbsp;&nbsp;Sign in with Apple
		</buttontext>
	</dialogButtons>`;
	static templateRecover = v =>
		global.template`<form name="loginRecover">
		<field>
			<label id="loginDialog">${ui.l('email')}</label>
			<value>
				<input type="email" name="email" value="${v.email}" maxlength="100" />
			</value>
		</field>
		<field id="pseudonymRow">
			<label>${ui.l('pseudonym')}</label>
			<value>
				<input type="text" name="pseudonym" value="${v.pseudonym}" maxlength="30" />
			</value>
		</field>
		<dialogButtons style="margin-top:0.5em;">
			<buttontext onclick="pageLogin.recoverPasswordSendEmail()" class="bgColor" id="defaultButton">
			${ui.l('login.recoverPassword')}
			</buttontext>
		</dialogButtons>
	</form>`;
	static templateRegister = v =>
		global.template`<form name="loginRegister" style="width:100%;">
    <field>
        <label>${ui.l('email')}</label>
        <value>
            <input type="email" name="email" value="${v.email}" maxlength="100" size="50"
                onblur="communication.login.checkUnique(this)" />
        </value>
    </field>
    <field>
        <label>${ui.l('pseudonym')}</label>
        <value>
			<input type="text" name="pseudonym" value="${v.pseudonym}" maxlength="30" />
			<input type="text" name="name" value="" maxlength="30" />
			<input type="hidden" name="language" />
			<input type="hidden" name="os" />
			<input type="hidden" name="device" />
			<input type="hidden" name="version" />
        </value>
    </field>
    <field>
        <label>${ui.l('birthday')}</label>
        <value>
            <input type="date" placeholder="TT.MM.JJJJ" name="birthday" value="${v.birthday}" />
        </value>
    </field>
    <field>
        <label>${ui.l('gender')}</label>
        <value>
            <input type="radio" name="gender" ${v.gender1} value="1" deselect="true" label="${ui.l('male')}" style="margin-bottom:0;"/>
            <input type="radio" name="gender" ${v.gender2} value="2" deselect="true" label="${ui.l('female')}" style="margin-bottom:0;"/>
            <input type="radio" name="gender" ${v.gender3} value="3" deselect="true" label="${ui.l('divers')}" style="margin-bottom:0;"/>
        </value>
    </field>
    <field>
        <label>${ui.l('info.legalTitle')}</label>
        <value>
            <input type="checkbox" value="true" ${v.agb} name="agb" label="${ui.l('login.legal')}" />
        </value>
    </field>
    <dialogButtons>
        <buttontext onclick="pageLogin.signUp()" class="bgColor" id="defaultButton">
			${ui.l('login.register')}
        </buttontext>
        <br /><br />
        <buttontext onclick="ui.navigation.openAGB()" class="bgColor" style="margin-left: 0.5em;">
			${ui.l('info.legalTitle')}${global.separator}${ui.l('info.dsgvoTitle')}
        </buttontext>
        <br /><br />
        <buttontext onclick="pageLogin.toggleRegistrationHints()" class="bgColor" style="margin-left: 0.5em;">
			${ui.l('login.hintsTitle')}
        </buttontext>
    </dialogButtons>
</form>
<registerHint onclick="pageLogin.toggleRegistrationHints()">${ui.l('login.hints')}</registerHint>`;
	static templateTabs = () =>
		global.template`<div style="padding-top:2em;">
    <tabHeader>
        <tab onclick="pageLogin.setLoginFormTab1()" style="max-width:30%;">
			${ui.l('login.action')}
        </tab>
        <tab onclick="pageLogin.setLoginFormTab2()" style="max-width:45%;">
			${ui.l('login.passwordForgotten')}
        </tab>
        <tab onclick="pageLogin.setLoginFormTab3()" style="max-width:30%;">
			${ui.l('login.register')}
        </tab>
    </tabHeader>
    <tabBody id="loginBodyDiv"></tabBody>
</div>`;

	static fromForm() {
		var u = ui.q('input[name="email"]');
		var p = ui.q('input[name="password"]');
		formFunc.validation.email(u);
		if (p.value.trim().length < 8)
			formFunc.setError(p, 'settings.passwordWrong');
		else
			formFunc.resetError(p);
		if (ui.q('login .dialogFieldError'))
			p.value = '';
		else
			communication.login.login(u.value, p.value, ui.q('[name="autoLogin"]:checked'), null, true);
	}
	static getDraft() {
		var v = window.localStorage.getItem('login');
		if (v)
			try {
				return JSON.parse(v);
			} catch (e) {
			}
		return {};
	}
	static goToLogin() {
		if (ui.navigation.getActiveID() == 'login') {
			var e = ui.q('#defaultButton');
			if (e)
				e.click();
		} else
			ui.navigation.goTo('login');
	}
	static goToRegister() {
		if (ui.navigation.lastID == 'login')
			ui.navigation.goTo('login', null, true);
	}
	static init() {
		if (ui.q('login').innerHTML.indexOf('loginBodyDiv') < 0) {
			ui.q('login').innerHTML = pageLogin.templateTabs();
			ui.addFastButton('login');
		}
		if (pageLogin.lastTab == 1)
			pageLogin.setLoginFormTab1();
		else if (pageLogin.lastTab == 2)
			pageLogin.setLoginFormTab2();
		else if (pageLogin.lastTab == 3)
			pageLogin.setLoginFormTab3();
	}
	static toggleRegistrationHints() {
		var e = ui.q('registerHint');
		ui.css(e, 'transform', ui.cssValue(e, 'transform').indexOf('1') > -1 ? 'scale(0)' : 'scale(1)');
	}
	static recoverPasswordSendEmail() {
		var email = ui.q('input[name="email"]');
		var pseudonym = ui.q('input[name="pseudonym"]');
		formFunc.resetError(email);
		formFunc.resetError(pseudonym);
		var b = -1;
		if (!email.value)
			b = formFunc.setError(email, 'settings.noEmail');
		if (!pseudonym.value)
			b = formFunc.setError(pseudonym, 'register.errorPseudonym');
		if (b == -1 && formFunc.validation.email(email) == -1)
			communication.login.recoverPasswordSendEmail(email.value, pseudonym.value);
	}
	static recoverPasswordSetNew() {
		ui.navigation.openMenu();
		ui.navigation.openPopup(ui.l('login.changePassword'), '<span style="padding-bottom:1em;display:block;">' + ui.l('login.changePasswordBody') + '</span><field><label>' + ui.l('login.password') + '</label><value><input type="password" name="passwd" maxlength="30"></value></div><dialogButtons><buttontext class="bgColor" onclick="communication.login.recoverPasswordSetNew()">' + ui.l('login.changePassword') + '</buttontext></dialogButtons><popupHint></popupHint>', 'communication.login.warningRegNotComplete()', true);
	}
	static saveDraft() {
		var v;
		if (ui.q('login input[name="agb"]'))
			v = formFunc.getForm('loginRegister').values;
		else {
			v = pageLogin.getDraft();
			var s = ui.val('input[name="pseudonym"]');
			if (s)
				v.pseudonym = s;
			s = ui.val('input[name="email"]');
			if (s)
				v.email = s;
		}
		window.localStorage.setItem('login', JSON.stringify(v));
	}
	static setError(s, resetPW) {
		if (ui.navigation.getActiveID() == 'home')
			ui.navigation.goTo('home');
		if (ui.q('input[name="email"]')) {
			var e = ui.q('input[name="password"]');
			formFunc.setError(e, s);
			if (resetPW)
				e.value = '';
			formFunc.setError(ui.q('input[name="email"]'));
		} else
			ui.navigation.openPopup(ui.l('attention'), ui.l(s));
	}
	static setLoginFormTab1() {
		pageLogin.saveDraft();
		var e = ui.q('#loginBodyDiv').previousElementSibling.children;
		ui.classAdd(e[0], 'tabActive');
		ui.classRemove(e[1], 'tabActive');
		ui.classRemove(e[2], 'tabActive');
		var v = [];
		if (!global.isBrowser())
			v['keepLoggedIn'] = ' checked';
		if (global.getOS() != 'ios')
			v['hideApple'] = 'display:none;';
		ui.q('#loginBodyDiv').innerHTML = pageLogin.templateForm(v);
		formFunc.initFields('#loginBodyDiv');
		if (pageLogin.getDraft().email)
			ui.q('input[name="email"]').value = pageLogin.getDraft().email;
	}
	static setLoginFormTab2() {
		pageLogin.lastTab = 2;
		pageLogin.saveDraft();
		var e = ui.q('#loginBodyDiv').previousElementSibling.children;
		ui.classRemove(e[0], 'tabActive');
		ui.classAdd(e[1], 'tabActive');
		ui.classRemove(e[2], 'tabActive');
		ui.q('#loginBodyDiv').innerHTML = pageLogin.templateRecover(pageLogin.getDraft());
		formFunc.initFields('#loginBodyDiv');
	}
	static setLoginFormTab3() {
		pageLogin.lastTab = 3;
		pageLogin.saveDraft();
		var v = pageLogin.getDraft();
		if (v.gender)
			v['gender' + v.gender] = ' checked';
		if (v.agb)
			v.agb = ' checked';
		var e = ui.q('#loginBodyDiv').previousElementSibling.children;
		ui.classRemove(e[0], 'tabActive');
		ui.classRemove(e[1], 'tabActive');
		ui.classAdd(e[2], 'tabActive');
		ui.html('#loginBodyDiv', pageLogin.templateRegister(v));
		formFunc.initFields('#loginBodyDiv');
		ui.css('input[name="name"]', 'position', 'absolute');
		ui.css('input[name="name"]', 'right', '200%');
	}
	static signUp() {
		formFunc.validation.email(ui.q('input[name="email"]'));
		var e = ui.q('input[name="pseudonym"]');
		e.value = communication.login.getRealPseudonym(e.value);
		if (e.value.length < 8)
			formFunc.setError(e, 'register.errorPseudonym');
		else if (e.value.match(communication.login.regexPW))
			formFunc.setError(e, 'register.errorPseudonymSyntax');
		else
			formFunc.validation.filterWords(e);
		e = ui.q('input[name="agb"]');
		if (e.checked)
			formFunc.resetError(e);
		else
			formFunc.setError(e, 'settings.noAGB');
		formFunc.validation.birthday(ui.q('input[name="birthday"]'));
		if (!ui.q('[name=loginRegister] errorHint')) {
			e = ui.q('input[name="name"]');
			if (e)
				ui.attr(e, 'name', 'time');
			ui.q('input[name="time"]').value = new Date().getTime() - pageLogin.timestamp;
			ui.q('input[name="language"]').value = global.language;
			ui.q('input[name="version"]').value = global.appVersion;
			ui.q('input[name="device"]').value = global.getDevice();
			ui.q('input[name="os"]').value = global.getOS();
			communication.ajax({
				url: global.server + 'authentication/register',
				body: formFunc.getForm('loginRegister').values,
				method: 'POST',
				error(r) {
					communication.login.checkUnique(ui.q('input[name="email"]'));
				},
				success(r) {
					ui.q('login').innerHTML = '<div style="padding:2em;text-align:center;">' + ui.l('register.success') + '<br/><br/><br/><buttontext onclick="pageLogin.init()" class="bgColor">&lt;</buttontext></div>';
					communication.login.removeCredentials();
				}
			});
		}
	}
}