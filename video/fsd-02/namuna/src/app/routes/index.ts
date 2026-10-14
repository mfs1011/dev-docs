import { FeedPage } from '@/pages/feed'
import { ProfilePage } from '@/pages/profile'

export const routes = [
  { path: '/', page: FeedPage },
  { path: '/profile/:username', page: ProfilePage },
]
