import { initialisation } from '../init';
import { ui } from '../ui';

export { InputHashtags };

class InputHashtags extends HTMLElement {
	static locationAttributes = [];
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
		if (InputHashtags.locationAttributes.length == 0) {
			InputHashtags.locationAttributes.push(ui.l('locations.attributeMuseum') + '|x.3');
			InputHashtags.locationAttributes.push(ui.l('locations.attributeCinema') + '|x.2');
			InputHashtags.locationAttributes.push(ui.l('locations.attributeSportsbar') + '|x.1');
		}
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.textContent = `${initialisation.elementsCss}
hashtags {
	position: relative;
	overflow: hidden;
	margin-top: 0.5em;
	height: 17em;
}

hashtags category {
	width: 30%;
	position: absolute;
	left: 0;
	height: 100%;
}

hashtags category label {
	cursor: pointer;
	display: block;
	position: relative;
	padding: 0.25em 0.75em;
	text-align: left;
	overflow-x: hidden;
	text-overflow: ellipsis;
	border-radius: 1em;
	background: transparent;
	color: var(--text);
}

:host(.location) hashtags div {
	display: block;
    margin-left: 0;
    text-align: center;
}

hashtags div label {
	background: rgba(255, 255, 255, 0.2);
}

hashtags div label.selected {
	background: rgba(255, 255, 255, 0.5);
}

hashtags>div {
	margin-left: 30%;
	display: none;
	overflow-y: auto;
	height: 100%;
}

hashtags label.selected {
	font-weight: bold;
}

hashtags category label.selected::after {
	content: '>';
	position: absolute;
	right: 0.25em;
	top: 0.25em;
}

hashtagButton {
	font-size: 2em;
	position: absolute;
	right: 0;
	top: 0;
	padding: 0.2em;
	cursor: pointer;
	z-index: 1;
	color: black;
}

hashtagButton::before {
	content: '+';
}`;
		this._root.appendChild(style);
		var element = document.createElement('hashtagButton');
		element.setAttribute('onclick', 'this.getRootNode().host.toggle(event)');
		this._root.appendChild(element);
		element = document.createElement('textarea');
		element.setAttribute('name', 'hashtagsDisp');
		element.setAttribute('maxlength', '250');
		element.setAttribute('transient', 'true');
		element.setAttribute('onkeyup', 'this.getRootNode().host.synchonizeTags(true)');
		element.setAttribute('style', 'height:2em;');
		this._root.appendChild(element);
		element = document.createElement('hashtags');
		element.setAttribute('style', 'display:none;');
		element.innerHTML = this.selection();
		this._root.appendChild(element);
		this.attributeChangedCallback();
		var r = this._root;
		setTimeout(function () { ui.adjustTextarea(r.querySelector('textarea')) }, 1000);
	}
	static get observedAttributes() { return ['ids', 'text']; }
	attributeChangedCallback(name, oldValue, newValue) {
		var e = this._root.querySelector('textarea');
		if (e)
			e.value = (InputHashtags.ids2Text(this.getAttribute('ids')) + (this.getAttribute('text') ? ' ' + this.getAttribute('text').replace(/\|/g, ' ') : '')).trim();
	}
	add(tag) {
		var e = this._root.querySelector('textarea');
		var s = e.value;
		if ((' ' + e.value + ' ').indexOf(' ' + tag + ' ') < 0)
			s += ' ' + tag;
		else
			s = s.replace(tag, '');
		while (s.indexOf('  ') > -1)
			s = s.replace('  ', ' ');
		e.value = s.trim();
		ui.adjustTextarea(e);
		this.synchonizeTags();
	}
	convert(hashtags) {
		var category = '', i3;
		hashtags = hashtags.replace(/\n|\t|\r/g, ' ');
		for (var i = 0; i < InputHashtags.locationAttributes.length; i++) {
			var s = InputHashtags.locationAttributes[i].split('\|');
			if ((i3 = hashtags.indexOf(s[0])) > -1) {
				category += '|' + s[1];
				hashtags = hashtags.substring(0, i3) + hashtags.substring(i3 + s[0].length);
			}
		}
		for (var i = 0; i < ui.categories.length; i++) {
			for (var i2 = 0; i2 < ui.categories[i].values.length; i2++) {
				var t = ui.categories[i].values[i2].split('|');
				i3 = hashtags.toLowerCase().indexOf(t[0].toLowerCase());
				if (i3 > -1) {
					category += '|' + ui.categories[i].key + '.' + t[1];
					hashtags = hashtags.substring(0, i3) + hashtags.substring(i3 + t[0].length);
				}
			}
		}
		if (category)
			category = category.substring(1);
		while (category.length > 255)
			category = category.substring(0, category.lastIndexOf('|'));
		hashtags = hashtags.trim();
		while (hashtags.indexOf('  ') > -1)
			hashtags = hashtags.replace('  ', ' ').trim();
		if (hashtags.length > 255)
			hashtags = hashtags.substring(0, 255);
		return { ids: category, text: hashtags.replace(/ /g, '|') };
	}
	static ids2Text(ids) {
		if (!ids)
			return '';
		var a = [], cats = {};
		ids = ids.split('|');
		for (var i = 0; i < ui.categories.length; i++)
			cats['cat' + ui.categories[i].key] = ui.categories[i].values;
		for (var i = 0; i < ids.length; i++) {
			var id = ids[i].split('\.');
			if (cats['cat' + id[0]])
				for (var i2 = 0; i2 < cats['cat' + id[0]].length; i2++) {
					if (cats['cat' + id[0]][i2].split('|')[1] == id[1]) {
						a.push(cats['cat' + id[0]][i2].split('|')[0]);
						break;
					}
				}
			else {
				for (var i2 = 0; i2 < InputHashtags.locationAttributes.length; i2++) {
					var s = InputHashtags.locationAttributes[i2].split('\|');
					if (ids[i] == s[1])
						a.push(s[0]);
				}
			}
		}
		a.sort(function (a, b) { return a.toLowerCase() > b.toLowerCase() ? 1 : -1 });
		return a.join(' ').trim();
	}
	selection() {
		var s = '';
		if (this.classList.contains('location')) {
			s = '<div>';
			for (var i = 0; i < ui.categories.length; i++) {
				if (ui.categories[i].key == 2) {
					var subs = [...ui.categories[i].values];
					for (var i2 = 0; i2 < InputHashtags.locationAttributes.length; i2++)
						subs.push(InputHashtags.locationAttributes[i2]);
					subs = subs.sort(function (a, b) { return a > b ? 1 : -1 });
					for (var i2 = 0; i2 < subs.length; i2++)
						s += '<label onclick="this.getRootNode().host.add(&quot;' + subs[i2].split('|')[0] + '&quot;)">' + subs[i2].split('|')[0] + '</label>';
					break;
				}
			}
			s += '</div>';
		} else {
			s = '<category>';
			for (var i = 0; i < ui.categories.length; i++)
				s += '<label ' + (i == 0 ? ' class="selected"' : '') + 'onclick="this.getRootNode().host.toggleSubCategories(this,' + i + ')">' + ui.categories[i].label + '</label>';
			s += '</category>';
			for (var i = 0; i < ui.categories.length; i++) {
				s += '<div' + (i == 0 ? ' style="display:block;"' : '') + '>';
				subs = ui.categories[i].values.sort(function (a, b) { return a > b ? 1 : -1 });
				for (var i2 = 0; i2 < subs.length; i2++)
					s += '<label onclick="this.getRootNode().host.add(&quot;' + subs[i2].split('|')[0] + '&quot;)">' + subs[i2].split('|')[0] + '</label>';
				s += '</div>';
			}
		}
		return s;
	}
	synchonizeTags(doNotCalcTextareaHeight) {
		var textarea = this._root.querySelector('textarea');
		var tags = this._root.querySelector('hashtags').querySelectorAll('div>label');
		var s = textarea.value.toLowerCase();
		for (var i = 0; i < tags.length; i++)
			s.indexOf(tags[i].innerHTML.trim().toLowerCase()) < 0 ? ui.classRemove(tags[i], 'selected') : ui.classAdd(tags[i], 'selected');
		if (!doNotCalcTextareaHeight)
			ui.adjustTextarea(textarea);
		var hts = this.convert(textarea.value);
		this._root.host.setAttribute('ids', hts.ids);
		this._root.host.setAttribute('text', hts.text);
	}
	toggle(event) {
		ui.toggleHeight(event.target.getRootNode().querySelector('hashtags'));
		this.synchonizeTags()
	}
	toggleSubCategories(e, i) {
		e = e.getRootNode().querySelector('hashtags');
		if (ui.classContains(e.querySelectorAll('category label')[i], 'selected'))
			return;
		var visibleBlock = e.querySelector('div[style*="block"]');
		ui.classRemove(e.querySelectorAll('category label.selected'), 'selected');
		ui.classAdd(e.querySelectorAll('category label')[i], 'selected');
		var a = e.querySelectorAll('div')[i];
		e.style.minHeight = (2.4 * ui.categories.length) + 'em';
		var f = function () { ui.toggleHeight(a, function () { e.style.minHeight = null; }); };
		if (visibleBlock && visibleBlock != a)
			ui.toggleHeight(visibleBlock, f);
		else
			f.call();
	}
}
