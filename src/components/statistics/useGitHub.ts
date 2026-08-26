import { useEffect, useState } from 'react'
import {
  fetchGitHubRepos,
  fetchGitHubUser,
  summarizeRepos,
  type GitHubRepo,
  type GitHubUser,
} from '@/lib/github'

export interface GitHubSummary {
  repos: number
  stars: number
  forks: number
  languages: string[]
}

export function useGitHub(username: string) {
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [summary, setSummary] = useState<GitHubSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userFailed, setUserFailed] = useState(false)
  const [reposFailed, setReposFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    let localReposFailed = false
    setLoading(true)
    setError(null)
    setUserFailed(false)
    setReposFailed(false)

    Promise.all([
      fetchGitHubUser(username).catch(() => { setUserFailed(true); return null; }),
      fetchGitHubRepos(username).catch(() => { localReposFailed = true; setReposFailed(true); return []; }),
    ])
      .then(([u, repos]) => {
        if (cancelled) return
        setUser(u)
        // Use local variable that captures the failure state synchronously
        if (!localReposFailed && u && repos.length > 0) {
          const summarized = summarizeRepos(repos as GitHubRepo[])
                    setSummary(summarized)
        } else if (!localReposFailed && u) {
          // API succeeded but no repos or error
                    setSummary(null)
        } else {
                  }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [username])

  return { user, summary, loading, error, userFailed, reposFailed }
}
