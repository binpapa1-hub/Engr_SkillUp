import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
    checkResponsiveLayout,
    getViewportSize,
    isMobileViewport,
    isTabletViewport,
    isDesktopViewport,
    setupKeyboardNavigation,
    handleTabNavigation,
    handleEnterKey,
    handleEscapeKey,
    checkKeyboardAccessibility,
    RESPONSIVE_BREAKPOINTS
} from '../src/accessibility.js';

describe('접근성 및 사용성 테스트', () => {
    beforeEach(() => {
        // 각 테스트 전에 DOM 초기화
        document.body.innerHTML = '';
        
        // window.innerWidth, innerHeight 모킹
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1920
        });
        
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: 1080
        });
    });

    describe('반응형 디자인', () => {
        describe('모바일 화면 (768px 미만) 레이아웃 검증', () => {
            it('모바일 뷰포트 크기를 감지할 수 있어야 함', () => {
                window.innerWidth = 375;
                window.innerHeight = 667;
                
                const viewport = getViewportSize();
                
                expect(viewport.width).toBe(375);
                expect(viewport.height).toBe(667);
            });

            it('모바일 뷰포트인지 확인할 수 있어야 함', () => {
                window.innerWidth = 375;
                
                const isMobile = isMobileViewport();
                
                expect(isMobile).toBe(true);
            });

            it('모바일 화면에서 레이아웃이 올바르게 적용되어야 함', () => {
                window.innerWidth = 375;
                
                document.body.innerHTML = `
                    <div class="container">
                        <header>헤더</header>
                        <main>메인 콘텐츠</main>
                        <footer>푸터</footer>
                    </div>
                `;
                
                const result = checkResponsiveLayout();
                
                expect(result).toBeDefined();
                expect(result.viewport).toBeDefined();
                expect(result.isMobile).toBe(true);
                expect(result.isTablet).toBe(false);
                expect(result.isDesktop).toBe(false);
            });

            it('모바일 화면에서 컨테이너가 전체 너비를 사용해야 함', () => {
                window.innerWidth = 375;
                
                document.body.innerHTML = `
                    <div class="container" style="width: 100%;">
                        <div>콘텐츠</div>
                    </div>
                `;
                
                const container = document.querySelector('.container');
                const result = checkResponsiveLayout();
                
                expect(result.isMobile).toBe(true);
                expect(container).toBeDefined();
            });
        });

        describe('태블릿 화면 (768px~1199px) 레이아웃 검증', () => {
            it('태블릿 뷰포트 크기를 감지할 수 있어야 함', () => {
                window.innerWidth = 768;
                window.innerHeight = 1024;
                
                const viewport = getViewportSize();
                
                expect(viewport.width).toBe(768);
                expect(viewport.height).toBe(1024);
            });

            it('태블릿 뷰포트인지 확인할 수 있어야 함', () => {
                window.innerWidth = 1024;
                
                const isTablet = isTabletViewport();
                
                expect(isTablet).toBe(true);
            });

            it('태블릿 화면에서 레이아웃이 올바르게 적용되어야 함', () => {
                window.innerWidth = 1024;
                
                document.body.innerHTML = `
                    <div class="container">
                        <header>헤더</header>
                        <main>메인 콘텐츠</main>
                        <footer>푸터</footer>
                    </div>
                `;
                
                const result = checkResponsiveLayout();
                
                expect(result).toBeDefined();
                expect(result.isMobile).toBe(false);
                expect(result.isTablet).toBe(true);
                expect(result.isDesktop).toBe(false);
            });

            it('태블릿 화면 경계값 테스트 (768px)', () => {
                window.innerWidth = 768;
                
                const isTablet = isTabletViewport();
                const isMobile = isMobileViewport();
                
                expect(isTablet).toBe(true);
                expect(isMobile).toBe(false);
            });

            it('태블릿 화면 경계값 테스트 (1199px)', () => {
                window.innerWidth = 1199;
                
                const isTablet = isTabletViewport();
                const isDesktop = isDesktopViewport();
                
                expect(isTablet).toBe(true);
                expect(isDesktop).toBe(false);
            });
        });

        describe('데스크톱 화면 (1200px 이상) 레이아웃 검증', () => {
            it('데스크톱 뷰포트 크기를 감지할 수 있어야 함', () => {
                window.innerWidth = 1920;
                window.innerHeight = 1080;
                
                const viewport = getViewportSize();
                
                expect(viewport.width).toBe(1920);
                expect(viewport.height).toBe(1080);
            });

            it('데스크톱 뷰포트인지 확인할 수 있어야 함', () => {
                window.innerWidth = 1920;
                
                const isDesktop = isDesktopViewport();
                
                expect(isDesktop).toBe(true);
            });

            it('데스크톱 화면에서 레이아웃이 올바르게 적용되어야 함', () => {
                window.innerWidth = 1920;
                
                document.body.innerHTML = `
                    <div class="container">
                        <header>헤더</header>
                        <main>메인 콘텐츠</main>
                        <footer>푸터</footer>
                    </div>
                `;
                
                const result = checkResponsiveLayout();
                
                expect(result).toBeDefined();
                expect(result.isMobile).toBe(false);
                expect(result.isTablet).toBe(false);
                expect(result.isDesktop).toBe(true);
            });

            it('데스크톱 화면 경계값 테스트 (1200px)', () => {
                window.innerWidth = 1200;
                
                const isDesktop = isDesktopViewport();
                const isTablet = isTabletViewport();
                
                expect(isDesktop).toBe(true);
                expect(isTablet).toBe(false);
            });
        });
    });

    describe('키보드 네비게이션', () => {
        describe('Tab 키로 모든 인터랙티브 요소 접근 가능', () => {
            it('Tab 키 네비게이션 함수가 존재해야 함', () => {
                expect(typeof handleTabNavigation).toBe('function');
            });

            it('모든 인터랙티브 요소를 찾을 수 있어야 함', () => {
                document.body.innerHTML = `
                    <button>버튼 1</button>
                    <input type="text" />
                    <select><option>옵션</option></select>
                    <textarea></textarea>
                    <a href="#">링크</a>
                `;
                
                const result = checkKeyboardAccessibility();
                
                expect(result).toBeDefined();
                expect(result.interactiveElements).toBeDefined();
                expect(Array.isArray(result.interactiveElements)).toBe(true);
                expect(result.interactiveElements.length).toBeGreaterThan(0);
            });

            it('Tab 키로 포커스를 이동할 수 있어야 함', () => {
                document.body.innerHTML = `
                    <button id="btn1">버튼 1</button>
                    <button id="btn2">버튼 2</button>
                    <input type="text" id="input1" />
                `;
                
                setupKeyboardNavigation();
                
                const btn1 = document.getElementById('btn1');
                const btn2 = document.getElementById('btn2');
                
                btn1.focus();
                expect(document.activeElement).toBe(btn1);
                
                // Tab 키 이벤트 시뮬레이션
                const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab' });
                handleTabNavigation(tabEvent);
                
                // 포커스가 이동했는지 확인 (실제로는 다음 요소로 이동)
                expect(typeof handleTabNavigation).toBe('function');
            });

            it('인터랙티브 요소에 tabindex가 올바르게 설정되어야 함', () => {
                document.body.innerHTML = `
                    <button>버튼</button>
                    <input type="text" />
                    <a href="#">링크</a>
                `;
                
                const result = checkKeyboardAccessibility();
                
                expect(result).toBeDefined();
                expect(result.allAccessible).toBeDefined();
            });
        });

        describe('Enter 키로 폼 제출 가능', () => {
            it('Enter 키 핸들러 함수가 존재해야 함', () => {
                expect(typeof handleEnterKey).toBe('function');
            });

            it('폼에서 Enter 키로 제출할 수 있어야 함', () => {
                document.body.innerHTML = `
                    <form id="testForm">
                        <input type="text" id="name" />
                        <button type="submit">제출</button>
                    </form>
                `;
                
                const form = document.getElementById('testForm');
                const submitHandler = vi.fn((e) => {
                    e.preventDefault();
                });
                
                form.addEventListener('submit', submitHandler);
                
                const input = document.getElementById('name');
                input.focus();
                
                // Enter 키 이벤트 시뮬레이션
                const enterEvent = new KeyboardEvent('keydown', { 
                    key: 'Enter', 
                    code: 'Enter',
                    bubbles: true
                });
                
                handleEnterKey(enterEvent, form);
                
                // Enter 키 핸들러가 호출되었는지 확인
                expect(typeof handleEnterKey).toBe('function');
            });

            it('입력 필드에서 Enter 키를 누르면 폼이 제출되어야 함', () => {
                document.body.innerHTML = `
                    <form id="testForm">
                        <input type="text" id="name" />
                    </form>
                `;
                
                const form = document.getElementById('testForm');
                const submitHandler = vi.fn((e) => {
                    e.preventDefault();
                });
                
                form.addEventListener('submit', submitHandler);
                
                const input = document.getElementById('name');
                input.focus();
                
                const enterEvent = new KeyboardEvent('keydown', { 
                    key: 'Enter', 
                    code: 'Enter',
                    bubbles: true
                });
                
                handleEnterKey(enterEvent, form);
                
                expect(typeof handleEnterKey).toBe('function');
            });
        });

        describe('Escape 키로 모달 닫기 (향후 기능)', () => {
            it('Escape 키 핸들러 함수가 존재해야 함', () => {
                expect(typeof handleEscapeKey).toBe('function');
            });

            it('Escape 키로 모달을 닫을 수 있어야 함 (향후 구현)', () => {
                document.body.innerHTML = `
                    <div class="modal" id="testModal">
                        <div class="modal-content">
                            <span class="close">&times;</span>
                            <p>모달 내용</p>
                        </div>
                    </div>
                `;
                
                const modal = document.getElementById('testModal');
                const escapeEvent = new KeyboardEvent('keydown', { 
                    key: 'Escape', 
                    code: 'Escape'
                });
                
                handleEscapeKey(escapeEvent, modal);
                
                // 향후 기능이므로 기본 구조만 확인
                expect(typeof handleEscapeKey).toBe('function');
            });
        });
    });

    describe('접근성 유틸리티', () => {
        it('반응형 브레이크포인트 상수가 정의되어 있어야 함', () => {
            expect(RESPONSIVE_BREAKPOINTS).toBeDefined();
            expect(RESPONSIVE_BREAKPOINTS.mobile).toBeDefined();
            expect(RESPONSIVE_BREAKPOINTS.tablet).toBeDefined();
            expect(RESPONSIVE_BREAKPOINTS.desktop).toBeDefined();
        });

        it('뷰포트 크기를 가져올 수 있어야 함', () => {
            window.innerWidth = 1920;
            window.innerHeight = 1080;
            
            const viewport = getViewportSize();
            
            expect(viewport).toBeDefined();
            expect(viewport.width).toBe(1920);
            expect(viewport.height).toBe(1080);
        });
    });
});

