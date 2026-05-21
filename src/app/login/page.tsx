"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, Zap, Target, ArrowRight, Lock, Mail, User, Building, Hash } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    employeeId: "", department: "", designation: "", role: "EMPLOYEE",
  });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { email: loginForm.email, password: loginForm.password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid email or password. Check your credentials.");
    else router.push("/dashboard");
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (signupForm.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (signupForm.password !== signupForm.confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signupForm),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setError(data.error || "Signup failed.");
    else {
      setSuccess("Account created! Signing you in...");
      await signIn("credentials", { email: signupForm.email, password: signupForm.password, redirect: false });
      router.push("/dashboard");
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative", background: "rgb(8,8,12)" }}>

      {/* Ambient orbs */}
      <div style={{ position: "fixed", top: "-20%", left: "-10%", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,0,0.12) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-20%", right: "-10%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(191,0,255,0.10) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: "40%", right: "20%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ width: "100%", maxWidth: "440px", position: "relative", zIndex: 1 }} className="slide-up">

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "64px", height: "64px", borderRadius: "16px", background: "linear-gradient(135deg, #FF6B00, #FF4500)", marginBottom: "16px", boxShadow: "0 0 30px rgba(255,107,0,0.5)" }}>
            <Target size={32} color="white" />
          </div>
          <h1 className="font-display" style={{ fontSize: "48px", lineHeight: 1, color: "white", marginBottom: "4px" }}>
            GOAL<span style={{ color: "#FF6B00" }} className="text-glow-fire">POCALYPSE</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Performance War Room
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "4px", marginBottom: "24px", border: "1px solid rgba(255,255,255,0.08)" }}>
          {["login", "signup"].map((m) => (
            <button key={m} onClick={() => { setMode(m as any); setError(""); setSuccess(""); }}
              style={{ flex: 1, padding: "10px", borderRadius: "7px", border: "none", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "14px", transition: "all 0.2s", background: mode === m ? "linear-gradient(135deg, #FF6B00, #FF4500)" : "transparent", color: mode === m ? "white" : "rgba(255,255,255,0.4)", boxShadow: mode === m ? "0 0 20px rgba(255,107,0,0.3)" : "none" }}>
              {m === "login" ? "SIGN IN" : "SIGN UP"}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="glass-card" style={{ borderRadius: "16px", padding: "28px" }}>

          {error && (
            <div style={{ marginBottom: "16px", padding: "12px 16px", background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.3)", borderRadius: "8px", color: "#FF5050", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Zap size={14} /> {error}
            </div>
          )}
          {success && (
            <div style={{ marginBottom: "16px", padding: "12px 16px", background: "rgba(204,255,0,0.1)", border: "1px solid rgba(204,255,0,0.3)", borderRadius: "8px", color: "#CCFF00", fontSize: "13px" }}>
              {success}
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Email</label>
                <div style={{ position: "relative" }}>
                  <Mail size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
                  <input type="email" value={loginForm.email} onChange={(e) => setLoginForm(p => ({ ...p, email: e.target.value }))} className="gp-input" style={{ paddingLeft: "36px" }} placeholder="you@company.com" required />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
                  <input type={showPassword ? "text" : "password"} value={loginForm.password} onChange={(e) => setLoginForm(p => ({ ...p, password: e.target.value }))} className="gp-input" style={{ paddingLeft: "36px", paddingRight: "40px" }} placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 0 }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-fire" style={{ width: "100%", padding: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "15px", marginTop: "4px" }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> ENTER THE WAR ROOM</>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { key: "name", label: "Full Name", icon: User, placeholder: "John Doe", type: "text", required: true },
                { key: "email", label: "Work Email", icon: Mail, placeholder: "john@company.com", type: "email", required: true },
                { key: "employeeId", label: "Employee ID", icon: Hash, placeholder: "EMP001", type: "text", required: false },
                { key: "department", label: "Department", icon: Building, placeholder: "Sales, Engineering...", type: "text", required: false },
                { key: "designation", label: "Designation", icon: User, placeholder: "Senior Engineer...", type: "text", required: false },
              ].map(({ key, label, icon: Icon, placeholder, type, required }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</label>
                  <div style={{ position: "relative" }}>
                    <Icon size={13} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)" }} />
                    <input type={type} value={(signupForm as any)[key]} onChange={(e) => setSignupForm(p => ({ ...p, [key]: e.target.value }))} className="gp-input" style={{ paddingLeft: "32px", padding: "9px 12px 9px 32px" }} placeholder={placeholder} required={required} />
                  </div>
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Role</label>
                <select value={signupForm.role} onChange={(e) => setSignupForm(p => ({ ...p, role: e.target.value }))} className="gp-input">
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Password (min 8 chars)</label>
                <div style={{ position: "relative" }}>
                  <Lock size={13} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)" }} />
                  <input type={showPassword ? "text" : "password"} value={signupForm.password} onChange={(e) => setSignupForm(p => ({ ...p, password: e.target.value }))} className="gp-input" style={{ paddingLeft: "32px", paddingRight: "36px", padding: "9px 36px 9px 32px" }} placeholder="Min 8 characters" required minLength={8} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 0 }}>
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={13} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)" }} />
                  <input type="password" value={signupForm.confirmPassword} onChange={(e) => setSignupForm(p => ({ ...p, confirmPassword: e.target.value }))} className="gp-input" style={{ paddingLeft: "32px", padding: "9px 12px 9px 32px" }} placeholder="Repeat password" required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-fire" style={{ width: "100%", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "14px", marginTop: "4px" }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Zap size={15} /> JOIN THE APOCALYPSE</>}
              </button>
            </form>
          )}
        </div>

        {/* Demo accounts - login only */}
        {mode === "login" && (
          <div style={{ marginTop: "20px" }}>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", textAlign: "center", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Demo Access</p>
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                { label: "Employee", email: "employee@demo.com" },
                { label: "Manager", email: "manager@demo.com" },
                { label: "Admin", email: "admin@demo.com" },
              ].map((acc) => (
                <button key={acc.email} onClick={() => setLoginForm({ email: acc.email, password: "demo123" })}
                  style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: "11px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, transition: "all 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,107,0,0.4)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}>
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
