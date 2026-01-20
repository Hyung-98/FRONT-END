import { BlogPost } from '@/lib/supabase/posts'
import { Grid, Section } from '@/styles/common'
import { theme } from '@/styles/theme'
import styled from 'styled-components'
import FeaturedCardComponent from './FeaturedCard'
import ListCardComponent from './ListCard'

const Main = styled.main`
  max-width: ${theme.breakpoints.wide};
  margin: 0 auto;
  padding: ${theme.spacing['4xl']} ${theme.spacing.lg};

  @media (max-width: 768px) {
    padding: ${theme.spacing['2xl']} ${theme.spacing.md};
  }
`

const Recent = styled(Section)``

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.gray900};
  margin-bottom: ${theme.spacing['2xl']};

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize['3xl']};
    margin-bottom: ${theme.spacing.xl};
  }

  @media (max-width: 480px) {
    font-size: ${theme.typography.fontSize['2xl']};
  }
`

const ListGrid = styled(Grid)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 32px;
  margin-bottom: ${theme.spacing['2xl']};

  @media (max-width: 768px) {
    gap: 24px;
  }
`

interface HomeContentProps {
  featuredPost?: BlogPost
  recentPosts: BlogPost[]
}

export default function HomeContent({ featuredPost, recentPosts }: HomeContentProps) {
  return (
    <Main>
      {featuredPost && <FeaturedCardComponent post={featuredPost} />}

      <Recent>
        <SectionTitle>Recent blog posts</SectionTitle>
        <ListGrid>
          {recentPosts.map((post) => (
            <ListCardComponent key={post.slug} post={post} />
          ))}
        </ListGrid>
      </Recent>
    </Main>
  )
}
