<!-- prettier-ignore-start -->

# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:

- src/ — исходные файлы проекта
- src/components/ — папка с TS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:

- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами
- src/components/Model.ts - модель
- src/components/Presenter.ts - презентер

## Установка и запуск

Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```

## Сборка

```
npm run build
```

или

```
yarn build
```

## О проекте

Настоящая документация, принятые в проекте технические и архитектурные решения сформированы на основе знаний и опыта, имеющихся на текущий момент. Автор в меру своих возможностей постарался творчески подойти к заданию, воспользовался наработками учебных проектов, не подсматривал и не "заглядывал в будущее".
Автор потратил значительное кол-во времени на поиск, подбор и перебор технических решений.

## Архитектура проекта

Проект реализован на основе архитектуры MVP с использованием EventEmitter-а.

Основные слои:

- Model (модель данных, использующая API, классы данных и их коллекции)
- View (слой представления/отображения, отвечающий за визуализацию элементов разметки)
- Presenter + EventEmitter (презентер, валидатор и брокер событий)

<br>

---
### Описание слоев

#### Структура слоя модели (основные классы):

- ProductItem: хранит данные одной единицы товара;
- CustomerProfile: хранит данные покупателя;
- Order: модель заказа. Содержит в себе информацию и методы, необходимые для оформления заказа, включая методы валидации и методы, взаимодействующие с API;
- ProductList: основной каталог товаров, который формируется из загруженных с сервера данных;
- BasketList: массив товаров, добавленных покупателем в корзину;
- Api взаимодействия с сервером. Обеспечивает загрузку с сервера каталога товаров, одного определенного товара по известному id, отправку на сервер сформированного заказа. Использует внутренние методы для создания запросов и обработки ошибок при взаимодействии с классами модели.

Приняты следующие решения:

- Создан расширенный класс CustomerProfile. Не все поля класса используются и скорее заложены на будущее;
- Создан отдельный класс Order, отвечающий за формирование заказа;
- Классы-коллекции ProductList и BasketList разделены специально. BasketList предоставляет расширенный функционал для ProductList;

#### Структура слоя представления (основные классы и компоненты):

- PageView: отображение главной страницы сайта. На главной странице расположена галерея товаров и кнопка корзины с интерактивным счетчиком. Нажатие на кнопку корзины открывает соответствующее модальное окно. Нажатие на карточку товара в галерее открывает модальное окно с превью товара;
- CardBaseView: "основа" карточки, абстрактный класс, который определяет общие поля и методы трёх классов-потомков (CardCatalogView, CardPreviewView, CardBasketView). Позволяет реализовать общий интерфейс и обойтись без дублирования кода представлений карточек;
- Popup: универсальное модальное окно. Необходимо заполнить отображаемым HTML элементом. Например, элементом превью карточки товара, корзины, форм и т.д.;
- BasketView: представление корзины. Контейнер, содержищий список HTML элементов, представляющих товары в корзине (включая номер товара по порядку и кнопку удаления из корзины). Кнопка оформления заказа, которая неактивна при отсутствии товаров в корзине. Поле, отображающее общую стоимость;
- OrderForm: форма выбора способа оплаты и адреса доставки. Данные пользователя передаются для валидации в модель Order. Валидатор в ответ передает форме конкатенацию текстов ошибок и переключает состояние сабмиттера;
- ContactsForm: форма ввода контактных данных. Контактные данные пользователя передаются для валидации в модель Order. Валидатор в ответ передает форме конкатенацию текстов ошибок и переключает состояние сабмиттера. При сабмите этой формы генерируется событие окончательного формирования заказа: в модели Order формируется объект OrderRequest, который передается в API для отправки на сервер;
- SuccessView: представление, которое выводится покупателю при успешном получении сервером заказа. Ответ сервера (OrderResponse) обрабатывается в API, а затем в модели Order. Далее презентер выводит сумму заказа в разметку SuccessView.

Приняты следующие решения:

- Для классов-представлений продукта определен общий родительский абстрактный класс и общий интерфейс;
- Для классов, которые участвуют в построении списков и форм по шаблонам, реализованы соответствующие интерфейсы-конструкторы. Это позволяет удобно передавать их внутрь презентера и создавать экземпляры уже по месту;
- Реализовано использование универсального модального окна, предназначенного для наполнения различным содержимым. Для окна реализованы базовые методы открытия и закрытия;
- Основная логика работы с формами реализована на базе брокера событий;
- Все классы-представления наследованы от класса Component. Использование его универсальных методов позволило систематизировать и стандартизировать работу с элементами разметки;
- Используются вспомогательные функции ensureElement(), createElement(), cloneTemplate() и др.

```typescript
// Рендер элементов корзины
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
            // Создаем элемент разметки карточки продукта в корзине
            .render({
                title: product.title,
                price: product.price,
                id: product.id,
            });
        return basketCard;
    });

    // Возвращаем элемент разметки корзины
    return this._basketView.render({
        basketList: basketCards,
        totalPrice: this._model.basket.totalPrice,
    });
}
```


#### Слой презентера

Между вариантом классического строгого презентера (c передачей и хранением обработчиков) и брокера событий был выбран второй вариант.
Использование EventEmitter-а (брокера событий) обеспечивает гибкую и удобную настройку "привычного" событийно-ориентированного взаимодействия между классами разных слоев, позволяет избежать передачи и хранения обработчиков в классах, уменьшает кол-во кода и улучшает читаемость.
Сам же презентер, имея связь как с классами модели, так и с классами представления, содержит в себе обработчики эмитируемых событий, определяет логику взамидействия слоев между собой.
В проекте создан один экземпляр брокера событий, а для классов, которые используют его функционал, встроена соответствующая зависимость.

<br>

---
### Примеры классов и их интерфейсов

#### Модель

```typescript
// Единица товара (интерфейс)
interface IProductItem {
    id: string;             // Id товара
    description: string;    // Описание товара
    image: string;          // Ссылка на изображение товара
    title: string;          // Название товара
    category: string;       // Категория
    price: number | null;   // Цена единицы товара (или "бесценно")
}

