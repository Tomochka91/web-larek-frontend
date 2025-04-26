import { PaymentType } from '../types';
import { Component } from './base/Component';
import { Form } from './common/Form';
import { ensureElement } from '../utils/utils';
import { IEvents } from './base/events';

export interface IOrderFormView
	extends Component<IOrderFormData>,
		IOrderFormData {}

// Интерфейс данных для рендера формы оплаты
interface IOrderFormData {
	payment: PaymentType;
	address: string;
	valid: boolean;
	errors: string;
}

export class OrderForm extends Form<IOrderFormView> {
	protected _cardButton: HTMLButtonElement;
	protected _cashButton: HTMLButtonElement;

	constructor(container: HTMLFormElement, event: IEvents) {
		super(container, event);

		this._cardButton = ensureElement<HTMLButtonElement>(
			'button[name="card"]',
			this.container
		);
		this._cashButton = ensureElement<HTMLButtonElement>(
			'button[name="cash"]',
			this.container
		);

		this._cardButton.addEventListener('click', () => {
			this.payment = 'online';
			super.onInputChange('payment', 'online');
		});

		this._cashButton.addEventListener('click', () => {
			this.payment = 'cash';
			super.onInputChange('payment', 'cash');
		});
	}

	set payment(value: PaymentType) {
		switch (value) {
			case 'online': {
				this._cardButton.classList.add('button_alt-active');
				this._cashButton.classList.remove('button_alt-active');
				break;
			}
			case 'cash': {
				this._cashButton.classList.add('button_alt-active');
				this._cardButton.classList.remove('button_alt-active');
				break;
			}
		}
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}
}
