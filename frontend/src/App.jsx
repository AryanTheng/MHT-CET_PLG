import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { GLOBAL_CSS, C } from "./utils/theme";
import { useAuth } from "./hooks/useAuth";
import LoginPage   from "./components/pages/LoginPage";
import RecordsPage from "./components/pages/RecordsPage";
import ToolPage    from "./components/pages/ToolPage";

export default function App() {
  const { user, login, logout, loading, error } = useAuth();

  // "records" | "new" | "edit"
  const [view, setView]             = useState("records");
  const [editStudent, setEditStudent] = useState(null);

  // If not logged in, show login
  if (!user) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "#0f172a", color: "#f8fafc", border: "1px solid #1e293b" },
          }}
        />
        {error && (
          <div style={{
            position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
            background: "#f8717120", border: "1px solid #f8717140",
            color: "#f87171", borderRadius: 10, padding: "10px 20px",
            fontSize: 14, fontWeight: 600, zIndex: 100,
          }}>
            {error}
          </div>
        )}
        <LoginPage
          onLogin={async (username, password) => {
            await login(username, password);
          }}
          loading={loading}
        />
      </>
    );
  }

  return (
    <>
      <style>{GLOBAL_CSS}
        {`@keyframes spin { to { transform: rotate(360deg); } }`}
      </style>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#0f172a", color: "#f8fafc", border: "1px solid #1e293b" },
          success: { iconTheme: { primary: "#34d399", secondary: "#0f172a" } },
          error:   { iconTheme: { primary: "#f87171", secondary: "#0f172a" } },
        }}
      />

      {view === "records" && (
        <RecordsPage
          user={user}
          onNewStudent={() => { setEditStudent(null); setView("new"); }}
          onEditStudent={(s) => { setEditStudent(s); setView("edit"); }}
          onLogout={logout}
        />
      )}

      {(view === "new" || view === "edit") && (
        <ToolPage
          user={user}
          initialStudent={editStudent}
          onBack={() => { setView("records"); setEditStudent(null); }}
          onLogout={() => { logout(); }}
        />
      )}
    </>
  );
}
