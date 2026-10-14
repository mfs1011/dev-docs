import { apiGet } from '@/shared/api'
import { ArticlePreview } from '@/pages/feed'
export async function ProfilePage(username: string): Promise<string> {
  const { articles } = await apiGet<{ articles: never[] }>(`/articles?author=${username}`)
  return articles.map(ArticlePreview).join('')
}
