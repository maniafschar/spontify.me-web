import { communication } from './communication';

export { model, Contact, ContactLink, Location, ContactNotification, EventParticipate, LocationFavorite, Event, Block, Chat, LocationOwnerHistory, ContactVisit, ContactGroup, ContactGroupLink };

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
			key = key.split('.');
			for (var i2 = 0; i2 < key.length; i2++) {
				if (i2 == 0 && !o.hasOwnProperty(key[i2]) && key.length > i2 && o.hasOwnProperty(key[i2 + 1]))
					i2++;
				if (key[i2].indexOf('_') != 0 && !model.reportedErrors[keys[i]] && !o.hasOwnProperty(key[i2])) {
					communication.sendError('model.convert: property ' + keys[i] + ' not found, available properties\n' + Object.keys(object) + '\nproperties/values of object\n' + JSON.stringify(keys) + '\n' + JSON.stringify(object2Transform));
					model.reportedErrors[keys[i]] = 1;
				}
				if (i2 < key.length - 1)
					o = o[key[i2]];
				else if (o)
					o[key[i2]] = object2Transform[i];
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

class Block extends BaseEntity {
	note;
	reason;
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
	language;
	latitude;
	longitude;
	notificationBirthday;
	notificationChat;
	notificationEngagement;
	notificationFriendRequest;
	notificationMarkEvent;
	notificationVisitLocation;
	notificationVisitProfile;
	paypalMerchantId;
	pseudonym;
	rating;
	search;
	state;
	storage;
	type;
	verified;
	visitPage;

	block = new Block();
	contactGroupLink = new ContactGroupLink();
	contactLink = new ContactLink();
	contactNotification = new ContactNotification();
	contactRating = new ContactRating();
	contactVisit = new ContactVisit();
	event = new Event();
	eventParticipate = new EventParticipate();
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

class Chat extends BaseEntity {
	action;
	contactId;
	contactId2;
	image;
	locationId;
	note;
	seen;
	textId;
}

class Event extends BaseEntity {
	category;
	confirm;
	contactId;
	endDate;
	image;
	imageList;
	link;
	locationId;
	marketingEvent;
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
	budget;
	contactId;
	category;
	description;
	email;
	image;
	imageList;
	latitude;
	longitude;
	name;
	subcategories;
	telephone;
	town;

	block = new Block();
	contact = new Contact();
	contactLink = new ContactLink();
	event = new Event();
	eventParticipate = new EventParticipate();
	locationFavorite = new LocationFavorite();
	locationRating = new LocationRating();
}

class LocationFavorite extends BaseEntity {
	favorite;
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