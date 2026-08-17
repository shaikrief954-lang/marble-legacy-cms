export type FieldType = "text" | "textarea" | "number" | "boolean" | "select" | "image" | "images" | "tags";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  help?: string;
  span?: 1 | 2;
};

export type Resource = {
  key: string;
  table: string;
  label: string;
  description: string;
  titleField: string;
  orderBy?: { column: string; ascending?: boolean };
  fixed?: Record<string, unknown>;
  filter?: { column: string; value: string };
  fields: Field[];
};

const STATUS_FIELD: Field = {
  name: "status",
  label: "מצב פרסום",
  type: "select",
  options: [
    { value: "published", label: "מפורסם" },
    { value: "draft", label: "טיוטה" },
  ],
};

const SORT_FIELD: Field = { name: "sort_order", label: "סדר הצגה", type: "number" };

function directoryFields(): Field[] {
  return [
    { name: "name", label: "שם", type: "text", span: 2 },
    { name: "category_label", label: "שיוך / קטגוריה", type: "text" },
    { name: "role_label", label: "תפקיד / סוג גוף", type: "text" },
    { name: "description", label: "תיאור", type: "textarea", span: 2 },
    { name: "website_url", label: "כתובת אתר", type: "text" },
    { name: "phone", label: "טלפון", type: "text" },
    { name: "email", label: "אימייל", type: "text" },
    { name: "city", label: "עיר / אזור", type: "text" },
    { name: "address", label: "כתובת", type: "text" },
    { name: "region", label: "אזור פעילות", type: "text" },
    { name: "logo_url", label: "לוגו", type: "image" },
    { name: "image_url", label: "תמונה ראשית", type: "image" },
    { name: "project_images", label: "תמונות פרויקטים", type: "images", span: 2 },
    { name: "is_featured", label: "מודגש", type: "boolean" },
    SORT_FIELD,
    STATUS_FIELD,
  ];
}

