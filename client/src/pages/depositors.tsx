import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { api } from "@/lib/api";
import { Building2, ArrowLeft } from "lucide-react";

export default function Depositors() {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    purpose: "",
  });
  const [returnData, setReturnData] = useState({
    depositorId: "",
    amount: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { toast } = useToast();

  const { data: depositors, isLoading } = useQuery({
    queryKey: ["/api/depositors"],
    queryFn: () => api.getDepositors(),
  });

  const createDepositorMutation = useMutation({
    mutationFn: (data: any) => api.createDepositor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/depositors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-account"] });
      setFormData({ name: "", amount: "", purpose: "" });
      toast({
        title: "Success",
        description: "Deposit recorded successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record deposit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const returnDepositMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => 
      api.returnDeposit(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/depositors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-account"] });
      setReturnData({ depositorId: "", amount: "" });
      setDialogOpen(false);
      toast({
        title: "Success",
        description: "Deposit return recorded successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record return. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createDepositorMutation.mutate({
      name: formData.name,
      amount: formData.amount,
      purpose: formData.purpose || null,
    });
  };

  const handleReturn = (depositorId: string, maxAmount: number) => {
    setReturnData({ depositorId, amount: maxAmount.toString() });
    setDialogOpen(true);
  };

  const handleReturnSubmit = () => {
    if (!returnData.amount) {
      toast({
        title: "Error",
        description: "Please enter return amount.",
        variant: "destructive",
      });
      return;
    }

    returnDepositMutation.mutate({
      id: returnData.depositorId,
      amount: parseFloat(returnData.amount),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="bg-primary text-white">
          <CardTitle className="flex items-center">
            <Building2 className="w-5 h-5 me-2" />
            Record Deposit
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="depositorName">Depositor Name *</Label>
              <Input
                id="depositorName"
                type="text"
                placeholder="Enter depositor's name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                data-testid="input-depositor-name"
              />
            </div>
            
            <div>
              <Label htmlFor="depositAmount">Amount Deposited *</Label>
              <div className="input-group">
                <span className="input-group-text">₹</span>
                <Input
                  id="depositAmount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  data-testid="input-deposit-amount"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="depositPurpose">Purpose</Label>
              <Input
                id="depositPurpose"
                type="text"
                placeholder="e.g., Room booking advance, Event deposit"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                data-testid="input-deposit-purpose"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full btn-hotel-primary"
              disabled={createDepositorMutation.isPending}
              data-testid="button-record-deposit"
            >
              <Building2 className="w-4 h-4 me-2" />
              {createDepositorMutation.isPending ? "Recording..." : "Record Deposit"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Deposits List */}
      <Card>
        <CardHeader className="bg-primary text-white">
          <CardTitle className="flex items-center">
            <Building2 className="w-5 h-5 me-2" />
            Current Deposits
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="text-center py-4">Loading deposits...</div>
          ) : !depositors || depositors.length === 0 ? (
            <div className="text-center py-4 text-dark-foreground">
              No deposits found.
            </div>
          ) : (
            <div className="space-y-3">
              {depositors.map((depositor: any) => {
                const remainingAmount = parseFloat(depositor.amount) - parseFloat(depositor.returnedAmount || "0");
                return (
                  <Card key={depositor.id} className="depositor-card">
                    <CardContent className="p-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1" data-testid={`text-depositor-name-${depositor.id}`}>
                            {depositor.name}
                          </h6>
                          {depositor.purpose && (
                            <small className="text-dark" data-testid={`text-depositor-purpose-${depositor.id}`}>
                              {depositor.purpose}
                            </small>
                          )}
                          <div className="mt-1 space-x-2">
                            <Badge 
                              variant={depositor.returned ? "secondary" : "default"} 
                              className="bg-success text-white"
                              data-testid={`badge-depositor-amount-${depositor.id}`}
                            >
                              ₹{parseFloat(depositor.amount).toFixed(2)} Deposited
                            </Badge>
                            <small className="text-dark" data-testid={`text-depositor-date-${depositor.id}`}>
                              {new Date(depositor.date).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                        <div className="text-end">
                          {!depositor.returned && remainingAmount > 0 ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-success text-success"
                              onClick={() => handleReturn(depositor.id, remainingAmount)}
                              data-testid={`button-return-deposit-${depositor.id}`}
                            >
                              <ArrowLeft className="w-4 h-4 me-1" />
                              Return
                            </Button>
                          ) : (
                            <Badge variant="secondary" data-testid={`badge-depositor-returned-${depositor.id}`}>
                              Returned
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Deposit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="returnAmount">Return Amount</Label>
              <div className="input-group">
                <span className="input-group-text">₹</span>
                <Input
                  id="returnAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={returnData.amount}
                  onChange={(e) => setReturnData({ ...returnData, amount: e.target.value })}
                  placeholder="Enter amount to return"
                  data-testid="input-return-amount"
                />
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button 
                onClick={handleReturnSubmit}
                disabled={!returnData.amount || returnDepositMutation.isPending}
                className="btn-hotel-primary"
                data-testid="button-confirm-return"
              >
                {returnDepositMutation.isPending ? "Processing..." : "Return Deposit"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                data-testid="button-cancel-return"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
