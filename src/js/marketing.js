import { communication } from './communication';
import { global } from './global';
import { formFunc, ui } from './ui';

export { marketing };

class marketing {
	static data;
	static answers;
	static index = [];
	static openTag;
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
	static next(back) {
		var answers = ui.qa('dialog-hint input-checkbox[checked="true"]'), s;
		var index = marketing.index[marketing.index.length - 1];
		if (index > 0 && !back && !marketing.data.storage.questions[index]) {
			ui.navigation.closeHint();
			marketing.openTag = null;
			return;
		}
		if (index > -1) {
			marketing.data._answer.storage['q' + index] = { a: [] };
			for (var i = 0; i < answers.length; i++)
				marketing.data._answer.storage['q' + index].a.push(parseInt(answers[i].getAttribute('value')));
			s = ui.val('dialog-hint textarea') || ui.val('dialog-hint input');
			if (s)
				marketing.data._answer.storage['q' + index].t = s.trim().replace(/</g, '&lt;');
			else if (!back && ui.q('dialog-hint input-checkbox')) {
				if (!marketing.data._answer.storage['q' + index].a.length || ui.val('dialog-hint textarea') && ui.q('dialog-hint input-checkbox:last-child').getAttribute('checked') == 'true')
					return;
			}
		}
		if (back) {
			marketing.index.splice(marketing.index.length - 1, 1);
			index = marketing.index[marketing.index.length - 1];
		} else {
			if (ui.q('dialog-hint input-checkbox[type="radio"][checked="true"]') &&
				ui.q('dialog-hint input-checkbox[type="radio"][checked="true"]').getAttribute('next'))
				index = parseInt(ui.q('dialog-hint input-checkbox[type="radio"][checked="true"]').getAttribute('next'));
			else
				index++;
		}
		var next = function (msg) {
			if (!back)
				marketing.index.push(index);
			if (marketing.data.storage.questions[index])
				marketing.setQuestion(index);
			else if (index < 0) {
				ui.q('dialog-hint div').innerHTML = marketing.data.storage.prolog ? marketing.data.storage.prolog.replace(/\n/g, '<br/>') : '';
				var e = ui.q('dialog-hint button-text.left');
				e.setAttribute('label', 'No');
				e.setAttribute('onclick', 'ui.navigation.closeHint()');
				ui.q('dialog-hint button-text.right').setAttribute('label', 'Yes');
				ui.q('dialog-hint buttons progressindex').style.width = 0;
			} else
				ui.q('dialog-hint div').innerHTML = (marketing.data.storage.epilog ? marketing.data.storage.epilog.replace(/\n/g, '<br/>') : '') + (msg ? '<br/><br/>' + msg.replace(/\n/g, '<br/>') : '');
		};
		if (marketing.data.mode == 'test')
			next();
		else {
			if (marketing.openTag) {
				s = marketing.openTag.split('&');
				for (var i = 0; i < s.length; i++) {
					if (s[i].indexOf('i=') == 0)
						marketing.data._answer.storage.locationId = s[i].substring(2);
					else if (s[i].indexOf('h=') == 0)
						marketing.data._answer.storage.hash = s[i].substring(2);
				}
			}
			var finished = back || marketing.data.storage.questions[index] ? false : true;
			communication.ajax({
				url: global.serverApi + 'marketing',
				webCall: 'marketing.next',
				body: { classname: 'ContactMarketing', id: marketing.data._answer.id, values: { clientMarketingId: marketing.data.id, storage: JSON.stringify(marketing.data._answer.storage), finished: finished } },
				method: marketing.data._answer.id ? 'PUT' : 'POST',
				success(r) {
					if (!finished && r)
						marketing.data._answer = { id: r, storage: {} };
					if (finished)
						marketing.openTag = null;
					next(r);
				}
			});
		}
	}
	static open() {
		if (marketing.data && !ui.q('dialog-hint marketing')?.innerHTML) {
			if (marketing.data.clientMarketingResult.id) {
				if (marketing.data.clientMarketingResult.image)
					ui.navigation.openHint({
						desc: marketing.style + '<img class="result" src="' + global.serverImg + marketing.data.clientMarketingResult.image + '" />' + (marketing.data.storage.epilog ? '<div>'
							+ marketing.data.storage.epilog.replace(/\n/g, '<br/>') + '</div>' : ''),
						pos: '5%,5%', size: '-5%,auto', onclick: 'return;'
					});
				return;
			}
			var s;
			if (marketing.data.storage.html) {
				s = '<div>' + marketing.data.storage.html + '<hint>' + ui.l('marketing.validUntil').replace('{0}', global.date.formatDate(marketing.data.endDate)) + '</hint></div>';
				if (marketing.data.storage.action && marketing.data.storage.actionLabel && marketing.data.storage.html.indexOf('<action/>') > -1)
					s = s.replace('<action/>', '<br/><button-text onclick="' + marketing.data.storage.action + '">' + marketing.data.storage.actionLabel + '</button-text><br/>');
			} else {
				if (!marketing.data._answer)
					marketing.data._answer = { storage: {} };
				marketing.index.push(-1);
				s = '<div>' + (marketing.data.storage.prolog ? marketing.data.storage.prolog.replace(/\n/g, '<br/>') : '') + '</div><buttons><button-text onclick="ui.navigation.closeHint()" label="No" class="left"></button-text><button-text onclick="marketing.next()" label="Yes" class="right"></button-text><progressindex></progressindex></buttons>';
			}
			ui.navigation.openHint({
				desc: marketing.style + '<marketing>' + s + '</marketing>',
				pos: '5%,5%',
				size: '-5%,-4em',
				onclick: 'return;',
				noLogin: true
			});
		}
	}
	static setQuestion(index) {
		var q = marketing.data.storage.questions[index];
		var s = q.question;
		if (q.answers) {
			s += '<br/><answers' + (q.textField ? ' style="width:100%;"' : '') + '>';
			for (var i = 0; i < q.answers.length; i++)
				s += '<br/><input-checkbox' + (q.multiple ? '' : ' type="radio" next="' + (q.answers[i].next ? q.answers[i].next : '') + '"') + ' name="answers" value="' + i + '" label="' + q.answers[i].answer + '" checked="' + (marketing.data._answer.storage['q' + index]?.a.includes(i) ? true : false) + '"></input-checkbox>';
			s += '</answers>';
		}
		if (q.textField) {
			var v = marketing.data._answer.storage['q' + index]?.t;
			if (!v && q.preset)
				try {
					v = eval(q.preset);
				} catch (e) { }
			if (!v)
				v = '';
			if (q.textField == 'textarea')
				s += '<textarea>' + v + '</textarea>';
			else
				s += '<input value="' + v + '" type="' + q.textField + '"></input>';
		}
		ui.q('dialog-hint div').innerHTML = s;
		var e = ui.q('dialog-hint button-text.left');
		e.setAttribute('label', 'marketing.previous');
		e.setAttribute('onclick', 'marketing.next(true)');
		var e = ui.q('dialog-hint button-text.right');
		e.setAttribute('label', 'marketing.next');
		e.setAttribute('onclick', 'marketing.next()');
		formFunc.initFields(ui.q('dialog-hint div'));
		ui.q('dialog-hint buttons progressindex').style.width = ((1 + index) / marketing.data.storage.questions.length * 100) + '%';
	}
}
