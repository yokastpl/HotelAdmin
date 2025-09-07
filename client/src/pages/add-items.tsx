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
import { PlusCircle, List, Pencil, Trash2 } from "lucide-react";
import type { Item } from "@shared/schema";

export default function AddItems() {
  const [formData, setFormData] = useState({
    name: "",
    pricePerUnit: "",
    category: "food",
  });
  
  const { toast } = useToast();

  const { data: items, isLoading } = useQuery({
    queryKey: ["/api/items"],
    queryFn: () => api.getItems(),
  });

  const createItemMutation = useMutation({
    mutationFn: (data: any) => api.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setFormData({ name: "", pricePerUnit: "", category: "food" });
      toast({
        title: "Success",
        description: "Item added successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => api.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Success",
        description: "Item deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.pricePerUnit) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createItemMutation.mutate({
      name: formData.name,
      pricePerUnit: formData.pricePerUnit,
      category: formData.category,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteItemMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="bg-primary text-white">
          <CardTitle className="flex items-center">
            <PlusCircle className="w-5 h-5 me-2" />
            Add New Item
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="itemName">Item Name *</Label>
              <Input
                id="itemName"
                type="text"
                placeholder="e.g., Coffee, Sandwich, Room Service"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                data-testid="input-item-name"
              />
            </div>
            
            <div>
              <Label htmlFor="itemPrice">Price per Unit *</Label>
              <div className="input-group">
                <span className="input-group-text">₹</span>
                <Input
                  id="itemPrice"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                  required
                  data-testid="input-item-price"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="itemCategory">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger data-testid="select-item-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food & Beverage</SelectItem>
                  <SelectItem value="service">Room Service</SelectItem>
                  <SelectItem value="amenity">Amenities</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              type="submit" 
              className="w-full btn-hotel-primary" 
              disabled={createItemMutation.isPending}
              data-testid="button-add-item"
            >
              <PlusCircle className="w-4 h-4 me-2" />
              {createItemMutation.isPending ? "Adding..." : "Add Item"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Items List */}
      <Card>
        <CardHeader className="bg-primary text-white">
          <CardTitle className="flex items-center">
            <List className="w-5 h-5 me-2" />
            Current Items
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="text-center py-4">Loading items...</div>
          ) : !items || items.length === 0 ? (
            <div className="text-center py-4 text-dark-foreground">
              No items found. Add your first item above.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item: Item) => (
                <div 
                  key={item.id} 
                  className="d-flex justify-content-between align-items-center p-3 border-bottom"
                  data-testid={`item-${item.id}`}
                >
                  <div>
                    <strong data-testid={`text-item-name-${item.id}`}>{item.name}</strong><br />
                    <small className="text-dark">
                      ₹<span data-testid={`text-item-price-${item.id}`}>{parseFloat(item.pricePerUnit).toFixed(2)}</span> | 
                      <span data-testid={`text-item-category-${item.id}`} className="ms-1">{item.category}</span>
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      data-testid={`button-edit-item-${item.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteItemMutation.isPending}
                      data-testid={`button-delete-item-${item.id}`}
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
