import { IProductItem, IViewConstructor } from '../types';
import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';
import { IEvents } from './base/events';
import { cardCategories } from '../utils/constants';

// Интерфейс представления карточки (и общего абстрактного класса)
export interface ICardView {
	set category(category: string);
	set title(title: string);
	set image(src: string);
	set price(price: number | null);
	set description(description: string);
	set id(id: string);
}

// Типизация конструкторов карточек
export interface ICardConstructors {
	catalog: IViewConstructor<CardCatalogView>;
	preview: IViewConstructor<CardPreviewView>;
	basket: IViewConstructor<CardBasketView>;
}

// Общий абстрактный класс для всех карточек
abstract class CardBaseView
	extends Component<IProductItem>
	implements ICardView
{
	protected _cardCategory?: HTMLElement;
	protected _cardTitle?: HTMLElement;
	protected _cardImage?: HTMLImageElement;
	protected _cardPrice?: HTMLElement;
	protected _cardDescription?: HTMLElement;
	protected _cardId: string;
	protected _event: IEvents;

	constructor(container: HTMLElement, event: IEvents) {
		super(container);
		this._event = event;

		this._cardTitle = ensureElement('.card__title', this.container);
		this._cardPrice = ensureElement('.card__price', this.container);
	}

	set category(category: string) {
		this.setText(this._cardCategory, category);
		this.toggleClass(this._cardCategory, cardCategories[category], true);
	}

	set title(title: string) {
		this.setText(this._cardTitle, title);
	}

	set image(src: string) {
		this.setImage(this._cardImage, src, this.title);
	}

	set price(price: number | null) {
		this.setText(
			this._cardPrice,
			price !== null ? `${price} синапсов` : 'Бесценно'
		);
	}

	set description(description: string) {
		this.setText(this._cardDescription, description);
	}

	set id(id: string) {
		this._cardId = id;
	}
}

// Представление карточки для главной страницы (галереи)
export class CardCatalogView extends CardBaseView {
	constructor(container: HTMLElement, event: IEvents) {
		super(container, event);

		this._cardCategory = ensureElement('.card__category', this.container);
		this._cardImage = ensureElement<HTMLImageElement>(
			'.card__image',
			this.container
		);

		// Добавляем эмит нажатия на карточку
		this.container.addEventListener('click', () => {
			// СБрасываем фокус с кнопки
			this.container.blur();
			this._emitSelected();
		});
	}

	protected _emitSelected(): void {
		this._event.emit('cardCatalog:selected', { id: this._cardId });
	}
}

// Представление карточки для модального окна с превью
export class CardPreviewView extends CardBaseView {
	protected _toggleButton: HTMLButtonElement;
	protected _toggleButtonTexts: [string, string];
	protected _toggleButtonStatus: boolean;

	constructor(container: HTMLElement, event: IEvents) {
		super(container, event);
		this._toggleButtonTexts = ['В корзину', 'Удалить'];

		this._cardCategory = ensureElement('.card__category', this.container);
		this._cardImage = ensureElement<HTMLImageElement>(
			'.card__image',
			this.container
		);
		this._cardDescription = ensureElement('.card__text', this.container);
		this._toggleButton = ensureElement<HTMLButtonElement>(
			'.card__button',
			this.container
		);

		this._toggleButton.addEventListener('click', () => {
			this._toggleButtonState();
			this._emitToggle();
		});
	}

	set price(price: number | null) {
		super.price = price;
		// Дополним метод родителя: выключим кнопку для "бесценного" товара
		this.setDisabled(this._toggleButton, price === null);
	}

	// Сеттер текстов в кнопке
	setButtonTexts(value: [string, string]) {
		this._toggleButtonTexts = value;
		return this;
	}

	// Устанавливаем определенный текст в кнопке (из разрешенных)
	setButtonState(value: boolean) {
		this._toggleButtonStatus = value;
		this.setText(
			this._toggleButton,
			value ? this._toggleButtonTexts[1] : this._toggleButtonTexts[0]
		);
		return this;
	}

	// Переключаем текст в кнопке
	protected _toggleButtonState() {
		this.setButtonState(!this._toggleButtonStatus);
	}

	protected _emitToggle(): void {
		this._event.emit('cardPreview:toggle', { id: this._cardId });
	}
}

// Представление карточки для модального окна с корзиной
export class CardBasketView extends CardBaseView {
	protected _cardIndex: HTMLElement;
	protected _cardBasketDelete: HTMLButtonElement;

	constructor(container: HTMLElement, event: IEvents) {
		super(container, event);

		this._cardIndex = ensureElement('.basket__item-index', this.container);
		this._cardBasketDelete = ensureElement<HTMLButtonElement>(
			'.basket__item-delete',
			this.container
		);

		this._cardBasketDelete.addEventListener('click', () => {
			this._emitDelete();
		});
	}

	setIndex(index: number) {
		this.setText(this._cardIndex, index);
		return this;
	}

	protected _emitDelete(): void {
		this._event.emit('cardBasket:delete', { id: this._cardId });
	}
}
