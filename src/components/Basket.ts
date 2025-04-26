import { Component } from './base/Component';
import { createElement, ensureElement } from '../utils/utils';
import { IEvents } from './base/events';

// Интерфейс представления корзины
export interface IBasketView extends Component<IBasketData>, IBasketData {}

// Интерфейс данных для рендера корзины
interface IBasketData {
	basketList: HTMLElement[];
	totalPrice: number;
}

export class BasketView extends Component<IBasketData> implements IBasketView {
	protected _basketList: HTMLElement;
	protected _checkoutButton: HTMLButtonElement;
	protected _totalPrice: HTMLElement;
	protected _event: IEvents;

	constructor(container: HTMLElement, event: IEvents) {
		super(container);
		this._event = event;

		this._basketList = ensureElement<HTMLElement>(
			'.basket__list',
			this.container
		);
		this._checkoutButton = ensureElement<HTMLButtonElement>(
			'.basket__button',
			this.container
		);
		this._totalPrice = ensureElement<HTMLElement>(
			'.basket__price',
			this.container
		);

		this._checkoutButton.addEventListener('click', () => {
			this._emitCheckout();
		});
	}

	set basketList(items: HTMLElement[]) {
		if (items.length) {
			this._basketList.replaceChildren(...items);
			this.setDisabled(this._checkoutButton, false);
		} else {
			this._basketList.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Ваша корзина пуста',
				})
			);
			this.setDisabled(this._checkoutButton, true);
		}
	}

	set totalPrice(price: number) {
		this.setText(this._totalPrice, `${price} синапсов`);
	}

	protected _emitCheckout(): void {
		this._event.emit('basket:checkout');
	}
}
