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
import { Package, Calendar, Lock, Unlock, RotateCcw, CheckCircle } from "lucide-react";

export default function DailyInventory() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [snapshotDialogOpen, setSnapshotDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [openingStock, setOpeningStock] = useState("");
  const [closingStock, setClosingStock] = useState("");
  
  const { toast } = useToast();
  
  const { data: inventory } = useQuery({
    queryKey: ["/api/inventory"],
    queryFn: () => api.getInventory(),
  });

  const { data: dailySnapshots, isLoading } = useQuery({
    queryKey: ["/api/daily-inventory", selectedDate],
    queryFn: () => api.getDailyInventory(selectedDate),
  });

  const createSnapshotMutation = useMutation({
    mutationFn: (data: any) => api.createDailyInventorySnapshot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-inventory"] });
      setSnapshotDialogOpen(false);
      setOpeningStock("");
      setSelectedItem(null);
      toast({
        title: "Success",
        description: "Opening inventory snapshot created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create inventory snapshot. Please try again.",
        variant: "destructive",
      });
    },
  });

  const closeSnapshotMutation = useMutation({
    mutationFn: ({ itemId, closingStock }: { itemId: string; closingStock: number }) => 
      api.closeDailyInventorySnapshot(selectedDate, itemId, closingStock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-inventory"] });
      setCloseDialogOpen(false);
      setClosingStock("");
      setSelectedItem(null);
      toast({
        title: "Success",
        description: "Closing inventory snapshot created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create closing snapshot. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleCreateSnapshot = (item: any) => {
    setSelectedItem(item);
    setOpeningStock(item.currentStock.toString());
    setSnapshotDialogOpen(true);
  };

  const handleCloseSnapshot = (snapshot: any) => {
    setSelectedItem(snapshot);
    setClosingStock(snapshot.openingStock.toString());
    setCloseDialogOpen(true);
  };

  const handleSnapshotSubmit = () => {
    if (!openingStock || !selectedItem) {
      toast({
        title: "Error",
        description: "Please enter opening stock amount.",
        variant: "destructive",
      });
      return;
    }

    createSnapshotMutation.mutate({
      date: selectedDate,
      itemId: selectedItem.itemId,
      openingStock: parseInt(openingStock),
    });
  };

  const handleCloseSubmit = () => {
    if (!closingStock || !selectedItem) {
      toast({
        title: "Error",
        description: "Please enter closing stock amount.",
        variant: "destructive",
      });
      return;
    }

    closeSnapshotMutation.mutate({
      itemId: selectedItem.itemId,
      closingStock: parseInt(closingStock),
    });
  };

  const isHistoricalDate = selectedDate !== new Date().toISOString().split('T')[0];
  const hasSnapshots = dailySnapshots && dailySnapshots.length > 0;
  const allClosed = dailySnapshots?.every((snapshot: any) => snapshot.isClosed) || false;

  if (isLoading) {
    return <div className="text-center py-4">Loading daily inventory...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="bg-primary text-white">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="w-5 h-5 me-2" />
              Daily Inventory Management
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

          {/* Status Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-info text-white rounded">
              <h6 className="text-lg font-bold" data-testid="text-total-items">
                {inventory?.length || 0}
              </h6>
              <small>Total Items</small>
            </div>
            <div className="text-center p-3 bg-success text-white rounded">
              <h6 className="text-lg font-bold" data-testid="text-snapshots-count">
                {dailySnapshots?.length || 0}
              </h6>
              <small>Snapshots</small>
            </div>
            <div className="text-center p-3 bg-warning text-white rounded">
              <h6 className="text-lg font-bold" data-testid="text-closed-count">
                {dailySnapshots?.filter((s: any) => s.isClosed).length || 0}
              </h6>
              <small>Closed</small>
            </div>
          </div>

          {/* Action Buttons */}
          {!isHistoricalDate && (
            <div className="mb-4 space-y-2">
              {!hasSnapshots && (
                <div className="text-center p-3 bg-info text-white rounded">
                  <Calendar className="w-4 h-4 me-2" />
                  No inventory snapshots for this date. Create opening snapshots below.
                </div>
              )}
              
              {hasSnapshots && !allClosed && (
                <div className="text-center p-3 bg-warning text-white rounded">
                  <Unlock className="w-4 h-4 me-2" />
                  Some items need closing snapshots. Complete them below.
                </div>
              )}

              {allClosed && (
                <div className="text-center p-3 bg-success text-white rounded">
                  <CheckCircle className="w-4 h-4 me-2" />
                  All inventory snapshots completed for this date.
                </div>
              )}
            </div>
          )}

          {isHistoricalDate && (
            <div className="text-center p-3 bg-info text-white rounded mb-4">
              <Lock className="w-4 h-4 me-2" />
              Historical View - Read Only
            </div>
          )}

          {/* Inventory Items */}
          {!inventory || inventory.length === 0 ? (
            <div className="text-center py-4 text-dark-foreground">
              No inventory items found. Add items first.
            </div>
          ) : (
            <div className="space-y-3">
              {inventory.map((item: any) => {
                const snapshot = dailySnapshots?.find((s: any) => s.itemId === item.itemId);
                const isClosed = snapshot?.isClosed || false;
                const hasSnapshot = !!snapshot;
                
                return (
                  <Card key={item.id} className={`inventory-item ${isClosed ? 'closed' : ''}`}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h6 className="mb-1" data-testid={`text-item-name-${item.id}`}>
                            {item.item.name}
                          </h6>
                          <small className="text-dark">
                            ₹{parseFloat(item.item.pricePerUnit).toFixed(2)} per unit
                          </small>
                          <div className="mt-1 space-x-2">
                            <Badge 
                              variant={item.currentStock < 5 ? "destructive" : "secondary"}
                              data-testid={`badge-current-stock-${item.id}`}
                            >
                              {item.currentStock} units (Current)
                            </Badge>
                            {hasSnapshot && (
                              <>
                                <Badge 
                                  variant="outline" 
                                  className="text-info border-info"
                                  data-testid={`badge-opening-stock-${item.id}`}
                                >
                                  {snapshot.openingStock} opening
                                </Badge>
                                {isClosed && (
                                  <Badge 
                                    variant="outline" 
                                    className="text-success border-success"
                                    data-testid={`badge-closing-stock-${item.id}`}
                                  >
                                    {snapshot.closingStock} closing
                                  </Badge>
                                )}
                                {isClosed && (
                                  <Badge 
                                    variant={snapshot.closingStock > snapshot.openingStock ? "default" : "destructive"}
                                    data-testid={`badge-variance-${item.id}`}
                                  >
                                    {snapshot.closingStock - snapshot.openingStock > 0 ? '+' : ''}
                                    {snapshot.closingStock - snapshot.openingStock} variance
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-end">
                          {!isHistoricalDate && (
                            <div className="d-flex gap-2">
                              {!hasSnapshot ? (
                                <Button 
                                  size="sm" 
                                  className="bg-info text-white"
                                  onClick={() => handleCreateSnapshot(item)}
                                  data-testid={`button-create-snapshot-${item.id}`}
                                >
                                  <Calendar className="w-4 h-4 me-1" />
                                  Create Snapshot
                                </Button>
                              ) : !isClosed ? (
                                <Button 
                                  size="sm" 
                                  className="bg-warning text-white"
                                  onClick={() => handleCloseSnapshot(snapshot)}
                                  data-testid={`button-close-snapshot-${item.id}`}
                                >
                                  <Lock className="w-4 h-4 me-1" />
                                  Close
                                </Button>
                              ) : (
                                <Badge variant="secondary" data-testid={`badge-completed-${item.id}`}>
                                  Completed
                                </Badge>
                              )}
                            </div>
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

      {/* Create Snapshot Dialog */}
      <Dialog open={snapshotDialogOpen} onOpenChange={setSnapshotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Opening Inventory Snapshot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Item: {selectedItem?.item?.name}</Label>
            </div>
            <div>
              <Label htmlFor="openingStock">Opening Stock</Label>
              <Input
                id="openingStock"
                type="number"
                min="0"
                value={openingStock}
                onChange={(e) => setOpeningStock(e.target.value)}
                placeholder="Enter opening stock"
                data-testid="input-opening-stock"
              />
            </div>
            <div className="d-flex gap-2">
              <Button 
                onClick={handleSnapshotSubmit}
                disabled={!openingStock || createSnapshotMutation.isPending}
                data-testid="button-confirm-snapshot"
              >
                {createSnapshotMutation.isPending ? "Creating..." : "Create Snapshot"}
              </Button>
              <Button variant="outline" onClick={() => setSnapshotDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Snapshot Dialog */}
      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Inventory Snapshot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Item: {selectedItem?.item?.name}</Label>
            </div>
            <div>
              <Label>Opening Stock: {selectedItem?.openingStock}</Label>
            </div>
            <div>
              <Label htmlFor="closingStock">Closing Stock</Label>
              <Input
                id="closingStock"
                type="number"
                min="0"
                value={closingStock}
                onChange={(e) => setClosingStock(e.target.value)}
                placeholder="Enter closing stock"
                data-testid="input-closing-stock"
              />
            </div>
            <div className="d-flex gap-2">
              <Button 
                onClick={handleCloseSubmit}
                disabled={!closingStock || closeSnapshotMutation.isPending}
                data-testid="button-confirm-close"
              >
                {closeSnapshotMutation.isPending ? "Closing..." : "Close Snapshot"}
              </Button>
              <Button variant="outline" onClick={() => setCloseDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
