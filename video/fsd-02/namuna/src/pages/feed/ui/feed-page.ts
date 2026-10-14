import { apiGet } from '@/shared/api'
import { ArticlePreview, type Article } from '@/entities/article'
import { LikeButton } from './like-button'
export async function FeedPage(): Promise<string> {
  const { articles } = await apiGet<{ articles: Article[] }>('/articles')
  return articles.map((a) => ArticlePreview(a) + LikeButton()).join('')
}
