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

## 🐘 پایگاه‌داده PostgreSQL و پنل مدیریت pgAdmin (Docker)

پروژه به همراه تنظیمات Docker Compose برای پایگاه داده PostgreSQL 16 و پنل مدیریت وب pgAdmin 4 ارائه شده است.

### راه‌اندازی سریع با داکر:
```bash
# از ریشه پروژه یا پوشه backend:
npm run db:up

# یا مستقیماً با داکر:
docker compose up -d
```

### مشخصات سرویس‌ها:
* **PostgreSQL:**
  - پورت: `5432`
  - نام کاربری: `postgres`
  - رمز عبور: `postgres`
  - نام پایگاه‌داده: `twitter_db`
  - متغیر اتصال: `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/twitter_db`

* **pgAdmin 4 (رابط تحت وب مدیریت دیتابیس):**
  - آدرس: [http://localhost:5050](http://localhost:5050)
  - ایمیل ورود: `admin@admin.com`
  - رمز عبور: `admin`
  - سرور پایگاه داده توییتر به صورت خودکار از طریق فایل `pgadmin/servers.json` در پنل اضافه شده است.

### اسکریپت‌های مدیریت کانتینر:
```bash
npm run db:up      # شروع سرویس‌های دیتابیس و pgAdmin
npm run db:down    # خاموش کردن کانتینرها
npm run db:logs    # مشاهده لاگ‌ها به صورت زنده
npm run db:status  # مشاهده وضعیت کانتینرها
```


## 📡 مسیرهای API (Endpoints)

| متد | مسیر | توضیحات | محافظت شده؟ |
|---|---|---|---|
| `GET` | `/api/health` | بررسی سلامت سرور | خیر |
| `POST` | `/api/auth/login` | ورود به حساب با ایمیل/نام‌کاربری و رمز عبور | خیر (اعتبارسنجی Zod) |
| `POST` | `/api/auth/register` | ثبت‌نام حساب جدید | خیر (اعتبارسنجی Zod) |
| `GET` | `/api/auth/me` | دریافت اطلاعات حساب کاربری وارد شده | بله (نیاز به `Bearer Token`) |
