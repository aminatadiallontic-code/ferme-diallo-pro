import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Client {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address: string;
  status: string;
}

interface StockItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  threshold: number;
}

interface OrderItem {
  stock_item_id: number;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface Order {
  id?: number;
  client_id: number;
  order_date: string;
  status?: "brouillon" | "confirmé" | "annulé";
  total_amount: number;
  items: OrderItem[];
}

interface OrderFormProps {
  order?: Order | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function OrderForm({ order, onSuccess, onCancel }: OrderFormProps) {
  const [formData, setFormData] = useState({
    client_id: order?.client_id || "",
    order_date: order?.order_date || new Date().toISOString().split('T')[0],
    items: order?.items || [] as OrderItem[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const response = await api.get<{data: Client[]}>("/api/clients");
      return response.data;
    },
  });

  const { data: stockItems, isLoading: stockLoading } = useQuery({
    queryKey: ["stock-items"],
    queryFn: async () => {
      const response = await api.get<{data: StockItem[]}>("/api/stock-items");
      return response.data;
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: (payload: typeof formData) => api.post("/api/orders", payload),
    onSuccess: () => {
      toast({ title: "Succès", description: "Commande créée avec succès" });
      onSuccess();
    },
    onError: (err) => {
      const parsed = JSON.parse(err.message);
      if (parsed.errors) setErrors(parsed.errors);
      toast({ title: "Erreur", description: parsed.message, variant: "destructive" });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: (payload: typeof formData) => api.put(`/api/orders/${order!.id}`, payload),
    onSuccess: () => {
      toast({ title: "Succès", description: "Commande mise à jour avec succès" });
      onSuccess();
    },
    onError: (err) => {
      const parsed = JSON.parse(err.message);
      if (parsed.errors) setErrors(parsed.errors);
      toast({ title: "Erreur", description: parsed.message, variant: "destructive" });
    },
  });

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { stock_item_id: 0, quantity: 1, unit_price: 0, line_total: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: number) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Recalculate line_total
      if (field === 'quantity' || field === 'unit_price') {
        newItems[index].line_total = newItems[index].quantity * newItems[index].unit_price;
      }
      
      return { ...prev, items: newItems };
    });
  };

  const getTotalAmount = () => {
    return formData.items.reduce((sum, item) => sum + item.line_total, 0);
  };

  const getStockItemName = (stockItemId: number) => {
    const item = stockItems?.find(s => s.id === stockItemId);
    return item ? item.name : "";
  };

  const getStockItemInfo = (stockItemId: number) => {
    const item = stockItems?.find(s => s.id === stockItemId);
    return item;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      ...formData,
      total_amount: getTotalAmount(),
    };

    if (order) {
      updateOrderMutation.mutate(payload);
    } else {
      createOrderMutation.mutate(payload);
    }
  };

  const isSubmitting = createOrderMutation.isPending || updateOrderMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client_id">Client *</Label>
          <Select
            value={formData.client_id.toString()}
            onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: parseInt(value) }))}
            disabled={clientsLoading}
          >
            <SelectTrigger className={errors.client_id ? "border-red-500" : ""}>
              <SelectValue placeholder="Sélectionner un client" />
            </SelectTrigger>
            <SelectContent>
              {clients?.map((client: Client) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.name} - {client.phone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.client_id && <p className="text-sm text-red-500">{errors.client_id}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="order_date">Date de commande *</Label>
          <Input
            id="order_date"
            type="date"
            value={formData.order_date}
            onChange={(e) => setFormData(prev => ({ ...prev, order_date: e.target.value }))}
            className={errors.order_date ? "border-red-500" : ""}
          />
          {errors.order_date && <p className="text-sm text-red-500">{errors.order_date}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Articles de la commande</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            Ajouter un article
          </Button>
        </div>

        {formData.items.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Aucun article ajouté</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {formData.items.map((item, index) => {
              const stockItem = getStockItemInfo(item.stock_item_id);
              return (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm">Article #{index + 1}</CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Article</Label>
                        <Select
                          value={item.stock_item_id.toString()}
                          onValueChange={(value) => updateItem(index, 'stock_item_id', parseInt(value))}
                          disabled={stockLoading}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Article" />
                          </SelectTrigger>
                          <SelectContent>
                            {stockItems?.map((stockItem: StockItem) => (
                              <SelectItem key={stockItem.id} value={stockItem.id.toString()}>
                                <div>
                                  <div>{stockItem.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Stock: {stockItem.quantity} {stockItem.unit}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Quantité</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Prix unitaire (GNF)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', parseInt(e.target.value) || 0)}
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Total</Label>
                        <div className="text-sm font-semibold p-2 bg-muted rounded">
                          {item.line_total.toLocaleString()} GNF
                        </div>
                      </div>
                    </div>

                    {stockItem && stockItem.quantity < item.quantity && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                        <Badge variant="destructive" className="text-xs">
                          Stock insuffisant
                        </Badge>
                        <span className="text-xs text-red-600">
                          Disponible: {stockItem.quantity} {stockItem.unit}, Demandé: {item.quantity} {stockItem.unit}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Separator />

      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold">
          Total: {getTotalAmount().toLocaleString()} GNF
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || formData.items.length === 0}
          >
            <Save className="h-4 w-4 mr-1" />
            {isSubmitting ? "Enregistrement..." : (order ? "Mettre à jour" : "Créer la commande")}
          </Button>
        </div>
      </div>
    </form>
  );
}