// Каталог товаров (интерфейс)
interface IProductList {
    productList: IProductItem[];                           // Каталог товаров
    totalProducts: number;                                 // Кол-во товаров в каталоге
    addProduct(productItem: IProductItem): IProductItem;   // Добавить единицу продукта в каталог
    getProduct(id: string): IProductItem;                  // Получить единицу продукта из каталога по Id
    apiGetProductList(): void;
}

// Корзина товаров (интерфейс)
interface IBasketList extends IProductList {
    totalPrice: number;                                     // Стоимость товаров в корзине
    removeProduct(id: string): void;                        // Удалить товар из корзины по Id
    toggleProduct(productItem: IProductItem): void;         // Добавить/удалить товар
    clearBasket(): void;                                    // Очистить корзину
}
```

##### Краткое описание классов модели и их методов

<details>
<summary>Каталог товаров</summary>
  
```typescript
// "Подключаем" брокер событий и указываем интерфейс
class ProductList implements IProductList {
    protected _productList: IProductItem[];
    protected _totalProducts: number;
    protected _event: IEvents;                  // Ссылка на EventEmitter
    protected _api?: IApi;                      // Ссылка на API (для класса корзины не требуется)
      
    // Конструктор класса
    constructor(event: IEvents, api?: IApi) {
		this._productList = [];
		this._totalProducts = 0;
		this._event = event;
		this._api = api;
	}

    // Метод, который заполняет массив товаров (каталог)
    set productList(data: IProductItem[]) {
        // Основная работа сеттера (заполнить поле данными, полученными от сервера, или ещё откуда-то)
        this._productList = data;
        // Обновляем поле с кол-вом товаров в каталоге
        this._update();
        // Эмитируем событие, что данные изменились
        this._emitChanged()
    }
  
    // Метод, используя который, можно получить массив товаров (каталог)
    get productList() {
        return this._productList;
    }
  
    // Метод, который устанавливает кол-во товаров (можно сделать непубличным)
    set totalProducts(count: number) {
        this._totalProducts = count;
    }
  
    // Метод, используя который, можно узнать кол-во товаров в каталоге
    get totalProducts() {
        return this._totalProducts;
    }

