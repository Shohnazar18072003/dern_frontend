"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  Plus,
  Edit,
  Package,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  sku: string;
  quantity: number;
  minQuantity: number;
  price: number;
  supplier: string;
  location: string;
  description: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
  lastUpdated: string;
}

export function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Mock data - replace with API call
  useEffect(() => {
    const mockItems: InventoryItem[] = [
      {
        id: "1",
        name: "DDR4 RAM 16GB",
        category: "Memory",
        brand: "Corsair",
        model: "Vengeance LPX",
        sku: "CMK16GX4M2B3200C16",
        quantity: 25,
        minQuantity: 10,
        price: 89.99,
        supplier: "Tech Distributors Inc",
        location: "Warehouse A - Shelf 3",
        description: "16GB DDR4 3200MHz Desktop Memory",
        status: "in-stock",
        lastUpdated: "2024-01-15",
      },
      {
        id: "2",
        name: "SSD 1TB NVMe",
        category: "Storage",
        brand: "Samsung",
        model: "980 PRO",
        sku: "MZ-V8P1T0B/AM",
        quantity: 5,
        minQuantity: 8,
        price: 149.99,
        supplier: "Samsung Direct",
        location: "Warehouse A - Shelf 1",
        description: "1TB NVMe PCIe 4.0 SSD",
        status: "low-stock",
        lastUpdated: "2024-01-14",
      },
      {
        id: "3",
        name: "Graphics Card RTX 4070",
        category: "Graphics",
        brand: "NVIDIA",
        model: "GeForce RTX 4070",
        sku: "RTX4070-12GB",
        quantity: 0,
        minQuantity: 3,
        price: 599.99,
        supplier: "Graphics Solutions Ltd",
        location: "Warehouse B - Shelf 2",
        description: "12GB GDDR6X Graphics Card",
        status: "out-of-stock",
        lastUpdated: "2024-01-10",
      },
      {
        id: "4",
        name: "Power Supply 750W",
        category: "Power",
        brand: "EVGA",
        model: "SuperNOVA 750 G5",
        sku: "220-G5-0750-X1",
        quantity: 15,
        minQuantity: 5,
        price: 129.99,
        supplier: "Power Components Co",
        location: "Warehouse A - Shelf 5",
        description: "750W 80+ Gold Modular PSU",
        status: "in-stock",
        lastUpdated: "2024-01-16",
      },
    ];

    setItems(mockItems);
    setLoading(false);
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.brand.toLowerCase().includes(search.toLowerCase()) ||
      item.model.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in-stock":
        return <CheckCircle className="h-4 w-4" />;
      case "low-stock":
        return <AlertTriangle className="h-4 w-4" />;
      case "out-of-stock":
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-stock":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "low-stock":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "out-of-stock":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const categories = [...new Set(items.map((item) => item.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage spare parts and components inventory
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
              <DialogDescription>
                Add a new spare part or component to the inventory
              </DialogDescription>
            </DialogHeader>
            {/* Add form content here */}
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={categoryFilter || "all"}
                onValueChange={(value) =>
                  setCategoryFilter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={statusFilter || "all"}
                defaultValue="all"
                onValueChange={(value) =>
                  setStatusFilter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("");
                  setStatusFilter("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {items.filter((item) => item.status === "in-stock").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {items.filter((item) => item.status === "low-stock").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Package className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {items.filter((item) => item.status === "out-of-stock").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Items */}
      <div className="grid gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <Badge className={`${getStatusColor(item.status)} border`}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1 capitalize">
                        {item.status.replace("-", " ")}
                      </span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Brand:</span>
                      <p className="font-medium">{item.brand}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Model:</span>
                      <p className="font-medium">{item.model}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">SKU:</span>
                      <p className="font-medium">{item.sku}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <p className="font-medium">{item.category}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quantity:</span>
                      <p className="font-medium">{item.quantity} units</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Min Quantity:
                      </span>
                      <p className="font-medium">{item.minQuantity} units</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <p className="font-medium">${item.price}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <p className="font-medium">{item.location}</p>
                    </div>
                  </div>

                  <p className="text-muted-foreground mt-2">
                    {item.description}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No items found</h3>
            <p className="text-muted-foreground text-center">
              No inventory items match your current filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
