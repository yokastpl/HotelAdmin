import { apiRequest } from "@/lib/queryClient";

export const api = {
  // Items
  getItems: () => fetch("/api/items").then(res => res.json()),
  createItem: (data: any) => apiRequest("POST", "/api/items", data),
  updateItem: (id: string, data: any) => apiRequest("PUT", `/api/items/${id}`, data),
  deleteItem: (id: string) => apiRequest("DELETE", `/api/items/${id}`),

  // Inventory
  getInventory: () => fetch("/api/inventory").then(res => res.json()),
  updateInventory: (itemId: string, currentStock: number) => 
    apiRequest("PUT", `/api/inventory/${itemId}`, { currentStock }),

  // Sales
  getSales: (date?: string) => {
    const url = date ? `/api/sales?date=${date}` : "/api/sales";
    return fetch(url).then(res => res.json());
  },
  createSale: (data: any) => apiRequest("POST", "/api/sales", data),

  // Expenses
  getExpenses: (date?: string) => {
    const url = date ? `/api/expenses?date=${date}` : "/api/expenses";
    return fetch(url).then(res => res.json());
  },
  createExpense: (data: any) => apiRequest("POST", "/api/expenses", data),
  deleteExpense: (id: string) => apiRequest("DELETE", `/api/expenses/${id}`),

  // Borrowers
  getBorrowers: () => fetch("/api/borrowers").then(res => res.json()),
  createBorrower: (data: any) => apiRequest("POST", "/api/borrowers", data),
  repayBorrower: (id: string, amount: number) => 
    apiRequest("PUT", `/api/borrowers/${id}/repay`, { amount }),

  // Depositors
  getDepositors: () => fetch("/api/depositors").then(res => res.json()),
  createDepositor: (data: any) => apiRequest("POST", "/api/depositors", data),
  returnDeposit: (id: string, amount: number) => 
    apiRequest("PUT", `/api/depositors/${id}/return`, { amount }),

  // Online Payments
  getOnlinePayments: (date?: string) => {
    const url = date ? `/api/online-payments?date=${date}` : "/api/online-payments";
    return fetch(url).then(res => res.json());
  },
  createOnlinePayment: (data: any) => apiRequest("POST", "/api/online-payments", data),

  // Employees
  getEmployees: () => fetch("/api/employees").then(res => res.json()),
  createEmployee: (data: any) => apiRequest("POST", "/api/employees", data),

  // Attendance
  getAttendance: (date?: string) => {
    const url = date ? `/api/attendance?date=${date}` : "/api/attendance";
    return fetch(url).then(res => res.json());
  },
  updateAttendance: (employeeId: string, present: boolean, date?: string) => 
    apiRequest("PUT", `/api/attendance/${employeeId}`, { present, date }),

  // Salary Payments
  getSalaryPayments: () => fetch("/api/salary-payments").then(res => res.json()),
  createSalaryPayment: (data: any) => apiRequest("POST", "/api/salary-payments", data),

  // Company Info
  getCompanyInfo: () => fetch("/api/company-info").then(res => res.json()),
  updateCompanyInfo: (data: any) => apiRequest("POST", "/api/company-info", data),

  // Daily Account
  getDailyAccount: (date?: string) => {
    const url = date ? `/api/daily-account?date=${date}` : "/api/daily-account";
    return fetch(url).then(res => res.json());
  },

  // Daily Balances
  getDailyBalance: (date: string) => fetch(`/api/daily-balances/${date}`).then(res => res.json()),
  createDailyBalance: (data: any) => apiRequest("POST", "/api/daily-balances", data),
  closeDailyBalance: (date: string, closingBalance: number) => 
    apiRequest("PUT", `/api/daily-balances/${date}/close`, { closingBalance }),

  // Daily Inventory
  getDailyInventory: (date: string) => fetch(`/api/daily-inventory/${date}`).then(res => res.json()),
  createDailyInventorySnapshot: (data: any) => apiRequest("POST", "/api/daily-inventory", data),
  closeDailyInventorySnapshot: (date: string, itemId: string, closingStock: number) => 
    apiRequest("PUT", `/api/daily-inventory/${date}/close`, { itemId, closingStock }),

  // Daily Reset
  resetDailyData: (date?: string) => apiRequest("POST", "/api/daily/reset", { date }),

  // Delete operations
  deleteBorrower: (id: string) => apiRequest("DELETE", `/api/borrowers/${id}`),
  deleteDepositor: (id: string) => apiRequest("DELETE", `/api/depositors/${id}`),
  deleteOnlinePayment: (id: string) => apiRequest("DELETE", `/api/online-payments/${id}`),
};
