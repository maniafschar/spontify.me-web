import { initialisation } from '../init';
import { ui } from '../ui';

export { ButtonText }

class ButtonText extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.textContent = `${initialisation.customElementsCss}
span {
	background: linear-gradient(var(--bg2stop) 0%, var(--bg2start) 100%) center center / 100% no-repeat;
	outline: none !important;
}

:host>span:hover {
	background: var(--bg2stop);
}
		
:host(.favorite)>span::before {
	content: '✓';
	position: absolute;
	font-size: 2em;
	right: 0.15em;
	bottom: 0;
}

:host>span {
	position: relative;
	border-radius: 0.5em;
	cursor: pointer;
	padding: 1em 1.5em;
	min-height: 3em;
	line-height: 1;
	margin: 0 0.25em;
	white-space: nowrap;
	vertical-align: middle;
	overflow: hidden;
	text-overflow: ellipsis;
	color: var(--buttonText);
	box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.3);
	display: inline-block;
}

:host(.map)>span {
	position: absolute;
	width: 18em;
	left: 50%;
	margin-left: -9em;
	top: 4.25em;
	opacity: 0.8;
	font-size: 0.8em;
	display: none;
}

:host(.settingsButton)>span {
	margin: 1em 0 0.25em 0;
	border-radius: 0 2em 2em 0;
	z-index: 1;
}

:host(.settingsButtonRight)>span {
	margin: 1em 0 0.25em 0;
	float: right;
	border-radius: 2em 0 0 2em;
	clear: both;
}`;
		this._root.appendChild(style);
		this._root.appendChild(document.createElement('span'));
		this.tabIndex = 0;
		this.style.outline = 'none !important';
		this.attributeChangedCallback('label', null, this.getAttribute('label'));
		if (this.innerHTML) {
			this._root.querySelector('span').innerHTML = this.innerHTML;
			this.innerHTML = '';
		}
		this.addEventListener('keydown', function (event) {
			if (event.key == ' ')
				this.click();
		})
	}
	static get observedAttributes() { return ['label']; }
	attributeChangedCallback(name, oldValue, newValue) {
		if (name == 'label' && newValue && this._root.querySelector('span')) {
			var s = ui.l(newValue.trim(), true);
			this._root.querySelector('span').innerHTML = s ? s : newValue;
			this.removeAttribute('label');
		}
	}
}
