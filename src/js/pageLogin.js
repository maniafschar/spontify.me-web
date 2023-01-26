import { communication } from './communication';
import { global } from './global';
import { formFunc, ui } from './ui';

export { pageLogin };

class pageLogin {
	static timestamp = new Date().getTime();
	static template = v =>
		global.template`<tabHeader>
	<tab onclick="pageLogin.setTab1()" class="tabActive">
		${ui.l('login.action')}
	</tab>
	<tab onclick="pageLogin.setTab2()">
		${ui.l('login.passwordForgotten')}
	</tab>
	<tab onclick="pageLogin.setTab3()">
		${ui.l('login.register')}
	</tab>
</tabHeader>
<tabBody>
<form>
	<field>
		<label>${ui.l('email')}</label>
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
		<value style="text-align:center;">
			<input type="checkbox" name="autoLogin" value="1" label="${ui.l('login.keepmeloggedon')}" ${v['keepLoggedIn']} />
		</value>
	</field>
	<dialogButtons>
		<buttontext onclick="pageLogin.fromForm()" class="bgColor defaultButton">
			${ui.l('login.action')}
		</buttontext>
		<div style="padding:2em 0 1em 0;">${ui.l('login.alternative')}</div>
		<buttontext onclick="communication.login.openFB()" class="bgColor">
			Facebook
		</buttontext>
		<br />
		<br />
		<br />
		<buttontext onclick="communication.login.openApple()" class="loginExternal"
			style="background:black;color:white;${v['hideApple']}">
			<svg xmlns="http://www.w3.org/2000/svg" width="1em" viewBox="0 0 170 170" version="1.1" height="1em">
				<path
					d="m150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929 0.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.429 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239 7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22 17.731-18.1 31.002 0.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-0.9 2.61-1.85 5.11-2.86 7.51zm-31.26-123.01c0 8.1021-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071 12.375-0.119-0.972-0.188-1.995-0.188-3.07 0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.3113 11.45-8.597 4.62-2.2516 8.99-3.4968 13.1-3.71 0.12 1.0831 0.17 2.1663 0.17 3.2409z"
					fill="#FFF" />
			</svg>&nbsp;&nbsp;Sign in with Apple
		</buttontext>
	</dialogButtons>
</form>
<form name="loginRecover" onsubmit="return false">
	<field>
		<label>${ui.l('email')}</label>
		<value>
			<input type="email" name="email" value="${v.email}" maxlength="100" />
		</value>
	</field>
	<dialogButtons>
		<br/>
		<buttontext onclick="pageLogin.recoverPasswordSendEmail()" class="bgColor defaultButton">
		${ui.l('login.recoverPassword')}
		</buttontext>
	</dialogButtons>
	<errorHint></errorHint>
</form>
<form name="loginRegister" onsubmit="return false">
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
			<input type="text" name="pseudonym" value="${v.pseudonym}" maxlength="30"
				onblur="pageLogin.validatePseudonym()" />
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
            <input type="checkbox" value="true" ${v.agb} name="agb" label="${ui.l('login.legal')}"
				onclick="pageLogin.validateAGB()" />
        </value>
    </field>
    <dialogButtons>
		<br/>
		<buttontext onclick="pageLogin.register()" class="bgColor defaultButton">
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
	<registerHint onclick="pageLogin.toggleRegistrationHints()">${ui.l('login.hints')}</registerHint>
</form>
</tabBody>`;

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
			communication.login.login(u.value, p.value, ui.q('[name="autoLogin"]:checked'));
	}
	static getDraft() {
		var v = window.localStorage && window.localStorage.getItem('login');
		if (v)
			try {
				return JSON.parse(v);
			} catch (e) {
			}
		return {};
	}
	static goToLogin() {
		if (ui.navigation.getActiveID() == 'login') {
			var e = ui.qa('.defaultButton');
			for (var i = 0; i < e.length; i++) {
				if (ui.cssValue(e[i], 'display') != 'none') {
					e[i].click();
					break;
				}
			}
		} else
			ui.navigation.goTo('login');
	}
	static init() {
		if (!ui.q('login').innerHTML) {
			ui.q('login').innerHTML = pageLogin.template(pageLogin.getDraft());
			formFunc.initFields('login');
		}
	}
	static toggleRegistrationHints() {
		var e = ui.q('registerHint');
		ui.css(e, 'transform', ui.cssValue(e, 'transform').indexOf('1') > -1 ? 'scale(0)' : 'scale(1)');
	}
	static recoverPasswordSendEmail() {
		var email = ui.qa('input[name="email"]')[1];
		formFunc.resetError(email);
		var b = -1;
		if (!email.value)
			b = formFunc.setError(email, 'settings.noEmail');
		if (b == -1 && formFunc.validation.email(email) == -1)
			communication.login.recoverPasswordSendEmail(email.value);
	}
	static recoverPasswordSetNew() {
		if (!ui.navigation.openPopup(ui.l('login.changePassword'), '<span>' + ui.l('login.changePasswordBody') + '</span><field><label>' + ui.l('login.password') + '</label><value><input type="password" name="passwd" maxlength="30"></value></field><dialogButtons><buttontext class="bgColor" onclick="communication.login.recoverPasswordSetNew()">' + ui.l('login.changePassword') + '</buttontext></dialogButtons><popupHint></popupHint>', 'communication.login.warningRegNotComplete()', true))
			setTimeout(pageLogin.recoverPasswordSetNew, 500);
	}
	static register() {
		formFunc.validation.email(ui.q('input[name="email"]'));
		pageLogin.validatePseudonym();
		pageLogin.validateAGB();
		formFunc.validation.birthday(ui.q('input[name="birthday"]'));
		if (!ui.q('form[name=loginRegister] errorHint')) {
			var e = ui.q('input[name="name"]');
			if (e)
				ui.attr(e, 'name', 'time');
			ui.q('input[name="time"]').value = new Date().getTime() - pageLogin.timestamp;
			ui.q('input[name="language"]').value = global.language;
			ui.q('input[name="version"]').value = global.appVersion;
			ui.q('input[name="device"]').value = global.getDevice();
			ui.q('input[name="os"]').value = global.getOS();
			communication.ajax({
				url: global.server + 'authentication/register',
				body: formFunc.getForm('form[name=loginRegister]').values,
				method: 'POST',
				error(r) {
					communication.login.checkUnique(ui.q('login tabBody form[name="loginRegister"] input[name="email"]'));
				},
				success(r) {
					ui.q('login tabBody form[name="loginRegister"]').innerHTML = '<div style="padding:2em;">' + ui.l('register.success') + '</div>';
					communication.login.removeCredentials();
				}
			});
		}
	}
	static saveDraft() {
		var v = formFunc.getForm('login form:nth-child(3)').values;
		v.email = ui.qa('login tabBody input[name="email"]')[parseInt(ui.q('login tabBody').style.marginLeft || 0) / -100].value;
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
	static setTab1() {
		pageLogin.saveDraft();
		ui.classRemove('login tab', 'tabActive');
		ui.classAdd(ui.qa('login tab')[0], 'tabActive');
		var v = [];
		if (!global.isBrowser())
			v['keepLoggedIn'] = ' checked';
		if (global.getOS() != 'ios')
			v['hideApple'] = 'display:none;';
		ui.css('login tabBody', 'margin-left', 0);
		ui.qa('login input[name="email"]')[0].value = pageLogin.getDraft().email;
	}
	static setTab2() {
		pageLogin.saveDraft();
		ui.css('login tabBody', 'margin-left', '-100%');
		ui.classRemove('login tab', 'tabActive');
		ui.classAdd(ui.qa('login tab')[1], 'tabActive');
		ui.qa('login input[name="email"]')[1].value = pageLogin.getDraft().email;
	}
	static setTab3() {
		pageLogin.saveDraft();
		ui.classRemove('login tab', 'tabActive');
		ui.classAdd(ui.qa('login tab')[2], 'tabActive');
		ui.css('login tabBody', 'margin-left', '-200%');
		ui.css('login input[name="name"]', 'position', 'absolute');
		ui.css('login input[name="name"]', 'right', '200%');
		ui.qa('login input[name="email"]')[2].value = pageLogin.getDraft().email;
	}
	static swipeLeft() {
		var x = parseInt(ui.q('login tabBody').style.marginLeft) || 0;
		if (x == -200)
			ui.navigation.goTo('home', false);
		else if (x == -100)
			pageLogin.setTab3();
		else
			pageLogin.setTab2();
	}
	static swipeRight() {
		var x = parseInt(ui.q('login tabBody').style.marginLeft) || 0;
		if (x == 0)
			ui.navigation.goTo('home');
		else if (x == -100)
			pageLogin.setTab1();
		else
			pageLogin.setTab2();
	}
	static validateAGB() {
		var e = ui.q('input[name="agb"]');
		if (e.checked)
			formFunc.resetError(e);
		else
			formFunc.setError(e, 'settings.noAGB');
	}
	static validatePseudonym() {
		formFunc.validation.pseudonym(ui.q('input[name="pseudonym"]'));
	}
}