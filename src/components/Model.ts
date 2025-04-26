import {
	ProfileErrors,
	IApi,
	IBasketList,
	ICustomerProfile,
	IOrder,
	IProductItem,
	IProductList,
	PaymentType,
	CheckoutStage,
	ValidationResult,
	IOrderResponse,
	IOrderRequest,
} from '../types';
import { IEvents } from './base/events';

// // Гарда для проверки на модель
// export const isModel = (obj: unknown): obj is Model<any> => {
// 	return obj instanceof Model;
// };

// /**
//  * Базовая модель, чтобы можно было отличить ее от простых объектов с данными
//  */
// export abstract class Model<T> {
// 	constructor(data: Partial<T>, protected events: IEvents) {
// 		Object.assign(this, data);
// 	}

// 	// Сообщить всем что модель поменялась
// 	emitChanges(event: string, payload?: object) {
// 		// Состав данных можно модифицировать
// 		this.events.emit(event, payload ?? {});
// 	}

// 	// далее можно добавить общие методы для моделей
// }

// Интерфейс модели (уменьшим кол-во аргументов при передаче в презентер)
export interface IModel {
	catalog: IProductList;
	basket: IBasketList;
	order: IOrder;
}

export class ProductList implements IProductList {
	protected _productList: IProductItem[];
	protected _totalProducts: number;
	protected _event: IEvents;
	protected _api?: IApi;

	constructor(event: IEvents, api?: IApi) {
		this._productList = [];
		this._totalProducts = 0;
		this._event = event;
		this._api = api;
	}

	set productList(data: IProductItem[]) {
		this._productList = data;
		this._update();
		this._emitChanged();
	}

	get productList() {
		return this._productList;
	}

	set totalProducts(count: number) {
		this._totalProducts = count;
	}

	get totalProducts() {
		return this._totalProducts;
	}

	addProduct(productItem: IProductItem) {
		this._productList.push(productItem);
		this._update();
		this._emitChanged();
		return productItem;
	}

	getProduct(id: string) {
		return this._productList.find((productItem) => productItem.id === id);
	}

	apiGetProductList() {
		if (this._api) {
			this._api.getProductList().then((data: IProductItem[]) => {
				this.productList = data;
			});
		} else {
			// 8))))
			console.log('Забыли API!!!');
		}
	}

	protected _update(): void {
		this._totalProducts = this._productList.length || 0;
	}

	protected _emitChanged(): void {
		this._event.emit('productList:changed');
	}
}

export class BasketList extends ProductList implements IBasketList {
	protected _totalPrice: number | null;

	constructor(event: IEvents) {
		super(event);

		this._totalPrice = 0;
	}

	set totalPrice(price: number) {
		this._totalPrice = price;
	}

	get totalPrice() {
		return this._totalPrice;
	}

	protected _calcTotalPrice(): number | null {
		return this._productList.reduce((total, product) => {
			return (total += product.price ?? 0);
		}, 0);
	}

	protected _update(): void {
		super._update();
		this._totalPrice = this._calcTotalPrice();
	}

	removeProduct(id: string) {
		this._productList = this._productList.filter(
			(productItem) => productItem.id !== id
		);
		this._update();
		this._emitChanged();
	}

	toggleProduct(productItem: IProductItem) {
		// Ищем, есть ли товар в модели корзины
		const toggledProduct = this.getProduct(productItem.id);
		if (toggledProduct) {
			// Удаляем, если нашли
			this.removeProduct(productItem.id);
		} else {
			// Добавляем, если не нашли
			this.addProduct(productItem);
		}
	}

	clearBasket() {
		this._productList = [];
		this._update();
		this._emitChanged();
	}

	protected _emitChanged(): void {
		this._event.emit('basketList:changed');
	}
}

export class Order implements IOrder {
	protected _id: string;
	protected _totalPrice: number;
	protected _orderList: IProductItem[];
	protected _customer: ICustomerProfile;
	protected _checkoutStage: CheckoutStage;
	protected _validationResult: ValidationResult;
	protected _event: IEvents;
	protected _api: IApi;
	protected _orderRequest: IOrderRequest;
	protected _orderResponse: IOrderResponse;

	constructor(event: IEvents, api: IApi) {
		this._customer = {
			id: '',
			fullName: '',
			payment: null,
			address: '',
			email: '',
			phone: '',
		};

		this._checkoutStage = 'order';
		this._validationResult = { valid: false, errors: '' };
		this._event = event;
		this._api = api;
	}

	set id(id: string) {
		this._id = id;
	}

	set totalPrice(price: number) {
		this._totalPrice = price;
	}

	set orderList(productList: IProductItem[]) {
		this._orderList = productList;
	}

	setStage(stage: CheckoutStage): void {
		this._checkoutStage = stage;
	}

	setProfileField<T extends keyof ICustomerProfile>(
		field: T,
		value: ICustomerProfile[T]
	) {
		this._customer[field] = value;
		this.validate();
	}

	getProfileField<T extends keyof ICustomerProfile>(
		field: T
	): ICustomerProfile[T] {
		return this._customer[field];
	}

	getValidationResult(): ValidationResult {
		return this._validationResult;
	}

	getOrderResponse(): IOrderResponse {
		return this._orderResponse;
	}

	// Универсальный валидатор
	validate(): void {
		let isValid = false;
		let errors: ProfileErrors = {};

		switch (this._checkoutStage) {
			case 'order': {
				const paymentError = this._validatePayment(this._customer.payment);
				const addressError = this._validateAddress(this._customer.address);
				paymentError && (errors.payment = paymentError);
				addressError && (errors.address = addressError);
				isValid = !paymentError && !addressError;
				break;
			}
			case 'contacts': {
				const emailError = this._validateEmail(this._customer.email);
				const phoneError = this._validatePhone(this._customer.phone);
				emailError && (errors.email = emailError);
				phoneError && (errors.phone = phoneError);
				isValid = !emailError && !phoneError;
				break;
			}
		}

		this._validationResult = {
			valid: isValid,
			errors: Object.values(errors)
				.filter((i) => !!i)
				.join('; '),
		};
		// Эмитируем этап оформления заказа и тексты ошибок
		this._emitValidationResult();
	}

	apiPostOrder() {
		// Формируем Payload запроса
		this._orderRequest = {
			payment: this._customer.payment,
			address: this._customer.address,
			email: this._customer.email,
			phone: this._customer.phone,
			total: this._totalPrice,
			items: this._orderList.map((product) => product.id),
		};

		this._api
			.postOrder(this._orderRequest)
			.then((response) => {
				this._orderResponse = response;
				this._emitOrderSuccess();
			})
			.catch((err) => {
				console.error(err);
			});
	}

	// Валидатор способа оплаты
	protected _validatePayment(value: PaymentType): string | undefined {
		if (value === null) {
			return 'Выберите способ оплаты';
		}
	}

	// Валидатор адреса
	protected _validateAddress(address: string): string | undefined {
		if (!address) {
			return 'Необходимо указать адрес';
		}
	}

	// Валидатор email
	protected _validateEmail(email: string): string | undefined {
		if (!email) {
			return 'Необходимо указать "email"';
		}
	}

	// Валидатор телефонного номера
	protected _validatePhone(phone: string): string | undefined {
		if (!phone) {
			return 'Необходимо указать номер телефона';
		}
	}

	protected _emitValidationResult(): void {
		this._event.emit(
			`${this._checkoutStage}Form:validated`,
			this._validationResult
		);
	}

	protected _emitOrderSuccess(): void {
		this._event.emit('order:success', this._orderResponse);
	}
}
