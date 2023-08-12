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
	static index = 0;
	static prev = 0;
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
	static next() {
		var prefix = ui.q('marketing').innerHTML ? 'marketing ' : 'dialog-hint ';
		var answers = ui.qa(prefix + 'input-checkbox[checked="true"]');
		if (!marketing.answers['q' + marketing.index])
			marketing.answers['q' + marketing.index] = { choice: [] };
		for (var i = 0; i < answers.length; i++)
			marketing.answers['q' + marketing.index].choice.push(answers[i].getAttribute('value'));
		if (ui.q('hint textarea') && ui.q(prefix + 'textarea').value)
			marketing.answers['q' + marketing.index].text = ui.q(prefix + 'textarea').value;
		marketing.prev = marketing.index;
		if (ui.q(prefix + 'input-checkbox[type="radio"][checked="true"]') &&
			ui.q(prefix + 'input-checkbox[type="radio"][checked="true"]').getAttribute('next'))
			marketing.index = parseInt(ui.q(prefix + 'input-checkbox[type="radio"][checked="true"]').getAttribute('next'));
		else
			marketing.index++;
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
		if (!marketing.data.storage.questions[marketing.index]) {
			ui.q(prefix + 'div').innerHTML = marketing.data.storage.epilog + '<br/><br/><button-text onclick="marketing.close()" label="Schließen"></button-text>';
			return;
		}
		marketing.setQuestion(marketing.index);
	}
	static setQuestion(index) {
		var prefix = ui.q('marketing').innerHTML ? 'marketing ' : 'dialog-hint ';
		if (index < 0)
			marketing.open(prefix.indexOf('-') < 0);
		else {
			var q = marketing.data.storage.questions[index];
			var s = q.question + '<br/><answers>';
			for (var i = 0; i < q.answers.length; i++)
				s += '<br/><input-checkbox' + (q.multiple ? '' : ' type="radio" next="' + q.answers[i].next + '"') + ' name="answers" value="' + i + '" label="' + q.answers[i].answer + '"></input-checkbox>';
			s += '</answers>';
			if (q.textField)
				s += '<textarea></textarea>';
			s += '<br/><br/><button-text onclick="marketing.previous()" label="marketing.previous"></button-text><button-text onclick="marketing.next()" label="marketing.next"></button-text>';
			ui.q(prefix + 'div').innerHTML = s;
			formFunc.initFields(ui.q(prefix + 'div'));
			marketing.index = index;
		}
	}
	static open(inline) {
		if (marketing.data) {
			if (!marketing.answers)
				marketing.answers = {};
			marketing.index = -1;
			var s = '<div>' + marketing.data.storage.prolog.replace(/\n/g, '<br/>') + '<br/><br/><button-text onclick="marketing.next()" label="Yes"></button-text><button-text onclick="marketing.close()" label="No"></button-text></div>';
			if (inline) {
				var e = ui.q('marketing');
				e.innerHTML = s;
				e.style.display = 'block';
			} else
				ui.navigation.openHint({
					desc: s,
					pos: '5%,5%', size: '90%,auto', onclick: 'return;'
				});
		}
	}
	static previous() {
		marketing.setQuestion(marketing.prev);
	}
}