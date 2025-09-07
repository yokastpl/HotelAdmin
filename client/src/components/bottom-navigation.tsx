import { Link, useLocation } from "wouter";
import { Home, ShoppingCart, Package, TrendingUp, MoreHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PlusCircle, Receipt, Users, Building2, Smartphone, CreditCard, Calendar } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/sales", icon: ShoppingCart, label: "Sales" },
  { path: "/inventory", icon: Package, label: "Stock" },
  { path: "/daily-account", icon: TrendingUp, label: "Reports" },
];

const moreItems = [
  { path: "/add-items", icon: PlusCircle, label: "Add Items", color: "text-primary" },
  { path: "/expenses", icon: Receipt, label: "Expenses", color: "text-destructive" },
  { path: "/borrowers", icon: Users, label: "Borrowers", color: "text-warning" },
  { path: "/depositors", icon: Building2, label: "Depositors", color: "text-success" },
  { path: "/online-payments", icon: Smartphone, label: "Online Payments", color: "text-info" },
  { path: "/employees", icon: Users, label: "Employees", color: "text-secondary" },
  { path: "/daily-inventory", icon: Calendar, label: "Daily Inventory", color: "text-info" },
  { path: "/company-info", icon: Building2, label: "Company Info", color: "text-primary" },
];

export default function BottomNavigation() {
  const [location] = useLocation();

  return (
    <nav className="bottom-nav">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex">
          {navItems.map((item) => (
            <div key={item.path} className="nav-item">
              <Link href={item.path}>
                <div className={`nav-link ${location === item.path ? 'active' : ''}`} data-testid={`nav-${item.label.toLowerCase()}`}>
                  <item.icon className="w-6 h-6" />
                  <span>{item.label}</span>
                </div>
              </Link>
            </div>
          ))}
          <div className="nav-item">
            <Sheet>
              <SheetTrigger asChild>
                <div className="nav-link" data-testid="nav-more">
                  <MoreHorizontal className="w-6 h-6" />
                  <span>More</span>
                </div>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto">
                <SheetHeader>
                  <SheetTitle>All Modules</SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-1 gap-2 mt-4">
                  {moreItems.map((item) => (
                    <Link key={item.path} href={item.path}>
                      <Button variant="ghost" className="w-full justify-start h-12" data-testid={`button-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                        <item.icon className={`w-5 h-5 mr-3 ${item.color}`} />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
