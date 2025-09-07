import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { api } from "@/lib/api";
import { UserPlus, Calendar, Calculator, DollarSign } from "lucide-react";

export default function Employees() {
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    dailyPay: "",
  });
  const [paymentData, setPaymentData] = useState({
    employeeId: "",
    amount: "",
    month: "",
    year: new Date().getFullYear(),
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const currentDate = new Date().toISOString().split('T')[0];

  const { data: employees, isLoading } = useQuery({
    queryKey: ["/api/employees"],
    queryFn: () => api.getEmployees(),
  });

  const { data: todayAttendance } = useQuery({
    queryKey: ["/api/attendance", currentDate],
    queryFn: () => api.getAttendance(currentDate),
  });

  const { data: salaryPayments } = useQuery({
    queryKey: ["/api/salary-payments"],
    queryFn: () => api.getSalaryPayments(),
  });

  const createEmployeeMutation = useMutation({
    mutationFn: (data: any) => api.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setFormData({ name: "", position: "", dailyPay: "" });
      toast({
        title: "Success",
        description: "Employee added successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: ({ employeeId, present }: { employeeId: string; present: boolean }) => 
      api.updateAttendance(employeeId, present, currentDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Success",
        description: "Attendance updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update attendance. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createSalaryPaymentMutation = useMutation({
    mutationFn: (data: any) => api.createSalaryPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/salary-payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-account"] });
      setPaymentData({ employeeId: "", amount: "", month: "", year: new Date().getFullYear() });
      setDialogOpen(false);
      toast({
        title: "Success",
        description: "Salary payment recorded successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record salary payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dailyPay) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createEmployeeMutation.mutate({
      name: formData.name,
      position: formData.position || null,
      dailyPay: formData.dailyPay,
    });
  };

  const handleAttendanceChange = (employeeId: string, present: boolean) => {
    updateAttendanceMutation.mutate({ employeeId, present });
  };

  const handlePayment = (employee: any) => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    setPaymentData({ 
      employeeId: employee.id, 
      amount: "", 
      month: currentMonth,
      year: new Date().getFullYear()
    });
    setDialogOpen(true);
  };

  const handlePaymentSubmit = () => {
    if (!paymentData.amount || !paymentData.month) {
      toast({
        title: "Error",
        description: "Please fill in all payment details.",
        variant: "destructive",
      });
      return;
    }

    createSalaryPaymentMutation.mutate({
      employeeId: paymentData.employeeId,
      amount: paymentData.amount,
      month: paymentData.month,
      year: paymentData.year,
    });
  };

  const getAttendanceForEmployee = (employeeId: string) => {
    return todayAttendance?.find((att: any) => att.employeeId === employeeId);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="bg-primary text-white">
          <CardTitle className="flex items-center">
            <UserPlus className="w-5 h-5 me-2" />
            Add Employee
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="employeeName">Employee Name *</Label>
              <Input
                id="employeeName"
                type="text"
                placeholder="Enter employee name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                data-testid="input-employee-name"
              />
            </div>
            
            <div>
              <Label htmlFor="employeePosition">Position</Label>
              <Input
                id="employeePosition"
                type="text"
                placeholder="e.g., Receptionist, Housekeeper, Chef"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                data-testid="input-employee-position"
              />
            </div>
            
            <div>
              <Label htmlFor="dailyPay">Daily Pay *</Label>
              <div className="input-group">
                <span className="input-group-text">₹</span>
                <Input
                  id="dailyPay"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.dailyPay}
                  onChange={(e) => setFormData({ ...formData, dailyPay: e.target.value })}
                  required
                  data-testid="input-daily-pay"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full btn-hotel-primary"
              disabled={createEmployeeMutation.isPending}
              data-testid="button-add-employee"
            >
              <UserPlus className="w-4 h-4 me-2" />
              {createEmployeeMutation.isPending ? "Adding..." : "Add Employee"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Today's Attendance */}
      <Card>
        <CardHeader className="bg-primary text-white">
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 me-2" />
            Today's Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="text-center py-4">Loading employees...</div>
          ) : !employees || employees.length === 0 ? (
            <div className="text-center py-4 text-dark-foreground">
              No employees found. Add employees first.
            </div>
          ) : (
            <div className="space-y-3">
              {employees.map((employee: any) => {
                const attendance = getAttendanceForEmployee(employee.id);
                const isPresent = attendance?.present || false;
                return (
                  <div 
                    key={employee.id} 
                    className={`employee-attendance ${isPresent ? 'present' : 'absent'}`}
                    data-testid={`attendance-${employee.id}`}
                  >
                    <div>
                      <strong data-testid={`text-employee-name-${employee.id}`}>{employee.name}</strong><br />
                      <small className="text-dark">
                        {employee.position && (
                          <span data-testid={`text-employee-position-${employee.id}`}>{employee.position}</span>
                        )}
                        <span className="ms-2">
                          • ₹<span data-testid={`text-employee-daily-pay-${employee.id}`}>{parseFloat(employee.dailyPay).toFixed(2)}</span>/day
                        </span>
                      </small>
                    </div>
                    <div className="d-flex align-items-center">
                      <Switch
                        checked={isPresent}
                        onCheckedChange={(checked) => handleAttendanceChange(employee.id, checked)}
                        disabled={updateAttendanceMutation.isPending}
                        data-testid={`switch-attendance-${employee.id}`}
                      />
                      <Label className="ms-2" data-testid={`label-attendance-${employee.id}`}>
                        {isPresent ? "Present" : "Absent"}
                      </Label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Salary Summary */}
      <Card>
        <CardHeader className="bg-primary text-white">
          <CardTitle className="flex items-center">
            <Calculator className="w-5 h-5 me-2" />
            Recent Salary Payments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {!salaryPayments || salaryPayments.length === 0 ? (
            <div className="text-center py-4 text-dark-foreground">
              No salary payments recorded.
            </div>
          ) : (
            <div className="space-y-3">
              {salaryPayments.slice(0, 5).map((payment: any) => (
                <div 
                  key={payment.id} 
                  className="d-flex justify-content-between align-items-center p-2 border-bottom"
                  data-testid={`salary-payment-${payment.id}`}
                >
                  <div>
                    <strong data-testid={`text-salary-employee-${payment.id}`}>{payment.employee.name}</strong><br />
                    <small className="text-dark">
                      <span data-testid={`text-salary-month-${payment.id}`}>{payment.month} {payment.year}</span>
                    </small>
                  </div>
                  <div className="text-end">
                    <strong data-testid={`text-salary-amount-${payment.id}`}>₹{parseFloat(payment.amount).toFixed(2)}</strong>
                  </div>
                </div>
              ))}
              {employees && employees.length > 0 && (
                <div className="text-center mt-3">
                  <Button 
                    variant="outline" 
                    onClick={() => handlePayment(employees[0])}
                    data-testid="button-make-payment"
                  >
                    <DollarSign className="w-4 h-4 me-2" />
                    Make Payment
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Salary Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentAmount">Amount *</Label>
              <div className="input-group">
                <span className="input-group-text">₹</span>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  placeholder="Enter salary amount"
                  data-testid="input-salary-amount"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="paymentMonth">Month *</Label>
              <Input
                id="paymentMonth"
                type="text"
                value={paymentData.month}
                onChange={(e) => setPaymentData({ ...paymentData, month: e.target.value })}
                placeholder="e.g., January, February"
                data-testid="input-salary-month"
              />
            </div>
            <div>
              <Label htmlFor="paymentYear">Year *</Label>
              <Input
                id="paymentYear"
                type="number"
                value={paymentData.year}
                onChange={(e) => setPaymentData({ ...paymentData, year: parseInt(e.target.value) })}
                data-testid="input-salary-year"
              />
            </div>
            <div className="d-flex gap-2">
              <Button 
                onClick={handlePaymentSubmit}
                disabled={!paymentData.amount || !paymentData.month || createSalaryPaymentMutation.isPending}
                className="btn-hotel-primary"
                data-testid="button-confirm-salary-payment"
              >
                {createSalaryPaymentMutation.isPending ? "Processing..." : "Record Payment"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                data-testid="button-cancel-salary-payment"
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
