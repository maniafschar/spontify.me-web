import { ui } from '../ui';

export { InputHashtags }

class InputHashtags extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.textContent = `
hashtags {
	position: relative;
}

hashtags category {
	width: 30%;
	position: absolute;
	left: 0;
}

hashtags label {
	cursor: pointer;
	display: block;
	position: relative;
	padding: 0.25em 0.75em;
	text-align: left;
	overflow-x: hidden;
	text-overflow: ellipsis;
	border-radius: 1em;
	cursor: pointer;
}

hashtags>div {
	margin-left: 30%;
	display: none;
	overflow-y: auto;
	max-height: 17em;
}

hashtags label.selected {
	font-weight: bold;
}

hashtags category label.selected::after {
	content: '>';
	position: absolute;
	right: 0;
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
}
settings field hashtags>div label,
search hashtags>div label {
	color: rgba(255, 255, 255, 0.4);
}

settings field hashtags>div label.selected,
search hashtags>div label.selected {
	color: white;
}`;
		this._root.appendChild(style);
		var element = document.createElement('hashtagButton');
		element.setAttribute('onclick', 'this.getRootNode().host.toggle(event)');
		this._root.appendChild(element);
		element = document.createElement('textarea');
		element.setAttribute('name', 'hashtagsDisp');
		element.setAttribute('part', 'textarea');
		element.setAttribute('maxlength', '250');
		element.setAttribute('transient', 'true');
		element.setAttribute('onkeyup', 'this.getRootNode().host.synchonizeTags(this.getRootNode())');
		element.setAttribute('style', 'height:2em;');
		element.textContent = InputHashtags.ids2Text(this.getAttribute('ids')) + (this.getAttribute('text') ? ' ' + this.getAttribute('text') : '').trim();
		this._root.appendChild(element);
		element = document.createElement('hashtags');
		element.setAttribute('style', 'display:none;');
		element.innerHTML = this.selection();
		this._root.appendChild(element);
		this.synchonizeTags(this._root);
		var r = this._root;
		setTimeout(function () { ui.adjustTextarea(r.querySelector('textarea')) }, 1000);
	}
	add(root, tag) {
		var e = root.querySelector('textarea');
		var s = e.value;
		if ((' ' + e.value + ' ').indexOf(' ' + tag + ' ') < 0)
			s += ' ' + tag;
		else
			s = s.replace(tag, '');
		while (s.indexOf('  ') > -1)
			s = s.replace('  ', ' ');
		e.value = s.trim();
		ui.adjustTextarea(e);
		this.synchonizeTags(root);
	}
	convert(hashtags) {
		var category = '';
		hashtags = hashtags.replace(/\n|\t|\r/g, ' ');
		for (var i = 0; i < ui.categories.length; i++) {
			for (var i2 = 0; i2 < ui.categories[i].values.length; i2++) {
				var t = ui.categories[i].values[i2].split('|');
				var i3 = hashtags.toLowerCase().indexOf(t[0].toLowerCase());
				if (i3 > -1) {
					category += '|' + i + '.' + t[1];
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
		var a = [];
		ids = ids.split('|');
		for (var i = 0; i < ids.length; i++) {
			var id = ids[i].split('\.');
			for (var i2 = 0; i2 < ui.categories[id[0]].values.length; i2++) {
				if (ui.categories[id[0]].values[i2].split('|')[1] == id[1]) {
					a.push(ui.categories[id[0]].values[i2].split('|')[0]);
					break;
				}
			}
		}
		a.sort(function (a, b) { return a.toLowerCase() > b.toLowerCase() ? 1 : -1 });
		return a.join(' ').trim();
	}
	selection() {
		var s = '<category>';
		for (var i = 0; i < ui.categories.length; i++)
			s += '<label ' + (i == 0 ? ' class="selected"' : '') + 'onclick="this.getRootNode().host.toggleSubCategories(this,' + i + ')">' + ui.categories[i].label + '</label>';
		s += '</category>';
		for (var i = 0; i < ui.categories.length; i++) {
			s += '<div' + (i == 0 ? ' style="display:block;"' : '') + '>';
			var subs = ui.categories[i].values.sort(function (a, b) { return a > b ? 1 : -1 });
			for (var i2 = 0; i2 < subs.length; i2++)
				s += '<label onclick="this.getRootNode().host.add(event.target.getRootNode(),&quot;' + subs[i2].split('|')[0] + '&quot;)">' + subs[i2].split('|')[0] + '</label>';
			s += '</div>';
		}
		return s;
	}
	synchonizeTags(root) {
		var textarea = root.querySelector('textarea');
		var tags = root.querySelector('hashtags').querySelectorAll('div>label');
		var s = textarea.value.toLowerCase();
		for (var i = 0; i < tags.length; i++)
			s.indexOf(tags[i].innerHTML.trim().toLowerCase()) < 0 ? ui.classRemove(tags[i], 'selected') : ui.classAdd(tags[i], 'selected');
		ui.adjustTextarea(textarea);
		var hts = this.convert(textarea.value);
		root.host.setAttribute('ids', hts.ids);
		root.host.setAttribute('text', hts.text);
	}
	toggle(event) {
		ui.toggleHeight(event.target.getRootNode().querySelector('hashtags'));
	}
	toggleSubCategories(e, i) {
		e = e.getRootNode().querySelector('hashtags');
		if (ui.classContains(e.querySelectorAll('category label')[i], 'selected'))
			return;
		var visibleBlock = e.querySelector('div[style*="block"]');
		ui.classRemove(e.querySelectorAll('category label.selected'), 'selected');
		ui.classAdd(e.querySelectorAll('category label')[i], 'selected');
		var a = e.querySelectorAll('div')[i];
		e.style.minHeight = '12em';
		var f = function () { ui.toggleHeight(a, function () { e.style.minHeight = null; }); };
		if (visibleBlock && visibleBlock != a)
			ui.toggleHeight(visibleBlock, f);
		else
			f.call();
	}
}