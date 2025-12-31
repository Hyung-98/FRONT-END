/**
 * 헤더 네비게이션 토글 기능
 * 헤더가 동적으로 로드되므로, headerLoaded 이벤트를 기다립니다.
 */
(function () {
  "use strict";

  function openNav() {
    const navOverlay = document.querySelector(".nav-overlay");
    const navContainer = document.querySelector(".nav-container");
    if (navOverlay && navContainer) {
      navOverlay.style.opacity = "1";
      navOverlay.style.visibility = "visible";
      navContainer.style.opacity = "1";
      navContainer.style.visibility = "visible";
      navContainer.style.transform = "translateX(0)";
    }
  }

  function closeNav() {
    const navOverlay = document.querySelector(".nav-overlay");
    const navContainer = document.querySelector(".nav-container");
    if (navOverlay && navContainer) {
      navOverlay.style.opacity = "0";
      navOverlay.style.visibility = "hidden";
      navContainer.style.opacity = "0";
      navContainer.style.visibility = "hidden";
      navContainer.style.transform = "translateX(-100%)";
    }
  }

  /**
   * 네비게이션 열기/닫기 이벤트 초기화
   */
  function initNavOpenClose() {
    const navOpen = document.querySelector(".nav-open");
    const navClose = document.querySelector(".nav-close");
    const navOverlay = document.querySelector(".nav-overlay");

    if (navOpen) {
      navOpen.addEventListener("click", openNav);
    }

    if (navClose) {
      navClose.addEventListener("click", closeNav);
    }

    if (navOverlay) {
      navOverlay.addEventListener("click", closeNav);
    }

    // 초기 상태: nav를 닫힌 상태로 설정
    closeNav();
  }

  /**
   * 네비게이션 이벤트 초기화
   */
  function initNavToggle() {
    const navToggles = document.querySelectorAll(".nav-toggle");
    const allNavSubLists = document.querySelectorAll(".nav-sublist");

    navToggles.forEach((navToggle) => {
      navToggle.addEventListener("click", (e) => {
        const navSubList = navToggle.nextElementSibling;
        e.preventDefault();

        // 현재 클릭한 서브리스트가 이미 활성화되어 있는지 확인
        const isCurrentlyActive = navSubList.classList.contains("active");

        // 모든 서브리스트와 토글 버튼을 비활성화
        allNavSubLists.forEach((sublist) => {
          sublist.classList.remove("active");
        });
        navToggles.forEach((toggle) => {
          toggle.setAttribute("aria-expanded", "false");
        });

        // 현재 클릭한 것이 활성화되어 있지 않았으면 활성화
        if (!isCurrentlyActive) {
          navSubList.classList.add("active");
          navToggle.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  /**
   * 헤더 로드 완료 후 초기화
   */
  function initAll() {
    initNavOpenClose(); // nav 열기/닫기 초기화 (초기 상태: 닫힘)
    initNavToggle(); // 서브메뉴 토글 초기화
  }

  // 방법 1: headerLoaded 이벤트를 기다림 (import.js에서 발생시킴)
  document.addEventListener("headerLoaded", initAll);

  // 방법 2: 헤더가 이미 로드되어 있을 수 있으므로 즉시 확인
  if (document.querySelector("header")) {
    initAll();
  }
})();
