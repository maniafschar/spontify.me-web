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
					category += global.separatorTech + i + '.' + t[1];
					hashtags = hashtags.substring(0, i3) + hashtags.substring(i3 + t[0].length);
				}
			}
		}
		if (category)
			category = category.substring(1);
		while (category.length > 255)
			category = category.substring(0, category.lastIndexOf(global.separatorTech));
		while (hashtags.indexOf('  ') > -1)
			hashtags = hashtags.replace('  ', ' ');
		if (hashtags.length > 255)
			hashtags = hashtags.substring(0, 255);
		return { category: category, hashtags: hashtags.trim() };
	}
	static display() {
		var s = '';
		for (var i = 0; i < ui.categories.length; i++)
			s += '<category class="bgColor" onclick="hashtags.toggleSubCategories(this,' + i + ')">' + ui.categories[i].label + '</category>';
		for (var i = 0; i < ui.categories.length; i++) {
			s += '<div>';
			var subs = ui.categories[i].values.sort(function (a, b) { return a > b ? 1 : -1 });
			for (var i2 = 0; i2 < subs.length; i2++)
				s += '<label class="multipleLabel" onclick="hashtags.add(this,&quot;' + subs[i2].split('|')[0] + '&quot;)">' + subs[i2].split('|')[0] + '</label>';
			s += '</div>';
		}
		return s;
	}
	static synchonizeTags(e) {
		if (e.target)
			e = e.target;
		if (e.nodeName != 'TEXTAREA')
			e = ui.parents(e, 'hashtags').previousElementSibling
		var tags = e.nextElementSibling.querySelectorAll('label');
		var s = e.value.toLowerCase();
		for (var i = 0; i < tags.length; i++)
			tags[i].style.color = s.indexOf(tags[i].innerText.toLowerCase()) < 0 ? '' : 'black';
		ui.adjustTextarea(e);
	}
	static toggleSubCategories(e, i) {
		e = ui.parents(e, 'hashtags');
		var e2 = e.querySelector('div[style*="block"]');
		e = e.querySelectorAll('div')[i];
		var f = function () { ui.toggleHeight(e) };
		if (e2 && e2 != e)
			ui.toggleHeight(e2, f);
		else
			f.call();
	}
}