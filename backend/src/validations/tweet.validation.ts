import { z } from 'zod';

export const createTweetSchema = z.object({
  content: z
    .string({ required_error: 'متن پست الزامی است' })
    .min(1, { message: 'متن پست نمی‌تواند خالی باشد' })
    .max(280, { message: 'متن پست نمی‌تواند بیشتر از ۲۸۰ کاراکتر باشد' }),
  mediaUrl: z.string().url({ message: 'آدرس رسانه نامعتبر است' }).optional(),
});

export const createCommentSchema = z.object({
  content: z
    .string({ required_error: 'متن پاسخ الزامی است' })
    .min(1, { message: 'متن پاسخ نمی‌تواند خالی باشد' })
    .max(280, { message: 'متن پاسخ نمی‌تواند بیشتر از ۲۸۰ کاراکتر باشد' }),
});
