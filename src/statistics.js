/**
 * 통계 대시보드 계산 로직
 */

/**
 * 통계 설정
 */
export const STATISTICS_CONFIG = {
    yearsRanges: [
        { label: '0-3', min: 0, max: 3 },
        { label: '4-7', min: 4, max: 7 },
        { label: '8-12', min: 8, max: 12 },
        { label: '13-20', min: 13, max: 20 },
        { label: '21+', min: 21, max: Infinity }
    ]
};

/**
 * 레벨별 분포를 계산합니다.
 * @param {Array} members - 부서원 배열
 * @returns {Object} 레벨별 분포 객체
 */
export function calculateLevelDistribution(members) {
    const distribution = {
        L1: 0,
        L2: 0,
        L3: 0,
        L4: 0,
        L5: 0
    };
    
    if (!members || members.length === 0) {
        return distribution;
    }
    
    members.forEach(member => {
        if (member.level && distribution.hasOwnProperty(member.level)) {
            distribution[member.level]++;
        }
    });
    
    return distribution;
}

/**
 * 성향별 분포를 계산합니다.
 * @param {Array} members - 부서원 배열
 * @param {boolean} includeSecondary - Secondary 성향 포함 여부
 * @returns {Object} 성향별 분포 객체
 */
export function calculateArchetypeDistribution(members, includeSecondary = false) {
    const distribution = {
        '문제 해결형': 0,
        '설계/아키텍처형': 0,
        '연구/개선형': 0,
        '현장/운영형': 0,
        '리더/멘토형': 0
    };
    
    if (!members || members.length === 0) {
        return distribution;
    }
    
    members.forEach(member => {
        // Primary 성향
        if (member.primaryArchetype && distribution.hasOwnProperty(member.primaryArchetype)) {
            distribution[member.primaryArchetype]++;
        }
        
        // Secondary 성향 (선택사항)
        if (includeSecondary && member.secondaryArchetype && distribution.hasOwnProperty(member.secondaryArchetype)) {
            distribution[member.secondaryArchetype]++;
        }
    });
    
    return distribution;
}

/**
 * 연차 분포를 계산합니다.
 * @param {Array} members - 부서원 배열
 * @returns {Object} 연차 구간별 분포 객체
 */
export function calculateYearsDistribution(members) {
    const distribution = {
        '0-3': 0,
        '4-7': 0,
        '8-12': 0,
        '13-20': 0,
        '21+': 0
    };
    
    if (!members || members.length === 0) {
        return distribution;
    }
    
    members.forEach(member => {
        const years = member.years;
        if (typeof years !== 'number' || isNaN(years)) {
            return;
        }
        
        if (years >= 0 && years <= 3) {
            distribution['0-3']++;
        } else if (years >= 4 && years <= 7) {
            distribution['4-7']++;
        } else if (years >= 8 && years <= 12) {
            distribution['8-12']++;
        } else if (years >= 13 && years <= 20) {
            distribution['13-20']++;
        } else if (years >= 21) {
            distribution['21+']++;
        }
    });
    
    return distribution;
}

/**
 * 전체 통계를 계산합니다.
 * @param {Array} members - 부서원 배열
 * @returns {Object} 전체 통계 객체
 */
export function getStatistics(members) {
    if (!members) {
        members = [];
    }
    
    return {
        total: members.length,
        levelDistribution: calculateLevelDistribution(members),
        archetypeDistribution: calculateArchetypeDistribution(members),
        yearsDistribution: calculateYearsDistribution(members)
    };
}

