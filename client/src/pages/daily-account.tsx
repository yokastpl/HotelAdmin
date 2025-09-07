import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { api } from "@/lib/api";
import { TrendingUp, Printer, RotateCcw, Lock, Unlock } from "lucide-react";

export default function DailyAccount() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [openingBalance, setOpeningBalance] = useState("");
  const [closingBalance, setClosingBalance] = useState("");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  
  const { toast } = useToast();
  
  const { data: dailyAccount, isLoading } = useQuery({
    queryKey: ["/api/daily-account", selectedDate],
    queryFn: () => api.getDailyAccount(selectedDate),
  });

  const { data: dailyBalance } = useQuery({
    queryKey: ["/api/daily-balances", selectedDate],
    queryFn: () => api.getDailyBalance(selectedDate),
  });

  const { data: dailyInventory } = useQuery({
    queryKey: ["/api/daily-inventory", selectedDate],
    queryFn: () => api.getDailyInventory(selectedDate),
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handlePrint = () => {
    window.print();
  };

  const createBalanceMutation = useMutation({
    mutationFn: (data: any) => api.createDailyBalance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-balances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-account"] });
      setBalanceDialogOpen(false);
      setOpeningBalance("");
      toast({
        title: "Success",
        description: "Opening balance set successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to set opening balance. Please try again.",
        variant: "destructive",
      });
    },
  });

  const closeBalanceMutation = useMutation({
    mutationFn: (closingBalance: number) => api.closeDailyBalance(selectedDate, closingBalance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-balances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-account"] });
      setClosingBalance("");
      toast({
        title: "Success",
        description: "Closing balance set successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to set closing balance. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetDailyMutation = useMutation({
    mutationFn: () => api.resetDailyData(selectedDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-account"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-balances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/online-payments"] });
      setResetDialogOpen(false);
      toast({
        title: "Success",
        description: "Daily data reset successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset daily data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSetOpeningBalance = () => {
    if (!openingBalance) {
      toast({
        title: "Error",
        description: "Please enter opening balance.",
        variant: "destructive",
      });
      return;
    }

    createBalanceMutation.mutate({
      date: selectedDate,
      openingBalance: parseFloat(openingBalance),
    });
  };

  const handleSetClosingBalance = () => {
    if (!closingBalance) {
      toast({
        title: "Error",
        description: "Please enter closing balance.",
        variant: "destructive",
      });
      return;
    }

    closeBalanceMutation.mutate(parseFloat(closingBalance));
  };

  const handleResetDaily = () => {
    resetDailyMutation.mutate();
  };

  const isHistoricalDate = selectedDate !== new Date().toISOString().split('T')[0];
  const isClosed = dailyBalance?.isClosed || false;

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
            <div className="text-center p-3 bg-secondary text-white rounded">
              <h6 className="text-lg font-bold" data-testid="text-account-opening-balance">
                ₹{(dailyAccount?.openingBalance || 0).toLocaleString()}
              </h6>
              <small>Opening Balance</small>
            </div>
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
              <h6 className="text-lg font-bold" data-testid="text-account-current-balance">
                ₹{(dailyAccount?.currentBalance || 0).toLocaleString()}
              </h6>
              <small>Current Balance</small>
            </div>
            {isClosed && (
              <div className="text-center p-3 bg-warning text-white rounded">
                <h6 className="text-lg font-bold" data-testid="text-account-closing-balance">
                  ₹{(dailyAccount?.closingBalance || 0).toLocaleString()}
                </h6>
                <small>Closing Balance</small>
              </div>
            )}
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

            <AccordionItem value="inventory-variance">
              <AccordionTrigger data-testid="button-inventory-variance">
                Inventory Variance Report
              </AccordionTrigger>
              <AccordionContent>
                {!dailyInventory || dailyInventory.length === 0 ? (
                  <div className="text-center py-4 text-dark-foreground">No inventory snapshots for this date</div>
                ) : (
                  <div className="space-y-2">
                    {dailyInventory.map((snapshot: any) => {
                      const variance = snapshot.closingStock - snapshot.openingStock;
                      return (
                        <div 
                          key={snapshot.id} 
                          className="flex justify-between py-1"
                          data-testid={`breakdown-inventory-${snapshot.id}`}
                        >
                          <div>
                            <span data-testid={`text-breakdown-item-name-${snapshot.id}`}>{snapshot.item.name}</span>
                            <br />
                            <small className="text-muted">
                              Opening: {snapshot.openingStock} | Closing: {snapshot.closingStock}
                            </small>
                          </div>
                          <div className="text-end">
                            <strong 
                              className={variance > 0 ? "text-success" : variance < 0 ? "text-destructive" : "text-muted"}
                              data-testid={`text-breakdown-variance-${snapshot.id}`}
                            >
                              {variance > 0 ? '+' : ''}{variance}
                            </strong>
                            <br />
                            <small className="text-muted">variance</small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Action Buttons */}
          <div className="mt-4 space-y-2">
            {!isHistoricalDate && !isClosed && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" data-testid="button-set-opening-balance">
                      <Unlock className="w-4 h-4 me-2" />
                      Set Opening Balance
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Set Opening Balance</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="openingBalance">Opening Balance</Label>
                        <div className="input-group">
                          <span className="input-group-text">₹</span>
                          <Input
                            id="openingBalance"
                            type="number"
                            step="0.01"
                            min="0"
                            value={openingBalance}
                            onChange={(e) => setOpeningBalance(e.target.value)}
                            placeholder="0.00"
                            data-testid="input-opening-balance"
                          />
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <Button 
                          onClick={handleSetOpeningBalance}
                          disabled={!openingBalance || createBalanceMutation.isPending}
                          data-testid="button-confirm-opening-balance"
                        >
                          {createBalanceMutation.isPending ? "Setting..." : "Set Balance"}
                        </Button>
                        <Button variant="outline" onClick={() => setBalanceDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setClosingBalance(dailyAccount?.currentBalance?.toString() || "0");
                    handleSetClosingBalance();
                  }}
                  disabled={closeBalanceMutation.isPending}
                  data-testid="button-close-balance"
                >
                  <Lock className="w-4 h-4 me-2" />
                  Close Day
                </Button>

                <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="text-danger border-danger" data-testid="button-reset-daily">
                      <RotateCcw className="w-4 h-4 me-2" />
                      Reset Today
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reset Daily Data</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-warning">
                        Are you sure you want to reset all today's transactions? This action cannot be undone.
                      </p>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="destructive"
                          onClick={handleResetDaily}
                          disabled={resetDailyMutation.isPending}
                          data-testid="button-confirm-reset"
                        >
                          {resetDailyMutation.isPending ? "Resetting..." : "Reset Data"}
                        </Button>
                        <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {isHistoricalDate && (
              <div className="text-center p-3 bg-info text-white rounded">
                <Lock className="w-4 h-4 me-2" />
                Historical View - Read Only
              </div>
            )}

            {isClosed && (
              <div className="text-center p-3 bg-warning text-white rounded">
                <Lock className="w-4 h-4 me-2" />
                Day Closed - Read Only
              </div>
            )}

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
