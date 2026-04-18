import { useState, useEffect, useRef } from "react";

const TASK_TYPES = [
  { id: "open_url", label: "Open Website", icon: "🌐", color: "#00d4ff" },
  { id: "play_video", label: "Play Video", icon: "▶️", color: "#ff4d6d" },
  { id: "play_music", label: "Play Music", icon: "🎵", color: "#a855f7" },
  { id: "open_app", label: "Open App", icon: "🖥️", color: "#22c55e" },
  { id: "show_reminder", label: "Reminder", icon: "🔔", color: "#f59e0b" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function getNextRun(time, days) {
  const now = new Date();
  const [h, m] = time.split(":").map(Number);
  for (let i = 0; i < 8; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    if (days.includes(d.getDay())) {
      d.setHours(h, m, 0, 0);
      if (d > now) return d;
    }
  }
  return null;
}

function formatNextRun(date) {
  if (!date) return "Not scheduled";
  const now = new Date();
  const diff = date - now;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `in ${days}d ${hrs % 24}h`;
  if (hrs > 0) return `in ${hrs}h ${mins % 60}m`;
  return `in ${mins}m`;
}

export default function AutoBot() {
  const [tasks, setTasks] = useState([
    {
      id: generateId(),
      name: "Morning News",
      type: "open_url",
      value: "https://news.google.com",
      time: "08:00",
      days: [1, 2, 3, 4, 5],
      enabled: true,
      lastRun: null,
    },
    {
      id: generateId(),
      name: "Chill Music",
      type: "play_music",
      value: "https://open.spotify.com/playlist/...",
      time: "09:30",
      days: [1, 2, 3, 4, 5],
      enabled: false,
      lastRun: null,
    },
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [log, setLog] = useState([]);
  const [activeNow, setActiveNow] = useState(null);
  const logRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    type: "open_url",
    value: "",
    time: "09:00",
    days: [1, 2, 3, 4, 5],
  });

  // Tick every 30s to check schedules
  useEffect(() => {
    const tick = setInterval(() => {
      const now = new Date();
      setTasks((prev) =>
        prev.map((task) => {
          if (!task.enabled) return task;
          const [h, m] = task.time.split(":").map(Number);
          if (
            now.getHours() === h &&
            now.getMinutes() === m &&
            task.days.includes(now.getDay())
          ) {
            const lastKey = `${now.toDateString()}-${task.id}`;
            if (task.lastRun !== lastKey) {
              runTask(task);
              return { ...task, lastRun: lastKey };
            }
          }
          return task;
        })
      );
    }, 30000);
    return () => clearInterval(tick);
  }, []);

  function runTask(task) {
    const typeInfo = TASK_TYPES.find((t) => t.id === task.type);
    const entry = {
      id: generateId(),
      time: new Date().toLocaleTimeString(),
      name: task.name,
      icon: typeInfo?.icon || "⚡",
      color: typeInfo?.color || "#fff",
      value: task.value,
    };
    setLog((prev) => [entry, ...prev].slice(0, 50));
    setActiveNow(task.id);
    setTimeout(() => setActiveNow(null), 3000);

    // Actually perform the task in browser context
    if (task.type === "open_url") window.open(task.value, "_blank");
    else if (task.type === "play_video") window.open(task.value, "_blank");
    else if (task.type === "play_music") window.open(task.value, "_blank");
    else if (task.type === "open_app") alert(`Opening: ${task.value}`);
    else if (task.type === "show_reminder") alert(`⏰ Reminder: ${task.name}\n${task.value}`);
  }

  function openAdd() {
    setForm({ name: "", type: "open_url", value: "", time: "09:00", days: [1, 2, 3, 4, 5] });
    setEditTask(null);
    setShowAdd(true);
  }

  function openEdit(task) {
    setForm({ name: task.name, type: task.type, value: task.value, time: task.time, days: [...task.days] });
    setEditTask(task.id);
    setShowAdd(true);
  }

  function saveTask() {
    if (!form.name || !form.value || !form.time || form.days.length === 0) return;
    if (editTask) {
      setTasks((prev) => prev.map((t) => t.id === editTask ? { ...t, ...form } : t));
    } else {
      setTasks((prev) => [...prev, { ...form, id: generateId(), enabled: true, lastRun: null }]);
    }
    setShowAdd(false);
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function toggleDay(day) {
    setForm((f) => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter((d) => d !== day) : [...f.days, day],
    }));
  }

  const enabledCount = tasks.filter((t) => t.enabled).length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#e8e8f0",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      padding: "0",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        pointerEvents: "none",
      }} />

      {/* Glow orb */}
      <div style={{
        position: "fixed", top: "-20%", right: "-10%", width: "600px", height: "600px",
        borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "900px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "40px" }}>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "4px", color: "#00d4ff", textTransform: "uppercase", marginBottom: "8px" }}>
              ◈ AUTOBOT SCHEDULER
            </div>
            <h1 style={{ fontSize: "36px", fontWeight: "700", margin: 0, letterSpacing: "-1px", color: "#fff" }}>
              Task Control
            </h1>
            <div style={{ fontSize: "13px", color: "#555", marginTop: "6px" }}>
              {enabledCount} active · {tasks.length} total
            </div>
          </div>
          <button onClick={openAdd} style={{
            background: "linear-gradient(135deg, #00d4ff, #0088aa)",
            border: "none", color: "#000", padding: "12px 24px",
            fontSize: "13px", fontWeight: "700", letterSpacing: "1px",
            cursor: "pointer", fontFamily: "inherit",
            clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
          }}>
            + NEW TASK
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "32px" }}>
          {[
            { label: "SCHEDULED", value: enabledCount, color: "#00d4ff" },
            { label: "TOTAL TASKS", value: tasks.length, color: "#a855f7" },
            { label: "LOG ENTRIES", value: log.length, color: "#22c55e" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              padding: "16px 20px",
            }}>
              <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#444", marginBottom: "6px" }}>{s.label}</div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tasks */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#444", marginBottom: "16px" }}>TASKS</div>
          {tasks.length === 0 && (
            <div style={{ textAlign: "center", color: "#333", padding: "60px", border: "1px dashed #222" }}>
              No tasks yet. Add one above.
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {tasks.map((task) => {
              const typeInfo = TASK_TYPES.find((t) => t.id === task.type);
              const nextRun = getNextRun(task.time, task.days);
              const isActive = activeNow === task.id;
              return (
                <div key={task.id} style={{
                  background: isActive ? "rgba(0,212,255,0.08)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isActive ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.06)"}`,
                  padding: "16px 20px",
                  display: "flex", alignItems: "center", gap: "16px",
                  transition: "all 0.3s ease",
                }}>
                  {/* Toggle */}
                  <div
                    onClick={() => setTasks((p) => p.map((t) => t.id === task.id ? { ...t, enabled: !t.enabled } : t))}
                    style={{
                      width: "36px", height: "20px", borderRadius: "10px", cursor: "pointer",
                      background: task.enabled ? typeInfo?.color || "#00d4ff" : "#222",
                      position: "relative", transition: "background 0.2s", flexShrink: 0,
                    }}
                  >
                    <div style={{
                      position: "absolute", top: "3px",
                      left: task.enabled ? "19px" : "3px",
                      width: "14px", height: "14px", borderRadius: "50%",
                      background: "#fff", transition: "left 0.2s",
                    }} />
                  </div>

                  {/* Icon */}
                  <div style={{ fontSize: "20px", width: "28px", textAlign: "center", flexShrink: 0 }}>
                    {typeInfo?.icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: "600", fontSize: "14px", color: task.enabled ? "#fff" : "#555" }}>
                      {task.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "#444", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {task.value}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "15px", fontWeight: "600", color: typeInfo?.color }}>{task.time}</div>
                    <div style={{ fontSize: "10px", color: "#444", marginTop: "2px" }}>
                      {task.days.map((d) => DAYS[d]).join(" ")}
                    </div>
                  </div>

                  {/* Next run */}
                  <div style={{ textAlign: "right", flexShrink: 0, minWidth: "70px" }}>
                    <div style={{ fontSize: "10px", color: "#444" }}>NEXT</div>
                    <div style={{ fontSize: "11px", color: task.enabled ? "#00d4ff" : "#333" }}>
                      {task.enabled ? formatNextRun(nextRun) : "paused"}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button onClick={() => runTask(task)} title="Run now" style={{
                      background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)",
                      color: "#00d4ff", width: "30px", height: "30px", cursor: "pointer",
                      fontSize: "12px", fontFamily: "inherit",
                    }}>▶</button>
                    <button onClick={() => openEdit(task)} title="Edit" style={{
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "#888", width: "30px", height: "30px", cursor: "pointer",
                      fontSize: "12px", fontFamily: "inherit",
                    }}>✎</button>
                    <button onClick={() => deleteTask(task.id)} title="Delete" style={{
                      background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.2)",
                      color: "#ff4d6d", width: "30px", height: "30px", cursor: "pointer",
                      fontSize: "12px", fontFamily: "inherit",
                    }}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Log */}
        {log.length > 0 && (
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#444", marginBottom: "16px" }}>ACTIVITY LOG</div>
            <div ref={logRef} style={{
              background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)",
              padding: "16px", maxHeight: "200px", overflowY: "auto",
            }}>
              {log.map((entry) => (
                <div key={entry.id} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <span style={{ color: "#333", fontSize: "11px", flexShrink: 0 }}>{entry.time}</span>
                  <span style={{ fontSize: "14px" }}>{entry.icon}</span>
                  <span style={{ color: entry.color, fontSize: "12px", fontWeight: "600" }}>{entry.name}</span>
                  <span style={{ color: "#333", fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showAdd && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
        }}
          onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}
        >
          <div style={{
            background: "#0f0f1a", border: "1px solid rgba(0,212,255,0.2)",
            padding: "32px", width: "100%", maxWidth: "480px",
            boxShadow: "0 0 60px rgba(0,212,255,0.08)",
          }}>
            <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#00d4ff", marginBottom: "20px" }}>
              {editTask ? "EDIT TASK" : "NEW TASK"}
            </div>

            {/* Task Name */}
            <label style={{ display: "block", marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", color: "#444", letterSpacing: "2px", marginBottom: "8px" }}>TASK NAME</div>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Morning News" style={{
                  width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", padding: "10px 14px", fontSize: "14px", fontFamily: "inherit",
                  outline: "none", boxSizing: "border-box",
                }} />
            </label>

            {/* Task Type */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", color: "#444", letterSpacing: "2px", marginBottom: "8px" }}>TASK TYPE</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {TASK_TYPES.map((t) => (
                  <div key={t.id} onClick={() => setForm((f) => ({ ...f, type: t.id }))} style={{
                    padding: "10px 8px", textAlign: "center", cursor: "pointer",
                    border: `1px solid ${form.type === t.id ? t.color : "rgba(255,255,255,0.08)"}`,
                    background: form.type === t.id ? `${t.color}18` : "transparent",
                    fontSize: "11px", color: form.type === t.id ? t.color : "#555",
                    transition: "all 0.15s",
                  }}>
                    <div style={{ fontSize: "18px", marginBottom: "4px" }}>{t.icon}</div>
                    {t.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Value */}
            <label style={{ display: "block", marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", color: "#444", letterSpacing: "2px", marginBottom: "8px" }}>
                {form.type === "open_url" || form.type === "play_video" || form.type === "play_music"
                  ? "URL" : form.type === "open_app" ? "APP PATH / NAME" : "REMINDER MESSAGE"}
              </div>
              <input value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                placeholder={
                  form.type === "open_url" ? "https://..." :
                  form.type === "play_video" ? "https://youtube.com/..." :
                  form.type === "play_music" ? "https://spotify.com/..." :
                  form.type === "open_app" ? "notepad.exe or Chrome" :
                  "Your reminder text"
                } style={{
                  width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", padding: "10px 14px", fontSize: "14px", fontFamily: "inherit",
                  outline: "none", boxSizing: "border-box",
                }} />
            </label>

            {/* Time */}
            <label style={{ display: "block", marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", color: "#444", letterSpacing: "2px", marginBottom: "8px" }}>TIME</div>
              <input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff", padding: "10px 14px", fontSize: "14px", fontFamily: "inherit",
                outline: "none", colorScheme: "dark",
              }} />
            </label>

            {/* Days */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "10px", color: "#444", letterSpacing: "2px", marginBottom: "8px" }}>DAYS</div>
              <div style={{ display: "flex", gap: "8px" }}>
                {DAYS.map((day, i) => (
                  <div key={i} onClick={() => toggleDay(i)} style={{
                    width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
                    border: `1px solid ${form.days.includes(i) ? "#00d4ff" : "rgba(255,255,255,0.08)"}`,
                    background: form.days.includes(i) ? "rgba(0,212,255,0.15)" : "transparent",
                    color: form.days.includes(i) ? "#00d4ff" : "#444",
                    fontSize: "10px", cursor: "pointer", userSelect: "none",
                    transition: "all 0.15s",
                  }}>{day}</div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={saveTask} style={{
                flex: 1, background: "linear-gradient(135deg, #00d4ff, #0088aa)",
                border: "none", color: "#000", padding: "12px", fontSize: "13px",
                fontWeight: "700", cursor: "pointer", fontFamily: "inherit", letterSpacing: "1px",
              }}>
                {editTask ? "SAVE CHANGES" : "CREATE TASK"}
              </button>
              <button onClick={() => setShowAdd(false)} style={{
                background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                color: "#555", padding: "12px 20px", fontSize: "13px",
                cursor: "pointer", fontFamily: "inherit",
              }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
