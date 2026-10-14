import { Header } from '@/widgets/header'
import { Sidebar } from '@/widgets/sidebar'
export function HomePage(): string {
  return Header() + Sidebar()
}
