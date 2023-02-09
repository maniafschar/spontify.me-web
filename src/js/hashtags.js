import { ui } from "./ui";

export { hashtags }

class hashtags {
	static add(e, tag) {
		e = ui.parents(e, 'hashtags');
		e = e.previousElementSibling;
		var s = e.value;
		if ((' ' + e.value + ' ').indexOf(' ' + tag + ' ') < 0)
			s += ' ' + tag;
		else
			s = s.replace(tag, '');
		while (s.indexOf('  ') > -1)
			s = s.replace('  ', ' ');
		e.value = s.trim();
		ui.adjustTextarea(e);
		hashtags.synchonizeTags(e);
	}
	static convert(hashtags) {
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
		return { category: category, hashtags: hashtags.replace(/ /g, '|') };
	}
	static display() {
		var s = '<category>';
		for (var i = 0; i < ui.categories.length; i++)
			s += '<label ' + (i == 0 ? ' class="selected"' : '') + 'onclick="hashtags.toggleSubCategories(this,' + i + ')">' + ui.categories[i].label + '</label>';
		s += '</category>';
		for (var i = 0; i < ui.categories.length; i++) {
			s += '<div' + (i == 0 ? ' style="display:block;"' : '') + '>';
			var subs = ui.categories[i].values.sort(function (a, b) { return a > b ? 1 : -1 });
			for (var i2 = 0; i2 < subs.length; i2++)
				s += '<label onclick="hashtags.add(this,&quot;' + subs[i2].split('|')[0] + '&quot;)">' + subs[i2].split('|')[0] + '</label>';
			s += '</div>';
		}
		return s;
	}
	static filter(e) {
		ui.adjustTextarea(e);
		var s = e.value.toLowerCase(), id = 'popup ';
		if (ui.q(id + 'hashtags').style.maxHeight)
			ui.q(id + 'hashtags').style.maxHeight = null;
		var list = ui.qa(id + 'hashtags label');
		for (var i = 0; i < list.length; i++) {
			list[i].style.maxWidth = list[i].innerText.toLowerCase().indexOf(s) > -1 ? null : 0;
			list[i].style.padding = list[i].style.maxWidth;
			list[i].style.margin = list[i].style.maxWidth;
		}
		var list = ui.qa(id + 'hashtags>div');
		for (var i = 0; i < list.length; i++) {
			list[i].style.maxHeight = list[i].querySelector('label:not([style*="max-width"])') ? null : 0;
			list[i].style.padding = list[i].style.maxHeight;
			list[i].previousElementSibling.style.maxHeight = list[i].style.maxHeight;
			list[i].previousElementSibling.style.padding = list[i].style.maxHeight;
		}
		console.log(e.value + ': ' + e.selectionStart);
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
	static synchonizeTags(e) {
		if (e.target)
			e = e.target;
		if (e.nodeName != 'TEXTAREA')
			e = ui.parents(e, 'hashtags').previousElementSibling
		var tags = e.nextElementSibling.querySelectorAll('div>label');
		var s = e.value.toLowerCase();
		for (var i = 0; i < tags.length; i++)
			s.indexOf(tags[i].innerText.toLowerCase()) < 0 ? ui.classRemove(tags[i], 'selected') : ui.classAdd(tags[i], 'selected');
		ui.adjustTextarea(e);
	}
	static toggleSubCategories(e, i) {
		e = ui.parents(e, 'hashtags');
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