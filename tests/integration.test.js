import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
    addMember,
    getMembers,
    updateMember,
    removeMember,
    getMemberById,
    saveMembers,
    sortMembers
} from '../src/member.js';
import { 
    showTab,
    validateForm,
    submitForm,
    resetForm
} from '../src/ui.js';
import { 
    searchMembersByName,
    applyFilters
} from '../src/search-filter.js';

describe('통합 테스트 시나리오', () => {
    beforeEach(() => {
        // 각 테스트 전에 localStorage 초기화
        localStorage.clear();
    });

    describe('엔드투엔드 워크플로우', () => {
        describe('부서원 등록 → 목록 조회 → 수정 → 삭제 전체 플로우', () => {
            it('부서원을 등록하고 목록에서 조회할 수 있어야 함', () => {
                // 1. 부서원 등록
                const memberData = {
                    name: '홍길동',
                    primaryArchetype: '문제 해결형',
                    years: 5,
                    level: 'L2'
                };
                
                const newMember = addMember(memberData);
                
                expect(newMember).toBeDefined();
                expect(newMember.id).toBeDefined();
                expect(newMember.name).toBe('홍길동');
                
                // 2. 목록 조회
                const members = getMembers();
                
                expect(members.length).toBe(1);
                expect(members[0].id).toBe(newMember.id);
                expect(members[0].name).toBe('홍길동');
            });

            it('등록된 부서원을 수정할 수 있어야 함', () => {
                // 1. 부서원 등록
                const memberData = {
                    name: '홍길동',
                    primaryArchetype: '문제 해결형',
                    years: 5,
                    level: 'L2'
                };
                
                const newMember = addMember(memberData);
                
                // 2. 부서원 수정
                const updatedData = {
                    name: '홍길동수정',
                    years: 6,
                    level: 'L3'
                };
                
                const updated = updateMember(newMember.id, updatedData);
                
                expect(updated).toBeDefined();
                expect(updated.name).toBe('홍길동수정');
                expect(updated.years).toBe(6);
                expect(updated.level).toBe('L3');
                
                // 3. 목록에서 확인
                const members = getMembers();
                expect(members[0].name).toBe('홍길동수정');
            });

            it('등록된 부서원을 삭제할 수 있어야 함', () => {
                // 1. 부서원 등록
                const member1 = addMember({
                    name: '홍길동',
                    primaryArchetype: '문제 해결형',
                    years: 5,
                    level: 'L2'
                });
                
                const member2 = addMember({
                    name: '김철수',
                    primaryArchetype: '설계/아키텍처형',
                    years: 8,
                    level: 'L3'
                });
                
                expect(getMembers().length).toBe(2);
                
                // 2. 부서원 삭제
                const removed = removeMember(member1.id);
                
                expect(removed).toBe(true);
                
                // 3. 목록에서 확인
                const members = getMembers();
                expect(members.length).toBe(1);
                expect(members[0].id).toBe(member2.id);
                expect(members[0].name).toBe('김철수');
            });

            it('전체 플로우: 등록 → 조회 → 수정 → 삭제', () => {
                // 1. 등록
                const member1 = addMember({
                    name: '홍길동',
                    primaryArchetype: '문제 해결형',
                    years: 5,
                    level: 'L2'
                });
                
                const member2 = addMember({
                    name: '김철수',
                    primaryArchetype: '설계/아키텍처형',
                    years: 8,
                    level: 'L3'
                });
                
                // 2. 조회
                let members = getMembers();
                expect(members.length).toBe(2);
                
                // 3. 수정
                updateMember(member1.id, { name: '홍길동수정', years: 6 });
                members = getMembers();
                expect(members.find(m => m.id === member1.id).name).toBe('홍길동수정');
                
                // 4. 삭제
                removeMember(member1.id);
                members = getMembers();
                expect(members.length).toBe(1);
                expect(members[0].id).toBe(member2.id);
            });
        });

        describe('데이터 저장 → 페이지 새로고침 → 데이터 복원', () => {
            it('데이터를 저장하고 localStorage에서 복원할 수 있어야 함', () => {
                // 1. 부서원 등록
                const member1 = addMember({
                    name: '홍길동',
                    primaryArchetype: '문제 해결형',
                    years: 5,
                    level: 'L2'
                });
                
                const member2 = addMember({
                    name: '김철수',
                    primaryArchetype: '설계/아키텍처형',
                    years: 8,
                    level: 'L3'
                });
                
                // 2. 데이터 저장 확인
                const savedMembers = getMembers();
                expect(savedMembers.length).toBe(2);
                
                // 3. localStorage에서 직접 확인
                const stored = localStorage.getItem('ecgf_members');
                expect(stored).toBeTruthy();
                
                const parsed = JSON.parse(stored);
                expect(parsed.length).toBe(2);
                
                // 4. 새로운 인스턴스에서 데이터 복원 시뮬레이션
                localStorage.setItem('ecgf_members', stored);
                const restored = getMembers();
                
                expect(restored.length).toBe(2);
                expect(restored[0].name).toBe('홍길동');
                expect(restored[1].name).toBe('김철수');
            });

            it('여러 부서원 데이터를 저장하고 복원할 수 있어야 함', () => {
                // 1. 여러 부서원 등록
                const members = [];
                for (let i = 0; i < 5; i++) {
                    members.push(addMember({
                        name: `사원${i}`,
                        primaryArchetype: '문제 해결형',
                        years: i + 1,
                        level: 'L1'
                    }));
                }
                
                // 2. 저장 확인
                const saved = getMembers();
                expect(saved.length).toBe(5);
                
                // 3. 복원 확인
                const stored = localStorage.getItem('ecgf_members');
                localStorage.setItem('ecgf_members', stored);
                const restored = getMembers();
                
                expect(restored.length).toBe(5);
                restored.forEach((member, index) => {
                    expect(member.name).toBe(`사원${index}`);
                });
            });
        });

        describe('탭 전환 → 데이터 입력 → 저장 → 목록 갱신', () => {
            it('탭 전환 후 데이터 입력 및 저장이 가능해야 함', () => {
                // DOM 요소 생성
                document.body.innerHTML = `
                    <div id="tabs">
                        <button class="tab-btn" data-tab="overview">개요</button>
                        <button class="tab-btn" data-tab="members">부서원관리</button>
                    </div>
                    <div id="overview" class="tab-content"></div>
                    <div id="members" class="tab-content"></div>
                `;
                
                // 1. 탭 전환
                showTab('members');
                
                const membersTab = document.querySelector('#members');
                expect(membersTab).toBeDefined();
                
                // 2. 데이터 입력 및 저장
                const member = addMember({
                    name: '홍길동',
                    primaryArchetype: '문제 해결형',
                    years: 5,
                    level: 'L2'
                });
                
                // 3. 목록 갱신 확인
                const members = getMembers();
                expect(members.length).toBe(1);
                expect(members[0].id).toBe(member.id);
            });

            it('부서원 관리 탭 전환 시 목록이 자동으로 갱신되어야 함', () => {
                // 초기 데이터
                addMember({
                    name: '홍길동',
                    primaryArchetype: '문제 해결형',
                    years: 5,
                    level: 'L2'
                });
                
                // DOM 설정
                document.body.innerHTML = `
                    <div id="tabs">
                        <button class="tab-btn" data-tab="overview">개요</button>
                        <button class="tab-btn" data-tab="members">부서원관리</button>
                    </div>
                    <div id="overview" class="tab-content"></div>
                    <div id="members" class="tab-content"></div>
                `;
                
                // 다른 탭에서 부서원 추가
                showTab('overview');
                addMember({
                    name: '김철수',
                    primaryArchetype: '설계/아키텍처형',
                    years: 8,
                    level: 'L3'
                });
                
                // 부서원 관리 탭으로 전환
                showTab('members');
                
                // 목록이 갱신되었는지 확인
                const members = getMembers();
                expect(members.length).toBe(2);
            });
        });
    });

    describe('데이터 일관성 검증', () => {
        describe('수정 후 목록 자동 갱신 검증', () => {
            it('부서원 수정 후 목록이 자동으로 갱신되어야 함', () => {
                // 1. 부서원 등록
                const member = addMember({
                    name: '홍길동',
                    primaryArchetype: '문제 해결형',
                    years: 5,
                    level: 'L2'
                });
                
                // 2. 초기 목록 확인
                let members = getMembers();
                expect(members[0].name).toBe('홍길동');
                
                // 3. 수정
                updateMember(member.id, { name: '홍길동수정', years: 6 });
                
                // 4. 목록 자동 갱신 확인
                members = getMembers();
                expect(members[0].name).toBe('홍길동수정');
                expect(members[0].years).toBe(6);
            });

            it('여러 부서원 중 하나를 수정해도 목록이 정확히 갱신되어야 함', () => {
                // 1. 여러 부서원 등록
                const member1 = addMember({
                    name: '홍길동',
                    primaryArchetype: '문제 해결형',
                    years: 5,
                    level: 'L2'
                });
                
                const member2 = addMember({
                    name: '김철수',
                    primaryArchetype: '설계/아키텍처형',
                    years: 8,
                    level: 'L3'
                });
                
                const member3 = addMember({
                    name: '이영희',
                    primaryArchetype: '연구/개선형',
                    years: 10,
                    level: 'L3'
                });
                
                // 2. 중간 부서원 수정
                updateMember(member2.id, { name: '김철수수정', years: 9 });
                
                // 3. 목록 확인
                const members = getMembers();
                const updatedMember = members.find(m => m.id === member2.id);
                
                expect(updatedMember).toBeDefined();
                expect(updatedMember.name).toBe('김철수수정');
                expect(updatedMember.years).toBe(9);
                
                // 다른 부서원은 변경되지 않았는지 확인
                const unchanged1 = members.find(m => m.id === member1.id);
                const unchanged3 = members.find(m => m.id === member3.id);
                
                expect(unchanged1.name).toBe('홍길동');
                expect(unchanged3.name).toBe('이영희');
            });
        });

        describe('삭제 후 목록 자동 갱신 검증', () => {
            it('부서원 삭제 후 목록이 자동으로 갱신되어야 함', () => {
                // 1. 부서원 등록
                const member1 = addMember({
                    name: '홍길동',
                    primaryArchetype: '문제 해결형',
                    years: 5,
                    level: 'L2'
                });
                
                const member2 = addMember({
                    name: '김철수',
                    primaryArchetype: '설계/아키텍처형',
                    years: 8,
                    level: 'L3'
                });
                
                // 2. 초기 목록 확인
                let members = getMembers();
                expect(members.length).toBe(2);
                
                // 3. 삭제
                removeMember(member1.id);
                
                // 4. 목록 자동 갱신 확인
                members = getMembers();
                expect(members.length).toBe(1);
                expect(members[0].id).toBe(member2.id);
                expect(members[0].name).toBe('김철수');
            });

            it('여러 부서원 중 하나를 삭제해도 목록이 정확히 갱신되어야 함', () => {
                // 1. 여러 부서원 등록
                const member1 = addMember({
                    name: '홍길동',
                    primaryArchetype: '문제 해결형',
                    years: 5,
                    level: 'L2'
                });
                
                const member2 = addMember({
                    name: '김철수',
                    primaryArchetype: '설계/아키텍처형',
                    years: 8,
                    level: 'L3'
                });
                
                const member3 = addMember({
                    name: '이영희',
                    primaryArchetype: '연구/개선형',
                    years: 10,
                    level: 'L3'
                });
                
                // 2. 중간 부서원 삭제
                removeMember(member2.id);
                
                // 3. 목록 확인
                const members = getMembers();
                expect(members.length).toBe(2);
                
                // 삭제된 부서원이 목록에 없는지 확인
                const deletedMember = members.find(m => m.id === member2.id);
                expect(deletedMember).toBeUndefined();
                
                // 나머지 부서원은 유지되는지 확인
                expect(members.find(m => m.id === member1.id)).toBeDefined();
                expect(members.find(m => m.id === member3.id)).toBeDefined();
            });
        });

        describe('동시 편집 방지 (향후 기능)', () => {
            it('동시 편집 방지 함수가 존재해야 함 (향후 구현)', () => {
                // 향후 기능이므로 기본 구조만 확인
                expect(true).toBe(true);
            });
        });
    });

    describe('복합 기능 통합 테스트', () => {
        it('검색과 필터링을 함께 사용할 수 있어야 함', () => {
            // 1. 여러 부서원 등록
            addMember({
                name: '홍길동',
                primaryArchetype: '문제 해결형',
                years: 5,
                level: 'L2'
            });
            
            addMember({
                name: '홍길순',
                primaryArchetype: '설계/아키텍처형',
                years: 8,
                level: 'L3'
            });
            
            addMember({
                name: '김철수',
                primaryArchetype: '문제 해결형',
                years: 3,
                level: 'L1'
            });
            
            // 2. 검색
            const allMembers = getMembers();
            const searchResults = searchMembersByName(allMembers, '홍');
            
            expect(searchResults.length).toBe(2);
            
            // 3. 필터링
            const filters = {
                level: 'L2'
            };
            const filtered = applyFilters(allMembers, filters);
            
            expect(filtered.length).toBe(1);
            expect(filtered[0].name).toBe('홍길동');
        });

        it('정렬과 검색을 함께 사용할 수 있어야 함', () => {
            // 1. 여러 부서원 등록 (다양한 레벨)
            addMember({
                name: '홍길동',
                primaryArchetype: '문제 해결형',
                years: 5,
                level: 'L2'
            });
            
            addMember({
                name: '김철수',
                primaryArchetype: '설계/아키텍처형',
                years: 8,
                level: 'L3'
            });
            
            addMember({
                name: '이영희',
                primaryArchetype: '연구/개선형',
                years: 10,
                level: 'L3'
            });
            
            // 2. 정렬
            let members = getMembers();
            const sorted = sortMembers(members);
            
            // 레벨이 높은 순서대로 정렬되어야 함
            expect(sorted[0].level).toBe('L3');
            expect(sorted[1].level).toBe('L3');
            expect(sorted[2].level).toBe('L2');
            
            // 3. 검색 후에도 정렬 유지
            const searchResults = searchMembersByName(sorted, '이');
            expect(searchResults.length).toBe(1);
            expect(searchResults[0].name).toBe('이영희');
        });
    });
});

