import { formFunc, ui } from '../ui';
import { initialisation } from '../init';
import { communication } from '../communication';
import { global } from '../global';

export { ContentAdminHome }

class ContentAdminHome extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.textContent = `${initialisation.customElementsCss}
card {
	width: 6em;
	height: 8em;
	display: inline-flex;
	flex-flow: column;
	box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.5);
	border-radius: 0.5em;
	margin: 1em;
	cursor: pointer;
}

card top {
	display: block;
	height: 2.5em;
	line-height: 2.5;
	font-size: 1.3em;
	font-weight: bold;
	border-bottom: solid 1px rgba(255, 255, 255, 0.5);
}

card bottom {
	line-height: 1.5;
	font-size: 0.7em;
	padding: 0.5em;
}

mapCanvas {
	display: inline-block;
	width: 100%;
	height: 40em;
	border-radius: 0.5em;
	box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.5);
	margin-top: 0.5em;
}

h1 {
	font-size: 1.3em;
	margin-top: 0.5em;
}`;
		this._root.appendChild(style);
	}
	static init() {
		var r = ui.q('content-admin-home');
		if (r._root.childElementCount == 1) {
			var e = document.createElement('h1');
			e.setAttribute('l', 'homeStatistics');
			r._root.appendChild(e);
			e = document.createElement('card');
			e.innerHTML = `<top>390</top><bottom l="homeCard1"></bottom>`;
			e.setAttribute('class', 'mainBG');
			e.setAttribute('onclick', 'ui.q("content-admin-home").open(1)');
			r._root.appendChild(e);
			e = document.createElement('card');
			e.innerHTML = `<top>390</top><bottom l="homeCard2"></bottom>`;
			e.setAttribute('class', 'mainBG');
			e.setAttribute('onclick', 'ui.q("content-admin-home").open(2)');
			r._root.appendChild(e);
			e = document.createElement('card');
			e.innerHTML = `<top>390</top><bottom l="homeCard3"></bottom>`;
			e.setAttribute('class', 'mainBG');
			e.setAttribute('onclick', 'ui.q("content-admin-home").open(3)');
			r._root.appendChild(e);
			e = document.createElement('h1');
			e.setAttribute('l', 'homeUserMap');
			r._root.appendChild(e);
			e = document.createElement('mapCanvas');
			r._root.appendChild(e);
			e = ui.qa('content-admin-home [l]');
			for (var i = 0; i < e.length; i++)
				e[i].innerHTML = ui.l('contentAdmin.' + e[i].getAttribute('l'));
		}
		if (ui.q('head script[src*="ui.initHeatmap"]')) {
			heatmap.init();
			formFunc.svg.replaceAll();
			initialisation.reposition();
		} else
			communication.ajax({
				url: global.serverApi + 'action/google?param=js',
				responseType: 'text',
				webCall: 'ContentAdminHome.init',
				success(r) {
					var script = document.createElement('script');
					script.src = r + '&libraries=visualization&callback=ui.initHeatmap';
					document.head.appendChild(script);
				}
			});
	}
	static initHeatmap() {
		heatmap.init();
	}
	open(index) {
		var s = '', map = {
			button1: ['User', 'Log'],
			button2: ['Login', 'Age'],
			button3: ['Api', 'Locations']
		};
		var exec = function (chartToken) {
			communication.ajax({
				url: global.serverApi + 'statistics/contact/' + chartToken,
				responseType: 'json',
				webCall: 'ContentAdminHome.open',
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
					charts.initChart(chartToken, list);
				}
			});
			return chartToken.toLowerCase();
		}
		for (var i = 0; i < map['button' + index].length; i++)
			s += '<chart class="' + exec(map['button' + index][i]) + '"></chart>';
		ui.navigation.openHint({ desc: '<div style="width:100%;height:80vh;overflow-y:auto;">' + s + '</div>', pos: '5%,1em', size: '90%,auto', onclick: 'return false;' });
	}
}

class charts {
	static chartAge;
	static chartApi;
	static chartApiData;
	static chartGender;
	static chartLocations;
	static chartLog;
	static chartLogin;
	static chartUser;

