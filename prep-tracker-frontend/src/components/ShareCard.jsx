function generateShareImage(stats, dailyGoal) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 1080, 1080);
  bg.addColorStop(0, "#1a1a1d");
  bg.addColorStop(1, "#131315");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1080);

  // Grid pattern (subtle)
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x < 1080; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1080);
    ctx.stroke();
  }
  for (let y = 0; y < 1080; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1080, y);
    ctx.stroke();
  }

  // Glow circle behind fire emoji
  const glow = ctx.createRadialGradient(540, 380, 50, 540, 380, 300);
  glow.addColorStop(0, "rgba(255,107,74,0.35)");
  glow.addColorStop(1, "rgba(255,107,74,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1080, 1080);

  // Fire emoji (big)
  ctx.font = "160px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🔥", 540, 420);

  // Streak number
  ctx.fillStyle = "#ff6b4a";
  ctx.font = "bold 140px Segoe UI, sans-serif";
  ctx.fillText(`${stats.current_streak}`, 540, 600);

  // "Day Streak" label
  ctx.fillStyle = "#f5f5f7";
  ctx.font = "bold 48px Segoe UI, sans-serif";
  ctx.fillText("DAY STREAK", 540, 660);

  // Divider line
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(240, 740);
  ctx.lineTo(840, 740);
  ctx.stroke();

  // Stats row
  ctx.font = "bold 44px Segoe UI, sans-serif";
  ctx.fillStyle = "#f5f5f7";
  ctx.fillText(`${stats.total_problems}`, 340, 830);
  ctx.fillText(`${stats.longest_streak}`, 740, 830);

  ctx.font = "28px Segoe UI, sans-serif";
  ctx.fillStyle = "#8e8e96";
  ctx.fillText("Total Problems", 340, 870);
  ctx.fillText("Best Streak", 740, 870);

  // Branding
  ctx.font = "bold 36px Segoe UI, sans-serif";
  ctx.fillStyle = "#ff6b4a";
  ctx.fillText("🎯 Prep Tracker", 540, 980);

  ctx.font = "24px Segoe UI, sans-serif";
  ctx.fillStyle = "#8e8e96";
  ctx.fillText(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }), 540, 1020);

  return canvas;
}

function ShareCard({ stats }) {
  function handleShare() {
    const canvas = generateShareImage(stats);
    const link = document.createElement("a");
    link.download = "my-prep-streak.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <button className="btn-primary share-btn" onClick={handleShare}>
      📤 Share My Progress
    </button>
  );
}

export default ShareCard;