export const RESOURCES: Resource[] = [
  {
    key: "products",
    table: "products",
    label: "מצבות",
    description: "קטלוג המצבות: תוכן, תמונות, מחיר ומצב פרסום.",
    titleField: "title",
    orderBy: { column: "sort_order" },
    fields: [
      { name: "title", label: "כותרת", type: "text" },
      { name: "slug", label: "כתובת (slug)", type: "text", help: "אנגלית ומקפים בלבד" },
      { name: "short_description", label: "תקציר", type: "textarea", span: 2 },
      { name: "description", label: "תיאור מלא", type: "textarea", span: 2 },
      { name: "main_image_url", label: "תמונה ראשית", type: "image" },
      { name: "material", label: "חומר", type: "text" },
      { name: "dimensions", label: "מידות", type: "text" },
      { name: "color", label: "גוון", type: "text" },
      { name: "location", label: "מקום ההצבה", type: "text" },
      { name: "price", label: "מחיר (₪)", type: "number" },
      { name: "show_price", label: "הצגת מחיר", type: "boolean" },
      { name: "price_on_request", label: "מחיר לפי הצעה", type: "boolean" },
      { name: "tags", label: "תגיות", type: "tags", span: 2 },
      { name: "seo_title", label: "כותרת SEO", type: "text" },
      { name: "seo_description", label: "תיאור SEO", type: "textarea", span: 2 },
      { name: "is_featured", label: "מודגש", type: "boolean" },
      SORT_FIELD,
      STATUS_FIELD,
    ],
  },
  {
    key: "categories",
    table: "categories",
    label: "קטגוריות",
    description: "סוגי המצבות המוצגים בעמוד הראשי ובקטלוג.",
    titleField: "name",
    orderBy: { column: "sort_order" },
    fields: [
      { name: "name", label: "שם", type: "text" },
      { name: "slug", label: "כתובת (slug)", type: "text" },
      { name: "description", label: "תיאור", type: "textarea", span: 2 },
      { name: "image_url", label: "תמונה", type: "image" },
      { name: "is_visible", label: "מוצג באתר", type: "boolean" },
      SORT_FIELD,
    ],
  },
  {
    key: "landing_pages",
    table: "landing_pages",
    label: "עמודי SEO",
    description: "עמוד נחיתה לכל סוג מצבה ולכל חומר — לקידום אורגני ולקישורים מאתרי אינדקס.",
    titleField: "title",
    orderBy: { column: "sort_order" },
    fields: [
      {
        name: "kind",
        label: "סוג עמוד",
        type: "select",
        options: [
          { value: "category", label: "סוג מצבה (/category/…)" },
          { value: "material", label: "חומר (/material/…)" },
        ],
      },
      { name: "slug", label: "כתובת (slug)", type: "text" },
      { name: "title", label: "כותרת", type: "text" },
      { name: "subtitle", label: "כותרת משנה", type: "text" },
      { name: "intro", label: "פתיח", type: "textarea", span: 2 },
      { name: "body", label: "תוכן העמוד", type: "textarea", span: 2, help: "שורה ריקה בין פסקאות" },
      { name: "bullets", label: "נקודות מרכזיות", type: "tags", span: 2, help: "פריט בכל שורה" },
      { name: "hero_image_url", label: "תמונת כותרת", type: "image" },
      { name: "gallery_images", label: "גלריית תמונות", type: "images", span: 2 },
      { name: "seo_title", label: "כותרת SEO", type: "text" },
      { name: "seo_description", label: "תיאור SEO", type: "textarea", span: 2 },
      SORT_FIELD,
      STATUS_FIELD,
    ],
  },
  {
    key: "organizations",
    table: "directory_entries",
    label: "קהילה וארגונים",
    description: "ארגונים דתיים, מקצועיים וקהילתיים המוצגים בעמוד /community.",
    titleField: "name",
    orderBy: { column: "sort_order" },
    filter: { column: "kind", value: "organization" },
    fixed: { kind: "organization" },
    fields: directoryFields(),
  },
  {
    key: "partners",
    table: "directory_entries",
    label: "שותפים מומלצים",
    description: "בתי עלמין, בתי לוויות וארגונים קהילתיים המוצגים בעמוד /partners.",
    titleField: "name",
    orderBy: { column: "sort_order" },
    filter: { column: "kind", value: "partner" },
    fixed: { kind: "partner" },
    fields: directoryFields(),
  },
  {
    key: "suppliers",
    table: "directory_entries",
    label: "ספקים ומחצבות",
    description: "מחצבות, ספקי אבן ומתקינים שותפים המוצגים בעמוד /suppliers ובעמוד הראשי.",
    titleField: "name",
    orderBy: { column: "sort_order" },
    filter: { column: "kind", value: "supplier" },
    fixed: { kind: "supplier" },
    fields: directoryFields(),
  },
  {
    key: "gallery",
    table: "gallery",
    label: "גלריה",
    description: "תמונות עבודות שמוצגות בעמוד העבודות ובעמוד הראשי.",
    titleField: "title",
    orderBy: { column: "sort_order" },
    fields: [
      { name: "title", label: "כותרת", type: "text" },
      { name: "description", label: "תיאור", type: "textarea", span: 2 },
      { name: "image_url", label: "תמונה", type: "image" },
      SORT_FIELD,
      STATUS_FIELD,
    ],
  },
  {
    key: "materials",
    table: "materials",
    label: "חומרים",
    description: "החומרים המוצגים בעמוד הראשי ובעמוד אודות.",
    titleField: "title",
    orderBy: { column: "sort_order" },
    fields: [
      { name: "title", label: "שם החומר", type: "text" },
      { name: "description", label: "תיאור", type: "textarea", span: 2 },
      { name: "features", label: "מאפיינים", type: "textarea", span: 2 },
      { name: "image_url", label: "תמונה", type: "image" },
      { name: "is_visible", label: "מוצג באתר", type: "boolean" },
      SORT_FIELD,
    ],
  },
  {
    key: "services",
    table: "services",
    label: "שירותים",
    description: "רשימת השירותים בעמוד השירותים ובעמוד הראשי.",
    titleField: "title",
    orderBy: { column: "sort_order" },
    fields: [
      { name: "title", label: "שם השירות", type: "text" },
      { name: "description", label: "תיאור", type: "textarea", span: 2 },
      { name: "image_url", label: "תמונה", type: "image" },
      { name: "is_visible", label: "מוצג באתר", type: "boolean" },
      SORT_FIELD,
    ],
  },
  {
    key: "process_steps",
    table: "process_steps",
    label: "תהליך העבודה",
    description: "שלבי התהליך המוצגים בעמוד הראשי.",
    titleField: "title",
    orderBy: { column: "sort_order" },
    fields: [
      { name: "step_number", label: "מספר שלב", type: "text" },
      { name: "title", label: "כותרת", type: "text" },
      { name: "description", label: "תיאור", type: "textarea", span: 2 },
      { name: "is_visible", label: "מוצג באתר", type: "boolean" },
      SORT_FIELD,
    ],
  },
  {
    key: "pages",
    table: "pages",
    label: "עמודי תוכן",
    description: "אודות, פרטיות, תקנון ועמודי תוכן נוספים.",
    titleField: "title",
    orderBy: { column: "slug", ascending: true },
    fields: [
      { name: "slug", label: "כתובת (slug)", type: "text" },
      { name: "title", label: "כותרת", type: "text" },
      { name: "content", label: "תוכן", type: "textarea", span: 2 },
      { name: "image_url", label: "תמונה", type: "image" },
      { name: "seo_title", label: "כותרת SEO", type: "text" },
      { name: "seo_description", label: "תיאור SEO", type: "textarea", span: 2 },
      STATUS_FIELD,
    ],
  },
];