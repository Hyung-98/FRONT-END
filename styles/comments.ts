import { theme } from '@/styles/theme'
import styled from 'styled-components'

export const CommentsSection = styled.section`
  margin-top: ${theme.spacing['4xl']};
  padding-top: ${theme.spacing['3xl']};
  border-top: 1px solid ${theme.colors.gray200};
`

export const CommentsHeader = styled.div`
  margin-bottom: ${theme.spacing['2xl']};
`

export const CommentsTitle = styled.h2`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.gray900};
  margin-bottom: ${theme.spacing.md};

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize['2xl']};
  }
`

export const CommentsCount = styled.span`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.gray600};
  font-weight: ${theme.typography.fontWeight.normal};
`

export const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
  margin-top: ${theme.spacing.xl};
`

export const CommentItem = styled.div<{ $depth?: number }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  padding-left: ${props => (props.$depth && props.$depth > 0 ? theme.spacing['2xl'] : 0)};
  border-left: ${props =>
    props.$depth && props.$depth > 0 ? `2px solid ${theme.colors.gray200}` : 'none'};
  margin-left: ${props => (props.$depth && props.$depth > 0 ? theme.spacing.lg : 0)};
  padding-top: ${theme.spacing.md};

  @media (max-width: 768px) {
    padding-left: ${props => (props.$depth && props.$depth > 0 ? theme.spacing.lg : 0)};
    margin-left: ${props => (props.$depth && props.$depth > 0 ? theme.spacing.md : 0)};
  }
`

export const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`

export const CommentAvatar = styled.div<{ $url?: string | null }>`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  background-color: ${props => (props.$url ? 'transparent' : theme.colors.gray300)};
  background-image: ${props => (props.$url ? `url(${props.$url})` : 'none')};
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
`

export const CommentAuthorInfo = styled.div`
  flex: 1;
  min-width: 0;
`

export const CommentAuthorName = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray900};
  margin-bottom: ${theme.spacing.xs};
`

export const CommentMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray500};
`

export const CommentContent = styled.div`
  font-size: ${theme.typography.fontSize.base};
  line-height: ${theme.typography.lineHeight.relaxed};
  color: ${theme.colors.gray700};
  white-space: pre-wrap;
  word-break: break-word;
`

export const CommentDeleted = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray500};
  font-style: italic;
`

export const CommentEdited = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.gray500};
  margin-left: ${theme.spacing.xs};
`

export const CommentActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`

export const CommentActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.gray600};
  background: none;
  border: none;
  cursor: pointer;
  transition: color ${theme.transitions.fast};
  border-radius: ${theme.borderRadius.md};

  &:hover {
    color: ${theme.colors.gray900};
    background-color: ${theme.colors.gray100};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const CommentFormWrapper = styled.div`
  margin-top: ${theme.spacing['2xl']};
  padding: ${theme.spacing.xl};
  background-color: ${theme.colors.gray50};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.gray200};
`

export const CommentFormTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray900};
  margin-bottom: ${theme.spacing.md};
`

export const CommentTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.base};
  line-height: ${theme.typography.lineHeight.relaxed};
  color: ${theme.colors.gray900};
  background-color: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray300};
  border-radius: ${theme.borderRadius.md};
  resize: vertical;
  font-family: ${theme.typography.fontFamily};

  &:focus {
    outline: none;
    border-color: ${theme.colors.blue500};
    box-shadow: 0 0 0 3px ${theme.colors.blue100};
  }

  &::placeholder {
    color: ${theme.colors.gray400};
  }
`

export const CommentFormFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${theme.spacing.md};
  gap: ${theme.spacing.md};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`

export const CommentCharCount = styled.div<{ $isOverLimit?: boolean }>`
  font-size: ${theme.typography.fontSize.sm};
  color: ${props => (props.$isOverLimit ? theme.colors.red600 : theme.colors.gray500)};
`

export const CommentSubmitButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.white};
  background-color: ${theme.colors.gray900};
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: background-color ${theme.transitions.fast};

  &:hover:not(:disabled) {
    background-color: ${theme.colors.gray800};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`

export const ReactionButton = styled.button<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  color: ${props => (props.$isActive ? theme.colors.blue600 : theme.colors.gray600)};
  background-color: ${props => (props.$isActive ? theme.colors.blue50 : 'transparent')};
  border: 1px solid ${props => (props.$isActive ? theme.colors.blue200 : theme.colors.gray300)};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover:not(:disabled) {
    background-color: ${props => (props.$isActive ? theme.colors.blue100 : theme.colors.gray100)};
    border-color: ${props => (props.$isActive ? theme.colors.blue300 : theme.colors.gray400)};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const ReactionCount = styled.span`
  font-weight: ${theme.typography.fontWeight.medium};
`

export const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing['2xl']};
  color: ${theme.colors.gray500};
`

export const ErrorMessage = styled.div`
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.red50};
  border: 1px solid ${theme.colors.red200};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.red700};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: ${theme.spacing.md};
`

export const LoginPrompt = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  background-color: ${theme.colors.gray50};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.gray200};
`

export const LoginPromptText = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.gray600};
  margin-bottom: ${theme.spacing.md};
`

export const LoginButton = styled.a`
  display: inline-block;
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.white};
  background-color: ${theme.colors.gray900};
  border-radius: ${theme.borderRadius.md};
  text-decoration: none;
  transition: background-color ${theme.transitions.fast};

  &:hover {
    background-color: ${theme.colors.gray800};
  }
`

export const ReportModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: ${theme.spacing.md};
`

export const ReportModalContent = styled.div`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`

export const ReportModalTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.gray900};
  margin-bottom: ${theme.spacing.md};
`

export const ReportModalSelect = styled.select`
  width: 100%;
  padding: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.gray900};
  background-color: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray300};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.md};

  &:focus {
    outline: none;
    border-color: ${theme.colors.blue500};
    box-shadow: 0 0 0 3px ${theme.colors.blue100};
  }
`

export const ReportModalTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.base};
  line-height: ${theme.typography.lineHeight.relaxed};
  color: ${theme.colors.gray900};
  background-color: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray300};
  border-radius: ${theme.borderRadius.md};
  resize: vertical;
  margin-bottom: ${theme.spacing.md};
  font-family: ${theme.typography.fontFamily};

  &:focus {
    outline: none;
    border-color: ${theme.colors.blue500};
    box-shadow: 0 0 0 3px ${theme.colors.blue100};
  }
`

export const ReportModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
`

export const ReportModalButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  border: none;

  ${props =>
    props.variant === 'primary'
      ? `
    color: ${theme.colors.white};
    background-color: ${theme.colors.gray900};
    &:hover:not(:disabled) {
      background-color: ${theme.colors.gray800};
    }
  `
      : `
    color: ${theme.colors.gray700};
    background-color: ${theme.colors.gray100};
    &:hover:not(:disabled) {
      background-color: ${theme.colors.gray200};
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`