	static initChart(query, data) {
		var exec = function () {
			if (ApexCharts) {
				ui.q('dialog-hint chart.' + query.toLowerCase()).innerHTML = '';
				if (charts['chart' + query])
					charts['chart' + query].destroy();
				charts['initChart' + query](data);
				charts['chart' + query].render();
			} else
				setTimeout(exec, 500);
		};
		if (!ui.q('head script[src*="apexcharts"]')) {
			var script = document.createElement('script');
			script.src = 'https://cdn.jsdelivr.net/npm/apexcharts';
			script.onload = exec;
			document.head.appendChild(script);
		} else
			exec();
	}
	static initChartLogin(data) {
		var total = 0, date, labels = [], values = [], processed = {};
		for (var i = 0; i < data.length; i++) {
			if (date != data[i].createdAt.substring(0, 10)) {
				if (date) {
					labels.push(date);
					values.push(total);
				}
				date = data[i].createdAt.substring(0, 10);
				if (date.indexOf('-01') == 7) {
					processed = {};
					total = 0;
				}
			}
			if (!processed['user' + data[i].contactId]) {
				processed['user' + data[i].contactId] = true;
				total++;
			}
		}
		charts.chartLogin = new ApexCharts(ui.q('dialog-hint chart.login'), {
			chart: {
				type: 'bar',
				toolbar: {
					show: false
				}
			},
			series: [{
				name: ui.l('contentAdmin.responseTime'),
				data: values
			}],
			labels: labels
		});
	}
	static initChartUser(data) {
		var total = [0, 0, 0, 0], verified = [0, 0, 0, 0], withImage = [0, 0, 0, 0], genderMap = [2, 1, 3, null];
		for (var i = 0; i < data.length; i++) {
			var x = data[i]._count / 1000;
			for (var i2 = 0; i2 < genderMap.length; i2++) {
				if (data[i].gender == genderMap[i2]) {
					total[i2] += x;
					if (data[i].verified)
						verified[i2] += x;
					if (data[i]._image)
						withImage[i2] += x;
				}
			}
		}
		for (var i = 0; i < total.length; i++) {
			total[i] = (parseInt(total[i] * 10 + 0.5) / 10);
			verified[i] = (parseInt(verified[i] * 10 + 0.5) / 10);
			withImage[i] = (parseInt(withImage[i] * 10 + 0.5) / 10);
		}
		charts.chartUser = new ApexCharts(ui.q('dialog-hint chart.user'), {
			chart: {
				type: 'bar',
				toolbar: {
					show: false
				}
			},
			plotOptions: {
				bar: {
					horizontal: true
				}
			},
			dataLabels: {
				enabled: true,
				textAnchor: 'start',
				formatter: function (val, opt) {
					return val + '%'
				},
				offsetX: 0,
			},
			series: [{
				name: ui.l('contentAdmin.total'),
				data: total
			},
			{
				name: ui.l('contentAdmin.verified'),
				data: verified
			},
			{
				name: ui.l('contentAdmin.withImage'),
				data: withImage
			}],
			labels: [ui.l('contentAdmin.female'), ui.l('contentAdmin.male'), ui.l('contentAdmin.divers'), ui.l('contentAdmin.noData')]
		});
	}
	static initChartAge(data) {
		var female = [0, 0, 0, 0, 0, 0, 0], male = [0, 0, 0, 0, 0, 0, 0], divers = [0, 0, 0, 0, 0, 0, 0], noData = [0, 0, 0, 0, 0, 0, 0];
		for (var i = 0; i < data.length; i++) {
			var x = data[i]._count / 1000, i2;
			if (data[i]._age == null)
				i2 = male.length - 1;
			else
				i2 = data[i]._age - 1;
			if (i2 < 0)
				i2 = 0;
			else if (i2 > male.length - 1)
				i2 = male.length - 1;
			if (data[i].contact.gender == 1)
				male[i2] += x;
			else if (data[i].contact.gender == 2)
				female[i2] += x;
			else if (data[i].contact.gender == 3)
				divers[i2] += x;
			else
				noData[i2] += x;
		}
		for (var i = 0; i < female.length; i++) {
			female[i] = parseInt(0.5 + female[i]);
			male[i] = parseInt(0.5 + male[i]);
			divers[i] = parseInt(0.5 + divers[i]);
			noData[i] = parseInt(0.5 + noData[i]);
		}
		charts.chartAge = new ApexCharts(ui.q('dialog-hint chart.age'), {
			chart: {
				type: 'bar',
				toolbar: {
					show: false
				}
			},
			dataLabels: {
				formatter: function (val, opt) {
					return val + '%'
				}
			},
			tooltip: {
				y: {
					formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
						return value + '%';
					}
				}
			},
			series: [{
				name: ui.l('contentAdmin.female'),
				data: female
			},
			{
				name: ui.l('contentAdmin.male'),
				data: male
			},
			{
				name: ui.l('contentAdmin.divers'),
				data: divers
			},
			{
				name: ui.l('contentAdmin.noData'),
				data: noData
			}],
			labels: [ui.l('contentAdmin.until') + ' 20', '20 - 30', '30 - 40', '40 - 50', '50 - 60', ui.l('contentAdmin.from') + ' 60', ui.l('contentAdmin.noData')]
		});
	}
	static initChartApi(data) {
		charts.chartApiData = [];
		var labels = [], values = [];
		for (var i = 0; i < data.length; i++) {
			if (data[i]._percentage >= 0.005) {
				values.push(parseInt('' + (data[i]._percentage * 100 + 0.5)));
				labels.push(data[i]._label);
				charts.chartApiData.push(data[i]);
			}
		}
		charts.chartApi = new ApexCharts(ui.q('dialog-hint chart.api'), {
			chart: {
				type: 'bar',
				toolbar: {
					show: false
				}
			},
			tooltip: {
				y: {
					formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
						return ui.l('contentAdmin.calls').replace('{0}', value).replace('{1}', parseInt(charts.chartApiData[dataPointIndex]._time + 0.5));
					}
				}
			},
			series: [{
				name: '',
				data: values
			}],
			labels: labels
		});
	}
	static initChartLocations(data) {
		var l = [], series = [
			{ name: ui.categories[0].label, data: [] },
			{ name: ui.categories[1].label, data: [] },
			{ name: ui.categories[2].label, data: [] },
			{ name: ui.categories[3].label, data: [] },
			{ name: ui.categories[4].label, data: [] },
			{ name: ui.categories[5].label, data: [] }
		];
		for (var i = 1; i < data.length; i++) {
			var category = parseInt(data[i].category);
			var town = data[i].town;
			var e = null;
			for (var i2 = 0; i2 < l.length; i2++) {
				if (l[i2].town == town) {
					e = l[i2];
					break;
				}
			}
			if (!e) {
				e = { total: 0, town: town };
				l.push(e);
			}
			e[category] = data[i]._c / 10;
			e.total += e[category];
		}
		l.sort(function (a, b) { return a.total < b.total ? 1 : -1 });
		var labels = [];
		for (var i = 0; i < Math.min(10, l.length); i++) {
			for (var i2 = 0; i2 < series.length; i2++)
				series[i2].data.push(l[i][i2] ? l[i][i2] : 0);
			labels.push(l[i].town);
		}
		charts.chartLocations = new ApexCharts(ui.q('popup panel chart.locations'), {
			chart: {
				type: 'bar',
				stacked: true,
				toolbar: {
					show: false
				}
			},
			tooltip: {
				y: {
					formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
						return value + '%';
					}
				}
			},
			series: series,
			labels: labels
		});
	}
	static initChartLog(data) {
		var labels = [], values = [];
		for (var i = 0; i < data.length; i++) {
			if (data[i]._time > -1) {
				values.push(parseInt('' + (data[i]._count * 100 + 0.5)));
				labels.push((i == data.length - 1 ? ui.l('contentAdmin.from') + ' ' : '') + (data[i]._time * 20));
			}
		}
		charts.chartLog = new ApexCharts(ui.q('dialog-hint chart.log'), {
			chart: {
				type: 'line',
				toolbar: {
					show: false
				}
			},
			tooltip: {
				y: {
					formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
						return value + '%';
					}
				}
			},
			series: [{
				name: ui.l('contentAdmin.responseTime'),
				data: values
			}],
			labels: labels
		});
	}

}

class heatmap {
	static map;

	static init() {
		communication.ajax({
			url: global.serverApi + 'statistics/contact/location',
			responseType: 'json',
			webCall: 'ContentAdminHome.init',
			success(l) {
				var points = [], n = 10000, w = 10000, s = -10000, e = -10000;
				if (l) {
					for (var i = 1; i < l.length; i++) {
						points.push(new google.maps.LatLng(l[i][0], l[i][1]));
						if (n > l[i][0])
							n = l[i][0];
						if (s < l[i][0])
							s = l[i][0];
						if (w > l[i][1])
							w = l[i][1];
						if (e < l[i][1])
							e = l[i][1];
					}
				}
				heatmap.map = new google.maps.Map(ui.q('content-admin-home mapCanvas'), {
					center: { lat: 48.1, lng: 11.6 },
					zoom: 5,
					mapTypeId: google.maps.MapTypeId.SATELLITE
				});
				new google.maps.visualization.HeatmapLayer({
					data: points,
					map: heatmap.map,
					dissipating: true,
					maxIntensity: 10
				});
			}
		});
	}
}