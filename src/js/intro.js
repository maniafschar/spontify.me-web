import { global } from './global';
import { formFunc, ui } from './ui';
import { user } from './user';

export { intro };

class intro {
	static currentStep = -1;
	static introMode = 0;
	static lastHint = 0;
	static steps = [];

	static close(event) {
		event.stopPropagation();
		intro.closeHint();
		intro.currentStep--;
	}
	static closeHint() {
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
	static openHint(data, save) {
		if (save && new Date().getTime() / 60000 - intro.lastHint < 4)
			return;
		if (data && data.action) {
			intro.introMode = 1;
			eval(data.action);
			if (intro.introMode == 1)
				intro.introMode = 0;
		}
		var e = ui.q('hint'), body = (data.desc.indexOf(' ') > -1 ? data.desc : ui.l('intro.' + data.desc))
			+ (user.contact ? '' : '<br/><br/><buttontext class="bgColor" onclick="ui.navigation.goTo(&quot;login&quot;)">' + ui.l('login.action') + '</buttontext>')
			+ (data.hinky ? '<hinky style="' + data.hinky + '" class="' + data.hinkyClass + '"></hinky>' : '')
			+ (data.desc == 'home' ? '' : '<close onclick="intro.close(event)">x</close>');
		if (global.hash(data.desc) == e.getAttribute('i')) {
			intro.closeHint();
			return;
		}
		if (intro.currentStep < 0 || intro.currentStep == intro.steps.length - 1) {
			if (e.getAttribute('i')) {
				intro.closeHint();
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
		ui.attr(e, 'onclick', data.onclick ? data.onclick : 'intro.closeHint()');
		ui.attr(e, 'i', global.hash(data.desc));
		ui.attr(e, 'timestamp', new Date().getTime());
		ui.css(e, 'display', 'block');
		formFunc.initFields('hint');
		setTimeout(function () { ui.css(e, 'opacity', 1) }, 10);
	}
}