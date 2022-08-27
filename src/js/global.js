import { communication } from './communication';
import { geoData } from './geoData';
import { Contact, Location, model } from './model';
import { ui } from './ui';

export { global };

class global {
	static appTitle = 'spontify.me';
	static appVersion = '0.1.5';
	static language = null;
	static minLocations = 5;
	static paused = false;
	static server = 'https://spontify.me/rest/';
	static serverImg = '';
	static separator = ' · ';
	static url = '';

	static date = {
		formatDate(d, type) {
			if (!d)
				return '';
			var d2 = global.date.server2Local(d);
			if (d2 instanceof Date)
				return ui.l('weekday' + (type ? 'Long' : '') + d2.getDay()) + ' ' + d2.getDate() + '.' + (d2.getMonth() + 1) + '.' + (d2.getFullYear() + ' ').slice(-3) + d2.getHours() + ':' + ('0' + d2.getMinutes()).slice(-2);
			return d2;
		},
		getDateFields(d) {
			if (d instanceof Date) {
				return {
					year: d.getFullYear(),
					month: ('0' + (d.getMonth() + 1)).slice(-2),
					day: ('0' + d.getDate()).slice(-2),
					hour: ('0' + d.getHours()).slice(-2),
					minute: ('0' + d.getMinutes()).slice(-2),
					second: ('0' + d.getSeconds()).slice(-2),
					time: true
				};
			}
			if (d.year && d.day)
				return d;
			if (d.indexOf('-') < 0 && d.length == 8)
				d = d.substring(0, 4) + '-' + d.substring(4, 6) + '-' + d.substring(6);
			var p1 = d.indexOf('-'), p2 = d.indexOf('-', p1 + 1), p3 = d.replace('T', ' ').indexOf(' '), p4 = d.indexOf(':'), p5 = d.indexOf(':', p4 + 1), p6 = d.indexOf('.');
			return {
				year: d.substring(0, p1),
				month: d.substring(p1 + 1, p2),
				day: d.substring(p2 + 1, p3 < 0 ? d.length : p3),
				hour: p4 < 0 ? 0 : d.substring(p3 + 1, p4),
				minute: p4 < 0 ? 0 : d.substring(p4 + 1, p5 > 0 ? p5 : d.length),
				second: p5 < 0 ? 0 : d.substring(p5 + 1, p6 < 0 ? d.length : p6),
				time: p4 > 0
			};
		},
		getDateHint(d) {
			var today = new Date(), l;
			today.setHours(0);
			today.setMinutes(0);
			today.setSeconds(0);
			var diff = (d.getTime() - today.getTime()) / 86400000;
			if (d.getDate() == today.getDate() && d.getMonth() == today.getMonth())
				l = 'today';
			else if (diff > 0) {
				if (diff < 2)
					l = 'tomorrow';
				else if (diff < 3)
					l = 'tomorrowPlusOne';
				else if (global.date.getWeekNumber(d)[1] == global.date.getWeekNumber(today)[1])
					l = 'this';
				else if (diff < 7)
					l = 'next';
			} else if (diff > -1)
				l = 'yesterday';
			return l ? ui.l('events.' + l) : '{0}';
		},
		getWeekNumber(date) {
			var d = new Date(+date);
			d.setHours(0, 0, 0);
			d.setDate(d.getDate() + 4 - (d.getDay() || 7));
			var yearStart = new Date(d.getFullYear(), 0, 1);
			var weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
			return [d.getFullYear(), weekNo];
		},
		local2server(d) {
			if (!d)
				return d;
			if (!(d instanceof Date)) {
				d = global.date.getDateFields(d);
				d = new Date(d.year, parseInt(d.month) - 1, d.day, d.hour, d.minute, d.second);
			}
			return d.toISOString();
		},
		server2Local(d) {
			if (!d)
				return d;
			if (d instanceof Date)
				return d;
			d = global.date.getDateFields(d);
			return new Date(Date.UTC(d.year, parseInt(d.month) - 1, d.day, d.hour, d.minute, d.second));
		}
	};

