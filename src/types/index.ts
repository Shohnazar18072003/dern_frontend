export interface User {
  _id: string
  id: string
  username: string
  email: string
  role: "customer" | "technician" | "admin"
  accountType: "individual" | "business"
  phone?: string
  address?: string
  companyName?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SupportRequest {
  _id: string
  requestId: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in-progress" | "pending-customer" | "resolved" | "closed"
  customer: User
  assignedTechnician?: User
  attachments: Attachment[]
  estimatedResolutionTime?: number
  actualResolutionTime?: number
  customerSatisfaction?: {
    rating: number
    feedback: string
    submittedAt: string
  }
  tags: string[]
  isUrgent: boolean
  lastActivity: string
  resolvedAt?: string
  closedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  _id: string
  supportRequest: string
  sender: User
  content: string
  messageType: "text" | "file" | "system" | "status-update"
  attachments: Attachment[]
  isRead: boolean
  readAt?: string
  editedAt?: string
  isEdited: boolean
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  filename: string
  originalName: string
  mimetype: string
  size: number
  url: string
  uploadedAt?: string
}

export interface Technician extends User {
  specialization: string[]
  experience: number
  hourlyRate: number
  availability: "available" | "busy" | "offline"
  rating: number
  totalReviews: number
  certifications: string[]
}

export interface Appointment {
  _id: string
  client: User
  technician: User
  startTime: string
  endTime: string
  status: "scheduled" | "completed" | "canceled"
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Service {
  _id: string
  name: string
  description: string
  price: number
  duration: number
  category: "legal" | "technical" | "consultation" | "other"
  createdAt: string
  updatedAt: string
}

export interface Notification {
  _id: string
  user: string
  type: "message" | "appointment" | "support_request" | "system"
  content: string
  isRead: boolean
  readAt?: string
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalRequests?: number
  openRequests?: number
  inProgressRequests?: number
  resolvedRequests?: number
  urgentRequests?: number
  totalCustomers?: number
  totalTechnicians?: number
  myRequests?: number
  assignedRequests?: number
  activeRequests?: number
  completedRequests?: number
  availableRequests?: number
}
