import { global } from '../global';
import { communication } from '../communication';
import { pageChat } from '../pageChat';
import { ui, formFunc } from '../ui';
import { initialisation } from '../init';

export { DialogPopup }

class DialogPopup extends HTMLElement {
	static lastPopup = null;

	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	addStyle() {
		const style = document.createElement('style');
		style.textContent = `${initialisation.customElementsCss}
input:checked+label {
	background: var(--bg1stop) !important;
	color: black;
}

.multiple {
	max-height: 50vh;
	overflow-y: auto;
	margin-bottom: 1em;
}

.paypal {
	text-align: center;
	padding: 0.25em 0.5em 0 0.5em;
}

appointment {
	display: none;
	margin-top: 1em;
	position: relative;
}

appointment day {
	position: relative;
	width: 33%;
	overflow: hidden;
	display: block;
	float: left;
	padding: 0.5em;
}

appointment day hour {
	position: relative;
	height: 2em;
	width: 100%;
	display: block;
	overflow: hidden;
	margin: 0.5em 0;
	background: rgba(0, 0, 0, 0.1);
	border-radius: 0.5em;
	line-height: 2;
	cursor: pointer;
}

appointment day hour.closed {
	background-color: red;
	text-decoration: line-through;
	opacity: 0.25;
}

appointment day hour.selected {
	background-color: rgba(0, 255, 0, 0.9);
}

appointment day hour.selected::after {
	content: '✓';
	position: absolute;
	opacity: 0.2;
	font-size: 2em;
	top: 0.1em;
	line-height: 1;
}

appointment day hour.hour09::before {
	content: '9:00';
}

appointment day hour.hour10::before {
	content: '10:00';
}

appointment day hour.hour11::before {
	content: '11:00';
}

appointment day hour.hour12::before {
	content: '12:00';
}

appointment day hour.hour13::before {
	content: '13:00';
}

appointment day hour.hour14::before {
	content: '14:00';
}

appointment day hour.hour15::before {
	content: '15:00';
}

appointment day hour.hour16::before {
	content: '16:00';
}

appointment day hour.hour17::before {
	content: '17:00';
}
		
popupTitle {
	position: relative;
	display: block;
	height: 2.6em;
	z-index: 1;
	overflow: hidden;
}

popupTitle>div {
	white-space: nowrap;
	font-size: 1.3em;
	max-width: 90%;
	display: inline-block;
	background: rgba(250, 175, 100, 0.95);
	padding: 0.5em 1em;
	border-radius: 0.5em 0.5em 0 0;
	color: black;
	height: 100%;
	cursor: pointer;
	text-overflow: ellipsis;
}

popupHint {
	padding-top: 0.5em;
	text-align: center;
	display: none;
}

popupContent {
	display: flex;
	border-radius: 0.5em;
	background: linear-gradient(rgba(250, 175, 100, 0.95) 0%, rgba(209, 130, 60, 0.95) 100%);
	color: black;
}

popupContent>div {
	overflow-y: auto;
	overflow-x: hidden;
	border: solid 0.75em transparent;
	width: 100%;
}

 .highlightColor {
	color: var(--bg1start);
}

locationNameInputHelper,
eventLocationInputHelper {
	position: relative !important;
	display: block !important;
	max-height: 25em !important;
	overflow-y: auto !important;
	margin: 0.25em 0 !important;
}

ul {
	margin: 0;
	padding: 0;
}

locationNameInputHelper li,
eventLocationInputHelper li {
	list-style-type: none !important;
	background: rgba(0, 0, 0, 0.1) !important;
	padding: 0.5em !important;
	border-radius: 0.5em !important;
	cursor: pointer !important;
	margin: 0.5em !important;
	text-align: center !important;
	color: white !important;
}

mapPicker {
	position: relative;
	display: block;
	width: 100%;
	height: 50vh;
}

mapButton {
	font-size: 2em;
	right: 0;
	top: 0;
	padding: 0.2em;
	cursor: pointer;
	z-index: 1;
	color: black;
	position: relative;
	float: right;
	margin-top: -1.05em;
}

mapButton::before {
	content: '>';
}`;
		this._root.appendChild(style);
	}
	static close() {
		var e = ui.q('dialog-popup');
		e.removeAttribute('error');
		if (ui.cssValue(e, 'display') != 'none' && e.getAttribute('modal') != 'true') {
			ui.navigation.animation(e, 'popupSlideOut', e.closeHard);
			DialogPopup.lastPopup = null;
			return true;
		}
		return false;
	}
	closeHard() {
		var e = ui.q('dialog-popup');
		e.style.display = 'none';
		e.removeAttribute('error');
		e.removeAttribute('modal');
		ui.classRemove(e, 'animated popupSlideIn popupSlideOut');
		for (var i = e._root.children.length - 1; i >= 0; i--)
			e._root.children[i].remove();
	}
	static open(title, data, closeAction, modal, exec) {
		var e = ui.q('dialog-popup'), visible = e.style.display != 'none';
		if (visible && e.getAttribute('modal') == 'true')
			return false;
		if (global.isBrowser() && location.href.indexOf('#') < 0)
			history.pushState(null, null, '#x');
		if (!data || visible && ui.navigation.lastPopup == title + global.separatorTech + data)
			ui.navigation.closePopup();
		else {
			ui.navigation.lastPopup = title + global.separatorTech + data;
			var f = function () {
				e.closeHard();
				e.addStyle();
				var element;
				if (title) {
					element = document.createElement('popupTitle');
					if (modal)
						e.setAttribute('modal', 'true');
					element.setAttribute('onclick', 'ui.navigation.closePopup()');
					var element2 = document.createElement('div');
					element2.innerText = title;
					element.appendChild(element2);
					e._root.appendChild(element);
				}
				element = document.createElement('popupContent');
				var element2 = document.createElement('div');
				element2.innerHTML = data;
				element.appendChild(element2);
				e._root.appendChild(element);
				ui.css(e, 'display', 'none');
				formFunc.initFields(e);
				if (closeAction)
					e.setAttribute('close', closeAction);
				else
					e.removeAttribute('close');
				e.removeAttribute('error');

				ui.navigation.animation(e, visible ? 'slideDown' : 'popupSlideIn');
				element.style.maxHeight = (ui.q('content').clientHeight - (title ? ui.q('dialog-popup popupTitle').clientHeight : 0) - 2 * ui.emInPX) + 'px';
				if (exec)
					exec();
			};
			ui.navigation.closeHint();
			pageChat.closeList();
			communication.notification.close();
			if (!visible)
				f.call();
			else
				ui.navigation.animation(e, 'slideUp', f);
		}
		return true;
	}
	static setHint(s) {
		if (ui.q('dialog-popup').style.display != 'none') {
			var e = ui.q('dialog-popup popupHint');
			if (e) {
				e.innerHTML = s;
				e.style.display = s ? 'block' : 'none';
				return true;
			}
		}
		return false;
	}
}