import { Card, CardContent } from "@/components/ui/card";

interface DashboardStatsProps {
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
}

export default function DashboardStats({ totalSales, totalExpenses, netProfit }: DashboardStatsProps) {
  return (
    <Card className="stat-card">
      <CardContent className="p-4">
        <h5 className="text-lg font-semibold mb-3 text-white">Today's Summary</h5>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div>
            <h4 className="text-xl font-bold text-white" data-testid="text-total-sales">₹{totalSales.toLocaleString()}</h4>
            <small className="text-white/80">Total Sales</small>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white" data-testid="text-total-expenses">₹{totalExpenses.toLocaleString()}</h4>
            <small className="text-white/80">Expenses</small>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white" data-testid="text-net-profit">₹{netProfit.toLocaleString()}</h4>
            <small className="text-white/80">Net Profit</small>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
