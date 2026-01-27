import { getAllSlugs } from '@/lib/supabase/posts'
import EditPostClient from './EditPostClient'

export async function generateStaticParams() {
  const slugs = await getAllSlugs()
  return slugs.map(slug => ({ slug }))
}

export default function EditPostPage() {
  return <EditPostClient />
}
