import { Container } from '@/styles/common'
import { theme } from '@/styles/theme'
import styled from 'styled-components'

export const FormContainer = styled(Container)`
  max-width: 1600px;
  padding: ${theme.spacing['xl']} ${theme.spacing.lg};
`

export const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing['xl']};
  align-items: start;

  @media (max-width: ${theme.breakpoints.wide}) {
    grid-template-columns: 1fr;
  }
`

export const FormColumn = styled.div`
  position: sticky;
  top: ${theme.spacing['2xl']};
  max-height: calc(100vh - ${theme.spacing['9xl']});
  padding-right: ${theme.spacing['2xl']};
  padding-bottom: ${theme.spacing['xl']};
  overflow-y: auto;
`

export const PreviewColumn = styled.div`
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray200};
  padding: ${theme.spacing['2xl']};
  position: sticky;
  top: ${theme.spacing['2xl']};
  max-height: calc(100vh - ${theme.spacing['9xl']});
  overflow-y: auto;
`

export const PreviewHero = styled.div`
  width: 100%;
  margin-bottom: ${theme.spacing['2xl']};
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
  position: relative;
  height: 300px;
`

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`

export const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.gray900};
`

export const Input = styled.input`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray300};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  transition: border-color ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${theme.colors.gray900};
  }
`

export const Textarea = styled.textarea`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray300};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  min-height: 200px;
  font-family: inherit;
  resize: vertical;
  transition: border-color ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${theme.colors.gray900};
  }
`

export const MarkdownTextarea = styled(Textarea)`
  min-height: 400px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: ${theme.typography.fontSize.sm};
`

export const Select = styled.select`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray300};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  background-color: ${theme.colors.white};
  cursor: pointer;
  transition: border-color ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${theme.colors.gray900};
  }
`

export const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.lg};
`

export const ErrorMessage = styled.div`
  max-width: 400px;
  margin: 0 auto;
  color: ${theme.colors.red500 || '#ef4444'};
  font-size: ${theme.typography.fontSize.sm};
  margin-top: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.lg};
  text-align: left;
`

export const SuccessMessage = styled.div`
  max-width: 400px;
  margin: 0 auto;
  color: ${theme.colors.green500 || '#22c55e'};
  font-size: ${theme.typography.fontSize.sm};
  padding: ${theme.spacing.md};
  text-align: left;
  background-color: ${theme.colors.green50 || '#f0fdf4'};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.green200 || '#bbf7d0'};
  margin-bottom: ${theme.spacing.lg};
`
