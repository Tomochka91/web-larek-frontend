import { Api, ApiListResponse } from './base/api';
import { IApi, IProductItem, IOrderRequest, IOrderResponse } from '../types';

export class WebLarekApi extends Api implements IApi {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getProductItem(id: string): Promise<IProductItem> {
		return this.get(`/product/${id}`).then((item: IProductItem) => ({
			...item,
			image: this.cdn + item.image,
		}));
	}

	getProductList(): Promise<IProductItem[]> {
		return this.get('/product').then((data: ApiListResponse<IProductItem>) =>
			data.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
			}))
		);
	}

	postOrder(order: IOrderRequest): Promise<IOrderResponse> {
		return this.post('/order', order).then((data: IOrderResponse) => data);
	}
}
