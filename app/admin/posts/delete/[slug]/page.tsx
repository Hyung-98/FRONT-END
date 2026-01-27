import { getAllSlugs } from '@/lib/supabase/posts'
import DeletePostClient from './DeletePostClient'

export async function generateStaticParams() {
  const slugs = await getAllSlugs()
  return slugs.map(slug => ({ slug }))
}

export default function DeletePostPage() {
  return <DeletePostClient />
}
