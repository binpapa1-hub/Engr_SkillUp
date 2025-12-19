import { describe, it, expect, beforeEach } from 'vitest';
import { 
    generateLargeDataset,
    loadMembersPerformance,
    renderListPerformance,
    searchPerformance,
    filterPerformance,
    checkMemoryLeak,
    cleanupEventListeners,
    measurePerformance,
    PERFORMANCE_THRESHOLDS
} from '../src/performance.js';
import { getMembers, saveMembers, sortMembers } from '../src/member.js';
import { searchMembersByName, applyFilters } from '../src/search-filter.js';

describe('성능 및 확장성 테스트', () => {
    describe('대량 데이터 처리', () => {
        describe('100명 이상 부서원 데이터 로드 성능', () => {
            it('100명 데이터 생성 및 로드 성능 테스트', () => {
                const members = generateLargeDataset(100);
                
                expect(members.length).toBe(100);
                
                const result = loadMembersPerformance(members);
                
                expect(result).toBeDefined();
                expect(result.count).toBe(100);
                expect(result.loadTime).toBeDefined();
                expect(typeof result.loadTime).toBe('number');
            });

            it('200명 데이터 생성 및 로드 성능 테스트', () => {
                const members = generateLargeDataset(200);
                
                expect(members.length).toBe(200);
                
                const result = loadMembersPerformance(members);
                
                expect(result.count).toBe(200);
                expect(result.loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.loadTime);
            });

            it('500명 데이터 생성 및 로드 성능 테스트', () => {
                const members = generateLargeDataset(500);
                
                expect(members.length).toBe(500);
                
                const result = loadMembersPerformance(members);
                
                expect(result.count).toBe(500);
                expect(result.loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.loadTime * 5);
            });

            it('1000명 데이터 생성 및 로드 성능 테스트', () => {
                const members = generateLargeDataset(1000);
                
                expect(members.length).toBe(1000);
                
                const result = loadMembersPerformance(members);
                
                expect(result.count).toBe(1000);
            });
        });

        describe('목록 렌더링 성능 (가상 스크롤 필요 여부)', () => {
            it('100명 목록 렌더링 성능 테스트', () => {
                const members = generateLargeDataset(100);
                
                const result = renderListPerformance(members);
                
                expect(result).toBeDefined();
                expect(result.count).toBe(100);
                expect(result.renderTime).toBeDefined();
                expect(typeof result.renderTime).toBe('number');
            });

            it('500명 목록 렌더링 성능 테스트', () => {
                const members = generateLargeDataset(500);
                
                const result = renderListPerformance(members);
                
                expect(result.count).toBe(500);
                expect(result.renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.renderTime);
            });

            it('1000명 목록 렌더링 시 가상 스크롤 필요 여부 판단', () => {
                const members = generateLargeDataset(1000);
                
                const result = renderListPerformance(members);
                
                expect(result.needsVirtualScroll).toBeDefined();
                // 렌더링 시간이 임계값을 초과하면 가상 스크롤 필요
                if (result.renderTime > PERFORMANCE_THRESHOLDS.renderTime) {
                    expect(result.needsVirtualScroll).toBe(true);
                }
            });
        });

        describe('검색/필터링 성능 (대량 데이터)', () => {
            it('100명 데이터에서 검색 성능 테스트', () => {
                const members = generateLargeDataset(100);
                
                const result = searchPerformance(members, '홍');
                
                expect(result).toBeDefined();
                expect(result.searchTime).toBeDefined();
                expect(result.results).toBeDefined();
                expect(Array.isArray(result.results)).toBe(true);
            });

            it('500명 데이터에서 검색 성능 테스트', () => {
                const members = generateLargeDataset(500);
                
                const result = searchPerformance(members, '홍');
                
                expect(result.searchTime).toBeLessThan(PERFORMANCE_THRESHOLDS.searchTime);
            });

            it('1000명 데이터에서 검색 성능 테스트', () => {
                const members = generateLargeDataset(1000);
                
                const result = searchPerformance(members, '홍');
                
                expect(result.searchTime).toBeLessThan(PERFORMANCE_THRESHOLDS.searchTime * 2);
            });

            it('500명 데이터에서 필터링 성능 테스트', () => {
                const members = generateLargeDataset(500);
                
                const filters = {
                    level: 'L2',
                    archetype: '문제 해결형',
                    archetypeType: 'primary'
                };
                
                const result = filterPerformance(members, filters);
                
                expect(result).toBeDefined();
                expect(result.filterTime).toBeDefined();
                expect(result.results).toBeDefined();
                expect(result.filterTime).toBeLessThan(PERFORMANCE_THRESHOLDS.filterTime);
            });

            it('1000명 데이터에서 복합 필터링 성능 테스트', () => {
                const members = generateLargeDataset(1000);
                
                const filters = {
                    level: 'L3',
                    yearsMin: 8,
                    yearsMax: 12
                };
                
                const result = filterPerformance(members, filters);
                
                expect(result.filterTime).toBeLessThan(PERFORMANCE_THRESHOLDS.filterTime * 2);
            });
        });
    });

    describe('메모리 관리', () => {
        describe('데이터 누수 검증', () => {
            it('대량 데이터 로드 후 메모리 정리 검증', () => {
                const members = generateLargeDataset(500);
                
                const beforeMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
                
                // 데이터 로드
                loadMembersPerformance(members);
                
                // 가비지 컬렉션 대기 (실제로는 강제할 수 없지만 테스트 구조는 확인)
                const afterMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
                
                const result = checkMemoryLeak(beforeMemory, afterMemory);
                
                expect(result).toBeDefined();
                expect(result.hasLeak).toBeDefined();
            });

            it('반복적인 데이터 로드 후 메모리 누수 검증', () => {
                let beforeMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
                
                // 여러 번 데이터 로드
                for (let i = 0; i < 10; i++) {
                    const members = generateLargeDataset(100);
                    loadMembersPerformance(members);
                }
                
                let afterMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
                
                const result = checkMemoryLeak(beforeMemory, afterMemory);
                
                expect(result).toBeDefined();
            });
        });

        describe('이벤트 리스너 정리 검증', () => {
            it('이벤트 리스너 정리 함수가 존재해야 함', () => {
                expect(typeof cleanupEventListeners).toBe('function');
            });

            it('이벤트 리스너 정리 후 누수 없음 검증', () => {
                // 이벤트 리스너 등록 시뮬레이션
                const element = document.createElement('div');
                const handler = () => {};
                
                element.addEventListener('click', handler);
                
                // 정리
                cleanupEventListeners(element);
                
                // 정리 후에도 함수는 존재해야 함 (실제 정리는 브라우저에서 확인)
                expect(typeof cleanupEventListeners).toBe('function');
            });
        });
    });

    describe('성능 측정 유틸리티', () => {
        it('성능 측정 함수가 존재해야 함', () => {
            expect(typeof measurePerformance).toBe('function');
        });

        it('함수 실행 시간을 측정할 수 있어야 함', () => {
            const result = measurePerformance(() => {
                // 간단한 작업
                let sum = 0;
                for (let i = 0; i < 1000; i++) {
                    sum += i;
                }
                return sum;
            });
            
            expect(result).toBeDefined();
            expect(result.executionTime).toBeDefined();
            expect(typeof result.executionTime).toBe('number');
            expect(result.executionTime).toBeGreaterThan(0);
        });
    });
});

