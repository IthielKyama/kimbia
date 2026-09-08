import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Organizers } from './pages/admin/Organizers';
import { Dashboard } from './pages/admin/Dashboard';
import { Races } from './pages/admin/Races';
import { NewRace } from './pages/admin/NewRace';
import { EditRace } from './pages/admin/EditRace';
import { Leaderboard } from './pages/admin/Leaderboard';
import { Awards } from './pages/admin/Awards';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected Routes inside Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              
              {/* Super Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
                <Route path="/admin/organizers" element={<Organizers />} />
              </Route>

              {/* Race Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['RACE_ADMIN_PENDING', 'RACE_ADMIN_APPROVED']} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/races" element={<Races />} />
                <Route path="/races/new" element={<NewRace />} />
                <Route path="/races/:id" element={<EditRace />} />
                <Route path="/races/:id/edit" element={<EditRace />} />
                <Route path="/races/:id/leaderboard" element={<Leaderboard />} />
                <Route path="/awards" element={<Awards />} />
              </Route>
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
