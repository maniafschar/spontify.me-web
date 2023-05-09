import { global } from './global';
import { pageHome } from './pageHome';
import { pageLogin } from './pageLogin';
import { formFunc, ui } from './ui';
import { user } from './user';

export { intro };

class intro {
	static currentStep = -1;
	static lastHint = 0;
	static steps = [];

	static actionDetail() {
		ui.q('search .contacts row[i="3"]').click();
	}
	static actionGoToSearch() {
		ui.navigation.goTo("search");
	}
	static actionLogin() {
		setTimeout(function () { pageLogin.login("alpenherz@fan-club.online", "test1234"); }, 2000);
	}
	static actionSearch() {
		ui.q('search .defaultButton').click();
	}
	static close() {
		intro.currentStep = -1;
		var e = ui.q('hint');
		if (ui.cssValue(e, 'display') != 'block')
			return;
		ui.on(e, 'transitionend', function () {
			e.removeAttribute('style');
			e.removeAttribute('i');
			ui.html(e, '');
		}, true);
		ui.css(e, 'opacity', 0);
	}
	static openHint(data) {
		if (new Date().getTime() / 60000 - intro.lastHint < 4)
			return;
		if (data && data.action)
			eval(data.action);
		var e = ui.q('hint'), body = (data.desc.indexOf(' ') > -1 ? data.desc : ui.l('intro.' + data.desc))
			+ (user.contact || intro.currentStep > -1 || location.pathname.length > 1 ? '' : '<br/><br/><buttontext class="bgColor" onclick="ui.navigation.goTo(&quot;login&quot;)">' + ui.l('login.action') + '</buttontext>')
			+ (data.hinky ? '<hinky style="' + data.hinky + '" class="' + data.hinkyClass + '"></hinky>' : '')
			+ (data.desc == 'home' ? '' : '<close onclick="intro.close()">x</close>');
		if (global.hash(data.desc) == e.getAttribute('i')) {
			intro.close();
			return;
		}
		ui.css(e, 'display', 'block');
		ui.attr(e, 'onclick', data.onclick ? data.onclick : intro.currentStep > -1 ? 'intro.openIntro(event)' : 'intro.close()');
		if (intro.currentStep < 0 || intro.currentStep == intro.steps.length - 1) {
			if (e.getAttribute('i')) {
				intro.close();
				setTimeout(function () {
					intro.openHint(data);
				}, 400);
				return;
			}
			ui.css(e, 'left', null);
			ui.css(e, 'right', null);
			ui.css(e, 'top', null);
			ui.css(e, 'bottom', null);
			ui.html(e, body);
			ui.classAdd(e, 'body');
		} else {
			ui.html(e, '<div class="body">' + body + '</div>');
			ui.css(e, 'left', 0);
			ui.css(e, 'right', 0);
			ui.css(e, 'top', 0);
			ui.css(e, 'bottom', 0);
			e = ui.q('hint > div');
		}
		if (data.pos.split(',')[0].indexOf('-') == 0) {
			ui.css(e, 'left', '');
			ui.css(e, 'right', data.pos.split(',')[0].substring(1));
		} else {
			ui.css(e, 'right', '');
			ui.css(e, 'left', data.pos.split(',')[0]);
		}
		if (data.pos.split(',')[1].indexOf('-') == 0) {
			ui.css(e, 'top', '');
			ui.css(e, 'bottom', data.pos.split(',')[1].substring(1));
		} else {
			ui.css(e, 'bottom', '');
			ui.css(e, 'top', data.pos.split(',')[1]);
		}
		if (data.size.split(',')[0].indexOf('-') == 0)
			ui.css(e, 'right', data.size.split(',')[0].substring(1));
		else
			ui.css(e, 'width', data.size.split(',')[0]);
		ui.css(e, 'height', data.size.split(',')[1]);
		ui.attr(e, 'i', global.hash(data.desc));
		ui.attr(e, 'timestamp', new Date().getTime());
		formFunc.initFields(e);
		setTimeout(function () { ui.css('hint', 'opacity', 1) }, 10);
	}
	static openIntro(event) {
		if (intro.steps.length == 0) {
			intro.steps.push({ desc: 'home', pos: '5%,5em', size: '90%,auto' });
			intro.steps.push({ desc: 'home2', pos: '5%,7.5em', size: '90%,auto', action: 'intro.actionLogin()' });
			intro.steps.push({ desc: 'home3', pos: '5%,-55vh', size: '90%,auto', hinkyClass: 'bottom', hinky: 'left:50%;margin-left:-0.5em;' });
			intro.steps.push({ desc: 'home4', pos: '5%,-5em', size: '90%,auto', hinkyClass: 'bottom', hinky: 'left:35%;' });
			intro.steps.push({ desc: 'searchExplained', pos: '10%,4em', size: '80%,auto', hinky: 'left:50%;margin-left:-0.5em;', hinkyClass: 'top', action: 'intro.actionGoToSearch()' });
			intro.steps.push({ desc: 'search', pos: '5%,-5em', size: '90%,auto', action: 'intro.actionSearch()' });
			intro.steps.push({ desc: 'marketingStart', pos: '5%,5em', size: '80%,auto', hinky: 'left:0.5em;', hinkyClass: 'top', action: 'ui.navigation.goTo("home")' });
			intro.steps.push({ desc: ' ', pos: '-200%,-200%', size: '0,0', action: 'pageHome.openStatistics()' });
		}
		if (event && event.target.nodeName == 'CLOSE')
			return;
		if (intro.currentStep == intro.steps.length - 1) {
			intro.close();
			return;
		}
		if (ui.cssValue('hint', 'transform').indexOf('1') > -1) {
			var e = ui.q('hint');
			if (e)
				e.click();
		}
		if (ui.cssValue('home', 'display') == 'none' && intro.currentStep < 0)
			ui.navigation.goTo('home');
		var e = ui.q('hint');
		ui.css(e, 'opacity', 0);
		intro.currentStep++;
		if (ui.cssValue(e, 'display') == 'block')
			setTimeout(function () { intro.openHint(intro.steps[intro.currentStep]) }, 400);
		else
			intro.openHint(intro.steps[intro.currentStep]);
	}
}