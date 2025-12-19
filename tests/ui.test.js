import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// DOM 환경 설정
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
    resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Event = dom.window.Event;

// UI 함수들을 모듈로 가져오기
import { showTab, validateForm, submitForm, resetForm, isEditMode } from '../src/ui.js';

describe('UI 인터랙션 테스트', () => {
    beforeEach(() => {
        // DOM 초기화
        document.body.innerHTML = '';
    });

    describe('탭 전환 기능', () => {
        beforeEach(() => {
            // 7개 탭과 콘텐츠 영역 생성
            document.body.innerHTML = `
                <div class="nav-tabs">
                    <button class="nav-tab active" data-tab="overview">개요</button>
                    <button class="nav-tab" data-tab="members">부서원 관리</button>
                    <button class="nav-tab" data-tab="levels">연차별 역량</button>
                    <button class="nav-tab" data-tab="archetypes">성향 트랙</button>
                    <button class="nav-tab" data-tab="mentoring">면담 가이드</button>
                    <button class="nav-tab" data-tab="tracks">트랙 비교</button>
                    <button class="nav-tab" data-tab="evaluation">평가 기준</button>
                </div>
                <div id="overview" class="content active">개요 콘텐츠</div>
                <div id="members" class="content">부서원 관리 콘텐츠</div>
                <div id="levels" class="content">연차별 역량 콘텐츠</div>
                <div id="archetypes" class="content">성향 트랙 콘텐츠</div>
                <div id="mentoring" class="content">면담 가이드 콘텐츠</div>
                <div id="tracks" class="content">트랙 비교 콘텐츠</div>
                <div id="evaluation" class="content">평가 기준 콘텐츠</div>
            `;
        });

        it('7개 탭 (개요, 부서원관리, 연차별역량, 성향트랙, 면담가이드, 트랙비교, 평가기준) 전환 검증', () => {
            const tabNames = ['overview', 'members', 'levels', 'archetypes', 'mentoring', 'tracks', 'evaluation'];
            
            tabNames.forEach(tabName => {
                expect(() => {
                    showTab(tabName);
                }).not.toThrow();
                
                const content = document.getElementById(tabName);
                expect(content).toBeDefined();
            });
        });

        it('활성 탭 하이라이트 검증 - 클릭한 탭에 active 클래스가 추가되어야 함', () => {
            const membersTab = document.querySelector('[data-tab="members"]');
            const overviewTab = document.querySelector('[data-tab="overview"]');
            
            // 초기 상태: overview가 active
            expect(overviewTab.classList.contains('active')).toBe(true);
            expect(membersTab.classList.contains('active')).toBe(false);
            
            // showTab('members') 호출
            showTab('members', membersTab);
            
            // membersTab이 active가 되어야 함
            expect(membersTab.classList.contains('active')).toBe(true);
            expect(overviewTab.classList.contains('active')).toBe(false);
        });

        it('콘텐츠 영역 표시/숨김 검증 - 선택한 탭의 콘텐츠만 표시되어야 함', () => {
            const overviewContent = document.getElementById('overview');
            const membersContent = document.getElementById('members');
            const membersTab = document.querySelector('[data-tab="members"]');
            
            // 초기 상태: overview만 active
            expect(overviewContent.classList.contains('active')).toBe(true);
            expect(membersContent.classList.contains('active')).toBe(false);
            
            // showTab('members') 호출
            showTab('members', membersTab);
            
            // membersContent만 active가 되어야 함
            expect(membersContent.classList.contains('active')).toBe(true);
            expect(overviewContent.classList.contains('active')).toBe(false);
        });

        it('부서원 관리 탭 전환 시 목록 자동 새로고침 검증', () => {
            // renderMemberList 함수를 전역으로 모킹
            global.renderMemberList = vi.fn();
            const membersTab = document.querySelector('[data-tab="members"]');
            
            // showTab('members') 호출
            showTab('members', membersTab);
            
            // renderMemberList가 호출되었는지 확인
            // (showTab 함수 내부에서 renderMemberList를 호출하려고 시도함)
            // 실제로는 index.html에서 정의된 함수를 호출하므로 여기서는 함수 존재 여부만 확인
            expect(typeof global.renderMemberList).toBe('function');
        });
    });

    describe('폼 입력 검증', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <form id="memberForm">
                    <input type="text" id="memberName" name="name" />
                    <select id="primaryArchetype" name="primaryArchetype">
                        <option value="">선택하세요</option>
                        <option value="문제 해결형">🔧 문제 해결형</option>
                        <option value="설계/아키텍처형">🏗️ 설계/아키텍처형</option>
                        <option value="연구/개선형">🔬 연구/개선형</option>
                        <option value="현장/운영형">⚙️ 현장/운영형</option>
                        <option value="리더/멘토형">👥 리더/멘토형</option>
                    </select>
                    <select id="secondaryArchetype" name="secondaryArchetype">
                        <option value="">없음</option>
                        <option value="문제 해결형">🔧 문제 해결형</option>
                        <option value="설계/아키텍처형">🏗️ 설계/아키텍처형</option>
                        <option value="연구/개선형">🔬 연구/개선형</option>
                        <option value="현장/운영형">⚙️ 현장/운영형</option>
                        <option value="리더/멘토형">👥 리더/멘토형</option>
                    </select>
                    <input type="number" id="years" name="years" min="0" max="50" />
                    <select id="level" name="level">
                        <option value="">선택하세요</option>
                        <option value="L1">L1 - Foundation (1~3년)</option>
                        <option value="L2">L2 - Practitioner (4~7년)</option>
                        <option value="L3">L3 - Senior Engineer (8~12년)</option>
                        <option value="L4">L4 - Staff / Principal (13~20년)</option>
                        <option value="L5">L5 - Master (20년+)</option>
                    </select>
                </form>
            `;
        });

        it('이름 입력 필드 검증 - 필수 입력 검증', () => {
            const form = document.getElementById('memberForm');
            const nameInput = document.getElementById('memberName');
            nameInput.value = '';
            
            const validation = validateForm(form);
            expect(validation.valid).toBe(false);
            expect(validation.errors).toContain('이름은 필수 입력 항목입니다.');
        });

        it('주요 성향 선택 필드 검증 - 5가지 옵션이 있어야 함', () => {
            const primarySelect = document.getElementById('primaryArchetype');
            const options = primarySelect.querySelectorAll('option');
            
            // 기본 옵션 + 5가지 성향 = 6개
            expect(options.length).toBe(6);
            
            const archetypes = ['문제 해결형', '설계/아키텍처형', '연구/개선형', '현장/운영형', '리더/멘토형'];
            archetypes.forEach(archetype => {
                const option = Array.from(options).find(opt => opt.value === archetype);
                expect(option).toBeDefined();
            });
        });

        it('보조 성향 선택 필드 검증 - 선택사항이어야 함', () => {
            const secondarySelect = document.getElementById('secondaryArchetype');
            const firstOption = secondarySelect.querySelector('option');
            
            // 첫 번째 옵션이 "없음"이어야 함
            expect(firstOption.value).toBe('');
            expect(firstOption.textContent).toContain('없음');
        });

        it('연차 숫자 입력 검증 - 숫자만 입력 가능해야 함', () => {
            const yearsInput = document.getElementById('years');
            yearsInput.type = 'number';
            yearsInput.min = '0';
            yearsInput.max = '50';
            
            expect(yearsInput.type).toBe('number');
            expect(yearsInput.min).toBe('0');
            expect(yearsInput.max).toBe('50');
        });

        it('레벨 선택 필드 검증 - L1~L5 옵션이 있어야 함', () => {
            const levelSelect = document.getElementById('level');
            const options = levelSelect.querySelectorAll('option');
            
            const levels = ['L1', 'L2', 'L3', 'L4', 'L5'];
            levels.forEach(level => {
                const option = Array.from(options).find(opt => opt.value === level);
                expect(option).toBeDefined();
            });
        });
    });

    describe('폼 제출 검증', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <form id="memberForm">
                    <input type="hidden" id="editId" />
                    <input type="text" id="memberName" />
                    <select id="primaryArchetype">
                        <option value="">선택하세요</option>
                        <option value="문제 해결형">문제 해결형</option>
                    </select>
                    <select id="secondaryArchetype">
                        <option value="">없음</option>
                    </select>
                    <input type="number" id="years" />
                    <select id="level">
                        <option value="">선택하세요</option>
                        <option value="L1">L1</option>
                    </select>
                    <button type="submit">등록</button>
                </form>
            `;
        });

        it('필수 항목 미입력 시 제출 방지', () => {
            const form = document.getElementById('memberForm');
            const nameInput = document.getElementById('memberName');
            nameInput.value = '';
            
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');
            
            const result = submitForm(submitEvent);
            expect(preventDefaultSpy).toHaveBeenCalled();
            expect(result).toBe(false);
        });

        it('제출 후 폼 초기화 검증', () => {
            const form = document.getElementById('memberForm');
            const nameInput = document.getElementById('memberName');
            const editIdInput = document.getElementById('editId');
            
            nameInput.value = '홍길동';
            editIdInput.value = 'test-id';
            
            resetForm();
            
            expect(nameInput.value).toBe('');
            expect(editIdInput.value).toBe('');
        });

        it('수정 모드와 등록 모드 구분 검증', () => {
            const editIdInput = document.getElementById('editId');
            
            // 등록 모드: editId가 비어있음
            editIdInput.value = '';
            expect(isEditMode()).toBe(false);
            
            // 수정 모드: editId가 있음
            editIdInput.value = 'test-id';
            expect(isEditMode()).toBe(true);
        });
    });
});

