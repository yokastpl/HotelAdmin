import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertItemSchema, insertSaleSchema, insertExpenseSchema, 
  insertBorrowerSchema, insertDepositorSchema, insertOnlinePaymentSchema,
  insertEmployeeSchema, insertAttendanceSchema, insertSalaryPaymentSchema,
  insertCompanyInfoSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Items routes
  app.get("/api/items", async (req, res) => {
    try {
      const items = await storage.getItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  app.post("/api/items", async (req, res) => {
    try {
      const validatedData = insertItemSchema.parse(req.body);
      const item = await storage.createItem(validatedData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid item data" });
    }
  });

  app.put("/api/items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertItemSchema.partial().parse(req.body);
      const item = await storage.updateItem(id, validatedData);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid item data" });
    }
  });

  app.delete("/api/items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteItem(id);
      if (!deleted) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json({ message: "Item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", async (req, res) => {
    try {
      const inventory = await storage.getInventory();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.put("/api/inventory/:itemId", async (req, res) => {
    try {
      const { itemId } = req.params;
      const { currentStock } = req.body;
      const inventory = await storage.updateInventory(itemId, currentStock);
      if (!inventory) {
        return res.status(404).json({ message: "Inventory not found" });
      }
      res.json(inventory);
    } catch (error) {
      res.status(400).json({ message: "Invalid inventory data" });
    }
  });

  // Sales routes
  app.get("/api/sales", async (req, res) => {
    try {
      const { date } = req.query;
      let sales;
      if (date) {
        sales = await storage.getSalesByDate(date as string);
      } else {
        sales = await storage.getSales();
      }
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const validatedData = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(validatedData);
      res.json(sale);
    } catch (error) {
      res.status(400).json({ message: "Invalid sale data" });
    }
  });

  // Expenses routes
  app.get("/api/expenses", async (req, res) => {
    try {
      const { date } = req.query;
      let expenses;
      if (date) {
        expenses = await storage.getExpensesByDate(date as string);
      } else {
        expenses = await storage.getExpenses();
      }
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(validatedData);
      res.json(expense);
    } catch (error) {
      res.status(400).json({ message: "Invalid expense data" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteExpense(id);
      if (!deleted) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json({ message: "Expense deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Borrowers routes
  app.get("/api/borrowers", async (req, res) => {
    try {
      const borrowers = await storage.getBorrowers();
      res.json(borrowers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch borrowers" });
    }
  });

  app.post("/api/borrowers", async (req, res) => {
    try {
      const validatedData = insertBorrowerSchema.parse(req.body);
      const borrower = await storage.createBorrower(validatedData);
      res.json(borrower);
    } catch (error) {
      res.status(400).json({ message: "Invalid borrower data" });
    }
  });

  app.put("/api/borrowers/:id/repay", async (req, res) => {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      const borrower = await storage.updateBorrowerRepayment(id, amount);
      if (!borrower) {
        return res.status(404).json({ message: "Borrower not found" });
      }
      res.json(borrower);
    } catch (error) {
      res.status(400).json({ message: "Invalid repayment data" });
    }
  });

  // Depositors routes
  app.get("/api/depositors", async (req, res) => {
    try {
      const depositors = await storage.getDepositors();
      res.json(depositors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch depositors" });
    }
  });

  app.post("/api/depositors", async (req, res) => {
    try {
      const validatedData = insertDepositorSchema.parse(req.body);
      const depositor = await storage.createDepositor(validatedData);
      res.json(depositor);
    } catch (error) {
      res.status(400).json({ message: "Invalid depositor data" });
    }
  });

  app.put("/api/depositors/:id/return", async (req, res) => {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      const depositor = await storage.returnDeposit(id, amount);
      if (!depositor) {
        return res.status(404).json({ message: "Depositor not found" });
      }
      res.json(depositor);
    } catch (error) {
      res.status(400).json({ message: "Invalid return data" });
    }
  });

  // Online Payments routes
  app.get("/api/online-payments", async (req, res) => {
    try {
      const { date } = req.query;
      let payments;
      if (date) {
        payments = await storage.getOnlinePaymentsByDate(date as string);
      } else {
        payments = await storage.getOnlinePayments();
      }
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch online payments" });
    }
  });

  app.post("/api/online-payments", async (req, res) => {
    try {
      const validatedData = insertOnlinePaymentSchema.parse(req.body);
      const payment = await storage.createOnlinePayment(validatedData);
      res.json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  // Employees routes
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.json(employee);
    } catch (error) {
      res.status(400).json({ message: "Invalid employee data" });
    }
  });

  // Attendance routes
  app.get("/api/attendance", async (req, res) => {
    try {
      const { date } = req.query;
      const targetDate = date ? date as string : new Date().toISOString().split('T')[0];
      const attendance = await storage.getAttendanceByDate(targetDate);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.put("/api/attendance/:employeeId", async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { date, present } = req.body;
      const targetDate = date || new Date().toISOString().split('T')[0];
      const attendance = await storage.updateAttendance(employeeId, targetDate, present);
      if (!attendance) {
        return res.status(404).json({ message: "Attendance not found" });
      }
      res.json(attendance);
    } catch (error) {
      res.status(400).json({ message: "Invalid attendance data" });
    }
  });

  // Salary Payments routes
  app.get("/api/salary-payments", async (req, res) => {
    try {
      const payments = await storage.getSalaryPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch salary payments" });
    }
  });

  app.post("/api/salary-payments", async (req, res) => {
    try {
      const validatedData = insertSalaryPaymentSchema.parse(req.body);
      const payment = await storage.createSalaryPayment(validatedData);
      res.json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid salary payment data" });
    }
  });

  // Company Info routes
  app.get("/api/company-info", async (req, res) => {
    try {
      const info = await storage.getCompanyInfo();
      res.json(info);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company info" });
    }
  });

  app.post("/api/company-info", async (req, res) => {
    try {
      const validatedData = insertCompanyInfoSchema.parse(req.body);
      const info = await storage.createOrUpdateCompanyInfo(validatedData);
      res.json(info);
    } catch (error) {
      res.status(400).json({ message: "Invalid company info data" });
    }
  });

  // Health check route
  app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

  // Daily account summary route
  app.get("/api/daily-account", async (req, res) => {
    try {
      const { date } = req.query;
      const targetDate = date ? date as string : new Date().toISOString().split('T')[0];
      
      const [sales, expenses, onlinePayments] = await Promise.all([
        storage.getSalesByDate(targetDate),
        storage.getExpensesByDate(targetDate),
        storage.getOnlinePaymentsByDate(targetDate)
      ]);

      const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
      const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      const totalOnlinePayments = onlinePayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      const netCash = totalSales - totalExpenses - totalOnlinePayments;

      res.json({
        date: targetDate,
        totalSales,
        totalExpenses,
        totalOnlinePayments,
        netCash,
        salesBreakdown: sales,
        expensesBreakdown: expenses,
        onlinePaymentsBreakdown: onlinePayments
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch daily account" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
