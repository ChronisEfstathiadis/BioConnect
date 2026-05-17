import { pgTable, text, boolean, integer } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { randomUUID } from "crypto";

export const services = pgTable("services", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  profileId: text("profile_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0).notNull(),
  appear: boolean("appear").default(true).notNull(),
});
