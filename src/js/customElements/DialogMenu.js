import { initialisation } from '../init';
import { ui } from '../ui';
import { DialogHint } from './DialogHint';

export { DialogMenu }

class DialogMenu extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		ui.classAdd(this, 'bgColor');
		const style = document.createElement('style');
		style.textContent = `${initialisation.customElementsCss}
div{
	position: relative;
	z-index: 1;
	display: block;
}

hinky {
	right: 0.9em;
	top: -1em;
	border-bottom: solid 1.1em var(--bg2stop);
	position: absolute;
	border-right: solid 1.1em transparent;
	border-left: solid 1.1em transparent;
	z-index: 0;
}

a {
	color: var(--buttonText);
	display: block;
	position: relative;
	padding: 0.75em 0;
	cursor: pointer;
}

a:hover,
a.highlight {
	color: var(--bgHint);
}

title {
	font-weight: bold;
	color: rgb(0, 94, 160);
	padding-top: 0.75em;
}`;
		this._root.appendChild(style);
		this.setAttribute('style', 'transform:scale(0)');
		var element = document.createElement('div');
		this._root.appendChild(element);
		element = document.createElement('hinky');
		this._root.appendChild(element);
	}

	static close(exec) {
		if (ui.cssValue('dialog-menu', 'transform').indexOf('1') > 0)
			ui.navigation.toggleMenu();
		if (DialogHint.currentStep < 0)
			ui.navigation.closeHint();
		if (exec)
			exec();
	}
	static toggle(id) {
		if (!id)
			id = ui.navigation.getActiveID();
		setTimeout(function () {
			var e = ui.q('content>[class*="SlideIn"]');
			if (e && id.toLowerCase() != e.nodeName.toLowerCase())
				return;
			e = ui.q('dialog-menu');
			if (id == 'contacts')
				ui.html(e._root.querySelector('div'), `
<container>
	<a style="display:none;">
			${ui.l('search.title')}
	</a><a onclick="ui.query.contactFriends()">
		${ui.l('contacts.friendshipTitle')}
	</a><a onclick="ui.query.contactVisitees()">
		${ui.l('title.history')}
	</a><a onclick="ui.query.contactVisits()">
		${ui.l('title.visits')}
	</a>
</container>`);
			else if (id == 'events')
				ui.html(e._root.querySelector('div'), `
<container>
	<a style="display:none;">
		${ui.l('search.title')}
	</a><a onclick="ui.query.eventTickets()">
		${ui.l('events.myTickets')}
	</a><a onclick="ui.query.eventMy()">
		${ui.l('events.myEvents')}
	</a><a onclick="pageEvent.edit()">
		${ui.l('events.new')}
	</a>
</container>`);
			e.setAttribute('type', id);
			ui.classAdd(ui.qa('dialog-menu a')[parseInt(ui.q(id).getAttribute('menuIndex'))], 'highlight');
			ui.css(e, 'transform', e.style.transform.indexOf('1') > 0 ? 'scale(0)' : 'scale(1)')
		}, 10);
	}
}