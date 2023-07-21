import { formFunc, ui } from '../ui';
import { initialisation } from '../init';
import { communication } from '../communication';
import { global } from '../global';

export { ContentAdminMarketing }

class ContentAdminMarketing extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.textContent = `${initialisation.customElementsCss}
h1 {
	font-size: 1.3em;
	margin-top: 0.5em;
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
		var r = ui.q('content-admin-marketing');
		if (r._root.childElementCount == 1) {
			var e = document.createElement('h1');
			e.setAttribute('l', 'marketingTitle');
			r._root.appendChild(e);
			e = document.createElement('edit');
			e.setAttribute('onclick', 'marketing.edit()');
			r._root.appendChild(e);
			e = document.createElement('list');
			r._root.appendChild(e);
			e = ui.qa('content-admin-marketing [l]');
			for (var i = 0; i < e.length; i++)
				e[i].innerHTML = ui.l('contentAdmin.' + e[i].getAttribute('l'));
		}
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
		<input type="checkbox" name="gender" value="2" label="${ui.l('contentAdmin.female')}" ${v.gender && v.gender.indexOf(2) > -1 ? ' checked' : ''} />
		<input type="checkbox" name="gender" value="1" label="${ui.l('contentAdmin.male')}" ${v.gender && v.gender.indexOf(1) > -1 ? ' checked' : ''} />
		<input type="checkbox" name="gender" value="3" label="${ui.l('contentAdmin.divers')}" ${v.gender && v.gender.indexOf(3) > -1 ? ' checked' : ''} />
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
		${v.gender && v.gender.indexOf(2) > -1 ? ui.l('contentAdmin.female') : ''}
		${v.gender && v.gender.indexOf(1) > -1 ? ui.l('contentAdmin.male') : ''}
		${v.gender && v.gender.indexOf(3) > -1 ? ui.l('contentAdmin.divers') : ''}
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
			e2.innerHTML = marketing.templateQuestion({ index: ui.qa('content-admin-marketing questions>field').length + 1 });
			e.parentElement.parentElement.parentElement.appendChild(e2.children[0]);
		}
	}
	static edit(id) {
		var e = ui.q('dialog-hint').style;
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
		ui.q('dialog-hint').innerHTML = marketing.templateEdit(v);
		e.transform = 'scale(1)';
		if (v.storage.questions) {
			for (var i = 0; i < v.storage.questions.length; i++) {
				if (i > 0) {
					var e2 = document.createElement('div');
					e2.innerHTML = marketing.templateQuestion({ index: i + 1, ...v.storage.questions[i] });
					ui.q('dialog-hint questions').appendChild(e2.children[0]);
				}
				for (var i2 = 1; i2 < v.storage.questions[i].answers.length; i2++) {
					var e2 = document.createElement('div');
					e2.innerHTML = marketing.templateAnswer(v.storage.questions[i].answers[i2]);
					var e3 = ui.qa('dialog-hint questions>field:nth-child(' + (i + 1) + ')>value')[1];
					e3.insertBefore(e2.children[0], e3.querySelector('input[type="checkbox"]'));
				}
			}
		}
		formFunc.initFields(ui.q('dialog-hint panel'));
	}
	static html2json() {
		var e = ui.qa('dialog-hint questions field'), o = {};
		var read = function (label, o) {
			var e2 = ui.q('dialog-hint [name="' + label + '"]');
			if (e2.type == 'checkbox' || e2.type == 'radio') {
				e2 = ui.qa('dialog-hint [name="' + label + '"]:checked');
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
		if (!ui.q('content-admin-marketing marketing list').innerHTML) {
			communication.ajax({
				url: global.serverApi + 'statistics/marketing',
				responseType: 'json',
				webCall: 'ContentAdminMarketing.init',
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
					ui.q('content-admin-marketing list').innerHTML = s ? s : ui.l('contentAdmin.noEntries');
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
						ui.q('dialog-hint').innerHTML = marketing.templateResults(v);
						ui.q('dialog-hint').style.transform = 'scale(1)';
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
			webCall: 'ContentAdminMarketing.save',
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