import { apiGet } from '@/shared/api'
import type { Article } from '@/entities/article'
import { ArticlePreview } from './article-preview'
export async function FeedPage(): Promise<string> {
  const { articles } = await apiGet<{ articles: Article[] }>('/articles')
  return articles.map(ArticlePreview).join('')
}
