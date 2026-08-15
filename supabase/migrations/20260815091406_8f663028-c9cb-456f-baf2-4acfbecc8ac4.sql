CREATE TABLE public.directory_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'organization',
  name text NOT NULL,
  role_label text,
  category_label text,
  description text,
  website_url text,
  phone text,
  email text,
  address text,
  city text,
  region text,
  logo_url text,
  image_url text,
  project_images text[] NOT NULL DEFAULT '{}',
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT directory_entries_kind_check CHECK (kind IN ('organization','partner','supplier'))
);

GRANT SELECT ON public.directory_entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.directory_entries TO authenticated;
GRANT ALL ON public.directory_entries TO service_role;
ALTER TABLE public.directory_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read published directory entries" ON public.directory_entries
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "editors read directory entries" ON public.directory_entries
  FOR SELECT TO authenticated USING (public.can_edit(auth.uid()));
CREATE POLICY "editors write directory entries" ON public.directory_entries
  FOR ALL TO authenticated USING (public.can_edit(auth.uid())) WITH CHECK (public.can_edit(auth.uid()));

CREATE TRIGGER trg_directory_entries_updated BEFORE UPDATE ON public.directory_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'category',
  slug text NOT NULL UNIQUE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  material_id uuid REFERENCES public.materials(id) ON DELETE SET NULL,
  title text NOT NULL,
  subtitle text,
  intro text,
  body text,
  bullets text[] NOT NULL DEFAULT '{}',
  hero_image_url text,
  gallery_images text[] NOT NULL DEFAULT '{}',
  seo_title text,
  seo_description text,
  seo_image_url text,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT landing_pages_kind_check CHECK (kind IN ('category','material'))
);

GRANT SELECT ON public.landing_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.landing_pages TO authenticated;
GRANT ALL ON public.landing_pages TO service_role;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read published landing pages" ON public.landing_pages
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "editors read landing pages" ON public.landing_pages
  FOR SELECT TO authenticated USING (public.can_edit(auth.uid()));
CREATE POLICY "editors write landing pages" ON public.landing_pages
  FOR ALL TO authenticated USING (public.can_edit(auth.uid())) WITH CHECK (public.can_edit(auth.uid()));

CREATE TRIGGER trg_landing_pages_updated BEFORE UPDATE ON public.landing_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.directory_entries (kind, name, role_label, category_label, description, website_url, city, sort_order) VALUES
('organization','חברה קדישא — איגוד ארצי','ארגון קהילתי','קהילה ודת','ליווי הליכי קבורה, נהלים הלכתיים ותיאום מול בתי העלמין בכל הארץ.','https://www.chevra-kadisha.org.il','ישראל',1),
('organization','המרכז לאמנות האבן בישראל','ארגון מקצועי','ארגון מקצועי','קהילת אמני אבן וסתתים, השתלמויות מקצועיות ושימור מסורת החריטה בעבודת יד.',NULL,'תל אביב',2),
('organization','ארגון בתי כנסת ומועצות דתיות','ארגון דתי','קהילה ודת','מקור מידע להלכות מצבה, נוסחי הקדשה וליווי משפחות בתקופת האבל.',NULL,'ירושלים',3),
('partner','בית עלמין ירקון','בית עלמין','בתי עלמין','תיאום התקנות, אישורי מידות ועבודה שוטפת מול מחלקת ההנדסה של בית העלמין.',NULL,'פתח תקווה',1),
('partner','בית הלוויות מנוחה נכונה','בית לוויות','בתי לוויות','שיתוף פעולה בליווי משפחות מרגע הפטירה ועד הצבת המצבה.',NULL,'חולון',2),
('partner','מועצה דתית רמת גן','ארגון קהילתי','ארגונים קהילתיים','אישורי נוסח, תיאום מועדי הצבה וליווי הלכתי למשפחות.',NULL,'רמת גן',3),
('supplier','מחצבות שיש כרמל','ספק אבן','מחצבות','אספקת גושי שיש ואבן חברון באיכות גבוהה, חיתוך מדויק ובקרת גוונים.',NULL,'חיפה',1),
('supplier','גרניט אימפורט בע״מ','יבואן גרניט','ספקי גרניט','יבוא גרניט שחור ואפור מלוטש, לוחות בעובי מוגבר לעבודות מונומנטליות.',NULL,'אשדוד',2),
('supplier','צוות התקנות אבן — שותף שטח','מתקין שותף','מתקינים','צוות התקנה מוסמך לעבודות באתרי קבורה, כולל יסודות, פילוס ואיטום.',NULL,'מרכז',3);

