import { communication } from "./communication";
import { global } from "./global";
import { intro } from "./intro";
import { ClientMarketing, model } from "./model";
import { formFunc, ui } from "./ui";

export { marketing }

class marketing {
	static data;
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
		var index = parseInt(ui.q('hint input[name="index"]').value);
		var q = marketing.data.storage.questions[index];
		if (!q) {
			ui.q('hint>div').innerHTML = marketing.data.storage.epilog + '<br/><br/><buttontext class="bgColor" onclick="intro.closeHint()">Schließen</buttontext>';
			return;
		}
		var s = q.question + '<br/>';
		for (var i = 0; i < q.answers.length; i++)
			s += '<input type="' + (q.answerType ? 'checkbox' : 'radio') + '" name="answers" value="' + i + '" label="' + q.answers[i].answer + '" />';
		if (q.textField)
			s += '<textarea></textarea>';
		s += '<br/><br/><buttontext onclick="marketing.next()" class="bgColor">Weiter</buttontext><input type="hidden" name="index" value="' + (index + 1) + '"/>';
		ui.q('hint>div').innerHTML = s;
		formFunc.initFields(ui.q('hint'));
	}
	static open() {
		if (marketing.data) {
			intro.openHint({
				desc: '<div>' + marketing.data.storage.prolog + '<br/><br/><buttontext class="bgColor" onclick="marketing.next()">next</buttontext><input type="hidden" name="index" value="0"/></div>',
				pos: '5%,5%', size: '90%,auto', onclick: 'return;'
			});
		}
	}
}