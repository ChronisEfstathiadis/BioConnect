import { pgTable, text, boolean } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { randomUUID } from "crypto";

export const jobs = pgTable("jobs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  profileId: text("profile_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  appear: boolean("appear").default(true).notNull(),
});
