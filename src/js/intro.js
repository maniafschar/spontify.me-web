import { communication } from './communication';
import { geoData } from './geoData';
import { global } from './global';
import { pageLocation } from './pageLocation';
import { ui } from './ui';
import { user } from './user';

export { intro };

class intro {
	static currentStep = -1;
	static introMode = 0;
	static lastHint = 0;
	static steps = [];

	static close(event) {
		event.stopPropagation();
		intro.closeIntro();
		intro.currentStep--;
	}
	static closeIntro() {
		var e = ui.q('hint');
		if (ui.cssValue(e, 'display') != 'block')
			return;
		ui.css(e, 'opacity', 0);
		setTimeout(function () {
			e.removeAttribute('style');
			ui.html(e, '');
		}, 400);
	}
	static loadLocations() {
		communication.loadList('latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&query=' + (user.contact ? 'location_list' : 'location_anonymousList'), pageLocation.listLocation, 'locations', 'list');
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
		var e = ui.q('hint'), body = ui.l('intro.' + data.desc) + (data.hinky ? '<hinky style="' + data.hinky + '" class="' + data.hinkyClass + '"></hinky>' : '')
			+ (data.desc == 'home' ? '' : '<close onclick="intro.close(event)">x</close>');
		if (intro.currentStep < 0 || intro.currentStep == intro.steps.length - 1) {
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
		ui.css(e, 'width', data.size.split(',')[0]);
		ui.css(e, 'height', data.size.split(',')[1]);
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
		e = ui.q('hint');
		ui.attr(e, 'onclick', data.onclick ? data.onclick : 'intro.openIntro(event)');
		ui.css(e, 'display', 'block');
		setTimeout(function () { ui.css(e, 'opacity', 1); }, 400);
		if (save) {
			intro.lastHint = parseInt(new Date().getTime() / 60000);
			user.contact.introState[data.desc] = intro.lastHint;
			user.save({ values: { introState: JSON.stringify(user.contact.introState) } });
		}
	}
	static openIntro(event) {
		if (intro.steps.length == 0) {
			intro.steps.push({ desc: 'home', pos: '10%,20em', size: '80%,auto', hinky: '', action: '' });
			intro.steps.push({ desc: 'settings', pos: '10%,18em', size: '80%,auto', hinky: 'left:50%;margin-left:-0.5em;', hinkyClass: 'top', action: '' });
			intro.steps.push({ desc: 'bluetooth', pos: '10%,18em', size: '80%,auto', hinky: 'left:50%;margin-left:-0.5em;', hinkyClass: 'top', action: '' });
			intro.steps.push({ desc: 'listMenu', pos: '10%,-12em', size: '80%,auto', hinky: 'left:50%;margin-left:-0.5em;', hinkyClass: 'bottom', action: 'ui.navigation.goTo("locations")' });
			intro.steps.push({ desc: 'listExplained', pos: '10%,10em', size: '80%,auto', hinky: 'right:2em;', hinkyClass: 'top', action: 'intro.loadLocations()' });
			intro.steps.push({ desc: 'listFilter', pos: '10%,50%', size: '80%,auto', hinky: 'left:2em;', hinkyClass: 'top', action: 'lists.toggleFilter(event, pageLocation.getFilterFields)' });
			intro.steps.push({ desc: 'detail', pos: '10%,4em', size: '80%,auto', hinky: 'left:50%;margin-left:-0.5em;', hinkyClass: 'bottom', action: 'var e=ui.q("locations row");if(e)e.click();intro.introMode=2' });
			intro.steps.push({ desc: 'register', pos: '10%,-5em', size: '80%,auto', hinky: 'left:2em;', hinkyClass: 'top', action: 'pageLogin.lastTab=3;ui.navigation.goTo("login", null, true)' });
		}
		if ((!user.contact && intro.currentStep == intro.steps.length - 1) || (user.contact && intro.currentStep == intro.steps.length - 2)) {
			intro.currentStep = -1;
			intro.closeIntro();
			return;
		}
		if (ui.cssValue('descbox', 'transform').indexOf('1') > -1) {
			var e = ui.q('descbox');
			if (e)
				e.click();
		}
		if (!event) {
			intro.currentStep = -1;
			if (ui.cssValue('home', 'display') == 'none')
				ui.navigation.goTo('home');
			ui.html('locations', '');
		}
		var e = ui.q('hint');
		ui.css(e, 'opacity', 0);
		intro.currentStep++;
		if (ui.cssValue(e, 'display') == 'block')
			setTimeout(function () { intro.openHint(intro.steps[intro.currentStep]) }, 400);
		else
			intro.openHint(intro.steps[intro.currentStep]);
	}
}