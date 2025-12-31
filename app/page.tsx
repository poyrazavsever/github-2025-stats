/* eslint-disable react/no-unescaped-entities */
"use client";

import { FormEvent, useRef, useState } from "react";
import { HeaderBanner } from "./components/HeaderBanner";
import { StatsCard } from "./components/StatsCard";

export default function Home() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [data, setData] = useState<{
    username: string;
    name?: string | null;
    avatarUrl: string;
    year: number;
    totals: {
      totalContributions: number;
      totalCommits: number;
      totalPRs: number;
      totalIssues: number;
      totalStars: number;
      longestStreak: number;
      topLanguage?: string;
      totalReviews: number;
    };
  } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    fetchStats(trimmed);
  };

  const fetchStats = async (user: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Failed to load stats");
      }

      setData(json.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#f7f7fb",
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        imageTimeout: 0,
      });
      const pngDataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const safeUser = (data?.username || username || "github-user").replace(
        /[^a-z0-9-_]/gi,
        "-"
      );
      link.download = `github-stats-2025-${safeUser}.png`;
      link.href = pngDataUrl;
      link.click();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Download failed";
      setError(message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main
      className="min-h-screen text-slate-900 bg-white"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pb-16 pt-10">
        <HeaderBanner />

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-2xl bg-white/60 p-4 border border-neutral-200"
        >
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-600" htmlFor="username">
              github.com/
            </label>
            <input
              id="username"
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="octocat"
              className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-base text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              autoComplete="off"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-800 active:translate-y-0"
          >
            See 2025 Stats
          </button>
        </form>

        <div className="relative mx-auto w-full max-w-3xl">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || loading}
            className="absolute right-0 top-0 z-10 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {downloading ? "Preparing..." : "Download PNG"}
          </button>
          <StatsCard
            ref={cardRef}
            username={data?.username || username.trim() || undefined}
            avatarUrl={data?.avatarUrl}
            stats={
              data
                ? {
                    ...data.totals,
                    year: data.year,
                  }
                : undefined
            }
            isLoading={loading}
            error={error}
          />
        </div>
      </div>
    </main>
  );
}
