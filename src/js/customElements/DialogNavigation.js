import { initialisation } from '../init';
import { formFunc } from '../ui';

export { DialogNavigation }

class DialogNavigation extends HTMLElement {
	static lastPopup = null;

	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		this.setAttribute('class', 'bgColor');
		const style = document.createElement('style');
		style.textContent = `${initialisation.customElementsCss}
item {
	width: 25%;
	position: relative;
	height: 100%;
	float: left;
	text-align: center;
	padding-top: 1.1em;
	cursor: pointer;
	transition: all 0.4s ease-out;
}

item svg {
	height: 2em;
	transition: all 0.4s ease-out;
	filter: drop-shadow(0.1em 0.1em 0.1em rgba(0, 0, 0, 0.2));
	padding: 0 0.1em;
	width: 2em;
	line-height: 2.2;
}

item.active svg {
	filter: drop-shadow(0.2em 0.2em 0.2em rgba(0, 0, 0, 0.35));
	margin: -0.2em 0 0 -0.2em;
	height: 2.1em;
}

item.active,
item:hover {
	background: var(--bg2stop);
}

buttonIcon svg {
	width: 2em;
	height: 2em;
	line-height: 2.2;
}

badgeChats,
badgeNotifications {
	text-align: center;
	position: absolute;
	line-height: 2;
	width: 2em;
}

badgeNotifications {
	padding-top: 0.1em;
}

buttonIcon.chats {
	border-radius: 0 50% 50% 0 !important;
	margin-top: -2em;
}

buttonIcon.notifications {
	border-radius: 50% 0 0 50% !important;
	margin-top: -2em;
	right: 0;
}`;
		this._root.appendChild(style);
		var t = this;
		var addIcon = function (click, classname) {
			var element = document.createElement('buttonIcon');
			element.setAttribute('onclick', click);
			element.setAttribute('class', classname.toLowerCase() + ' mainBG');
			var element2 = document.createElement('badge' + classname);
			element.appendChild(element2);
			element2 = document.createElement('img');
			element2.setAttribute('source', classname.toLowerCase());
			element.appendChild(element2);
			t._root.appendChild(element);
		};
		var addItem = function (click, classname) {
			var element = document.createElement('item');
			element.setAttribute('onclick', click);
			element.setAttribute('class', classname);
			var element2 = document.createElement('img');
			element2.setAttribute('source', classname);
			element.appendChild(element2);
			t._root.appendChild(element);
		};
		addIcon('pageChat.toggleUserList()', 'Chats');
		addItem('ui.navigation.goTo("home", true)', 'home');
		addItem('ui.navigation.goTo("search")', 'search');
		addItem('ui.navigation.goTo("info")', 'info');
		addItem('ui.navigation.goTo("events")', 'events');
		addItem('ui.navigation.goTo("contacts")', 'contacts');
		addIcon('pageHome.toggleNotification()', 'Notifications');
		this._root.querySelector('item').classList.add('active');
		formFunc.svg.replaceAll(this._root.querySelectorAll('img'));
	}
}