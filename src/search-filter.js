/**
 * 검색 및 필터링 기능
 */

/**
 * 검색 설정
 */
export const SEARCH_CONFIG = {
    caseSensitive: false,
    partialMatch: true
};

/**
 * 필터 설정
 */
export const FILTER_CONFIG = {
    defaultArchetypeType: 'primary'
};

/**
 * 이름으로 부서원을 검색합니다.
 * @param {Array} members - 부서원 배열
 * @param {string} searchTerm - 검색어
 * @returns {Array} 검색 결과 배열
 */
export function searchMembersByName(members, searchTerm) {
    if (!Array.isArray(members)) {
        return [];
    }
    
    if (!searchTerm || searchTerm.trim() === '') {
        return members; // 빈 검색어는 모든 결과 반환
    }
    
    const term = searchTerm.trim();
    
    return members.filter(member => {
        if (!member.name) {
            return false;
        }
        
        const name = member.name;
        
        // 부분 일치 검색
        if (SEARCH_CONFIG.partialMatch) {
            if (SEARCH_CONFIG.caseSensitive) {
                return name.includes(term);
            } else {
                return name.toLowerCase().includes(term.toLowerCase());
            }
        } else {
            // 정확한 일치
            if (SEARCH_CONFIG.caseSensitive) {
                return name === term;
            } else {
                return name.toLowerCase() === term.toLowerCase();
            }
        }
    });
}

/**
 * 레벨로 부서원을 필터링합니다.
 * @param {Array} members - 부서원 배열
 * @param {string} level - 레벨 (L1~L5)
 * @returns {Array} 필터링된 결과 배열
 */
export function filterMembersByLevel(members, level) {
    if (!Array.isArray(members)) {
        return [];
    }
    
    if (!level) {
        return members; // 레벨이 없으면 모든 결과 반환
    }
    
    const validLevels = ['L1', 'L2', 'L3', 'L4', 'L5'];
    if (!validLevels.includes(level)) {
        return []; // 유효하지 않은 레벨은 빈 결과 반환
    }
    
    return members.filter(member => member.level === level);
}

/**
 * 성향으로 부서원을 필터링합니다.
 * @param {Array} members - 부서원 배열
 * @param {string} archetype - 성향
 * @param {string} type - 'primary', 'secondary', 'both'
 * @returns {Array} 필터링된 결과 배열
 */
export function filterMembersByArchetype(members, archetype, type = 'primary') {
    if (!Array.isArray(members)) {
        return [];
    }
    
    if (!archetype) {
        return members; // 성향이 없으면 모든 결과 반환
    }
    
    return members.filter(member => {
        if (type === 'primary') {
            return member.primaryArchetype === archetype;
        } else if (type === 'secondary') {
            return member.secondaryArchetype === archetype;
        } else if (type === 'both') {
            return member.primaryArchetype === archetype || 
                   member.secondaryArchetype === archetype;
        }
        return false;
    });
}

/**
 * 연차 범위로 부서원을 필터링합니다.
 * @param {Array} members - 부서원 배열
 * @param {number} minYears - 최소 연차
 * @param {number} maxYears - 최대 연차
 * @returns {Array} 필터링된 결과 배열
 */
export function filterMembersByYearsRange(members, minYears, maxYears) {
    if (!Array.isArray(members)) {
        return [];
    }
    
    // 잘못된 범위 처리
    if (typeof minYears === 'number' && typeof maxYears === 'number') {
        if (minYears > maxYears && maxYears !== Infinity) {
            return []; // 잘못된 범위는 빈 결과 반환
        }
    }
    
    return members.filter(member => {
        const years = member.years;
        
        if (typeof years !== 'number' || isNaN(years)) {
            return false;
        }
        
        const minCheck = minYears === undefined || minYears === null || years >= minYears;
        const maxCheck = maxYears === undefined || maxYears === null || maxYears === Infinity || years <= maxYears;
        
        return minCheck && maxCheck;
    });
}

/**
 * 복합 필터를 적용합니다.
 * @param {Array} members - 부서원 배열
 * @param {Object} filters - 필터 객체
 * @param {string} filters.level - 레벨 필터
 * @param {string} filters.archetype - 성향 필터
 * @param {string} filters.archetypeType - 성향 타입 ('primary', 'secondary', 'both')
 * @param {number} filters.yearsMin - 최소 연차
 * @param {number} filters.yearsMax - 최대 연차
 * @param {string} filters.searchTerm - 검색어
 * @returns {Array} 필터링된 결과 배열
 */
export function applyFilters(members, filters = {}) {
    if (!Array.isArray(members)) {
        return [];
    }
    
    let results = [...members];
    
    // 검색어 필터
    if (filters.searchTerm) {
        results = searchMembersByName(results, filters.searchTerm);
    }
    
    // 레벨 필터
    if (filters.level) {
        results = filterMembersByLevel(results, filters.level);
    }
    
    // 성향 필터
    if (filters.archetype) {
        const archetypeType = filters.archetypeType || FILTER_CONFIG.defaultArchetypeType;
        results = filterMembersByArchetype(results, filters.archetype, archetypeType);
    }
    
    // 연차 범위 필터
    if (filters.yearsMin !== undefined || filters.yearsMax !== undefined) {
        results = filterMembersByYearsRange(
            results, 
            filters.yearsMin, 
            filters.yearsMax
        );
    }
    
    return results;
}

