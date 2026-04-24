import { useEffect, useMemo, useState } from "react";
import { ChatWindow } from "./components/chat/ChatWindow";
import ApplicationsPage from "./components/applications/ApplicationsPage";
import { DashboardCards } from "./components/dashboard/DashboardCards";
import { Sidebar } from "./components/layout/Sidebar";
import PermissionsPage from "./components/permissions/PermissionsPage";
import { SectionHeader } from "./components/shared/SectionHeader";
import { UploadArea } from "./components/upload/UploadArea";
import { initialMessages } from "./data/mock";

const defaultMessages = initialMessages.filter(
  (message) => message.id !== "hint"
);

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeCard, setActiveCard] = useState("dashboard");
  const [permissionsInput, setPermissionsInput] = useState({
    idea: "",
    location: "",
  });
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [sessionId] = useState(() => {
    return crypto?.randomUUID?.() || `session-${Date.now()}`;
  });

  useEffect(() => {
    const root = document.documentElement;
    theme === "dark"
      ? root.classList.add("dark")
      : root.classList.remove("dark");

    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const saved = sessionStorage.getItem("chat_history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
        return;
      } catch {}
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
      <button
        onClick={() =>
          setTheme((c) => (c === "dark" ? "light" : "dark"))
        }
        className="inline-flex min-w-[156px] items-center justify-center rounded-[24px] border border-white/10 bg-white/[0.05] px-6 py-4 text-right text-lg font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08]"
      >
        {theme === "dark" ? "Dark mode" : "Light mode"}
      </button>
    ),
    [theme]
  );

  return (
    <div className="min-h-screen bg-[#030816]">
      <Sidebar
        activeTab={activeTab}
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        onTabChange={setActiveTab}
        onToggleCollapse={() => setIsCollapsed((current) => !current)}
        theme={theme}
        onToggleTheme={() =>
          setTheme((current) => (current === "dark" ? "light" : "dark"))
        }
      />

      <main className="relative p-6 lg:ml-[280px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(8,145,178,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(30,64,175,0.14),transparent_32%)]" />
        <div className="relative space-y-8">
          <SectionHeader
            eyebrow="Premium Workflow Intelligence"
            title="Navigate bureaucracy with an AI-native control center"
            description="Chat, upload documents, and track progress in one place."
            action={headerAction}
            badges={[
              { label: "AI Experience", primary: true },
              { label: `${successfulFiles.length} uploaded`, primary: false },
            ]}
          />

          {/* CHAT */}
          <div style={{ display: activeTab === "chat" ? "block" : "none" }}>
            <ChatWindow
              messages={messages}
              onOpenSidebar={() => setIsMobileOpen(true)}
              sessionId={sessionId}
              setMessages={setMessages}
              uploadedFiles={successfulFiles}
              onSetActiveTab={setActiveTab}
              setActiveCard={setActiveCard}
              setPermissionsInput={setPermissionsInput}
            />
          </div>

          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <DashboardCards
              activeCard={activeCard}
              permissionsInput={permissionsInput}
              onOpenChat={() => setActiveTab("chat")}
              onOpenUpload={() => setActiveTab("upload")}
              uploadedFiles={successfulFiles}
            />
          )}

          {/* UPLOAD */}
          {activeTab === "upload" && (
            <UploadArea
              files={uploadedFiles}
              onOpenSidebar={() => setIsMobileOpen(true)}
              sessionId={sessionId}
              setFiles={setUploadedFiles}
            />
          )}

          {activeTab === "permissions" && (
            <PermissionsPage permissionsInput={permissionsInput} />
          )}

          {activeTab === "applications" && (
            <ApplicationsPage uploadedFiles={uploadedFiles} />
          )}
        </div>
      </main>
    </div>
  );
}
