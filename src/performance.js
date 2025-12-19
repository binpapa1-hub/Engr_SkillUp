/**
 * 성능 및 확장성 관련 기능
 */

import { sortMembers } from './member.js';
import { searchMembersByName, applyFilters } from './search-filter.js';

/**
 * 성능 임계값 설정
 */
export const PERFORMANCE_THRESHOLDS = {
    loadTime: 100,      // 100ms (100명 기준)
    renderTime: 200,    // 200ms (500명 기준)
    searchTime: 50,     // 50ms (500명 기준)
    filterTime: 100     // 100ms (500명 기준)
};

/**
 * 대량 테스트 데이터를 생성합니다.
 * @param {number} count - 생성할 데이터 개수
 * @returns {Array} 부서원 배열
 */
export function generateLargeDataset(count) {
    const members = [];
    const names = ['홍길동', '김철수', '이영희', '박민수', '최지영', '정수진', '한소희', '윤서연'];
    const archetypes = [
        '문제 해결형',
        '설계/아키텍처형',
        '연구/개선형',
        '현장/운영형',
        '리더/멘토형'
    ];
    const levels = ['L1', 'L2', 'L3', 'L4', 'L5'];
    
    for (let i = 0; i < count; i++) {
        const nameIndex = i % names.length;
        const archetypeIndex = i % archetypes.length;
        const levelIndex = i % levels.length;
        
        // 연차는 레벨에 맞게 생성
        const levelYears = {
            'L1': [1, 2, 3],
            'L2': [4, 5, 6, 7],
            'L3': [8, 9, 10, 11, 12],
            'L4': [13, 14, 15, 16, 17, 18, 19, 20],
            'L5': [21, 22, 25, 30, 35, 40, 45, 50]
        };
        
        const level = levels[levelIndex];
        const yearsOptions = levelYears[level];
        const years = yearsOptions[i % yearsOptions.length];
        
        members.push({
            id: `member-${i}`,
            name: `${names[nameIndex]}${i}`,
            primaryArchetype: archetypes[archetypeIndex],
            secondaryArchetype: i % 3 === 0 ? archetypes[(archetypeIndex + 1) % archetypes.length] : undefined,
            years,
            level
        });
    }
    
    return members;
}

/**
 * 부서원 데이터 로드 성능을 측정합니다.
 * @param {Array} members - 부서원 배열
 * @returns {Object} 성능 측정 결과
 */
export function loadMembersPerformance(members) {
    const startTime = performance.now();
    
    // 실제 로드 작업 시뮬레이션
    const loaded = [...members];
    const sorted = sortMembers(loaded);
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    return {
        count: members.length,
        loadTime: Math.round(loadTime * 100) / 100, // 소수점 2자리
        sortedCount: sorted.length
    };
}

/**
 * 목록 렌더링 성능을 측정합니다.
 * @param {Array} members - 부서원 배열
 * @returns {Object} 렌더링 성능 결과
 */
export function renderListPerformance(members) {
    const startTime = performance.now();
    
    // 렌더링 작업 시뮬레이션 (실제 DOM 조작 대신 계산)
    const sorted = sortMembers(members);
    const renderData = sorted.map(member => ({
        id: member.id,
        name: member.name,
        level: member.level,
        years: member.years
    }));
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // 가상 스크롤 필요 여부 판단
    const needsVirtualScroll = renderTime > PERFORMANCE_THRESHOLDS.renderTime || members.length > 500;
    
    return {
        count: members.length,
        renderTime: Math.round(renderTime * 100) / 100,
        needsVirtualScroll,
        renderedCount: renderData.length
    };
}

/**
 * 검색 성능을 측정합니다.
 * @param {Array} members - 부서원 배열
 * @param {string} searchTerm - 검색어
 * @returns {Object} 검색 성능 결과
 */
export function searchPerformance(members, searchTerm) {
    const startTime = performance.now();
    
    const results = searchMembersByName(members, searchTerm);
    
    const endTime = performance.now();
    const searchTime = endTime - startTime;
    
    return {
        totalCount: members.length,
        resultsCount: results.length,
        searchTime: Math.round(searchTime * 100) / 100,
        results
    };
}

/**
 * 필터링 성능을 측정합니다.
 * @param {Array} members - 부서원 배열
 * @param {Object} filters - 필터 객체
 * @returns {Object} 필터링 성능 결과
 */
export function filterPerformance(members, filters) {
    const startTime = performance.now();
    
    const results = applyFilters(members, filters);
    
    const endTime = performance.now();
    const filterTime = endTime - startTime;
    
    return {
        totalCount: members.length,
        resultsCount: results.length,
        filterTime: Math.round(filterTime * 100) / 100,
        results
    };
}

/**
 * 메모리 누수를 확인합니다.
 * @param {number} beforeMemory - 이전 메모리 사용량
 * @param {number} afterMemory - 이후 메모리 사용량
 * @returns {Object} 메모리 누수 검증 결과
 */
export function checkMemoryLeak(beforeMemory, afterMemory) {
    if (!beforeMemory || !afterMemory) {
        // performance.memory가 없는 환경 (Node.js 등)
        return {
            hasLeak: false,
            message: '메모리 측정을 사용할 수 없습니다.'
        };
    }
    
    const memoryIncrease = afterMemory - beforeMemory;
    const increasePercentage = (memoryIncrease / beforeMemory) * 100;
    
    // 메모리가 50% 이상 증가하면 누수 가능성
    const hasLeak = increasePercentage > 50;
    
    return {
        hasLeak,
        beforeMemory,
        afterMemory,
        memoryIncrease,
        increasePercentage: Math.round(increasePercentage * 100) / 100
    };
}

/**
 * 이벤트 리스너를 정리합니다.
 * @param {HTMLElement} element - 정리할 요소
 */
export function cleanupEventListeners(element) {
    if (!element || typeof element.removeEventListener !== 'function') {
        return;
    }
    
    // 클론하여 모든 리스너 제거 (실제로는 등록된 리스너를 추적해야 함)
    const newElement = element.cloneNode(true);
    if (element.parentNode) {
        element.parentNode.replaceChild(newElement, element);
    }
}

/**
 * 함수 실행 성능을 측정합니다.
 * @param {Function} fn - 측정할 함수
 * @param {any} args - 함수 인자
 * @returns {Object} 성능 측정 결과
 */
export function measurePerformance(fn, ...args) {
    const startTime = performance.now();
    
    let result;
    let error = null;
    
    try {
        result = fn(...args);
    } catch (e) {
        error = e;
    }
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    return {
        executionTime: Math.round(executionTime * 100) / 100,
        result,
        error,
        success: error === null
    };
}

