import ListCardComponent from '@/components/ListCard'
import { BlogPost } from '@/lib/supabase/posts'
import { Grid, Section } from '@/styles/common'
import { theme } from '@/styles/theme'
import styled from 'styled-components'

const RelatedSection = styled(Section)`
  margin-top: ${theme.spacing['4xl']};
  padding-top: ${theme.spacing['4xl']};
  border-top: 1px solid ${theme.colors.gray200};
`

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.gray900};
  margin-bottom: ${theme.spacing['2xl']};

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize['2xl']};
  }
`

const ListGrid = styled(Grid)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 32px;

  @media (max-width: 768px) {
    gap: 24px;
  }
`

interface RelatedPostsProps {
  posts: BlogPost[]
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null
  }

  return (
    <RelatedSection>
      <SectionTitle>관련 포스트</SectionTitle>
      <ListGrid>
        {posts.map((post, index) => (
          <ListCardComponent key={post.slug} post={post} priority={index < 3} />
        ))}
      </ListGrid>
    </RelatedSection>
  )
}
