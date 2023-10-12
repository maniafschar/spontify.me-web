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
		style.textContent = initialisation.customElementsCss;
		this._root.appendChild(style);
		this.setAttribute('i', '' + this.x);
		var element = document.createElement('label');
		if (this.getAttribute('type') == 'search') {
			this.setAttribute('onclick', 'this.toggleSearch(event)');
			element.innerText = ui.l('events.date');
			this._root.appendChild(element);
		} else {
			element.setAttribute('onclick', 'this.getRootNode().host.toggleYear()');
			element.setAttribute('name', 'year');
			this._root.appendChild(element);
			element = document.createElement('label')
			element.setAttribute('onclick', 'this.getRootNode().host.toggleMonth()');
			element.setAttribute('name', 'month');
			this._root.appendChild(element);
			element = document.createElement('label')
			element.setAttribute('onclick', 'this.getRootNode().host.toggleDay()');
			element.setAttribute('name', 'day');
			this._root.appendChild(element);
			if (this.getAttribute('type') != 'birthday' && this.getAttribute('type') != 'date') {
				element = document.createElement('label')
				element.setAttribute('onclick', 'this.getRootNode().host.toggleHour()');
				element.setAttribute('name', 'hour');
				this._root.appendChild(element);
				element = document.createElement('label')
				element.setAttribute('onclick', 'this.getRootNode().host.toggleMinute()');
				element.setAttribute('name', 'minute');
				this._root.appendChild(element);
			}
		}
		this.tabIndex = 0;
		this.select(this.getAttribute('value'));
	}
	get(name) {
		return this._root.querySelector('label[name="' + name + '"]');
	}
	select(type) {
		if (type == 'all') {
			this._root.querySelector('label').innerHTML = ui.l('events.date');
			this.removeAttribute('value');
		} else {
			var e = this.get('year');
			if (e) {
				var d = global.date.getDateFields(type || '');
				if (d.year) {
					e.innerHTML = d.year;
					e.setAttribute('value', d.year);
				} else {
					e.innerHTML = ui.l('date.labelYear');
					e.setAttribute('value', '');
				}
				e = this.get('month');
				if (d.month) {
					e.innerHTML = ui.l('date.month' + parseInt(d.month));
					e.setAttribute('value', d.month);
				} else {
					e.innerHTML = ui.l('date.labelMonth');
					e.setAttribute('value', '');
				}
				e = this.get('day');
				if (d.day) {
					e.innerHTML = '' + parseInt(d.day);
					e.setAttribute('value', d.day);
				} else {
					e.innerHTML = ui.l('date.labelDay');
					e.setAttribute('value', '');
				}
				e = this.get('hour');
				if (e) {
					if (d.hour) {
						e.innerHTML = '' + parseInt(d.hour);
						e.setAttribute('value', d.hour);
					} else {
						e.innerHTML = ui.l('date.labelHour');
						e.setAttribute('value', '');
					}
					e = this.get('minute');
					if (d.minute) {
						e.innerHTML = '' + parseInt(d.minute);
						e.setAttribute('value', d.minute);
					} else {
						e.innerHTML = ui.l('date.labelMinute');
						e.setAttribute('value', '');
					}
				}
			} else if (type)
				this._root.querySelector('label').innerHTML = type.indexOf('-') < 0 ? ui.l('search.dateSelection' + type.substring(0, 1).toUpperCase() + type.substring(1)) : global.date.formatDate(type);
			this.setAttribute('value', type);
		}
		ui.navigation.closeHint();
	}
	selectDay(i) {
		var e = this.get('day');
		if (i) {
			e.innerHTML = i;
			e.setAttribute('value', ('0' + i).slice(-2));
			if (this.get('hour') && !this.get('hour').getAttribute('value'))
				this.toggleHour();
		} else {
			e.innerHTML = ui.l('date.labelDay');
			e.setAttribute('value', '');
		}
		this.setValue();
	}
	selectHour(i) {
		var e = this.get('hour');
		if (i) {
			e.innerHTML = i;
			e.setAttribute('value', ('0' + i).slice(-2));
			if (!this.get('minute').getAttribute('value'))
				this.toggleMinute();
		} else {
			e.innerHTML = ui.l('date.labelHour');
			e.setAttribute('value', '');
		}
		this.setValue();
	}
	selectMinute(i) {
		var e = this.get('minute');
		if (i > -1) {
			e.innerHTML = i;
			e.setAttribute('value', ('0' + i).slice(-2));
		} else {
			e.innerHTML = ui.l('date.labelMinute');
			e.setAttribute('value', '');
		}
		this.setValue();
	}
	selectMonth(i) {
		var e = this.get('day');
		var d = parseInt(e.getAttribute('value'));
		if (new Date(parseInt(this.get('year').getAttribute('value')), i - 1, d).getDate() != d) {
			e.innerHTML = ui.l('date.labelDay');
			e.setAttribute('value', '');
		}
		e = this.get('month');
		if (i) {
			e.innerHTML = ui.l('date.month' + i);
			e.setAttribute('value', ('0' + i).slice(-2));
			if (!this.get('day').getAttribute('value'))
				this.toggleDay();
		} else {
			e.innerHTML = ui.l('date.labelMonth');
			e.setAttribute('value', '');
		}
		this.setValue();
	}
	selectYear(i) {
		var e = this.get('day');
		var d = parseInt(e.getAttribute('value'));
		if (new Date(i, parseInt(this.get('month').getAttribute('value')) - 1, d).getDate() != d) {
			e.innerHTML = ui.l('date.labelDay');
			e.setAttribute('value', '');
		}
		e = this.get('year');
		if (i) {
			e.innerHTML = i;
			e.setAttribute('value', i);
			if (!this.get('month').getAttribute('value'))
				this.toggleMonth();
		} else {
			e.innerHTML = ui.l('date.labelYear');
			e.setAttribute('value', '');
		}
		this.setValue();
	}
	setValue() {
		var s = this.get('year').getAttribute('value');
		s += '-' + this.get('month').getAttribute('value');
		s += '-' + this.get('day').getAttribute('value');
		if (this.get('hour')) {
			s += ' ' + this.get('hour').getAttribute('value');
			s += ':' + this.get('minute').getAttribute('value');
			s += ':00';
		}
		this.setAttribute('value', s);
	}
	toggle(e, html, close) {
		ui.navigation.openHint({
			desc: '<div style="padding:1em 0.5em 0.5em 0.5em;max-height:22em;overflow-y:auto;">' + html + '</div>',
			onclose: 'ui.q(\'input-date[i="' + this.x + '"]\').select' + close + '()',
			pos: (e.getBoundingClientRect().x - ui.q('main').getBoundingClientRect().x + ui.emInPX) + 'px,' + (e.getBoundingClientRect().y + e.getBoundingClientRect().height + ui.emInPX) + 'px', size: '55%,auto', hinkyClass: 'top', hinky: 'left:2em;',
			noLogin: true
		});
	}
	toggleDay() {
		var s = '', e = this.get('day'), m = this.get('month').getAttribute('value'), y = this.get('year').getAttribute('value'), max = 31;
		if (m) {
			if (m == '2')
				max = y && new Date(parseInt(y), parseInt(m) - 1, 29).getDate() == 29 ? 29 : 28;
			else if (m == '4' || m == '6' || m == '9' || m == '11')
				max = 30;
		}
		for (var i = 1; i <= max; i++)
			s += `<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').selectDay(${i})">${i}</label>`;
		this.toggle(e, s, 'Day');
	}
	toggleHour() {
		var s = '', e = this.get('hour');
		for (var i = 0; i < 24; i++)
			s += `<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').selectHour(${i})">${i}</label>`;
		this.toggle(e, s, 'Hour');
	}
	toggleMinute() {
		var s = '', e = this.get('minute');
		for (var i = 0; i < 60; i += 5)
			s += `<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').selectMinute(${i})">${i}</label>`;
		this.toggle(e, s, 'Minute');
	}
	toggleMonth() {
		var s = '', e = this.get('month');
		for (var i = 1; i < 13; i++)
			s += `<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').selectMonth(${i})">${ui.l('date.month' + i)}</label>`;
		this.toggle(e, s, 'Month');
	}
	toggleSearch() {
		this.toggle(this, `
<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').select('all')">${ui.l('search.dateSelectionAll')}</label>
<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').select('today')">${ui.l('search.dateSelectionToday')}</label>
<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').select('tomorrow')">${ui.l('search.dateSelectionTomorrow')}</label>
<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').select('thisWeek')">${ui.l('search.dateSelectionThisWeek')}</label>
<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').select('thisWeekend')">${ui.l('search.dateSelectionThisWeekend')}</label>
<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').select('nextWeek')">${ui.l('search.dateSelectionNextWeek')}</label>
<input onchange="ui.q('input-date[i=&quot;${this.x}&quot;]').select(e.target.value)" type="date" value="${this.getAttribute('value') && this.getAttribute('value').split('-').length == 3 ? this.getAttribute('value') : new Date().toISOString().substring(0, 10)}"/>`);
	}
	toggleYear() {
		var s = '', e = this.get('year'), y = new Date().getFullYear();
		var birthday = this.getAttribute('type') == 'birthday';
		for (var i = birthday ? 18 : y; i < (birthday ? 99 : y + 5); i++) {
			var i2 = birthday ? y - i : i;
			s += `<label onclick="ui.q('input-date[i=&quot;${this.x}&quot;]').selectYear(${i2})">${i2}</label>`;
		}
		this.toggle(e, s, 'Year');
	}
}
