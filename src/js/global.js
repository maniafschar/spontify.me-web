import { communication } from './communication';
import { geoData } from './geoData';
import { lists } from './lists';
import { Contact, Location, model } from './model';
import { formFunc, ui } from './ui';
import { user } from './user';

export { global, Strings };

class global {
	static appTitle = '{placeholderAppTitle}';
	static appVersion = '0.7.3';
	static config = JSON.parse('{placeholderAppConfig}');
	static imprintCustom = '{imprintCustom}';
	static language = null;
	static minLocations = 5;
	static paused = false;
	static server = '{placeholderServer}/';
	static serverApi = global.server + 'rest/';
	static serverImg = global.server + 'med/';
	static separator = ' · ';
	static separatorTech = '\u0015';

	static date = {
		formatDate(d, type) {
			if (!d)
				return '';
			var d2 = global.date.server2local(d);
			if (d2 instanceof Date)
				return (type == 'noWeekday' ? '' : ui.l('date.weekday' + (type ? 'Long' : '') + d2.getDay()) + ' ') + d2.getDate() + '.' + (d2.getMonth() + 1) + '.' + ('' + d2.getFullYear()).slice(-2)
					+ (typeof d != 'string' || d.length > 10 ? ' ' + d2.getHours() + ':' + ('0' + d2.getMinutes()).slice(-2) : '');
			return d2;
		},
		getDateFields(d) {
			if (typeof d == 'number')
				d = new Date(d);
			if (d instanceof Date)
				return {
					year: d.getFullYear(),
					month: ('0' + (d.getMonth() + 1)).slice(-2),
					day: ('0' + d.getDate()).slice(-2),
					hour: ('0' + d.getHours()).slice(-2),
					minute: ('0' + d.getMinutes()).slice(-2),
					second: ('0' + d.getSeconds()).slice(-2),
					time: true
				};
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
		getToday() {
			var today = new Date();
			today.setHours(0);
			today.setMinutes(0);
			today.setSeconds(0);
			return today;
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
				if (d.hour == 0 && d.minute == 0 && d.second == 0)
					return d.year + '-' + d.month + '-' + d.day;
			}
			d = d.toISOString();
			return d.substring(0, d.indexOf('.'));
		},
		nextWorkday(d) {
			d.setDate(d.getDate() + 1);
			if (d.getDay() == 0)
				d.setDate(d.getDate() + 1);
			return d;
		},
		server2local(d) {
			if (!d)
				return d;
			if (d instanceof Date)
				return d;
			d = global.date.getDateFields(d);
			if (d.hour == 0 && d.minute == 0 && d.second == 0)
				return new Date(Date.UTC(d.year, parseInt(d.month) - 1, d.day));
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
		var i = ua.indexOf('ipad') > -1 || navigator.maxTouchPoints && navigator.maxTouchPoints > 2;
		if ((a && !m) || i)
			return 'tablet';
		if (m || a || p)
			return 'phone';
		return 'computer';
	}
	static getFootprint() {
		return screen.availWidth + 'x' + screen.availHeight + 'x' + screen.colorDepth + 'x' + screen.pixelDepth;
	}
	static getOS() {
		if (global.isBrowser())
			return 'web';
		return /Android/i.test(navigator.userAgent) || /amazon-fireos/i.test(navigator.userAgent) ? 'android' : 'ios';
	}
	static getParam(url) {
		var v = url;
		if (!v && window.location && window.location.href)
			v = window.location.href;
		if (v) {
			if (v.match(/\/marketing\/event\/(\d*)/))
				return global.encParam('e=' + v.match(/\/marketing\/.+\/(\d*)/)[1]);
			if (v.match(/\/marketing\/location\/(\d*)/))
				return global.encParam('l=' + v.match(/\/marketing\/.+\/(\d*)/)[1]);
			if (v.match(/\/marketing\/news\/(\d*)/))
				return 'news=' + v.match(/\/marketing\/.+\/(\d*)/)[1];
			if (v.match(/\/marketing\/(\d*)/))
				return 'm=' + v.match(/\/marketing\/(\d*)/)[1];
			if (v.indexOf('?') > 0)
				return v.substring(v.indexOf('?') + 1);
		}
		return '';
	}
	static getRegEx(field, value) {
		if (value)
			return 'cast(REGEXP_LIKE(' + field + ',\'' + value + '\') as integer)=1';
		return '1=0';
	}
	static hash(s) {
		if (s)
			return s.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
		return 0;
	}
	static isBrowser() {
		return window.cordova ? false : true;
	}
	static openStore(os) {
		if (!os)
			os = user.contact.os;
		ui.navigation.openHTML(os == 'android' ?
			'https://play.google.com/store/apps/details?id={placeholderBundleID}' :
			'https://itunes.apple.com/app/id{placeholderAppleID}');
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
class Strings {
	static emoji = /\p{Extended_Pictographic}/ug;
	static isEmoji(c, subsequent) {
		if (subsequent)
			return 0x2000 <= c && c <= 0x1ffff;
		return (0x2310 <= c && c <= 0x3299) || (0x1f000 <= c && c <= 0x1ffff);
	}
	static replaceEmoji(s) {
		if (s.codePointAt && Strings.emoji.test(s)) {
			for (var i = 0; i < s.length; i++) {
				if (Strings.isEmoji(s.codePointAt(i))) {
					var l = 1;
					while (Strings.isEmoji(s.codePointAt(i + l), true))
						l++;
					s = s.substring(0, i) + '<emoji>' + s.substring(i, i + l) + '</emoji>' + s.substring(i + l);
					i += l - 1 + 15;
				}
			}
		}
		return s;
	}
	static replaceLinks(s) {
		var match = s.match(/https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g);
		if (match) {
			for (var i = 0; i < match.length; i++)
				s = s.replaceAll(match[i], '<a onclick="ui.navigation.openHTML(&quot;' + match[i] + '&quot;);event.stopPropagation();" class="internalLink">' + match[i] + '</a>');
		}
		return s;
	}
	static replaceInternalLinks(s) {
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
						s = s.substring(0, p + 1) + '<span class="chatLinks" name="autoOpen' + id.replace('=', '_') + '" onclick="ui.navigation.autoOpen(&quot;' + s.substring(p + 7, p2) + '&quot;,event);"><img/><br/></span>' + s.substring(p2 + 3);
					}
				}
			}
		}
		for (var table in load) {
			var search = '';
			for (var i = 0; i < load[table].length; i++)
				search += ' or ' + table + '.id=' + load[table][i];
			lists.load({
				webCall: 'global.replaceInternalLinks',
				query: table + '_list',
				distance: -1,
				search: encodeURIComponent('(' + search.substring(4) + ')')
			}, function (l) {
				var s, e, processed = [], t = l[0][0].substring(0, l[0][0].indexOf('.')), select;
				for (var i = 1; i < l.length; i++) {
					var v = model.convert(t == 'contact' ? new Contact() : new Location(), l, i);
					var img = v.imageList;
					if (!img && t == 'event')
						img = v.event.imageList;
					s = t == 'contact' ? v.pseudonym : t == 'location' ? v.name : v.event.description;
					select = '[name="autoOpen' + (t == 'contact' ? 'p' : t == 'event' ? 'e' : 'l') + '_' + (t == 'event' ? v.event.id : v.id) + '"] > img';
					e = ui.qa(select);
					if (e.length == 0)
						e = ui.qa('dialog-popup ' + select);
					processed[v.id] = 1;
					if (img)
						ui.attr(e, 'src', global.serverImg + img);
					else {
						ui.attr(e, 'source', t + 's');
						ui.classAdd(e, 'bgColor');
					}
					for (var i2 = 0; i2 < e.length; i2++) {
						e[i2].parentNode.removeAttribute('name');
						e[i2].nextSibling.outerHTML = '<name>' + s + '</name>';
					}
				}
				formFunc.svg.replaceAll(ui.qa('dialog-popup img[source]'));
				formFunc.svg.replaceAll(ui.qa('img[source]'));
				s = search.substring(search.indexOf('(') + 1, search.indexOf(')')).split(t + '.id=');
				for (var i = 0; i < s.length; i++) {
					if (s[i].indexOf(' ') > 0)
						s[i] = s[i].substring(0, s[i].indexOf(' '));
					if (s[i] && !processed[s[i]]) {
						e = ui.q('[name="autoOpen' + (t == 'contact' ? 'p' : t == 'event' ? 'e' : 'l') + '_' + s[i] + '"]');
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
					s = s.substring(0, p + 1) + '<span class="chatLinks" onclick="ui.navigation.openHTML(&quot;https://maps.google.com/maps?saddr=' + geoData.current.lat + ',' + geoData.current.lon + '&daddr=' + l2 + '&quot;);"><img l="' + imgId + '" /><p>' + ui.l('hereAmI') + '</p></span>' + s.substring(p2 + 2);
					communication.ajax({
						url: global.serverApi + 'action/map?destination=' + l2,
						progressBar: false,
						webCall: 'global.replaceInternalLinks',
						success(r) {
							ui.attr('dialog-popup img[l="' + imgId + '"]', 'src', 'data:image/png;base64,' + r);
						}
					});
				}
			}
		}
		return s;
	}
	static markdown(src) {
		var rx_lt = /</g;
		var rx_gt = />/g;
		var rx_space = /\t|\r|\uf8ff/g;
		var rx_escape = /\\([\\\|`*_{}\[\]()#+\-~])/g;
		var rx_hr = /^([*\-=_] *){3,}$/gm;
		var rx_blockquote = /\n *&gt; *([^]*?)(?=(\n|$){2})/g;
		var rx_list = /\n( *)(?:[*\-+]|((\d+)|([a-z])|[A-Z])[.)]) +([^]*?)(?=(\n|$){2})/g;
		var rx_listjoin = /<\/(ol|ul)>\n\n<\1>/g;
		var rx_highlight = /(^|[^A-Za-z\d\\])(([*_])|(~)|(\^)|(--)|(\+\+)|`)(\2?)([^<]*?)\2\8(?!\2)(?=\W|_|$)/g;
		var rx_code = /\n((```|~~~).*\n?([^]*?)\n?\2|((    .*?\n)+))/g;
		var rx_link = /((!?)\[(.*?)\]\((.*?)( ".*")?\)|\\([\\`*_{}\[\]()#+\-.!~]))/g;
		var rx_table = /\n(( *\|.*?\| *\n)+)/g;
		var rx_thead = /^.*\n( *\|( *\:?-+\:?-+\:? *\|)* *\n|)/;
		var rx_row = /.*\n/g;
		var rx_cell = /\||(.*?[^\\])\|/g;
		var rx_heading = /(?=^|>|\n)([>\s]*?)(#{1,6}) (.*?)( #*)? *(?=\n|$)/g;
		var rx_para = /(?=^|>|\n)\s*\n+([^<]+?)\n+\s*(?=\n|<|$)/g;
		var rx_stash = /-\d+\uf8ff/g;

		function replace(rex, fn) {
			src = src.replace(rex, fn);
		}

		function element(tag, content) {
			return '<' + tag + '>' + content + '</' + tag + '>';
		}

		function blockquote(src) {
			return src.replace(rx_blockquote, function (all, content) {
				return element('blockquote', blockquote(highlight(content.replace(/^ *&gt; */gm, ''))));
			});
		}

		function list(src) {
			return src.replace(rx_list, function (all, ind, ol, num, low, content) {
				var entry = element('li', highlight(content.split(
					RegExp('\n ?' + ind + '(?:(?:\\d+|[a-zA-Z])[.)]|[*\\-+]) +', 'g')).map(list).join('</li><li>')));

				return '\n' + (ol
					? '<ol start="' + (num
						? ol + '">'
						: parseInt(ol, 36) - 9 + '" style="list-style-type:' + (low ? 'low' : 'upp') + 'er-alpha">') + entry + '</ol>'
					: element('ul', entry));
			});
		}

		function highlight(src) {
			return src.replace(rx_highlight, function (all, _, p1, emp, sub, sup, small, big, p2, content) {
				return _ + element(
					emp ? (p2 ? 'strong' : 'em')
						: sub ? (p2 ? 's' : 'sub')
							: sup ? 'sup'
								: small ? 'small'
									: big ? 'big'
										: 'code',
					highlight(content));
			});
		}

		function unesc(str) {
			return str.replace(rx_escape, '$1');
		}

		var stash = [];
		var si = 0;
		src = '\n' + src + '\n';
		replace(rx_lt, '&lt;');
		replace(rx_gt, '&gt;');
		replace(rx_space, '  ');

		// blockquote
		src = blockquote(src);

		// horizontal rule
		replace(rx_hr, '<hr/>');

		// list
		src = list(src);
		replace(rx_listjoin, '');

		// code
		replace(rx_code, function (all, p1, p2, p3, p4) {
			stash[--si] = element('pre', element('code', p3 || p4.replace(/^    /gm, '')));
			return si + '\uf8ff';
		});

		// link or image
		replace(rx_link, function (all, p1, p2, p3, p4, p5, p6) {
			stash[--si] = p4
				? p2
					? '<img src="' + p4 + '" alt="' + p3 + '"/>'
					: '<a href="' + p4 + '">' + unesc(highlight(p3)) + '</a>'
				: p6;
			return si + '\uf8ff';
		});

		// table
		replace(rx_table, function (all, table) {
			var sep = table.match(rx_thead)[1];
			return '\n' + element('table',
				table.replace(rx_row, function (row, ri) {
					return row == sep ? '' : element('tr', row.replace(rx_cell, function (all, cell, ci) {
						return ci ? element(sep && !ri ? 'th' : 'td', unesc(highlight(cell || ''))) : ''
					}))
				})
			)
		});

		// heading
		replace(rx_heading, function (all, _, p1, p2) { return _ + element('h' + p1.length, unesc(highlight(p2))) });

		// paragraph
		replace(rx_para, function (all, content) { return element('p', unesc(highlight(content))) });

		// stash
		replace(rx_stash, function (all) { return stash[parseInt(all)] });
		return src.trim();
	}
}