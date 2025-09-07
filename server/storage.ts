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
  type CompanyInfo, type InsertCompanyInfo
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Items
  getItems(): Promise<Item[]>;
  getItem(id: string): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: string, item: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: string): Promise<boolean>;

  // Inventory
  getInventory(): Promise<(Inventory & { item: Item })[]>;
  getInventoryByItemId(itemId: string): Promise<Inventory | undefined>;
  createInventory(inventory: InsertInventory): Promise<Inventory>;
  updateInventory(itemId: string, currentStock: number): Promise<Inventory | undefined>;

  // Sales
  getSales(): Promise<(Sale & { item: Item })[]>;
  getSalesByDate(date: string): Promise<(Sale & { item: Item })[]>;
  createSale(sale: InsertSale): Promise<Sale>;

  // Expenses
  getExpenses(): Promise<Expense[]>;
  getExpensesByDate(date: string): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  deleteExpense(id: string): Promise<boolean>;

  // Borrowers
  getBorrowers(): Promise<Borrower[]>;
  createBorrower(borrower: InsertBorrower): Promise<Borrower>;
  updateBorrowerRepayment(id: string, amount: number): Promise<Borrower | undefined>;

  // Depositors
  getDepositors(): Promise<Depositor[]>;
  createDepositor(depositor: InsertDepositor): Promise<Depositor>;
  returnDeposit(id: string, amount: number): Promise<Depositor | undefined>;

  // Online Payments
  getOnlinePayments(): Promise<OnlinePayment[]>;
  getOnlinePaymentsByDate(date: string): Promise<OnlinePayment[]>;
  createOnlinePayment(payment: InsertOnlinePayment): Promise<OnlinePayment>;

  // Employees
  getEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  
  // Attendance
  getAttendanceByDate(date: string): Promise<(Attendance & { employee: Employee })[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(employeeId: string, date: string, present: boolean): Promise<Attendance | undefined>;

  // Salary Payments
  getSalaryPayments(): Promise<(SalaryPayment & { employee: Employee })[]>;
  createSalaryPayment(payment: InsertSalaryPayment): Promise<SalaryPayment>;

  // Company Info
  getCompanyInfo(): Promise<CompanyInfo | undefined>;
  createOrUpdateCompanyInfo(info: InsertCompanyInfo): Promise<CompanyInfo>;
}

export class MemStorage implements IStorage {
  private items: Map<string, Item> = new Map();
  private inventory: Map<string, Inventory> = new Map();
  private sales: Map<string, Sale> = new Map();
  private expenses: Map<string, Expense> = new Map();
  private borrowers: Map<string, Borrower> = new Map();
  private depositors: Map<string, Depositor> = new Map();
  private onlinePayments: Map<string, OnlinePayment> = new Map();
  private employees: Map<string, Employee> = new Map();
  private attendance: Map<string, Attendance> = new Map();
  private salaryPayments: Map<string, SalaryPayment> = new Map();
  private companyInfo: CompanyInfo | undefined;

  // Items
  async getItems(): Promise<Item[]> {
    return Array.from(this.items.values());
  }

  async getItem(id: string): Promise<Item | undefined> {
    return this.items.get(id);
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const id = randomUUID();
    const item: Item = {
      ...insertItem,
      id,
      category: insertItem.category || null,
      createdAt: new Date(),
    };
    this.items.set(id, item);
    
    // Initialize inventory for new item
    await this.createInventory({ itemId: id, currentStock: 0 });
    
    return item;
  }

