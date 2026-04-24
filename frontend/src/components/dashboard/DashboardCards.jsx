import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { dashboardStats, recentActivity } from "../../data/mock";
import { SkeletonCard } from "../shared/SkeletonCard";

function AnimatedNumber({ value, suffix }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame;
    const duration = 900;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplayValue(Math.round(progress * value));
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span>
      {displayValue}
      {suffix}
    </span>
  );
}

export function DashboardCards({ uploadedFiles }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 850);
    return () => window.clearTimeout(timer);
  }, []);

  const stats = dashboardStats.map((card) => {
    if (card.id === "documents") {
      return {
        ...card,
        value: uploadedFiles.length,
        trend: uploadedFiles.length === 0 ? "No uploads yet" : `${uploadedFiles.length} files ready for review`,
      };
    }

    return card;
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 xl:grid-cols-[1.1fr_1.1fr_1.1fr]">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-3">
        {stats.map(({ id, title, value, suffix, trend, icon: Icon, accent }, index) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -4 }}
            className="rounded-[30px] border border-white/10 bg-white/[0.05] p-5 shadow-soft backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">{title}</p>
                <div className="mt-4 text-4xl font-semibold text-white">
                  <AnimatedNumber value={value} suffix={suffix} />
                </div>
                <p className="mt-3 text-sm text-slate-400">{trend}</p>
              </div>
              <div className={`rounded-2xl bg-gradient-to-br p-3 ${accent}`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-[30px] border border-white/10 bg-white/[0.05] p-6 shadow-soft backdrop-blur-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Recent activity</h3>
            <p className="mt-1 text-sm text-slate-400">
              A concise feed of document movement and AI review milestones.
            </p>
          </div>
          <div className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs text-sky-300">
            Updated live
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {recentActivity.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-slate-950/30 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="mt-1 text-sm text-slate-400">{item.detail}</p>
              </div>
              <span className="text-xs uppercase tracking-[0.25em] text-slate-500">
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
