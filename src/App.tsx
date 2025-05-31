import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Dashboard } from "@/pages/Dashboard";
import { SupportRequests } from "@/pages/SupportRequests";
import { CreateSupportRequest } from "@/pages/CreateSupportRequest";
import { SupportRequestDetails } from "@/pages/SupportRequestDetails";
import { Technicians } from "@/pages/Technicians";
import { TechnicianProfile } from "@/pages/TechnicianProfile";
import { Profile } from "@/pages/Profile";
import { KnowledgeBase } from "@/pages/KnowledgeBase";
import { ArticleDetails } from "@/pages/ArticleDetails";
import { Inventory } from "@/pages/Inventory";
import { JobScheduling } from "@/pages/JobScheduling";
import { Analytics } from "@/pages/Analytics";
import { Appointments } from "@/pages/Appointments";
import { CreateAppointment } from "@/pages/CreateAppointment";
import { Services } from "@/pages/Services";
import { Notifications } from "@/pages/Notifications";
import { UserManagement } from "@/pages/admin/UserManagement";
import { ServiceManagement } from "@/pages/admin/ServiceManagement";
import { TechnicianDashboard } from "@/pages/technician/TechnicianDashboard";
import { AvailableRequests } from "@/pages/technician/AvaliableRequests";
import { MyRequests } from "@/pages/technician/MyRequests";
import { ForgotPassword } from "@/pages/ForgotPassword";
import { Unauthorized } from "@/pages/Unauthorized";
import { ThemeProvider } from "@/components/theme-provider";
import { Landing } from "@/pages/Landing";

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <Router>
          <Routes>
            {/* Landing page */}
            <Route path="/" element={<Landing />} />

            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Support Requests */}
              <Route path="support-requests" element={<SupportRequests />} />
              <Route
                path="support-requests/new"
                element={<CreateSupportRequest />}
              />
              <Route
                path="support-requests/:id"
                element={<SupportRequestDetails />}
              />

              {/* Knowledge Base */}
              <Route path="knowledge-base" element={<KnowledgeBase />} />
              <Route path="knowledge-base/:id" element={<ArticleDetails />} />

              {/* Technicians */}
              <Route path="technicians" element={<Technicians />} />
              <Route path="technicians/:id" element={<TechnicianProfile />} />

              {/* Appointments */}
              <Route path="appointments" element={<Appointments />} />
              <Route path="appointments/new" element={<CreateAppointment />} />

              {/* Services */}
              <Route path="services" element={<Services />} />

              {/* Inventory Management */}
              <Route
                path="inventory"
                element={
                  <ProtectedRoute roles={["technician", "admin"]}>
                    <Inventory />
                  </ProtectedRoute>
                }
              />

              {/* Job Scheduling */}
              <Route
                path="scheduling"
                element={
                  <ProtectedRoute roles={["technician", "admin"]}>
                    <JobScheduling />
                  </ProtectedRoute>
                }
              />

              {/* Analytics */}
              <Route
                path="analytics"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />

              {/* Technician routes */}
              <Route
                path="technician"
                element={
                  <ProtectedRoute roles={["technician", "admin"]}>
                    <TechnicianDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="technician/available"
                element={
                  <ProtectedRoute roles={["technician", "admin"]}>
                    <AvailableRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="technician/requests"
                element={
                  <ProtectedRoute roles={["technician", "admin"]}>
                    <MyRequests />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/services"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <ServiceManagement />
                  </ProtectedRoute>
                }
              />

              {/* Profile and Settings */}
              <Route path="profile" element={<Profile />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
