import { formFunc, ui } from '../ui';
import { initialisation } from '../init';
import { communication } from '../communication';
import { global } from '../global';
import { Contact, model } from '../model';
import { marketing } from '../marketing';

export { ContentAdminMarketing }

class ContentAdminMarketing extends HTMLElement {
	static data;

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

list {
	margin-top: 1em;
    position: relative;
    display: block;
}

row {
	width: 100%;
    position: relative;
    overflow: hidden;
    text-align: left;
    text-overflow: ellipsis;
    display: block;
    white-space: nowrap;
    background: rgba(0, 0, 0, 0.1);
	padding: 0.5em 0.75em;
	cursor: pointer;
}

row>div button-text {
	position: absolute;
	right: 0.5em;
	bottom: 1em;
}

edit {
	position: absolute;
	right: 0;
	top: 0;
	cursor: pointer;
	display: block;
	padding: 0.4em 0.4em 0.5em 2.5em;
	font-size: 3em;
}

edit::after {
	content: '+';
}`;
		this._root.appendChild(style);
	}
	static init(force) {
		var r = ui.q('content-admin-marketing');
		if (force || r._root.childElementCount == 1) {
			var e = document.createElement('h1');
			e.setAttribute('l', 'marketingTitle');
			r._root.appendChild(e);
			e = document.createElement('edit');
			e.setAttribute('onclick', 'ui.q("content-admin-marketing").edit()');
			r._root.appendChild(e);
			e = document.createElement('list');
			r._root.appendChild(e);
			e = ui.qa('content-admin-marketing [l]');
			for (var i = 0; i < e.length; i++)
				e[i].innerHTML = ui.l('contentAdmin.' + e[i].getAttribute('l'));
			if (!ui.q('content-admin-marketing list').innerHTML) {
				communication.ajax({
					url: global.serverApi + 'statistics/marketing',
					responseType: 'json',
					webCall: 'ContentAdminMarketing.init',
					success(response) {
						ContentAdminMarketing.data = [];
						for (var i = 1; i < response.length; i++) {
							var o = {}, keys = response[0];
							for (var i2 = 0; i2 < keys.length; i2++) {
								var k = keys[i2].split('.');
								o[k[k.length - 1]] = response[i][i2];
							}
							ContentAdminMarketing.data.push(o);
						}
						var s = '';
						for (var i = 0; i < ContentAdminMarketing.data.length; i++) {
							ContentAdminMarketing.data[i].storage = JSON.parse(ContentAdminMarketing.data[i].storage);
							if (ContentAdminMarketing.data[i].startDate)
								ContentAdminMarketing.data[i].period = global.date.formatDate(ContentAdminMarketing.data[i].startDate) + ' - ' + global.date.formatDate(ContentAdminMarketing.data[i].endDate);
							if (ContentAdminMarketing.data[i].startDate && global.date.server2local(ContentAdminMarketing.data[i].startDate) < new Date()) {
								ContentAdminMarketing.data[i].oc = 'ui.q(&quot;content-admin-marketing&quot;).results(' + ContentAdminMarketing.data[i].id + ')';
								ContentAdminMarketing.data[i].period += global.separator + (global.date.server2local(ContentAdminMarketing.data[i].endDate) < new Date() ? ' Beendet' : ' Gestartet');
							} else
								ContentAdminMarketing.data[i].oc = 'ui.q(&quot;content-admin-marketing&quot;).edit(' + ContentAdminMarketing.data[i].id + ')';
							s += ContentAdminMarketing.templateList({
								...ContentAdminMarketing.data[i],
								text: encodeURIComponent(ContentAdminMarketing.data[i].storage.prolog + '<br/>' + ContentAdminMarketing.data[i].storage.questions[0].question)
							});
						}
						ui.q('content-admin-marketing list').innerHTML = s ? s : ui.l('contentAdmin.noEntries');
					}
				});
			}
		}
	}
	static templateEdit = v =>
		global.template`
<style>
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

.marketingPeriod input {
	width: 40%;
	margin-right: 1em;
}
</style>
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
		<input-checkbox type="radio" name="language" value="DE" label="Deutsch" ${v.language == 'DE' ? ' checked="true"' : ''}></input-checkbox>
		<input-checkbox type="radio" name="language" value="EN" label="Englisch" ${v.language == 'EN' ? ' checked="true"' : ''}></input-checkbox>
	</value>
</field>
<field>
	<label>Geschlecht</label>
	<value>
		<input-checkbox name="gender" value="2" label="${ui.l('contentAdmin.female')}" ${v.gender && v.gender.indexOf(2) > -1 ? ' checked="true"' : ''}></input-checkbox>
		<input-checkbox name="gender" value="1" label="${ui.l('contentAdmin.male')}" ${v.gender && v.gender.indexOf(1) > -1 ? ' checked="true"' : ''}></input-checkbox>
		<input-checkbox name="gender" value="3" label="${ui.l('contentAdmin.divers')}" ${v.gender && v.gender.indexOf(3) > -1 ? ' checked="true"' : ''}></input-checkbox>
	</value>
</field>
<field>
	<label>Alter</label>
	<value style="height:4em;">
		<input-slider type="range" min="18" max="99" name="age" value="${v.age}"></input-slider>
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
		<input-checkbox name="share" value="${v.share}" label="auf soziale Netzwerke veröffentlichen"></input-checkbox>
	</value>
</field>
<field>
	<label>Einleitung</label>
	<value><textarea name="prolog">${v.storage.prolog}</textarea></value>
</field>
<questions>${ContentAdminMarketing.templateQuestion(v.storage.questions ? v.storage.questions[0] : {})}</questions>
<field>
	<label>Schlusswort</label>
	<value><textarea name="epilog">${v.storage.epilog}</textarea></value>
</field>
<dialogButtons>
<button-text onclick="ui.q(&quot;content-admin-marketing&quot;).test()" label="Test"></button-text>
<button-text onclick="ui.q(&quot;content-admin-marketing&quot;).save()" label="save"></button-text>
</dialogButtons>`;
	static templateQuestion = v =>
		global.template`<field>
	<label>Frage ${v.index ? v.index : 1}</label>
	<value><input name="question" onblur="ui.q(&quot;content-admin-marketing&quot;).addQuestion(this)" value="${v.question}"></input></value>
	<label>Antworten</label>
	<value${v.multiple ? ' class="multiSelect"' : ''}>
		${ContentAdminMarketing.templateAnswer(v.answers ? v.answers[0] : {})}
		<input-checkbox name="textField" value="1" ${v.textField ? ' checked="true"' : ''} label="Freitextfeld"></input-checkbox>
		<input-checkbox name="multiple" onclick="ui.q(&quot;content-admin-marketing&quot;).toggleAnswerType(event)" value="1" ${v.multiple ? ' checked="true"' : ''} label="Mehrfachauswahl" class="answerMultiSelect"></input-checkbox>
	</value>
</field>`;
	static templateAnswer = v =>
		global.template`<answer>
<input name="answer" onblur="ui.q(&quot;content-admin-marketing&quot;).addAnswer(this)" value="${v.answer}"></input>
<select name="next">${v.nextOptions}</select>
</answer>`;
	static templateList = v =>
		global.template`<row onclick="${v.oc}" title="${v.period}" text="${v.text}">
	${v.period}<br />
	${v.storage.prolog}<br />
	${v.storage.questions[0].question}
</row>`;
	static templateResults = v =>
		global.template`<metadata onclick="ui.q(&quot;content-admin-marketing&quot;).toggle(this)" class="collapsible closed">Metadaten</metadata>
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
	addAnswer(e) {
		if (e.value && e.parentElement.nextElementSibling.nodeName != e.parentElement.nodeName) {
			var e2 = document.createElement('div');
			e2.innerHTML = ContentAdminMarketing.templateAnswer({});
			e.parentElement.parentElement.insertBefore(e2.children[0], e.parentElement.nextElementSibling);
		}
	}
	addQuestion(e) {
		if (e.value && e.parentElement.parentElement.parentElement.lastElementChild == e.parentElement.parentElement) {
			var e2 = document.createElement('div');
			e2.innerHTML = ContentAdminMarketing.templateQuestion({ index: ui.qa('dialog-popup questions>field').length + 1 });
			e.parentElement.parentElement.parentElement.appendChild(e2.children[0]);
		}
	}
	edit(id) {
		var v;
		if (id) {
			for (var i = 0; i < ContentAdminMarketing.data.length; i++) {
				if (id == ContentAdminMarketing.data[i].id) {
					v = ContentAdminMarketing.data[i];
					break;
				}
			}
		}
		if (!v) {
			var max = 0;
			for (var i = 0; i < ContentAdminMarketing.data.length; i++) {
				if (ContentAdminMarketing.data[i].id > max)
					max = ContentAdminMarketing.data[i].id;
			}
			v = { language: global.language, storage: {} };
		}
		ui.navigation.openPopup(ui.l('contentAdmin.marketingTitle'), ContentAdminMarketing.templateEdit(v));
		if (v.storage.questions) {
			for (var i = 0; i < v.storage.questions.length; i++) {
				if (i > 0) {
					var e2 = document.createElement('div');
					e2.innerHTML = ContentAdminMarketing.templateQuestion({ index: i + 1, ...v.storage.questions[i] });
					ui.q('dialog-popup questions').appendChild(e2.children[0]);
				}
				for (var i2 = 1; i2 < v.storage.questions[i].answers.length; i2++) {
					var e2 = document.createElement('div');
					e2.innerHTML = ContentAdminMarketing.templateAnswer(v.storage.questions[i].answers[i2]);
					var e3 = ui.qa('dialog-popup questions>field:nth-child(' + (i + 1) + ')>value')[1];
					e3.insertBefore(e2.children[0], e3.querySelector('input-checkbox'));
				}
			}
		}
		formFunc.initFields(ui.q('dialog-popup popupContent'));
	}
	static html2json() {
		var e = ui.qa('dialog-popup questions field'), o = {};
		var read = function (label, o) {
			var e2 = ui.q('dialog-popup [name="' + label + '"]');
			if (e2.type == 'checkbox' || e2.type == 'radio') {
				e2 = ui.qa('dialog-popup [name="' + label + '"]:checked');
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
					multiple: e[i].querySelector('input-checkbox[name="multiple"]').getAttribute('checked'),
					textField: e[i].querySelector('input-checkbox[name="textField"]').getAttribute('checked'),
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
	results(id) {
		communication.ajax({
			url: global.serverApi + 'db/list?query=contact_listMarketing&search=' + encodeURIComponent('contactMarketing.clientMarketingId=' + id),
			responseType: 'json',
			webCall: 'ContentAdminMarketing.results',
			success(r) {
				for (var i = 0; i < ContentAdminMarketing.data.length; i++) {
					if (ContentAdminMarketing.data[i].id == id) {
						var v = { ...ContentAdminMarketing.data[i] };
						v.participants = r.length - 1;
						v.answers = '';
						for (var i = 1; i < r.length; i++)
							r[i] = JSON.parse(model.convert(new Contact(), r, i).storage);
						for (var i = 0; i < v.storage.questions.length; i++) {
							var choices = [], text = '';
							for (var i2 = 0; i2 < v.storage.questions[i].answers.length; i2++)
								choices.push(0);
							for (var i2 = 1; i2 < r.length; i2++) {
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
								v.answers += '<answer><percentage>' + (r.length > 1 ? Math.round(choices[i2] / (r.length - 1) * 100) : 0) + '</percentage>' + v.storage.questions[i].answers[i2].answer + '</answer>';
							v.answers += (text ? '<freetexttitle onclick="ui.q(&quot;content-admin-marketing&quot;).toggle(this)" class="collapsible closed">Freitext</freetexttitle><freetext>' + text + '</freetext>' : '') + '</answers>';
						}
						if (v.startDate)
							v.startDate = global.date.formatDate(v.startDate);
						if (v.endDate)
							v.endDate = global.date.formatDate(v.endDate);
						v.age = v.age.replace(',', ' - ');
						v.css = `<style>
.main {
	width: 100%;
	height: 80vh;
	text-align: left;
	overflow-y: auto;
}

metadata {
	cursor: pointer;
	font-weight: bold;
}

metadata::before {
	content: '▼';
	display: inline-block;
	padding-right: 0.5em;
	transition: all .4s ease-out;
}

metadata.closed::before {
	transform: translate(-0.3em, -0.3em) rotate(-90deg);
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
}
</style>`;
						ui.navigation.openHint({ desc: v.css + '<div class="main">' + ContentAdminMarketing.templateResults(v) + '</div>', pos: '5%,1em', size: '90%,auto', onclick: 'return false;' });
						break;
					}
				}
			}
		});
	}
	save() {
		var o = ContentAdminMarketing.html2json();
		communication.ajax({
			url: global.serverApi + 'db/one',
			method: o.id ? 'PUT' : 'POST',
			body: { classname: 'ClientMarketing', id: o.id, values: o },
			responseType: 'json',
			webCall: 'ContentAdminMarketing.save',
			success() {
				ui.navigation.closePopup();
				ui.q('content-admin-marketing').init(true);
			}
		});
	}
	test() {
		marketing.data = ContentAdminMarketing.html2json();
		marketing.data.storage = JSON.parse(marketing.data.storage);
		marketing.data.mode = 'test';
		marketing.open();
	}
	toggleAnswerType(e) {
		e.target.parentElement.classList = e.target.getAttribute('checked') == 'true' ? 'multiSelect' : '';
	}
	toggle(e) {
		if (ui.classContains(e, 'closed'))
			ui.classRemove(e, 'closed');
		else
			ui.classAdd(e, 'closed');
		ui.toggleHeight(e.nextElementSibling);
	}
}
