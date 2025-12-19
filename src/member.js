// 로컬 스토리지에서 부서원 데이터 관리
export const STORAGE_KEY = 'ecgf_members';

/**
 * 로컬 스토리지에서 부서원 목록을 가져옵니다.
 * @returns {Array} 부서원 배열
 */
export function getMembers() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * 부서원 목록을 로컬 스토리지에 저장합니다.
 * @param {Array} members - 저장할 부서원 배열
 */
export function saveMembers(members) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

/**
 * 부서원 데이터를 검증합니다.
 * @param {Object} memberData - 검증할 부서원 데이터
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateMember(memberData) {
    const errors = [];
    
    if (!memberData.name || memberData.name.trim() === '') {
        errors.push('이름은 필수 입력 항목입니다.');
    }
    
    if (!memberData.primaryArchetype) {
        errors.push('주요 성향은 필수 선택 항목입니다.');
    }
    
    if (typeof memberData.years !== 'number' || memberData.years < 0 || memberData.years > 50) {
        errors.push('근무 연차는 0~50년 사이의 숫자여야 합니다.');
    }
    
    if (!memberData.level || !['L1', 'L2', 'L3', 'L4', 'L5'].includes(memberData.level)) {
        errors.push('업무 레벨은 L1~L5 중 하나여야 합니다.');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

