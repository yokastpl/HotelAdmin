import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import AddItems from "@/pages/add-items";
import Inventory from "@/pages/inventory";
import Sales from "@/pages/sales";
import DailyAccount from "@/pages/daily-account";
import Expenses from "@/pages/expenses";
import Borrowers from "@/pages/borrowers";
import Depositors from "@/pages/depositors";
import OnlinePayments from "@/pages/online-payments";
import Employees from "@/pages/employees";
import CompanyInfo from "@/pages/company-info";
import AppHeader from "@/components/app-header";
import BottomNavigation from "@/components/bottom-navigation";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <>
      <AppHeader />
      <div className="container-fluid mt-3">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/add-items" component={AddItems} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/sales" component={Sales} />
          <Route path="/daily-account" component={DailyAccount} />
          <Route path="/expenses" component={Expenses} />
          <Route path="/borrowers" component={Borrowers} />
          <Route path="/depositors" component={Depositors} />
          <Route path="/online-payments" component={OnlinePayments} />
          <Route path="/employees" component={Employees} />
          <Route path="/company-info" component={CompanyInfo} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <BottomNavigation />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
