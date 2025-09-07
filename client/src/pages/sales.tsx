import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { api } from "@/lib/api";
import { ShoppingCart, Receipt } from "lucide-react";

export default function Sales() {
  const [formData, setFormData] = useState({
    itemId: "",
    quantity: "1",
    customerName: "",
  });
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const { toast } = useToast();

  const { data: inventory } = useQuery({
    queryKey: ["/api/inventory"],
    queryFn: () => api.getInventory(),
  });

  const { data: todaySales } = useQuery({
    queryKey: ["/api/sales", new Date().toISOString().split('T')[0]],
    queryFn: () => api.getSales(new Date().toISOString().split('T')[0]),
  });

  const createSaleMutation = useMutation({
    mutationFn: (data: any) => api.createSale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-account"] });
      setFormData({ itemId: "", quantity: "1", customerName: "" });
      setSelectedItem(null);
      toast({
        title: "Success",
        description: "Sale recorded successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record sale. Please try again.",
        variant: "destructive",
      });
    },
  });

  const availableItems = inventory?.filter((item: any) => item.currentStock > 0) || [];
  const total = selectedItem && formData.quantity 
    ? parseFloat(selectedItem.item.pricePerUnit) * parseInt(formData.quantity)
    : 0;

  useEffect(() => {
    if (formData.itemId) {
      const item = inventory?.find((inv: any) => inv.itemId === formData.itemId);
      setSelectedItem(item);
    } else {
      setSelectedItem(null);
    }
  }, [formData.itemId, inventory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.itemId || !formData.quantity || !selectedItem) {
      toast({
        title: "Error",
        description: "Please select an item and enter quantity.",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (quantity > selectedItem.currentStock) {
      toast({
        title: "Error",
        description: "Insufficient stock available.",
        variant: "destructive",
      });
      return;
    }

    createSaleMutation.mutate({
      itemId: formData.itemId,
      quantity,
      unitPrice: selectedItem.item.pricePerUnit,
      total: total.toString(),
      customerName: formData.customerName || null,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="bg-primary text-white">
          <CardTitle className="flex items-center">
            <ShoppingCart className="w-5 h-5 me-2" />
            Record Sale
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="saleItem">Select Item *</Label>
              <Select value={formData.itemId} onValueChange={(value) => setFormData({ ...formData, itemId: value })}>
                <SelectTrigger data-testid="select-sale-item">
                  <SelectValue placeholder="Choose an item..." />
                </SelectTrigger>
                <SelectContent>
                  {availableItems.map((item: any) => (
                    <SelectItem key={item.itemId} value={item.itemId}>
                      {item.item.name} - ₹{parseFloat(item.item.pricePerUnit).toFixed(2)} (Stock: {item.currentStock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="saleQuantity">Quantity *</Label>
                <Input
                  id="saleQuantity"
                  type="number"
                  min="1"
                  max={selectedItem?.currentStock || 999}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                  data-testid="input-sale-quantity"
                />
              </div>
              <div>
                <Label htmlFor="salePrice">Unit Price &nbsp; <span className="input-group-text">₹</span></Label>
                <div className="input-group">
                  
                  <Input
                    id="salePrice"
                    type="number"
                    value={selectedItem ? parseFloat(selectedItem.item.pricePerUnit).toFixed(2) : "0.00"}
                    readOnly
                    data-testid="input-sale-price"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label>Total Amount</Label>
              <Alert className="mt-2">
                <AlertDescription className="text-center">
                  <h4 className="text-2xl font-bold" data-testid="text-sale-total">₹{total.toFixed(2)}</h4>
                </AlertDescription>
              </Alert>
            </div>
            
            <div>
              <Label htmlFor="customerName">Customer Name (Optional)</Label>
              <Input
                id="customerName"
                type="text"
                placeholder="Enter customer name"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                data-testid="input-customer-name"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full btn-hotel-primary"
              disabled={createSaleMutation.isPending || !selectedItem}
              data-testid="button-complete-sale"
            >
              <ShoppingCart className="w-4 h-4 me-2" />
              {createSaleMutation.isPending ? "Processing..." : "Complete Sale"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Today's Sales */}
      <Card>
        <CardHeader className="bg-primary text-white">
          <CardTitle className="flex items-center">
            <Receipt className="w-5 h-5 me-2" />
            Today's Sales
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {!todaySales || todaySales.length === 0 ? (
            <div className="text-center py-4 text-dark-foreground">
              No sales recorded today.
            </div>
          ) : (
            <div className="space-y-3">
              {todaySales.map((sale: any) => (
                <div 
                  key={sale.id} 
                  className="d-flex justify-content-between align-items-center p-2 border-bottom"
                  data-testid={`sale-${sale.id}`}
                >
                  <div>
                    <strong data-testid={`text-sale-item-${sale.id}`}>{sale.item.name}</strong><br />
                    <small className="text-dark">
                      Qty: <span data-testid={`text-sale-quantity-${sale.id}`}>{sale.quantity}</span> × 
                      ₹<span data-testid={`text-sale-unit-price-${sale.id}`}>{parseFloat(sale.unitPrice).toFixed(2)}</span> | 
                      <span data-testid={`text-sale-time-${sale.id}`}>{new Date(sale.date).toLocaleTimeString()}</span>
                    </small>
                  </div>
                  <div className="text-end">
                    <strong data-testid={`text-sale-total-${sale.id}`}>₹{parseFloat(sale.total).toFixed(2)}</strong>
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
