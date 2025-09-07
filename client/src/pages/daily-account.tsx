import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { api } from "@/lib/api";
import { TrendingUp, Printer } from "lucide-react";

export default function DailyAccount() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { data: dailyAccount, isLoading } = useQuery({
    queryKey: ["/api/daily-account", selectedDate],
    queryFn: () => api.getDailyAccount(selectedDate),
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading daily account...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="bg-primary text-white">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 me-2" />
              Daily Account
            </div>
            <span className="text-sm" data-testid="text-selected-date">
              {new Date(selectedDate).toLocaleDateString()}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mb-4">
            <Label htmlFor="dateSelect">Select Date</Label>
            <Input
              id="dateSelect"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              data-testid="input-date-select"
            />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="text-center p-3 bg-success text-white rounded">
              <h6 className="text-lg font-bold" data-testid="text-account-total-sales">
                ₹{(dailyAccount?.totalSales || 0).toLocaleString()}
              </h6>
              <small>Total Sales</small>
            </div>
            <div className="text-center p-3 bg-destructive text-white rounded">
              <h6 className="text-lg font-bold" data-testid="text-account-total-expenses">
                ₹{(dailyAccount?.totalExpenses || 0).toLocaleString()}
              </h6>
              <small>Expenses</small>
            </div>
            <div className="text-center p-3 bg-info text-white rounded">
              <h6 className="text-lg font-bold" data-testid="text-account-online-payments">
                ₹{(dailyAccount?.totalOnlinePayments || 0).toLocaleString()}
              </h6>
              <small>Online</small>
            </div>
            <div className="text-center p-3 bg-primary text-white rounded">
              <h6 className="text-lg font-bold" data-testid="text-account-net-cash">
                ₹{(dailyAccount?.netCash || 0).toLocaleString()}
              </h6>
              <small>Net Cash</small>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <Accordion type="single" collapsible defaultValue="sales">
            <AccordionItem value="sales">
              <AccordionTrigger data-testid="button-sales-breakdown">
                Sales Breakdown
              </AccordionTrigger>
              <AccordionContent>
                {!dailyAccount?.salesBreakdown || dailyAccount.salesBreakdown.length === 0 ? (
                  <div className="text-center py-4 text-dark-foreground">No sales for this date</div>
                ) : (
                  <div className="space-y-2">
                    {dailyAccount.salesBreakdown.map((sale: any) => (
                      <div 
                        key={sale.id} 
                        className="flex justify-between py-1"
                        data-testid={`breakdown-sale-${sale.id}`}
                      >
                        <span data-testid={`text-breakdown-sale-name-${sale.id}`}>{sale.item.name}</span>
                        <span>
                          <span data-testid={`text-breakdown-sale-quantity-${sale.id}`}>{sale.quantity}</span> × 
                          ₹<span data-testid={`text-breakdown-sale-price-${sale.id}`}>{parseFloat(sale.unitPrice).toFixed(2)}</span> = 
                          <strong> ₹<span data-testid={`text-breakdown-sale-total-${sale.id}`}>{parseFloat(sale.total).toFixed(2)}</span></strong>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="expenses">
              <AccordionTrigger data-testid="button-expenses-breakdown">
                Expenses Breakdown
              </AccordionTrigger>
              <AccordionContent>
                {!dailyAccount?.expensesBreakdown || dailyAccount.expensesBreakdown.length === 0 ? (
                  <div className="text-center py-4 text-dark-foreground">No expenses for this date</div>
                ) : (
                  <div className="space-y-2">
                    {dailyAccount.expensesBreakdown.map((expense: any) => (
                      <div 
                        key={expense.id} 
                        className="flex justify-between py-1"
                        data-testid={`breakdown-expense-${expense.id}`}
                      >
                        <span data-testid={`text-breakdown-expense-description-${expense.id}`}>{expense.description}</span>
                        <strong data-testid={`text-breakdown-expense-amount-${expense.id}`}>
                          ₹{parseFloat(expense.amount).toFixed(2)}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="online-payments">
              <AccordionTrigger data-testid="button-online-payments-breakdown">
                Online Payments Breakdown
              </AccordionTrigger>
              <AccordionContent>
                {!dailyAccount?.onlinePaymentsBreakdown || dailyAccount.onlinePaymentsBreakdown.length === 0 ? (
                  <div className="text-center py-4 text-dark-foreground">No online payments for this date</div>
                ) : (
                  <div className="space-y-2">
                    {dailyAccount.onlinePaymentsBreakdown.map((payment: any) => (
                      <div 
                        key={payment.id} 
                        className="flex justify-between py-1"
                        data-testid={`breakdown-payment-${payment.id}`}
                      >
                        <span data-testid={`text-breakdown-payment-method-${payment.id}`}>{payment.method}</span>
                        <strong data-testid={`text-breakdown-payment-amount-${payment.id}`}>
                          ₹{parseFloat(payment.amount).toFixed(2)}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handlePrint}
              data-testid="button-print-report"
            >
              <Printer className="w-4 h-4 me-2" />
              Print Daily Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
