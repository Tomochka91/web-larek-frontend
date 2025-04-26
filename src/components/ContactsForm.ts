import { Component } from './base/Component';
import { Form } from './common/Form';
import { IEvents } from './base/events';

export interface IContactsFormView
	extends Component<IContactsFormData>,
		IContactsFormData {}

// Интерфейс данных для рендера формы контактных данных
interface IContactsFormData {
	email: string;
	phone: string;
	valid: boolean;
	errors: string;
}

export class ContactsForm extends Form<IContactsFormView> {
	constructor(container: HTMLFormElement, event: IEvents) {
		super(container, event);
	}

	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}

	set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}
}
