import { 
  type Item, type InsertItem,
  type Inventory, type InsertInventory,
  type Sale, type InsertSale,
  type Expense, type InsertExpense,
  type Borrower, type InsertBorrower,
  type Depositor, type InsertDepositor,
  type OnlinePayment, type InsertOnlinePayment,
  type Employee, type InsertEmployee,
  type Attendance, type InsertAttendance,
  type SalaryPayment, type InsertSalaryPayment,
  type CompanyInfo, type InsertCompanyInfo,
  items, inventory, sales, expenses, borrowers, depositors, 
  onlinePayments, employees, attendance, salaryPayments, companyInfo
} from "@shared/schema";
import { db } from "./database";
import { eq, and, desc, gte, lt } from "drizzle-orm";

export class DbStorage {
  // Items
  async getItems(): Promise<Item[]> {
    return await db.select().from(items);
  }

  async getItem(id: string): Promise<Item | undefined> {
    const result = await db.select().from(items).where(eq(items.id, id));
    return result[0];
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const result = await db.insert(items).values(insertItem).returning();
    const item = result[0];
    
    // Initialize inventory for new item
    await this.createInventory({ itemId: item.id, currentStock: 0 });
    
    return item;
  }

  async updateItem(id: string, updateData: Partial<InsertItem>): Promise<Item | undefined> {
    const result = await db.update(items).set(updateData).where(eq(items.id, id)).returning();
    return result[0];
  }

  async deleteItem(id: string): Promise<boolean> {
    const result = await db.delete(items).where(eq(items.id, id));
    return result.rowCount > 0;
  }

  // Inventory
  async getInventory(): Promise<(Inventory & { item: Item })[]> {
    return await db
      .select()
      .from(inventory)
      .leftJoin(items, eq(inventory.itemId, items.id))
      .then(rows => rows.map(row => ({ ...row.inventory, item: row.items! })));
  }

  async getInventoryByItemId(itemId: string): Promise<Inventory | undefined> {
    const result = await db.select().from(inventory).where(eq(inventory.itemId, itemId));
    return result[0];
  }

  async createInventory(insertInventory: InsertInventory): Promise<Inventory> {
    const result = await db.insert(inventory).values(insertInventory).returning();
    return result[0];
  }

  async updateInventory(itemId: string, currentStock: number): Promise<Inventory | undefined> {
    const result = await db
      .update(inventory)
      .set({ currentStock, lastUpdated: new Date() })
      .where(eq(inventory.itemId, itemId))
      .returning();
    return result[0];
  }

  // Sales
  async getSales(): Promise<(Sale & { item: Item })[]> {
    return await db
      .select()
      .from(sales)
      .leftJoin(items, eq(sales.itemId, items.id))
      .orderBy(desc(sales.date))
      .then(rows => rows.map(row => ({ ...row.sales, item: row.items! })));
  }

  async getSalesByDate(date: string): Promise<(Sale & { item: Item })[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return await db
      .select()
      .from(sales)
      .leftJoin(items, eq(sales.itemId, items.id))
      .where(and(
        gte(sales.date, startDate),
        lt(sales.date, endDate)
      ))
      .then(rows => rows.map(row => ({ ...row.sales, item: row.items! })));
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const result = await db.insert(sales).values(insertSale).returning();
    const sale = result[0];
    
    // Update inventory
    await this.updateInventoryOnSale(insertSale.itemId, insertSale.quantity);
    
    return sale;
  }

