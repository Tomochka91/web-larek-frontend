import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';
import { IEvents } from './base/events';

export interface IPageView extends Component<IPageData>, IPageData {}

// Интерфейс данных для рендера главной страницы
interface IPageData {
	// Каталог товаров
	gallery: HTMLElement[];
	// Счётчик корзины
	counter: number;
	// Блокировка страницы при открытии модального окна
	locked: boolean;
}

export class PageView extends Component<IPageData> implements IPageView {
	protected _counterElement: HTMLElement;
	protected _gallery: HTMLElement;
	protected _basketButton: HTMLButtonElement;
	protected _wrapperElement: HTMLElement;
	protected _event: IEvents;

	constructor(container: HTMLElement, event: IEvents) {
		super(container);
		this._event = event;

		this._counterElement = ensureElement<HTMLElement>(
			'.header__basket-counter'
		);
		this._gallery = ensureElement<HTMLElement>('.gallery');
		this._basketButton = ensureElement<HTMLButtonElement>('.header__basket');
		this._wrapperElement = ensureElement<HTMLElement>('.page__wrapper');

		// Добавляем эмит нажатия на корзину
		this._basketButton.addEventListener('click', () => {
			// Отключаем фокус с кнопки
			this._basketButton.blur();
			this._emitBasketOpen();
		});
	}

	set gallery(items: HTMLElement[]) {
		if (items.length) {
			this._gallery.replaceChildren(...items);
		}
	}

	set counter(value: number) {
		this.setText(this._counterElement, String(value));
	}

	set locked(value: boolean) {
		if (value) {
			this._wrapperElement.classList.add('page__wrapper_locked');
		} else {
			this._wrapperElement.classList.remove('page__wrapper_locked');
		}
	}

	protected _emitBasketOpen(): void {
		this._event.emit('basket:selected');
	}
}
