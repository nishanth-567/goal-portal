"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, Target, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ name: "", email: "", password: "", confirmPassword: "", employeeId: "", department: "", designation: "", role: "EMPLOYEE" });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { email: loginForm.email, password: loginForm.password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid email or password.");
    else router.push("/dashboard");
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (signupForm.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (signupForm.password !== signupForm.confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(signupForm) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Signup failed."); return; }
    await signIn("credentials", { email: signupForm.email, password: signupForm.password, redirect: false });
    router.push("/dashboard");
  }

  const inputStyle = { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "13px 16px", fontSize: "15px", color: "white", fontFamily: "inherit", outline: "none", transition: "all 0.2s", boxSizing: "border-box" as const };

  return (
    <div style={{ minHeight: "100vh", background: "#000000", display: "flex", position: "relative", overflow: "hidden" }}>

      {/* Left — Branding */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#FF4500", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Target size={16} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: "15px", fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>Goalpocalypse</span>
        </div>
        <div>
          <h1 style={{ fontSize: "56px", fontWeight: 700, color: "white", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "20px" }}>
            Performance<br />
            <span style={{ color: "rgba(255,255,255,0.25)" }}>redefined.</span>
          </h1>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.35)", lineHeight: 1.6, maxWidth: "400px" }}>
            Set goals that matter. Track what counts. Align your entire organization around outcomes that move the needle.
          </p>
        </div>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.15)" }}>© 2026 Goalpocalypse. All rights reserved.</p>
      </div>

      {/* Right — Form */}
      <div style={{ width: "480px", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px" }}>
        <div style={{ width: "100%" }}>

          <h2 style={{ fontSize: "28px", fontWeight: 700, color: "white", letterSpacing: "-0.02em", marginBottom: "6px" }}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", marginBottom: "32px" }}>
            {mode === "login" ? "Sign in to your workspace." : "Join your organization's workspace."}
          </p>

          {error && (
            <div style={{ marginBottom: "20px", padding: "12px 16px", background: "rgba(255,69,0,0.08)", border: "1px solid rgba(255,69,0,0.2)", borderRadius: "10px", fontSize: "13px", color: "#FF4500" }}>
              {error}
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Email</label>
                <input type="email" value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} placeholder="you@company.com" required
                  onFocus={e => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.04)"; }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPassword ? "text" : "password"} value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} style={{ ...inputStyle, paddingRight: "44px" }} placeholder="••••••••" required
                    onFocus={e => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.04)"; }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", padding: 0 }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "14px", marginTop: "8px", fontSize: "15px" }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Sign in</span> <ArrowRight size={15} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { key: "name", label: "Full Name", placeholder: "John Doe", type: "text", required: true },
                { key: "email", label: "Work Email", placeholder: "john@company.com", type: "email", required: true },
                { key: "employeeId", label: "Employee ID", placeholder: "EMP001", type: "text", required: false },
                { key: "department", label: "Department", placeholder: "Engineering, Sales...", type: "text", required: false },
                { key: "designation", label: "Designation", placeholder: "Senior Engineer...", type: "text", required: false },
              ].map(({ key, label, placeholder, type, required }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.35)", marginBottom: "5px", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</label>
                  <input type={type} value={(signupForm as any)[key]} onChange={e => setSignupForm(p => ({ ...p, [key]: e.target.value }))} style={{ ...inputStyle, padding: "11px 14px", fontSize: "14px" }} placeholder={placeholder} required={required}
                    onFocus={e => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.35)", marginBottom: "5px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Role</label>
                <select value={signupForm.role} onChange={e => setSignupForm(p => ({ ...p, role: e.target.value }))} style={{ ...inputStyle, padding: "11px 14px", fontSize: "14px" }}>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.35)", marginBottom: "5px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPassword ? "text" : "password"} value={signupForm.password} onChange={e => setSignupForm(p => ({ ...p, password: e.target.value }))} style={{ ...inputStyle, padding: "11px 44px 11px 14px", fontSize: "14px" }} placeholder="Min 8 characters" required minLength={8}
                    onFocus={e => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", padding: 0 }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.35)", marginBottom: "5px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Confirm Password</label>
                <input type="password" value={signupForm.confirmPassword} onChange={e => setSignupForm(p => ({ ...p, confirmPassword: e.target.value }))} style={{ ...inputStyle, padding: "11px 14px", fontSize: "14px" }} placeholder="Repeat password" required
                  onFocus={e => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "13px", marginTop: "6px", fontSize: "14px" }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Create account"}
              </button>
            </form>
          )}

          {/* Toggle */}
          <p style={{ marginTop: "24px", textAlign: "center", fontSize: "14px", color: "rgba(255,255,255,0.3)" }}>
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "white", fontFamily: "inherit", fontSize: "14px", fontWeight: 600, padding: 0, textDecoration: "underline", textDecorationColor: "rgba(255,255,255,0.3)" }}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>

          {/* Demo */}
          {mode === "login" && (
            <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginBottom: "10px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Demo accounts</p>
              <div style={{ display: "flex", gap: "8px" }}>
                {[{ label: "Employee", email: "employee@demo.com" }, { label: "Manager", email: "manager@demo.com" }, { label: "Admin", email: "admin@demo.com" }].map(acc => (
                  <button key={acc.email} onClick={() => setLoginForm({ email: acc.email, password: "demo123" })}
                    style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: "12px", fontFamily: "inherit", fontWeight: 500, transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "white"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}>
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
