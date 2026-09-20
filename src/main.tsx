import { Component, StrictMode, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
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

// Load the application entry lazily so a broken secondary module cannot leave
// GitHub Pages on an unexplained blank screen. Vite rewrites this import using
// the configured /noor-quran/ base path.
import("./App")
  .then(({ default: App }) => mount(App))
  .catch((error) => {
    console.error("Noor Quran boot failure:", error);
    root.innerHTML =
      '<div dir="rtl" style="min-height:100vh;display:grid;place-items:center;background:#050b14;color:#fff;font-family:Tajawal,Arial,sans-serif;padding:24px;text-align:center">' +
      '<div style="max-width:760px">' +
      '<div style="font-size:32px;font-weight:800;color:#e9c767">نور</div>' +
      '<div style="margin-top:14px;font-size:20px">تعذّر تشغيل التطبيق</div>' +
      '<div style="margin-top:12px;color:#b9c1cc;white-space:pre-wrap;word-break:break-word;font-size:14px">' +
      String(error?.message || error || "خطأ غير معروف أثناء تحميل التطبيق") +
      "</div>" +
      '<button onclick="location.reload()" style="margin-top:20px;border:1px solid rgba(94,234,212,.4);border-radius:999px;background:rgba(94,234,212,.12);color:#d8fffa;padding:10px 18px">إعادة المحاولة</button>' +
      "</div></div>";
  });
