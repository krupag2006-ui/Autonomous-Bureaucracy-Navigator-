
import { AnimatePresence, motion } from "framer-motion";
import { MoonStar, Sparkles, SunMedium } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ChatWindow } from "./components/chat/ChatWindow";
import { DashboardCards } from "./components/dashboard/DashboardCards";
import { Sidebar } from "./components/layout/Sidebar";
import { SectionHeader } from "./components/shared/SectionHeader";
import { UploadArea } from "./components/upload/UploadArea";

const pageTransition = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, ease: "easeOut" },
};

export default function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const [theme, setTheme] = useState("dark");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const successfulFiles = uploadedFiles.filter((file) => file.status === "success");

  const headerAction = useMemo(
    () => (
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
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
    [theme],
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div
        className={[
          "fixed inset-0 -z-20 transition-all duration-500",
          theme === "dark"
            ? "bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(45,212,191,0.12),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#020617_45%,_#071326_100%)]"
            : "bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.10),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_45%,_#e0f2fe_100%)]",
        ].join(" ")}
      />
      <div className="fixed inset-0 -z-10 bg-hero-grid opacity-70" />

      <div className="relative flex min-h-screen">
        <Sidebar
          activeTab={activeTab}
          isCollapsed={isCollapsed}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
          onTabChange={setActiveTab}
          onToggleCollapse={() => setIsCollapsed((current) => !current)}
          theme={theme}
          onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1600px] flex-col gap-6">
            <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 shadow-glow backdrop-blur-xl">
              <SectionHeader
                eyebrow="Premium workflow intelligence"
                title="Navigate bureaucracy with an AI-native control center"
                description="A polished, startup-grade frontend for document-heavy workflows. Chat with your copilot, upload evidence packets, and track processing momentum from one calm, high-trust interface."
                action={headerAction}
              />

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm text-sky-200">
                  <Sparkles className="h-4 w-4" />
                  Premium AI experience
                </div>
                <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">
                  {successfulFiles.length} uploaded file{successfulFiles.length === 1 ? "" : "s"}
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "chat" ? (
                <motion.section key="chat" {...pageTransition} className="flex-1">
                  <div className="grid h-full gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                    <div className="min-h-[70vh]">
                      <ChatWindow
                        onOpenSidebar={() => setIsMobileOpen(true)}
                        uploadedFiles={successfulFiles}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-soft backdrop-blur-xl">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                          Mission control
                        </p>
                        <h3 className="mt-3 text-xl font-semibold text-white">
                          Keep every filing moving
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-slate-400">
                          Upload packets, extract requirements, and turn ambiguous bureaucracy into a concrete plan.
                        </p>
                      </div>

                      <DashboardCards uploadedFiles={successfulFiles} />
                    </div>
                  </div>
                </motion.section>
              ) : null}

              {activeTab === "dashboard" ? (
                <motion.section key="dashboard" {...pageTransition} className="space-y-6">
                  <DashboardCards uploadedFiles={successfulFiles} />
                </motion.section>
              ) : null}

              {activeTab === "upload" ? (
                <motion.section key="upload" {...pageTransition}>
                  <UploadArea
                    files={uploadedFiles}
                    setFiles={setUploadedFiles}
                    onOpenSidebar={() => setIsMobileOpen(true)}
                  />
                </motion.section>
              ) : null}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );

import Upload from "./components/Upload";

export default function App() {
  return <Upload />;
}
}
