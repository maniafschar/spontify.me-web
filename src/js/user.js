import { communication } from './communication';
import { global } from './global';
import { Contact } from './model';

export { user };

class user {
	static contact;
	static email;
	static introState_session = { goHome: 0, goToList: 0, menuOpen: 0 };
	static password = null;
	static scale = 1;
	static tsVisits = 0;

	static init(v) {
		user.contact = new Contact();
		for (var k in v) {
			if (user.contact.hasOwnProperty(k.replace('contact.', '')))
				user.contact[k.replace('contact.', '')] = v[k];
		}
		if (user.contact.filter)
			user.contact.filter = JSON.parse(user.contact.filter);
		if (user.contact.introState)
			user.contact.introState = JSON.parse(user.contact.introState);
		else
			user.contact.introState = { homeImage: 0, homeLocation: 0, settingsLoggedIn: 0, menuOpen: 0, homeInvite: 0 };
	}
	static reset() {
		user.contact = null;
		user.password = null;
		user.email = null;
	}
	static save(data, success) {
		if (user.contact && user.contact.id) {
			data.classname = 'Contact';
			data.id = user.contact.id;
			communication.ajax({
				progressBar: success ? true : false,
				url: global.server + 'db/one',
				method: 'PUT',
				body: data,
				success: success
			});
		}
	}
};