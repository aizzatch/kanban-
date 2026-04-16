import { useEffect, useState, useRef } from "react";
import { supabase } from "./supabase";
import { fetchTasks, type Task } from "./components/FetchTasks";
import CreateTask from "./components/CreateTasks";
import KanbanBoard from "./components/KanbanBoard";
import TaskModal from "./components/TaskModal";
import FilterModal, { EMPTY_FILTER, type FilterState } from "./components/FilterModal";
import { updateTask } from "./components/updateTask";
import { decodeTag } from "./components/tagUtils";
import { LandingPage } from "./LandingPage";
import silkBg from "./assets/slik.png";

export default function App() {
  const [showLanding, setShowLanding] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(EMPTY_FILTER);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const startSession = async () => {
      await supabase.auth.signOut();
      const { data } = await supabase.auth.signInAnonymously();
      if (data.user) {
        setUser(data.user);
        fetchTasks(data.user.id, setTasks);
      }
      setAuthLoading(false);
    };
    startSession();
  }, []);

  const refresh = () => fetchTasks(user.id, setTasks);
  const allTags = Array.from(new Set(tasks.flatMap((t) => t.tags ?? [])));
  const allMembers = Array.from(new Set(tasks.flatMap((t) => t.team_members ?? [])));

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const overdueTasks = tasks.filter((t) => t.due_date && new Date(t.due_date).getTime() < Date.now() && t.status !== "done").length;

  const trimmedSearch = search.trim();
  const searchResults = trimmedSearch
    ? tasks.filter((t) => t.title.toLowerCase().includes(trimmedSearch.toLowerCase()))
    : [];
  const showDropdown = searchFocused && trimmedSearch.length > 0 && searchResults.length > 0;

  const hasActiveFilters =
    appliedFilters.dueDateMode !== "none" ||
    appliedFilters.priorities.length > 0 ||
    appliedFilters.tags.length > 0 ||
    appliedFilters.members.length > 0;

  const filteredTasks = tasks.filter((task) => {
    if (appliedFilters.dueDateMode === "lt24h") {
      if (!task.due_date) return false;
      const diff = new Date(task.due_date).getTime() - Date.now();
      if (diff < 0 || diff > 24 * 60 * 60 * 1000) return false;
    } else if (appliedFilters.dueDateMode === "custom" && appliedFilters.customDate) {
      if (!task.due_date) return false;
      if (new Date(task.due_date) > new Date(appliedFilters.customDate)) return false;
    }

    if (appliedFilters.priorities.length > 0 && !appliedFilters.priorities.includes(task.priority)) {
      return false;
    }

    if (appliedFilters.tags.length > 0) {
      const taskTagNames = (task.tags ?? []).map((t) => decodeTag(t).name);
      const filterTagNames = appliedFilters.tags.map((t) => decodeTag(t).name);
      if (!filterTagNames.some((name) => taskTagNames.includes(name))) return false;
    }

    if (appliedFilters.members.length > 0) {
      const taskMembers = new Set(task.team_members ?? []);
      if (!appliedFilters.members.some((enc) => taskMembers.has(enc))) return false;
    }

    return true;
  });

  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  if (authLoading || !user) {
    return <p style={{ textAlign: "center", marginTop: "20vh" }}>Loading...</p>;
  }

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100vh", background: "#F7F7F8", boxSizing: "border-box", fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>

      {/* Silk Background Image Underlay */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 0,
        backgroundImage: `url(${silkBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }} />
      {/* Subtle white frost overlay to keep cards/text readable */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1,
        background: "rgba(247, 247, 248, 0.45)",
        backdropFilter: "blur(0px)",
      }} />

      {/* Centered content wrapper */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "1400px", margin: "0 auto", padding: "40px 48px 0", boxSizing: "border-box", display: "flex", flexDirection: "column", height: "100%" }}>

        {/* Header & Controls Wrapper Centered */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px", width: "100%" }}>
          <h1 style={{ margin: "0 0 24px", color: "#0f172a", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.2, textAlign: "center" }}>
            Kanban Board
          </h1>

          {/* Summary strip (Back above the Toolbar) */}
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "32px", width: "100%" }}>
            {[
              { label: "Total Tasks", value: totalTasks, color: "#0f172a", bg: "#ffffff", border: "rgba(0,0,0,0.06)" },
              { label: "Completed", value: completedTasks, color: "#16a34a", bg: "#ffffff", border: "rgba(0,0,0,0.06)" },
              { label: "Overdue", value: overdueTasks, color: "#ef4444", bg: "#ffffff", border: "rgba(0,0,0,0.06)" },
            ].map(({ label, value, color, bg, border }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: bg,
                  border: `1px solid ${border}`,
                  boxShadow: "0 2px 6px -1px rgba(0,0,0,0.02)"
                }}
              >
                <span style={{ fontSize: "1.35rem", fontWeight: 700, color, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</span>
                <span style={{ fontSize: "0.8rem", color, fontWeight: 500, letterSpacing: "-0.01em" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Toolbar: Create, Search, Filter (Back below the Summary Strip) */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "24px", width: "100%", maxWidth: "700px" }}>
            <CreateTask userId={user.id} onTaskCreated={refresh} allTags={allTags} allMembers={allMembers} />

            {/* Search */}
            <div style={{ position: "relative", flex: 1 }}>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search tasks…"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 400,
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#ffffff",
                  color: "#1a2332",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                }}
              />

              {showDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    zIndex: 100,
                    maxHeight: "280px",
                    overflowY: "auto",
                  }}
                >
                  {searchResults.map((task, i) => (
                    <button
                      key={task.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedTask(task);
                        setSearch("");
                      }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        textAlign: "left",
                        padding: "12px 16px",
                        background: "none",
                        border: "none",
                        borderBottom: i < searchResults.length - 1 ? "1px solid #f1f5f9" : "none",
                        cursor: "pointer",
                        gap: "3px",
                      }}
                    >
                      <span style={{ fontSize: "0.8125rem", color: "#1a2332", fontWeight: 500, letterSpacing: "-0.01em" }}>{task.title}</span>
                      <span style={{ fontSize: "0.6875rem", color: "#727B8C", fontWeight: 400, textTransform: "capitalize" }}>{task.status.replace("-", " ")}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter button */}
            <button
              onClick={() => setFilterOpen(true)}
              style={{
                position: "relative",
                padding: "10px 16px",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#0f172a",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                letterSpacing: "-0.01em",
                transition: "box-shadow 0.2s"
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filter
              {hasActiveFilters && (
                <span style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "#3b82f6", display: "inline-block", flexShrink: 0,
                }} />
              )}
            </button>
          </div>
        </div>

        {/* Board */}
        <div style={{ flex: 1, overflow: "hidden", paddingBottom: "40px" }}>
          <KanbanBoard tasks={filteredTasks} onRefresh={refresh} allMembers={allMembers} />
        </div>

      </div>{/* end centered wrapper */}

      {filterOpen && (
        <FilterModal
          allTags={allTags}
          allMembers={allMembers}
          applied={appliedFilters}
          onApply={(f) => setAppliedFilters(f)}
          onClose={() => setFilterOpen(false)}
        />
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={(taskId, title, description, priority, due_date, tags, team_members) => {
            updateTask(taskId, { title, description, priority, due_date, tags, team_members }, refresh);
          }}
          allTags={allTags}
          allMembers={allMembers}
        />
      )}
    </div>
  );
}
