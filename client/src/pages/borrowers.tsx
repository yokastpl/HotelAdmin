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
import { UserPlus, Users, DollarSign, Trash2 } from "lucide-react";

export default function Borrowers() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    amountBorrowed: "",
    previousBalance: "",
  });
  const [repaymentData, setRepaymentData] = useState({
    borrowerId: "",
    amount: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { toast } = useToast();

  const { data: borrowers, isLoading } = useQuery({
    queryKey: ["/api/borrowers"],
    queryFn: () => api.getBorrowers(),
  });

  const createBorrowerMutation = useMutation({
    mutationFn: (data: any) => api.createBorrower(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/borrowers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-account"] });
      setFormData({ name: "", phone: "", amountBorrowed: "", previousBalance: "" });
      toast({
        title: "Success",
        description: "Borrower added successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add borrower. Please try again.",
        variant: "destructive",
      });
    },
  });

  const repaymentMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => 
      api.repayBorrower(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/borrowers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-account"] });
      setRepaymentData({ borrowerId: "", amount: "" });
      setDialogOpen(false);
      toast({
        title: "Success",
        description: "Repayment recorded successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record repayment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteBorrowerMutation = useMutation({
    mutationFn: (id: string) => api.deleteBorrower(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/borrowers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-account"] });
      toast({
        title: "Success",
        description: "Borrower deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete borrower. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amountBorrowed) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createBorrowerMutation.mutate({
      name: formData.name,
      phone: formData.phone || null,
      amountBorrowed: formData.amountBorrowed,
      previousBalance: formData.previousBalance || "0",
    });
  };

  const handleRepayment = (borrowerId: string) => {
    setRepaymentData({ borrowerId, amount: "" });
    setDialogOpen(true);
  };

  const handleRepaymentSubmit = () => {
    if (!repaymentData.amount) {
      toast({
        title: "Error",
        description: "Please enter repayment amount.",
        variant: "destructive",
      });
      return;
    }

    repaymentMutation.mutate({
      id: repaymentData.borrowerId,
      amount: parseFloat(repaymentData.amount),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this borrower? This action cannot be undone.")) {
      deleteBorrowerMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="flex items-center">
            <UserPlus className="w-5 h-5 me-2" />
            Add Borrower
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="borrowerName">Borrower Name *</Label>
              <Input
                id="borrowerName"
                type="text"
                placeholder="Enter borrower's name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                data-testid="input-borrower-name"
              />
            </div>
            
            <div>
              <Label htmlFor="borrowerAmount">Amount Borrowed *</Label>
              <div className="input-group">
                <span className="input-group-text">₹</span>
                <Input
                  id="borrowerAmount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.amountBorrowed}
                  onChange={(e) => setFormData({ ...formData, amountBorrowed: e.target.value })}
                  required
                  data-testid="input-borrower-amount"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="previousBalance">Previous Balance (Before System)</Label>
              <div className="input-group">
                <span className="input-group-text">₹</span>
                <Input
                  id="previousBalance"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.previousBalance}
                  onChange={(e) => setFormData({ ...formData, previousBalance: e.target.value })}
                  data-testid="input-previous-balance"
                />
              </div>
              <small className="text-muted">This amount won't affect daily calculations until repaid</small>
            </div>
            
            <div>
              <Label htmlFor="borrowerPhone">Phone (Optional)</Label>
              <Input
                id="borrowerPhone"
                type="tel"
                placeholder="Contact number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                data-testid="input-borrower-phone"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full btn-hotel-primary"
              disabled={createBorrowerMutation.isPending}
              data-testid="button-add-borrower"
            >
              <UserPlus className="w-4 h-4 me-2" />
              {createBorrowerMutation.isPending ? "Adding..." : "Add Borrower"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Borrowers List */}
      <Card>
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 me-2" />
            Current Borrowers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="text-center py-4">Loading borrowers...</div>
          ) : !borrowers || borrowers.length === 0 ? (
            <div className="text-center py-4 text-dark-foreground">
              No borrowers found.
            </div>
          ) : (
            <div className="space-y-3">
              {borrowers.map((borrower: any) => {
                const outstanding = parseFloat(borrower.amountBorrowed) - parseFloat(borrower.amountRepaid || "0");
                const previousBalance = parseFloat(borrower.previousBalance || "0");
                const totalOutstanding = outstanding + previousBalance;
                return (
                  <Card key={borrower.id} className="borrower-card">
                    <CardContent className="p-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1" data-testid={`text-borrower-name-${borrower.id}`}>
                            {borrower.name}
                          </h6>
                          {borrower.phone && (
                            <small className="text-dark" data-testid={`text-borrower-phone-${borrower.id}`}>
                              {borrower.phone}
                            </small>
                          )}
                          <div className="mt-1 space-x-2">
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600" data-testid={`badge-borrower-outstanding-${borrower.id}`}>
                              ₹{outstanding.toFixed(2)} Current
                            </Badge>
                            {previousBalance > 0 && (
                              <Badge variant="outline" className="text-blue-600 border-blue-600" data-testid={`badge-borrower-previous-${borrower.id}`}>
                                ₹{previousBalance.toFixed(2)} Previous
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-red-600 border-red-600" data-testid={`badge-borrower-total-${borrower.id}`}>
                              ₹{totalOutstanding.toFixed(2)} Total
                            </Badge>
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="d-flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-green-500 text-white hover:bg-green-600"
                              onClick={() => handleRepayment(borrower.id)}
                              disabled={outstanding <= 0}
                              data-testid={`button-repay-${borrower.id}`}
                            >
                              <DollarSign className="w-4 h-4 me-1" />
                              Repay
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(borrower.id)}
                              disabled={deleteBorrowerMutation.isPending}
                              data-testid={`button-delete-borrower-${borrower.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
            <DialogTitle>Record Repayment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="repaymentAmount">Repayment Amount</Label>
              <div className="input-group">
                <span className="input-group-text">₹</span>
                <Input
                  id="repaymentAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={repaymentData.amount}
                  onChange={(e) => setRepaymentData({ ...repaymentData, amount: e.target.value })}
                  placeholder="Enter amount"
                  data-testid="input-repayment-amount"
                />
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button 
                onClick={handleRepaymentSubmit}
                disabled={!repaymentData.amount || repaymentMutation.isPending}
                className="btn-hotel-primary"
                data-testid="button-confirm-repayment"
              >
                {repaymentMutation.isPending ? "Processing..." : "Record Repayment"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                data-testid="button-cancel-repayment"
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
