import { charts } from './charts';
import { communication2 } from './communication2';
import { marketing } from './marketing';
import { ui } from '../../js/ui';
import { global } from '../../js/global';

export { ui2 };

class ui2 {
	static open(index) {
		var e = ui.q('main.statistics popup').style;
		if (e.transform && e.transform.indexOf('1') > 0) {
			e.transform = 'scale(0)';
			return;
		}
		var s = '', map = {
			button1: ['User', 'Log'],
			button2: ['Login', 'Age'],
			button3: ['Api', 'Locations']
		};
		var exec = function (chartToken) {
			communication2.get('statistics/contact/' + chartToken, function (response) {
				charts.initChart(chartToken, response);
			});
			return chartToken.toLowerCase();
		}
		for (var i = 0; i < map['button' + index].length; i++)
			s += '<chart class="' + exec(map['button' + index][i]) + '"></chart>';
		ui.q('main.statistics popup panel').innerHTML = '<div>' + s + '</div>';
		e.transform = 'scale(1)';
	}
	static close() {
		var e = ui.q('main.statistics popup');
		if (e.style.transform && e.style.transform.indexOf('1') > 0)
			setTimeout(function () {
				e.style.transform = 'scale(0)';
			}, 50);
	}
	static goTo(i) {
		var e = ui.q('main.statistics navigation item.active');
		if (e)
			e.classList.remove('active');
		ui2.close();
		if (i == 0)
			ui.q('main.statistics').outerHTML = '';
		else {
			ui.q('main.statistics navigation item:nth-child(' + (i + 1) + ')').classList.add('active');
			ui.q('main.statistics content').style.marginLeft = (-(i - 1) * 100) + '%';
			if (i == 2)
				marketing.init();
		}
	}
	static init() {
		communication2.language(global.language, function (response) {
			var e = ui.qa('main.statistics [l]');
			ui.labels['stats'] = response;
			for (var i = 0; i < e.length; i++)
				e[i].innerHTML = ui.l(e[i].getAttribute('l'));
		});
		communication2.loadMap();
		ui.swipe(ui.q('main.statistics content'), function (dir) {
			if (dir != 'left' && dir != 'right')
				return;
			var i = ui.q('main.statistics content').style.marginLeft;
			if (!i)
				i = 1;
			else
				i = -parseInt(i) / 100 + 1;
			if (dir == 'right') {
				if (--i < 1)
					return;
			} else {
				if (++i > 3)
					return;
			}
			ui2.goTo(i);
		});
	}
}