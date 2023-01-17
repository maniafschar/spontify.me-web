import { ui } from "./ui";

export { hashtags }

class hashtags {
	static add(e, tag) {
		while (e.nodeName != 'HASHTAGS')
			e = e.parentElement;
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
	}
	static convert(hashtags) {
		var category = '';
		hashtags = hashtags.replace(/\n|\t|\r/g, ' ');
		for (var i = 0; i < ui.categories.length; i++) {
			for (var i2 = 0; i2 < ui.categories[i].subCategories.length; i2++) {
				var i3 = hashtags.toLowerCase().indexOf(ui.categories[i].subCategories[i2].toLowerCase());
				if (i3 > -1) {
					category += global.separatorTech + i + '.' + i2;
					hashtags = hashtags.substring(0, i3) + hashtags.substring(i3 + ui.categories[i].subCategories[i2].length);
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
	static display(attributes) {
		var s = '';
		if (attributes) {
			s = '<category class="bgColor" onclick="hashtags.toggleSubCategories(this,0)">' + ui.l('settings.openAttributes') + '</category><div>';
			var attr = ui.attributes.sort(function (a, b) { return a > b ? 1 : -1 });
			for (var i = 0; i < attr.length; i++)
				s += '<label class="multipleLabel" onclick="hashtags.add(this,&quot;' + attr[i] + '&quot;)">' + attr[i] + '</label>';
			s += '</div>';
		} else {
			for (var i = 0; i < ui.categories.length; i++)
				s += '<category class="bgColor" onclick="hashtags.toggleSubCategories(this,' + i + ')">' + ui.categories[i].label + '</category>';
			for (var i = 0; i < ui.categories.length; i++) {
				s += '<div>';
				var subs = ui.categories[i].subCategories.sort(function (a, b) { return a > b ? 1 : -1 });
				for (var i2 = 0; i2 < subs.length; i2++)
					s += '<label class="multipleLabel" onclick="hashtags.add(this,&quot;' + subs[i2] + '&quot;)">' + subs[i2] + '</label>';
				s += '</div>';
			}
		}
		return s;
	}
	static toggleSubCategories(e, i) {
		while (e.nodeName != 'HASHTAGS')
			e = e.parentElement;
		var e2 = e.querySelector('div[style*="block"]');
		e = e.querySelectorAll('div')[i];
		var f = function () { ui.toggleHeight(e) };
		if (e2 && e2 != e)
			ui.toggleHeight(e2, f);
		else
			f.call();
	}
}