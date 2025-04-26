import { IEvents } from './base/events';
import {
	ICustomerProfile,
	IProductItem,
	IViewConstructor,
	ValidationResult,
} from '../types';
import { IModel } from './Model';
import { IPageView } from './Page';
import { IPopupView } from './common/Popup';
import { IBasketView } from './Basket';
import { IOrderFormView } from './OrderForm';
import { IContactsFormView } from './ContactsForm';
import { ICardConstructors } from './Cards';
import { cloneTemplate } from '../utils/utils';
import { ISuccessConstructor } from './Success';

export class Presenter {
	protected _basketView: IBasketView;
	protected _orderFormView: IOrderFormView;
	protected _contactsFormView: IContactsFormView;
	protected _cardPreviewToggleButtonTexts: [string, string];

	constructor(
		protected _event: IEvents,
		protected _model: IModel,
		protected _pageView: IPageView,
		protected _popupView: IPopupView,
		protected _constructor: {
			basket: IViewConstructor<IBasketView>;
			order: IViewConstructor<IOrderFormView>;
			contacts: IViewConstructor<IContactsFormView>;
			success: ISuccessConstructor;
			card: ICardConstructors;
		},
		protected _template: Record<string, HTMLTemplateElement>
	) {}

	init() {
		// Запрашиваем каталог с сервера
		// С API взаимодействуем, вызывая метод модели
		this._model.catalog.apiGetProductList();

		// Создаем представление корзины
		this._basketView = new this._constructor.basket(
			cloneTemplate(this._template.basketTemplate),
			this._event
		);
		// Создаем представление формы оплаты
		this._orderFormView = new this._constructor.order(
			cloneTemplate(this._template.orderTemplate),
			this._event
		);
		// Создаем представление формы контактных данных
		this._contactsFormView = new this._constructor.contacts(
			cloneTemplate(this._template.contactsTemplate),
			this._event
		);

		// Попадаем сюда при получении каталога с сервера
		this._event.on('productList:changed', this.handleRenderPage.bind(this));
		// Попадаем сюда при изменении содержимого корзины
		this._event.on('basketList:changed', this.handleUpdateBasket.bind(this));
		// Попадаем сюда при открытии корзины с главной страницы
		this._event.on('basket:selected', this.handleOpenBasket.bind(this));
		// Попадаем сюда при добавлении / удалении товара в корзине из превью
		this._event.on('cardPreview:toggle', this.handleToggleProduct.bind(this));
		// Попадаем сюда при удалении карточки из корзины
		this._event.on('cardBasket:delete', this.handleRemoveProduct.bind(this));
		// Попадаем сюда в начале оформления заказа (выбор способа оплаты)
		this._event.on('basket:checkout', this.handleDrawOrderForm.bind(this));
		// Попадаем сюда при переходе на форму ввода контактов
		this._event.on('order:submit', this.handleDrawContactsForm.bind(this));
		// Попадаем сюда при нажатии кнопки "оплатить" в форме ввода контактных данных
		this._event.on('contacts:submit', this.handlePostOrder.bind(this));
		// Попадаем сюда, успешно отправив заказ и получив ответ от сервера
		this._event.on('order:success', this.handleOrderSuccess.bind(this));
		// Попадаем сюда при работе с полями обоих форм
		this._event.on(
			/^(order|contacts)\..*:changed/,
			(data: { field: keyof ICustomerProfile; value: string }) => {
				this._model.order.setProfileField(data.field, data.value);
			}
		);
		// Попадаем сюда по результатам работы валидаторов формы выбора способа оплаты
		this._event.on('orderForm:validated', (result: ValidationResult) => {
			this.handleFormValidation(this._orderFormView, result);
		});
		// Попадаем сюда по результатам работы валидаторов формы ввода контактных данных
		this._event.on('contactsForm:validated', (result: ValidationResult) => {
			this.handleFormValidation(this._contactsFormView, result);
		});
		// Блокируем прокрутку страницы если открыта модалка
		this._event.on('popup:opened', () => {
			this._pageView.locked = true;
		});
		// ... и разблокируем
		this._event.on('popup:closed', () => {
			this._pageView.locked = false;
		});
		// Тексты кнопки добавления / удаления товара на превью
		this._cardPreviewToggleButtonTexts = ['В корзину', 'Удалить'];
	}

	// Удаление товара из представления и модели корзины
	handleRemoveProduct(item: { id: string }) {
		// Удалим товар из модели корзины
		this._model.basket.removeProduct(item.id);
		// Перерисуем представление корзины
		this._popupView.content = this._renderBasket();
	}

	// Добавление / удаление товара в модели корзины из превью карточки
	handleToggleProduct(item: { id: string }) {
		// Передаем товар из каталога
		this._model.basket.toggleProduct(this._model.catalog.getProduct(item.id));
	}

	// Обновление счетчика на главной странице
	handleUpdateBasket() {
		this._pageView.counter = this._model.basket.totalProducts;
	}

	// Связь валидатора в модели с представлениями форм
	handleFormValidation(
		form: IOrderFormView | IContactsFormView,
		result: ValidationResult
	) {
		const { valid, errors } = result;
		form.valid = valid;
		form.errors = errors;
	}

