import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AppNavbar from './components/AppNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ComplaintProvider } from './context/ComplaintContext';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import ComplaintDetails from './pages/ComplaintDetails';
import Dashboard from './pages/Dashboard';
import Feedback from './pages/Feedback';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

const App = () => (
  <AuthProvider>
    <ComplaintProvider>
      <BrowserRouter>
        <AppNavbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute roles={["USER"]} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/complaints/:id/feedback" element={<Feedback />} />
            </Route>

            <Route element={<ProtectedRoute roles={["AGENT"]} />}>
              <Route path="/agent" element={<AgentDashboard />} />
            </Route>

            <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/complaints/:id" element={<ComplaintDetails />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <ToastContainer position="top-right" autoClose={2500} newestOnTop />
      </BrowserRouter>
    </ComplaintProvider>
  </AuthProvider>
);

export default App;
