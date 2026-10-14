import type { Article } from '../model/types'
export function ArticlePreview(article: Article): string {
  return `<article>${article.title}</article>`
}
