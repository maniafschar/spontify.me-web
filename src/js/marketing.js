import { communication } from './communication';
import { global } from './global';
import { ClientMarketing, model } from './model';
import { pageHome } from './pages/home';
import { formFunc, ui } from './ui';

export { marketing };

class marketing {
	static data;
	static answers;
	static index = [];
	static style = `<style>
marketing {
	padding: 2em 1em;
	position: absolute;
	text-align: center;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
}

marketing>div {
	overflow-y: auto;
	height: 100%;
	padding-bottom: 4em;
}

marketing buttons {
	position: absolute;
	left: 0;
	bottom: 0;
	height: 4em;
	width: 100%;
}

marketing buttons progressindex {
	position: absolute;
	background: rgba(255, 255, 255, 0.5);
	left: 0;
	bottom: 0;
	height: 0.5em;
	width: 0;
	transition: all .4s linear;
}

marketing buttons button-text {
	position: absolute;
}

marketing buttons button-text.left {
	left: 1em;
}

marketing buttons button-text.right {
	right: 1em;
}

answers {
	text-align: left;
	display: inline-block;
	max-height: fit-content;
    overflow-y: auto;
}

b{
	margin-bottom: 0;
}

img.result {
	width: 100%;
}

hint {
	display: block;
	font-size: 0.8em;
	padding-top: 1.5em;
	opacity: 0.6;
}
</style>`;
	static close() {
		if (ui.q('marketing').innerHTML) {
			pageHome.init(true);
			var e = ui.q('marketing');
			e.innerHTML = '';
			e.style.display = 'none';
		} else
			ui.navigation.closeHint();
	}
	static init() {
		communication.ajax({
			url: global.serverApi + 'marketing',
			responseType: 'json',
			webCall: 'marketing.init',
			success(r) {
				if (r.length > 1) {
					marketing.data = model.convert(new ClientMarketing(), r, 1);
					if (marketing.data.storage)
						marketing.data.storage = JSON.parse(marketing.data.storage);
					if (marketing.data.clientMarketingResult.storage)
						marketing.data.clientMarketingResult.storage = JSON.parse(marketing.data.clientMarketingResult.storage);
					marketing.open();
				} else
					marketing.data = null;
			}
		});
	}
	static next(back) {
		var prefix = ui.q('marketing').innerHTML ? 'marketing ' : 'dialog-hint ';
		var answers = ui.qa(prefix + 'input-checkbox[checked="true"]');
		var index = marketing.index[marketing.index.length - 1];
		if (index > 0 && !back && !marketing.data.storage.questions[index]) {
			marketing.close();
			return;
		}
		if (index > -1) {
			marketing.answers['q' + index] = { a: [] };
			for (var i = 0; i < answers.length; i++)
				marketing.answers['q' + index].a.push(parseInt(answers[i].getAttribute('value')));
			if (ui.q(prefix + 'textarea')) {
				if (ui.q(prefix + 'textarea').value)
					marketing.answers['q' + index].t = ui.q(prefix + 'textarea').value.trim().replace(/</g, '&lt;');
				else if (!back && ui.q(prefix + 'input-checkbox:last-child').getAttribute('checked') == 'true')
					return;
			}
			if (!back && ui.q(prefix + 'input-checkbox') && !marketing.answers['q' + index].a.length && !marketing.answers['q' + index].t)
				return;
		}
		if (back) {
			marketing.index.splice(marketing.index.length - 1, 1);
			index = marketing.index[marketing.index.length - 1];
		} else {
			if (ui.q(prefix + 'input-checkbox[type="radio"][checked="true"]') &&
				ui.q(prefix + 'input-checkbox[type="radio"][checked="true"]').getAttribute('next'))
				index = parseInt(ui.q(prefix + 'input-checkbox[type="radio"][checked="true"]').getAttribute('next'));
			else
				index++;
		}
		var next = function () {
			if (!back)
				marketing.index.push(index);
			if (marketing.data.storage.questions[index])
				marketing.setQuestion(index);
			else if (index < 0) {
				ui.q(prefix + 'div').innerHTML = marketing.data.storage.prolog ? marketing.data.storage.prolog.replace(/\n/g, '<br/>') : '';
				var e = ui.q(prefix + 'button-text.left');
				e.setAttribute('label', 'No');
				e.setAttribute('onclick', 'marketing.close()');
				ui.q(prefix + 'button-text.right').setAttribute('label', 'Yes');
				ui.q(prefix + 'buttons progressindex').style.width = 0;
			} else
				ui.q(prefix + 'div').innerHTML = marketing.data.storage.epilog ? marketing.data.storage.epilog.replace(/\n/g, '<br/>') : '';
		};
		if (marketing.data.mode == 'test')
			next();
		else
			communication.ajax({
				url: global.serverApi + 'marketing',
				webCall: 'marketing.next',
				body: { classname: 'ContactMarketing', id: marketing.data.answerId, values: { clientMarketingId: marketing.data.id, storage: JSON.stringify(marketing.answers), finished: back || marketing.data.storage.questions[index] ? false : true } },
				method: marketing.data.answerId ? 'PUT' : 'POST',
				success(r) {
					if (r)
						marketing.data.answerId = r;
					next();
				}
			});
	}
	static open(inline) {
		var isMarketingOpen = function () {
			return (ui.q('dialog-hint marketing') && ui.q('dialog-hint marketing').innerHTML) || ui.q('marketing').innerHTML;
		}
		if (marketing.data && !isMarketingOpen()) {
			if (marketing.data.clientMarketingResult.id) {
				if (marketing.data.clientMarketingResult.image) {
					var f = function () {
						ui.navigation.openHint({
							desc: marketing.style + '<img class="result" src="' + global.serverImg + marketing.data.clientMarketingResult.image + '" />' + (marketing.data.storage.epilog ? '<div>'
								+ marketing.data.storage.epilog.replace(/\n/g, '<br/>') + '</div>' : ''),
							pos: '5%,5%', size: '-5%,auto', onclick: 'return;'
						});
					};
					if (ui.q('preloader'))
						ui.on(document, 'Preloader', f, true);
					else
						f();
				}
				return;
			}
			var s;
			if (marketing.data.storage.html) {
				s = marketing.data.storage.html + '<br/><br/><hint>Die Aktion läuft bis zum ' + global.date.formatDate(marketing.data.endDate) + '</hint>;
			} else {
				if (!marketing.answers)
					marketing.answers = {};
				marketing.index.push(-1);
				s = '<div>' + (marketing.data.storage.prolog ? marketing.data.storage.prolog.replace(/\n/g, '<br/>') : '') + '</div><buttons><button-text onclick="marketing.close()" label="No" class="left"></button-text><button-text onclick="marketing.next()" label="Yes" class="right"></button-text><progressindex></progressindex></buttons>';
			}
			if (inline) {
				var e = ui.q('marketing');
				e.innerHTML = marketing.style + s;
				e.style.display = 'block';
			} else
				setTimeout(function () {
					if (!isMarketingOpen())
						ui.navigation.openHint({
							desc: marketing.style + '<marketing>' + s + '</marketing>',
							pos: '5%,5%',
							size: '-5%,-4em',
							onclick: 'return;',
							noLogin: true
						});
				}, 2000);
		}
	}
	static setQuestion(index) {
		var prefix = ui.q('marketing').innerHTML ? 'marketing ' : 'dialog-hint ';
		var q = marketing.data.storage.questions[index];
		var s = q.question + '<br/><answers' + (q.textField ? ' style="width:100%;"' : '') + '>';
		for (var i = 0; i < q.answers.length; i++)
			s += '<br/><input-checkbox' + (q.multiple ? '' : ' type="radio" next="' + (q.answers[i].next ? q.answers[i].next : '') + '"') + ' name="answers" value="' + i + '" label="' + q.answers[i].answer + '" checked="' + (marketing.answers['q' + index]?.a.includes(i) ? true : false) + '"></input-checkbox>';
		s += '</answers>';
		if (q.textField) {
			var v = marketing.answers['q' + index]?.t;
			if (!v && q.textFieldDefault)
				try {
					v = eval(q.textFieldDefault);
				} catch (e) { }
			s += '<textarea>' + (v ? v : '') + '</textarea>';
		}
		ui.q(prefix + 'div').innerHTML = s;
		var e = ui.q(prefix + 'button-text.left');
		e.setAttribute('label', 'marketing.previous');
		e.setAttribute('onclick', 'marketing.next(true)');
		var e = ui.q(prefix + 'button-text.right');
		e.setAttribute('label', 'marketing.next');
		e.setAttribute('onclick', 'marketing.next()');
		formFunc.initFields(ui.q(prefix + 'div'));
		ui.q(prefix + 'buttons progressindex').style.width = ((1 + index) / marketing.data.storage.questions.length * 100) + '%';
	}
}
