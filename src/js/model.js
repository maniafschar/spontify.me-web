import { communication } from './communication';
import { user } from './user';

export { model, Contact, ContactLink, Location, ContactNotification, EventParticipate, LocationOpenTime, LocationFavorite, Event, ContactBlock, Chat, LocationOwnerHistory, ContactVisit, ContactWhatToDo, ContactGroup, ContactGroupLink };

class model {
	static reportedErrors = {};
	static convert(object, list, index) {
		var keys, object2Transform;
		if (index) {
			if (index >= list.length)
				return object;
			keys = list[0];
			object2Transform = list[index];
		} else {
			keys = Object.keys(list);
			object2Transform = [];
			for (var i = 0; i < keys.length; i++)
				object2Transform.push(list[keys[i]]);
		}
		for (var i = 0; i < keys.length; i++) {
			var o = object, key = keys[i];
			if (key.indexOf('.') == 0)
				key = key.substring(1);
			else if (key == 'OT' && object2Transform[i]) {
				var a = [];
				for (var i2 = 1; i2 < object2Transform[i].length; i2++)
					a.push(model.convert(new LocationOpenTime(), object2Transform[i], i2));
				object.locationOpenTime = a;
			}
			key = key.split('.');
			for (var i2 = 0; i2 < key.length; i2++) {
				if (key[i2] != 'OT') {
					if (i2 == 0 && !o.hasOwnProperty(key[i2]) && key.length > i2 && o.hasOwnProperty(key[i2 + 1]))
						i2++;
					if (key[i2].indexOf('_') != 0 && user.contact && user.contact.id == 3 && !model.reportedErrors[keys[i]] && !o.hasOwnProperty(key[i2])) {
						communication.sendError('model.convert:\n' + object.constructor.name + ' has no property called ' + keys[i] + '\n' + JSON.stringify(keys) + '\n' + JSON.stringify(object2Transform));
						model.reportedErrors[keys[i]] = 1;
					}
					if (i2 < key.length - 1)
						o = o[key[i2]];
					else if (o)
						o[key[i2]] = object2Transform[i];
				}
			}
		}
		return object;
	}
}

class BaseEntity {
	createdAt;
	id;
	modifiedAt;
}

class Contact extends BaseEntity {
	aboutMe;
	active;
	age;
	ageDivers;
	ageFemale;
	ageMale;
	attr;
	attrEx;
	attr0;
	attr0Ex;
	attr1;
	attr1Ex;
	attr2;
	attr2Ex;
	attr3;
	attr3Ex;
	attr4;
	attr4Ex;
	attr5;
	attr5Ex;
	attrInterest;
	attrInterestEx;
	birthday;
	birthdayDisplay;
	budget;
	filter;
	findMe;
	gender;
	guide;
	idDisplay;
	image;
	imageList;
	introState;
	language;
	latitude;
	longitude;
	notificationBirthday;
	notificationChat;
	notificationFriendRequest;
	notificationMarkEvent;
	notificationVisitLocation;
	notificationVisitProfile;
	pseudonym;
	rating;
	search;
	state;
	storage;
	type;
	verified;
	visitPage;

	contactBlock = new ContactBlock();
	contactLink = new ContactLink();
	contactGroupLink = new ContactGroupLink();
	contactNotification = new ContactNotification();
	contactRating = new ContactRating();
	contactVisit = new ContactVisit();
	contactWhatToDo = new ContactWhatToDo();
}

class ContactBlock extends BaseEntity {
	note;
	reason;
}

class ContactGroup extends BaseEntity {
	contactId;
	name;
}

class ContactGroupLink extends BaseEntity {
	contactGroupId;
	contactId2;
}

class ContactLink extends BaseEntity {
	contactId;
	contactId2;
	status;
}

class ContactNotification extends BaseEntity {
	action;
	contactId;
	contactId2;
	seen;
	text;
}

class ContactRating extends BaseEntity {
	contactId;
	contactId2;
	rating;
	text;
}

class ContactVisit extends BaseEntity {
	count;
}

class ContactWhatToDo extends BaseEntity {
	active;
	budget;
	contactId;
	eventId;
	keywords;
	locationId;
	message;
	time;
}

class Chat extends BaseEntity {
	contactId;
	contactId2;
	image;
	locationId;
	note;
	seen;
}

class Event extends BaseEntity {
	confirm;
	contactId;
	endDate;
	image;
	imageList;
	link;
	locationId;
	maxParticipants;
	price;
	startDate;
	text;
	type;
	visibility;
}

class EventParticipate extends BaseEntity {
	contactId;
	eventDate;
	eventId;
	reason;
	state;
}

class Location extends BaseEntity {
	address;
	attr0;
	attr0Ex;
	attr1;
	attr1Ex;
	attr2;
	attr2Ex;
	attr3;
	attr3Ex;
	attr4;
	attr4Ex;
	attr5;
	attr5Ex;
	bonus;
	budget;
	contactId;
	category;
	description;
	email;
	image;
	imageList;
	isOpen;
	latitude;
	longitude;
	name;
	openTimesBankholiday;
	openTimesEntries;
	openTimesText;
	ownerId;
	parkingOption;
	parkingText;
	quater;
	rating;
	subcategories;
	telephone;
	town;
	url;

	contact = new Contact();
	event = new Event();
	locationFavorite = new LocationFavorite();
	locationOpenTime;
	locationRating = new LocationRating();
}

class LocationFavorite extends BaseEntity {
	favorite;
}

class LocationOpenTime extends BaseEntity {
	closeAt;
	day;
	locationId;
	openAt;
}

class LocationOwnerHistory extends BaseEntity {
}

class LocationRating extends BaseEntity {
	contactId;
	image;
	locationId;
	paid;
	rating;
	text;
}