/**
 * UI 인터랙션 함수들
 */

/**
 * 탭을 전환합니다.
 * @param {string} tabName - 전환할 탭 이름
 * @param {HTMLElement} clickedTab - 클릭한 탭 요소 (선택사항)
 */
export function showTab(tabName, clickedTab = null) {
    // 모든 탭과 콘텐츠 숨기기
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    // 선택한 탭과 콘텐츠 활성화
    if (clickedTab) {
        clickedTab.classList.add('active');
    } else {
        // data-tab 속성으로 찾기
        let targetTab = document.querySelector(`[data-tab="${tabName}"]`);
        
        // data-tab이 없으면 onclick 속성에서 찾기
        if (!targetTab) {
            tabs.forEach(tab => {
                const onclick = tab.getAttribute('onclick');
                if (onclick && onclick.includes(`'${tabName}'`) || onclick && onclick.includes(`"${tabName}"`)) {
                    targetTab = tab;
                }
            });
        }
        
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }
    
    const targetContent = document.getElementById(tabName);
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    // 부서원 관리 탭일 경우 목록 새로고침은 handleTabChange에서 처리
}

/**
 * 폼 입력을 검증합니다.
 * @param {HTMLFormElement} form - 검증할 폼 요소
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateForm(form) {
    const errors = [];
    
    const nameInput = form.querySelector('#memberName');
    const primaryArchetypeSelect = form.querySelector('#primaryArchetype');
    const yearsInput = form.querySelector('#years');
    const levelSelect = form.querySelector('#level');
    
    if (!nameInput || !nameInput.value || nameInput.value.trim() === '') {
        errors.push('이름은 필수 입력 항목입니다.');
    }
    
    if (!primaryArchetypeSelect || !primaryArchetypeSelect.value) {
        errors.push('주요 성향은 필수 선택 항목입니다.');
    }
    
    if (!yearsInput || !yearsInput.value) {
        errors.push('근무 연차는 필수 입력 항목입니다.');
    } else {
        const years = parseInt(yearsInput.value);
        if (isNaN(years) || years < 0 || years > 50) {
            errors.push('근무 연차는 0~50년 사이의 숫자여야 합니다.');
        }
    }
    
    if (!levelSelect || !levelSelect.value) {
        errors.push('업무 레벨은 필수 선택 항목입니다.');
    } else {
        const validLevels = ['L1', 'L2', 'L3', 'L4', 'L5'];
        if (!validLevels.includes(levelSelect.value)) {
            errors.push('업무 레벨은 L1~L5 중 하나여야 합니다.');
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * 폼을 제출합니다.
 * @param {Event} event - 제출 이벤트
 * @returns {boolean} 제출 성공 여부
 */
export function submitForm(event) {
    if (event) {
        event.preventDefault();
    }
    
    const form = document.getElementById('memberForm');
    if (!form) {
        return false;
    }
    
    const validation = validateForm(form);
    if (!validation.valid) {
        // 에러 메시지 표시 (향후 구현)
        console.error('폼 검증 실패:', validation.errors);
        return false;
    }
    
    // 실제 제출 로직은 index.html의 saveMember 함수에서 처리
    // 여기서는 검증만 수행
    return true;
}

/**
 * 폼을 초기화합니다.
 */
export function resetForm() {
    const form = document.getElementById('memberForm');
    if (form) {
        form.reset();
    }
    
    const editIdInput = document.getElementById('editId');
    if (editIdInput) {
        editIdInput.value = '';
    }
}

/**
 * 수정 모드인지 확인합니다.
 * @returns {boolean} 수정 모드 여부
 */
export function isEditMode() {
    const editIdInput = document.getElementById('editId');
    return editIdInput && editIdInput.value !== '';
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
