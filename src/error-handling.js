/**
 * 에러 핸들링 및 엣지 케이스 처리
 */

/**
 * 에러 메시지 상수
 */
export const ERROR_MESSAGES = {
    NEGATIVE_YEARS: '연차는 0 이상이어야 합니다.',
    YEARS_OVER_LIMIT: '연차는 50년을 초과할 수 없습니다.',
    INVALID_LEVEL: '유효하지 않은 레벨입니다. L1~L5 중 하나를 선택하세요.',
    INVALID_ARCHETYPE: '유효하지 않은 성향입니다.',
    EMPTY_NAME: '이름은 필수 입력 항목입니다.',
    INVALID_JSON: '잘못된 JSON 형식입니다.',
    CIRCULAR_REFERENCE: '순환 참조가 있는 객체는 직렬화할 수 없습니다.',
    LOCALSTORAGE_NOT_SUPPORTED: 'LocalStorage를 지원하지 않는 브라우저입니다.'
};

/**
 * 입력값을 검증합니다.
 * @param {Object} input - 입력 데이터
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateInput(input) {
    const errors = [];
    
    // 연차 검증
    if (input.years !== undefined) {
        if (input.years < 0) {
            errors.push(ERROR_MESSAGES.NEGATIVE_YEARS);
        }
        if (input.years > 50) {
            errors.push(ERROR_MESSAGES.YEARS_OVER_LIMIT);
        }
    }
    
    // 레벨 검증
    if (input.level !== undefined) {
        const validLevels = ['L1', 'L2', 'L3', 'L4', 'L5'];
        if (!validLevels.includes(input.level)) {
            errors.push(ERROR_MESSAGES.INVALID_LEVEL);
        }
    }
    
    // 이름 검증
    if (input.name !== undefined) {
        if (!input.name || input.name.trim() === '') {
            errors.push(ERROR_MESSAGES.EMPTY_NAME);
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * 음수 연차를 처리합니다.
 * @param {number} years - 연차
 * @returns {Object} { valid: boolean, error?: string }
 */
export function handleNegativeYears(years) {
    if (years < 0) {
        return {
            valid: false,
            error: ERROR_MESSAGES.NEGATIVE_YEARS
        };
    }
    return { valid: true };
}

/**
 * 범위 초과 연차를 처리합니다.
 * @param {number} years - 연차
 * @returns {Object} { valid: boolean, error?: string }
 */
export function handleYearsOverLimit(years) {
    if (years > 50) {
        return {
            valid: false,
            error: ERROR_MESSAGES.YEARS_OVER_LIMIT
        };
    }
    return { valid: true };
}

/**
 * 잘못된 레벨을 처리합니다.
 * @param {string} level - 레벨
 * @returns {Object} { valid: boolean, error?: string }
 */
export function handleInvalidLevel(level) {
    const validLevels = ['L1', 'L2', 'L3', 'L4', 'L5'];
    if (!validLevels.includes(level)) {
        return {
            valid: false,
            error: ERROR_MESSAGES.INVALID_LEVEL
        };
    }
    return { valid: true };
}

/**
 * 잘못된 성향을 처리합니다.
 * @param {string} archetype - 성향
 * @returns {Object} { valid: boolean, error?: string }
 */
export function handleInvalidArchetype(archetype) {
    const validArchetypes = [
        '문제 해결형',
        '설계/아키텍처형',
        '연구/개선형',
        '현장/운영형',
        '리더/멘토형'
    ];
    
    if (!validArchetypes.includes(archetype)) {
        return {
            valid: false,
            error: ERROR_MESSAGES.INVALID_ARCHETYPE
        };
    }
    return { valid: true };
}

/**
 * 빈 문자열 이름을 처리합니다.
 * @param {string} name - 이름
 * @returns {Object} { valid: boolean, error?: string }
 */
export function handleEmptyName(name) {
    if (!name || name.trim() === '') {
        return {
            valid: false,
            error: ERROR_MESSAGES.EMPTY_NAME
        };
    }
    return { valid: true };
}

/**
 * 특수문자 포함 이름을 처리합니다.
 * @param {string} name - 이름
 * @returns {Object} { valid: boolean, sanitized?: string }
 */
export function handleSpecialCharacters(name) {
    // 특수문자는 허용하되, 위험한 문자는 제거
    const sanitized = name.replace(/[<>\"'&]/g, '');
    
    return {
        valid: true,
        sanitized: sanitized !== name ? sanitized : undefined
    };
}

/**
 * 경계값을 처리합니다.
 * @param {Object} memberData - 부서원 데이터
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function handleBoundaryValues(memberData) {
    const errors = [];
    
    // 연차 경계값 검증
    if (memberData.years !== undefined) {
        if (memberData.years < 0) {
            errors.push(ERROR_MESSAGES.NEGATIVE_YEARS);
        }
        if (memberData.years > 50) {
            errors.push(ERROR_MESSAGES.YEARS_OVER_LIMIT);
        }
    }
    
    // 레벨과 연차 일치 검증 (레벨이 있는 경우에만)
    if (memberData.level && memberData.years !== undefined) {
        const levelRanges = {
            'L1': { min: 1, max: 3 },
            'L2': { min: 4, max: 7 },
            'L3': { min: 8, max: 12 },
            'L4': { min: 13, max: 20 },
            'L5': { min: 21, max: Infinity }
        };
        
        const range = levelRanges[memberData.level];
        if (range) {
            if (memberData.years < range.min) {
                errors.push(`레벨 ${memberData.level}의 최소 연차는 ${range.min}년입니다.`);
            }
            if (range.max !== Infinity && memberData.years > range.max) {
                errors.push(`레벨 ${memberData.level}의 최대 연차는 ${range.max}년입니다.`);
            }
        }
    } else if (memberData.years === 0) {
        // 레벨이 없고 연차가 0년인 경우는 유효 (레벨 검증 없이 연차만 검증)
        // 0년은 범위 내이므로 에러 없음
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * LocalStorage 지원 여부를 확인합니다.
 * @returns {boolean} 지원 여부
 */
export function checkLocalStorageSupport() {
    try {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return false;
        }
        
        // 테스트 저장/삭제
        const testKey = '__localStorage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * 안전한 JSON 파싱을 수행합니다.
 * @param {string} jsonString - JSON 문자열
 * @returns {Object} { success: boolean, data?: any, error?: string }
 */
export function safeJSONParse(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        return {
            success: true,
            data
        };
    } catch (error) {
        return {
            success: false,
            error: ERROR_MESSAGES.INVALID_JSON
        };
    }
}

/**
 * 안전한 JSON 직렬화를 수행합니다.
 * @param {any} obj - 직렬화할 객체
 * @returns {Object} { success: boolean, data?: string, error?: string }
 */
export function safeJSONStringify(obj) {
    try {
        const data = JSON.stringify(obj);
        return {
            success: true,
            data
        };
    } catch (error) {
        if (error.message && error.message.includes('circular')) {
            return {
                success: false,
                error: ERROR_MESSAGES.CIRCULAR_REFERENCE
            };
        }
        return {
            success: false,
            error: ERROR_MESSAGES.INVALID_JSON
        };
    }
}