  private async updateInventoryOnSale(itemId: string, quantity: number): Promise<void> {
    const currentInventory = await this.getInventoryByItemId(itemId);
    if (currentInventory) {
      const newStock = Math.max(0, (currentInventory.currentStock || 0) - quantity);
      await this.updateInventory(itemId, newStock);
    }
  }

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses).orderBy(desc(expenses.date));
  }

  async getExpensesByDate(date: string): Promise<Expense[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return await db
      .select()
      .from(expenses)
      .where(and(
        gte(expenses.date, startDate),
        lt(expenses.date, endDate)
      ));
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const result = await db.insert(expenses).values(insertExpense).returning();
    return result[0];
  }

  async deleteExpense(id: string): Promise<boolean> {
    const result = await db.delete(expenses).where(eq(expenses.id, id));
    return result.rowCount > 0;
  }

  // Borrowers
  async getBorrowers(): Promise<Borrower[]> {
    return await db.select().from(borrowers).orderBy(desc(borrowers.createdAt));
  }

  async createBorrower(insertBorrower: InsertBorrower): Promise<Borrower> {
    const result = await db.insert(borrowers).values(insertBorrower).returning();
    return result[0];
  }

  async updateBorrowerRepayment(id: string, amount: number): Promise<Borrower | undefined> {
    const borrower = await db.select().from(borrowers).where(eq(borrowers.id, id));
    if (!borrower[0]) return undefined;
    
    const currentRepaid = parseFloat(borrower[0].amountRepaid || "0");
    const newAmount = currentRepaid + amount;
    
    const result = await db
      .update(borrowers)
      .set({ amountRepaid: newAmount.toString() })
      .where(eq(borrowers.id, id))
      .returning();
    return result[0];
  }

  // Depositors
  async getDepositors(): Promise<Depositor[]> {
    return await db.select().from(depositors).orderBy(desc(depositors.date));
  }

  async createDepositor(insertDepositor: InsertDepositor): Promise<Depositor> {
    const result = await db.insert(depositors).values(insertDepositor).returning();
    return result[0];
  }

  async returnDeposit(id: string, amount: number): Promise<Depositor | undefined> {
    const result = await db
      .update(depositors)
      .set({ returned: true, returnedAmount: amount.toString() })
      .where(eq(depositors.id, id))
      .returning();
    return result[0];
  }

  // Online Payments
  async getOnlinePayments(): Promise<OnlinePayment[]> {
    return await db.select().from(onlinePayments).orderBy(desc(onlinePayments.date));
  }

  async getOnlinePaymentsByDate(date: string): Promise<OnlinePayment[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return await db
      .select()
      .from(onlinePayments)
      .where(and(
        gte(onlinePayments.date, startDate),
        lt(onlinePayments.date, endDate)
      ));
  }

  async createOnlinePayment(insertPayment: InsertOnlinePayment): Promise<OnlinePayment> {
    const result = await db.insert(onlinePayments).values(insertPayment).returning();
    return result[0];
  }

  // Employees
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).orderBy(desc(employees.createdAt));
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const result = await db.insert(employees).values(insertEmployee).returning();
    return result[0];
  }

  // Attendance
  async getAttendanceByDate(date: string): Promise<(Attendance & { employee: Employee })[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return await db
      .select()
      .from(attendance)
      .leftJoin(employees, eq(attendance.employeeId, employees.id))
      .where(and(
        gte(attendance.date, startDate),
        lt(attendance.date, endDate)
      ))
      .then(rows => rows.map(row => ({ ...row.attendance, employee: row.employees! })));
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const result = await db.insert(attendance).values(insertAttendance).returning();
    return result[0];
  }

  async updateAttendance(employeeId: string, date: string, present: boolean): Promise<Attendance | undefined> {
    const targetDate = new Date(date);
    
    // Try to update existing record
    const existing = await db
      .select()
      .from(attendance)
      .where(and(
        eq(attendance.employeeId, employeeId),
        eq(attendance.date, targetDate)
      ));
    
    if (existing[0]) {
      const result = await db
        .update(attendance)
        .set({ present })
        .where(eq(attendance.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      // Create new record
      return await this.createAttendance({ employeeId, present, date: targetDate });
    }
  }

  // Salary Payments
  async getSalaryPayments(): Promise<(SalaryPayment & { employee: Employee })[]> {
    return await db
      .select()
      .from(salaryPayments)
      .leftJoin(employees, eq(salaryPayments.employeeId, employees.id))
      .orderBy(desc(salaryPayments.date))
      .then(rows => rows.map(row => ({ ...row.salaryPayments, employee: row.employees! })));
  }

  async createSalaryPayment(insertPayment: InsertSalaryPayment): Promise<SalaryPayment> {
    const result = await db.insert(salaryPayments).values(insertPayment).returning();
    return result[0];
  }

  // Company Info
  async getCompanyInfo(): Promise<CompanyInfo | undefined> {
    const result = await db.select().from(companyInfo).limit(1);
    return result[0];
  }

  async createOrUpdateCompanyInfo(insertInfo: InsertCompanyInfo): Promise<CompanyInfo> {
    const existing = await this.getCompanyInfo();
    
    if (existing) {
      const result = await db
        .update(companyInfo)
        .set({ ...insertInfo, updatedAt: new Date() })
        .where(eq(companyInfo.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(companyInfo).values(insertInfo).returning();
      return result[0];
    }
  }
}

export const storage = new DbStorage();
