import { global } from '../global';
import { initialisation } from '../init';
import { ui } from '../ui';

export { InputDate };

class InputDate extends HTMLElement {
	firstCall = true;
	x = 0;
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.textContent = `${initialisation.elementsCss}
:host(*) {
	white-space: nowrap;
	overflow-x: auto;
	display: inline-block;
}

label {
	margin-bottom: 0;
	color: var(--popupText);
	padding: 0.34em 0.75em;
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
			element.setAttribute('onclick', 'this.getRootNode().host.toggleDay()');
			element.setAttribute('name', 'day');
			this._root.appendChild(element);
			element = document.createElement('label')
			element.setAttribute('onclick', 'this.getRootNode().host.toggleMonth()');
			element.setAttribute('name', 'month');
			this._root.appendChild(element);
			element = document.createElement('label')
			element.setAttribute('onclick', 'this.getRootNode().host.toggleYear()');
			element.setAttribute('name', 'year');
			this._root.appendChild(element);
			if (this.getAttribute('type') != 'date') {
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
			if (this.getAttribute('scroll')) {
				ui.on(this.getAttribute('scroll'), 'scroll', this.scroll);
			}
		}
		this.tabIndex = 0;
		this.select(this.getAttribute('value'));
	}
	static get observedAttributes() { return ['min', 'max']; }
	attributeChangedCallback(name, oldValue, newValue) {
		this.resetYear();
		this.resetMonth();
		this.resetDay();
	}
	get(name) {
		return this._root.querySelector('label[name="' + name + '"]');
	}
	getCalendar() {
		var s = `<style>
label {
	width: 2.5em;
	text-align: center;
	padding: 0.34em 0;
}
label.weekday {
	background: transparent;
	padding: 0;
	cursor: default;
}
label.weekend {
	color: rgb(0,0,100);
}
label.outdated {
	opacity: 0.5;
	cursor: default;
}
prev,
next {
	position: absolute;
	width: 1.5em;
	font-size: 2em;
	height: 85%;
	top: 15%;
	padding-top: 2em;
	opacity: 0.15;
	cursor: pointer;
}
prev {
	left: 0;
}
prev::after {
	content: '<';
}
next {
	right: 0;
}
next::after {
	content: '>';
}
</style>`;
		var m = this.get('month').getAttribute('value'), y = this.get('year').getAttribute('value'), maxDays = 31;
		var min = new Date(this.getAttribute('min'));
		var max = new Date(this.getAttribute('max'));
		if (!y) {
			if (max < new Date())
				this.selectYear(max.getFullYear() - 1);
			else
				this.selectYear(min.getFullYear());
			y = this.get('year').getAttribute('value');
		}
		if (!m) {
			this.selectMonth((max < new Date() ? max : min).getMonth() + 1);
			m = this.get('month').getAttribute('value');
		}
		if (m == '02')
			maxDays = y && new Date(parseInt(y), 1, 29).getDate() == 29 ? 29 : 28;
		else if (m == '04' || m == '06' || m == '09' || m == '11')
			maxDays = 30;
		for (var i = 1; i < 7; i++)
			s += `<label class="weekday${i < 6 ? '' : ' weekend'}">${ui.l('date.weekday' + i)}</label>`;
		s += `<label class="weekday weekend">${ui.l('date.weekday0')}</label><br/>`;
		var offset = (new Date(parseInt(y), parseInt(m) - 1, 1).getDay() + 6) % 7, today = new Date();
		for (var i = 0; i < offset; i++)
			s += `<label class="weekday">&nbsp;</label>`;
		var outdated, selectable = this.getAttribute('selectable');
		var maxMonth = parseInt(y) == max.getFullYear() && parseInt(m) == max.getMonth() + 1;
		var minMonth = parseInt(y) == min.getFullYear() && parseInt(m) == min.getMonth() + 1;
		for (var i = 1; i <= maxDays; i++) {
			outdated = maxMonth ? i > max.getDate() : minMonth ? i < min.getDate() : false;
			if (!outdated && selectable)
				outdated = selectable.indexOf(y + '-' + m + '-' + ('0' + i).slice(-2)) < 0;
			s += `<label ${outdated ? 'class="outdated"' : `onclick="InputDate.getField(${this.x}).selectDay(${i},true)"`} ${!outdated && (i + offset) % 7 > 0 && (i + offset) % 7 < 6 ? '' : ' class="weekend"'}">${i}</label>`;
			if ((i + offset) % 7 == 0)
				s += '<br/>';
		}
		for (var i = (new Date(parseInt(y), parseInt(m) - 1, maxDays).getDay() + 6) % 7; i < 6; i++)
			s += `<label class="weekday">&nbsp;</label>`;
		s += `<prev onclick="InputDate.getField(${this.x}).prevMonth(event)"></prev>`;
		s += `<next onclick="InputDate.getField(${this.x}).nextMonth(event)"></next>`;
		return s;
	}
	static getField(id) {
		var e;
		if (!id) {
			e = ui.q('dialog-hint span>style[i^="calendar"]');
			if (e)
				id = e.getAttribute('i').substring(8);
		}
		if (id) {
			e = ui.q('dialog-popup input-date[i="' + id + '"]');
			if (e)
				return e;
			return ui.q('input-date[i="' + id + '"]');
		}
	}
	nextMonth(event) {
		event.stopPropagation();
		var m = parseInt(this.get('month').getAttribute('value')) + 1;
		var y = parseInt(this.get('year').getAttribute('value'));
		if (m > 12) {
			++y;
			m = 1;
		}
		var max = new Date(this.getAttribute('max'));
		if (y <= max.getFullYear() && (y != max.getFullYear() || m <= max.getMonth() + 1)) {
			this.selectYear(y);
			this.selectMonth(m);
			ui.q('dialog-hint span>div').innerHTML = this.getCalendar();
		}
	}
	prevMonth(event) {
		event.stopPropagation();
		var m = parseInt(this.get('month').getAttribute('value')) - 1;
		var y = parseInt(this.get('year').getAttribute('value'));
		if (m < 1) {
			--y;
			m = 12;
		}
		var min = new Date(this.getAttribute('min'));
		if (y >= min.getFullYear() && (y != min.getFullYear() || m >= min.getMonth() + 1)) {
			this.selectYear(y);
			this.selectMonth(m);
			ui.q('dialog-hint span>div').innerHTML = this.getCalendar();
		}
	}
	resetDay() {
		if (this.get('year')) {
			var min = new Date(this.getAttribute('min')), max = new Date(this.getAttribute('max'));
			var d = new Date(this.get('year').getAttribute('value') + '-' + this.get('month').getAttribute('value') + '-' + this.get('day').getAttribute('value'));
			this.selectDay(min > d ? min.getDate() : d > max ? max.getDate() : d.getDate() != parseInt(this.get('day').getAttribute('value')) ?
				new Date(parseInt(this.get('year').getAttribute('value')), parseInt(this.get('month').getAttribute('value')), 0).getDate() : d.getDate());
		}
	}
	resetMonth() {
		if (this.get('year')) {
			var min = new Date(this.getAttribute('min')), max = new Date(this.getAttribute('max'));
			var d = new Date(this.get('year').getAttribute('value') + '-' + (this.get('month').getAttribute('value') ? this.get('month').getAttribute('value') : '01') + '-' + this.get('day').getAttribute('value'));
			this.selectMonth((min > d ? min.getMonth() : d > max ? max.getMonth() : d.getMonth()) + 1);
		}
	}
	resetYear() {
		if (this.get('year')) {
			var min = new Date(this.getAttribute('min')), max = new Date(this.getAttribute('max'));
			var d = new Date(this.get('year').getAttribute('value') + '-' + this.get('month').getAttribute('value') + '-' + this.get('day').getAttribute('value'));
			this.selectYear(min > d ? min.getFullYear() : d > max ? max.getFullYear() : d.getFullYear());
		}
	}
	scroll() {
		var e = InputDate.getField();
		if (e) {
			var m = parseInt(ui.cssValue('dialog-hint', 'margin-top'));
			if (isNaN(m))
				m = 0;
			ui.q('dialog-hint').style.top = (e.getBoundingClientRect().y + e.getBoundingClientRect().height + ui.emInPX - m) + 'px';
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
				this.selectYear(d.year);
				this.selectMonth(d.month);
				this.selectDay(d.day);
				this.selectHour(d.hour);
				this.selectMinute(d.minute);
			} else if (type)
				this._root.querySelector('label').innerHTML = type.indexOf('-') < 0 ? ui.l('search.dateSelection' + type.substring(0, 1).toUpperCase() + type.substring(1)) : global.date.formatDate(type);
			this.setAttribute('value', type);
		}
		ui.navigation.closeHint();
	}
	selectDay(i, next) {
		this.setValue('Day', i ? ('0' + i).slice(-2) : null, parseInt(i));
		if (next) {
			if (this.firstCall)
				this.toggleMonth();
			else
				ui.navigation.closeHint();
		}
	}
	selectHour(i, next) {
		this.setValue('Hour', i >= 0 ? ('0' + i).slice(-2) : null, parseInt(i));
		if (next) {
			if (this.firstCall)
				this.toggleMinute();
			else
				ui.navigation.closeHint();
		}
	}
	selectMinute(i, next) {
		this.setValue('Minute', i >= 0 ? ('0' + i).slice(-2) : null);
		if (next) {
			ui.navigation.closeHint();
			this.firstCall = false;
		}
	}
	selectMonth(i, next) {
		if (i)
			this.setValue('Month', ('0' + i).slice(-2), ui.l('date.month' + parseInt(i)).substring(0, 3));
		else
			this.setValue('Month', null);
		this.resetDay();
		if (next) {
			if (this.firstCall)
				this.toggleYear();
			else
				ui.navigation.closeHint();
		}
	}
	selectYear(i, next) {
		this.setValue('Year', i);
		this.resetMonth();
		this.resetDay();
		if (next) {
			if (this.firstCall && this.get('hour'))
				this.toggleHour();
			else
				ui.navigation.closeHint();
			if (!this.get('hour'))
				this.firstCall = false;
		}
	}
	setValue(field, value, label) {
		var e = this.get(field.toLowerCase());
		if (!e)
			return;
		if (value) {
			e.innerHTML = label || label == 0 ? label : value;
			e.setAttribute('value', value);
			ui.classAdd(e, 'filled');
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
		this.dispatchEvent(new CustomEvent('Date', { detail: { id: this.x, value: s, complete: this.getAttribute('complete') } }));
	}
	toggle(e, html) {
		if (e) {
			var m = parseInt(ui.cssValue('dialog-hint', 'margin-top'));
			if (isNaN(m))
				m = 0;
			var hinkyX = Math.max(e.getBoundingClientRect().x - ui.q('main').getBoundingClientRect().x + e.getBoundingClientRect().width / 2 - 2 * ui.emInPX, ui.emInPX * 1.5);
			ui.navigation.openHint({
				onclick: 'return',
				desc: '<style i="calendar' + this.x + '">label{z-index:2;position:relative;}label.time{width:4em;text-align:center;}</style><div style="max-height:20em;overflow-y:auto;' + (global.getDevice() == 'phone' ? 'font-size:0.8em;' : '') + '">' + html + '</div>',
				pos: '2em,' + (e.getBoundingClientRect().y + e.getBoundingClientRect().height + ui.emInPX - m) + 'px', size: 'auto,auto', hinkyClass: 'top', hinky: 'left:' + hinkyX + 'px;',
				noLogin: true
			});
			ui.swipe('dialog-hint div', function (dir, event) {
				var e = InputDate.getField();
				if (e) {
					if (dir == 'left')
						e.nextMonth(event);
					else if (dir == 'right')
						e.prevMonth(event);
				}
			});
		} else
			ui.navigation.closeHint();
	}
	toggleDay() {
		this.toggle(this.get('day'), this.getCalendar());
	}
	toggleHour() {
		var s = '', e = this.get('hour');
		for (var i = 0; i < 24; i++) {
			s += `<label onclick="InputDate.getField(${this.x}).selectHour(${i},true)" class="time">${i}</label>`;
			if ((i + 1) % 4 == 0)
				s += '<br/>';
		}
		this.toggle(e, s);
	}
	toggleMinute() {
		var s = '', e = this.get('minute');
		for (var i = 0; i < 60; i += 5) {
			s += `<label onclick="InputDate.getField(${this.x}).selectMinute(${i},true)" class="time">${i}</label>`;
			if ((i / 5 + 1) % 4 == 0)
				s += '<br/>';
		}
		this.toggle(e, s);
	}
	toggleMonth() {
		var min = new Date(this.getAttribute('min'));
		var max = new Date(this.getAttribute('max'));
		var y = this.get('year').getAttribute('value');
		if (!y) {
			this.selectYear((max < new Date() ? max : min).getFullYear());
			y = this.get('year').getAttribute('value');
		}
		var s = '<style>label{padding:0.34em 0.75em;}</style>', e = this.get('month');
		for (var i = parseInt(y) == min.getFullYear() ? min.getMonth() + 1 : 1;
			i < (parseInt(y) == max.getFullYear() ? max.getMonth() + 1 : 13); i++) {
			s += `<label onclick="InputDate.getField(${this.x}).selectMonth(${i},true)">${ui.l('date.month' + i)}</label>`;
			if (i % 3 == 0)
				s += '<br/>';
		}
		this.toggle(e, s);
	}
	toggleSearch() {
		this.toggle(this, `
<label onclick="InputDate.getField(${this.x}).select('all')">${ui.l('search.dateSelectionAll')}</label>
<label onclick="InputDate.getField(${this.x}).select('today')">${ui.l('search.dateSelectionToday')}</label>
<label onclick="InputDate.getField(${this.x}).select('tomorrow')">${ui.l('search.dateSelectionTomorrow')}</label>
<label onclick="InputDate.getField(${this.x}).select('thisWeek')">${ui.l('search.dateSelectionThisWeek')}</label>
<label onclick="InputDate.getField(${this.x}).select('thisWeekend')">${ui.l('search.dateSelectionThisWeekend')}</label>
<label onclick="InputDate.getField(${this.x}).select('nextWeek')">${ui.l('search.dateSelectionNextWeek')}</label>
<input onchange="InputDate.getField(${this.x}).select(event.target.value)" type="date" value="${this.getAttribute('value') && this.getAttribute('value').split('-').length == 3 ? this.getAttribute('value') : new Date().toISOString().substring(0, 10)}" style="width:10em;"/>`);
	}
	toggleYear() {
		var s = '<style>label{padding:0.34em 0;width:3.5em;text-align:center;}label.filler{opacity:0;cursor:default;}</style>', e = this.get('year');
		var min = new Date(this.getAttribute('min')).getFullYear(), max = new Date(this.getAttribute('max')).getFullYear();
		var desc = min < new Date().getFullYear();
		var maxPerRow = parseInt(ui.cssValue('main', 'width')) / ui.emInPX > 45 ? 10 : 5;
		if (max - min > maxPerRow) {
			for (var i = maxPerRow - (desc ? max : min) % maxPerRow; i > 0; i--)
				s += `<label class="filler"></label>`;
		}
		for (var i = 0; i <= max - min; i++) {
			var i2 = desc ? max - i : min + i;
			if (i2 % maxPerRow == 0)
				s += '<br/>';
			s += `<label onclick="InputDate.getField(${this.x}).selectYear(${i2},true)">${i2}</label>`;
		}
		if (max - min > maxPerRow) {
			for (var i = 0; i < (desc ? min - 1 : max + 1) % maxPerRow; i++)
				s += `<label class="filler"></label>`;
		}
		this.toggle(e, s);
	}
}