    // Метод для добавления товара в каталог
	addProduct(productItem: IProductItem) {
        // Добавляем новый товар в каталог
		this._productList.push(productItem);
        // Обновляем поле с кол-вом товаров в каталоге
		this._update();
        // Эмитируем событие, что данные изменились
		this._emitChanged();
        // Возвращаем "товар"
		return productItem;
	}

    // Метод для получения товара из каталога по Id
	getProduct(id: string) {
		return this._productList.find((productItem) => productItem.id === id);
	}

    // Метод взаимодействия с API (запрос каталога с сервера)
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

    // Внутренний метод, который считает кол-во товаров в массиве и обновляет соответствующее поле
    protected _update(): void {
        this._totalProducts = this._productList.length || 0;
    }

    // Метод для работы с брокером событий
    protected _emitChanged(): void {
        this.emit("productList:changed");
    }
}
```
</details>

<details>
<summary>Корзина</summary>
  
```typescript
// "Наследуем" поля и методы от класса каталога и указываем интерфейс
class BasketList extends ProductList implements IBasketList {
    // null - бесценный товар
    protected _totalPrice: number | null;

    // Конструктор класса
    constructor(event: IEvents) {
        // Конструктор родителя
        super(event);
        // По-умолчанию выставляем 0, что соответствует отсутствию товаров в корзине.
        this._totalPrice = 0;
    }

    // Метод, который устанавливает стоимость товаров (можно сделать непубличным)
    set totalPrice(price: number) {
        this._totalPrice = price;
    }
  
    // Метод, используя который, можно узнать стоимость товаров в корзине
    get totalPrice() {
        return this._totalPrice;
    }

    // Метод, вычисляющий стоимость товаров в корзине
    protected _calcTotalPrice(): number | null {
		return this._productList.reduce((total, product) => {
			return (total += product.price ?? 0);
		}, 0);
	}
  
    // Внутренний метод, который считает стоимость товаров в корзине и обновляет соответствующее поле
    protected _update(): void {
        // Вызывая метод родителя, обновляем кол-во товаров в корзине
        super._update();
        // Тут считаем стоимость товаров в корзине
        this._totalPrice = this._calcTotalPrice();
    }

    // Метод для удаления одного товара из корзины
    removeProduct(id: string) {
        // Удаляем товар из корзины
        this._productList = this._productList.filter((productItem) => productItem.id !== id);
        // Обновляем поле родителя с кол-вом товаров в корзине и поле потомка со стоимостью
        this._update();
        // Эмитируем событие, что данные изменились
        this._emitChanged()
    }

    // Метод для добавления/удаления товара в корзине
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

    // Очистка корзины
    clearBasket() {
        // Удаляем всё из массива
        this._productList = [];
        // Обновляем поле родителя с кол-вом товаров в корзине и поле потомка со стоимостью
        this._update();
        // Эмитируем событие, что данные изменились
        this._emitChanged()
    }
	
    // Тут переопределим метод родителя
    protected _emitChanged(): void {
        this._event.emit('basketList:changed');
    }
}
```
</details>

<details>
<summary>Заказ (Order)</summary>
  
```typescript
// Вспомогательные типы
// Возможные ошибки ввода персональных данных
type ProfileErrors = Partial<Record<keyof ICustomerProfile, string>>;

// Тип оплаты
type PaymentType = null | 'online' | 'cash';

// Этап оплаты
type CheckoutStage = 'order' | 'contacts';

// Результат валидации
type ValidationResult = {
	valid: boolean;
	errors: string;
};

// Заказ на сервер
type IOrderRequest = ICustomerProfile & {
	total: number;
	items: string[];
};

// Ответ сервера на заказ
type IOrderResponse = {
	id: string;
	total: number;
};

// Заказ
class Order implements IOrder {
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

    // Id Заказа (не используется)
	set id(id: string) {
		this._id = id;
	}

    // Метод, который устанавливает стоимость товаров
	set totalPrice(price: number) {
		this._totalPrice = price;
	}

    // Метод, который заполняет массив товаров в заказе
	set orderList(productList: IProductItem[]) {
		this._orderList = productList;
	}

