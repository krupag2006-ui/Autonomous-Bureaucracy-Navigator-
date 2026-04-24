import { AnimatePresence, motion } from "framer-motion";
import { Menu, SendHorizonal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { initialMessages, suggestedPrompts } from "../../data/mock";
import { MessageBubble } from "./MessageBubble";
import { PromptSuggestions } from "./PromptSuggestions";
import { TypingBubble } from "./TypingBubble";

function buildAssistantReply(input, uploadCount) {
  const normalized = input.toLowerCase();

  if (normalized.includes("checklist")) {
    return `Here is a suggested action plan:\n\n1. Gather your identity, registration, and address documents.\n2. Validate each uploaded file for expiration dates and signatures.\n3. Submit the primary application packet.\n4. Track follow-up requests and due dates in the dashboard.\n\nI also see **${uploadCount} uploaded document${uploadCount === 1 ? "" : "s"}** ready for review.`;
  }

  if (normalized.includes("summarize")) {
    return `Executive summary prepared.\n\n- I found the core filing steps, supporting document requirements, and likely approval dependencies.\n- The largest risk is incomplete identity or proof-of-address records.\n- I recommend verifying document freshness before submission.`;
  }

  if (normalized.includes("missing")) {
    return `Potential gaps detected:\n\n- Proof of address newer than 90 days\n- Signed declaration form\n- Supporting compliance certificate\n\nWant me to turn those into a submission checklist next?`;
  }

  return `I can help with that. Based on your request, I would:\n\n- inspect the relevant forms and uploaded materials\n- extract deadlines, dependencies, and required evidence\n- generate a concise next-step plan\n\nIf you upload more files, I can tailor the answer to the exact packet.`;
}

export function ChatWindow({ onOpenSidebar, uploadedFiles }) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const uploadCount = uploadedFiles.length;
  const emptyState = useMemo(() => messages.length <= initialMessages.length, [messages.length]);

  const sendMessage = (value) => {
    const trimmed = value.trim();
    if (!trimmed || isTyping) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setIsTyping(true);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: buildAssistantReply(trimmed, uploadCount),
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="flex h-full flex-col rounded-[32px] border border-white/10 bg-white/[0.04] shadow-glow backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-300 lg:hidden"
            onClick={onOpenSidebar}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Conversation
            </p>
            <h3 className="text-sm font-medium text-white">
              Regulatory Copilot
            </h3>
          </div>
        </div>
        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
          Live assistance
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
        {emptyState ? (
          <div className="mb-6 rounded-[28px] border border-dashed border-white/10 bg-slate-950/20 p-5">
            <p className="text-sm text-slate-400">
              Start with a prompt or upload documents to unlock tailored process guidance.
            </p>
          </div>
        ) : null}

        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isTyping ? <TypingBubble key="typing" /> : null}
          </AnimatePresence>
          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 md:px-6">
        <PromptSuggestions prompts={suggestedPrompts} onSelect={sendMessage} />
        <div className="mt-4 flex items-end gap-3 rounded-[28px] border border-white/10 bg-slate-950/40 p-3">
          <textarea
            rows={1}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage(draft);
              }
            }}
            placeholder="Ask about permits, compliance steps, required documents, or uploaded files..."
            className="max-h-40 min-h-[52px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
          />
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => sendMessage(draft)}
            disabled={!draft.trim() || isTyping}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-500/30 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SendHorizonal className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
