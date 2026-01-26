/**
 * 페이지 로드 시 header.html을 동적으로 import하는 스크립트
 */
;(function () {
  'use strict'

  // header.html 파일 경로
  const headerPath = '/web/common/html/header.html'
  // const

  /**
   * header.html을 가져와서 DOM에 삽입
   */
  async function importHeader() {
    try {
      const response = await fetch(headerPath)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const headerHTML = await response.text()

      // header를 삽입할 위치 찾기 (body의 첫 번째 자식으로 삽입)
      const body = document.body

      if (body) {
        // 임시 컨테이너 생성하여 HTML 파싱
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = headerHTML

        // body의 시작 부분에 header 삽입
        while (tempDiv.firstChild) {
          body.insertBefore(tempDiv.firstChild, body.firstChild)
        }

        // h1 텍스트를 동적으로 변경
        // 우선순위: data-page-title 속성 > document.title
        const header = body.querySelector('header')

        if (header) {
          const h1 = header.querySelector('h1')
          if (h1) {
            // body나 html 태그의 data-page-title 속성 확인
            const pageTitle =
              body.getAttribute('data-page-title') ||
              document.documentElement.getAttribute('data-page-title') ||
              document.title
            h1.textContent = pageTitle
          }

          // 헤더 로드 완료 이벤트 발생 (utils.js에서 사용)
          const headerLoadedEvent = new CustomEvent('headerLoaded', {
            detail: { header: header },
          })
          document.dispatchEvent(headerLoadedEvent)
        }
      }
    } catch (error) {
      console.error('Header import failed:', error)
    }
  }

  // DOM이 로드된 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', importHeader)
  } else {
    // DOM이 이미 로드된 경우 즉시 실행
    importHeader()
  }
})()
