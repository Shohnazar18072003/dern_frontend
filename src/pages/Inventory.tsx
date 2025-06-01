"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  Plus,
  Edit,
  Package,
  AlertTriangle,
  CheckCircle,
  Trash,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";
import api from "@/lib/api";
import type { AxiosResponse } from "axios";

interface InventoryItem {
  _id: string;
  itemName: string;
  itemCode: string;
  category: string;
  description: string;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  unitPrice: number;
  supplier: {
    name: string;
    contact?: string;
    email?: string;
  };
  location: {
    warehouse: string;
    shelf?: string;
    bin?: string;
  };
  status: "active" | "discontinued" | "out-of-stock" | "low-stock";
  lastRestocked?: string;
  assignedTo?: string;
  stockStatus?: "in-stock" | "low-stock" | "out-of-stock";
  createdAt: string;
  updatedAt: string;
}

// Update form schema to match backend schema
const formSchema = z.object({
  itemName: z
    .string()
    .min(2, {
      message: "Item name must be at least 2 characters.",
    })
    .max(100, {
      message: "Item name must not exceed 100 characters.",
    }),
  itemCode: z
    .string()
    .min(1, { message: "Item code is required." })
    .max(100, { message: "Item code must not exceed 100 characters." })
    .regex(/^[A-Z0-9-]+$/, {
      message: "Item code must be uppercase letters, numbers, or dashes.",
    }),
  category: z.enum(
    ["hardware", "software", "tools", "parts", "consumables", "equipment"],
    {
      message: "Please select a valid category.",
    }
  ),
  description: z
    .string()
    .max(500, {
      message: "Description must not exceed 500 characters.",
    })
    .optional(),
  quantity: z.number().min(0, {
    message: "Quantity must be at least 0.",
  }),
  minStockLevel: z.number().min(0, {
    message: "Minimum stock level must be at least 0.",
  }),
  maxStockLevel: z.number().min(0, {
    message: "Maximum stock level must be at least 0.",
  }),
  unitPrice: z.number().min(0, {
    message: "Unit price must be at least 0.",
  }),
  supplierName: z.string().min(2, {
    message: "Supplier name must be at least 2 characters.",
  }),
  supplierContact: z.string().optional(),
  supplierEmail: z.string().email().optional().or(z.literal("")),
  warehouse: z.string().min(1, {
    message: "Warehouse is required.",
  }),
  shelf: z.string().optional(),
  bin: z.string().optional(),
  status: z.enum(["active", "discontinued", "out-of-stock", "low-stock"]),
});

