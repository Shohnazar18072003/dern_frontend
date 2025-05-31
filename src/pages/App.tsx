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
import { Profile } from "@/pages/Profile";
import { KnowledgeBase } from "@/pages/KnowledgeBase";
import { Inventory } from "@/pages/Inventory";
import { JobScheduling } from "@/pages/JobScheduling";
import { Analytics } from "@/pages/Analytics";
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

              {/* Technicians */}
              <Route path="technicians" element={<Technicians />} />
              <Route
                path="technicians/:id"
                element={<div>Technician Profile</div>}
              />

              {/* Inventory Management */}
              <Route path="inventory" element={<Inventory />} />

              {/* Job Scheduling */}
              <Route path="scheduling" element={<JobScheduling />} />

              {/* Analytics */}
              <Route path="analytics" element={<Analytics />} />

              {/* Technician routes */}
              <Route
                path="technician"
                element={
                  <ProtectedRoute roles={["technician", "admin"]}>
                    <div>Technician Area</div>
                  </ProtectedRoute>
                }
              >
                <Route
                  path="available"
                  element={<div>Available Requests</div>}
                />
                <Route path="requests" element={<div>My Requests</div>} />
              </Route>

              {/* Admin routes */}
              <Route
                path="admin"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <div>Admin Area</div>
                  </ProtectedRoute>
                }
              >
                <Route path="users" element={<div>User Management</div>} />
                <Route
                  path="services"
                  element={<div>Service Management</div>}
                />
                <Route path="analytics" element={<Analytics />} />
              </Route>

              {/* Other routes */}
              <Route path="appointments" element={<div>Appointments</div>} />
              <Route path="services" element={<div>Services</div>} />
              <Route path="profile" element={<Profile />} />
              <Route path="notifications" element={<div>Notifications</div>} />
            </Route>

            {/* Catch all */}
            <Route
              path="*"
              element={<Navigate to="/app/dashboard" replace />}
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
