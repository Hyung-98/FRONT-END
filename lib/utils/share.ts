/**
 * 소셜 미디어 공유 URL 생성 유틸리티
 */

export interface ShareData {
  url: string
  title: string
  description?: string
}

/**
 * Twitter 공유 URL 생성
 */
export function getTwitterShareUrl(data: ShareData): string {
  const text = encodeURIComponent(data.title)
  const url = encodeURIComponent(data.url)
  return `https://twitter.com/intent/tweet?url=${url}&text=${text}`
}

/**
 * Facebook 공유 URL 생성
 */
export function getFacebookShareUrl(data: ShareData): string {
  const url = encodeURIComponent(data.url)
  return `https://www.facebook.com/sharer/sharer.php?u=${url}`
}

/**
 * LinkedIn 공유 URL 생성
 */
export function getLinkedInShareUrl(data: ShareData): string {
  const url = encodeURIComponent(data.url)
  const title = encodeURIComponent(data.title)
  const summary = data.description ? encodeURIComponent(data.description) : ''
  return `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`
}

/**
 * 클립보드에 URL 복사
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        textArea.remove()
        return true
      } catch (err) {
        textArea.remove()
        return false
      }
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    return false
  }
}
