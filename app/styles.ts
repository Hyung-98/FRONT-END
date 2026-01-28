import { BodyText, Flex, Heading1 } from '@/styles/common'
import { theme } from '@/styles/theme'
import styled from 'styled-components'

export const Main = styled.main`
  max-width: ${theme.breakpoints.wide};
  margin: 0 auto;
  padding: ${theme.spacing['4xl']} ${theme.spacing.lg};

  @media (max-width: 768px) {
    padding: ${theme.spacing['2xl']} ${theme.spacing.md};
  }
`

export const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing['2xl']};
`

export const Date = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.gray500};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${theme.spacing.md};
`

export const Title = styled(Heading1)`
  margin-bottom: ${theme.spacing.lg};
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
`

export const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.gray600};
  line-height: ${theme.typography.lineHeight.relaxed};
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.lg};
  }

  @media (max-width: 480px) {
    font-size: ${theme.typography.fontSize.md};
  }
`

export const Hero = styled.div`
  width: 100%;
  margin-bottom: ${theme.spacing['3xl']};
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
  position: relative;
  height: 600px;
`

export const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: ${theme.spacing['3xl']};
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing['2xl']};
  }
`

export const Content = styled.article`
  min-width: 0;

  h2 {
    font-size: ${theme.typography.fontSize['3xl']};
    font-weight: ${theme.typography.fontWeight.bold};
    color: ${theme.colors.gray900};
    margin-top: ${theme.spacing['2xl']};
    margin-bottom: ${theme.spacing.lg};
    line-height: ${theme.typography.lineHeight.normal};

    &:first-child {
      margin-top: 0;
    }

    @media (max-width: 768px) {
      font-size: ${theme.typography.fontSize['3xl']};
    }

    @media (max-width: 480px) {
      font-size: ${theme.typography.fontSize['2xl']};
    }
  }

  h3 {
    font-size: ${theme.typography.fontSize['2xl']};
    font-weight: ${theme.typography.fontWeight.semibold};
    color: ${theme.colors.gray900};
    margin-top: ${theme.spacing.xl};
    margin-bottom: ${theme.spacing.md};
    line-height: ${theme.typography.lineHeight.normal};

    @media (max-width: 768px) {
      font-size: 22px;
    }

    @media (max-width: 480px) {
      font-size: ${theme.typography.fontSize.xl};
    }
  }

  h4 {
    font-size: ${theme.typography.fontSize.xl};
    font-weight: ${theme.typography.fontWeight.semibold};
    color: ${theme.colors.gray900};
    margin-top: ${theme.spacing.lg};
    margin-bottom: ${theme.spacing.md};
    line-height: ${theme.typography.lineHeight.normal};
  }

  p {
    font-size: ${theme.typography.fontSize.lg};
    line-height: ${theme.typography.lineHeight.loose};
    color: ${theme.colors.gray700};
    margin-bottom: ${theme.spacing.sm};

    @media (max-width: 768px) {
      font-size: ${theme.typography.fontSize.md};
    }
  }

  img {
    width: 100%;
    height: auto;
    object-fit: cover;
  }

  strong {
    font-weight: ${theme.typography.fontWeight.semibold};
    color: ${theme.colors.gray900};
  }

  /* 리스트 스타일 */
  li {
    font-size: ${theme.typography.fontSize.lg};
    line-height: ${theme.typography.lineHeight.loose};
    color: ${theme.colors.gray700};
    margin-bottom: ${theme.spacing.lg};
    padding-left: ${theme.spacing.xl};
    position: relative;

    @media (max-width: 768px) {
      font-size: ${theme.typography.fontSize.md};
      padding-left: 28px;
    }
  }

  /* ul 리스트 - 커스텀 불릿 포인트 */
  ul > li::before {
    content: '';
    position: absolute;
    left: ${theme.spacing.sm};
    top: 12px;
    width: 6px;
    height: 6px;
    background-color: ${theme.colors.gray900};
    border-radius: ${theme.borderRadius.full};
    transform: translateY(-50%);

    @media (max-width: 768px) {
      left: 6px;
      width: 5px;
      height: 5px;
    }
  }

  /* ol 리스트 - 커스텀 번호 */
  ol > li {
    counter-increment: list-counter;
    padding-left: ${theme.spacing['xl']};

    @media (max-width: 768px) {
      padding-left: 44px;
    }
  }

  ol > li::before {
    content: counter(list-counter);
    position: absolute;
    left: 0;
    top: 4px;
    width: 20px;
    height: 20px;
    background-color: ${theme.colors.gray900};
    color: ${theme.colors.white};
    border-radius: ${theme.borderRadius.sm};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${theme.typography.fontSize.sm};
    font-weight: ${theme.typography.fontWeight.semibold};
    line-height: 1;

    @media (max-width: 768px) {
      width: 28px;
      height: 28px;
      font-size: 13px;
    }
  }

  ul ul > li,
  ol ul > li {
    padding-left: 25px;
    font-size: ${theme.typography.fontSize.md};
    margin-bottom: ${theme.spacing.sm};

    @media (max-width: 768px) {
      padding-left: 36px;
      font-size: 15px;
    }
  }

  ul ul > li::before {
    content: '';
    position: absolute;
    left: 0;
    width: 4px;
    height: 4px;
    background-color: ${theme.colors.gray500};
  }

  ol ol > li {
    padding-left: 56px;

    @media (max-width: 768px) {
      padding-left: 52px;
    }
  }

  ol ol > li::before {
    content: '';
    width: 28px;
    height: 28px;
    font-size: 13px;
    background-color: ${theme.colors.gray400};

    @media (max-width: 768px) {
      width: 26px;
      height: 26px;
      font-size: ${theme.typography.fontSize.xs};
    }
  }

  li strong {
    color: ${theme.colors.gray900};
    font-weight: ${theme.typography.fontWeight.semibold};
  }

  li code {
    font-size: ${theme.typography.fontSize.md};
    padding: 2px 6px;
  }

  code {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    background-color: rgba(175, 184, 193, 0.2);
    border-radius: ${theme.borderRadius.md};
    font-family:
      ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
  }

  pre {
    padding: ${theme.spacing.lg};
    overflow: auto;
    font-size: ${theme.typography.fontSize.sm};
    line-height: ${theme.typography.lineHeight.relaxed};
    background-color: #f6f8fa;
    border-radius: ${theme.borderRadius.lg};
    border: 1px solid ${theme.colors.gray200};
    margin-bottom: ${theme.spacing.lg};
  }

  pre code {
    background-color: transparent;
    padding: 0;
    margin: 0;
    font-size: 100%;
    word-break: normal;
    white-space: pre;
    color: #1f2328;
  }

  .dark-theme pre {
    background-color: #0d1117;
    border: 1px solid #30363d;
  }

  .dark-theme pre code {
    color: #e6edf3;
  }

  .img-wrap {
    width: 100%;
    margin: ${theme.spacing.xl} 0;
    border-radius: ${theme.borderRadius.xl};
    overflow: hidden;
  }

  .img-wrap img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
  }

  .pre-line {
    white-space: pre-line;
  }
`

