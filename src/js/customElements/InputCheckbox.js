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
:host([checked="true"]) label {
	padding-left: 1.75em;
	padding-right: 0.75em;
	color: black;
	opacity: 1;
}
:host([checked="true"]) label:before {
	position: absolute;
	content: '\\2713';
	left: 0.5em;
	opacity: 0.8;
}
label {
	color: var(--popupText);
}
explain {
	padding: 0.4em 0;
    text-align: left;
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
		});
	}
	static get observedAttributes() { return ['label']; }
	attributeChangedCallback(name, oldValue, newValue) {
		if (name == 'label' && newValue && this._root.querySelector('label')) {
			var s = ui.l(newValue, true);
			this._root.querySelector('label').innerHTML = s ? s : newValue;
			this.removeAttribute('label');
		}
	}
	toggleCheckbox(event) {
		var e = event.target, alterState = true;
		if (e.getAttribute('type') == 'radio') {
			alterState = e.getAttribute('checked') != 'true';
			if (!alterState && e.getAttribute('deselect') != 'true')
				return;
			ui.attr(e.parentElement.querySelectorAll('input-checkbox[name="' + e.getAttribute('name') + '"][type="radio"]'), 'checked', 'false');
		}
		if (alterState) {
			e.setAttribute('checked', e.getAttribute('checked') == 'true' ? 'false' : 'true');
			this.dispatchEvent(new CustomEvent('Checkbox', { detail: { value: e.getAttribute('checked') == 'true' ? e.getAttribute('value') : '' } }));
		}
	}
}
