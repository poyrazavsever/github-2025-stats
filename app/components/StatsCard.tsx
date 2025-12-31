import { Icon } from "@iconify/react";
import { forwardRef } from "react";

type StatItem = {
  label: string;
  key:
    | "totalContributions"
    | "totalCommits"
    | "longestStreak"
    | "topLanguage"
    | "totalPRs"
    | "totalStars"
    | "totalIssues"
  suffix?: string;
  icon: string;
};

type Stats = {
  totalContributions: number;
  totalCommits: number;
  longestStreak: number;
  topLanguage?: string;
  totalPRs: number;
  totalStars: number;
  totalIssues: number;
  year: number;
};

const metrics: StatItem[] = [
  { label: "Total Contributions", key: "totalContributions", icon: "tabler:chart-bar" },
  { label: "Total Commits", key: "totalCommits", icon: "tabler:git-commit" },
  { label: "Longest Streak", key: "longestStreak", suffix: " days", icon: "tabler:flame" },
  { label: "Top Language", key: "topLanguage", icon: "tabler:code" },
  { label: "Total PRs", key: "totalPRs", icon: "tabler:git-pull-request" },
  { label: "Total Stars", key: "totalStars", icon: "tabler:stars" },
  { label: "Total Issues", key: "totalIssues", icon: "tabler:alert-circle" },
];

type StatsCardProps = {
  username?: string;
  avatarUrl?: string;
  stats?: Stats;
  isLoading?: boolean;
  error?: string | null;
};

function formatValue(value: string | number | undefined, suffix?: string) {
  if (value === undefined || value === null) return "—";
  if (typeof value === "number") return `${value.toLocaleString()}${suffix ?? ""}`;
  return value;
}

const languageIcons: Record<string, string> = {
  typescript: "skill-icons:typescript",
  javascript: "skill-icons:javascript",
  python: "skill-icons:python-light",
  java: "skill-icons:java-light",
  go: "skill-icons:golang",
  rust: "skill-icons:rust",
  "c++": "skill-icons:cpp",
  c: "skill-icons:c",
  "c#": "skill-icons:cs",
  php: "skill-icons:php-light",
  ruby: "skill-icons:ruby",
  swift: "skill-icons:swift",
  kotlin: "skill-icons:kotlin-light",
  dart: "skill-icons:dart-light",
};

export const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(function StatsCard(
  { username, avatarUrl, stats, isLoading, error }: StatsCardProps,
  ref
) {
  const avatarSrc =
    avatarUrl || (username ? `https://github.com/${username}.png` : "/logo.png");
  const yearLabel = stats?.year ?? 2025;

  console.log(error)

  return (
    <div className="mx-auto flex flex-col items-center gap-3">
      <div
        ref={ref}
        className="relative w-full max-w-90 overflow-hidden p-3"
        style={{
          aspectRatio: "9 / 16",
          font: "16px/1.5 'Nunito','Segoe UI',system-ui,-apple-system,sans-serif",
          backgroundColor: "rgba(255,255,255,0.78)",
          border: "1px solid rgba(226,232,240,0.7)",
        }}
      >
        <div
          className="absolute inset-0"
        />
        <div
          style={{
            backgroundColor: "rgba(255,255,255,1)",
            border: "1px solid rgba(244,255,255,.7)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            height: "100%",
            borderRadius: "22px",
            padding: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                overflow: "hidden",
                borderRadius: "9999px",
                border: "1px solid rgba(255,255,255,0.8)",
                backgroundColor: "rgba(255,255,255,0.7)",
              }}
            >
              <img
                src={avatarSrc}
                alt="Profile avatar"
                crossOrigin="anonymous"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#64748b",
                  margin: 0,
                }}
              >
                GitHub {yearLabel}
              </p>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#0f172a",
                  margin: 0,
                  lineHeight: 1.25,
                }}
              >
                {username ? `@${username}` : "@username"}
              </h2>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            {metrics.map((item) => (
              <div
                key={item.label}
                style={{
                  border: "1px solid rgba(226,232,240,0.7)",
                  backgroundColor: "rgba(255,255,255,0.94)",
                  borderRadius: "16px",
                  padding: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#475569",
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    {item.label}
                  </p>
                  <Icon
                    icon={
                      item.key === "topLanguage" && stats?.topLanguage
                        ? languageIcons[stats.topLanguage.toLowerCase()] ?? "tabler:code"
                        : item.icon
                    }
                    height={24}
                    width={24}
                    color="#64748b"
                  />
                </div>
                <p
                  style={{
                    marginTop: "6px",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#0f172a",
                    lineHeight: 1.25,
                  }}
                >
                  {isLoading
                    ? "Loading..."
                    : formatValue(stats?.[item.key], item.suffix)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
