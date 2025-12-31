import { cache } from "react";

const YEAR = 2025;
const FROM = `${YEAR}-01-01T00:00:00Z`;
const TO = `${YEAR + 1}-01-01T00:00:00Z`;

type ContributionDay = { date: string; contributionCount: number };

type CommitContributionByRepository = {
  repository: {
    nameWithOwner: string;
    languages: { edges: { size: number; node: { name: string } }[] };
  };
  contributions: { totalCount: number };
};

type RepoEdge = { node: { name: string; createdAt: string; stargazerCount: number } };

export type GithubStats = {
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
};

type GraphQLResponse = {
  data?: {
    rateLimit?: { remaining: number; resetAt: string };
    user: {
      login: string;
      name?: string | null;
      avatarUrl: string;
      contributionsCollection: {
        totalCommitContributions: number;
        totalPullRequestContributions: number;
        totalIssueContributions: number;
        totalPullRequestReviewContributions: number;
        restrictedContributionsCount: number;
        contributionCalendar: { weeks: { contributionDays: ContributionDay[] }[] };
        commitContributionsByRepository: CommitContributionByRepository[];
      };
      repositories: { edges: RepoEdge[] };
    } | null;
  };
  errors?: { message: string }[];
};

const query = `
  query UserStats($login: String!, $from: DateTime!, $to: DateTime!) {
    rateLimit { remaining resetAt }
    user(login: $login) {
      login
      name
      avatarUrl(size: 200)
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalPullRequestReviewContributions
        restrictedContributionsCount
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
        commitContributionsByRepository(maxRepositories: 15) {
          repository {
            nameWithOwner
            languages(first: 1, orderBy: { field: SIZE, direction: DESC }) {
              edges {
                size
                node { name }
              }
            }
          }
          contributions { totalCount }
        }
      }
      repositories(
        privacy: PUBLIC
        isFork: false
        ownerAffiliations: OWNER
        orderBy: { field: STARGAZERS, direction: DESC }
        first: 50
      ) {
        edges {
          node {
            name
            createdAt
            stargazerCount
          }
        }
      }
    }
  }
`;

export const fetchGithubStats = cache(async (username: string, token?: string): Promise<GithubStats> => {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      query,
      variables: { login: username, from: FROM, to: TO },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        token
          ? `GitHub authentication failed or rate limited: ${body}`
          : `GitHub rate limit exceeded without a token. Add GITHUB_TOKEN for reliable results.`
      );
    }
    throw new Error(`GitHub request failed (${response.status}): ${body}`);
  }

  const json = (await response.json()) as GraphQLResponse;

  if (json.errors?.length) {
    const message = json.errors.map((e) => e.message).join("; ");
    throw new Error(message);
  }

  if (!json.data?.user) {
    throw new Error("User not found");
  }

  const {
    login,
    name,
    avatarUrl,
    contributionsCollection,
    repositories,
  } = json.data.user;

  const contributionDays = contributionsCollection.contributionCalendar.weeks.flatMap(
    (week) => week.contributionDays
  );

  const longestStreak = calculateLongestStreak(contributionDays);
  const topLanguage = calculateTopLanguage(contributionsCollection.commitContributionsByRepository);
  const starsIn2025 = calculateStarsInYear(repositories.edges, YEAR);

  const totalContributions =
    contributionsCollection.totalCommitContributions +
    contributionsCollection.totalPullRequestContributions +
    contributionsCollection.totalIssueContributions +
    contributionsCollection.totalPullRequestReviewContributions +
    contributionsCollection.restrictedContributionsCount;

  return {
    username: login,
    name,
    avatarUrl,
    year: YEAR,
    totals: {
      totalContributions,
      totalCommits: contributionsCollection.totalCommitContributions,
      totalPRs: contributionsCollection.totalPullRequestContributions,
      totalIssues: contributionsCollection.totalIssueContributions,
      totalStars: starsIn2025,
      longestStreak,
      topLanguage,
      totalReviews: contributionsCollection.totalPullRequestReviewContributions,
    },
  };
});

function calculateLongestStreak(days: ContributionDay[]): number {
  let longest = 0;
  let current = 0;

  for (const day of days) {
    if (day.contributionCount > 0) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
}

function calculateTopLanguage(repos: CommitContributionByRepository[]): string | undefined {
  const languageTotals = new Map<string, number>();

  for (const repo of repos) {
    const language = repo.repository.languages.edges[0]?.node.name;
    if (!language) continue;
    const current = languageTotals.get(language) ?? 0;
    languageTotals.set(language, current + repo.contributions.totalCount);
  }

  if (languageTotals.size === 0) return undefined;

  let topLanguage: string | undefined;
  let max = -1;

  for (const [lang, total] of languageTotals) {
    if (total > max) {
      topLanguage = lang;
      max = total;
    }
  }

  return topLanguage;
}

function calculateStarsInYear(repos: RepoEdge[], year: number): number {
  const start = new Date(`${year}-01-01T00:00:00Z`).getTime();
  const end = new Date(`${year + 1}-01-01T00:00:00Z`).getTime();

  return repos.reduce((sum, edge) => {
    const createdAt = new Date(edge.node.createdAt).getTime();
    if (createdAt >= start && createdAt < end) {
      return sum + edge.node.stargazerCount;
    }
    return sum;
  }, 0);
}
