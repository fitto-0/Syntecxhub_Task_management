import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { FiCalendar as CalendarIcon } from "react-icons/fi";

export default function Calendar() {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <h1 className="top-greeting">Calendar</h1>
          </div>
        </header>

        <div className="dashboard-content-glass">
          <div className="empty-page-state">
            <CalendarIcon className="empty-page-icon" />
            <h2>Calendar View</h2>
            <p>Your calendar view will appear here. This feature is coming soon!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
