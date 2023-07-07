import { initialisation } from '../init';
import { ui } from '../ui';

export { InputCheckbox }

class InputCheckbox extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.textContent = `${initialisation.customElementsCss}
label {
	cursor: pointer;
	display: inline-block;
	position: relative;
	text-align: left;
	width: auto;
	padding: 0.34em 1.25em;
	margin-left: 0.25em;
	margin-right: 0.25em;
	margin-bottom: 0.5em;
	left: -0.25em;
	color: black;
	background: rgba(255, 255, 255, 0.85);
	border-radius: 0.5em;
	transition: all .4s;
}
label>img {
	height: 3em;
	margin: -1em;
}
label:hover {
	color: black;
}
:host([checked="true"]) label {
	padding-left: 1.75em;
	padding-right: 0.75em;
	color: black;
}
:host([checked="true"]) label:before {
	position: absolute;
	content: '\\2713';
	left: 0.5em;
	opacity: 0.8;
}`;
		this._root.appendChild(style);
		this.setAttribute('onclick', 'this.toggleCheckbox(event)' + (this.getAttribute('onclick') ? ';' + this.getAttribute('onclick') : ''));
		var element = document.createElement('label');
		this._root.appendChild(element);
		this.attributeChangedCallback('label', null, this.getAttribute('label'));
		this.tabIndex = 0;
		this.addEventListener('keydown', function (event) {
			if (event.key == ' ')
				this.click();
		})
	}
	static get observedAttributes() { return ['label']; }
	attributeChangedCallback(name, oldValue, newValue) {
		if (name == 'label' && newValue && this._root.querySelector('label')) {
			var s = ui.l(newValue, true);
			this._root.querySelector('label').textContent = s ? s : newValue;
			this.removeAttribute('label');
		}
	}
	toggleCheckbox(event) {
		var e = event.target;
		if (e.getAttribute('type') == 'radio') {
			if (e.getAttribute('checked') == 'true' && e.getAttribute('deselect') != 'true')
				return;
			ui.attr('input-checkbox[name="' + e.getAttribute('name') + '"][type="radio"]', 'checked', 'false');
		}
		e.setAttribute('checked', e.getAttribute('checked') == 'true' ? 'false' : 'true');
	}
}
