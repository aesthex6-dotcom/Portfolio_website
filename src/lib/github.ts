/**
 * GitHub public-API client with in-memory + localStorage caching.
 * No token required for public data; set VITE_GITHUB_TOKEN to raise the
 * rate limit (instructions in README).
 */

export interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
  bio: string | null
  public_repos: number
  followers: number
  following: number
  location: string | null
  html_url: string
}

export interface GitHubRepo {
  name: string
  full_name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  fork: boolean
  homepage: string | null
}

const CACHE_KEY = 'portfolio:github'
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

interface CacheShape {
  at: number
  user?: GitHubUser | null
  repos?: GitHubRepo[] | null
}

function readCache(): CacheShape {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as CacheShape) : { at: 0 }
  } catch {
    return { at: 0 }
  }
}

function writeCache(patch: Partial<CacheShape>) {
  const cache = { ...readCache(), ...patch, at: Date.now() }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    /* non-critical */
  }
}

function fresh(): boolean {
  return Date.now() - readCache().at < CACHE_TTL
}

async function ghFetch(path: string, signal: AbortSignal): Promise<unknown> {
  const token = import.meta.env.VITE_GITHUB_TOKEN
  const res = await fetch(`https://api.github.com${path}`, {
    signal,
    headers: {
      Accept: 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status}`)
  return res.json()
}

export async function fetchGitHubUser(username: string): Promise<GitHubUser | null> {
  if (!username) return null
  const cached = readCache()
  if (fresh() && cached.user !== undefined) return cached.user
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const user = (await ghFetch(
      `/users/${encodeURIComponent(username)}`,
      controller.signal,
    )) as GitHubUser
    writeCache({ user })
    return user
  } catch {
    return readCache().user ?? null
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
  if (!username) return []
  const cached = readCache()
  if (fresh() && cached.repos !== undefined && cached.repos !== null) return cached.repos
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const repos = (await ghFetch(
      `/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
      controller.signal,
    )) as GitHubRepo[]
    writeCache({ repos })
    return repos
  } catch {
    return readCache().repos ?? []
  } finally {
    clearTimeout(timer)
  }
}

/** Aggregated numbers for the stat tiles. */
export function summarizeRepos(repos: GitHubRepo[]) {
  const own = repos.filter((r) => !r.fork)
  return {
    repos: own.length,
    stars: own.reduce((sum, r) => sum + r.stargazers_count, 0),
    forks: own.reduce((sum, r) => sum + r.forks_count, 0),
    languages: Array.from(new Set(own.map((r) => r.language).filter(Boolean))).slice(
      0,
      6,
    ) as string[],
  }
}