    // Метод, устанавливает этап оформления заказа (для валидации)
	setStage(stage: CheckoutStage): void {
		this._checkoutStage = stage;
	}

    // Универсальный метод для записи данных покупателя
	setProfileField<T extends keyof ICustomerProfile>(
		field: T,
		value: ICustomerProfile[T]
	) {
		this._customer[field] = value;
		this.validate();
	}

    // Универсальный метод для получения поля данных покупателя
	getProfileField<T extends keyof ICustomerProfile>(
		field: T
	): ICustomerProfile[T] {
		return this._customer[field];
	}

    // Запрос результата валидации
	getValidationResult(): ValidationResult {
		return this._validationResult;
	}

    // Запрос ответа сервера на размещение заказа
	getOrderResponse(): IOrderResponse {
		return this._orderResponse;
	}

	// Универсальный валидатор
	validate(): void {
		let isValid = false;
		let errors: ProfileErrors = {};

        // Для работы с разными формами валидируем разные наборы полей
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

    // Метод, взаимодействующий с API для отправки оформленного заказа
    // и получения ответа от сервера
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
```
</details>
  
#### Представление

```typescript
// Интерфейс представления карточки (для абстрактного класса и трёх его потомков)
interface ICardView {
	set category(category: string);
	set title(title: string);
	set image(src: string);
	set price(price: number | null);
	set description(description: string);
	set id(id: string);
}

// Универсальный конструктор почти всех представлений
interface IViewConstructor<T> {
	new (container: HTMLElement, event: IEvents): T;
}

// Типизация конструкторов карточек
export interface ICardConstructors {
	catalog: IViewConstructor<CardCatalogView>;
	preview: IViewConstructor<CardPreviewView>;
	basket: IViewConstructor<CardBasketView>;
}

// Абстрактный класс карточки, в котором определены общие поля и методы
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
class CardCatalogView extends CardBaseView {
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
```

<br>

---
### Брокер событий. Неокончательный перечень эмитентов, событий и слушателей

#### События, эмитируемые моделью:

| Эмитент     | Название                   | Данные                    | Описание                                                                                                                           |
| ----------- | -------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| ProductList | "productList:changed"      | нет                       | сообщает в презентер об изменении каталога продуктов                                                                               |
| BasketList  | "basketList:changed"       | кол-во товаров, стоимость | сообщает в презентер об изменении состава корзины                                                        |
| Order         | "orderForm:validated" | ValidationResult           | передает результат валидации первой формы                                                                                    |
| Order         | "contactsForm:validated" | ValidationResult                     | передает результат валидации второй формы                                                                                         |
| Order         | "order:success"        | OrderResponse            | в случае успешной обработки сервером заказа, необходимо будет отобразить соответствующий попап, удалить заказ и очистить корзину |

#### События, эмитируемые представлением:

| Эмитент          | Название               | Данные                   | Описание                                                              |
| ---------------- | ---------------------- | ------------------------ | --------------------------------------------------------------------- |
| Popup            | "popup:opened"         | нет                      | сообщает в презентер, что открыто модальное окно                      |
| Popup            | "popup:closed"         | нет                      | сообщает в презентер, что модальное окно закрыто                      |
| PageView         | "basket:selected"      | нет                      | выбор корзины на главной странице для отображения корзины             |
| CardCatalogView  | "cardCatalog:selected" | id: string               | выбор товара из каталога на главной странице для отображения превью   |
| CardPreviewView  | "cardPreview:toggle"   | id: string               | добавить(удалить) товар в(из) корзину                                 |
| CardBasketView   | "cardBasket:delete"    | id: string               | удалить товар из корзины                                              |
| BasketView       | "basket:checkout"      | нет                      | начать оформление заказа в корзине                                    |
| OrderForm        | "order.<поле>:changed" | { field, value }         | сообщает об изменении в полях ввода                                   |
| OrderForm        | "order:submit"         | нет                      | сабмит первой формы                                                   |
| ContactsForm     | "contacts.<поле>:changed" | { field, value }      | сообщает об изменении в полях ввода                                   |
| ContactsForm     | "contacts:submit"      | нет                      | сабмит второй формы                                                   |

<!-- prettier-ignore-end -->
