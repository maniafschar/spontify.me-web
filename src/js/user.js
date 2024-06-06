import { communication } from './communication';
import { global } from './global';
import { Contact } from './model';
import { ui } from './ui';

export { user };

class user {
	static authority;
	static clientId = parseInt('{placeholderClientId}');
	static contact;
	static email;
	static password = null;
	static templateAppointment = v =>
		global.template`<appointment>
	<div>${ui.l('settings.videoCall')}</div>
	<day d="${v.appointmentDay1Raw}">
		${v.appointmentDay1}
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
	<day d="${v.appointmentDay2Raw}">
		${v.appointmentDay2}
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
	<day d="${v.appointmentDay3Raw}">
		${v.appointmentDay3}
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
</appointment>
<dialogButtons>
	<button-text onclick="user.appointment()" label="events.paypalSignUpButton"></button-text>
</dialogButtons>`;
	static appointment() {
		if (ui.cssValue('dialog-popup appointment', 'display') == 'none')
			ui.toggleHeight('dialog-popup appointment');
		else {
			var t = ui.q('dialog-popup appointment hour.selected');
			if (t) {
				t = global.date.local2server(ui.parents(t, 'day').getAttribute('d') + ' ' + t.getAttribute('class').replace(/[a-z ]/gi, '') + ':00:00');
				communication.ajax({
					url: global.serverApi + 'action/appointment',
					webCall: 'user.appointment',
					method: 'POST',
					body: { description: ui.q('dialog-popup input').value, type: ui.q('dialog-popup .paypal') ? 'AUTHENTICATE' : 'OTHER', time: t },
					responseType: 'json',
					success(r) {
						if (ui.q('dialog-popup div.paypal')) {
							ui.q('dialog-popup div.paypal dialogButtons').outerHTML = '';
							ui.q('dialog-popup div.paypal appointment').outerHTML = '';
							ui.q('dialog-popup div.paypal explain').innerHTML = ui.l('events.videoCallDate').replace('{0}', global.date.formatDate(t));
						}
					}
				});
			}
		}
	}
	static get(id) {
		if (user.contact)
			return user.contact.storage[id];
	}
	static getAppointmentTemplate(type) {
		var v = {}, d = global.date.nextWorkday(new Date());
		if (type == 'authenticate')
			v.inputDisp = 'class="hidden"';
		v.appointmentDay1 = global.date.formatDate(d);
		v.appointmentDay1 = v.appointmentDay1.substring(0, v.appointmentDay1.lastIndexOf(' '));
		v.appointmentDay1Raw = global.date.local2server(d).substring(0, 10);
		d = global.date.nextWorkday(d);
		v.appointmentDay2 = global.date.formatDate(d);
		v.appointmentDay2 = v.appointmentDay2.substring(0, v.appointmentDay2.lastIndexOf(' '));
		v.appointmentDay2Raw = global.date.local2server(d).substring(0, 10);
		d = global.date.nextWorkday(d);
		v.appointmentDay3 = global.date.formatDate(d);
		v.appointmentDay3 = v.appointmentDay3.substring(0, v.appointmentDay3.lastIndexOf(' '));
		v.appointmentDay3Raw = global.date.local2server(d).substring(0, 10);
		communication.ajax({
			url: global.serverApi + 'db/list?query=contact_listVideoCalls&search=' + encodeURIComponent('contactVideoCall.time>cast(\'' + global.date.local2server(d) + '\' as timestamp)'),
			webCall: 'user.getAppointmentTemplate',
			responseType: 'json',
			success(r) {
				for (var i = 1; i < r.length; i++) {
					var d = global.date.getDateFields(global.date.server2local(r[i][0]));
					ui.classAdd('dialog-popup appointment day[d="' + d.year + '-' + d.month + '-' + d.day + '"] .hour' + d.hour, 'closed');
				}
				ui.attr('dialog-popup hour', 'onclick', 'pageEvent.selectVideoCall(this)');
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
		user.authority = v.authority;
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
			user.save({ webCall: 'user.remove', storage: JSON.stringify(user.contact.storage) });
		}
	}
	static reset() {
		user.contact = null;
		user.password = null;
		user.email = null;
		user.authority = null;
	}
	static save(data, success) {
		if (user.contact && user.contact.id) {
			var wc = data.webCall;
			delete data.webCall;
			for (var k in v.values) {
				if (user.contact[k] != v.values[k]) {
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
					return true;
				}
			}
		}
	}
	static set(key, value) {
		if (value) {
			user.contact.storage[key] = value;
			user.save({ webCall: 'user.set', storage: JSON.stringify(user.contact.storage) });
		} else
			user.remove(key);
	}
};