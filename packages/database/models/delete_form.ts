import { pgTable, uuid, timestamp, text, jsonb, pgEnum } from "drizzle-orm/pg-core";

export const entityTypeEnum = pgEnum("entity_type_enum", ["FORM", "FORM_FIELD"]);

export const deletedFormsTable = pgTable("deleted_forms", {
  id: uuid("id").primaryKey().defaultRandom(),

  entityType: entityTypeEnum("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  formId: uuid("form_id"),
  data: jsonb("data").notNull(),

  deletedBy: uuid("deleted_by"),

  createdAt: timestamp("created_at").defaultNow(),
});
