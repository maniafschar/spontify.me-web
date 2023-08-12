import { communication } from './communication';
import { global } from './global';
import { ClientMarketing, model } from './model';
import { formFunc, ui } from './ui';
import { user } from './user';

export { marketing }

class marketing {
	static data;
	static answers;
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
		var index = parseInt(ui.q('dialog-hint index').innerText);
		var answers = ui.qa('dialog-hint input-checkbox[checked="true"]');
		for (var i = 0; i < answers.length; i++) {
			if (!marketing.answers['q' + index])
				marketing.answers['q' + index] = { choice: [] };
			marketing.answers['q' + index].choice.push(answers[i].value);
		}
		if (ui.q('hint textarea') && ui.q('dialog-hint textarea').value)
			marketing.answers['q' + index].text = ui.q('dialog-hint textarea').value;
		if (ui.q('dialog-hint input-checkbox[type="radio"][checked="true"]') &&
			ui.q('dialog-hint input-checkbox[type="radio"][checked="true"]').getAttribute('next'))
			index = parseInt(ui.q('dialog-hint input-checkbox[type="radio"][checked="true"]').getAttribute('next'));
		else
			index++;
		var q = marketing.data.storage.questions[index];
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
		if (!q) {
			ui.q('dialog-hint div').innerHTML = marketing.data.storage.epilog + '<br/><br/><button-text onclick="ui.navigation.closeHint()" label="Schließen"></button-text>';
			return;
		}
		var s = q.question + '<br/>';
		for (var i = 0; i < q.answers.length; i++)
			s += '<br/><input-checkbox' + (q.multiple ? '' : ' type="radio" next="' + q.answers[i].next + '"') + ' name="answers" value="' + i + '" label="' + q.answers[i].answer + '"></input-checkbox>';
		if (q.textField)
			s += '<textarea></textarea>';
		s += '<br/><br/><button-text onclick="marketing.next()" label="Weiter"></button-text><index>' + index + '</index>';
		ui.q('dialog-hint div').innerHTML = s;
		formFunc.initFields(ui.q('dialog-hint div'));
	}
	static open() {
		if (marketing.data) {
			marketing.answers = {};
			ui.navigation.openHint({
				desc: '<div>' + marketing.data.storage.prolog + '<br/><br/><button-text onclick="marketing.next()" label="next"></button-text><index>-1</index></div>',
				pos: '5%,5%', size: '90%,auto', onclick: 'return;'
			});
		}
	}
}