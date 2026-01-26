'use client'

import { theme } from '@/styles/theme'
import styled, { keyframes } from 'styled-components'

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`

const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    ${theme.colors.gray200} 0%,
    ${theme.colors.gray100} 50%,
    ${theme.colors.gray200} 100%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite;
  border-radius: ${theme.borderRadius.md};
`

const PostCardSkeleton = styled(SkeletonBase)`
  height: 400px;
  width: 100%;
  margin-bottom: ${theme.spacing.lg};

  @media (max-width: 768px) {
    height: 300px;
  }
`

const FeaturedCardSkeleton = styled(SkeletonBase)`
  height: 500px;
  width: 100%;
  margin-bottom: ${theme.spacing['2xl']};

  @media (max-width: 768px) {
    height: 350px;
  }
`

const TitleSkeleton = styled(SkeletonBase)`
  height: 32px;
  width: 60%;
  margin-bottom: ${theme.spacing.md};
`

const SubtitleSkeleton = styled(SkeletonBase)`
  height: 24px;
  width: 80%;
  margin-bottom: ${theme.spacing.sm};
`

const TextSkeleton = styled(SkeletonBase)`
  height: 16px;
  width: 100%;
  margin-bottom: ${theme.spacing.xs};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 32px;
  margin-bottom: ${theme.spacing['2xl']};

  @media (max-width: 768px) {
    gap: 24px;
  }
`

// 포스트 카드 스켈레톤
export function PostCardSkeletonComponent() {
  return (
    <PostCardSkeleton>
      <div style={{ padding: theme.spacing.lg }}>
        <TitleSkeleton />
        <SubtitleSkeleton />
        <div style={{ marginTop: theme.spacing.md }}>
          <TextSkeleton />
          <TextSkeleton />
          <TextSkeleton style={{ width: '60%' }} />
        </div>
      </div>
    </PostCardSkeleton>
  )
}

// Featured 카드 스켈레톤
export function FeaturedCardSkeletonComponent() {
  return <FeaturedCardSkeleton />
}

// 포스트 목록 스켈레톤
export function PostListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Grid>
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeletonComponent key={i} />
      ))}
    </Grid>
  )
}

// 상세 페이지 스켈레톤
export function DetailPageSkeleton() {
  return (
    <div
      style={{ maxWidth: theme.breakpoints.wide, margin: '0 auto', padding: theme.spacing['4xl'] }}
    >
      <TitleSkeleton style={{ width: '80%', height: '48px', marginBottom: theme.spacing.lg }} />
      <SubtitleSkeleton style={{ width: '70%', marginBottom: theme.spacing['2xl'] }} />
      <SkeletonBase
        style={{ height: '400px', width: '100%', marginBottom: theme.spacing['2xl'] }}
      />
      <div>
        {Array.from({ length: 10 }).map((_, i) => (
          <TextSkeleton key={i} style={{ width: i % 3 === 0 ? '90%' : '100%' }} />
        ))}
      </div>
    </div>
  )
}

// 기본 export (상세 페이지용)
export default DetailPageSkeleton
