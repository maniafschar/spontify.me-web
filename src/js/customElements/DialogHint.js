import { global } from '../global';
import { communication } from '../communication';
import { pageLogin } from '../pageLogin';
import { formFunc, ui } from '../ui';
import { user } from '../user';
import { initialisation } from '../init';

export { DialogHint }

class DialogHint extends HTMLElement {
	static currentStep = -1;
	static lastHint = 0;
	static steps = [];

	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.setAttribute('i', 'true');
		style.textContent = `${initialisation.customElementsCss}
.body,
:host(.body) {
	position: absolute;
	background: var(--bgHint);
	padding: 1em;
	border-radius: 0.5em;
	text-align: center;
	box-shadow: 0 0 1em rgba(0, 0, 0, 0.3);
}

close {
	position: absolute;
	right: 0;
	top: 0;
	width: 6em;
	height: 2.75em;
	text-align: right;
	padding: 0.25em 0.75em;
	cursor: pointer;
	font-weight: bold;
	z-index: 1;
	color: rgba(0, 0, 0, 0.2);
}

tab.tabActive {
	color: black;
}

tabBody {
	width: 100%;
	overflow-x: hidden;
}

tabBody>div {
	transition: all 0.4s ease-out;
	width: 200%;
}

tabBody>div>div {
	width: 50%;
	float: left;
	height: 22em;
	overflow-y: auto;
}

errorHint {
	color: red !important;
}

index {
	display: none;
}
b {
	margin-bottom: 0.5em;
	display: inline-block;
}

emphasis {
	font-weight: bold;
	color: var(--bg1start);
}

title {
	font-weight: bold;
	font-size: 1.3em;
	display: block;
	margin-bottom: 0.5em;
}

hinky {
	position: absolute;
	border-right: solid 1.5em transparent;
	border-left: solid 1.5em transparent;
	margin-left: -1.5em;
	z-index: 0;
}

hinky.top {
	top: -1em;
	border-bottom: solid 1.5em var(--bgHint);
}

hinky.bottom {
	bottom: -1em;
	border-top: solid 1.5em var(--bgHint);
}

eventFilter {
	display: block;
    max-height: 4em;
    overflow-y: auto;
}

chart {
	display: block;
	position: relative;
	background: rgba(255, 255, 255, 0.9);
	border-radius: 0.5em;
	color: black;
}`;
		this._root.appendChild(style);
	}
	static actionGoToSearch() {
		ui.navigation.goTo('search');
	}
	static actionLogin() {
		setTimeout(function () { pageLogin.login('alpenherz@fan-club.online', 'test1234',); }, 2000);
	}
	static actionSearch() {
		ui.q('search .defaultButton').click();
	}
	static actionZommMap() {
		eval('ui2.close()');
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
	static close(data) {
		ui.q('dialog-hint').removeAttribute('onclick');
		if (!data)
			DialogHint.currentStep = -1;
		var e = ui.q('dialog-hint');
		if (ui.cssValue(e, 'display') != 'block')
			return;
		ui.on(e, 'transitionend', function () {
			ui.attr(e, 'style');
			ui.attr(e, 'i');
			for (var i = e._root.children.length - 1; i >= 0; i--) {
				if (e._root.children[i].getAttribute('i') != 'true')
					e._root.children[i].remove();
			}
			if (data)
				DialogHint.open(data);
		}, true);
		ui.css(e, 'opacity', 0);
	}
	static language(lang) {
		DialogHint.currentStep--;
		initialisation.setLanguage(lang);
	}
	static open(data) {
		if (new Date().getTime() / 60000 - DialogHint.lastHint < 4)
			return;
		if (data && data.action)
			eval(data.action);
		var e = ui.q('dialog-hint');
		if (e != ui.q('dialog-hint'))
			ui.q('dialog-hint').style.display = '';
		if (global.hash(data.desc) == e.getAttribute('i')) {
			DialogHint.close();
			return;
		}
		var body = (data.desc.indexOf(' ') > -1 ? data.desc : ui.l('intro.' + data.desc)), element;
		body = body.replace('<rating/>', '<br/><br/><input-rating ui="rating"></input-rating><br/><br/><input type="email" name="email" placeholder="Email"></input><br/><br/><textarea name="feedback" maxlength="1000"></textarea><br/><br/><button-text onclick="this.save()" name="feedback" label="✓"></button-text>');
		body = body.replace('<language/>', '<br/><br/><button-text ' + (global.language == 'DE' ? 'class="favorite"' : '') + ' onclick="this.language(&quot;DE&quot;)" l="DE" label="Deutsch"></button-text><button-text class="' + (global.language == 'EN' ? ' favorite' : '') + '" onclick="this.language(&quot;EN&quot;)" l="EN" label="English"></button-text>');
		ui.css(e, 'display', 'block');
		if (body.indexOf('<input') < 0)
			ui.attr(e, 'onclick', data.onclick ? data.onclick : DialogHint.currentStep > -1 ? 'ui.navigation.openIntro(event)' : 'ui.navigation.closeHint()');
		else
			e.removeAttribute('onclick');
		if (DialogHint.currentStep < 0 || DialogHint.currentStep == DialogHint.steps.length - 1) {
			if (e.getAttribute('i')) {
				ui.navigation.closeHint();
				setTimeout(function () {
					ui.navigation.openHint(data);
				}, 400);
				return;
			}
			ui.css(e, 'left', null);
			ui.css(e, 'right', null);
			ui.css(e, 'top', null);
			ui.css(e, 'bottom', null);
			element = document.createElement('span');
			element.innerHTML = body;
			e._root.appendChild(element);
			if (!user.contact && data.noLogin != true && DialogHint.currentStep < 0 && (location.pathname.length < 2 || location.pathname.indexOf('index.html') > 0)) {
				e._root.appendChild(document.createElement('br'));
				e._root.appendChild(document.createElement('br'));
				element = document.createElement('button-text');
				element.setAttribute('label', 'login.action');
				element.setAttribute('onclick', 'ui.navigation.goTo("login")');
				e._root.appendChild(element);
			}
		} else {
			element = document.createElement('div');
			element.innerHTML = body;
			e._root.appendChild(element);
			ui.css(e, 'left', 0);
			ui.css(e, 'right', 0);
			ui.css(e, 'top', 0);
			ui.css(e, 'bottom', 0);
			e = element;
		}
		ui.classAdd(e, 'body');
		if (data.hinky) {
			element = document.createElement('hinky');
			element.setAttribute('class', data.hinkyClass);
			element.setAttribute('style', data.hinky);
			(e._root ? e._root : e).appendChild(element);
		}
		element = document.createElement('close');
		element.innerText = 'x';
		element.setAttribute('onclick', data.onclose ? data.onclose : 'ui.navigation.closeHint()');
		(e._root ? e._root : e).appendChild(element);
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
		ui.attr(ui.q('dialog-hint'), 'i', global.hash(data.desc));
		formFunc.initFields(element);
		setTimeout(function () { ui.css('dialog-hint', 'opacity', 1) }, 10);
	}
	static openIntro() {
		if (DialogHint.steps.length == 0) {
			DialogHint.steps.push({ desc: 'home', pos: '5%,5em', size: '90%,auto' });
			DialogHint.steps.push({ desc: 'home2', pos: '5%,7.5em', size: '90%,auto', action: 'this.actionLogin()' });
			DialogHint.steps.push({ desc: 'home3', pos: '5%,-55vh', size: '90%,auto', hinkyClass: 'bottom', hinky: 'left:50%;' });
			DialogHint.steps.push({ desc: 'home4', pos: '5%,-5em', size: '90%,auto', hinkyClass: 'bottom', hinky: 'left:35%;' });
			DialogHint.steps.push({ desc: 'searchExplained', pos: '10%,4em', size: '80%,auto', hinky: 'left:50%;', hinkyClass: 'top', action: 'this.actionGoToSearch()' });
			DialogHint.steps.push({ desc: 'search', pos: '5%,-5em', size: '90%,auto', action: 'this.actionSearch()' });
			DialogHint.steps.push({ desc: 'marketingStart', pos: '0.8em,5em', size: '80%,auto', hinky: 'left:1.6em;', hinkyClass: 'top', action: 'ui.navigation.goTo("home")' });
			DialogHint.steps.push({ desc: 'statisticsCharts', pos: '10%,15em', size: '80%,auto', action: 'ui.navigation.goTo("content-admin-home")' });
			DialogHint.steps.push({ desc: 'statisticsCharts2', pos: '10%,26em', size: '80%,auto', hinky: 'left:50%;', hinkyClass: 'top', action: 'ui2.open(1)' });
			DialogHint.steps.push({ desc: 'statisticsMap', pos: '10%,2em', size: '80%,auto', hinky: 'left:50%;', hinkyClass: 'bottom', action: 'this.actionZommMap()' });
			DialogHint.steps.push({ desc: 'marketingQuestions', pos: '10%,12em', size: '80%,auto', action: 'ui2.goTo(2)' });
			DialogHint.steps.push({ desc: 'epilog', pos: '10%,8em', size: '80%,auto' });
		}
		if (DialogHint.currentStep == DialogHint.steps.length - 1) {
			ui.navigation.closeHint();
			return;
		}
		var e = ui.q('dialog-hint');
		if (ui.cssValue(e, 'transform').indexOf('1') > -1) {
			if (e)
				e.click();
		}
		if (ui.cssValue('home', 'display') == 'none' && DialogHint.currentStep < 0)
			ui.navigation.goTo('home');
		DialogHint.currentStep++;
		if (ui.cssValue(e, 'display') == 'block')
			DialogHint.close(DialogHint.steps[DialogHint.currentStep]);
		else
			DialogHint.open(DialogHint.steps[DialogHint.currentStep]);
	}
	static save() {
		if (formFunc.validation.email(ui.q('dialog-hint input[name="email"]')) < 0)
			communication.ajax({
				url: global.serverApi + 'action/notify',
				webCall: 'DialogHint.save',
				method: 'POST',
				body: 'text=' + encodeURIComponent(JSON.stringify(formFunc.getForm('hint'))),
				success(r) {
					ui.navigation.openHint({ desc: 'Lieben Dank für Dein Feedback!', pos: '20%,12em', size: '60%,auto' });
				}
			});
	}
}
