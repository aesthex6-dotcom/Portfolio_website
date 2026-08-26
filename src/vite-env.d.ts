/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_TOKEN?: string
  readonly VITE_AI_ENDPOINT?: string
  readonly VITE_AI_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
