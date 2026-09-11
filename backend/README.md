# Twitter Clone - Isolated Backend API

این پوشه شامل سرور بک‌اند مستقل با معماری لایه‌ای (Layered Architecture)، احراز هویت با توکن JWT، اعتبارسنجی ورودی‌ها با Zod و ذخیره‌سازی داده‌های آزمایشی (Mock Data Repository) است.

---

## 🏛️ معماری لایه‌ای (Layered Architecture)

بک‌اند کاملاً از فرانت‌اند ایزوله بوده و بر اساس تفکیک مسئولیت‌ها (Separation of Concerns) طراحی شده است:

```
backend/
├── src/
│   ├── config/             # تنظیمات و متغیرهای محیطی (PORT, JWT, CORS)
│   ├── types/              # اینترفیس‌های دامنه کاربر و پاسخ‌های API
│   ├── validations/        # طرح‌واره‌های اعتبارسنجی Zod
│   ├── repositories/       # لایه دسترسی به داده (IUserRepository و MockUserRepository)
│   ├── services/           # منطق کسب‌وکار (AuthService، هش bcrypt و صدور JWT)
│   ├── controllers/        # لایه کنترلر (دریافت درخواست و ارسال پاسخ‌های HTTP)
│   ├── middlewares/        # میان‌افزارها (اعتبارسنجی Zod، احراز هویت JWT و مدیریت خطا)
│   ├── routes/             # تعریف مسیرهای API (/api/auth)
│   ├── app.ts              # پیکربندی Express و میان‌افزارهای سراسری
│   └── server.ts           # اجرای سرور بر روی پورت ۵۰۰۰
```

---

## 🚀 نحوه اجرا و تست

### نصب وابستگی‌ها
```bash
cd backend
npm install
```

### اجرای سرور در حالت توسعه
```bash
npm run dev
# یا از پوشه ریشه پروژه:
npm run backend
```
سرور بر روی آدرس `http://localhost:5000` اجرا خواهد شد.

### اجرای تست‌های خودکار (Unit & E2E)
```bash
npm run test
# یا از پوشه ریشه پروژه:
npm run backend:test
```

---

## 👤 حساب کاربری آزمایشی (Pre-seeded Mock Account)

داده‌های اولیه در مخزن آزمایشی با مشخصات زیر بارگذاری شده‌اند:
* **ایمیل یا نام کاربری:** `demo@example.com` یا `demo`
* **رمز عبور:** `password123`
* **نام نمایشی:** `کاربر دمو`

---

## 📡 مسیرهای API (Endpoints)

| متد | مسیر | توضیحات | محافظت شده؟ |
|---|---|---|---|
| `GET` | `/api/health` | بررسی سلامت سرور | خیر |
| `POST` | `/api/auth/login` | ورود به حساب با ایمیل/نام‌کاربری و رمز عبور | خیر (اعتبارسنجی Zod) |
| `POST` | `/api/auth/register` | ثبت‌نام حساب جدید | خیر (اعتبارسنجی Zod) |
| `GET` | `/api/auth/me` | دریافت اطلاعات حساب کاربری وارد شده | بله (نیاز به `Bearer Token`) |
