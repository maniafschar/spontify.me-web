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
		style.textContent = `${initialisation.customElementsCss}
`;
		this._root.appendChild(style);
		var element = document.createElement('label');
		if (this.getAttribute('type') == 'select') {
			this.setAttribute('onclick', 'this.toggle(event)');
			this.setAttribute('i', '' + this.x);
			element.innerText = ui.l('events.date');
			this._root.appendChild(element);
		} else {
			element.setAttribute('onclick', 'this.selectYear()');
			element.setAttribute('name', 'year');
			this._root.appendChild(element);
			element = document.createElement('label')
			element.setAttribute('onclick', 'this.selectMonth()');
			element.setAttribute('name', 'month');
			this._root.appendChild(element);
			element = document.createElement('label')
			element.setAttribute('onclick', 'this.selectDay()');
			element.setAttribute('name', 'day');
			this._root.appendChild(element);
			if (type != 'date') {
				element = document.createElement('label')
				element.setAttribute('onclick', 'this.selectHour()');
				element.setAttribute('name', 'hour');
				this._root.appendChild(element);
				element = document.createElement('label')
				element.setAttribute('onclick', 'this.selectMinute()');
				element.setAttribute('name', 'minute');
				this._root.appendChild(element);
			}
		}
		this.removeAttribute('type');
		this.tabIndex = 0;
		select(this.getAttribute('value'));
	}
	get(name) {
		return this._root.querySelector('label[name="' + name + '"]');
	}
	toggle(event) {
		toggle(this, `
<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').select('all')">${ui.l('search.dateSelectionAll')}</label>
<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').select('today')">${ui.l('search.dateSelectionToday')}</label>
<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').select('tomorrow')">${ui.l('search.dateSelectionTomorrow')}</label>
<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').select('thisWeek')">${ui.l('search.dateSelectionThisWeek')}</label>
<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').select('thisWeekend')">${ui.l('search.dateSelectionThisWeekend')}</label>
<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').select('nextWeek')">${ui.l('search.dateSelectionNextWeek')}</label>
<input onchange="ui.q('input-date[i=&quot;${this.x}&quot;]').select(event.target.value)" type="date" value="${this.getAttribute('value') && this.getAttribute('value').split('-').length == 3 ? this.getAttribute('value') : new Date().toISOString().substring(0, 10)}"/>`);
	}
	toggle(e, html) {
		ui.navigation.openHint({
			desc: '<div style="padding:1em 0.5em 0.5em 0.5em;">' + fields + '</div>',
			pos: (e.getBoundingClientRect().x - ui.q('main').getBoundingClientRect().x + ui.emInPX) + 'px,' + (e.getBoundingClientRect().y + e.getBoundingClientRect().height + ui.emInPX) + 'px', size: '60%,auto', hinkyClass: 'top', hinky: 'left:2em;'
		});
	}
	toggleDay() {
		var s = '', e = this.get('day'), m = get('month').getAttribute('value'), y = get('year').getAttribute('value'), max = 31;
		if (m) {
			if (m % 2 == 0) {
				if (m == 1)
					max = new Date (y, m, 29).getDate() == 29 ? 29 : 28;
				else
					max = 30;
			}
		}
		for (var i = 1; i <= max; i++)
			s += `<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').selectDay(${i})">${i}</label>`;
		toggle(e, s);
	}
	toggleHour() {
	}
	toggleMinute() {
	}
	toggleMonth() {
		var s = '', e = this.get('month');
		for (var i = 0; i < 12; i++)
			s += `<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').selectMonth(${i})">${ui.l('month' + i)}</label>`;
		toggle(e, s);
	}
	toggleYear() {
	}
	select(type) {
		if (type == 'all') {
			this._root.querySelector('label').innerHTML = ui.l('events.date');
			this.removeAttribute('value');
		} else if (type) {
			this._root.querySelector('label').innerHTML = type.indexOf('-') < 0 ? ui.l('search.dateSelection' + type.substring(0, 1).toUpperCase() + type.substring(1)) : global.date.formatDate(type);
			this.setAttribute('value', type);
		}
		ui.navigation.closeHint();
	}
	selectDay() {
	}
	selectHour() {
	}
	selectMinute() {
	}
	selectMonth() {
	}
	selectYear() {
	}
}