  async updateItem(id: string, updateData: Partial<InsertItem>): Promise<Item | undefined> {
    const item = this.items.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...updateData };
    this.items.set(id, updatedItem);
    return updatedItem;
  }

  async deleteItem(id: string): Promise<boolean> {
    const deleted = this.items.delete(id);
    if (deleted) {
      // Also delete associated inventory
      for (const [key, inv] of this.inventory.entries()) {
        if (inv.itemId === id) {
          this.inventory.delete(key);
          break;
        }
      }
    }
    return deleted;
  }

  // Inventory
  async getInventory(): Promise<(Inventory & { item: Item })[]> {
    const result: (Inventory & { item: Item })[] = [];
    for (const inv of this.inventory.values()) {
      const item = this.items.get(inv.itemId);
      if (item) {
        result.push({ ...inv, item });
      }
    }
    return result;
  }

  async getInventoryByItemId(itemId: string): Promise<Inventory | undefined> {
    return Array.from(this.inventory.values()).find(inv => inv.itemId === itemId);
  }

  async createInventory(insertInventory: InsertInventory): Promise<Inventory> {
    const id = randomUUID();
    const inventory: Inventory = {
      ...insertInventory,
      id,
      currentStock: insertInventory.currentStock || 0,
      lastUpdated: new Date(),
    };
    this.inventory.set(id, inventory);
    return inventory;
  }

  async updateInventory(itemId: string, currentStock: number): Promise<Inventory | undefined> {
    for (const [key, inv] of this.inventory.entries()) {
      if (inv.itemId === itemId) {
        const updated = { ...inv, currentStock, lastUpdated: new Date() };
        this.inventory.set(key, updated);
        return updated;
      }
    }
    return undefined;
  }

  // Sales
  async getSales(): Promise<(Sale & { item: Item })[]> {
    const result: (Sale & { item: Item })[] = [];
    for (const sale of this.sales.values()) {
      const item = this.items.get(sale.itemId);
      if (item) {
        result.push({ ...sale, item });
      }
    }
    return result.sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
  }

  async getSalesByDate(date: string): Promise<(Sale & { item: Item })[]> {
    const targetDate = new Date(date).toDateString();
    const result: (Sale & { item: Item })[] = [];
    
    for (const sale of this.sales.values()) {
      if (new Date(sale.date!).toDateString() === targetDate) {
        const item = this.items.get(sale.itemId);
        if (item) {
          result.push({ ...sale, item });
        }
      }
    }
    return result;
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const id = randomUUID();
    const sale: Sale = {
      ...insertSale,
      id,
      customerName: insertSale.customerName || null,
      date: new Date(),
    };
    this.sales.set(id, sale);
    
    // Update inventory
    await this.updateInventoryOnSale(insertSale.itemId, insertSale.quantity);
    
    return sale;
  }

  private async updateInventoryOnSale(itemId: string, quantity: number): Promise<void> {
    const inventory = await this.getInventoryByItemId(itemId);
    if (inventory) {
      const newStock = Math.max(0, (inventory.currentStock || 0) - quantity);
      await this.updateInventory(itemId, newStock);
    }
  }

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values()).sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
  }

  async getExpensesByDate(date: string): Promise<Expense[]> {
    const targetDate = new Date(date).toDateString();
    return Array.from(this.expenses.values()).filter(
      expense => new Date(expense.date!).toDateString() === targetDate
    );
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = randomUUID();
    const expense: Expense = {
      ...insertExpense,
      id,
      category: insertExpense.category || null,
      date: new Date(),
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async deleteExpense(id: string): Promise<boolean> {
    return this.expenses.delete(id);
  }

  // Borrowers
  async getBorrowers(): Promise<Borrower[]> {
    return Array.from(this.borrowers.values()).sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createBorrower(insertBorrower: InsertBorrower): Promise<Borrower> {
    const id = randomUUID();
    const borrower: Borrower = {
      ...insertBorrower,
      id,
      phone: insertBorrower.phone || null,
      amountRepaid: "0",
      createdAt: new Date(),
    };
    this.borrowers.set(id, borrower);
    return borrower;
  }

  async updateBorrowerRepayment(id: string, amount: number): Promise<Borrower | undefined> {
    const borrower = this.borrowers.get(id);
    if (!borrower) return undefined;
    
    const currentRepaid = parseFloat(borrower.amountRepaid || "0");
    const updatedBorrower = {
      ...borrower,
      amountRepaid: (currentRepaid + amount).toString(),
    };
    this.borrowers.set(id, updatedBorrower);
    return updatedBorrower;
  }

  // Depositors
  async getDepositors(): Promise<Depositor[]> {
    return Array.from(this.depositors.values()).sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
  }

  async createDepositor(insertDepositor: InsertDepositor): Promise<Depositor> {
    const id = randomUUID();
    const depositor: Depositor = {
      ...insertDepositor,
      id,
      purpose: insertDepositor.purpose || null,
      returned: false,
      returnedAmount: "0",
      date: new Date(),
    };
    this.depositors.set(id, depositor);
    return depositor;
  }

  async returnDeposit(id: string, amount: number): Promise<Depositor | undefined> {
    const depositor = this.depositors.get(id);
    if (!depositor) return undefined;
    
    const updatedDepositor = {
      ...depositor,
      returned: true,
      returnedAmount: amount.toString(),
    };
    this.depositors.set(id, updatedDepositor);
    return updatedDepositor;
  }

  // Online Payments
  async getOnlinePayments(): Promise<OnlinePayment[]> {
    return Array.from(this.onlinePayments.values()).sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
  }

  async getOnlinePaymentsByDate(date: string): Promise<OnlinePayment[]> {
    const targetDate = new Date(date).toDateString();
    return Array.from(this.onlinePayments.values()).filter(
      payment => new Date(payment.date!).toDateString() === targetDate
    );
  }

  async createOnlinePayment(insertPayment: InsertOnlinePayment): Promise<OnlinePayment> {
    const id = randomUUID();
    const payment: OnlinePayment = {
      ...insertPayment,
      id,
      transactionRef: insertPayment.transactionRef || null,
      date: new Date(),
    };
    this.onlinePayments.set(id, payment);
    return payment;
  }

  // Employees
  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values()).sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const employee: Employee = {
      ...insertEmployee,
      id,
      position: insertEmployee.position || null,
      createdAt: new Date(),
    };
    this.employees.set(id, employee);
    return employee;
  }

  // Attendance
  async getAttendanceByDate(date: string): Promise<(Attendance & { employee: Employee })[]> {
    const targetDate = new Date(date).toDateString();
    const result: (Attendance & { employee: Employee })[] = [];
    
    for (const att of this.attendance.values()) {
      if (new Date(att.date!).toDateString() === targetDate) {
        const employee = this.employees.get(att.employeeId);
        if (employee) {
          result.push({ ...att, employee });
        }
      }
    }
    return result;
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = randomUUID();
    const attendance: Attendance = {
      ...insertAttendance,
      id,
      present: insertAttendance.present !== undefined ? insertAttendance.present : true,
      date: new Date(),
    };
    this.attendance.set(id, attendance);
    return attendance;
  }

  async updateAttendance(employeeId: string, date: string, present: boolean): Promise<Attendance | undefined> {
    const targetDate = new Date(date).toDateString();
    
    for (const [key, att] of this.attendance.entries()) {
      if (att.employeeId === employeeId && new Date(att.date!).toDateString() === targetDate) {
        const updated = { ...att, present };
        this.attendance.set(key, updated);
        return updated;
      }
    }
    
    // Create new attendance record if doesn't exist
    return await this.createAttendance({ employeeId, present });
  }

  // Salary Payments
  async getSalaryPayments(): Promise<(SalaryPayment & { employee: Employee })[]> {
    const result: (SalaryPayment & { employee: Employee })[] = [];
    for (const payment of this.salaryPayments.values()) {
      const employee = this.employees.get(payment.employeeId);
      if (employee) {
        result.push({ ...payment, employee });
      }
    }
    return result.sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
  }

  async createSalaryPayment(insertPayment: InsertSalaryPayment): Promise<SalaryPayment> {
    const id = randomUUID();
    const payment: SalaryPayment = {
      ...insertPayment,
      id,
      date: new Date(),
    };
    this.salaryPayments.set(id, payment);
    return payment;
  }

  // Company Info
  async getCompanyInfo(): Promise<CompanyInfo | undefined> {
    return this.companyInfo;
  }

  async createOrUpdateCompanyInfo(insertInfo: InsertCompanyInfo): Promise<CompanyInfo> {
    if (this.companyInfo) {
      this.companyInfo = {
        ...this.companyInfo,
        ...insertInfo,
        updatedAt: new Date(),
      };
    } else {
      const id = randomUUID();
      this.companyInfo = {
        ...insertInfo,
        id,
        address: insertInfo.address || null,
        phone: insertInfo.phone || null,
        email: insertInfo.email || null,
        gstNumber: insertInfo.gstNumber || null,
        logo: insertInfo.logo || null,
        updatedAt: new Date(),
      };
    }
    return this.companyInfo;
  }
}

// Use database storage instead of memory storage
import { storage as dbStorage } from "./db-storage";
export const storage = dbStorage;
