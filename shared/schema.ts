import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const items = pgTable("items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }).notNull(),
  category: text("category").default("other"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: varchar("item_id").references(() => items.id).notNull(),
  currentStock: integer("current_stock").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: varchar("item_id").references(() => items.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  customerName: text("customer_name"),
  date: timestamp("date").defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").default("other"),
  date: timestamp("date").defaultNow(),
});

export const borrowers = pgTable("borrowers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone"),
  amountBorrowed: decimal("amount_borrowed", { precision: 10, scale: 2 }).notNull(),
  amountRepaid: decimal("amount_repaid", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const depositors = pgTable("depositors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  purpose: text("purpose"),
  returned: boolean("returned").default(false),
  returnedAmount: decimal("returned_amount", { precision: 10, scale: 2 }).default("0"),
  date: timestamp("date").defaultNow(),
});

export const onlinePayments = pgTable("online_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(),
  transactionRef: text("transaction_ref"),
  date: timestamp("date").defaultNow(),
});

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  position: text("position"),
  dailyPay: decimal("daily_pay", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id).notNull(),
  date: timestamp("date").defaultNow(),
  present: boolean("present").default(true),
});

export const salaryPayments = pgTable("salary_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  date: timestamp("date").defaultNow(),
});

export const companyInfo = pgTable("company_info", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  gstNumber: text("gst_number"),
  logo: text("logo"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertItemSchema = createInsertSchema(items).omit({ id: true, createdAt: true });
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true, lastUpdated: true });
export const insertSaleSchema = createInsertSchema(sales).omit({ id: true, date: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, date: true });
export const insertBorrowerSchema = createInsertSchema(borrowers).omit({ id: true, createdAt: true, amountRepaid: true });
export const insertDepositorSchema = createInsertSchema(depositors).omit({ id: true, date: true, returned: true, returnedAmount: true });
export const insertOnlinePaymentSchema = createInsertSchema(onlinePayments).omit({ id: true, date: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, createdAt: true });
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true, date: true });
export const insertSalaryPaymentSchema = createInsertSchema(salaryPayments).omit({ id: true, date: true });
export const insertCompanyInfoSchema = createInsertSchema(companyInfo).omit({ id: true, updatedAt: true });

// Types
export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Borrower = typeof borrowers.$inferSelect;
export type InsertBorrower = z.infer<typeof insertBorrowerSchema>;
export type Depositor = typeof depositors.$inferSelect;
export type InsertDepositor = z.infer<typeof insertDepositorSchema>;
export type OnlinePayment = typeof onlinePayments.$inferSelect;
export type InsertOnlinePayment = z.infer<typeof insertOnlinePaymentSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type SalaryPayment = typeof salaryPayments.$inferSelect;
export type InsertSalaryPayment = z.infer<typeof insertSalaryPaymentSchema>;
export type CompanyInfo = typeof companyInfo.$inferSelect;
export type InsertCompanyInfo = z.infer<typeof insertCompanyInfoSchema>;
