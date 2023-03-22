import { communication } from './communication';
import { global } from './global';
import { Contact } from './model';
import { ui } from './ui';

export { user };

class user {
	static client = '{placeholderClient}';
	static contact;
	static email;
	static password = null;
	static scale = 1;
	static templateAppointment = v =>
		global.template`<videoCall>
		<div>${ui.l('settings.videoCall')}</div>
		<day d="${v.videoCallDay1Raw}">
			${v.videoCallDay1}
			<hour class="hour09"></hour>
			<hour class="hour10"></hour>
			<hour class="hour11"></hour>
			<hour class="hour12"></hour>
			<hour class="hour13"></hour>
			<hour class="hour14"></hour>
			<hour class="hour15"></hour>
			<hour class="hour16"></hour>
			<hour class="hour17"></hour>
		</day>
		<day d="${v.videoCallDay2Raw}">
			${v.videoCallDay2}
			<hour class="hour09"></hour>
			<hour class="hour10"></hour>
			<hour class="hour11"></hour>
			<hour class="hour12"></hour>
			<hour class="hour13"></hour>
			<hour class="hour14"></hour>
			<hour class="hour15"></hour>
			<hour class="hour16"></hour>
			<hour class="hour17"></hour>
		</day>
		<day d="${v.videoCallDay3Raw}">
			${v.videoCallDay3}
			<hour class="hour09"></hour>
			<hour class="hour10"></hour>
			<hour class="hour11"></hour>
			<hour class="hour12"></hour>
			<hour class="hour13"></hour>
			<hour class="hour14"></hour>
			<hour class="hour15"></hour>
			<hour class="hour16"></hour>
			<hour class="hour17"></hour>
		</day>
		<input placeholder="Thema des Termins" ${v.inputDisp}/>
	</videoCall>
	<dialogButtons>
		<buttontext class="bgColor${v.hideVideoCallButton}" onclick="user.videoCall()">${ui.l('events.paypalSignUpButton')}</buttontext>
	</dialogButtons>
	</videoCall>`;

	static get(id) {
		if (user.contact)
			return user.contact.storage[id];
	}
	static getAppointmentTemplate(type) {
		var v = {}, d = global.date.nextWorkday(new Date());
		if (type == 'authenticate')
			v.inputDisp = 'class="noDisp"';
		v.videoCallDay1 = global.date.formatDate(d);
		v.videoCallDay1 = v.videoCallDay1.substring(0, v.videoCallDay1.lastIndexOf(' '));
		v.videoCallDay1Raw = global.date.local2server(d).substring(0, 10);
		d = global.date.nextWorkday(d);
		v.videoCallDay2 = global.date.formatDate(d);
		v.videoCallDay2 = v.videoCallDay2.substring(0, v.videoCallDay2.lastIndexOf(' '));
		v.videoCallDay2Raw = global.date.local2server(d).substring(0, 10);
		d = global.date.nextWorkday(d);
		v.videoCallDay3 = global.date.formatDate(d);
		v.videoCallDay3 = v.videoCallDay3.substring(0, v.videoCallDay3.lastIndexOf(' '));
		v.videoCallDay3Raw = global.date.local2server(d).substring(0, 10);
		communication.ajax({
			url: global.serverApi + 'db/list?query=contact_listVideoCalls&search=' + encodeURIComponent('contactVideoCall.time>\'' + global.date.local2server(d) + '\''),
			webCall: 'user.getAppointmentTemplate(type)',
			responseType: 'json',
			success(r) {
				for (var i = 1; i < r.length; i++) {
					var d = global.date.getDateFields(global.date.server2Local(r[i][0]));
					ui.classAdd('popup videoCall day[d="' + d.year + '-' + d.month + '-' + d.day + '"] .hour' + d.hour, 'closed');
				}
				ui.attr('popup hour', 'onclick', 'pageEvent.selectVideoCall(this)');
			}
		});
		return user.templateAppointment(v);
	}
	static init(v) {
		user.contact = new Contact();
		for (var k in v) {
			if (user.contact.hasOwnProperty(k.replace('contact.', '')))
				user.contact[k.replace('contact.', '')] = v[k];
		}
		user.contact.filter = user.contact.filter ? JSON.parse(user.contact.filter) : {};
		try {
			user.contact.storage = user.contact.storage ? JSON.parse(user.contact.storage) : {};
		} catch (e) {
			user.contact.storage = {};
		}
	}
	static remove(key) {
		var d = {}, save = false;
		for (var k in user.contact.storage) {
			if (k == key)
				save = true;
			else
				d[k] = user.contact.storage[k];
		}
		if (save) {
			user.contact.storage = d;
			user.save({ webCall: 'user.remove(key)', storage: JSON.stringify(user.contact.storage) });
		}
	}
	static reset() {
		user.contact = null;
		user.password = null;
		user.email = null;
	}
	static save(data, success) {
		if (user.contact && user.contact.id) {
			var wc = data.webCall;
			delete data.webCall;
			var v = {
				classname: 'Contact',
				id: user.contact.id,
				values: data.values ? data.values : data
			}
			communication.ajax({
				url: global.serverApi + 'db/one',
				method: 'PUT',
				progressBar: success ? true : false,
				body: v,
				webCall: wc,
				success() {
					for (var k in v.values)
						user.contact[k] = v.values[k];
					if (typeof user.contact.filter == 'string')
						user.contact.filter = JSON.parse(user.contact.filter);
					if (typeof user.contact.storage == 'string')
						user.contact.storage = JSON.parse(user.contact.storage);
					if (success)
						success.call();
				}
			});
		}
	}
	static set(key, value) {
		if (value) {
			user.contact.storage[key] = value;
			user.save({ webCall: 'user.set(key,value)', storage: JSON.stringify(user.contact.storage) });
		} else
			user.remove(key);
	}
	static videoCall() {
		if (ui.cssValue('popup videoCall', 'display') == 'none')
			ui.toggleHeight('popup videoCall');
		else {
			var t = ui.q('popup videoCall hour.selected');
			if (t) {
				t = global.date.local2server(ui.parents(t, 'day').getAttribute('d') + ' ' + t.getAttribute('class').replace(/[a-z ]/gi, '') + ':00:00');
				var d = ui.q('popup input');
				communication.ajax({
					url: global.serverApi + 'action/videoCall',
					webCall: 'user.videoCall()',
					method: 'POST',
					body: { description: d.value, type: ui.classContains('noDisp') ? 'AUTHENTICATE' : 'OTHER', time: t },
					responseType: 'json',
					success(r) {
						if (ui.q('popup div.paypal')) {
							ui.q('popup div.paypal dialogButtons').outerHTML = '';
							ui.q('popup div.paypal videoCall').outerHTML = '';
							ui.q('popup div.paypal explain').innerHTML = ui.l('events.videoCallDate').replace('{0}', global.date.formatDate(e));
						}
					}
				});
			}
		}
	}
};