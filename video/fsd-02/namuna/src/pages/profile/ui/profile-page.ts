import { apiGet } from '@/shared/api'
import { ArticlePreview, type Article } from '@/entities/article'
export async function ProfilePage(username: string): Promise<string> {
  const { articles } = await apiGet<{ articles: Article[] }>(`/articles?author=${username}`)
  return articles.map(ArticlePreview).join('')
}
