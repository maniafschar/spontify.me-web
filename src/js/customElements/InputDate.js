import { global } from '../global';
import { initialisation } from '../init';
import { ui } from '../ui';

export { InputDate }

class InputDate extends HTMLElement {
	x = 0;
	nowizard = false;
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.textContent = `${initialisation.customElementsCss}
:host(*) {
	white-space: nowrap;
	overflow-x: auto;
	display: inline-block;
}

label {
	margin-bottom: 0;
	color: var(--popupText);
}

label.filled {
	opacity: 1;
}`;
		this._root.appendChild(style);
		this.x = new Date().getTime() + Math.random();
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
				element.setAttribute('style', 'margin-left:1em;');
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
	static getField(id) {
		var e = ui.q('dialog-popup input-date[i="' + id + '"]');
		if (e)
			return e;
		return ui.q('input-date[i="' + id + '"]');
	}
	resetDay(y, m) {
		var e = this.get('day');
		if (e.getAttribute('value')) {
			var d = parseInt(e.getAttribute('value'));
			if (new Date(parseInt(y ? y : this.get('year').getAttribute('value')), (m ? m : parseInt(this.get('month').getAttribute('value'))) - 1, d).getDate() != d) {
				e.innerHTML = ui.l('date.labelDay');
				e.setAttribute('value', '');
				ui.classRemove(e, 'filled');
			}
		}
	}
	select(type) {
		if (type == 'all') {
			this._root.querySelector('label').innerHTML = ui.l('events.date');
			this.removeAttribute('value');
		} else {
			var e = this.get('year');
			if (e) {
				var d = global.date.getDateFields(type || '');
				this.nowizard = true;
				this.selectYear(d.year);
				this.selectMonth(d.month);
				this.selectDay(d.day);
				this.selectHour(d.hour);
				this.selectMinute(d.minute);
				this.nowizard = false;
			} else if (type)
				this._root.querySelector('label').innerHTML = type.indexOf('-') < 0 ? ui.l('search.dateSelection' + type.substring(0, 1).toUpperCase() + type.substring(1)) : global.date.formatDate(type);
			this.setAttribute('value', type);
		}
		ui.navigation.closeHint();
	}
	selectDay(i) {
		if (i)
			this.setValue('Day', ('0' + i).slice(-2), parseInt(i));
		else
			this.setValue('Day', null);
	}
	selectHour(i) {
		if (i)
			this.setValue('Hour', ('0' + i).slice(-2), parseInt(i));
		else
			this.setValue('Hour', null);
	}
	selectMinute(i) {
		this.setValue('Minute', i ? ('0' + i).slice(-2) : null);
	}
	selectMonth(i) {
		this.resetDay(null, i);
		if (i)
			this.setValue('Month', ('0' + i).slice(-2), ui.l('date.month' + parseInt(i)));
		else
			this.setValue('Month', null);
	}
	selectYear(i) {
		this.resetDay(i);
		this.setValue('Year', i);
	}
	setValue(field, value, label) {
		var e = this.get(field.toLowerCase());
		if (!e)
			return;
		if (value) {
			e.innerHTML = label ? label : value;
			e.setAttribute('value', value);
			ui.classAdd(e, 'filled');
			if (!this.nowizard) {
				var next, exec;
				if (field == 'Year') {
					next = 'month';
					exec = this.toggleMonth;
				} else if (field == 'Month') {
					next = 'day';
					exec = this.toggleDay;
				} else if (field == 'Day') {
					next = 'hour';
					exec = this.toggleHour;
				} else if (field == 'Hour') {
					next = 'minute';
					exec = this.toggleMinute;
				}
				if (exec && this.get(next) && !this.get(next).getAttribute('value'))
					exec.call(this);
			}
		} else {
			e.innerHTML = ui.l('date.label' + field);
			e.setAttribute('value', '');
			ui.classRemove(e, 'filled');
		}
		var s = this.get('year').getAttribute('value');
		s += '-' + this.get('month').getAttribute('value');
		s += '-' + this.get('day').getAttribute('value');
		if (this.get('hour')) {
			s += ' ' + this.get('hour').getAttribute('value');
			s += ':' + this.get('minute').getAttribute('value');
			s += ':00';
		}
		this.setAttribute('value', s);
		this.setAttribute('complete', '' + (s.length == 10 || s.length == 19));
	}
	toggle(e, html, close) {
		ui.navigation.openHint({
			desc: '<style>label{z-index:2;position:relative;}label.time{width:4em;text-align:center;}</style><div style="max-height:22em;overflow-y:auto;' + (!close || close == 'Year' ? '' : 'white-space:nowrap;') + (global.getDevice() == 'phone' ? 'font-size:0.8em;' : '') + '">' + html + '</div>',
			onclose: close ? 'InputDate.getField(' + this.x + ').select' + close + '()' : null,
			pos: '2%,' + (e.getBoundingClientRect().y + e.getBoundingClientRect().height + ui.emInPX) + 'px', size: '96%,auto', hinkyClass: 'top', hinky: 'left:' + (e.getBoundingClientRect().x - ui.q('main').getBoundingClientRect().x + e.getBoundingClientRect().width / 2 - 6) + 'px;',
			noLogin: true
		});
	}
	toggleDay() {
		var s = '<style>label{width:2.5em;text-align:center;padding:0.34em 0;}label.weekday{background:transparent;padding:0;cursor:default;}label.weekend{color:rgb(0,0,100);}label.outdated{opacity:0.5;cursor:default;}</style>', e = this.get('day'), m = this.get('month').getAttribute('value'), y = this.get('year').getAttribute('value'), max = 31;
		if (!y) {
			this.toggleYear();
			return;
		}
		if (m) {
			if (m == '02')
				max = y && new Date(parseInt(y), 1, 29).getDate() == 29 ? 29 : 28;
			else if (m == '04' || m == '06' || m == '09' || m == '11')
				max = 30;
		} else {
			this.toggleMonth();
			return;
		}
		for (var i = 1; i < 7; i++)
			s += `<label class="weekday${i < 6 ? '' : ' weekend'}">${ui.l('date.weekday' + i)}</label>`;
		s += `<label class="weekday weekend">${ui.l('date.weekday0')}</label><br/>`;
		var offset = (new Date(parseInt(y), parseInt(m) - 1, 1).getDay() + 6) % 7, today = new Date();
		for (var i = 0; i < offset; i++)
			s += `<label class="weekday">&nbsp;</label>`;
		for (var i = 1; i <= max; i++) {
			var outdated = parseInt(y) == today.getFullYear() && parseInt(m) == today.getMonth() + 1 && i < today.getDate();
			s += `<label ${outdated ? 'class="outdated"' : `onclick="InputDate.getField(${this.x}).selectDay(${i})"`} ${!outdated && (i + offset) % 7 > 0 && (i + offset) % 7 < 6 ? '' : ' class="weekend"'}">${i}</label>`;
			if ((i + offset) % 7 == 0)
				s += '<br/>';
		}
		for (var i = (new Date(parseInt(y), parseInt(m) - 1, max).getDay() + 6) % 7; i < 6; i++)
			s += `<label class="weekday">&nbsp;</label>`;
		this.toggle(e, s, 'Day');
	}
	toggleHour() {
		var s = '', e = this.get('hour');
		for (var i = 0; i < 24; i++) {
			s += `<label onclick="InputDate.getField(${this.x}).selectHour(${i})" class="time">${i}</label>`;
			if ((i + 1) % 6 == 0)
				s += '<br/>';
		}
		this.toggle(e, s, 'Hour');
	}
	toggleMinute() {
		var s = '', e = this.get('minute');
		for (var i = 0; i < 60; i += 5) {
			s += `<label onclick="InputDate.getField(${this.x}).selectMinute(${i})" class="time">${i}</label>`;
			if ((i / 5 + 1) % 4 == 0)
				s += '<br/>';
		}
		this.toggle(e, s, 'Minute');
	}
	toggleMonth() {
		var y = this.get('year').getAttribute('value');
		if (!y) {
			this.toggleYear();
			return;
		}
		var s = '<style>label{padding:0.34em 0.75em;}</style>', e = this.get('month');
		var i = parseInt(y) == new Date().getFullYear() ? new Date().getMonth() + 1 : 1;
		for (; i < 13; i++) {
			s += `<label onclick="InputDate.getField(${this.x}).selectMonth(${i})">${ui.l('date.month' + i)}</label>`;
			if (i % 3 == 0)
				s += '<br/>';
		}
		this.toggle(e, s, 'Month');
	}
	toggleSearch() {
		this.toggle(this, `
<label onclick="InputDate.getField(${this.x}).select('all')">${ui.l('search.dateSelectionAll')}</label>
<label onclick="InputDate.getField(${this.x}).select('today')">${ui.l('search.dateSelectionToday')}</label>
<label onclick="InputDate.getField(${this.x}).select('tomorrow')">${ui.l('search.dateSelectionTomorrow')}</label>
<label onclick="InputDate.getField(${this.x}).select('thisWeek')">${ui.l('search.dateSelectionThisWeek')}</label>
<label onclick="InputDate.getField(${this.x}).select('thisWeekend')">${ui.l('search.dateSelectionThisWeekend')}</label>
<label onclick="InputDate.getField(${this.x}).select('nextWeek')">${ui.l('search.dateSelectionNextWeek')}</label>
<input onchange="InputDate.getField(${this.x}).select(event.target.value)" type="date" value="${this.getAttribute('value') && this.getAttribute('value').split('-').length == 3 ? this.getAttribute('value') : new Date().toISOString().substring(0, 10)} style="width:10em;"/>`);
	}
	toggleYear() {
		var s = '<style>label{padding:0.34em 0;width:3.5em;text-align:center;}</style>', e = this.get('year'), y = new Date().getFullYear();
		var birthday = this.getAttribute('type') == 'birthday';
		for (var i = birthday ? 18 : y; i < (birthday ? 99 : y + 5); i++) {
			var i2 = birthday ? y - i : i;
			s += `<label onclick="InputDate.getField(${this.x}).selectYear(${i2})">${i2}</label>`;
		}
		this.toggle(e, s, 'Year');
	}
}
