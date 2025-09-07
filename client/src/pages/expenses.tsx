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
import { Receipt, List, Trash2 } from "lucide-react";

export default function Expenses() {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "utilities",
  });
  
  const { toast } = useToast();

  const { data: todayExpenses } = useQuery({
    queryKey: ["/api/expenses", new Date().toISOString().split('T')[0]],
    queryFn: () => api.getExpenses(new Date().toISOString().split('T')[0]),
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data: any) => api.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-account"] });
      setFormData({ description: "", amount: "", category: "utilities" });
      toast({
        title: "Success",
        description: "Expense added successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => api.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-account"] });
      toast({
        title: "Success",
        description: "Expense deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createExpenseMutation.mutate({
      description: formData.description,
      amount: formData.amount,
      category: formData.category,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpenseMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="bg-primary text-white">
          <CardTitle className="flex items-center">
            <Receipt className="w-5 h-5 me-2" />
            Add Expense
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="expenseDescription">Description *</Label>
              <Input
                id="expenseDescription"
                type="text"
                placeholder="e.g., Electricity Bill, Staff Meal, Supplies"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                data-testid="input-expense-description"
              />
            </div>
            
            <div>
              <Label htmlFor="expenseAmount">Amount *</Label>
              <div className="input-group">
                <span className="input-group-text">₹</span>
                <Input
                  id="expenseAmount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  data-testid="input-expense-amount"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="expenseCategory">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger data-testid="select-expense-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="supplies">Supplies</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              type="submit" 
              className="w-full btn-hotel-primary"
              disabled={createExpenseMutation.isPending}
              data-testid="button-add-expense"
            >
              <Receipt className="w-4 h-4 me-2" />
              {createExpenseMutation.isPending ? "Adding..." : "Add Expense"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Today's Expenses */}
      <Card>
        <CardHeader className="bg-primary text-white">
          <CardTitle className="flex items-center">
            <List className="w-5 h-5 me-2" />
            Today's Expenses
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {!todayExpenses || todayExpenses.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No expenses recorded today.
            </div>
          ) : (
            <div className="space-y-3">
              {todayExpenses.map((expense: any) => (
                <div 
                  key={expense.id} 
                  className="d-flex justify-content-between align-items-center p-2 border-bottom"
                  data-testid={`expense-${expense.id}`}
                >
                  <div>
                    <strong data-testid={`text-expense-description-${expense.id}`}>{expense.description}</strong><br />
                    <small className="text-muted">
                      <span data-testid={`text-expense-category-${expense.id}`}>{expense.category}</span> | 
                      <span data-testid={`text-expense-time-${expense.id}`} className="ms-1">
                        {new Date(expense.date).toLocaleTimeString()}
                      </span>
                    </small>
                  </div>
                  <div className="text-end">
                    <strong className="text-destructive" data-testid={`text-expense-amount-${expense.id}`}>
                      ₹{parseFloat(expense.amount).toFixed(2)}
                    </strong>
                    <br />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDelete(expense.id)}
                      disabled={deleteExpenseMutation.isPending}
                      data-testid={`button-delete-expense-${expense.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
