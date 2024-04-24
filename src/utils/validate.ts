import { z } from 'zod';

export const productSchema = z.object({
  name: z.string(),
  url_image: z.string({ required_error: 'please upload image' }),
});
export const voucherSchema = z.object({
  discount: z.number().lte(3),
  total: z.number().lte(4, {
    message: 'invalid number',
  }),
});
