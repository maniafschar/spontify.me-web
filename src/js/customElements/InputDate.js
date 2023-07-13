import { initialisation } from '../init';
import { ui } from '../ui';

export { InputDate }

class InputDate extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.textContent = `${initialisation.customElementsCss}
`;
		this._root.appendChild(style);
		this.setAttribute('onclick', 'this.toggle(event)');
		var element = document.createElement('label');
		element.innerText = ui.l('events.date');
		this._root.appendChild(element);
		this.tabIndex = 0;
		this.addEventListener('keydown', function (event) {
			if (event.key == ' ')
				this.click();
		})
	}
	toggle(event) {
		var e = event.target;
		ui.navigation.openHint({
			desc: `
<label value="">alle</label>
<label value="today">heute</label>
<label value="tomorrow">morgen</label>
<label value="thisWeek">diese Woche</label>
<label value="thisWeekend">dieses Wochenende</label>
<label value="nextWeek">nächste Woche</label>
<input type="date" placeholder="TT.MM.JJJJ" />
`, pos: (this.getBoundingClientRect().x - ui.q('main').getBoundingClientRect().x + ui.emInPX) + 'px,' + (this.getBoundingClientRect().y + this.getBoundingClientRect().height + ui.emInPX) + 'px', size: '60%,auto', hinkyClass: 'top', hinky: 'left:2em;'
		});

	}
}
