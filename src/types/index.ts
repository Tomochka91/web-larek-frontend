import { IEvents } from '../components/base/events';

// -----MODEL-----MODEL-----MODEL-----MODEL-----MODEL-----MODEL-----MODEL-----MODEL-----MODEL-----MODEL
// Единица товара
export interface IProductItem {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

// Профиль покупателя
export interface ICustomerProfile {
	id?: string;
	fullName?: string;
	payment: PaymentType;
	address: string;
	email: string;
	phone: string;
	// setId(): string;
	// getId(): string;
	// setFullName(fullName: string): void;
	// getFullName(): string;
	// setPreferedPayment(preferedPayment: PaymentType): void;
	// getPreferedPayment(): PaymentType;
	// setAddress(address: string): void;
	// getAddress(): string;
	// setEmail(email: string): void;
	// getEmail(): string;
	// setPhone(phone: string): void;
	// getPhone(): string;
}

// Возможные ошибки ввода персональных данных
export type ProfileErrors = Partial<Record<keyof ICustomerProfile, string>>;

// Тип оплаты
export type PaymentType = null | 'online' | 'cash';

// Этап оплаты
export type CheckoutStage = 'order' | 'contacts';

// Результат валидации
export type ValidationResult = {
	valid: boolean;
	errors: string;
};

// Заказ на сервер
export type IOrderRequest = ICustomerProfile & {
	total: number;
	items: string[];
};

// Ответ сервера на заказ
export type IOrderResponse = {
	id: string;
	total: number;
};

// Каталог товаров, загруженный с сервера с использованием API
export interface IProductList {
	productList: IProductItem[];
	totalProducts: number;
	addProduct(productItem: IProductItem): IProductItem;
	getProduct(id: string): IProductItem | undefined;
	apiGetProductList(): void;
}

// Корзина товаров
export interface IBasketList extends IProductList {
	totalPrice: number;
	removeProduct(id: string): void;
	toggleProduct(productItem: IProductItem): void;
	clearBasket(): void;
}

// Заказ
export interface IOrder {
	id: string;
	totalPrice: number;
	orderList: IProductItem[];
	setStage(stage: CheckoutStage): void;
	setProfileField<T extends keyof ICustomerProfile>(
		field: T,
		value: ICustomerProfile[T]
	): void;
	getProfileField<T extends keyof ICustomerProfile>(
		field: T
	): ICustomerProfile[T];
	getValidationResult(): ValidationResult;
	getOrderResponse(): IOrderResponse;
	validate(): void;
	apiPostOrder(): void;
}

//----API----API----API----API----API----API----API----API----API----API----API----API----API----API----API----API----API
export interface IApi {
	// getProductList: () => Promise<IProductList>;
	getProductList: () => Promise<IProductItem[]>;
	getProductItem: (id: string) => Promise<IProductItem>;
	postOrder: (order: IOrderRequest) => Promise<IOrderResponse>;
}

//---VIEW---VIEW---VIEW---VIEW---VIEW---VIEW---VIEW---VIEW---VIEW---VIEW---VIEW---VIEW---VIEW---VIEW---VIEW---VIEW---VIEW
export interface IViewConstructor<T> {
	new (container: HTMLElement, event: IEvents): T;
}
