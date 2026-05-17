import { pgTable, text, boolean, integer } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { profiles } from "./profiles";

export const projects = pgTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  profileId: text("profile_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  projectLink: text("project_link"),
  sortOrder: integer("sort_order").default(0).notNull(),
  appear: boolean("appear").default(true).notNull(),
});
