import { communication } from './communication';
import { global } from './global';
import { initialisation } from './initialisation';
import { pageLogin } from './pageLogin';
import { formFunc, ui } from './ui';
import { user } from './user';

export { intro };

class intro {
	static currentStep = -1;
	static lastHint = 0;
	static steps = [];

	static actionGoToSearch() {
		ui.navigation.goTo("search");
	}
	static actionLogin() {
		setTimeout(function () { pageLogin.login("alpenherz@fan-club.online", "test1234",); }, 2000);
	}
	static actionSearch() {
		ui.q('search .defaultButton').click();
	}
	static actionZommMap() {
		ui2.close();
		setTimeout(function () {
			ui.q('body home mapcanvas').scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
			setTimeout(function () {
				ui.q('[aria-label=\"Vergrößern\"]').click();
				ui.q('[aria-label=\"Vergrößern\"]').click();
				ui.q('[aria-label=\"Vergrößern\"]').click();
			}, 500);
			setTimeout(function () { ui.q('[aria-label=\"Stadtplan anzeigen\"]').click() }, 1500);
		}, 500);
	}
	static close() {
		intro.currentStep = -1;
		var e = ui.q('main:last-child hint');
		if (ui.cssValue(e, 'display') != 'block')
			return;
		ui.on(e, 'transitionend', function () {
			ui.attr('hint', 'style');
			ui.attr('hint', 'i');
			ui.html('hint', '');
		}, true);
		ui.css(e, 'opacity', 0);
	}
	static language(lang) {
		intro.currentStep--;
		initialisation.setLanguage(lang);
	}
	static openHint(data) {
		if (new Date().getTime() / 60000 - intro.lastHint < 4)
			return;
		if (data && data.action) {
			eval(data.action);
			if (data.action.indexOf('pageHome.openStatistics') > -1)
				return;
		}
		var e = ui.q('main:last-child hint'), body = (data.desc.indexOf(' ') > -1 ? data.desc : ui.l('intro.' + data.desc))
			+ (user.contact || intro.currentStep > -1 || location.pathname.length > 1 && location.pathname.indexOf('index.html') < 0 ? '' : '<br/><br/><buttontext class="bgColor" onclick="ui.navigation.goTo(&quot;login&quot;)">' + ui.l('login.action') + '</buttontext>')
			+ (data.hinky ? '<hinky style="' + data.hinky + '" class="' + data.hinkyClass + '"></hinky>' : '')
			+ (data.desc == 'home' ? '' : '<close onclick="intro.close()">x</close>');
		body = body.replace('<rating/>', '<br/><br/><ratingSelection><empty><span>☆</span><span onclick=\"ratings.click(2)\">☆</span><span onclick=\"ratings.click(3)\">☆</span><span onclick=\"ratings.click(4)\">☆</span><span onclick=\"ratings.click(5)\">☆</span></empty><full><span onclick=\"ratings.click(1)\">★</span><span onclick=\"ratings.click(2)\">★</span><span onclick=\"ratings.click(3)\">★</span><span onclick=\"ratings.click(4)\">★</span><span onclick=\"ratings.click(5)\" style=\"display:none;\">★</span></full></ratingSelection><input type=\"hidden\" name=\"rating\" value=\"80\"></input><br/><br/><input type=\"email\" name=\"email\" placeholder=\"Email\"></input><br/><br/><textarea name=\"feedback\" maxlength=\"1000\"></textarea><br/><br/><buttontext onclick=\"intro.save()\" name=\"feedback\" class=\"bgColor\">✓</buttontext>');
		body = body.replace('<language/>', '<br/><br/><buttontext class="bgColor' + (global.language == 'DE' ? ' favorite' : '') + '" onclick="intro.language(&quot;DE&quot;)" l="DE">Deutsch</buttontext><buttontext class="bgColor' + (global.language == 'EN' ? ' favorite' : '') + '" onclick="intro.language(&quot;EN&quot;)" l="EN">English</buttontext>');
		if (e != ui.q('hint'))
			ui.q('hint').style.display = '';
		if (global.hash(data.desc) == e.getAttribute('i')) {
			intro.close();
			return;
		}
		ui.css(e, 'display', 'block');
		if (body.indexOf('</input>') < 0)
			ui.attr(e, 'onclick', data.onclick ? data.onclick : intro.currentStep > -1 ? 'intro.openIntro(event)' : 'intro.close()');
		else
			e.removeAttribute('onclick');
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
			e = e.children[0];
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
		setTimeout(function () { ui.css('main:last-child hint', 'opacity', 1) }, 10);
	}
	static openIntro(event) {
		if (intro.steps.length == 0) {
			intro.steps.push({ desc: 'home', pos: '5%,5em', size: '90%,auto' });
			intro.steps.push({ desc: 'home2', pos: '5%,7.5em', size: '90%,auto', action: 'intro.actionLogin()' });
			intro.steps.push({ desc: 'home3', pos: '5%,-55vh', size: '90%,auto', hinkyClass: 'bottom', hinky: 'left:50%;' });
			intro.steps.push({ desc: 'home4', pos: '5%,-5em', size: '90%,auto', hinkyClass: 'bottom', hinky: 'left:35%;' });
			intro.steps.push({ desc: 'searchExplained', pos: '10%,4em', size: '80%,auto', hinky: 'left:50%;', hinkyClass: 'top', action: 'intro.actionGoToSearch()' });
			intro.steps.push({ desc: 'search', pos: '5%,-5em', size: '90%,auto', action: 'intro.actionSearch()' });
			intro.steps.push({ desc: 'marketingStart', pos: '0.8em,5em', size: '80%,auto', hinky: 'left:1.6em;', hinkyClass: 'top', action: 'ui.navigation.goTo("home")' });
			intro.steps.push({ desc: 'statisticsCharts', pos: '10%,15em', size: '80%,auto', action: 'pageHome.openStatistics(true)' });
			intro.steps.push({ desc: 'statisticsCharts2', pos: '10%,26em', size: '80%,auto', hinky: 'left:50%;', hinkyClass: 'top', action: 'ui2.open(1)' });
			intro.steps.push({ desc: 'statisticsMap', pos: '10%,2em', size: '80%,auto', hinky: 'left:50%;', hinkyClass: 'bottom', action: 'intro.actionZommMap()' });
			intro.steps.push({ desc: 'marketingQuestions', pos: '10%,12em', size: '80%,auto', action: 'ui2.goTo(2)' });
			intro.steps.push({ desc: 'epilog', pos: '10%,8em', size: '80%,auto' });
		}
		if (event && event.target.nodeName == 'CLOSE')
			return;
		if (intro.currentStep == intro.steps.length - 1) {
			intro.close();
			return;
		}
		var e = ui.q('main:last-child hint');
		if (ui.cssValue(e, 'transform').indexOf('1') > -1) {
			if (e)
				e.click();
		}
		if (ui.cssValue('home', 'display') == 'none' && intro.currentStep < 0)
			ui.navigation.goTo('home');
		ui.css(e, 'opacity', 0);
		intro.currentStep++;
		if (ui.cssValue(e, 'display') == 'block')
			setTimeout(function () { intro.openHint(intro.steps[intro.currentStep]) }, 400);
		else
			intro.openHint(intro.steps[intro.currentStep]);
	}
	static save() {
		if (formFunc.validation.email(ui.q('main:last-child hint input[name="email"]')) < 0)
			communication.ajax({
				url: global.serverApi + 'action/notify',
				webCall: 'intro.save()',
				method: 'POST',
				body: 'text=' + encodeURIComponent(JSON.stringify(formFunc.getForm('main:last-child hint'))),
				success(r) {
					intro.openHint({ desc: 'Lieben Dank für Dein Feedback!', pos: '20%,12em', size: '60%,auto' });
				}
			});
	}
}