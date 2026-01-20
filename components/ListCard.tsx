'use client'

import { BlogPost } from '@/lib/supabase/posts'
import { Badge } from '@/styles/common'
import { theme } from '@/styles/theme'
import Image from 'next/image'
import Link from 'next/link'
import styled from 'styled-components'

const ListCard = styled(Link)`
  text-decoration: none;
  color: inherit;
`

const CardImageWrapper = styled.div`
  width: 100%;
  height: 240px;
  position: relative;
  background-color: ${theme.colors.gray100};
  overflow: hidden;
  text-align: center;

  @media (max-width: 768px) {
    height: 200px;
  }

  @media (max-width: 480px) {
    height: 180px;
  }
`

const CardContent = styled.div`
  padding: ${theme.spacing.lg};

  @media (max-width: 768px) {
    padding: ${theme.spacing.md};
  }
`

const CardTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray900};
  margin-bottom: ${theme.spacing.md};
  line-height: ${theme.typography.lineHeight.normal};
`

const CardDescription = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.gray600};
  line-height: ${theme.typography.lineHeight.relaxed};
  margin-bottom: ${theme.spacing.md};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray500};
`

const CardAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`

const CardAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.gray300};
`

const CardDate = styled.span`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`

interface ListCardProps {
  post: BlogPost
}

export default function ListCardComponent({ post }: ListCardProps) {
  return (
    <ListCard href={`/detail/${post.slug}`} scroll={false}>
      <CardImageWrapper>
        <Image
          src={post.heroImage || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=240&fit=crop"}
          alt={post.title}
          fill
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={true}
          style={{ objectFit: 'cover' }}
        />
      </CardImageWrapper>
      <CardContent>
        <Badge $category={post.category.toLowerCase() as 'javascript' | 'react' | 'typescript'}>
          {post.category}
        </Badge>
        <CardTitle>{post.title}</CardTitle>
        <CardDescription>{post.subtitle}</CardDescription>
        <CardMeta>
          <CardAuthor>
            <CardAvatar />
            <span>Frontend Dev</span>
          </CardAuthor>
          <CardDate>• {post.date}</CardDate>
        </CardMeta>
      </CardContent>
    </ListCard>
  )
}
