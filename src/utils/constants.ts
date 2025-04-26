export const API_URL = `${process.env.API_ORIGIN}/api/weblarek`; // API_URL - используется для запросов данных о товарах и отправки заказа
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`; // CDN_URL - используется для формирования адреса картинки в товаре.

export const settings = {};

// prettier-ignore
export const cardCategories: Record<string, string> = {
    'софт-скил': 'card__category_soft',
    'другое': 'card__category_other',
    'дополнительное': 'card__category_additional',
    'кнопка': 'card__category_button',
    'хард-скил': 'card__category_hard',
};
