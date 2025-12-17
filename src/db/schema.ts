import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core"

export const places = sqliteTable("places", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  fulfilled: integer("fulfilled").notNull().default(0),
  toBeFulfilled: integer("toBeFulfilled").notNull(),
})
