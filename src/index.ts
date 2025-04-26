import './scss/styles.scss';
import { EventEmitter } from './components/base/events';
import { ProductList, BasketList, Order } from './components/Model';
import { WebLarekApi } from './components/WebLarekApi';
import { Presenter } from './components/Presenter';
import { PageView } from './components/Page';
import { Popup } from './components/common/Popup';
import { BasketView } from './components/Basket';
import { OrderForm } from './components/OrderForm';
import { ContactsForm } from './components/ContactsForm';
import { SuccessView } from './components/Success';
import {
	CardCatalogView,
	CardPreviewView,
	CardBasketView,
} from './components/Cards';
import { ensureElement } from './utils/utils';
import { API_URL, CDN_URL } from './utils/constants';

// Шаблоны
const templates = {
	cardCatalogTemplate: document.querySelector(
		'#card-catalog'
	) as HTMLTemplateElement,
	cardPreviewTemplate: document.querySelector(
		'#card-preview'
	) as HTMLTemplateElement,
	cardBasketTemplate: document.querySelector(
		'#card-basket'
	) as HTMLTemplateElement,
	basketTemplate: document.querySelector('#basket') as HTMLTemplateElement,
	orderTemplate: document.querySelector('#order') as HTMLTemplateElement,
	contactsTemplate: document.querySelector('#contacts') as HTMLTemplateElement,
	successTemplate: document.querySelector('#success') as HTMLTemplateElement,
};

// EventEmitter (один на всех, будем внедрять зависимость)
const eventEmitter = new EventEmitter();

// API
const larekApi = new WebLarekApi(CDN_URL, API_URL);

// MODEL
const model = {
	catalog: new ProductList(eventEmitter, larekApi),
	basket: new BasketList(eventEmitter),
	order: new Order(eventEmitter, larekApi),
};

// VIEW
// Главная страница
const pageView = new PageView(document.body, eventEmitter);

// Popup
const popupView = new Popup(
	ensureElement<HTMLElement>('#modal-container'),
	eventEmitter
);

// Ссылки на используемые классы-представления карточек
const cardViews = {
	catalog: CardCatalogView,
	preview: CardPreviewView,
	basket: CardBasketView,
};

// View Constructors
const constructors = {
	basket: BasketView,
	order: OrderForm,
	contacts: ContactsForm,
	success: SuccessView,
	card: cardViews,
};

/**********************************************************/
//Запрашиваем каталог с сервера
// larekApi.getProductList().then((data: IProductItem[]) => {
// 	catalog.productList = data;
// });

// PRESENTER
// Хотелось передавать меньше аргументов
const presenter = new Presenter(
	eventEmitter,
	model,
	pageView,
	popupView,
	constructors,
	templates
);
presenter.init();