export function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemName: "",
      itemCode: "",
      category: "hardware",
      description: "",
      quantity: 0,
      minStockLevel: 5,
      maxStockLevel: 100,
      unitPrice: 0,
      supplierName: "",
      supplierContact: "",
      supplierEmail: "",
      warehouse: "Main Warehouse",
      shelf: "",
      bin: "",
      status: "active",
    },
  });

  // Fetch inventory items from API
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (categoryFilter) params.append("category", categoryFilter);
      if (statusFilter) params.append("status", statusFilter);

      const response = await api.get(`/inventory?${params.toString()}`);
      const itemsData =
        response.data.items || response.data.data || response.data || [];
      setItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (error: any) {
      console.error("Failed to fetch inventory items:", error);
      toast.error("Failed to fetch inventory items", {
        description: error.response?.data?.message || "An error occurred",
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter]);

  // Use predefined categories from backend schema
  const validCategories = useMemo(
    () => [
      "hardware",
      "software",
      "tools",
      "parts",
      "consumables",
      "equipment",
    ],
    []
  );
  const validStatuses = ["active", "discontinued", "out-of-stock", "low-stock"];

  // Set categories on component mount
  useEffect(() => {
    setCategories(validCategories);
  }, [validCategories]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Validate form data
  const validateForm = (): boolean => {
    const values = form.getValues();

    // Check for duplicate item code
    const existingCode = items.find(
      (item) =>
        item.itemCode &&
        values.itemCode &&
        item.itemCode.toLowerCase() === values.itemCode.toLowerCase() &&
        (!selectedItem || item._id !== selectedItem._id)
    );

    if (existingCode) {
      form.setError("itemCode", { message: "Item code already exists" });
      return false;
    }

    // Validate max stock level is greater than min stock level
    if (values.maxStockLevel <= values.minStockLevel) {
      form.setError("maxStockLevel", {
        message: "Maximum stock level must be greater than minimum stock level",
      });
      return false;
    }

    return true;
  };

  // Handle form submission for creating/editing items
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Structure data according to backend schema
      const itemData = {
        itemName: values.itemName,
        itemCode: values.itemCode.toUpperCase(),
        category: values.category,
        description: values.description || "",
        quantity: Number(values.quantity),
        minStockLevel: Number(values.minStockLevel),
        maxStockLevel: Number(values.maxStockLevel),
        unitPrice: Number(values.unitPrice),
        supplier: {
          name: values.supplierName,
          contact: values.supplierContact || "",
          email: values.supplierEmail || "",
        },
        location: {
          warehouse: values.warehouse,
          shelf: values.shelf || "",
          bin: values.bin || "",
        },
        status: values.status,
      };

      let response: AxiosResponse<any, any>;

      if (selectedItem) {
        // Update existing item
        response = await api.put(`/inventory/${selectedItem._id}`, itemData);
        toast.success("Item updated successfully");

        // Update item in local state
        const updatedItem = response.data.item || response.data;
        const completeUpdatedItem: InventoryItem = {
          _id: selectedItem._id,
          ...itemData,
          createdAt: selectedItem.createdAt,
          updatedAt: updatedItem.updatedAt || new Date().toISOString(),
          ...updatedItem,
        };

        setItems((prev) =>
          prev.map((item) =>
            item._id === selectedItem._id ? completeUpdatedItem : item
          )
        );

        setIsEditDialogOpen(false);
      } else {
        // Create new item
        response = await api.post("/inventory", itemData);
        toast.success("Item added to inventory successfully");

        // Add new item to local state
        const newItem = response.data.item || response.data;
        const completeNewItem: InventoryItem = {
          _id: newItem._id || `temp_${Date.now()}`,
          ...itemData,
          createdAt: newItem.createdAt || new Date().toISOString(),
          updatedAt: newItem.updatedAt || new Date().toISOString(),
          ...newItem,
        };

        setItems((prev) => [...prev, completeNewItem]);
        setIsAddDialogOpen(false);
      }

      // Reset form
      form.reset();
      setSelectedItem(null);
    } catch (error: any) {
      console.error("Failed to save item:", error);
      toast.error(
        selectedItem ? "Failed to update item" : "Failed to add item",
        {
          description: error.response?.data?.message || "An error occurred",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle item deletion
  const handleDelete = async (itemId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this item? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/inventory/${itemId}`);
      setItems((prev) => prev.filter((item) => item._id !== itemId));
      toast.success("Item deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete item:", error);
      toast.error("Failed to delete item", {
        description: error.response?.data?.message || "An error occurred",
      });
    }
  };

  // Open edit dialog and populate form
  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    form.reset({
      itemName: item.itemName,
      itemCode: item.itemCode,
      category: (
        [
          "hardware",
          "software",
          "tools",
          "parts",
          "consumables",
          "equipment",
        ] as readonly string[]
      ).includes(item.category)
        ? (item.category as
            | "hardware"
            | "software"
            | "tools"
            | "parts"
            | "consumables"
            | "equipment")
        : "hardware",
      description: item.description || "",
      quantity: item.quantity,
      minStockLevel: item.minStockLevel,
      maxStockLevel: item.maxStockLevel,
      unitPrice: item.unitPrice,
      supplierName: item.supplier.name,
      supplierContact: item.supplier.contact || "",
      supplierEmail: item.supplier.email || "",
      warehouse: item.location.warehouse,
      shelf: item.location.shelf || "",
      bin: item.location.bin || "",
      status: item.status,
    });
    setIsEditDialogOpen(true);
  };

  // Reset form and close dialogs
  const resetForm = () => {
    form.reset();
    setSelectedItem(null);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(search.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "low-stock":
        return <AlertTriangle className="h-4 w-4" />;
      case "out-of-stock":
        return <XCircle className="h-4 w-4" />;
      case "discontinued":
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "low-stock":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "out-of-stock":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "discontinued":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  // Get stock status based on quantity and min stock level
  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return "out-of-stock";
    if (item.quantity <= item.minStockLevel) return "low-stock";
    return "in-stock";
  };

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
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
              <DialogDescription>
                Add a new spare part or component to the inventory
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                {/* Basic Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="itemName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Item Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="itemCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Item Code (e.g. ABC-123)"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {validCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() +
                                  category.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {validStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() +
                                  status.slice(1).replace("-", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Stock Information */}
                <div className="grid gap-4 md:grid-cols-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Quantity"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minStockLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Stock Level</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Min Stock"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxStockLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Stock Level</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Max Stock"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unitPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Price"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Supplier Information */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Supplier Information
                  </Label>
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="supplierName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supplier Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Supplier Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="supplierContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Contact Number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="supplierEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Location Information
                  </Label>
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="warehouse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Warehouse</FormLabel>
                          <FormControl>
                            <Input placeholder="Warehouse" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shelf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shelf</FormLabel>
                          <FormControl>
                            <Input placeholder="Shelf" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bin</FormLabel>
                          <FormControl>
                            <Input placeholder="Bin" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Item"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
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
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={statusFilter || "all"}
                onValueChange={(value) =>
                  setStatusFilter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {validStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() +
                        status.slice(1).replace("-", " ")}
                    </SelectItem>
                  ))}
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
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {items.filter((item) => item.status === "active").length}
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
              {
                items.filter((item) => getStockStatus(item) === "low-stock")
                  .length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {
                items.filter((item) => getStockStatus(item) === "out-of-stock")
                  .length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Items */}
      <div className="grid gap-4">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No items found</h3>
              <p className="text-muted-foreground text-center">
                {loading
                  ? "Loading inventory items..."
                  : "No inventory items match your current filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => {
            const stockStatus = getStockStatus(item);
            return (
              <Card
                key={item._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">
                          {item.itemName}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <span className="group relative">
                            <Badge className={`${getStatusColor(item.status)} border`}>
                              {getStatusIcon(item.status)}
                              <span className="ml-1 capitalize">
                                {item.status.replace("-", " ")}
                              </span>
                            </Badge>
                            <span className="absolute left-1/2 -translate-x-1/2 mt-1 z-10 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                              Status (set by user)
                            </span>
                          </span>
                          <span className="group relative">
                            <Badge className={`${getStatusColor(stockStatus)} border`}>
                              <span className="capitalize">
                                {stockStatus.replace("-", " ")}
                              </span>
                            </Badge>
                            <span className="absolute left-1/2 -translate-x-1/2 mt-1 z-10 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                              Stock Status (calculated)
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Item Code:
                          </span>
                          <p className="font-medium">{item.itemCode}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Category:
                          </span>
                          <p className="font-medium">{item.category}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Quantity:
                          </span>
                          <p className="font-medium">{item.quantity} units</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Unit Price:
                          </span>
                          <p className="font-medium">${item.unitPrice}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Stock Range:
                          </span>
                          <p className="font-medium">
                            {item.minStockLevel} - {item.maxStockLevel}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Supplier:
                          </span>
                          <p className="font-medium">{item.supplier.name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Location:
                          </span>
                          <p className="font-medium">
                            {item.location.warehouse}
                            {item.location.shelf && ` - ${item.location.shelf}`}
                            {item.location.bin && ` - ${item.location.bin}`}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Total Value:
                          </span>
                          <p className="font-medium">
                            ${(item.quantity * item.unitPrice).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {item.description && (
                        <p className="text-muted-foreground mt-2">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-2 text-xs text-muted-foreground">
                        <span>Updated: </span>
                        {item.updatedAt &&
                        typeof item.updatedAt === "string" &&
                        item.updatedAt.trim() !== ""
                          ? formatDateTime(item.updatedAt)
                          : "N/A"}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item._id)}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Edit an existing spare part or component in the inventory
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Same form fields as Add dialog */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="itemName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Item Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="itemCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Item Code (e.g. ABC-123)"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {validCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() +
                                category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {validStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() +
                                status.slice(1).replace("-", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Quantity"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="minStockLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Stock Level</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Min Stock"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxStockLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Stock Level</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Max Stock"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Price"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Supplier Information
                </Label>
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="supplierName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Supplier Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="supplierContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="supplierEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Location Information
                </Label>
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="warehouse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warehouse</FormLabel>
                        <FormControl>
                          <Input placeholder="Warehouse" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shelf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shelf</FormLabel>
                        <FormControl>
                          <Input placeholder="Shelf" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bin</FormLabel>
                        <FormControl>
                          <Input placeholder="Bin" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Item"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
