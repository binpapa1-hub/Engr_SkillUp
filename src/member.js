/**
 * 부서원 관리 모듈
 * 최소 기능: 등록, 조회, 수정, 삭제
 */

const STORAGE_KEY = 'ecgf_members';

/**
 * 부서원 데이터 가져오기
 * @returns {Array} 부서원 배열
 */
export function getMembers() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * 부서원 데이터 저장
 * @param {Array} members - 부서원 배열
 */
export function saveMembers(members) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

/**
 * 부서원 추가
 * @param {Object} memberData - 부서원 정보
 * @returns {Object} 추가된 부서원 정보
 */
export function addMember(memberData) {
    const members = getMembers();
    const newMember = {
        id: Date.now().toString(),
        name: memberData.name,
        primaryArchetype: memberData.primaryArchetype,
        secondaryArchetype: memberData.secondaryArchetype || '',
        years: parseInt(memberData.years),
        level: memberData.level
    };
    members.push(newMember);
    saveMembers(members);
    return newMember;
}

/**
 * 부서원 수정
 * @param {string} id - 부서원 ID
 * @param {Object} memberData - 수정할 부서원 정보
 * @returns {Object|null} 수정된 부서원 정보 또는 null
 */
export function updateMember(id, memberData) {
    const members = getMembers();
    const index = members.findIndex(m => m.id === id);
    
    if (index === -1) {
        return null;
    }
    
    members[index] = {
        ...members[index],
        name: memberData.name,
        primaryArchetype: memberData.primaryArchetype,
        secondaryArchetype: memberData.secondaryArchetype || '',
        years: parseInt(memberData.years),
        level: memberData.level
    };
    
    saveMembers(members);
    return members[index];
}

/**
 * 부서원 삭제
 * @param {string} id - 부서원 ID
 * @returns {boolean} 삭제 성공 여부
 */
export function deleteMember(id) {
    const members = getMembers();
    const filtered = members.filter(m => m.id !== id);
    
    if (filtered.length === members.length) {
        return false; // 삭제할 항목이 없음
    }
    
    saveMembers(filtered);
    return true;
}

/**
 * 부서원 조회 (ID로)
 * @param {string} id - 부서원 ID
 * @returns {Object|null} 부서원 정보 또는 null
 */
export function getMemberById(id) {
    const members = getMembers();
    return members.find(m => m.id === id) || null;
}

