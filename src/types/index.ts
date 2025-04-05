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
	id: string;
	fullName: string;
	preferedPayment: PaymentType;
	address: string;
	email: string;
	phone: string;
	setFullName(fullName: string): void;
	getFullName(): string;
	setPreferedPayment(preferedPayment: PaymentType): void;
	getPreferedPayment(): string;
	setAddress(address: string): void;
	getAddress(): string;
	setEmail(email: string): void;
	getEmail(): string;
	setPhone(phone: string): void;
	getPhone(): string;
}

// Тип оплаты
export enum PaymentType {
	CARD,
	CASH,
}

// Заказ
export interface IOrder {
	id: string;
	totalPrice: number;
	orderList: IProductItem[];
	customer: ICustomerProfile;
}

// Каталог товаров, загруженный с сервера с использованием API
export interface IProductList {
	productList: IProductItem[];
	totalProducts: number;
	setProductItems(items: IProductItem[]): void;
	getProductItems(): IProductItem[];
}

// Корзина товаров
export interface IBasketList extends IProductList {
	addProductItem(item: IProductItem): IProductItem;
	removeProductItem(id: string): void;
	calcTotalPrice(): number;
	clearBasket(): void;
}

//----API----API----API----API----API----API----API----API----API----API----API----API----API----API----API----API----API
/*
// Вместо ApiListResponse<Type>
// export interface IApiProductListResult extends IProductList {
// 	status: string;
// }

// export interface IApiProductItemResult extends IProductItem {
// 	status: string;
// }

// export interface IApiOrderResult extends IOrder {
// 	status: string;
// }
*/

export interface IApi {
	getProductList: () => Promise<IProductList>;
	getProductItem: (id: string) => Promise<IProductItem>;
	postOrder: (order: IOrder) => Promise<IOrder>;
}

//----VIEW----VIEW----VIEW----VIEW----VIEW----VIEW----VIEW----VIEW----VIEW----VIEW----VIEW----VIEW----VIEW----VIEW----VIEW
// Главная страница
export interface IPageView {
	setBasketCounter(count: number): void;
	// Кнопка корзины со счетчиком
	basketButton: HTMLElement;
	// Каталог товаров
	galleryContainer: HTMLElement[];
}

// Универсальная карточка (для абстрактного класса и трёх его потомков)
export interface ICardView {
	id: string;
	render(item: IProductItem): HTMLElement;
}

// Универсальный конструктор для карточек
export interface ICardConstructor<T extends ICardView> {
	new (template: HTMLTemplateElement): T;
}

/*
// Элемент карточки на главной странице
// export interface ICardCatalogView {
// 	id: string;
// 	render(item: IProductItem): HTMLElement;
// }

// Элемент карточки в попапе превью
// export interface ICardPreviewView {
// 	id: string;
// 	buttonText: string;
// 	render(item: IProductItem): HTMLElement;
// }

// Элемент карточки в корзине
// export interface ICardBasketView {
// 	id: string;
// 	render(item: IProductItem): HTMLElement;
// }
*/

// Универсальный попап
export interface IPopupView {
	content: HTMLElement;
	open(): void;
	close(): void;
}

// Контейнер корзины (загружается в универсальный попап)
export interface IBasketView {
	setBasketItems(items: IBasketList[]): void;
	setTotalPrice(totalPrice: number): void;
	clearBasket(): void;
	render(): HTMLElement;
}

// Форма выбора способа оплаты (загружается в универсальный попап)
export interface IPaymentFormView {
	addressPlaceholder: string;
	setValid(error: string): void;
	resetForm(): void;
	render(): HTMLFormElement;
}

// Форма ввода контактов (загружается в универсальный попап)
export interface IContactsFormView {
	emailPlaceholder: string;
	phonePlaceholder: string;
	setValid(error: string): void;
	resetForm(): void;
	render(): HTMLFormElement;
}

// Контейнер успешного оформления заказа
export interface ISuccessView {
	setTotalPrice(totalPrice: number): void;
	render(): HTMLElement;
}
