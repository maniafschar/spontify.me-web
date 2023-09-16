import { initialisation } from '../init';
import { global } from '../global';

export { ListRow }

class ListRow extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.textContent = `${initialisation.customElementsCss}
div {
	text-align: left;
	overflow: hidden;
	cursor: pointer;
	background: rgba(0, 0, 0, 0.08);
	margin: 1em 0 0.5em 0;
	height: 6em;
	transition: all 0.4s ease-out;
	stroke: var(--text);
	fill: var(--text);
}

text {
	max-height: 5.5em;
	overflow: hidden;
	left: 6em;
	right: 4em;
	width: auto;
	position: absolute;
	white-space: nowrap;
	text-overflow: ellipsis;
	display: inline-block;
	padding: 0.75em 0 0 0.5em;
}

text title {
	padding-right: 1em;
	position: relative;
    display: block;
}

flag {
	position: absolute;
	right: 0.5em;
	width: 3em;
	top: 1.75em;
	opacity: 0.6;
	text-align: center;
}

flag>* {
	display: block;
	width: 100%;
}

flag svg {
	height: 1em;
}

imagelist {
	height: 6em;
	width: 6em;
	left: 0;
	top: 0;
	position: absolute;
	text-align: center;
	overflow: hidden;
	margin: 0.5em 0.5em 0.5em 0;
	border-radius: 0 3em 3em 0;
	box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.3);
}

imagelist>img {
	height: 100%;
}

imagelist svg {
	height: 100%;
	max-width: 100%;
}

imagelist svg.default {
	padding: 1em;
}

imagelist svg.present {
	position: absolute;
	left: 0;
	height: 2.5em;
	border-radius: 0;
}

imagelist svg.favorite {
	position: absolute;
	left: 0.25em;
	bottom: 0.25em;
	width: 1.5em;
	display: none;
	height: initial;
}

:host(.favorite) imagelist svg {
	display: inline;
}

:host(.authenticated) badge,
:host(.participate) badge {
	background: green;
}

:host(.authenticated) badge::after,
:host(.participate) badge::after {
	content: '✓';
}

:host(.canceled) badge {
	background: red;
}

:host(.canceled) badge::after {
	content: '✗';
}

compass {
	width: 100%;
	display: block;
	margin-top: -0.25em;
	position: absolute;
	line-height: 1.5;
	opacity: 0.6;
	height: 1.5em;
	text-align: center;
	font-size: 1.5em;
}

compass::after {
	content: '↑';
}`;
		this._root.appendChild(style);
		var element = document.createElement('badge');
		if (this.getAttribute('badge'))
			element.setAttribute('class', this.getAttribute('badge'));
		else if (this.getAttribute('class')
			&& this.getAttribute('class').indexOf('authenticated') < 0
			&& this.getAttribute('class').indexOf('canceled') < 0
			&& this.getAttribute('class').indexOf('participate') < 0)
			element.setAttribute('class', 'hidden');
		this._root.appendChild(element);
		element = document.createElement('div');
		element.innerHTML = global.template`
<text>
	<title>${decodeURIComponent(this.getAttribute('title'))}</title>
	${decodeURIComponent(this.getAttribute('text'))}
</text>
<flag>
	<km>${this.getAttribute('flag1')}</km>
	<span>${this.getAttribute('flag2') ? this.getAttribute('flag2') : '&nbsp;'}</span>
	${this.getAttribute('flag3') ? decodeURIComponent(this.getAttribute('flag3')) : ''}
</flag>
<imagelist>
	<img ${(this.getAttribute('image').indexOf('/') > 0 ? 'src="' + global.serverImg : 'source="') + this.getAttribute('image')}" class="${!this.getAttribute('image') || this.getAttribute('image').indexOf('/') < 0 ? 'mainBG default' : ''}" />
	<img source="favorite" class="favorite" />
</imagelist>`;
		this._root.appendChild(element);
		this.removeAttribute('title');
		this.removeAttribute('text');
		this.removeAttribute('flag1');
		this.removeAttribute('flag2');
		this.removeAttribute('flag3');
		this.removeAttribute('image');
		this.removeAttribute('badge');
	}
}