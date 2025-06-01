"use client";

import type React from "react";
import type { Technician } from "@/types";
import { useCallback, useState, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { User } from "@/types";
import api from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  UserIcon,
  Shield,
  Ban,
  CheckCircle,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";
import type { AxiosResponse } from "axios";

// --- FORM COMPONENT OUTSIDE ---

interface UserFormProps {
  formData: UserFormData;
  formErrors: Record<string, string>;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleCheckboxChange: (name: string, checked: boolean) => void;
  handleSpecializationChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  selectedUser: User | null;
}

interface UserFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  accountType: string;
  companyName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isActive: boolean;
  specialization?: string[];
  experience?: number;
  hourlyRate?: number;
}

// --- FORM COMPONENT ---
function UserForm({
  formData,
  formErrors,
  handleInputChange,
  handleSelectChange,
  handleCheckboxChange,
  handleSpecializationChange,
  selectedUser,
}: UserFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="username">
            Username <span className="text-destructive">*</span>
          </Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Enter username"
            autoComplete="off"
          />
          {formErrors.username && (
            <p className="text-sm text-destructive">{formErrors.username}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email"
            autoComplete="off"
          />
          {formErrors.email && (
            <p className="text-sm text-destructive">{formErrors.email}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">
            Password{" "}
            {!selectedUser && <span className="text-destructive">*</span>}
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder={
              selectedUser ? "Leave blank to keep current" : "Enter password"
            }
            autoComplete="new-password"
          />
          {formErrors.password && (
            <p className="text-sm text-destructive">{formErrors.password}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            Confirm Password{" "}
            {!selectedUser && <span className="text-destructive">*</span>}
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm password"
            autoComplete="new-password"
          />
          {formErrors.confirmPassword && (
            <p className="text-sm text-destructive">
              {formErrors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="role">
            Role <span className="text-destructive">*</span>
          </Label>
          <Select
            name="role"
            value={formData.role}
            onValueChange={(value) => handleSelectChange("role", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="technician">Technician</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountType">
            Account Type <span className="text-destructive">*</span>
          </Label>
          <Select
            name="accountType"
            value={formData.accountType}
            onValueChange={(value) => handleSelectChange("accountType", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.accountType === "business" && (
        <div className="space-y-2">
          <Label htmlFor="companyName">
            Company Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            placeholder="Enter company name"
            autoComplete="off"
          />
          {formErrors.companyName && (
            <p className="text-sm text-destructive">{formErrors.companyName}</p>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter phone number"
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter address"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="Enter city"
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            placeholder="Enter state"
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            placeholder="Enter ZIP code"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) =>
            handleCheckboxChange("isActive", checked as boolean)
          }
        />
        <Label htmlFor="isActive">Active account</Label>
      </div>

      {formData.role === "technician" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="specialization">
              Specializations <span className="text-destructive">*</span>
              <span className="text-xs text-muted-foreground ml-1">
                (comma-separated)
              </span>
            </Label>
            <Textarea
              id="specialization"
              name="specialization"
              value={formData.specialization?.join(", ")}
              onChange={handleSpecializationChange}
              placeholder="E.g. Electrical, Plumbing, HVAC"
            />
            {formErrors.specialization && (
              <p className="text-sm text-destructive">
                {formErrors.specialization}
              </p>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="experience">
                Experience (years) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="experience"
                name="experience"
                type="number"
                min="0"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="Years of experience"
                autoComplete="off"
              />
              {formErrors.experience && (
                <p className="text-sm text-destructive">
                  {formErrors.experience}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">
                Hourly Rate ($) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                value={formData.hourlyRate}
                onChange={handleInputChange}
                placeholder="Hourly rate"
                autoComplete="off"
              />
              {formErrors.hourlyRate && (
                <p className="text-sm text-destructive">
                  {formErrors.hourlyRate}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// --- TYPE GUARD ---
const isTechnician = (user: User): user is Technician => {
  return user.role === "technician";
};

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for creating/editing users
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    accountType: "individual",
    companyName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    isActive: true,
    specialization: [],
    experience: 0,
    hourlyRate: 0,
  });

  // Reset form data
  const resetFormData = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "customer",
      accountType: "individual",
      companyName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      isActive: true,
      specialization: [],
      experience: 0,
      hourlyRate: 0,
    });
    setFormErrors({});
  };

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (roleFilter) params.append("role", roleFilter);
      if (statusFilter) params.append("status", statusFilter);

      const response = await api.get(`/admin/users?${params.toString()}`);
      const userData = response.data.users || response.data.data || [];
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users", {
        description: error.response?.data?.message || "An error occurred",
      });

      // Mock data for development/demo
      if (process.env.NODE_ENV === "development") {
        setUsers([
          {
            _id: "1",
            id: "1",
            username: "John Smith",
            email: "john@example.com",
            role: "customer",
            accountType: "individual",
            phone: "+1234567890",
            address: "123 Main St",
            isActive: true,
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-20T14:30:00Z",
          },
          {
            _id: "2",
            id: "2",
            username: "Mike Johnson",
            email: "mike@example.com",
            role: "technician",
            accountType: "individual",
            phone: "+1234567891",
            address: "456 Tech Ave",
            isActive: true,
            specialization: ["Electrical", "Plumbing"],
            experience: 5,
            hourlyRate: 75,
            createdAt: "2024-01-10T09:00:00Z",
            updatedAt: "2024-01-18T16:45:00Z",
          } as Technician,
          {
            _id: "3",
            id: "3",
            username: "Sarah Wilson",
            email: "sarah@example.com",
            role: "customer",
            accountType: "business",
            phone: "+1234567892",
            address: "789 Business Blvd",
            companyName: "Tech Solutions Inc",
            isActive: false,
            createdAt: "2024-01-05T11:30:00Z",
            updatedAt: "2024-01-19T13:20:00Z",
          },
          {
            _id: "4",
            id: "4",
            username: "Admin User",
            email: "admin@example.com",
            role: "admin",
            accountType: "individual",
            phone: "+1234567893",
            address: "Admin Office",
            isActive: true,
            createdAt: "2024-01-01T08:00:00Z",
            updatedAt: "2024-01-20T10:00:00Z",
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle form input changes - memoized to prevent re-renders
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error for this field when user types
      setFormErrors((prev) => {
        if (prev[name]) {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        }
        return prev;
      });
    },
    []
  );

  // Handle select changes - memoized to prevent re-renders
  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    setFormErrors((prev) => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Handle checkbox changes - memoized to prevent re-renders
  const handleCheckboxChange = useCallback((name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  }, []);

  // Handle specialization input (comma-separated) - memoized to prevent re-renders
  const handleSpecializationChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const specializations = e.target.value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");

      setFormData((prev) => ({
        ...prev,
        specialization: specializations,
      }));
    },
    []
  );

  // Validate form data
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) {
      errors.username = "Username is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    // Only validate password for new users or if password field is filled
    if (!selectedUser || formData.password) {
      if (!selectedUser && !formData.password) {
        errors.password = "Password is required for new users";
      } else if (formData.password && formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    if (formData.accountType === "business" && !formData.companyName?.trim()) {
      errors.companyName = "Company name is required for business accounts";
    }

    if (formData.role === "technician") {
      if (!formData.specialization?.length) {
        errors.specialization = "At least one specialization is required";
      }

      if (!formData.experience) {
        errors.experience = "Experience is required";
      }

      if (!formData.hourlyRate) {
        errors.hourlyRate = "Hourly rate is required";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission for creating/editing users
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare user data for API
      const userData = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        accountType: formData.accountType,
        isActive: formData.isActive,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
        companyName:
          formData.accountType === "business"
            ? formData.companyName
            : undefined,
        ...(formData.role === "technician" && {
          specialization: formData.specialization,
          experience: Number(formData.experience),
          hourlyRate: Number(formData.hourlyRate),
        }),
      };

      // Add password only if provided (for new users or password changes)
      if (formData.password) {
        Object.assign(userData, { password: formData.password });
      }

      let response: AxiosResponse<any, any>;

      if (selectedUser) {
        // Update existing user
        response = await api.put(`/admin/users/${selectedUser._id}`, userData);
        toast.success("User updated successfully");

        // Update user in local state
        setUsers((prev) =>
          prev.map((user) =>
            user._id === selectedUser._id
              ? { ...user, ...response.data.user }
              : user
          )
        );

        setIsEditDialogOpen(false);
      } else {
        // Create new user
        response = await api.post("/admin/users", userData);
        toast.success("User created successfully");

        // Add new user to local state with proper fallbacks
        const newUser = response.data.user || response.data;

        // Ensure the new user has all required fields with fallbacks
        const completeNewUser = {
          _id: newUser._id || newUser.id || `temp_${Date.now()}`,
          id: newUser.id || newUser._id || `temp_${Date.now()}`,
          username: newUser.username || formData.username,
          email: newUser.email || formData.email,
          role: newUser.role || formData.role,
          accountType: newUser.accountType || formData.accountType,
          isActive:
            newUser.isActive !== undefined
              ? newUser.isActive
              : formData.isActive,
          phone: newUser.phone || formData.phone || "",
          address: newUser.address || formData.address || "",
          city: newUser.city || formData.city || "",
          state: newUser.state || formData.state || "",
          zipCode: newUser.zipCode || formData.zipCode || "",
          companyName: newUser.companyName || formData.companyName || "",
          createdAt: newUser.createdAt || new Date().toISOString(),
          updatedAt: newUser.updatedAt || new Date().toISOString(),
          ...(formData.role === "technician" && {
            specialization:
              newUser.specialization || formData.specialization || [],
            experience:
              newUser.experience !== undefined
                ? newUser.experience
                : formData.experience,
            hourlyRate:
              newUser.hourlyRate !== undefined
                ? newUser.hourlyRate
                : formData.hourlyRate,
          }),
        };

        setUsers((prev) => [...prev, completeNewUser]);
        setIsCreateDialogOpen(false);
      }

      resetFormData();
    } catch (error: any) {
      console.error("Failed to save user:", error);
      toast.error(
        selectedUser ? "Failed to update user" : "Failed to create user",
        {
          description: error.response?.data?.message || "An error occurred",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit dialog and populate form with user data
  const handleEditUser = (user: User) => {
    setSelectedUser(user);

    // Cast user to any to access potential technician properties
    const userAsAny = user as any;

    setFormData({
      username: user.username || "",
      email: user.email || "",
      password: "", // Don't populate password
      confirmPassword: "",
      role: user.role || "customer",
      accountType: user.accountType || "individual",
      companyName: user.companyName || "",
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      zipCode: user.zipCode || "",
      isActive: user.isActive || false,
      specialization: userAsAny.specialization || [],
      experience: userAsAny.experience || 0,
      hourlyRate: userAsAny.hourlyRate || 0,
    });

    setIsEditDialogOpen(true);
  };

  // Toggle user active status
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, {
        isActive: !currentStatus,
      });

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, isActive: !currentStatus } : user
        )
      );

      toast.success(
        currentStatus
          ? "User deactivated successfully"
          : "User activated successfully"
      );
    } catch (error: any) {
      console.error("Failed to toggle user status:", error);
      toast.error("Failed to update user status", {
        description: error.response?.data?.message || "An error occurred",
      });
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((user) => user._id !== userId));
      toast.success("User deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user", {
        description: error.response?.data?.message || "An error occurred",
      });
    }
  };

  // Get role color for badge
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "technician":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "customer":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "technician":
        return <UserIcon className="h-4 w-4" />;
      case "customer":
        return <UserIcon className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !search ||
      user.username?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      (user.companyName &&
        user.companyName.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = !roleFilter || user.role === roleFilter;

    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" ? user.isActive : !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Loading state
  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // User form component (shared between create and edit) - Memoized to prevent re-renders
  const MemoizedUserForm = memo(UserForm);

  MemoizedUserForm.displayName = "MemoizedUserForm";

  // --- THE RENDER ---
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users and their permissions
          </p>
        </div>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) resetFormData();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system
              </DialogDescription>
            </DialogHeader>
            <UserForm
              formData={formData}
              formErrors={formErrors}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              handleCheckboxChange={handleCheckboxChange}
              handleSpecializationChange={handleSpecializationChange}
              selectedUser={selectedUser}
            />
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setSelectedUser(null);
              resetFormData();
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information</DialogDescription>
            </DialogHeader>
            <UserForm
              formData={formData}
              formErrors={formErrors}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              handleCheckboxChange={handleCheckboxChange}
              handleSpecializationChange={handleSpecializationChange}
              selectedUser={selectedUser}
            />
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
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
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={roleFilter || "all"}
                onValueChange={(value) =>
                  setRoleFilter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
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
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
                  setRoleFilter("");
                  setStatusFilter("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {users.filter((user) => user.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Technicians</CardTitle>
            <UserIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {users.filter((user) => user.role === "technician").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <UserIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {users.filter((user) => user.role === "customer").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-muted-foreground text-center">
                No users match your current search criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.username}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={`${getRoleColor(user.role)} border`}>
                          {getRoleIcon(user.role)}
                          <span className="ml-1 capitalize">{user.role}</span>
                        </Badge>
                        <Badge
                          variant={user.isActive ? "default" : "secondary"}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          Account Type:
                        </span>
                        <p className="font-medium capitalize">
                          {user.accountType}
                          {user.companyName && ` - ${user.companyName}`}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          Phone:
                        </span>
                        <p className="font-medium">
                          {user.phone || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Created:
                        </span>
                        <p className="font-medium">
                          {user.createdAt
                            ? typeof user.createdAt === "string" &&
                              user.createdAt.trim() !== ""
                              ? formatDateTime(user.createdAt)
                              : "N/A"
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          Address:
                        </span>
                        <p className="font-medium">
                          {user.address || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Specializations:
                        </span>
                        <p className="font-medium">
                          {isTechnician(user)
                            ? user.specialization.join(", ")
                            : "None"}
                        </p>
                      </div>
                    </div>

                    {user.role === "technician" && (
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Experience:
                          </span>
                          <p className="font-medium">
                            {isTechnician(user)
                              ? `${user.experience} years`
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Hourly Rate:
                          </span>
                          <p className="font-medium">
                            {isTechnician(user)
                              ? `$${user.hourlyRate}/hour`
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant={user.isActive ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleUserStatus(user._id!, user.isActive)}
                    >
                      {user.isActive ? (
                        <>
                          <Ban className="h-4 w-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteUser(user._id!)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
