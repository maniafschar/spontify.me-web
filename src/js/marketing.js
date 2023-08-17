import { communication } from './communication';
import { global } from './global';
import { ClientMarketing, model } from './model';
import { pageHome } from './pageHome';
import { formFunc, ui } from './ui';
import { user } from './user';

export { marketing }

class marketing {
	static data;
	static answers;
	static index = [];
	static close() {
		if (ui.q('marketing').innerHTML) {
			pageHome.init(true);
			ui.q('marketing').outerHTML = '';
		} else
			ui.navigation.closeHint();
	}
	static init() {
		communication.ajax({
			url: global.serverApi + 'action/marketing',
			responseType: 'json',
			webCall: 'marketing.init',
			success(r) {
				if (r.length > 1) {
					marketing.data = model.convert(new ClientMarketing(), r, 1);
					marketing.data.storage = JSON.parse(marketing.data.storage);
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
		marketing.answers['q' + index] = { choice: [] };
		for (var i = 0; i < answers.length; i++)
			marketing.answers['q' + index].choice.push(answers[i].getAttribute('value'));
		if (ui.q(prefix + 'textarea') && ui.q(prefix + 'textarea').value)
			marketing.answers['q' + index].text = ui.q(prefix + 'textarea').value;
		if (!back && ui.q(prefix + 'input-checkbox') && !marketing.answers['q' + index].choice.length && !marketing.answers['q' + index].text)
			return;
		if (marketing.data.mode != 'test') {
			communication.ajax({
				url: global.serverApi + (user.contact ? 'db/one' : 'action/marketing'),
				webCall: 'marketing.next',
				body: { classname: 'ContactMarketing', id: marketing.data.answerId, values: { clientMarketingId: marketing.data.id, storage: JSON.stringify(marketing.answers) } },
				method: marketing.data.answerId ? 'PUT' : 'POST',
				success(r) {
					if (r)
						marketing.data.answerId = r;
				}
			});
		}
		if (back) {
			marketing.index.splice(marketing.index.length - 1, 1);
			marketing.setQuestion(marketing.index[marketing.index.length - 1]);
		} else {
			if (ui.q(prefix + 'input-checkbox[type="radio"][checked="true"]') &&
				ui.q(prefix + 'input-checkbox[type="radio"][checked="true"]').getAttribute('next'))
				index = parseInt(ui.q(prefix + 'input-checkbox[type="radio"][checked="true"]').getAttribute('next'));
			else
				index++;
			marketing.index.push(index);
			if (marketing.data.storage.questions[index])
				marketing.setQuestion(index);
			else
				ui.q(prefix + 'div').innerHTML = marketing.data.storage.epilog.replace(/\n/g, '<br/>');
		}
	}
	static open(inline) {
		if (marketing.data) {
			if (!marketing.answers)
				marketing.answers = {};
			marketing.index.push(-1);
			var s = '<div>' + marketing.data.storage.prolog.replace(/\n/g, '<br/>') + '</div><buttons><button-text onclick="marketing.close()" label="No" class="left"></button-text><button-text onclick="marketing.next()" label="Yes" class="right"></button-text><progressindex></progressindex></buttons>';
			if (inline) {
				var e = ui.q('marketing');
				e.innerHTML = s;
				e.style.display = 'block';
			} else
				ui.navigation.openHint({
					desc: '<marketing>' + s + '</marketing>',
					pos: '5%,5%', size: '90%,auto', onclick: 'return;'
				});
		}
	}
	static setQuestion(index) {
		var prefix = ui.q('marketing').innerHTML ? 'marketing ' : 'dialog-hint ';
		if (index < 0) {
			marketing.open(prefix.indexOf('-') < 0);
			ui.q('marketing buttons progressindex').style.width = 0;
		} else {
			var q = marketing.data.storage.questions[index];
			var s = q.question + '<br/><answers>';
			for (var i = 0; i < q.answers.length; i++)
				s += '<br/><input-checkbox' + (q.multiple ? '' : ' type="radio" next="' + q.answers[i].next + '"') + ' name="answers" value="' + i + '" label="' + q.answers[i].answer + '" checked="' + (marketing.answers['q' + index]?.choice.includes('' + i) ? true : false) + '"></input-checkbox>';
			s += '</answers>';
			if (q.textField)
				s += '<textarea></textarea>';
			ui.q(prefix + 'div').innerHTML = s;
			var e = ui.q('marketing button-text.left');
			e.setAttribute('label', 'marketing.previous');
			e.setAttribute('onclick', 'marketing.next(true)');
			var e = ui.q('marketing button-text.right');
			e.setAttribute('label', 'marketing.next');
			e.setAttribute('onclick', 'marketing.next()');
			formFunc.initFields(ui.q(prefix + 'div'));
			ui.q('marketing buttons progressindex').style.width = ((1 + index) / marketing.data.storage.questions.length * 100) + '%';
		}
	}
}
