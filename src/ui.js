/**
 * UI 관리 모듈
 * 최소 기능: 탭 전환, 부서원 목록 렌더링
 */

/**
 * 탭 전환
 * @param {string} tabName - 표시할 탭 이름
 */
export function showTab(tabName) {
    // 모든 탭과 콘텐츠 숨기기
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    // 선택한 탭 활성화 (onclick 속성에서 찾기)
    const tabLabels = {
        'overview': '개요',
        'members': '부서원 관리',
        'levels': '연차별 역량',
        'archetypes': '성향 트랙',
        'mentoring': '면담 가이드',
        'tracks': '트랙 비교',
        'evaluation': '평가 기준'
    };
    
    const label = tabLabels[tabName];
    const activeTab = Array.from(tabs).find(tab => 
        tab.textContent.trim() === label ||
        tab.getAttribute('onclick')?.includes(`'${tabName}'`)
    );
    
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    const activeContent = document.getElementById(tabName);
    if (activeContent) {
        activeContent.classList.add('active');
    }
}


/**
 * 부서원 목록 렌더링
 * @param {Array} members - 부서원 배열
 * @param {Function} onEdit - 수정 콜백 함수
 * @param {Function} onDelete - 삭제 콜백 함수
 */
export function renderMemberList(members, onEdit, onDelete) {
    const listContainer = document.getElementById('memberList');
    
    if (!listContainer) {
        return;
    }
    
    if (members.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <h3>등록된 부서원이 없습니다</h3>
                <p>위의 폼을 사용하여 부서원을 등록해주세요.</p>
            </div>
        `;
        return;
    }
    
    // 레벨별로 정렬
    const levelOrder = { 'L1': 1, 'L2': 2, 'L3': 3, 'L4': 4, 'L5': 5 };
    const sortedMembers = [...members].sort((a, b) => {
        const levelDiff = (levelOrder[b.level] || 0) - (levelOrder[a.level] || 0);
        if (levelDiff !== 0) return levelDiff;
        return b.years - a.years;
    });
    
    listContainer.innerHTML = sortedMembers.map(member => `
        <div class="member-card">
            <div class="member-header">
                <div class="member-name">${escapeHtml(member.name)}</div>
                <div class="action-buttons">
                    <button class="btn btn-secondary btn-small" onclick="window.editMemberHandler('${member.id}')">수정</button>
                    <button class="btn btn-danger btn-small" onclick="window.deleteMemberHandler('${member.id}')">삭제</button>
                </div>
            </div>
            <div class="member-info">
                <div class="info-item">
                    <span class="info-label">업무 레벨:</span>
                    <span class="badge badge-level">${escapeHtml(member.level)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">근무 연차:</span>
                    <span class="badge badge-years">${member.years}년</span>
                </div>
                <div class="info-item">
                    <span class="info-label">주요 성향:</span>
                    <span class="badge badge-archetype">${escapeHtml(member.primaryArchetype)}</span>
                </div>
                ${member.secondaryArchetype ? `
                <div class="info-item">
                    <span class="info-label">보조 성향:</span>
                    <span class="badge badge-archetype">${escapeHtml(member.secondaryArchetype)}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    // 전역 핸들러 등록
    window.editMemberHandler = onEdit;
    window.deleteMemberHandler = onDelete;
}

/**
 * HTML 이스케이프 (XSS 방지)
 * @param {string} text - 이스케이프할 텍스트
 * @returns {string} 이스케이프된 텍스트
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

