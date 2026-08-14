
-- roles
CREATE TYPE public.app_role AS ENUM ('admin','editor','viewer');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile write" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.can_edit(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','editor'));
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  short_description text,
  description text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  price numeric,
  show_price boolean NOT NULL DEFAULT false,
  price_on_request boolean NOT NULL DEFAULT true,
  main_image_url text,
  material text,
  dimensions text,
  color text,
  location text,
  tags text[] NOT NULL DEFAULT '{}',
  seo_title text,
  seo_description text,
  seo_image_url text,
  status text NOT NULL DEFAULT 'draft',
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  features text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.process_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number text NOT NULL,
  title text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  description text,
  image_url text NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content text,
  image_url text,
  seo_title text,
  seo_description text,
  seo_image_url text,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.site_texts (
  key text PRIMARY KEY,
  value_he text,
  value_fr text,
  value_en text,
  group_name text,
  label text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text,
  email text,
  message text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- grants + rls
GRANT SELECT ON public.categories, public.products, public.product_images, public.services,
  public.materials, public.process_steps, public.gallery, public.pages, public.site_texts, public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories, public.products, public.product_images, public.services,
  public.materials, public.process_steps, public.gallery, public.pages, public.site_texts, public.site_settings TO authenticated;
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.categories, public.products, public.product_images, public.services, public.materials,
  public.process_steps, public.gallery, public.pages, public.site_texts, public.site_settings, public.contact_messages TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read visible categories" ON public.categories FOR SELECT TO anon, authenticated USING (is_visible AND deleted_at IS NULL);
CREATE POLICY "editors read all categories" ON public.categories FOR SELECT TO authenticated USING (public.can_edit(auth.uid()));
CREATE POLICY "editors write categories" ON public.categories FOR ALL TO authenticated USING (public.can_edit(auth.uid())) WITH CHECK (public.can_edit(auth.uid()));

CREATE POLICY "public read published products" ON public.products FOR SELECT TO anon, authenticated USING (status = 'published' AND deleted_at IS NULL);
CREATE POLICY "editors read all products" ON public.products FOR SELECT TO authenticated USING (public.can_edit(auth.uid()));
CREATE POLICY "editors write products" ON public.products FOR ALL TO authenticated USING (public.can_edit(auth.uid())) WITH CHECK (public.can_edit(auth.uid()));

CREATE POLICY "public read product images" ON public.product_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "editors write product images" ON public.product_images FOR ALL TO authenticated USING (public.can_edit(auth.uid())) WITH CHECK (public.can_edit(auth.uid()));

CREATE POLICY "public read services" ON public.services FOR SELECT TO anon, authenticated USING (is_visible);
CREATE POLICY "editors read services" ON public.services FOR SELECT TO authenticated USING (public.can_edit(auth.uid()));
CREATE POLICY "editors write services" ON public.services FOR ALL TO authenticated USING (public.can_edit(auth.uid())) WITH CHECK (public.can_edit(auth.uid()));

CREATE POLICY "public read materials" ON public.materials FOR SELECT TO anon, authenticated USING (is_visible);
CREATE POLICY "editors read materials" ON public.materials FOR SELECT TO authenticated USING (public.can_edit(auth.uid()));
CREATE POLICY "editors write materials" ON public.materials FOR ALL TO authenticated USING (public.can_edit(auth.uid())) WITH CHECK (public.can_edit(auth.uid()));

CREATE POLICY "public read steps" ON public.process_steps FOR SELECT TO anon, authenticated USING (is_visible);
CREATE POLICY "editors read steps" ON public.process_steps FOR SELECT TO authenticated USING (public.can_edit(auth.uid()));
CREATE POLICY "editors write steps" ON public.process_steps FOR ALL TO authenticated USING (public.can_edit(auth.uid())) WITH CHECK (public.can_edit(auth.uid()));

CREATE POLICY "public read gallery" ON public.gallery FOR SELECT TO anon, authenticated USING (status = 'published' AND deleted_at IS NULL);
CREATE POLICY "editors read gallery" ON public.gallery FOR SELECT TO authenticated USING (public.can_edit(auth.uid()));
CREATE POLICY "editors write gallery" ON public.gallery FOR ALL TO authenticated USING (public.can_edit(auth.uid())) WITH CHECK (public.can_edit(auth.uid()));

CREATE POLICY "public read pages" ON public.pages FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "editors read pages" ON public.pages FOR SELECT TO authenticated USING (public.can_edit(auth.uid()));
CREATE POLICY "editors write pages" ON public.pages FOR ALL TO authenticated USING (public.can_edit(auth.uid())) WITH CHECK (public.can_edit(auth.uid()));

CREATE POLICY "public read texts" ON public.site_texts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "editors write texts" ON public.site_texts FOR ALL TO authenticated USING (public.can_edit(auth.uid())) WITH CHECK (public.can_edit(auth.uid()));

CREATE POLICY "public read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "editors write settings" ON public.site_settings FOR ALL TO authenticated USING (public.can_edit(auth.uid())) WITH CHECK (public.can_edit(auth.uid()));

CREATE POLICY "anyone can send a message" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "editors read messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.can_edit(auth.uid()));
CREATE POLICY "editors update messages" ON public.contact_messages FOR UPDATE TO authenticated USING (public.can_edit(auth.uid()));
CREATE POLICY "editors delete messages" ON public.contact_messages FOR DELETE TO authenticated USING (public.can_edit(auth.uid()));

CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_materials_updated BEFORE UPDATE ON public.materials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_steps_updated BEFORE UPDATE ON public.process_steps FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_gallery_updated BEFORE UPDATE ON public.gallery FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_pages_updated BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- seed content
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
 ('מצבות שיש טורקי','turkish-marble','שיש טורקי בגוונים חמים, עיבוד עדין וגימור מוקפד.',1),
 ('מצבות שיש גרניט','granite','גרניט עמיד במיוחד, מרשים בפשטותו ושומר על מראהו לאורך שנים.',2),
 ('מצבות כפולות','double','פתרון מכובד לזוגות, בתכנון סימטרי ומדויק.',3),
 ('מצבות משפחתיות','family','מצבות מכפלות משפחתיות בתכנון רחב ומאוזן.',4),
 ('מצבות מעוצבות','designed','עיצוב אישי, חריטות ופרטים ייחודיים בעבודת יד.',5),
 ('מצבות אבן חברון','hebron-stone','אבן חברון מקומית, אופי ארכיטקטוני וטקסטורה טבעית.',6),
 ('מצבות אבני ראש','headstones','אבני ראש בעיבוד מדויק, עם אפשרות לחריטה מיוחדת.',7),
 ('חצי מצבה','half','פתרון מכובד ומאופק בגדלים מותאמים.',8);

INSERT INTO public.process_steps (step_number, title, description, sort_order) VALUES
 ('01','ייעוץ','פגישה ראשונית, הקשבה לצרכי המשפחה והבנת אופי ההנצחה.',1),
 ('02','בחירת חומר ועיצוב','בחירת אבן או שיש, פרופורציות, גימורים ונוסח החריטה.',2),
 ('03','ייצור וחריטה','עיבוד האבן בסדנה, חריטה מדויקת ובדיקת איכות.',3),
 ('04','התקנה','התקנה מקצועית ומכבדת בבית העלמין, וליווי עד לסיום.',4);

INSERT INTO public.materials (title, description, features, sort_order) VALUES
 ('שיש','שיש בגוונים בהירים וחמים, עם ורידים טבעיים ייחודיים לכל לוח.','גימור מלוטש או מט · מגוון גוונים · מראה קלאסי',1),
 ('גרניט','אבן קשה ועמידה במיוחד, שומרת על צבעה וחדות החריטה לאורך שנים.','עמידות גבוהה · תחזוקה מינימלית · חריטה חדה',2),
 ('אבן חברון','אבן מקומית עם טקסטורה טבעית ואופי ארכיטקטוני שקט.','מראה טבעי · התכתבות עם הסביבה · עיבוד ידני',3);

INSERT INTO public.services (title, description, sort_order) VALUES
 ('ייצור מצבות','ייצור מצבות באבן, שיש וגרניט בעיבוד מדויק ובגימור מוקפד.',1),
 ('עיצוב בהתאמה אישית','תכנון המצבה יחד עם המשפחה, בהתאמה לאופי הנפטר ולסביבה.',2),
 ('חריטה','חריטת נוסח, אותיות בולטות או שקועות, ועיטורים בעבודת יד.',3),
 ('שיפוץ וחידוש מצבות','שיקום מצבות ותיקות, ניקוי, החזרת צבע לחריטה ותיקוני אבן.',4),
 ('תחזוקה','טיפול תקופתי ושמירה על מראה מכובד לאורך שנים.',5),
 ('התקנה','התקנה מקצועית בבית העלמין, בתיאום מלא ובכבוד.',6),
 ('עבודות אבן ושיש','עבודות אבן ושיש נוספות בהתאמה אישית.',7);

INSERT INTO public.pages (slug, title, content, seo_title, seo_description) VALUES
 ('about','אודות GALINOS','גלינוס מצבות ואבן עוסקת בתכנון, ייצור והתקנה של מצבות באבן, בשיש ובגרניט. העבודה נעשית בסדנה, בעיבוד מדויק ובגימור מוקפד, מתוך הבנה שכל מצבה היא אובייקט אישי ומכבד.

אנו מלווים משפחות בכל שלבי התהליך: ייעוץ ראשוני, בחירת החומר, תכנון הפרופורציות ונוסח החריטה, ועד להתקנה בבית העלמין. אזור הפעילות העיקרי הוא נתניה והשרון, וכן בכל חלקי הארץ.','אודות GALINOS — מצבות אבן ושיש','גלינוס מצבות ואבן: תכנון, ייצור והתקנה של מצבות באבן, שיש וגרניט, בליווי אישי ומכבד.'),
 ('privacy','מדיניות פרטיות','אתר זה אוסף פרטים שנמסרים ביודעין באמצעות טופס יצירת הקשר (שם, טלפון, אימייל והודעה) לצורך מענה לפנייה בלבד. הפרטים אינם מועברים לצדדים שלישיים למטרות שיווק. לבקשת מחיקת פרטים ניתן לפנות אלינו דרך עמוד יצירת הקשר.','מדיניות פרטיות — GALINOS','מדיניות הפרטיות של אתר GALINOS מצבות ואבן.'),
 ('terms','תקנון ותנאי שימוש','השימוש באתר ובתכניו נעשה באחריות המשתמש. התמונות באתר מיועדות להמחשה בלבד; גוון האבן, הטקסטורה והמידות עשויים להשתנות בין לוח ללוח. אין באמור באתר משום הצעה מחייבת, וכל עבודה מתומחרת בהצעת מחיר אישית.','תקנון ותנאי שימוש — GALINOS','תנאי השימוש באתר GALINOS מצבות ואבן.');

INSERT INTO public.site_settings (key, value) VALUES
 ('company_name','GALINOS'),
 ('tagline','מצבות | אבן | שיש'),
 ('phone','072-3340518'),
 ('whatsapp','972537223638'),
 ('whatsapp_message','שלום, אני מעוניין לקבל פרטים לגבי מצבה.'),
 ('email',''),
 ('address',''),
 ('maps_url',''),
 ('instagram',''),
 ('facebook',''),
 ('hours',''),
 ('footer_text','גלינוס מצבות ואבן — תכנון, ייצור והתקנה של מצבות באבן ובשיש.'),
 ('languages','he');

INSERT INTO public.site_texts (key, value_he, group_name, label) VALUES
 ('hero_title','מצבות באבן ובשיש','hero','כותרת ראשית'),
 ('hero_subtitle','עיצוב, ייצור והתקנה בהתאמה אישית','hero','כותרת משנה'),
 ('hero_cta_primary','צפו בעבודות שלנו','hero','כפתור ראשי'),
 ('hero_cta_secondary','צרו קשר','hero','כפתור משני'),
 ('hero_scroll','גלו עוד','hero','אינדיקציית גלילה'),
 ('intro_title','עבודה שנעשית מתוך כבוד','intro','כותרת מבוא'),
 ('intro_text','גלינוס מלווה משפחות בתכנון ובביצוע של מצבות בהתאמה אישית, עם תשומת לב לחומרים, לגימורים, לפרופורציות ולפרטים הקטנים. כל עבודה נעשית בקצב שלה, בשקט, ומתוך הבנה שהתוצאה נשארת לדורות.','intro','טקסט מבוא'),
 ('categories_title','סוגי המצבות','categories','כותרת קטגוריות'),
 ('categories_subtitle','מגוון סוגי מצבות בחומרים ובעיצובים שונים, בהתאמה אישית לכל משפחה.','categories','תיאור קטגוריות'),
 ('gallery_title','העבודות שלנו','gallery','כותרת גלריה'),
 ('gallery_subtitle','מבחר עבודות שבוצעו בסדנה ובבתי העלמין.','gallery','תיאור גלריה'),
 ('services_title','השירותים שלנו','services','כותרת שירותים'),
 ('services_subtitle','מהייעוץ הראשוני ועד להתקנה — הכל תחת קורת גג אחת.','services','תיאור שירותים'),
 ('process_title','תהליך העבודה','process','כותרת תהליך'),
 ('materials_title','החומרים','materials','כותרת חומרים'),
 ('trust_title','למה לבחור ב-GALINOS?','trust','כותרת אמון'),
 ('contact_title','צרו קשר','contact','כותרת יצירת קשר'),
 ('contact_subtitle','נשמח לענות על כל שאלה, ללא התחייבות.','contact','תיאור יצירת קשר'),
 ('contact_success','ההודעה נשלחה. נחזור אליכם בהקדם.','contact','הודעת הצלחה'),
 ('price_on_request','מחיר לפי הצעת מחיר','products','טקסט מחיר לפי הצעה'),
 ('trust_items','התאמה אישית|עבודת יד|חומרי גלם איכותיים|גימור מוקפד|ליווי אישי|שירות מקצועי','trust','נקודות אמון (מופרד ב-|)');
