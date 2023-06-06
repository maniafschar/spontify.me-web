import { heatmap } from './heatmap';
import { ui } from '../../js/ui';
import { communication } from '../../js/communication';
import { user } from '../../js/user';
import { global } from '../../js/global';

export { communication2 }

class communication2 {
	static get(type, callback) {
		communication.ajax({
			url: global.serverApi + type,
			responseType: 'json',
			webCall: 'communication.get(type,callback)',
			success(response) {
				var list = [];
				for (var i = 1; i < response.length; i++) {
					var o = {}, keys = response[0];
					for (var i2 = 0; i2 < keys.length; i2++) {
						var k = keys[i2].split('.');
						o[k[k.length - 1]] = response[i][i2];
					}
					list.push(o);
				}
				callback(list);
			}
		});
	}
	static language(language, callback) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState == 4) {
				if (xmlhttp.status >= 200 && xmlhttp.status < 300)
					callback(JSON.parse(xmlhttp.responseText));
			}
		};
		xmlhttp.open('GET', global.server + 'js/lang/stats' + language + '.json', true);
		xmlhttp.send();
	}
	static loadMap() {
		if (ui.q('head script[src*="heatmap.init"]'))
			heatmap.init();
		else
			communication.ajax({
				url: global.serverApi + 'action/google?param=js',
				responseType: 'text',
				webCall: 'communication.loadMap()',
				success(r) {
					var script = document.createElement('script');
					script.src = r + '&libraries=visualization&callback=heatmap.init';
					document.head.appendChild(script);
				}
			});
	}
	static save(o, callback) {
		communication.ajax({
			url: global.serverApi + 'db/one',
			method: 'PUT',
			body: { classname: 'ClientMarketing', id: o.id, values: o },
			responseType: 'json',
			webCall: 'communication.save(o,callback)',
			success() {
				callback();
			}
		});
	}
}