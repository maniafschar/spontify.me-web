import { global } from '../global';
import { initialisation } from '../init';
import { ui } from '../ui';

export { InputDate }

class InputDate extends HTMLElement {
	x = 0;
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
		this.x = new Date().getTime() + Math.random();
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.textContent = `${initialisation.customElementsCss}`;
		this._root.appendChild(style);
		this.setAttribute('onclick', 'this.toggle(event)');
		this.setAttribute('i', '' + this.x);
		var element = document.createElement('label');
		element.innerText = ui.l('events.date');
		this._root.appendChild(element);
		this.tabIndex = 0;
	}
	toggle(event) {
		var e = event.target;
		ui.navigation.openHint({
			desc: `
<div style="padding:1em 0.5em 0.5em 0.5em;">
<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').select('all')">${ui.l('search.dateSelectionAll')}</label>
<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').select('today')">${ui.l('search.dateSelectionToday')}</label>
<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').select('tomorrow')">${ui.l('search.dateSelectionTomorrow')}</label>
<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').select('thisWeek')">${ui.l('search.dateSelectionThisWeek')}</label>
<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').select('thisWeekend')">${ui.l('search.dateSelectionThisWeekend')}</label>
<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').select('nextWeek')">${ui.l('search.dateSelectionNextWeek')}</label>
<input onchange="ui.q('input-date[i=&quot;${this.x}&quot;]').select(event.target.value)" type="date" placeholder="TT.MM.JJJJ"/>
</div>`,
			pos: (this.getBoundingClientRect().x - ui.q('main').getBoundingClientRect().x + ui.emInPX) + 'px,' + (this.getBoundingClientRect().y + this.getBoundingClientRect().height + ui.emInPX) + 'px', size: '60%,auto', hinkyClass: 'top', hinky: 'left:2em;'
		});
	}
	select(type) {
		if (type == 'all') {
			this._root.querySelector('label').innerHTML = ui.l('events.date');
			this.removeAttribute('value');
		} else {
			this._root.querySelector('label').innerHTML = type.indexOf('-') < 0 ? ui.l('search.dateSelection' + type.substring(0, 1).toUpperCase() + type.substring(1)) : global.date.formatDate(type);
			this.setAttribute('value', type);
		}
		ui.navigation.closeHint();
	}
}
