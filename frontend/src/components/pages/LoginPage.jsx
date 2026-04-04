import { useState } from "react";
import { C, s } from "../../utils/theme";
import { Logo, Spinner } from "../ui";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handle = () => onLogin(username, password);
  const onKey  = (e) => e.key === "Enter" && handle();

  return (
    <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>

      {/* Ambient glows */}
      <div style={{ position: "absolute", top: -160, left: -160, width: 480, height: 480, borderRadius: "50%", background: "#f9731612", filter: "blur(100px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -120, right: -120, width: 440, height: 440, borderRadius: "50%", background: "#f59e0b0e", filter: "blur(100px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420, padding: "0 20px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <Logo size={68} />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: C.text, letterSpacing: "-0.5px" }}>MHTCET</h1>
          <p style={{ color: C.muted, fontSize: 11, marginTop: 6, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Preference List Generator
          </p>
        </div>

        {/* Card */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: "36px 32px", boxShadow: "0 24px 60px #00000070" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>Sign in to continue</h2>
          <p style={{ color: C.muted, fontSize: 13, marginBottom: 28 }}>Enter your counsellor credentials below</p>

          <div style={{ marginBottom: 18 }}>
            <label style={s.label}>Username</label>
            <input
              style={s.input}
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={onKey}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={s.label}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                style={s.input}
                type={showPw ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={onKey}
              />
              <button
                onClick={() => setShowPw((v) => !v)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 13 }}
                tabIndex={-1}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Error injected by parent via prop — handled in App */}

          <button
            onClick={handle}
            style={{ ...s.btnOrange, width: "100%", padding: "13px", fontSize: 15 }}
            className="btn-orange"
          >
            Sign In →
          </button>
        </div>
      </div>
    </div>
  );
}