INSERT INTO public.landing_pages (kind, slug, title, subtitle, intro, body, bullets, sort_order) VALUES
('category','matzevot-granite','מצבות גרניט','גרניט מלוטש, עמידות לאורך דורות','מצבות גרניט הן הבחירה העמידה ביותר לאורך זמן: אבן קשה, אטומה כמעט לחלוטין ללחות, ששומרת על גוון ועל ברק גם לאחר עשרות שנים בחוץ.','אנו מייצרים מצבות גרניט בהתאמה אישית — בחירת גוון, עובי הלוח, סוג הליטוש וצורת הראש. החריטה מבוצעת בעבודת יד או בחריטת עומק, עם מילוי צבע או עלה כסף לפי בקשת המשפחה. ההתקנה נעשית על יסוד יצוק ומפולס, בתיאום מלא עם הנהלת בית העלמין.','{"עמידות גבוהה במיוחד לתנאי חוץ","גווני שחור, אפור ואדום מלוטשים","חריטת עומק או אותיות בולטות","תחזוקה מינימלית לאורך שנים"}',1),
('category','matzevot-family','מצבות משפחתיות','פתרון מכובד לחלקת משפחה','מצבה משפחתית מאחדת בני משפחה תחת עיצוב אחד, עם חלוקה מדויקת של השטח והנוסחים.','התכנון מתחיל במידות החלקה ובאישורי בית העלמין, וממשיך בשרטוט הצעה הכולל את חלוקת הלוחות, מיקום הנוסחים והשילוב בין חומרים. אנו מלווים את המשפחה בבחירת האבן, בעריכת הנוסח ובהצבה בשטח.','{"תכנון לפי מידות החלקה","שילוב אבן ושיש בגוונים משלימים","נוסחים נפרדים בעיצוב אחיד","ליווי מלא מול בית העלמין"}',2),
('material','marble-turkish','שיש טורקי','גוון בהיר, חם ואצילי','שיש טורקי הוא אבן בהירה עם ורידים עדינים, שמעניקה למצבה מראה רך ומכובד.','השיש מסופק בלוחות בעובי מוגבר ובגימור מלוטש או מוברש. הוא מתאים במיוחד למצבות קלאסיות עם חריטה שחורה, ומשתלב היטב עם מסגרות אבן חברון או עם לוחות גרניט שחור לניגוד עדין.','{"גוון בהיר עם ורידים טבעיים","גימור מלוטש או מוברש","מתאים לחריטה שחורה מודגשת","משתלב עם אבן חברון וגרניט"}',1),
('material','hebron-stone','אבן חברון','אבן מקומית עם אופי מסורתי','אבן חברון היא אבן מקומית בגוון חמים, בעלת מרקם טבעי ואופי מסורתי מובהק.','אנו משתמשים באבן חברון למסגרות, לראשי מצבה ולעבודות סיתות בעבודת יד. המרקם הטבעי של האבן משתלב היטב בסביבת בתי העלמין בישראל ומתיישן בצורה יפה עם השנים.','{"אבן מקומית בגוון חמים","סיתות בעבודת יד","מתיישנת בצורה אצילית","מתאימה למסגרות וראשי מצבה"}',2);