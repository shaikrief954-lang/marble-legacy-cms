import { supabase } from "@/integrations/supabase/client";

export type Row = Record<string, unknown>;
export type DbError = { message: string } | null;

type Query = PromiseLike<{ data: Row[] | null; error: DbError }> & {
  order(column: string, options?: { ascending?: boolean }): Query;
  eq(column: string, value: unknown): Query;
};

type Mutation = PromiseLike<{ error: DbError }> & {
  eq(column: string, value: unknown): PromiseLike<{ error: DbError }>;
};

type GenericTable = {
  select(columns?: string): Query;
  insert(values: Row): PromiseLike<{ error: DbError }>;
  upsert(values: Row, options?: { onConflict?: string }): PromiseLike<{ error: DbError }>;
  update(values: Row): Mutation;
  delete(): Mutation;
};

/** Loosely typed table accessor for the generic admin CRUD screens. */
export function table(name: string): GenericTable {
  return supabase.from(name as "products") as unknown as GenericTable;
}