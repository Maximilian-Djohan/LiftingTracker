/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the RAG coach backend (Cloudflare Worker in prod, local server in dev). */
  readonly VITE_RAG_API_URL?: string
}