export const Sidebar = styled.aside`
  position: sticky;
  top: 100px;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};

  @media (max-width: 1024px) {
    position: static;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${theme.spacing.xl};
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.xl};
  }
`

export const SidebarSection = styled.section`
  background-color: ${theme.colors.gray50};
  border: 1px solid ${theme.colors.gray200};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: 0;
`

export const SidebarTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray600};
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin: 0 0 ${theme.spacing.md} 0;
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 2px solid ${theme.colors.gray200};
`

export const ShareLinks = styled(Flex)`
  flex-direction: column;
  gap: ${theme.spacing.sm};

  @media (max-width: 1024px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.sm};
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

export const Details = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
`

export const DetailItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.gray200};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
`

export const DetailLabel = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray500};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
`

export const DetailValue = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray900};
  font-weight: ${theme.typography.fontWeight.medium};
  text-align: right;
  word-break: break-word;
`

export const Author = styled(Flex)`
  flex-direction: column;
  gap: ${theme.spacing.md};
`

export const AuthorInfo = styled(Flex)`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`

export const AuthorAvatar = styled.div`
  width: 52px;
  height: 52px;
  min-width: 52px;
  min-height: 52px;
  border-radius: ${theme.borderRadius.full};
  background: linear-gradient(135deg, ${theme.colors.gray400} 0%, ${theme.colors.gray600} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.white};
  letter-spacing: -0.5px;
`

export const AuthorDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  min-width: 0;
`

export const AuthorName = styled.div`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray900};
  margin-bottom: 2px;
`

export const AuthorTitle = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.gray500};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const AuthorBio = styled(BodyText)`
  font-size: ${theme.typography.fontSize.sm};
  line-height: ${theme.typography.lineHeight.relaxed};
  color: ${theme.colors.gray600};
  margin: 0;
  padding-top: ${theme.spacing.sm};
  border-top: 1px solid ${theme.colors.gray200};
`
