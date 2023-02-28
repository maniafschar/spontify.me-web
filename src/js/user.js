import { communication } from './communication';
import { global } from './global';
import { Contact } from './model';

export { user };

class user {
	static contact;
	static email;
	static password = null;
	static scale = 1;

	static get(id) {
		if (user.contact)
			return user.contact.storage[id];
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
			user.save({ storage: JSON.stringify(user.contact.storage) });
		}
	}
	static reset() {
		user.contact = null;
		user.password = null;
		user.email = null;
	}
	static save(data, success) {
		if (user.contact && user.contact.id) {
			var v = {
				classname: 'Contact',
				id: user.contact.id,
				values: data.values ? data.values : data
			}
			communication.ajax({
				url: global.server + 'db/one',
				method: 'PUT',
				progressBar: success ? true : false,
				body: v,
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
			user.save({ storage: JSON.stringify(user.contact.storage) });
		} else
			user.remove(key);
	}
};