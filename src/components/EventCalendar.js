import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./EventCalendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Utility: Convert stored string dates back into Date objects
const reviveEvents = (data) => {
  try {
    return JSON.parse(data).map((event) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));
  } catch {
    return [];
  }
};

export default function EventCalendar() {
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem("calendarEvents");
    return saved ? reviveEvents(saved) : [];
  });

  // Save events on change
  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);

  // Add event on date click
  const handleSelectSlot = ({ start, end }) => {
    const title = prompt("Enter event title:");
    if (title) {
      setEvents((prev) => [
        ...prev,
        {
          title,
          start: new Date(start),
          end: new Date(end),
        },
      ]);
    }
  };

  // Remove event on click
  const handleSelectEvent = (eventToDelete) => {
    const confirmDelete = window.confirm(`Delete "${eventToDelete.title}"?`);
    if (confirmDelete) {
      setEvents((prev) =>
        prev.filter(
          (event) =>
            event.start !== eventToDelete.start ||
            event.end !== eventToDelete.end ||
            event.title !== eventToDelete.title
        )
      );
    }
  };

  return (
    <div
      style={{
        backgroundImage:
          'url("https://cdnb.artstation.com/p/assets/images/images/056/756/425/original/bencin-studios-pixelartbackground.gif?1670002516")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          popup
          style={{ height: 600 }}
        />
      </div>
    </div>
  );
}
