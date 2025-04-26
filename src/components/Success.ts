import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';
import { IEvents } from './base/events';

// Интерфейс представления корзины
export interface ISuccessView extends Component<ISuccessData>, ISuccessData {}

// Интерфейс данных для рендера корзины
interface ISuccessData {
	totalPrice: number;
}

// Конструктор представления корзины
export interface ISuccessConstructor {
	new (
		container: HTMLElement,
		event: IEvents,
		onClose: () => void
	): ISuccessView;
}

export class SuccessView
	extends Component<ISuccessData>
	implements ISuccessView
{
	protected _totalPrice: HTMLElement;
	protected _successButton: HTMLButtonElement;
	protected _event: IEvents;
	protected _onClose: () => void;

	constructor(container: HTMLElement, event: IEvents, onClose: () => void) {
		super(container);
		this._event = event;
		// Обработчик закрытия попапа
		this._onClose = onClose;

		this._totalPrice = ensureElement<HTMLElement>(
			'.order-success__description',
			this.container
		);
		this._successButton = ensureElement<HTMLButtonElement>(
			'.order-success__close',
			this.container
		);

		this._successButton.addEventListener('click', () => {
			this._onClose();
		});
	}

	set totalPrice(price: number) {
		this.setText(this._totalPrice, `Cписано ${price} синапсов`);
	}
}
