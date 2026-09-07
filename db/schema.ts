import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const contentItems = sqliteTable("content_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  date: text("date").notNull().default(""),
  url: text("url").notNull().default(""),
  imageKey: text("image_key").notNull().default(""),
  language: text("language").notNull().default(""),
  position: integer("position").notNull().default(0),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});
