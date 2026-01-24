import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { FiCalendar as CalendarIcon, FiPlus, FiChevronRight, FiX } from "react-icons/fi";
import { useState } from "react";

export default function Calendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    description: ''
  });

  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const dayNumber = i - firstDay + 1;
    const isToday = dayNumber === new Date().getDate() && 
                     currentDate.getMonth() === new Date().getMonth() && 
                     currentDate.getFullYear() === new Date().getFullYear();
    const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === dayNumber && 
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });

    return {
      day: isValidDay ? dayNumber : '',
      isToday,
      events: dayEvents,
      isEmpty: !isValidDay
    };
  });

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.time) {
      const event = {
        ...newEvent,
        id: Date.now()
      };
      setEvents([...events, event]);
      setNewEvent({ title: '', date: '', time: '', description: '' });
      setShowEventForm(false);
    }
  };

  const handleDayClick = (day) => {
    if (day) {
      setNewEvent(prev => ({
        ...prev,
        date: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      }));
      setShowEventForm(true);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <h1 className="top-greeting">Calendar</h1>
          </div>
          <div className="top-bar-right">
            <button className="small" onClick={() => setShowEventForm(true)}>
              <FiPlus /> Add Event
            </button>
          </div>
        </header>

        <div className="dashboard-content-glass">
          <div className="calendar-container">
            <div className="calendar-header">
              <h2>{currentMonth}</h2>
              <div className="calendar-nav">
                <button className="ghost small" onClick={() => navigateMonth('prev')}>
                  Previous
                </button>
                <button className="ghost small" onClick={goToToday}>
                  Today
                </button>
                <button className="ghost small" onClick={() => navigateMonth('next')}>
                  Next
                </button>
              </div>
            </div>
            
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="calendar-day-header">{day}</div>
              ))}
              
              {calendarDays.map((date, index) => (
                <div 
                  key={index} 
                  className={`calendar-day ${date.isEmpty ? 'empty' : ''} ${date.isToday ? 'today' : ''} ${date.events.length > 0 ? 'has-event' : ''}`}
                  onClick={() => handleDayClick(date.day)}
                >
                  {date.day && (
                    <>
                      <span className="day-number">{date.day}</span>
                      {date.events.length > 0 && (
                        <div className="event-indicator">
                          {date.events.length}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="modal-overlay" onClick={() => setShowEventForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Event</h3>
              <button className="ghost small" onClick={() => setShowEventForm(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Enter event title"
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Enter event description (optional)"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="ghost small" onClick={() => setShowEventForm(false)}>
                Cancel
              </button>
              <button onClick={handleAddEvent}>
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
