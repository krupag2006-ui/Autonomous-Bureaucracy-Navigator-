import { AnimatePresence, motion } from "framer-motion";
import { MoonStar, Sparkles, SunMedium } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ChatWindow } from "./components/chat/ChatWindow";
import { DashboardCards } from "./components/dashboard/DashboardCards";
import { Sidebar } from "./components/layout/Sidebar";
import { SectionHeader } from "./components/shared/SectionHeader";
import { UploadArea } from "./components/upload/UploadArea";
import { initialMessages } from "./data/mock";

const pageTransition = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, ease: "easeOut" },
};

const defaultMessages = initialMessages.filter((message) => message.id !== "hint");

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [sessionId] = useState(() => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return `session-${Date.now()}`;
  });

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    root.style.colorScheme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const saved = sessionStorage.getItem("chat_history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
        return;
      } catch {
        setMessages(defaultMessages);
        return;
      }
    }

    setMessages(defaultMessages);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  const successfulFiles = uploadedFiles.filter(
    (file) => file.status === "success"
  );

  const headerAction = useMemo(
    () => (
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() =>
          setTheme((current) => (current === "dark" ? "light" : "dark"))
        }
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
      >
        {theme === "dark" ? (
          <>
            <MoonStar className="h-4 w-4" />
            Dark mode
          </>
        ) : (
          <>
            <SunMedium className="h-4 w-4" />
            Light mode
          </>
        )}
      </motion.button>
    ),
    [theme]
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Background */}
      <div
        className={[
          "fixed inset-0 -z-20 transition-all duration-500",
          theme === "dark"
            ? "bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(45,212,191,0.12),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#020617_45%,_#071326_100%)]"
            : "bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.10),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_45%,_#e0f2fe_100%)]",
        ].join(" ")}
      />

      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          isCollapsed={isCollapsed}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
          onTabChange={setActiveTab}
          onToggleCollapse={() => setIsCollapsed((c) => !c)}
          theme={theme}
          onToggleTheme={() =>
            setTheme((c) => (c === "dark" ? "light" : "dark"))
          }
        />

        {/* Main */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px] flex flex-col gap-6">
            {/* Header */}
            <div className="rounded-[32px] border border-slate-200/80 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]">
              <SectionHeader
                eyebrow="Premium workflow intelligence"
                title="Navigate bureaucracy with an AI-native control center"
                description="Chat, upload documents, and track progress in one place."
                action={headerAction}
              />

              <div className="mt-6 flex gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm text-sky-700 dark:text-sky-200">
                  <Sparkles className="h-4 w-4" />
                  AI Experience
                </div>
                <div className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-transparent dark:text-slate-300">
                  {successfulFiles.length} uploaded
                </div>
              </div>
            </div>

            {/* Pages */}
            <motion.section
              {...pageTransition}
              style={{ display: activeTab === "chat" ? "block" : "none" }}
            >
              <ChatWindow
                messages={messages}
                onSetActiveTab={setActiveTab}
                sessionId={sessionId}
                setMessages={setMessages}
                uploadedFiles={successfulFiles}
              />
            </motion.section>

            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <motion.section key="dashboard" {...pageTransition}>
                  <DashboardCards
                    onOpenChat={() => setActiveTab("chat")}
                    onOpenUpload={() => setActiveTab("upload")}
                    uploadedFiles={successfulFiles}
                  />
                </motion.section>
              )}

              {activeTab === "upload" && (
                <motion.section key="upload" {...pageTransition}>
                  <UploadArea
                    files={uploadedFiles}
                    sessionId={sessionId}
                    setFiles={setUploadedFiles}
                  />
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
