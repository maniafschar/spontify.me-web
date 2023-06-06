import { ui } from "../../js/ui";
import { ui2 } from "./ui2";

export { charts };

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
		ui.q('main.statistics popup panel chart.' + query.toLowerCase()).innerHTML = '';
		if (charts['chart' + query])
			charts['chart' + query].destroy();
		charts['initChart' + query](data);
		charts['chart' + query].render();
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
		charts.chartLogin = new ApexCharts(ui.q('main.statistics popup panel chart.login'), {
			chart: {
				type: 'bar',
				toolbar: {
					show: false
				}
			},
			series: [{
				name: ui2.labels.responseTime,
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
		charts.chartUser = new ApexCharts(ui.q('main.statistics popup panel chart.user'), {
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
				name: ui2.labels.total,
				data: total
			},
			{
				name: ui2.labels.verified,
				data: verified
			},
			{
				name: ui2.labels.withImage,
				data: withImage
			}],
			labels: [ui2.labels.female, ui2.labels.male, ui2.labels.divers, ui2.labels.noData]
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
		charts.chartAge = new ApexCharts(ui.q('main.statistics popup panel chart.age'), {
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
				name: ui2.labels.female,
				data: female
			},
			{
				name: ui2.labels.male,
				data: male
			},
			{
				name: ui2.labels.divers,
				data: divers
			},
			{
				name: ui2.labels.noData,
				data: noData
			}],
			labels: [ui2.labels.until + ' 20', '20-30', '30-40', '40-50', '50-60', ui2.labels.from + ' 60', ui2.labels.noData]
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
		charts.chartApi = new ApexCharts(ui.q('main.statistics popup panel chart.api'), {
			chart: {
				type: 'bar',
				toolbar: {
					show: false
				}
			},
			tooltip: {
				y: {
					formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
						return ui2.labels.calls.replace('{0}', value).replace('{1}', parseInt(charts.chartApiData[dataPointIndex]._time + 0.5));
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
			{ name: ui2.labels.category0, data: [] },
			{ name: ui2.labels.category1, data: [] },
			{ name: ui2.labels.category2, data: [] },
			{ name: ui2.labels.category3, data: [] },
			{ name: ui2.labels.category4, data: [] },
			{ name: ui2.labels.category5, data: [] }
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
				labels.push((i == data.length - 1 ? ui2.labels.from + ' ' : '') + (data[i]._time * 20));
			}
		}
		charts.chartLog = new ApexCharts(ui.q('main.statistics popup panel chart.log'), {
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
				name: ui2.labels.responseTime,
				data: values
			}],
			labels: labels
		});
	}

}