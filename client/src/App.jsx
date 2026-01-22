import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Calendar from "./pages/Calendar.jsx";
import MyTasks from "./pages/MyTasks.jsx";
import Statistics from "./pages/Statistics.jsx";
import Documents from "./pages/Documents.jsx";
import RequireAuth from "./components/RequireAuth.jsx";

export default function App() {
  return (
    <>
      <div className="app-background"></div>
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/calendar"
        element={
          <RequireAuth>
            <Calendar />
          </RequireAuth>
        }
      />
      <Route
        path="/tasks"
        element={
          <RequireAuth>
            <MyTasks />
          </RequireAuth>
        }
      />
      <Route
        path="/statistics"
        element={
          <RequireAuth>
            <Statistics />
          </RequireAuth>
        }
      />
      <Route
        path="/documents"
        element={
          <RequireAuth>
            <Documents />
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
