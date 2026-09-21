import { Component, StrictMode, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Noor Quran runtime error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      const error = this.state.error;
      return (
        <div dir="rtl" style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#050b14", color: "#fff", fontFamily: "Tajawal, Arial, sans-serif", padding: 24, textAlign: "center" }}>
          <div style={{ maxWidth: 760 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#e9c767" }}>نور</div>
            <div style={{ marginTop: 14, fontSize: 20 }}>تعذّر تشغيل واجهة التطبيق</div>
            <div style={{ marginTop: 12, color: "#b9c1cc", whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 14 }}>
              {error.message || String(error)}
            </div>
            <button type="button" onClick={() => window.location.reload()} style={{ marginTop: 20, border: "1px solid rgba(94,234,212,.4)", borderRadius: 999, background: "rgba(94,234,212,.12)", color: "#d8fffa", padding: "10px 18px", cursor: "pointer" }}>
              إعادة تشغيل
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = document.getElementById("root");
if (!root) throw new Error("Noor Quran: #root element is missing.");

const mount = (App: React.ComponentType) => {
  createRoot(root).render(
    <StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </StrictMode>
  );
};

mount(App);\n\nif ("serviceWorker" in navigator && import.meta.env.PROD) {\n  window.addEventListener("load", () => {\n    navigator.serviceWorker.register(import.meta.env.BASE_URL + "sw.js", { scope: import.meta.env.BASE_URL }).catch(() => undefined);\n  });\n}