	// Отправка сформированного заказа на сервер по сабмиту
	handlePostOrder() {
		// Заполняем оставшиеся поля
		this._model.order.totalPrice = this._model.basket.totalPrice;
		this._model.order.orderList = this._model.basket.productList;
		// И отправляем оформленный заказ на сервер
		// С API взаимодействуем через модель, а не через презентер
		this._model.order.apiPostOrder();
	}

	// Визуализация "успеха" в оформлении заказа
	handleOrderSuccess() {
		// Не забываем очистить корзину
		this._model.basket.clearBasket();
		// Создаем экземпляр Success
		// Не забываем передать обработчик закрытия модального окна
		const successView = new this._constructor.success(
			cloneTemplate(this._template.successTemplate),
			this._event,
			() => this._popupView.close()
		);
		// Заполняем Success и передаем в модальное окно
		this._popupView.content = successView.render({
			totalPrice: this._model.order.getOrderResponse().total,
		});
	}

	handleRenderPage() {
		// Заполняем главную страницу, галерею
		// и обновляем счетчик товаров в корзине
		this._pageView.render({
			gallery: this._renderGallery(),
			counter: this._model.basket.totalProducts,
		});
	}

	// handleRenderPopup(element: HTMLElement) {
	// 	this._popupView.render({
	// 		content: element,
	// 	});
	// }

	// Заполняем превью и передаем в модальное окно
	handleOpenPreview(item: { id: string }) {
		this._popupView.content = this._renderCardPreview(item);
		this._popupView.open();
	}

	// Заполняем корзину и передаем в модальное окно
	handleOpenBasket() {
		this._popupView.content = this._renderBasket();
		this._popupView.open();
	}

	// Переходим на этап ввода способа оплаты
	handleDrawOrderForm() {
		this._model.order.setStage('order');
		this._model.order.validate();
		// Передаем в модальное окно форму выбора способа оплаты
		// без переоткрытия модального окна
		this._popupView.content = this._renderOrderForm();
		// this.handleRenderPopup(this._renderOrderForm());
	}

	// Переходим на этап ввода контактных данных
	handleDrawContactsForm() {
		this._model.order.setStage('contacts');
		this._model.order.validate();
		// Передаем в модальное окно форму ввода контактных данных
		// без переоткрытия модального окна
		this._popupView.content = this._renderContactsForm();
		// this.handleRenderPopup(this._renderContactsForm());
	}

	private _renderGallery(): HTMLElement[] {
		// Получив карточки от сервера, рендерим их
		const cards = this._model.catalog.productList.map((product) => {
			const card = new this._constructor.card.catalog(
				cloneTemplate(this._template.cardCatalogTemplate),
				this._event
			).render({
				category: product.category,
				title: product.title,
				image: product.image,
				price: product.price,
				id: product.id,
			});
			return card;
		});

		// Добавляем единый слушатель нажатий для всех карточек галереи
		this._event.on('cardCatalog:selected', this.handleOpenPreview.bind(this));

		return cards;
	}

	private _renderCardPreview(item: { id: string }): HTMLElement {
		// Ищем карточку в каталоге по Id
		const selectedProduct = this._model.catalog.getProduct(item.id);
		// Проверяем, есть ли она в корзине (чтобы сразу задать текст кнопки)
		const isInBasket = this._model.basket.getProduct(item.id) ? true : false;
		// Создаем для неё представление
		const previewCard = new this._constructor.card.preview(
			cloneTemplate(this._template.cardPreviewTemplate),
			this._event
		)
			.setButtonTexts(this._cardPreviewToggleButtonTexts)
			.setButtonState(isInBasket)
			.render({
				category: selectedProduct.category,
				title: selectedProduct.title,
				image: selectedProduct.image,
				price: selectedProduct.price,
				description: selectedProduct.description,
				id: selectedProduct.id,
			});
		return previewCard;
	}

	private _renderBasket(): HTMLElement {
		// Создаем список карточек корзины, не забывая пронумеровать
		const basketCards = this._model.basket.productList.map((product, i) => {
			// Используем конструктор для создания нескольких экземпляров
			const basketCard = new this._constructor.card.basket(
				cloneTemplate(this._template.cardBasketTemplate),
				this._event
			)
				// Устанавливаем номер
				.setIndex(i + 1)
				// Создаем элемент разметки
				.render({
					title: product.title,
					price: product.price,
					id: product.id,
				});
			return basketCard;
		});

		// Заполняем представление корзины
		// Экземпляр до этого создали в init() презентера
		// Чтобы "единообразно" работать с шаблонами только в нем
		return this._basketView.render({
			basketList: basketCards,
			totalPrice: this._model.basket.totalPrice,
		});
	}

	private _renderOrderForm(): HTMLElement {
		const { valid, errors } = this._model.order.getValidationResult();
		return this._orderFormView.render({
			payment: this._model.order.getProfileField('payment'),
			address: this._model.order.getProfileField('address'),
			valid: valid,
			errors: errors,
		});
	}

	private _renderContactsForm(): HTMLElement {
		const { valid, errors } = this._model.order.getValidationResult();
		return this._contactsFormView.render({
			email: this._model.order.getProfileField('email'),
			phone: this._model.order.getProfileField('phone'),
			valid: valid,
			errors: errors,
		});
	}
}
