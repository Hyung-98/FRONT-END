'use client'

import AdminNav from '@/components/AdminNav'
import Footer from '@/components/Footer'
import { Button } from '@/styles/common'
import { theme } from '@/styles/theme'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import * as S from '../../../../styles'
import {
  ButtonGroup,
  ErrorMessage,
  Form,
  FormColumn,
  FormContainer,
  FormGroup,
  Input,
  Label,
  MarkdownTextarea,
  PreviewColumn,
  PreviewHero,
  Select,
  SuccessMessage,
  Textarea,
  TwoColumnLayout,
} from '../../../detail-styles'

export default function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = useParams<{ slug: string }>()

  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    subtitle: '',
    date: new Date()
      .toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      .toUpperCase(),
    category: 'JavaScript',
    readingTime: '10 Min',
    heroImage: '',
    content: '',
  })

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true)
      setError(null)
      setSuccess(false)
      try {
        const res = await fetch(`/api/rest/posts/${slug}`)

        if (!res.ok) {
          throw new Error('Failed to fetch post')
        }

        const response = await res.json()

        // API 응답 구조 확인: { success: true, data: { slug, title, ... } }
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch post')
        }

        const post = response.data
        if (!post) {
          throw new Error('Post data not found')
        }

        // API 응답의 snake_case를 camelCase로 변환 (getPostBySlug는 이미 camelCase 반환)
        setFormData({
          slug: post.slug || '',
          title: post.title || '',
          subtitle: post.subtitle || '',
          date:
            post.date ||
            new Date()
              .toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
              .toUpperCase(),
          category: post.category || 'JavaScript',
          readingTime: post.readingTime || post.reading_time || '10 Min',
          heroImage: post.heroImage || post.hero_image || '',
          content: post.content || '',
        })
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))

    // slug 자동 생성 (title 기반)
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/rest/posts/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: formData.slug,
          title: formData.title,
          subtitle: formData.subtitle,
          content: formData.content,
          category: formData.category || 'JavaScript',
          date:
            formData.date ||
            new Date()
              .toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
              .toUpperCase(),
          reading_time: formData.readingTime || '10 Min',
          hero_image: formData.heroImage || '',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update post')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/detail/${formData.slug}`)
      }, 1500)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !formData.title) {
    return (
      <>
        <AdminNav />
        <FormContainer>
          <h1 style={{ marginBottom: theme.spacing['lg'] }}>포스트 수정</h1>
          <div style={{ textAlign: 'center', padding: theme.spacing['4xl'] }}>
            <p>포스트 데이터를 불러오는 중...</p>
          </div>
        </FormContainer>
        <Footer />
      </>
    )
  }

  return (
    <>
      <AdminNav />
      <FormContainer>
        <h1 style={{ marginBottom: theme.spacing['lg'] }}>포스트 수정</h1>

        {success && (
          <SuccessMessage>
            포스트가 성공적으로 수정되었습니다. 상세 페이지로 이동합니다...
          </SuccessMessage>
        )}

        <TwoColumnLayout>
          <FormColumn>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  type="text"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  placeholder="event-loop"
                />
                <small style={{ color: theme.colors.gray500 }}>
                  URL에 사용될 고유 식별자 (자동 생성됨)
                </small>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="이벤트 루프란 무엇인가?"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="subtitle">부제목 *</Label>
                <Textarea
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  required
                  placeholder="JavaScript의 싱글 스레드 환경에서 비동기 작업을 처리하기 위한 실행 메커니즘에 대해 깊이 있게 알아봅니다."
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="date">날짜 *</Label>
                <Input
                  id="date"
                  name="date"
                  type="text"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  placeholder="23RD JANUARY 2025"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="category">카테고리 *</Label>
                <Select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="JavaScript">JavaScript</option>
                  <option value="React">React</option>
                  <option value="TypeScript">TypeScript</option>
                  <option value="Next.js">Next.js</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="readingTime">읽기 시간 *</Label>
                <Input
                  id="readingTime"
                  name="readingTime"
                  type="text"
                  value={formData.readingTime}
                  onChange={handleChange}
                  required
                  placeholder="10 Min"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="heroImage">히어로 이미지 URL *</Label>
                <Input
                  id="heroImage"
                  name="heroImage"
                  type="url"
                  value={formData.heroImage}
                  onChange={handleChange}
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="content">콘텐츠 (Markdown) *</Label>
                <MarkdownTextarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  placeholder="## 제목&#10;&#10;내용을 작성하세요..."
                />
                <small style={{ color: theme.colors.gray500 }}>Markdown 형식으로 작성하세요</small>
              </FormGroup>

              {error && <ErrorMessage>{error}</ErrorMessage>}

              <ButtonGroup>
                <Button
                  type="button"
                  $variant="secondary"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  취소
                </Button>
                <Button type="submit" $variant="primary" disabled={loading}>
                  {loading ? '저장 중...' : '저장'}
                </Button>
              </ButtonGroup>
            </Form>
          </FormColumn>

          <PreviewColumn>
            <S.HeaderSection>
              <S.Date>{formData.date || 'DATE'}</S.Date>
              <S.Title>{formData.title || '제목을 입력하세요'}</S.Title>
              <S.Subtitle>{formData.subtitle || '부제목을 입력하세요'}</S.Subtitle>
            </S.HeaderSection>

            {formData.heroImage && (
              <PreviewHero>
                <Image
                  src={formData.heroImage}
                  alt={formData.title || 'Preview'}
                  fill
                  style={{ objectFit: 'cover' }}
                  unoptimized
                />
              </PreviewHero>
            )}

            {formData.content && (
              <S.Content>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.content}</ReactMarkdown>
              </S.Content>
            )}

            {!formData.content && (
              // <div style={{
              //   padding: theme.spacing['2xl'],
              //   textAlign: 'center',
              //   color: theme.colors.gray400
              // }}>
              //   Markdown 콘텐츠를 입력하면 미리보기가 여기에 표시됩니다.
              // </div>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.content}</ReactMarkdown>
            )}
          </PreviewColumn>
        </TwoColumnLayout>
      </FormContainer>
    </>
  )
}
