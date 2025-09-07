import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { api } from "@/lib/api";
import { Smartphone, List } from "lucide-react";

export default function OnlinePayments() {
  const [formData, setFormData] = useState({
    amount: "",
    method: "upi",
    transactionRef: "",
  });
  
  const { toast } = useToast();

  const { data: todayPayments } = useQuery({
    queryKey: ["/api/online-payments", new Date().toISOString().split('T')[0]],
    queryFn: () => api.getOnlinePayments(new Date().toISOString().split('T')[0]),
  });

  const createPaymentMutation = useMutation({
    mutationFn: (data: any) => api.createOnlinePayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/online-payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-account"] });
      setFormData({ amount: "", method: "upi", transactionRef: "" });
      toast({
        title: "Success",
        description: "Online payment recorded successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) {
      toast({
        title: "Error",
        description: "Please enter the payment amount.",
        variant: "destructive",
      });
      return;
    }

    createPaymentMutation.mutate({
      amount: formData.amount,
      method: formData.method,
      transactionRef: formData.transactionRef || null,
    });
  };

  const getMethodDisplayName = (method: string) => {
    switch (method) {
      case "upi": return "UPI Payment";
      case "card": return "Card Payment";
      case "netbanking": return "Net Banking";
      case "wallet": return "Mobile Wallet";
      default: return method;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="bg-primary text-white">
          <CardTitle className="flex items-center">
            <Smartphone className="w-5 h-5 me-2" />
            Record Online Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="onlineAmount">Amount Received *</Label>
              <div className="input-group">
                <span className="input-group-text">₹</span>
                <Input
                  id="onlineAmount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  data-testid="input-payment-amount"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={formData.method} onValueChange={(value) => setFormData({ ...formData, method: value })}>
                <SelectTrigger data-testid="select-payment-method">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="netbanking">Net Banking</SelectItem>
                  <SelectItem value="wallet">Mobile Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="transactionRef">Transaction Reference (Optional)</Label>
              <Input
                id="transactionRef"
                type="text"
                placeholder="Transaction ID or reference"
                value={formData.transactionRef}
                onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                data-testid="input-transaction-ref"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full btn-hotel-primary"
              disabled={createPaymentMutation.isPending}
              data-testid="button-record-payment"
            >
              <Smartphone className="w-4 h-4 me-2" />
              {createPaymentMutation.isPending ? "Recording..." : "Record Payment"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Today's Online Payments */}
      <Card>
        <CardHeader className="bg-primary text-white">
          <CardTitle className="flex items-center">
            <List className="w-5 h-5 me-2" />
            Today's Online Payments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {!todayPayments || todayPayments.length === 0 ? (
            <div className="text-center py-4 text-dark-foreground">
              No online payments recorded today.
            </div>
          ) : (
            <div className="space-y-3">
              {todayPayments.map((payment: any) => (
                <div 
                  key={payment.id} 
                  className="d-flex justify-content-between align-items-center p-2 border-bottom"
                  data-testid={`payment-${payment.id}`}
                >
                  <div>
                    <strong data-testid={`text-payment-method-${payment.id}`}>
                      {getMethodDisplayName(payment.method)}
                    </strong><br />
                    <small className="text-dark">
                      {payment.transactionRef && (
                        <>
                          Ref: <span data-testid={`text-payment-ref-${payment.id}`}>{payment.transactionRef}</span> | 
                        </>
                      )}
                      <span data-testid={`text-payment-time-${payment.id}`} className="ms-1">
                        {new Date(payment.date).toLocaleTimeString()}
                      </span>
                    </small>
                  </div>
                  <div className="text-end">
                    <strong className="text-success" data-testid={`text-payment-amount-${payment.id}`}>
                      ₹{parseFloat(payment.amount).toFixed(2)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