	static deco(data) {
		if (!data)
			return data;
		var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
		var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, dec = '', tmp_arr = [];
		data += '';
		do {
			h1 = b64.indexOf(data.charAt(i++));
			h2 = b64.indexOf(data.charAt(i++));
			h3 = b64.indexOf(data.charAt(i++));
			h4 = b64.indexOf(data.charAt(i++));
			bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
			o1 = bits >> 16 & 0xff;
			o2 = bits >> 8 & 0xff;
			o3 = bits & 0xff;
			if (h3 == 64)
				tmp_arr[ac++] = String.fromCharCode(o1);
			else if (h4 == 64)
				tmp_arr[ac++] = String.fromCharCode(o1, o2);
			else
				tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
		} while (i < data.length);
		dec = tmp_arr.join('');
		return dec;
	}
	static decParam(p) {
		if (!p || p.indexOf('=') < 1)
			return;
		var s = global.deco(p.substring(0, p.lastIndexOf('=')));
		var x = 0;
		for (var i = 2; i < s.length; i++) {
			if (!isNaN(s.substring(i, i + 1)))
				x += parseInt(s.substring(i, i + 1), 10);
		}
		if (x != parseInt(p.substring(p.lastIndexOf('=') + 1), 10))
			return;
		return s;
	}
	static enco(data) {
		if (!data)
			return data;
		var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
		var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc = '', tmp_arr = [];
		do {
			o1 = data.charCodeAt(i++);
			o2 = data.charCodeAt(i++);
			o3 = data.charCodeAt(i++);
			bits = o1 << 16 | o2 << 8 | o3;
			h1 = bits >> 18 & 0x3f;
			h2 = bits >> 12 & 0x3f;
			h3 = bits >> 6 & 0x3f;
			h4 = bits & 0x3f;
			tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
		} while (i < data.length);
		enc = tmp_arr.join('');
		var r = data.length % 3;
		return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
	}
	static encParam(p) {
		var x = 0;
		for (var i = 2; i < p.length; i++) {
			if (!isNaN(p.substring(i, i + 1)))
				x += parseInt(p.substring(i, i + 1), 10);
		}
		return global.enco(p) + '=' + x;
	}
	static getDevice() {
		var ua = navigator.userAgent.toLowerCase();
		var m = ua.indexOf('mobile') > -1;
		var a = ua.indexOf('android') > -1;
		var p = ua.indexOf('phone') > -1;
		var i = ua.indexOf('ipad') > -1;
		if ((a && !m) || i)
			return 'tablet';
		if (m || a || p)
			return 'phone';
		return 'computer';
	}
	static getOS() {
		if (global.isBrowser())
			return 'web';
		return /Android/i.test(navigator.userAgent) || /amazon-fireos/i.test(navigator.userAgent) ? 'android' : 'ios';
	}
	static getParam(n) {
		var v;
		if (window.location && window.location.search)
			v = window.location.search;
		if (!v || v.indexOf('?') < 0)
			v = global.url;
		if (v) {
			if (v.indexOf('?') > -1)
				v = v.substring(v.indexOf('?') + 1);
			if (!n)
				return v;
			v = v.split('&');
			for (var i = 0; i < v.length; i++) {
				var p = v[i].split('=');
				if (p[0] == n)
					return decodeURI(p[1]);
			}
		}
	}
	static getRegEx(f, v) {
		if (v)
			return 'REGEXP_LIKE(' + f + ',\'' + v.replace(v.indexOf(',') > -1 ? /,/g : /\u0015/g, '|') + '\')=1';
		return '1=0';
	}
	static isBrowser() {
		return window.cordova ? false : true;
	}
	static string = {
		emoji: /\p{Extended_Pictographic}/ug,
		extractNewsAdHoc(s) {
			var r = {};
			if ((s.indexOf('rl:') == 0 || s.indexOf('rp:') == 0) && s.lastIndexOf(':') == s.length - 2) {
				s = s.split(':');
				r.type = 'rating';
				r.subtype = s[0].substring(1);
				r.id = s[1];
				r.rate = 1 + parseInt(s[2], 10);
			} else if (s.indexOf('fl:') == 0 || s.indexOf('fe:') == 0 || s.indexOf('fp:') == 0) {
				s = s.split(':');
				r.type = 'favorite';
				r.subtype = s[0].substring(1);
				r.id = s[1];
				r.label = s[0] == 'fl' ? 'Favorites' : s[0] == 'fp' ? 'Friends' : 'Confirmed';
			} else if (s.indexOf('wtd:') == 0 && s.indexOf('|') > 0 && s.lastIndexOf(':') > s.lastIndexOf('|') && s.length < 25) {
				s = s.split('|');
				r.type = 'wtd';
				if (s.length > 2) {
					r.subtype = 'l';
					r.id = s[1];
					r.time = s[2];
				} else {
					r.subtype = 'category';
					r.categories = s[0].substring(4).split(',');
					r.time = s[1];
				}
			}
			return r;
		},
		isEmoji(c, subsequent) {
			if (subsequent)
				return 0x2000 <= c && c <= 0x1ffff;
			return (0x2310 <= c && c <= 0x3299) || (0x1f000 <= c && c <= 0x1ffff);
		},
		replaceEmoji(s) {
			if (s.codePointAt && global.string.emoji.test(s)) {
				for (var i = 0; i < s.length; i++) {
					if (global.string.isEmoji(s.codePointAt(i))) {
						var l = 1;
						while (global.string.isEmoji(s.codePointAt(i + l), true))
							l++;
						s = s.substring(0, i) + '<emoji>' + s.substring(i, i + l) + '</emoji>' + s.substring(i + l);
						i += l - 1 + 15;
					}
				}
			}
			return s;
		},
		replaceLinks(protocol, s) {
			protocol = protocol + '://';
			var p = -1, p2, s2;
			while ((p = s.indexOf(protocol, p + 1)) > -1) {
				p2 = s.indexOf(' ', p);
				if (p2 < 0 || p2 > s.indexOf('\n', p))
					p2 = s.indexOf('\n', p);
				if (p2 < 0)
					p2 = s.length;
				if (s.indexOf('"', p) < p2)
					p2 = s.indexOf('"', p);
				if (p2 > p + protocol.length && s.substring(p, p2).indexOf('.') > 0) {
					s2 = '<a onclick="ui.navigation.openHTML(&quot;' + s.substring(p, p2) + '&quot;);event.stopPropagation();" class="internalLink">' + s.substring(p, p2) + '</a>';
					s = s.substring(0, p) + s2 + s.substring(p2);
					p += s2.length;
				}
			}
			return s;
		},
		replaceNewsAdHoc(s) {
			var extracted = global.string.extractNewsAdHoc(s);
			if (extracted.type == 'rating') {
				var img = '<img class="autoNewsImg" src="images/rating' + extracted.rate + '.png"/>';
				s = img + global.string.replaceInternalLinks(' :open(' + global.encParam(extracted.subtype + '=' + extracted.id) + '): ').replace('chatLinks', 'newsLinks');
			} else if (extracted.type == 'favorite') {
				var img = '<img class="autoNewsImg" src="images/button' + extracted.label + '.png"/>';
				s = img + global.string.replaceInternalLinks(' :open(' + global.encParam(extracted.subtype + '=' + extracted.id) + '): ').replace('chatLinks', 'newsLinks');
			} else if (extracted.type == 'wtd') {
				if (extracted.subtype == 'l')
					s = ui.l('locations.asMessage').replace('{0}', extracted.time) + '<br/>' + global.string.replaceInternalLinks(' :open(' + global.encParam('l=' + extracted.id) + '): ').replace('chatLinks', 'newsLinks');
				else {
					var cat = '';
					for (var i2 = 0; i2 < extracted.categories.length; i2++)
						cat += ui.categories[extracted.categories[i2]].verb + (i2 < extracted.categories.length - 1 ? ' ' + ui.l('or') + ' ' : '');
					s = ui.l('wtd.autoNews').replace('{0}', cat).replace('{1}', extracted.time);
				}
			}
			return s;
		},
		replaceInternalLinks(s) {
			if (!s)
				return '';
			var p = -1, p2, load = [];
			while ((p = s.indexOf(' :open(', p + 1)) > -1) {
				p2 = s.indexOf('): ', p);
				if (p2 > -1) {
					var id = global.decParam(s.substring(p + 7, p2));
					if (id && id.length > 2 && id.charAt(1) == '=') {
						var table = 'location';
						if (id.indexOf('p=') == 0)
							table = 'contact';
						else if (id.indexOf('e=') == 0) {
							table = 'event';
							id = id.substring(0, id.indexOf('_'));
						}
						if (!isNaN(id.substring(2))) {
							if (!load[table])
								load[table] = [];
							load[table].push(id.substring(2));
							s = s.substring(0, p + 1) + '<a class="chatLinks" name="autoOpen' + id.replace('=', '_') + '" onclick="ui.navigation.autoOpen(&quot;' + s.substring(p + 7, p2) + '&quot;,event);"><img src="images/' + table + '.svg" class="bgColor"/><br/></a>' + s.substring(p2 + 3);
						}
					}
				}
			}
			for (var table in load) {
				var search = '';
				for (var i = 0; i < load[table].length; i++)
					search += ' or ' + table + '.id=' + load[table][i];
				communication.loadList('query=' + table + '_list&distance=100000&search=' + encodeURIComponent('(' + search.substring(4) + ')'), function (l) {
					var processed = [], t = l[0][0].substring(0, l[0][0].indexOf('.'));
					for (var i = 1; i < l.length; i++) {
						var v = model.convert(t == 'contact' ? new Contact() : new Location(), l, i);
						var img = v.imageList;
						if (!img && t == 'event')
							img = v.event.imageList;
						if (img)
							img = global.serverImg + img;
						var s = t == 'contact' ? v.pseudonym : t == 'location' ? v.name : v.text;
						var e = ui.qa('[name="autoOpen' + (t == 'contact' ? 'p' : t == 'event' ? 'e' : 'l') + '_' + v.id + '"] > img');
						processed[v.id] = 1;
						if (img) {
							ui.attr(e, 'src', img);
							ui.classRemove(e, 'bgColor');
						} else if (v['location.ownerId']) {
							ui.classRemove(e, 'bgColor');
							ui.classAdd(e, 'bgBonus');
						}
						for (var i2 = 0; i2 < e.length; i2++) {
							e[i2].parentNode.removeAttribute('name');
							e[i2].nextSibling.outerHTML = '<br/>' + s;
						}
					}
					var s = search.substring(search.indexOf('(') + 1, search.indexOf(')')).split(t + '.id=');
					for (var i = 0; i < s.length; i++) {
						if (s[i].indexOf(' ') > 0)
							s[i] = s[i].substring(0, s[i].indexOf(' '));
						if (s[i] && !processed[s[i]]) {
							var e = ui.q('[name="autoOpen' + (t == 'contact' ? 'p' : t == 'event' ? 'e' : 'l') + '_' + s[i] + '"]');
							ui.html(e, ui.l('entry.removed'));
							ui.attr(e, 'onclick', '');
							ui.attr(e, 'name', '');
						}
					}
				});
			}
			p = -1;
			while ((p = s.indexOf(' :openPos(', p + 1)) > -1) {
				p2 = s.indexOf('): ', p);
				if (p2 > -1) {
					var l2 = s.substring(p + 10, p2).split(',');
					if (l2.length == 2 && !isNaN(l2[0]) && !isNaN(l2[1])) {
						l2 = l2[0] + ',' + l2[1];
						var imgId = l2.replace(/\./g, '').replace(',', '');
						s = s.substring(0, p + 1) + '<a class="chatLinks" onclick="ui.navigation.openHTML(&quot;https://maps.google.com/maps?saddr=' + geoData.latlon.lat + ',' + geoData.latlon.lon + '&daddr=' + l2 + '&quot;);"><img l="' + imgId + '" /><p>' + ui.l('hereAmI') + '</p></a>' + s.substring(p2 + 2);
						communication.ajax({
							url: global.server + 'action/map?destination=' + l2,
							progressBar: false,
							success(r) {
								ui.attr('img[l="' + imgId + '"]', 'src', 'data:image/png;base64,' + r);
							}
						});
					}
				}
			}
			return s;
		}
	}
	static template(parts) {
		var res = parts[0];
		for (var i = 1; i < parts.length; i++) {
			if (arguments[i] || arguments[i] == 0)
				res += arguments[i];
			res += parts[i];
		}
		return res;
	}
}