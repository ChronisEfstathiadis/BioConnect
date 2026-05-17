import { pgTable, text, boolean } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";
import { randomUUID } from "crypto";

export const socialLinks = pgTable("social_links", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  profileId: text("profile_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  appear: boolean("appear").default(true).notNull(),
});
