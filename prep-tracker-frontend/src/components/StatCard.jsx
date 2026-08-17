import { useState, useEffect, useRef } from "react";

function StatCard({ label, value, suffix = "", icon, accent }) {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    const target = Number(value) || 0;
    const duration = 800; // ms
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out curve for a natural "settling" feel
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * target));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    }

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [value]);

  return (
    <div className="stat-card card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <div className="stat-value" style={accent ? { color: "var(--accent)" } : {}}>
          {displayValue}{suffix}
        </div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default StatCard;