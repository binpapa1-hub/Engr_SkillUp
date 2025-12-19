/**
 * 메인 애플리케이션 모듈
 * 최소 기능: 부서원 관리 통합
 */

import { getMembers, addMember, updateMember, removeMember as deleteMemberFromStorage, getMemberById, validateMember } from './member.js';
import { renderMemberList, showTab } from './ui.js';

// 전역 변수
let editingId = null;

/**
 * 부서원 저장 (등록/수정)
 * @param {Event} event - 폼 제출 이벤트
 */
export function saveMember(event) {
    event.preventDefault();
    
    const memberData = {
        name: document.getElementById('memberName').value,
        primaryArchetype: document.getElementById('primaryArchetype').value,
        secondaryArchetype: document.getElementById('secondaryArchetype').value,
        years: parseInt(document.getElementById('years').value, 10),
        level: document.getElementById('level').value
    };
    
    // 검증
    const validation = validateMember(memberData);
    if (!validation.valid) {
        alert(validation.errors.join('\n'));
        return;
    }
    
    // 등록 또는 수정
    if (editingId) {
        updateMember(editingId, memberData);
    } else {
        addMember(memberData);
    }
    
    // 폼 초기화 및 목록 갱신
    resetForm();
    refreshMemberList();
}

/**
 * 폼 초기화
 */
export function resetForm() {
    document.getElementById('memberForm').reset();
    document.getElementById('editId').value = '';
    editingId = null;
}

/**
 * 부서원 수정 시작
 * @param {string} id - 부서원 ID
 */
export function editMember(id) {
    const member = getMemberById(id);
    
    if (!member) {
        return;
    }
    
    editingId = member.id;
    document.getElementById('editId').value = member.id;
    document.getElementById('memberName').value = member.name;
    document.getElementById('primaryArchetype').value = member.primaryArchetype;
    document.getElementById('secondaryArchetype').value = member.secondaryArchetype || '';
    document.getElementById('years').value = member.years;
    document.getElementById('level').value = member.level;
    
    // 부서원 관리 탭으로 이동
    showTab('members');
    document.getElementById('members').scrollIntoView({ behavior: 'smooth' });
}

/**
 * 부서원 삭제
 * @param {string} id - 부서원 ID
 */
export function removeMember(id) {
    if (!confirm('정말 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        deleteMemberFromStorage(id);
        refreshMemberList();
    } catch (error) {
        alert('삭제할 항목을 찾을 수 없습니다.');
    }
}

/**
 * 부서원 목록 새로고침
 */
export function refreshMemberList() {
    const members = getMembers();
    renderMemberList(members, editMember, removeMember);
}

/**
 * 탭 전환 핸들러
 * @param {string} tabName - 탭 이름
 * @param {Event} event - 이벤트 객체 (선택사항)
 */
export function handleTabChange(tabName, event = null) {
    // 클릭한 버튼 찾기
    let clickedTab = null;
    if (event && event.target) {
        clickedTab = event.target.closest('.nav-tab');
    } else {
        // onclick 핸들러에서 호출된 경우, 모든 탭 버튼을 확인
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => {
            const onclick = tab.getAttribute('onclick');
            if (onclick && (onclick.includes(`'${tabName}'`) || onclick.includes(`"${tabName}"`))) {
                clickedTab = tab;
            }
        });
    }
    
    showTab(tabName, clickedTab);
    
    // 부서원 관리 탭일 경우 목록 새로고침
    if (tabName === 'members') {
        refreshMemberList();
    }
}

/**
 * 애플리케이션 초기화
 */
export function init() {
    // 페이지 로드 시 부서원 목록 렌더링
    refreshMemberList();
    
    // 폼 제출 이벤트 리스너
    const form = document.getElementById('memberForm');
    if (form) {
        form.addEventListener('submit', saveMember);
    }
}

// DOM 로드 완료 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

