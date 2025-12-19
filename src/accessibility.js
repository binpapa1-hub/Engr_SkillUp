/**
 * 접근성 및 사용성 관련 기능
 */

/**
 * 반응형 디자인 브레이크포인트
 */
export const RESPONSIVE_BREAKPOINTS = {
    mobile: 768,      // 모바일: 768px 미만
    tablet: 1200,     // 태블릿: 768px ~ 1199px
    desktop: 1200     // 데스크톱: 1200px 이상
};

/**
 * 현재 뷰포트 크기를 가져옵니다.
 * @returns {Object} 뷰포트 크기 객체 { width, height }
 */
export function getViewportSize() {
    return {
        width: window.innerWidth || document.documentElement.clientWidth || 0,
        height: window.innerHeight || document.documentElement.clientHeight || 0
    };
}

/**
 * 모바일 뷰포트인지 확인합니다.
 * @returns {boolean} 모바일 뷰포트 여부
 */
export function isMobileViewport() {
    const viewport = getViewportSize();
    return viewport.width < RESPONSIVE_BREAKPOINTS.mobile;
}

/**
 * 태블릿 뷰포트인지 확인합니다.
 * @returns {boolean} 태블릿 뷰포트 여부
 */
export function isTabletViewport() {
    const viewport = getViewportSize();
    return viewport.width >= RESPONSIVE_BREAKPOINTS.mobile && 
           viewport.width < RESPONSIVE_BREAKPOINTS.tablet;
}

/**
 * 데스크톱 뷰포트인지 확인합니다.
 * @returns {boolean} 데스크톱 뷰포트 여부
 */
export function isDesktopViewport() {
    const viewport = getViewportSize();
    return viewport.width >= RESPONSIVE_BREAKPOINTS.desktop;
}

/**
 * 반응형 레이아웃을 확인합니다.
 * @returns {Object} 레이아웃 정보 객체
 */
export function checkResponsiveLayout() {
    const viewport = getViewportSize();
    const isMobile = isMobileViewport();
    const isTablet = isTabletViewport();
    const isDesktop = isDesktopViewport();
    
    return {
        viewport,
        isMobile,
        isTablet,
        isDesktop,
        breakpoint: isMobile ? 'mobile' : (isTablet ? 'tablet' : 'desktop')
    };
}

/**
 * 키보드 네비게이션을 설정합니다.
 */
export function setupKeyboardNavigation() {
    // Tab 키 네비게이션은 브라우저 기본 동작을 사용
    // 추가적인 커스터마이징이 필요한 경우 여기서 구현
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            handleTabNavigation(e);
        } else if (e.key === 'Enter') {
            handleEnterKey(e, e.target.closest('form'));
        } else if (e.key === 'Escape') {
            const modal = document.querySelector('.modal:not([style*="display: none"])');
            if (modal) {
                handleEscapeKey(e, modal);
            }
        }
    });
}

/**
 * Tab 키 네비게이션을 처리합니다.
 * @param {KeyboardEvent} event - 키보드 이벤트
 */
export function handleTabNavigation(event) {
    // Tab 키는 브라우저 기본 동작을 사용
    // 추가적인 커스터마이징이 필요한 경우 여기서 구현
    // 예: 특정 요소를 건너뛰거나, 포커스 트랩 설정 등
}

/**
 * Enter 키를 처리합니다.
 * @param {KeyboardEvent} event - 키보드 이벤트
 * @param {HTMLFormElement} form - 폼 요소
 */
export function handleEnterKey(event, form) {
    if (!form || !event || !event.target) {
        return;
    }
    
    const target = event.target;
    
    // Enter 키가 입력 필드에서 눌렸을 때 폼 제출
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // textarea에서는 Enter 키가 기본 동작이므로 제출하지 않음
        if (target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Enter 키로 폼 제출
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
    }
}

/**
 * Escape 키를 처리합니다 (모달 닫기 등).
 * @param {KeyboardEvent} event - 키보드 이벤트
 * @param {HTMLElement} modal - 모달 요소
 */
export function handleEscapeKey(event, modal) {
    if (!modal) {
        return;
    }
    
    // 모달 닫기 (향후 구현)
    // 예: modal.style.display = 'none';
    // 또는: modal.dispatchEvent(new Event('close'));
}

/**
 * 키보드 접근성을 확인합니다.
 * @returns {Object} 접근성 검증 결과
 */
export function checkKeyboardAccessibility() {
    // 모든 인터랙티브 요소 찾기
    const interactiveSelectors = [
        'button',
        'input',
        'select',
        'textarea',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
        '[onclick]',
        '[role="button"]',
        '[role="link"]'
    ];
    
    const interactiveElements = [];
    
    interactiveSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            // 중복 제거
            if (!interactiveElements.includes(element)) {
                interactiveElements.push(element);
            }
        });
    });
    
    // 접근 가능한 요소 확인
    const accessibleElements = interactiveElements.filter(element => {
        // tabindex가 -1이 아니고, disabled가 아닌 요소
        const tabindex = element.getAttribute('tabindex');
        const isDisabled = element.hasAttribute('disabled') || 
                          element.getAttribute('aria-disabled') === 'true';
        
        return (tabindex !== '-1' && !isDisabled) || 
               (tabindex === null && !isDisabled);
    });
    
    return {
        interactiveElements: Array.from(interactiveElements),
        accessibleElements: Array.from(accessibleElements),
        allAccessible: interactiveElements.length === accessibleElements.length,
        totalCount: interactiveElements.length,
        accessibleCount: accessibleElements.length
    };
}

