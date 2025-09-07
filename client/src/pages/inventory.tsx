import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { api } from "@/lib/api";
import { Package, Plus, Edit } from "lucide-react";

export default function Inventory() {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [stockAmount, setStockAmount] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { toast } = useToast();

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["/api/inventory"],
    queryFn: () => api.getInventory(),
  });

  const updateInventoryMutation = useMutation({
    mutationFn: ({ itemId, currentStock }: { itemId: string; currentStock: number }) => 
      api.updateInventory(itemId, currentStock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-account"] });
      setDialogOpen(false);
      setStockAmount("");
      setSelectedItem(null);
      toast({
        title: "Success",
        description: "Inventory updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update inventory. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStockUpdate = (item: any, action: 'add' | 'adjust') => {
    setSelectedItem({ ...item, action });
    setStockAmount("");
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!stockAmount || !selectedItem) return;

    const amount = parseInt(stockAmount);
    let newStock = amount;

    if (selectedItem.action === 'add') {
      newStock = selectedItem.currentStock + amount;
    }

    updateInventoryMutation.mutate({
      itemId: selectedItem.itemId,
      currentStock: Math.max(0, newStock),
    });
  };

  const totalItems = inventory?.length || 0;
  const totalValue = inventory?.reduce((sum: number, item: any) => 
    sum + (item.currentStock * parseFloat(item.item.pricePerUnit)), 0) || 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="bg-primary text-white">
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 me-2" />
            Inventory Management
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-primary text-white rounded">
              <h5 className="text-xl font-bold" data-testid="text-total-items">{totalItems}</h5>
              <small>Total Items</small>
            </div>
            <div className="text-center p-3 bg-success text-white rounded">
              <h5 className="text-xl font-bold" data-testid="text-total-value">₹{totalValue.toLocaleString()}</h5>
              <small>Stock Value</small>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-4">Loading inventory...</div>
          ) : !inventory || inventory.length === 0 ? (
            <div className="text-center py-4 text-dark-foreground">
              No inventory items found. Add items first.
            </div>
          ) : (
            <div className="space-y-3">
              {inventory.map((item: any) => (
                <Card key={item.id} className="mb-2">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h6 className="mb-1" data-testid={`text-inventory-item-${item.id}`}>{item.item.name}</h6>
                        <small className="text-dark">
                          ₹<span data-testid={`text-inventory-price-${item.id}`}>{parseFloat(item.item.pricePerUnit).toFixed(2)}</span> per unit
                        </small>
                        <div className="mt-1 space-x-2">
                          <Badge 
                            variant={item.currentStock < 5 ? "destructive" : "secondary"}
                            data-testid={`badge-inventory-stock-${item.id}`}
                          >
                            {item.currentStock} units
                          </Badge>
                          <Badge variant="outline" data-testid={`badge-inventory-value-${item.id}`}>
                            ₹{(item.currentStock * parseFloat(item.item.pricePerUnit)).toLocaleString()}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          className="bg-success text-white"
                          onClick={() => handleStockUpdate(item, 'add')}
                          data-testid={`button-add-stock-${item.id}`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStockUpdate(item, 'adjust')}
                          data-testid={`button-adjust-stock-${item.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.action === 'add' ? 'Add Stock' : 'Adjust Stock'} - {selectedItem?.item?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Stock: {selectedItem?.currentStock} units</Label>
            </div>
            <div>
              <Label htmlFor="stockAmount">
                {selectedItem?.action === 'add' ? 'Quantity to Add' : 'New Stock Quantity'}
              </Label>
              <Input
                id="stockAmount"
                type="number"
                min="0"
                value={stockAmount}
                onChange={(e) => setStockAmount(e.target.value)}
                placeholder="Enter quantity"
                data-testid="input-stock-amount"
              />
            </div>
            <div className="d-flex gap-2">
              <Button 
                onClick={handleSubmit}
                disabled={!stockAmount || updateInventoryMutation.isPending}
                className="btn-hotel-primary"
                data-testid="button-confirm-stock-update"
              >
                {updateInventoryMutation.isPending ? "Updating..." : "Update Stock"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                data-testid="button-cancel-stock-update"
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
