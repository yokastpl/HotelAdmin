import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardStats from "@/components/dashboard-stats";
import { api } from "@/lib/api";
import { 
  ShoppingCart, Package, Receipt, TrendingUp, 
  AlertTriangle, Plus, Zap 
} from "lucide-react";

export default function Dashboard() {
  const { data: dailyAccount } = useQuery({
    queryKey: ["/api/daily-account"],
    queryFn: () => api.getDailyAccount(),
  });

  const { data: inventory } = useQuery({
    queryKey: ["/api/inventory"],
    queryFn: () => api.getInventory(),
  });

  const lowStockItems = inventory?.filter((item: any) => item.currentStock < 5) || [];

  const stats = {
    totalSales: dailyAccount?.totalSales || 0,
    totalExpenses: dailyAccount?.totalExpenses || 0,
    netProfit: (dailyAccount?.totalSales || 0) - (dailyAccount?.totalExpenses || 0),
  };

  return (
    <div className="space-y-4">
      <DashboardStats {...stats} />

      {/* Quick Actions */}
      <Card>
        <CardHeader className="bg-primary text-white">
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3">
            <Link href="/sales">
              <Button className="w-full h-20 flex-col btn-hotel-primary" data-testid="button-new-sale">
                <ShoppingCart className="w-6 h-6 mb-1" />
                <small>New Sale</small>
              </Button>
            </Link>
            <Link href="/inventory">
              <Button variant="outline" className="w-full h-20 flex-col" data-testid="button-check-stock">
                <Package className="w-6 h-6 mb-1" />
                <small>Check Stock</small>
              </Button>
            </Link>
            <Link href="/expenses">
              <Button variant="outline" className="w-full h-20 flex-col" data-testid="button-add-expense">
                <Receipt className="w-6 h-6 mb-1" />
                <small>Add Expense</small>
              </Button>
            </Link>
            <Link href="/daily-account">
              <Button variant="outline" className="w-full h-20 flex-col" data-testid="button-view-reports">
                <TrendingUp className="w-6 h-6 mb-1" />
                <small>View Reports</small>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card>
          <CardHeader className="bg-warning text-dark">
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {lowStockItems.map((item: any) => (
              <Alert key={item.id} className="low-stock-alert">
                <AlertDescription className="flex justify-between items-center">
                  <div>
                    <strong data-testid={`text-item-${item.item.name.toLowerCase().replace(/\s+/g, '-')}`}>{item.item.name}</strong><br />
                    <small>Current Stock: <span data-testid={`text-stock-${item.id}`}>{item.currentStock}</span> units</small>
                  </div>
                  <Link href="/inventory">
                    <Button size="sm" variant="default" className="bg-warning text-dark" data-testid={`button-add-stock-${item.id}`}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Stock
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
