// Builds a GitHub-style contribution grid for the last ~12 weeks.
// `entries` = array of { date: "YYYY-MM-DD", problems_solved: number }
import "./StreakCalendar.css";

function StreakCalendar({ entries }) {
  // Map of date string -> problems solved that day (for quick lookup)
  const entryMap = {};
  entries.forEach((e) => {
    entryMap[e.date] = (entryMap[e.date] || 0) + e.problems_solved;
  });

  // Decide color intensity based on activity level
  function getLevel(count) {
    if (!count) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
  }

  // Build last 12 weeks (84 days), starting from the earliest Sunday
  const today = new Date();
  const totalDays = 84;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - totalDays + 1);
  // Roll back to the previous Sunday so weeks align in columns
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const weeks = [];
  let currentWeek = [];
  const cursor = new Date(startDate);

  while (cursor <= today || currentWeek.length > 0) {
    if (cursor > today && currentWeek.length === 0) break;

    const dateStr = cursor.toISOString().slice(0, 10);
    const count = entryMap[dateStr] || 0;

    currentWeek.push({
      date: dateStr,
      count,
      level: cursor > today ? -1 : getLevel(count), // -1 = future, don't render
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    cursor.setDate(cursor.getDate() + 1);

    if (cursor > today && currentWeek.length > 0 && currentWeek.length < 7) {
      // pad the final partial week with empty future days
      while (currentWeek.length < 7) {
        currentWeek.push({ date: null, count: 0, level: -1 });
      }
      weeks.push(currentWeek);
      currentWeek = [];
      break;
    }
  }

  return (
    <div className="streak-calendar card">
      <h2>Activity</h2>
      <div className="calendar-grid">
        {weeks.map((week, wi) => (
          <div className="calendar-col" key={wi}>
            {week.map((day, di) => (
              <div
                key={di}
                className={`calendar-cell level-${day.level}`}
                title={day.date ? `${day.date}: ${day.count} problems` : ""}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="calendar-legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((lvl) => (
          <div key={lvl} className={`calendar-cell level-${lvl}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export default StreakCalendar;