-- =============================================================================
-- Twitter Clone Database Schema & Initial Seeds
-- PostgreSQL 16
-- =============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  bio TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));

-- 2. TWEETS TABLE
CREATE TABLE IF NOT EXISTS tweets (
  id VARCHAR(64) PRIMARY KEY,
  author_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reposts_count INTEGER DEFAULT 0,
  views VARCHAR(50) DEFAULT '۱',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tweets_author_id ON tweets(author_id);
CREATE INDEX IF NOT EXISTS idx_tweets_created_at ON tweets(created_at DESC);

-- 3. LIKES TABLE
CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,
  tweet_id VARCHAR(64) NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_tweet_user UNIQUE (tweet_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_tweet_id ON likes(tweet_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);

-- 4. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR(64) PRIMARY KEY,
  tweet_id VARCHAR(64) NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
  author_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_tweet_id ON comments(tweet_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- 5. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(64) PRIMARY KEY,
  sender_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  document_url TEXT,
  document_name TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_participants ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at ASC);

-- =============================================================================
-- SEED INITIAL DATA (All demo passwords are: password123)
-- Hash generated with bcrypt salt rounds 10 for 'password123':
-- $2a$10$wT0H7q4xLqJqcSkg5Q2mbe5R.c4Qe7Gz3m7XF9pYjC1hF1Z8K7g5K
-- =============================================================================

INSERT INTO users (id, name, username, email, password, bio, avatar, created_at)
VALUES
  (
    'usr_demo_123',
    'کاربر دمو',
    'demo',
    'demo@example.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'توسعه‌دهنده نرم‌افزار و کاربر آزمایشی سامانه',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    NOW()
  ),
  (
    'usr_sara_456',
    'سارا احمدی',
    'sara',
    'sara@example.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'طراح رابط و تجربه کاربری (UI/UX) | عاشق طراحی سیستم‌های مینیمال',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    NOW() - INTERVAL '30 days'
  ),
  (
    'usr_reza_789',
    'رضا محمدی',
    'reza',
    'reza@example.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'مهندس ارشد فرانت‌اند و علاقه‌مند به اکوسیستم وب مدرن',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    NOW() - INTERVAL '20 days'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO tweets (id, author_id, content, media_url, likes_count, comments_count, reposts_count, views, created_at)
VALUES
  (
    'tweet_1',
    'usr_demo_123',
    'نسخه ۱۶ نکست‌جی‌اس با کامپایل توربوپک فوق‌سریع، پشتیبانی رسمی از ری‌اکت ۱۹ و ارتقای چشمگیر سرور اکشن‌ها منتشر شد! 🚀\n\nبرای شروع دستور npx create-next-app@latest را اجرا کنید.',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    5890,
    2,
    1204,
    '۱۴۲K',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'tweet_2',
    'usr_demo_123',
    'ترکیب متریال یو‌آی نسخه ۶ با اپ‌روتر نکست‌جی‌اس و پشتیبانی کامل از حالت تاریک OLED و چیدمان راست‌چین (RTL)، تجربه‌ای کاملاً بومی و روان را برای کاربران فارسی‌زبان فراهم می‌کند.\n\n#ری‌اکت #توسعه_وب #طراحی_رابط_کاربری',
    NULL,
    1430,
    1,
    215,
    '۴۵.۸K',
    NOW() - INTERVAL '4 hours'
  ),
  (
    'tweet_3',
    'usr_demo_123',
    'طراحی ۳ ستونه مدرن با تراکم مناسب اطلاعات، مرزبندی‌های ظریف و انیمیشن‌های روان فیزیکی، همواره استاندارد طلایی داشبوردهای تعاملی و شبکه‌های اجتماعی است.',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    890,
    0,
    132,
    '۲۸.۱K',
    NOW() - INTERVAL '6 hours'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO comments (id, tweet_id, author_id, content, created_at)
VALUES
  ('cmt_1', 'tweet_1', 'usr_demo_123', 'سرعت کامپایل توربوپک واقعاً شگفت‌انگیزه!', NOW() - INTERVAL '1 hour'),
  ('cmt_2', 'tweet_1', 'usr_demo_123', 'آیا با ری‌اکت ۱۹ به صورت کامل سازگاره؟', NOW() - INTERVAL '30 minutes'),
  ('cmt_3', 'tweet_2', 'usr_demo_123', 'راست‌چین کردن متریال یو‌آی با فونت وزیرمتن فوق‌العاده شده.', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO messages (id, sender_id, receiver_id, content, media_url, document_url, document_name, read, created_at)
VALUES
  (
    'msg_seed_1',
    'usr_sara_456',
    'usr_demo_123',
    'سلام وقت بخیر! آیا کامپوننت‌های جدید رابط کاربری چت پیاده‌سازی شدند؟',
    NULL,
    NULL,
    NULL,
    TRUE,
    NOW() - INTERVAL '2 hours'
  ),
  (
    'msg_seed_2',
    'usr_demo_123',
    'usr_sara_456',
    'سلام سارا جان، بله معماری وب‌سوکت و ساختار تبادل ریل‌تایم پیام‌ها با موفقیت پیاده‌سازی شد.',
    NULL,
    NULL,
    NULL,
    TRUE,
    NOW() - INTERVAL '90 minutes'
  ),
  (
    'msg_seed_3',
    'usr_sara_456',
    'usr_demo_123',
    'فوق‌العادست! طرح مستندات را برای هماهنگی فرانت‌اِند ارسال کردم، لطفاً بررسی کن.',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    'https://example.com/docs/chat-spec.pdf',
    'chat-spec.pdf',
    FALSE,
    NOW() - INTERVAL '30 minutes'
  ),
  (
    'msg_seed_4',
    'usr_reza_789',
    'usr_demo_123',
    'سلام، جلسه بررسی یکپارچه‌سازی وب‌سوکت فردا ساعت ۱۱ برگزار می‌شود.',
    NULL,
    NULL,
    NULL,
    FALSE,
    NOW() - INTERVAL '10 minutes'
  )
ON CONFLICT (id) DO NOTHING;
