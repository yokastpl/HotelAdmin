
-- Hotel Management System Database Schema

-- Items table
CREATE TABLE items (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    category TEXT DEFAULT 'other',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Inventory table
CREATE TABLE inventory (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id VARCHAR REFERENCES items(id) NOT NULL,
    current_stock INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Sales table
CREATE TABLE sales (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id VARCHAR REFERENCES items(id) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    customer_name TEXT,
    date TIMESTAMP DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT DEFAULT 'other',
    date TIMESTAMP DEFAULT NOW()
);

-- Borrowers table
CREATE TABLE borrowers (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    amount_borrowed DECIMAL(10,2) NOT NULL,
    amount_repaid DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Depositors table
CREATE TABLE depositors (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    purpose TEXT,
    returned BOOLEAN DEFAULT false,
    returned_amount DECIMAL(10,2) DEFAULT 0,
    date TIMESTAMP DEFAULT NOW()
);

-- Online Payments table
CREATE TABLE online_payments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(10,2) NOT NULL,
    method TEXT NOT NULL,
    transaction_ref TEXT,
    date TIMESTAMP DEFAULT NOW()
);

-- Employees table
CREATE TABLE employees (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    position TEXT,
    daily_pay DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Attendance table
CREATE TABLE attendance (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR REFERENCES employees(id) NOT NULL,
    date TIMESTAMP DEFAULT NOW(),
    present BOOLEAN DEFAULT true
);

-- Salary Payments table
CREATE TABLE salary_payments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR REFERENCES employees(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    date TIMESTAMP DEFAULT NOW()
);

-- Company Info table
CREATE TABLE company_info (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    gst_number TEXT,
    logo TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);
