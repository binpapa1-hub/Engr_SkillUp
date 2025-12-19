import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getMembers, saveMembers, validateMember, STORAGE_KEY } from '../src/member.js';

// localStorage 모킹
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: vi.fn((key) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        })
    };
})();

// beforeEach에서 localStorage를 모킹된 객체로 교체
beforeEach(() => {
    global.localStorage = localStorageMock;
    localStorageMock.clear();
});

describe('부서원 데이터 관리', () => {
    describe('getMembers()', () => {
        it('빈 스토리지에서 빈 배열을 반환해야 함', () => {
            const members = getMembers();
            expect(members).toEqual([]);
            expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
        });

        it('저장된 데이터를 올바르게 파싱하여 반환해야 함', () => {
            const testData = [
                { id: '1', name: '홍길동', primaryArchetype: '문제 해결형', years: 5, level: 'L2' }
            ];
            localStorageMock.setItem(STORAGE_KEY, JSON.stringify(testData));
            
            const members = getMembers();
            expect(members).toEqual(testData);
        });

        it('잘못된 JSON 데이터 처리 시 에러를 발생시켜야 함', () => {
            localStorageMock.setItem(STORAGE_KEY, 'invalid json');
            
            expect(() => getMembers()).toThrow();
        });
    });

    describe('saveMembers()', () => {
        it('부서원 배열을 로컬 스토리지에 저장해야 함', () => {
            const members = [
                { id: '1', name: '홍길동', primaryArchetype: '문제 해결형', years: 5, level: 'L2' }
            ];
            
            saveMembers(members);
            
            expect(localStorage.setItem).toHaveBeenCalledWith(
                STORAGE_KEY,
                JSON.stringify(members)
            );
        });

        it('빈 배열도 저장할 수 있어야 함', () => {
            saveMembers([]);
            
            expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, '[]');
        });
    });

    describe('validateMember()', () => {
        it('유효한 부서원 데이터는 통과해야 함', () => {
            const validMember = {
                name: '홍길동',
                primaryArchetype: '문제 해결형',
                years: 5,
                level: 'L2'
            };
            
            const result = validateMember(validMember);
            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('이름이 없으면 검증 실패해야 함', () => {
            const invalidMember = {
                name: '',
                primaryArchetype: '문제 해결형',
                years: 5,
                level: 'L2'
            };
            
            const result = validateMember(invalidMember);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('이름은 필수 입력 항목입니다.');
        });

        it('주요 성향이 없으면 검증 실패해야 함', () => {
            const invalidMember = {
                name: '홍길동',
                primaryArchetype: '',
                years: 5,
                level: 'L2'
            };
            
            const result = validateMember(invalidMember);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('주요 성향은 필수 선택 항목입니다.');
        });

        it('연차가 범위를 벗어나면 검증 실패해야 함', () => {
            const invalidMember = {
                name: '홍길동',
                primaryArchetype: '문제 해결형',
                years: 51,
                level: 'L2'
            };
            
            const result = validateMember(invalidMember);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('근무 연차는 0~50년 사이의 숫자여야 합니다.');
        });

        it('음수 연차는 검증 실패해야 함', () => {
            const invalidMember = {
                name: '홍길동',
                primaryArchetype: '문제 해결형',
                years: -1,
                level: 'L2'
            };
            
            const result = validateMember(invalidMember);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('근무 연차는 0~50년 사이의 숫자여야 합니다.');
        });

        it('잘못된 레벨은 검증 실패해야 함', () => {
            const invalidMember = {
                name: '홍길동',
                primaryArchetype: '문제 해결형',
                years: 5,
                level: 'L6'
            };
            
            const result = validateMember(invalidMember);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('업무 레벨은 L1~L5 중 하나여야 합니다.');
        });

        it('여러 검증 오류를 모두 반환해야 함', () => {
            const invalidMember = {
                name: '',
                primaryArchetype: '',
                years: -1,
                level: 'L6'
            };
            
            const result = validateMember(invalidMember);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(1);
        });
    });
});

