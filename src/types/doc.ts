export interface SearchDocument {
  path?: string
  title?: string
  heading?: string
  content?: string
  section?: string
}

export interface SearchResult {
  id: string
  document?: SearchDocument
  score?: number
}
