import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";

export const profiles = pgTable("profiles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatarUrl: text("avatar_url"),
  email: text("email").notNull(),
  phone: text("phone"),
});
