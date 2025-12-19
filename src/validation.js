/**
 * 입력 검증 모듈
 * 최소 기능: 필수 항목 검증, 데이터 타입 검증, 범위 검증
 */

/**
 * 부서원 등록/수정 데이터 검증
 * @param {Object} memberData - 검증할 부서원 데이터
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validateMember(memberData) {
    const errors = [];
    
    // 이름 검증
    if (!memberData.name || memberData.name.trim() === '') {
        errors.push('이름은 필수 입력 항목입니다.');
    }
    
    // 주요 성향 검증
    if (!memberData.primaryArchetype || memberData.primaryArchetype === '') {
        errors.push('주요 성향은 필수 선택 항목입니다.');
    }
    
    // 연차 검증
    const years = parseInt(memberData.years);
    if (isNaN(years) || years < 0 || years > 50) {
        errors.push('근무 연차는 0~50년 범위의 숫자여야 합니다.');
    }
    
    // 업무 레벨 검증
    const validLevels = ['L1', 'L2', 'L3', 'L4', 'L5'];
    if (!memberData.level || !validLevels.includes(memberData.level)) {
        errors.push('업무 레벨은 필수 선택 항목입니다.');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

