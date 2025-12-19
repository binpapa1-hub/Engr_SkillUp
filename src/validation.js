/**
 * 레벨 및 성향 검증 로직
 */

/**
 * 유효한 레벨 목록
 */
export const VALID_LEVELS = ['L1', 'L2', 'L3', 'L4', 'L5'];

/**
 * 유효한 성향 목록
 */
export const VALID_ARCHETYPES = [
    '문제 해결형',
    '설계/아키텍처형',
    '연구/개선형',
    '현장/운영형',
    '리더/멘토형'
];

/**
 * 레벨별 연차 범위
 */
export const LEVEL_YEARS_RANGES = {
    'L1': { min: 1, max: 3 },
    'L2': { min: 4, max: 7 },
    'L3': { min: 8, max: 12 },
    'L4': { min: 13, max: 20 },
    'L5': { min: 21, max: Infinity } // 20년은 L4, 21년부터 L5
};

/**
 * 레벨을 검증합니다.
 * @param {string} level - 검증할 레벨
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateLevel(level) {
    const errors = [];
    
    if (!level || level === '') {
        errors.push('레벨은 필수 입력 항목입니다.');
    } else if (!VALID_LEVELS.includes(level)) {
        errors.push(`레벨은 ${VALID_LEVELS.join(', ')} 중 하나여야 합니다.`);
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * 레벨과 연차 범위를 검증합니다.
 * @param {string} level - 레벨
 * @param {number} years - 연차
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateLevelYearsRange(level, years) {
    const errors = [];
    
    // 레벨 검증
    const levelValidation = validateLevel(level);
    if (!levelValidation.valid) {
        return levelValidation;
    }
    
    // 연차 타입 검증
    if (typeof years !== 'number' || isNaN(years)) {
        errors.push('연차는 숫자여야 합니다.');
        return { valid: false, errors };
    }
    
    // 레벨별 연차 범위 검증
    const range = LEVEL_YEARS_RANGES[level];
    if (!range) {
        errors.push(`레벨 ${level}에 대한 연차 범위 정보가 없습니다.`);
        return { valid: false, errors };
    }
    
    if (years < range.min) {
        errors.push(`레벨 ${level}의 최소 연차는 ${range.min}년입니다.`);
    }
    
    if (range.max === Infinity) {
        // L5는 21년 이상
        if (years < range.min) {
            errors.push(`레벨 ${level}의 최소 연차는 ${range.min}년입니다.`);
        }
    } else {
        if (years > range.max) {
            errors.push(`레벨 ${level}의 최대 연차는 ${range.max}년입니다.`);
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * 연차에 따라 적절한 레벨을 반환합니다.
 * @param {number} years - 연차
 * @returns {string} 레벨 (L1~L5)
 */
export function getLevelByYears(years) {
    if (typeof years !== 'number' || isNaN(years) || years < 1) {
        return 'L1'; // 기본값
    }
    
    // L4: 13~20년, L5: 20년+
    // 20년은 L4의 최대값이므로 L4로 처리
    if (years > 20) {
        return 'L5';
    } else if (years >= 13) {
        return 'L4';
    } else if (years >= 8) {
        return 'L3';
    } else if (years >= 4) {
        return 'L2';
    } else {
        return 'L1';
    }
}

/**
 * 성향을 검증합니다.
 * @param {string} archetype - 검증할 성향
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateArchetype(archetype) {
    const errors = [];
    
    if (!archetype || archetype === '') {
        errors.push('성향은 필수 입력 항목입니다.');
    } else if (!VALID_ARCHETYPES.includes(archetype)) {
        errors.push(`성향은 ${VALID_ARCHETYPES.join(', ')} 중 하나여야 합니다.`);
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Primary와 Secondary 성향 조합을 검증합니다.
 * @param {string} primary - 주요 성향
 * @param {string} secondary - 보조 성향 (선택사항)
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateArchetypeCombination(primary, secondary) {
    const errors = [];
    
    // Primary 검증
    const primaryValidation = validateArchetype(primary);
    if (!primaryValidation.valid) {
        return primaryValidation;
    }
    
    // Secondary가 있는 경우에만 검증
    if (secondary && secondary !== '' && secondary !== null && secondary !== undefined) {
        // Secondary 검증
        const secondaryValidation = validateArchetype(secondary);
        if (!secondaryValidation.valid) {
            return secondaryValidation;
        }
        
        // Primary와 Secondary가 동일한지 확인
        if (primary === secondary) {
            errors.push('주요 성향과 보조 성향은 동일할 수 없습니다.');
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

