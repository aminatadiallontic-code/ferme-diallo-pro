import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, PaginatedResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Eye, CheckCircle, XCircle, Edit, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { OrderForm } from "@/components/OrderForm";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Order {
  id: number;
  client_id: number;
  client: {
    id: number;
    name: string;
    phone: string;
  };
  order_date: string;
  status: "brouillon" | "confirmé" | "annulé";
  total_amount: number;
  items: Array<{
    id: number;
    stock_item_id: number;
    stock_item: {
      id: number;
      name: string;
      category: string;
      unit: string;
    };
    quantity: number;
    unit_price: number;
    line_total: number;
  }>;
  created_at: string;
  updated_at: string;
}

const statusColors = {
  brouillon: "bg-yellow-100 text-yellow-800",
  confirmé: "bg-green-100 text-green-800",
  annulé: "bg-red-100 text-red-800",
};

const statusLabels = {
  brouillon: "Brouillon",
  confirmé: "Confirmé",
  annulé: "Annulé",
};

export function Orders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState<Order | null>(null);
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading, error } = useQuery({
    queryKey: ["orders", search, statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: "20",
      });
      
      if (search) params.append("q", search);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await api.get<PaginatedResponse<Order>>(`/api/orders?${params}`);
      return response;
    },
  });

  const confirmOrderMutation = useMutation({
    mutationFn: (orderId: number) => api.post(`/api/orders/${orderId}/confirm`, {}),
    onSuccess: () => {
      toast({ title: "Succès", description: "Commande confirmée avec succès" });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err) => {
      const parsed = JSON.parse(err.message);
      toast({ title: "Erreur", description: parsed.message, variant: "destructive" });
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: number) => api.post(`/api/orders/${orderId}/cancel`, {}),
    onSuccess: () => {
      toast({ title: "Succès", description: "Commande annulée avec succès" });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err) => {
      const parsed = JSON.parse(err.message);
      toast({ title: "Erreur", description: parsed.message, variant: "destructive" });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (orderId: number) => api.delete(`/api/orders/${orderId}`),
    onSuccess: () => {
      toast({ title: "Succès", description: "Commande supprimée avec succès" });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err) => {
      const parsed = JSON.parse(err.message);
      toast({ title: "Erreur", description: parsed.message, variant: "destructive" });
    },
  });

  const handleConfirmOrder = (orderId: number) => {
    if (confirm("Êtes-vous sûr de vouloir confirmer cette commande ? Le stock sera décrémenté.")) {
      confirmOrderMutation.mutate(orderId);
    }
  };

  const handleCancelOrder = (orderId: number) => {
    if (confirm("Êtes-vous sûr de vouloir annuler cette commande ?")) {
      cancelOrderMutation.mutate(orderId);
    }
  };

  const handleDeleteOrder = (orderId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.")) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">Erreur lors du chargement des commandes</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Commandes</h1>
          <p className="text-muted-foreground">Gérez les commandes clients</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle commande
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingOrder ? "Modifier la commande" : "Nouvelle commande"}</DialogTitle>
              <DialogDescription>
                {editingOrder ? "Modifiez les informations de la commande" : "Créez une nouvelle commande"}
              </DialogDescription>
            </DialogHeader>
            <OrderForm
              order={editingOrder}
              onSuccess={() => {
                setShowForm(false);
                setEditingOrder(null);
                queryClient.invalidateQueries({ queryKey: ["orders"] });
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingOrder(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une commande..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="brouillon">Brouillon</SelectItem>
            <SelectItem value="confirmé">Confirmé</SelectItem>
            <SelectItem value="annulé">Annulé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <div className="space-y-4">
          {ordersData?.data?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Aucune commande trouvée</p>
              </CardContent>
            </Card>
          ) : (
            ordersData?.data?.map((order: Order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Commande #{order.id}</CardTitle>
                      <CardDescription>
                        {format(new Date(order.order_date), "d MMMM yyyy", { locale: fr })} • {order.client.name}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                      <span className="font-semibold">{order.total_amount.toLocaleString()} GNF</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Articles ({order.items.length})</p>
                      <div className="space-y-1">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.quantity} {item.stock_item.unit} × {item.stock_item.name}</span>
                            <span>{item.line_total.toLocaleString()} GNF</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-sm text-muted-foreground">
                            +{order.items.length - 3} autre(s) article(s)
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDetails(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                        
                        {order.status === "brouillon" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleConfirmOrder(order.id)}
                              disabled={confirmOrderMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirmer
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={cancelOrderMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Annuler
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingOrder(order)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Modifier
                            </Button>
                          </>
                        )}
                        
                        {order.status !== "confirmé" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteOrder(order.id)}
                            disabled={deleteOrderMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {ordersData && ordersData.last_page > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Précédent
          </Button>
          <span className="py-2 px-4 text-sm">
            Page {page} sur {ordersData.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === ordersData.last_page}
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={!!showDetails} onOpenChange={() => setShowDetails(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la commande #{showDetails?.id}</DialogTitle>
          </DialogHeader>
          {showDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Client</p>
                  <p>{showDetails.client.name}</p>
                  <p className="text-sm text-muted-foreground">{showDetails.client.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p>{format(new Date(showDetails.order_date), "d MMMM yyyy", { locale: fr })}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Statut</p>
                  <Badge className={statusColors[showDetails.status]}>
                    {statusLabels[showDetails.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Total</p>
                  <p className="font-semibold">{showDetails.total_amount.toLocaleString()} GNF</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Articles</p>
                <div className="space-y-2">
                  {showDetails.items.map((item) => (
                    <div key={item.id} className="flex justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{item.stock_item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} {item.stock_item.unit} × {item.unit_price.toLocaleString()} GNF
                        </p>
                      </div>
                      <p className="font-semibold">{item.line_total.toLocaleString()} GNF</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
