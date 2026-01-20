'use client'

import { BlogPost } from '@/lib/supabase/posts'
import { Section } from '@/styles/common'
import { theme } from '@/styles/theme'
import Image from 'next/image'
import Link from 'next/link'
import styled from 'styled-components'

const Featured = styled(Section)`
  @media (max-width: 480px) {
    margin-bottom: ${theme.spacing['2xl']};
  }
`

const FeaturedCard = styled(Link)`
  text-decoration: none;
  color: inherit;
  position: relative;
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
  background-color: ${theme.colors.gray100};
  min-height: 500px;
  display: flex;
  align-items: flex-end;
  transition: transform ${theme.transitions.fast}, box-shadow ${theme.transitions.fast};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.lg};
  }

  @media (max-width: 480px) {
    min-height: 400px;
  }
`

const FeaturedImageWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`

const FeaturedOverlay = styled.div`
  position: relative;
  z-index: 2;
  padding: ${theme.spacing['2xl']};
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  width: 100%;
  color: ${theme.colors.white};

  @media (max-width: 768px) {
    padding: ${theme.spacing.xl} ${theme.spacing.lg};
  }

  @media (max-width: 480px) {
    padding: ${theme.spacing.lg} ${theme.spacing.md};
  }
`

const FeaturedTitle = styled.h2`
  font-size: ${theme.typography.fontSize['4xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.white};
  max-width: 800px;

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize['3xl']};
  }

  @media (max-width: 480px) {
    font-size: ${theme.typography.fontSize['2xl']};
  }
`

const FeaturedDescription = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  line-height: ${theme.typography.lineHeight.relaxed};
  color: rgba(255, 255, 255, 0.9);
  max-width: 800px;

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.md};
  }
`

interface FeaturedCardProps {
  post: BlogPost
}

export default function FeaturedCardComponent({ post }: FeaturedCardProps) {
  return (
    <Featured>
      <FeaturedCard href={`/detail/${post.slug}`} scroll={false}>
        <FeaturedImageWrapper>
          <Image
            src={post.heroImage || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=600&fit=crop"}
            alt={post.title}
            width={1200}
            height={600}
            sizes="100vw"
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            priority={true}
          />
        </FeaturedImageWrapper>
        <FeaturedOverlay>
          <FeaturedTitle>{post.title}</FeaturedTitle>
          <FeaturedDescription>{post.subtitle}</FeaturedDescription>
        </FeaturedOverlay>
      </FeaturedCard>
    </Featured>
  )
}
