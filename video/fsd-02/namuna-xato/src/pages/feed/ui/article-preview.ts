import type { Article } from '@/entities/article'
import { LikeButton } from '@/features/like-article'
export function ArticlePreview(article: Article): string {
  return `<article>${article.title} ${LikeButton()}</article>`
}
