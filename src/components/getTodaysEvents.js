export const getTodaysEvents = () => {
    const saved = localStorage.getItem('calendarEvents');
    if (!saved) return [];
  
    const today = new Date();
    const events = JSON.parse(saved);
  
    return events.filter(e => {
      const start = new Date(e.start);
      return (
        start.getFullYear() === today.getFullYear() &&
        start.getMonth() === today.getMonth() &&
        start.getDate() === today.getDate()
      );
    });
  };
  