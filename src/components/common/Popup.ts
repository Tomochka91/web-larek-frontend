import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/events';

export interface IPopupView extends Component<IModalData>, IModalData {
	open(): void;
	close(): void;
}

interface IModalData {
	content: HTMLElement;
}

export class Popup extends Component<IModalData> implements IPopupView {
	protected _closeButton: HTMLButtonElement;
	protected _content: HTMLElement;
	protected _event: IEvents;

	constructor(protected container: HTMLElement, event: IEvents) {
		super(container);
		this._event = event;

		this._closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',
			container
		);
		this._content = ensureElement<HTMLElement>('.modal__content', container);

		this._closeButton.addEventListener('click', this.close.bind(this));
		this.container.addEventListener('click', this.close.bind(this));
		this._content.addEventListener('click', (event) => event.stopPropagation());
		document.addEventListener('keydown', this._keyHandler.bind(this));
	}

	set content(value: HTMLElement) {
		this._content.replaceChildren(value);
	}

	get content(): HTMLElement {
		return this._content;
	}

	open() {
		this.container.classList.add('modal_active');
		this._emitOpened();
	}

	close() {
		this.container.classList.remove('modal_active');
		this.content = null;
		this._emitClosed();
	}

	protected _keyHandler(evt: any) {
		if (evt.key === 'Escape') {
			this.close();
		}
	}

	protected _emitOpened(): void {
		this._event.emit('popup:opened');
	}

	protected _emitClosed(): void {
		this._event.emit('popup:closed');
	}
}
