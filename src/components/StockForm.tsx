import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Pill, Egg, Save, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface StockItem {
  id: number;
  name: string;
  category: 'aliments' | 'vaccins' | 'oeufs';
  quantity: number;
  unit: string;
  threshold: number;
  last_update: string | null;
}

interface StockFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const StockForm: React.FC<StockFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "" as 'aliments' | 'vaccins' | 'oeufs' | "",
    quantity: "",
    unit: "",
    threshold: ""
  });

  const queryClient = useQueryClient();

  const createStockMutation = useMutation({
    mutationFn: (data: Omit<StockItem, 'id' | 'last_update'>) => 
      api.post<StockItem>("/api/stock-items", data),
    onSuccess: () => {
      toast({ title: "Succès", description: "Article de stock ajouté avec succès" });
      queryClient.invalidateQueries({ queryKey: ["stock-items"] });
      onSuccess();
    },
    onError: (err) => {
      const parsed = JSON.parse(err.message);
      toast({ title: "Erreur", description: parsed.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.quantity || !formData.unit || !formData.threshold) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs", variant: "destructive" });
      return;
    }

    createStockMutation.mutate({
      name: formData.name,
      category: formData.category,
      quantity: parseInt(formData.quantity),
      unit: formData.unit,
      threshold: parseInt(formData.threshold)
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const categoryIcons = { aliments: Package, vaccins: Pill, oeufs: Egg };
  const categoryLabels = { aliments: 'Aliments', vaccins: 'Vaccins', oeufs: 'Œufs' };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Ajouter un article au stock
        </CardTitle>
        <CardDescription>
          Ajoutez un nouvel article pour que les clients puissent le commander
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'article</Label>
            <Input
              id="name"
              placeholder="Ex: Poulet fermier"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([key, label]) => {
                  const Icon = categoryIcons[key as keyof typeof categoryIcons];
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon size={14} />
                        {label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité initiale</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unité</Label>
              <Input
                id="unit"
                placeholder="Ex: kg, litres, pièces"
                value={formData.unit}
                onChange={(e) => handleChange("unit", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold">Seuil d'alerte</Label>
            <Input
              id="threshold"
              type="number"
              placeholder="10"
              min="1"
              value={formData.threshold}
              onChange={(e) => handleChange("threshold", e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Alertez quand la quantité atteint ce niveau
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={createStockMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {createStockMutation.isPending ? "Ajout en cours..." : "Ajouter"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={createStockMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StockForm;
