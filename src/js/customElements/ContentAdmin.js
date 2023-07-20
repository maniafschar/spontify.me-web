import { formFunc, ui } from '../ui';
import { initialisation } from '../init';
import { communication } from '../communication';
import { global } from '../global';

export { ContentAdmin }

class ContentAdmin extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.textContent = `${initialisation.customElementsCss}
:host(*)>* {
	text-align: center;
	width: 33.33%;
	padding: 1em;
	overflow-y: auto;
	position: absolute;
	float: left;
	height: 100%;
}

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
}

block {
	display: inline-block;
	position: relative;
	background: rgba(255, 255, 255, 0.9);
	padding: 1.5em;
	border-radius: 1em;
	margin: 1em 0;
	box-shadow: 0 0 2em rgb(0 0 0 / 30%);
	width: 40em;
	color: black;
	line-height: 1.8;
}

chart {
	display: block;
	position: relative;
	background: rgba(255, 255, 255, 0.9);
	border-radius: 0.5em;
	color: black;
}

popup {
	transform: scale(0);
	box-shadow: 0 0 5em rgba(0, 0, 0, 0.3);
	background-color: rgba(255, 255, 255, 0.9);
	border-radius: 0.5em;
	transition: all .4s ease-out;
	color: black;
	bottom: 4em;
	width: initial !important;
	left: 1em !important;
	top: 1em !important;
	right: 1em !important;
	padding: 1em !important;
	text-align: left;
}

marketing edit,
popup close {
	position: absolute;
	right: 0;
	top: 0;
	padding: 0.5em 0.75em 1.5em 5em;
	cursor: pointer;
}

popup close {
	opacity: 0.3;
}

popup panel {
	position: relative;
	display: block;
	overflow-y: auto;
	height: 100%;
}

marketing edit {
	display: block;
	padding: 0.5em 0.75em 1em 2.5em;
	font-size: 2em;
	font-weight: bold;
}

popup edit::after,
marketing edit::after {
	content: '+';
}


popup edit.question {
	display: block;
	color: black;
	opacity: 1;
	position: relative;
	font-size: 3em;
	padding: 0;
	height: 1em;
	line-height: 1;
	text-align: right;
}

questions>field {
	margin-top: 2em;
}

questions value span {
	margin-top: 1.25em;
	position: relative;
	display: inline-block;
	padding-right: 1em;
}

questions value select {
	width: 20%;
	float: right;
}

questions value.multiSelect select {
	display: none;
}

questions value.multiSelect input {
	width: 100%;
}

questions value answer {
	margin-bottom: 0.5em;
	display: block;
	position: relative;
}

questions value answer input {
	width: 78%;
}

questions value .answerMultiSelect {
	float: right;
	margin-right: -0.34em !important;
}

popup .marketingPeriod input {
	width: 40%;
	margin-right: 1em;
}

row {
	margin: 0 -1em;
}

row>div {
	padding: 0.75em;
	white-space: nowrap;
}

row>div button-text {
	position: absolute;
	right: 0.5em;
	bottom: 1em;
}

results {
	position: relative;
	display: block;
	padding-bottom: 3em;
}

results question,
results answer {
	display: block;
	position: relative;
}

results answer percentage {
	width: 10%;
	display: inline-block;
}

results answer percentage::after {
	content: '%';
}

results question {
	margin-top: 2em;
	font-weight: bold;
}

results freetexttitle {
	margin-top: 0.75em;
}

results freetext {
	display: none;
	position: relative;
}

results freetext div {
	padding: 0.25em;
}`;
		this._root.appendChild(style);
	}
	static init() {
		ui2.init();
	}
	static initHeatmap() {
		heatmap.init();
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
				name: ui.l('stats.responseTime'),
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
				name: ui.l('stats.total'),
				data: total
			},
			{
				name: ui.l('stats.verified'),
				data: verified
			},
			{
				name: ui.l('stats.withImage'),
				data: withImage
			}],
			labels: [ui.l('stats.female'), ui.l('stats.male'), ui.l('stats.divers'), ui.l('stats.noData')]
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
				name: ui.l('stats.female'),
				data: female
			},
			{
				name: ui.l('stats.male'),
				data: male
			},
			{
				name: ui.l('stats.divers'),
				data: divers
			},
			{
				name: ui.l('stats.noData'),
				data: noData
			}],
			labels: [ui.l('stats.until') + ' 20', '20 - 30', '30 - 40', '40 - 50', '50 - 60', ui.l('stats.from') + ' 60', ui.l('stats.noData')]
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
						return ui.l('stats.calls').replace('{0}', value).replace('{1}', parseInt(charts.chartApiData[dataPointIndex]._time + 0.5));
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
			{ name: ui.l('stats.category0'), data: [] },
			{ name: ui.l('stats.category1'), data: [] },
			{ name: ui.l('stats.category2'), data: [] },
			{ name: ui.l('stats.category3'), data: [] },
			{ name: ui.l('stats.category4'), data: [] },
			{ name: ui.l('stats.category5'), data: [] }
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
				labels.push((i == data.length - 1 ? ui.l('stats.from') + ' ' : '') + (data[i]._time * 20));
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
				name: ui.l('stats.responseTime'),
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
			webCall: 'ContentAdmin.init',
			success(l) {
				var points = [], n = 10000, w = 10000, s = -10000, e = -10000;
				if (l) {
					for (var i = 0; i < l.length; i++) {
						points.push(new google.maps.LatLng(l[i].latitude, l[i].longitude));
						if (n > l[i].latitude)
							n = l[i].latitude;
						if (s < l[i].latitude)
							s = l[i].latitude;
						if (w > l[i].longitude)
							w = l[i].longitude;
						if (e < l[i].longitude)
							e = l[i].longitude;
					}
				}
				heatmap.map = new google.maps.Map(ui.q('content-admin mapCanvas'), {
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

class marketing {
	static data;
	static templateEdit = v =>
		global.template`
<input type="hidden" name="id" value="${v.id}" />
<field>
	<label>Zeitraum</label>
	<value class="marketingPeriod">
		<input name="startDate" type="datetime-local" value="${v.startDate}"></input>
		<input name="endDate" type="datetime-local" value="${v.endDate}"></input>
		<explain>Achtung: Nach Beginn der Umfrage sind die Daten hier nicht mehr änderbar.</explain>
	</value>
</field>
<field>
	<label>Sprache</label>
	<value>
		<input type="radio" name="language" value="DE" label="Deutsch" ${v.language == 'DE' ? ' checked' : ''}></input>
		<input type="radio" name="language" value="EN" label="Englisch" ${v.language == 'EN' ? ' checked' : ''}></input>
	</value>
</field>
<field>
	<label>Geschlecht</label>
	<value>
		<input type="checkbox" name="gender" value="2" label="${ui.l('stats.female')}" ${v.gender && v.gender.indexOf(2) > -1 ? ' checked' : ''} />
		<input type="checkbox" name="gender" value="1" label="${ui.l('stats.male')}" ${v.gender && v.gender.indexOf(1) > -1 ? ' checked' : ''} />
		<input type="checkbox" name="gender" value="3" label="${ui.l('stats.divers')}" ${v.gender && v.gender.indexOf(3) > -1 ? ' checked' : ''} />
	</value>
</field>
<field>
	<label>Alter</label>
	<value style="height:4em;">
		<input type="text" id="age" slider="range" min="18" max="99" name="age" value="${v.age}"/>
	</value>
</value>
</field>
<field>
	<label>Region</label>
	<value>
		<input name="region" value="${v.region}"/>
		<explain>2 stelliges Länderkürzel und/oder die ersten Stellen der Postleitzahlen und/oder Städte, z.B.<br />CH DE-8 Nürnberg Hamburg</explain>
	</value>
</field>
<field>
	<label>Ergebnis</label>
	<value>
		<input type="checkbox" name="share" value="${v.share}" label="auf soziale Netzwerke veröffentlichen"/>
	</value>
</field>
<field>
	<label>Einleitung</label>
	<value><textarea name="prolog">${v.storage.prolog}</textarea></value>
</field>
<questions>${marketing.templateQuestion(v.storage.questions ? v.storage.questions[0] : {})}</questions>
<field>
	<label>Schlusswort</label>
	<value><textarea name="epilog">${v.storage.epilog}</textarea></value>
</field>
<dialogButtons>
<button-text onclick="marketing.test()" label="Test"></button-text>
<button-text onclick="marketing.save()" label="stats.save"></button-text>
</dialogButtons>`;
	static templateQuestion = v =>
		global.template`<field>
	<label>Frage ${v.index ? v.index : 1}</label>
	<value><input name="question" onblur="marketing.addQuestion(this)" value="${v.question}"></input></value>
	<label>Antworten</label>
	<value${v.answerType ? ' class="multiSelect"' : ''}>
		${marketing.templateAnswer(v.answers ? v.answers[0] : {})}
		<input type="checkbox" name="textField" value="1" ${v.textField ? ' checked' : ''} label="Freitextfeld"></input>
		<input type="checkbox" onclick="marketing.toggleAnswerType(event)" name="answerType" value="1" ${v.answerType ? ' checked' : ''} label="Mehrfachauswahl" class="answerMultiSelect"></input>
	</value>
</field>`;
	static templateAnswer = v =>
		global.template`<answer>
<input name="answer" onblur="marketing.addAnswer(this)" value="${v.answer}"></input>
<select name="next">${v.nextOptions}</select>
</answer>`;
	static templateList = v =>
		global.template`<row onclick="${v.oc}">
	<div>
		${v.period}<br />
		${v.storage.prolog}<br />
		${v.storage.questions[0].question}
	</div>
</row>`;
	static templateResults = v =>
		global.template`<metadata onclick="marketing.toggle(this)" class="collapsible closed">Metadaten</metadata>
<div style="display:none;">
<field>
	<label>Zeitraum</label>
	<value>
		${v.startDate} - ${v.endDate}
	</value>
</field>
<field>
	<label>Sprache</label>
	<value>
		${v.language}
	</value>
</field>
<field>
	<label>Geschlecht</label>
	<value>
		${v.gender && v.gender.indexOf(2) > -1 ? ui.l('stats.female') : ''}
		${v.gender && v.gender.indexOf(1) > -1 ? ui.l('stats.male') : ''}
		${v.gender && v.gender.indexOf(3) > -1 ? ui.l('stats.divers') : ''}
	</value>
</field>
<field>
	<label>Alter</label>
	<value>
		${v.age}
	</value>
</value>
</field>
<field>
	<label>Region</label>
	<value>
		${v.region}
	</value>
</field>
<field>
	<label>Ergebnis</label>
	<value>
		${v.share}
	</value>
</field>
<field>
	<label>Einleitung</label>
	<value>
		${v.storage.prolog}
	</value>
</field>
<field>
	<label>Schlusswort</label>
	<value>
		${v.storage.epilog}
	</value>
</field>
</div>
<div>
	<br/>${v.participants} Teilnehmer
</div>
<results>${v.answers}</results>`;
	static addAnswer(e) {
		if (e.value && e.parentElement.nextElementSibling.nodeName != e.parentElement.nodeName) {
			var e2 = document.createElement('div');
			e2.innerHTML = marketing.templateAnswer({});
			e.parentElement.parentElement.insertBefore(e2.children[0], e.parentElement.nextElementSibling);
		}
	}
	static addQuestion(e) {
		if (e.value && e.parentElement.parentElement.parentElement.lastElementChild == e.parentElement.parentElement) {
			var e2 = document.createElement('div');
			e2.innerHTML = marketing.templateQuestion({ index: ui.qa('content-admin questions>field').length + 1 });
			e.parentElement.parentElement.parentElement.appendChild(e2.children[0]);
		}
	}
	static edit(id) {
		var e = ui.q('main.statistics popup').style;
		if (e.transform && e.transform.indexOf('1') > 0) {
			e.transform = 'scale(0)';
			return;
		}
		var v;
		if (id) {
			for (var i = 0; i < marketing.data.length; i++) {
				if (id == marketing.data[i].id) {
					v = marketing.data[i];
					break;
				}
			}
		}
		if (!v) {
			var max = 0;
			for (var i = 0; i < marketing.data.length; i++) {
				if (marketing.data[i].id > max)
					max = marketing.data[i].id;
			}
			v = { id: max + 1, language: global.language, storage: {} };
		}
		ui.q('main.statistics popup panel').innerHTML = marketing.templateEdit(v);
		e.transform = 'scale(1)';
		if (v.storage.questions) {
			for (var i = 0; i < v.storage.questions.length; i++) {
				if (i > 0) {
					var e2 = document.createElement('div');
					e2.innerHTML = marketing.templateQuestion({ index: i + 1, ...v.storage.questions[i] });
					ui.q('main.statistics popup questions').appendChild(e2.children[0]);
				}
				for (var i2 = 1; i2 < v.storage.questions[i].answers.length; i2++) {
					var e2 = document.createElement('div');
					e2.innerHTML = marketing.templateAnswer(v.storage.questions[i].answers[i2]);
					var e3 = ui.qa('main.statistics popup questions>field:nth-child(' + (i + 1) + ')>value')[1];
					e3.insertBefore(e2.children[0], e3.querySelector('input[type="checkbox"]'));
				}
			}
		}
		formFunc.initFields(ui.q('main.statistics popup panel'));
	}
	static html2json() {
		var e = ui.qa('main.statistics questions field'), o = {};
		var read = function (label, o) {
			var e2 = ui.q('main.statistics popup [name="' + label + '"]');
			if (e2.type == 'checkbox' || e2.type == 'radio') {
				e2 = ui.qa('main.statistics popup [name="' + label + '"]:checked');
				var s = '';
				for (var i = 0; i < e2.length; i++)
					s += e2[i].value;
				o[label] = s;
			} else if (e2.value)
				o[label] = e2.value;
		}
		read('id', o);
		read('language', o);
		read('startDate', o);
		read('endDate', o);
		read('gender', o);
		read('age', o);
		read('region', o);
		read('share', o);
		var storage = { questions: [] };
		read('prolog', storage);
		read('epilog', storage);
		for (var i = 0; i < e.length; i++) {
			if (e[i].querySelector('input[name="question"]').value) {
				var q = {
					question: e[i].querySelector('input[name="question"]').value,
					answerType: e[i].querySelector('input[name="answerType"]').checked,
					textField: e[i].querySelector('input[name="textField"]').checked,
					answers: []
				};
				var answers = e[i].querySelectorAll('answer');
				for (var i2 = 0; i2 < answers.length; i2++) {
					if (answers[i2].querySelector('input').value) {
						q.answers.push({
							answer: answers[i2].querySelector('input').value,
							next: answers[i2].querySelector('select').value
						});
					}
				}
				storage.questions.push(q);
			}
		}
		o.storage = JSON.stringify(storage);
		return o;
	}
	static init() {
		if (!ui.q('content-admin marketing list').innerHTML) {
			communication.ajax({
				url: global.serverApi + 'statistics/marketing',
				responseType: 'json',
				webCall: 'ContentAdmin.init',
				success(response) {
					marketing.data = [];
					for (var i = 1; i < response.length; i++) {
						var o = {}, keys = response[0];
						for (var i2 = 0; i2 < keys.length; i2++) {
							var k = keys[i2].split('.');
							o[k[k.length - 1]] = response[i][i2];
						}
						marketing.data.push(o);
					}
					var s = '';
					for (var i = 0; i < marketing.data.length; i++) {
						marketing.data[i].storage = JSON.parse(marketing.data[i].storage);
						if (marketing.data[i].startDate)
							marketing.data[i].period = global.date.formatDate(marketing.data[i].startDate) + ' - ' + global.date.formatDate(marketing.data[i].endDate);
						if (marketing.data[i].startDate && global.date.server2local(marketing.data[i].startDate) < new Date()) {
							marketing.data[i].oc = 'marketing.results(' + marketing.data[i].id + ')';
							marketing.data[i].period += global.separator + (global.date.server2local(marketing.data[i].endDate) < new Date() ? ' Beendet' : ' Gestartet');
						} else
							marketing.data[i].oc = 'marketing.edit(' + marketing.data[i].id + ')';
						s += marketing.templateList(marketing.data[i]);
					}
					ui.q('content-admin marketing list').innerHTML = s ? s : ui.l('stats.noEntries');
				}
			});
		}
	}
	static results(id) {
		communication.ajax({
			url: 'db/list?query=contact_listMarketing&search=' + encodeURIComponent('contactMarketing.clientMarketingId=' + id),
			success(r) {
				for (var i = 0; i < marketing.data.length; i++) {
					if (marketing.data[i].id == id) {
						var v = { ...marketing.data[i] };
						v.participants = r.length;
						v.answers = '';
						for (var i = 0; i < r.length; i++)
							r[i] = JSON.parse(r[i].storage);
						for (var i = 0; i < v.storage.questions.length; i++) {
							var choices = [], text = '';
							for (var i2 = 0; i2 < v.storage.questions[i].answers.length; i2++)
								choices.push(0);
							for (var i2 = 0; i2 < r.length; i2++) {
								if (r[i2]['q' + i]) {
									for (var i3 = 0; i3 < r[i2]['q' + i].choice.length; i3++)
										choices[r[i2]['q' + i].choice[i3]]++;
									if (r[i2]['q' + i].text)
										text += '<div>' + r[i2]['q' + i].text + '</div>';
								}
							}
							v.answers += '<question>' + v.storage.questions[i].question + '</question><answers>';
							v.share = v.share ? 'auf soziale Netzwerke veröffentlichen' : '-';
							for (var i2 = 0; i2 < v.storage.questions[i].answers.length; i2++)
								v.answers += '<answer><percentage>' + (r.length ? Math.round(choices[i2] / r.length * 100) : 0) + '</percentage>' + v.storage.questions[i].answers[i2].answer + '</answer>';
							v.answers += (text ? '<freetexttitle onclick="marketing.toggle(this)" class="collapsible closed">Freitext</freetexttitle><freetext>' + text + '</freetext>' : '') + '</answers>';
						}
						if (v.startDate)
							v.startDate = global.date.formatDate(v.startDate);
						if (v.endDate)
							v.endDate = global.date.formatDate(v.endDate);
						v.age = v.age.replace(',', ' - ');
						ui.q('main.statistics popup panel').innerHTML = marketing.templateResults(v);
						ui.q('main.statistics popup').style.transform = 'scale(1)';
						break;
					}
				}
			}
		});
	}
	static save(exec) {
		var o = marketing.html2json();
		communication.ajax({
			url: global.serverApi + 'db/one',
			method: 'PUT',
			body: { classname: 'ClientMarketing', id: o.id, values: o },
			responseType: 'json',
			webCall: 'ContentAdmin.save',
			success() {
				exec ? exec() : ui.navigation.closeHint();
			}
		});
	}
	static test() {
		marketing.save(
			function () {
				d.storage = JSON.parse(d.storage);
				d.mode = 'test';
				marketing.data = d;
				marketing.open();
				window.close();
			});
	}
	static toggleAnswerType(e) {
		e.target.parentElement.classList = e.target.checked ? 'multiSelect' : '';
	}
	static toggle(e) {
		if (ui.classContains(e, 'closed'))
			ui.classRemove(e, 'closed');
		else
			ui.classAdd(e, 'closed');
		ui.toggleHeight(e.nextElementSibling);
	}
}

class ui2 {
	static open(index) {
		var s = '', map = {
			button1: ['User', 'Log'],
			button2: ['Login', 'Age'],
			button3: ['Api', 'Locations']
		};
		var exec = function (chartToken) {
			communication.ajax({
				url: global.serverApi + 'statistics/contact/' + chartToken,
				responseType: 'json',
				webCall: 'ContentAdmin.open',
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
		ui.navigation.openHint(s);
	}
	static goTo(i) {
		var e = ui.q('dialog-navigation item.active');
		if (e)
			e.classList.remove('active');
		ui.navigation.closeHint();
		if (i == 0)
			ui.q('main.statistics').outerHTML = '';
		else {
			ui.q('dialog-navigation item:nth-child(' + (i + 1) + ')').classList.add('active');
			ui.q('contentAdmin').style.marginLeft = (-(i - 1) * 100) + '%';
			if (i == 2)
				marketing.init();
		}
	}
	static init() {
		ui.q('content-admin')._root.innerHTML = `
<home style="left:0;">
	<h1 style="margin-top:1em;" l="stats.homeStatistics"></h1>
	<card class="mainBG" onclick="ui2.open(1)">
		<top>390</top>
		<bottom l="stats.homeCard1"></bottom>
	</card>
	<card class="mainBG" onclick="ui2.open(2)">
		<top>38</top>
		<bottom l="stats.homeCard2"></bottom>
	</card>
	<card class="mainBG" onclick="ui2.open(3)">
		<top>18</top>
		<bottom l="stats.homeCard3"></bottom>
	</card>
	<h1 l="stats.homeUserMap"></h1>
	<mapCanvas></mapCanvas>
</home>
<marketing style="left:33.33%;">
	<h1 style="margin-top:1em;" l="stats.marketingTitle"></h1>
	<edit onclick="marketing.edit()"></edit>
	<list></list>
</marketing>
<invoice style="left:66.66%;">
	<h1 style="margin-top:1em;" l="stats.invoiceTitle"></h1>
</invoice>`;
		var e = ui.qa('contentAdmin [l]');
		for (var i = 0; i < e.length; i++)
			e[i].innerHTML = ui.l('contentAdmin.' + e[i].getAttribute('l'));
		if (ui.q('head script[src*="heatmap.init"]'))
			heatmap.init();
		else
			communication.ajax({
				url: global.serverApi + 'action/google?param=js',
				responseType: 'text',
				webCall: 'ContentAdmin.init',
				success(r) {
					var script = document.createElement('script');
					script.src = r + '&libraries=visualization&callback=ContentAdmin.initHeatmap';
					document.head.appendChild(script);
				}
			});
		ui.swipe(ui.q('contentAdmin'), function (dir) {
			if (dir != 'left' && dir != 'right')
				return;
			var i = ui.q('contentAdmin').style.marginLeft;
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