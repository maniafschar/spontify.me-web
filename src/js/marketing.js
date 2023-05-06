import { communication } from "./communication";
import { global } from "./global";
import { intro } from "./intro";
import { ClientMarketing, model } from "./model";
import { formFunc, ui } from "./ui";

export { marketing }

class marketing {
	static data;
	static answers;
	static init() {
		communication.ajax({
			url: global.serverApi + 'action/marketing',
			responseType: 'json',
			webCall: 'marketing.init()',
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
		var index = parseInt(ui.q('hint index').innerText);
		var answers = ui.qa('hint input:checked');
		for (var i = 0; i < answers.length; i++) {
			if (!marketing.answers['q' + index])
				marketing.answers['q' + index] = { choice: [] };
			marketing.answers['q' + index].choice.push(answers[i].value);
		}
		if (ui.q('hint textarea') && ui.q('hint textarea').value)
			marketing.answers['q' + index].text = ui.q('hint textarea').value;
		if (ui.q('hint input[type="radio"]:checked'))
			index = parseInt(ui.q('hint input[type="radio"]:checked').getAttribute('next'));
		else
			index++;
		var q = marketing.data.storage.questions[index];
		if (!q) {
			if (marketing.data.mode != 'test') {
				communication.ajax({
					url: global.serverApi + 'db/one',
					webCall: 'marketing.next()',
					body: { classname: 'ContactMarketing', values: { clientMarketingId: marketing.data.id, storage: JSON.stringify(marketing.answers) } },
					method: 'POST'
				});
			}
			ui.q('hint>div').innerHTML = marketing.data.storage.epilog + '<br/><br/><buttontext class="bgColor" onclick="intro.closeHint()">Schließen</buttontext>';
			return;
		}
		var s = q.question + '<br/>';
		for (var i = 0; i < q.answers.length; i++)
			s += '<input type="' + (q.answerType ? 'checkbox' : 'radio" next="' + q.answers[i].next) + '" name="answers" value="' + i + '" label="' + q.answers[i].answer + '" />';
		if (q.textField)
			s += '<textarea></textarea>';
		s += '<br/><br/><buttontext onclick="marketing.next()" class="bgColor">Weiter</buttontext><index>' + index + '</index>';
		ui.q('hint>div').innerHTML = s;
		formFunc.initFields(ui.q('hint'));
	}
	static open() {
		if (marketing.data) {
			marketing.answers = {};
			intro.openHint({
				desc: '<div>' + marketing.data.storage.prolog + '<br/><br/><buttontext class="bgColor" onclick="marketing.next()">next</buttontext><index>-1</index></div>',
				pos: '5%,5%', size: '90%,auto', onclick: 'return;'
			});
		}
	}
}