// 로컬 스토리지에서 부서원 데이터 관리
export const STORAGE_KEY = 'ecgf_members';

/**
 * 로컬 스토리지에서 부서원 목록을 가져옵니다.
 * @returns {Array} 부서원 배열
 * @throws {Error} 잘못된 JSON 데이터이거나 배열이 아닌 경우
 */
export function getMembers() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        return [];
    }
    
    try {
        const parsed = JSON.parse(data);
        if (!Array.isArray(parsed)) {
            throw new Error('데이터는 배열 형식이어야 합니다.');
        }
        return parsed;
    } catch (error) {
        if (error.message === '데이터는 배열 형식이어야 합니다.') {
            throw error;
        }
        throw new Error('잘못된 JSON 데이터 형식입니다.');
    }
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

/**
 * 부서원 객체를 생성합니다.
 * @param {Object} memberData - 부서원 데이터
 * @returns {Object} 생성된 부서원 객체
 * @throws {Error} 필수 필드가 누락되었거나 데이터가 유효하지 않을 때
 */
export function createMember(memberData) {
    // 필수 필드 검증
    if (!memberData.name || memberData.name.trim() === '') {
        throw new Error('이름은 필수 입력 항목입니다.');
    }
    
    if (!memberData.primaryArchetype) {
        throw new Error('주요 성향은 필수 선택 항목입니다.');
    }
    
    // 성향 검증
    const validArchetypes = [
        '문제 해결형',
        '설계/아키텍처형',
        '연구/개선형',
        '현장/운영형',
        '리더/멘토형'
    ];
    if (!validArchetypes.includes(memberData.primaryArchetype)) {
        throw new Error('유효하지 않은 성향입니다.');
    }
    
    if (memberData.years === undefined || memberData.years === null) {
        throw new Error('근무 연차는 필수 입력 항목입니다.');
    }
    
    if (!memberData.level) {
        throw new Error('업무 레벨은 필수 선택 항목입니다.');
    }
    
    // 데이터 타입 검증
    if (typeof memberData.years !== 'number') {
        throw new Error('근무 연차는 숫자여야 합니다.');
    }
    
    if (!['L1', 'L2', 'L3', 'L4', 'L5'].includes(memberData.level)) {
        throw new Error('업무 레벨은 L1~L5 중 하나여야 합니다.');
    }
    
    // 범위 검증
    if (memberData.years < 0 || memberData.years > 50) {
        throw new Error('근무 연차는 0~50년 사이의 숫자여야 합니다.');
    }
    
    // 고유 ID 생성
    const id = memberData.id || Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    return {
        id,
        name: memberData.name.trim(),
        primaryArchetype: memberData.primaryArchetype,
        secondaryArchetype: memberData.secondaryArchetype || undefined,
        years: memberData.years,
        level: memberData.level
    };
}

/**
 * 부서원을 등록합니다.
 * @param {Object} memberData - 부서원 데이터
 * @returns {Object} 등록된 부서원 객체
 * @throws {Error} 데이터가 유효하지 않을 때
 */
export function addMember(memberData) {
    const member = createMember(memberData);
    const members = getMembers();
    members.push(member);
    saveMembers(members);
    return member;
}

/**
 * ID로 부서원을 조회합니다.
 * @param {string} id - 부서원 ID
 * @returns {Object|undefined} 부서원 객체 또는 undefined
 */
export function getMemberById(id) {
    const members = getMembers();
    return members.find(m => m.id === id);
}

/**
 * 부서원 정보를 수정합니다.
 * @param {string} id - 부서원 ID
 * @param {Object} memberData - 수정할 부서원 데이터 (부분 업데이트 가능)
 * @returns {Object} 수정된 부서원 객체
 * @throws {Error} 부서원을 찾을 수 없거나 데이터가 유효하지 않을 때
 */
export function updateMember(id, memberData) {
    const members = getMembers();
    const index = members.findIndex(m => m.id === id);
    
    if (index === -1) {
        throw new Error(`ID가 ${id}인 부서원을 찾을 수 없습니다.`);
    }
    
    // 기존 멤버 데이터를 유지하면서 제공된 필드만 업데이트
    const existingMember = members[index];
    const updatedData = { ...existingMember, ...memberData, id };
    
    // 업데이트된 데이터 검증
    validateMember(updatedData);
    
    // 멤버 객체 업데이트
    members[index] = updatedData;
    saveMembers(members);
    
    return updatedData;
}

/**
 * 부서원을 삭제합니다.
 * @param {string} id - 부서원 ID
 * @returns {boolean} 삭제 성공 여부
 * @throws {Error} 부서원을 찾을 수 없을 때
 */
export function removeMember(id) {
    const members = getMembers();
    const index = members.findIndex(m => m.id === id);
    
    if (index === -1) {
        throw new Error(`ID가 ${id}인 부서원을 찾을 수 없습니다.`);
    }
    
    members.splice(index, 1);
    saveMembers(members);
    
    return true;
}

/**
 * 부서원 목록을 정렬합니다.
 * 레벨 우선 (L5 → L1), 동일 레벨 내 연차 내림차순
 * @param {Array} members - 정렬할 부서원 배열
 * @returns {Array} 정렬된 부서원 배열
 */
export function sortMembers(members) {
    if (!members || members.length === 0) {
        return [];
    }
    
    const levelOrder = { 'L1': 1, 'L2': 2, 'L3': 3, 'L4': 4, 'L5': 5 };
    
    return [...members].sort((a, b) => {
        // 레벨별 정렬 (L5 → L1)
        const levelDiff = (levelOrder[b.level] || 0) - (levelOrder[a.level] || 0);
        if (levelDiff !== 0) {
            return levelDiff;
        }
        // 동일 레벨 내 연차 내림차순
        return (b.years || 0) - (a.years || 0);
    });
}
