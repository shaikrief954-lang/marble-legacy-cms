import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_visible: boolean;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  price: number | null;
  show_price: boolean;
  price_on_request: boolean;
  main_image_url: string | null;
  material: string | null;
  dimensions: string | null;
  color: string | null;
  location: string | null;
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  seo_image_url: string | null;
  status: string;
  is_featured: boolean;
  sort_order: number;
};

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

export const siteContentQuery = queryOptions({
  queryKey: ["site-content"],
  staleTime: 60_000,
  queryFn: async () => {
    const [texts, settings] = await Promise.all([
      supabase.from("site_texts").select("key,value_he,value_fr,value_en,group_name,label"),
      supabase.from("site_settings").select("key,value"),
    ]);
    if (texts.error) throw new Error(texts.error.message);
    if (settings.error) throw new Error(settings.error.message);
    const t: Record<string, string> = {};
    for (const row of texts.data ?? []) t[row.key] = row.value_he ?? "";
    const s: Record<string, string> = {};
    for (const row of settings.data ?? []) s[row.key] = row.value ?? "";
    return { texts: t, settings: s };
  },
});

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  staleTime: 60_000,
  queryFn: async () =>
    unwrap<Category[]>(
      await supabase
        .from("categories")
        .select("id,name,slug,description,image_url,sort_order,is_visible")
        .order("sort_order", { ascending: true }),
    ),
});

export const productsQuery = (categorySlug?: string) =>
  queryOptions({
    queryKey: ["products", categorySlug ?? "all"],
    staleTime: 30_000,
    queryFn: async () => {
      let categoryId: string | null = null;
      if (categorySlug) {
        const cat = await supabase.from("categories").select("id").eq("slug", categorySlug).maybeSingle();
        categoryId = cat.data?.id ?? null;
      }
      let q = supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (categoryId) q = q.eq("category_id", categoryId);
      return unwrap<Product[]>(await q);
    },
  });

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return null;
      const images = await supabase
        .from("product_images")
        .select("id,image_url,alt_text,sort_order")
        .eq("product_id", data.id)
        .order("sort_order", { ascending: true });
      return { product: data as Product, images: images.data ?? [] };
    },
  });

export const servicesQuery = queryOptions({
  queryKey: ["services"],
  staleTime: 60_000,
  queryFn: async () =>
    unwrap<{ id: string; title: string; description: string | null; image_url: string | null; icon: string | null }[]>(
      await supabase
        .from("services")
        .select("id,title,description,image_url,icon,sort_order,is_visible")
        .order("sort_order", { ascending: true }),
    ),
});

export const materialsQuery = queryOptions({
  queryKey: ["materials"],
  staleTime: 60_000,
  queryFn: async () =>
    unwrap<{ id: string; title: string; description: string | null; features: string | null; image_url: string | null }[]>(
      await supabase
        .from("materials")
        .select("id,title,description,features,image_url,sort_order,is_visible")
        .order("sort_order", { ascending: true }),
    ),
});

export const processQuery = queryOptions({
  queryKey: ["process"],
  staleTime: 60_000,
  queryFn: async () =>
    unwrap<{ id: string; step_number: string; title: string; description: string | null }[]>(
      await supabase
        .from("process_steps")
        .select("id,step_number,title,description,sort_order,is_visible")
        .order("sort_order", { ascending: true }),
    ),
});

export const galleryQuery = queryOptions({
  queryKey: ["gallery"],
  staleTime: 30_000,
  queryFn: async () =>
    unwrap<
      { id: string; title: string | null; description: string | null; image_url: string; category_id: string | null }[]
    >(
      await supabase
        .from("gallery")
        .select("id,title,description,image_url,category_id,sort_order,status")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
    ),
});

export const pageQuery = (slug: string) =>
  queryOptions({
    queryKey: ["page", slug],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("slug,title,content,image_url,seo_title,seo_description,seo_image_url,status")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });
