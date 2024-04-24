import { DateValue } from '@mantine/dates';

export interface productType {
  id: number;
  image: string;
  name: string;
  code: string;
  quantity: number;
  price: number;
  weight: number;
  amount: number;
  publish_date: string;
  status: string;
  url_image?: string;
  evaluate?: string;
  subcategory: { name: string };
  created_time: string;
  slug?: string;
  subsubcategory?: number;
}

export type CategoryType = {
  id?: number;
  name?: string;
  enable?: boolean;
  image?: string;
  index?: number;
  modified_time?: string;
  note?: string;
  created_time?: string;
  slug?: string;
};
export interface voucherType {
  id?: number;
  name: string;
  available?: number;
  code_promo?: string;
  category_id: number;
  subcategory_id: number;
  discount_type: string;
  total: number;
  discount: number;
  start_date: string | DateValue | any;
  end_date: string | DateValue | any;
  active: boolean;
  description: string;
  discount_target: string;
  status: string;
  product_id: number;
  product?: string;
  last_code?: string;
  category?: number;
  subcategory?: number;
  subsubcategory_id?: number;
}

export interface IProductForm {
  name: string;
  weight: number;
  status: string;
  available: boolean;
  publish_date: string;
  price: number;
  discount_price: number;
  subsubcategory_id: number;
  url_image: string;
  note: {
    Caractéristiques: string;
    Composition: string;
    Description: string;
    Utilisation: string;
  };
  category_id: number;
  subcategory_id: number;
  amount: number;
  discount_start_date: string | DateValue;
  discount_end_date: string | Date;
  color: object;
  packaging: object;
  capacity: object;
  album: string[];
  category?: {
    name: string;
    id: number;
  };
  subcategory?: {
    name: string;
    id: number;
  };
  subsubcategory?: number;
}
export interface IAttribute {
  image: string;
  price: number;
  name: string;
  color?: string;
}
export type subsub = {
  name: string;
  id: number;
};
export type ordersListType = {
  id: number;
  id_order: string;
  payment_id: string;
  status: string;
  user_name: string;
  company_name: string;
  dif_company_name: string;
  first_name: string;
  dif_first_name: string;
  last_name: string;
  dif_last_name: string;
  phone_number: string;
  dif_phone_number: string;
  country: string;
  dif_country: string;
  province: string;
  dif_province: string;
  district: string;
  dif_district: string;
  ward: string;
  dif_ward: string;
  address: string;
  real_price: number;
  fee_ship: number;
  total_weight: number;
  total: number;
  total_price_cart: number;
  total_price_payment: number;
  sub_total: number;
  zip_code: number;
  dif_zip_code: number;
  note: string;
  email: string;
  dif_email: string;
  applied_voucher: string;
  user: number;
};
