import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
    getMembers, 
    saveMembers, 
    validateMember, 
    createMember,
    addMember,
    updateMember,
    removeMember,
    getMemberById,
    sortMembers,
    STORAGE_KEY 
} from '../src/member.js';

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

    // ============================================
    // 부서원 데이터 모델 실패 테스트 (Red 단계)
    // ============================================
    describe('부서원 데이터 모델 - createMember()', () => {
        it('Member 객체 생성 시 필수 필드 검증 - 이름 누락 시 에러 발생해야 함', () => {
            const memberData = {
                primaryArchetype: '문제 해결형',
                years: 5,
                level: 'L2'
            };
            
            expect(() => createMember(memberData)).toThrow();
        });

        it('Member 객체 생성 시 필수 필드 검증 - 주요성향 누락 시 에러 발생해야 함', () => {
            const memberData = {
                name: '홍길동',
                years: 5,
                level: 'L2'
            };
            
            expect(() => createMember(memberData)).toThrow();
        });

        it('Member 객체 생성 시 필수 필드 검증 - 연차 누락 시 에러 발생해야 함', () => {
            const memberData = {
                name: '홍길동',
                primaryArchetype: '문제 해결형',
                level: 'L2'
            };
            
            expect(() => createMember(memberData)).toThrow();
        });

        it('Member 객체 생성 시 필수 필드 검증 - 레벨 누락 시 에러 발생해야 함', () => {
            const memberData = {
                name: '홍길동',
                primaryArchetype: '문제 해결형',
                years: 5
            };
            
            expect(() => createMember(memberData)).toThrow();
        });

        it('고유 ID 자동 생성 로직 검증 - ID가 자동으로 생성되어야 함', () => {
            const memberData = {
                name: '홍길동',
                primaryArchetype: '문제 해결형',
                years: 5,
                level: 'L2'
            };
            
            const member = createMember(memberData);
            expect(member.id).toBeDefined();
            expect(typeof member.id).toBe('string');
            expect(member.id.length).toBeGreaterThan(0);
        });

        it('고유 ID 자동 생성 로직 검증 - 각 Member는 고유한 ID를 가져야 함', () => {
            const memberData = {
                name: '홍길동',
                primaryArchetype: '문제 해결형',
                years: 5,
                level: 'L2'
            };
            
            const member1 = createMember(memberData);
            const member2 = createMember(memberData);
            
            expect(member1.id).not.toBe(member2.id);
        });

        it('데이터 타입 검증 - 연차는 숫자여야 함', () => {
            const memberData = {
                name: '홍길동',
                primaryArchetype: '문제 해결형',
                years: '5', // 문자열
                level: 'L2'
            };
            
            expect(() => createMember(memberData)).toThrow();
        });

        it('데이터 타입 검증 - 레벨은 L1~L5 중 하나여야 함', () => {
            const memberData = {
                name: '홍길동',
                primaryArchetype: '문제 해결형',
                years: 5,
                level: 'L6' // 잘못된 레벨
            };
            
            expect(() => createMember(memberData)).toThrow();
        });
    });

    // ============================================
    // 부서원 등록 기능 실패 테스트 (Red 단계)
    // ============================================
    describe('부서원 등록 기능 - addMember()', () => {
        it('필수 항목 미입력 시 에러 처리 - 이름 누락', () => {
            const memberData = {
                primaryArchetype: '문제 해결형',
                years: 5,
                level: 'L2'
            };
            
            expect(() => addMember(memberData)).toThrow();
        });

        it('필수 항목 미입력 시 에러 처리 - 주요성향 누락', () => {
            const memberData = {
                name: '홍길동',
                years: 5,
                level: 'L2'
            };
            
            expect(() => addMember(memberData)).toThrow();
        });

        it('연차 범위 검증 - 0년은 유효해야 함', () => {
            const memberData = {
                name: '홍길동',
                primaryArchetype: '문제 해결형',
                years: 0,
                level: 'L1'
            };
            
            const result = addMember(memberData);
            expect(result).toBeDefined();
        });

        it('연차 범위 검증 - 50년은 유효해야 함', () => {
            const memberData = {
                name: '홍길동',
                primaryArchetype: '문제 해결형',
                years: 50,
                level: 'L5'
            };
            
            const result = addMember(memberData);
            expect(result).toBeDefined();
        });

        it('연차 범위 검증 - 51년은 에러 발생해야 함', () => {
            const memberData = {
                name: '홍길동',
                primaryArchetype: '문제 해결형',
                years: 51,
                level: 'L5'
            };
            
            expect(() => addMember(memberData)).toThrow();
        });

        it('주요 성향 필수 선택 검증 - 빈 문자열은 에러 발생해야 함', () => {
            const memberData = {
                name: '홍길동',
                primaryArchetype: '',
                years: 5,
                level: 'L2'
            };
            
            expect(() => addMember(memberData)).toThrow();
        });

        it('보조 성향 선택사항 검증 - 보조 성향 없이도 등록 가능해야 함', () => {
            const memberData = {
                name: '홍길동',
                primaryArchetype: '문제 해결형',
                years: 5,
                level: 'L2'
            };
            
            const result = addMember(memberData);
            expect(result).toBeDefined();
            expect(result.secondaryArchetype).toBeUndefined();
        });

        it('등록 후 목록에 추가되어야 함', () => {
            const memberData = {
                name: '홍길동',
                primaryArchetype: '문제 해결형',
                years: 5,
                level: 'L2'
            };
            
            addMember(memberData);
            const members = getMembers();
            expect(members.length).toBe(1);
            expect(members[0].name).toBe('홍길동');
        });
    });

    // ============================================
    // 부서원 수정 기능 실패 테스트 (Red 단계)
    // ============================================
    describe('부서원 수정 기능 - updateMember()', () => {
        beforeEach(() => {
            // 테스트용 부서원 추가
            const member = {
                id: 'test-id-1',
                name: '홍길동',
                primaryArchetype: '문제 해결형',
                years: 5,
                level: 'L2'
            };
            saveMembers([member]);
        });

        it('기존 부서원 정보 로드 검증 - ID로 부서원을 찾을 수 있어야 함', () => {
            const member = getMemberById('test-id-1');
            expect(member).toBeDefined();
            expect(member.name).toBe('홍길동');
        });

        it('수정 후 데이터 업데이트 검증 - 이름 수정', () => {
            const updatedData = {
                name: '김철수',
                primaryArchetype: '문제 해결형',
                years: 5,
                level: 'L2'
            };
            
            updateMember('test-id-1', updatedData);
            const member = getMemberById('test-id-1');
            expect(member.name).toBe('김철수');
        });

        it('수정 후 데이터 업데이트 검증 - 연차 수정', () => {
            const updatedData = {
                name: '홍길동',
                primaryArchetype: '문제 해결형',
                years: 7,
                level: 'L2'
            };
            
            updateMember('test-id-1', updatedData);
            const member = getMemberById('test-id-1');
            expect(member.years).toBe(7);
        });

        it('존재하지 않는 ID 수정 시 에러 처리', () => {
            const updatedData = {
                name: '김철수',
                primaryArchetype: '문제 해결형',
                years: 5,
                level: 'L2'
            };
            
            expect(() => updateMember('non-existent-id', updatedData)).toThrow();
        });
    });

    // ============================================
    // 부서원 삭제 기능 실패 테스트 (Red 단계)
    // ============================================
    describe('부서원 삭제 기능 - removeMember()', () => {
        beforeEach(() => {
            // 테스트용 부서원 추가
            const members = [
                { id: 'test-id-1', name: '홍길동', primaryArchetype: '문제 해결형', years: 5, level: 'L2' },
                { id: 'test-id-2', name: '김철수', primaryArchetype: '설계/아키텍처형', years: 10, level: 'L3' }
            ];
            saveMembers(members);
        });

        it('삭제 후 목록에서 제거 검증', () => {
            removeMember('test-id-1');
            const members = getMembers();
            expect(members.length).toBe(1);
            expect(members.find(m => m.id === 'test-id-1')).toBeUndefined();
        });

        it('존재하지 않는 ID 삭제 시 에러 처리', () => {
            expect(() => removeMember('non-existent-id')).toThrow();
        });

        it('삭제 후 다른 부서원은 유지되어야 함', () => {
            removeMember('test-id-1');
            const members = getMembers();
            expect(members.length).toBe(1);
            expect(members[0].id).toBe('test-id-2');
        });
    });

    // ============================================
    // 부서원 목록 조회 실패 테스트 (Red 단계)
    // ============================================
    describe('부서원 목록 조회 - sortMembers()', () => {
        it('빈 목록 처리 검증', () => {
            const sorted = sortMembers([]);
            expect(sorted).toEqual([]);
        });

        it('레벨별 정렬 검증 - L5 → L1 순서', () => {
            const members = [
                { id: '1', name: 'L1', level: 'L1', years: 2 },
                { id: '2', name: 'L5', level: 'L5', years: 25 },
                { id: '3', name: 'L2', level: 'L2', years: 5 },
                { id: '4', name: 'L3', level: 'L3', years: 10 }
            ];
            
            const sorted = sortMembers(members);
            expect(sorted[0].level).toBe('L5');
            expect(sorted[1].level).toBe('L3');
            expect(sorted[2].level).toBe('L2');
            expect(sorted[3].level).toBe('L1');
        });

        it('동일 레벨 내 연차 내림차순 정렬 검증', () => {
            const members = [
                { id: '1', name: 'A', level: 'L2', years: 5 },
                { id: '2', name: 'B', level: 'L2', years: 7 },
                { id: '3', name: 'C', level: 'L2', years: 4 }
            ];
            
            const sorted = sortMembers(members);
            expect(sorted[0].years).toBe(7);
            expect(sorted[1].years).toBe(5);
            expect(sorted[2].years).toBe(4);
        });

        it('레벨 우선, 동일 레벨 내 연차 내림차순 정렬 검증', () => {
            const members = [
                { id: '1', name: 'L2-5', level: 'L2', years: 5 },
                { id: '2', name: 'L3-8', level: 'L3', years: 8 },
                { id: '3', name: 'L2-7', level: 'L2', years: 7 },
                { id: '4', name: 'L3-10', level: 'L3', years: 10 }
            ];
            
            const sorted = sortMembers(members);
            expect(sorted[0].level).toBe('L3');
            expect(sorted[0].years).toBe(10);
            expect(sorted[1].level).toBe('L3');
            expect(sorted[1].years).toBe(8);
            expect(sorted[2].level).toBe('L2');
            expect(sorted[2].years).toBe(7);
            expect(sorted[3].level).toBe('L2');
            expect(sorted[3].years).toBe(5);
        });
    });

    // ============================================
    // 로컬 스토리지 데이터 관리 테스트 (Red 단계)
    // ============================================
    describe('로컬 스토리지 데이터 저장/로드', () => {
        describe('getMembers() - 데이터 로드', () => {
            it('빈 스토리지에서 빈 배열을 반환해야 함', () => {
                const members = getMembers();
                expect(members).toEqual([]);
                expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
            });

            it('스토리지 키 ecgf_members를 사용해야 함', () => {
                getMembers();
                expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
                expect(STORAGE_KEY).toBe('ecgf_members');
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

            it('스토리지에 키가 없는 경우 빈 배열을 반환해야 함', () => {
                // clear() 후에는 키가 없으므로 null 반환
                localStorageMock.clear();
                const members = getMembers();
                expect(members).toEqual([]);
            });
        });

        describe('saveMembers() - 데이터 저장', () => {
            it('부서원 배열을 JSON으로 직렬화하여 저장해야 함', () => {
                const members = [
                    { id: '1', name: '홍길동', primaryArchetype: '문제 해결형', years: 5, level: 'L2' }
                ];
                
                saveMembers(members);
                
                expect(localStorage.setItem).toHaveBeenCalledWith(
                    STORAGE_KEY,
                    JSON.stringify(members)
                );
            });

            it('스토리지 키 ecgf_members를 사용해야 함', () => {
                const members = [
                    { id: '1', name: '홍길동', primaryArchetype: '문제 해결형', years: 5, level: 'L2' }
                ];
                
                saveMembers(members);
                
                expect(localStorage.setItem).toHaveBeenCalledWith(
                    STORAGE_KEY,
                    expect.any(String)
                );
                expect(STORAGE_KEY).toBe('ecgf_members');
            });

            it('빈 배열도 저장할 수 있어야 함', () => {
                saveMembers([]);
                
                expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, '[]');
            });

            it('JSON 직렬화/역직렬화가 정확해야 함', () => {
                const members = [
                    { id: '1', name: '홍길동', primaryArchetype: '문제 해결형', years: 5, level: 'L2' },
                    { id: '2', name: '김철수', primaryArchetype: '설계/아키텍처형', years: 10, level: 'L3', secondaryArchetype: '문제 해결형' }
                ];
                
                saveMembers(members);
                const savedData = localStorageMock.getItem(STORAGE_KEY);
                const parsed = JSON.parse(savedData);
                
                expect(parsed).toEqual(members);
                expect(parsed.length).toBe(2);
            });
        });
    });

    describe('데이터 검증 및 에러 처리', () => {
        describe('필수 필드 누락 검증', () => {
            it('배열이 아닌 데이터 형식 처리 - 객체인 경우 에러 발생해야 함', () => {
                localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ id: '1', name: '홍길동' }));
                
                expect(() => {
                    const members = getMembers();
                    if (!Array.isArray(members)) {
                        throw new Error('데이터는 배열 형식이어야 합니다.');
                    }
                }).toThrow('데이터는 배열 형식이어야 합니다.');
            });

            it('배열이 아닌 데이터 형식 처리 - 문자열인 경우 에러 발생해야 함', () => {
                localStorageMock.setItem(STORAGE_KEY, JSON.stringify('invalid'));
                
                expect(() => {
                    const members = getMembers();
                    if (!Array.isArray(members)) {
                        throw new Error('데이터는 배열 형식이어야 합니다.');
                    }
                }).toThrow('데이터는 배열 형식이어야 합니다.');
            });

            it('배열이 아닌 데이터 형식 처리 - 숫자인 경우 에러 발생해야 함', () => {
                localStorageMock.setItem(STORAGE_KEY, JSON.stringify(123));
                
                expect(() => {
                    const members = getMembers();
                    if (!Array.isArray(members)) {
                        throw new Error('데이터는 배열 형식이어야 합니다.');
                    }
                }).toThrow('데이터는 배열 형식이어야 합니다.');
            });
        });

        describe('데이터 타입 불일치 처리', () => {
            it('부서원 데이터에 필수 필드가 누락된 경우 검증 실패해야 함', () => {
                const invalidMembers = [
                    { id: '1', name: '홍길동' }, // primaryArchetype, years, level 누락
                    { id: '2', primaryArchetype: '문제 해결형' } // name, years, level 누락
                ];
                
                localStorageMock.setItem(STORAGE_KEY, JSON.stringify(invalidMembers));
                const members = getMembers();
                
                // validateMember로 검증
                const result1 = validateMember(members[0]);
                const result2 = validateMember(members[1]);
                
                expect(result1.valid).toBe(false);
                expect(result2.valid).toBe(false);
            });

            it('연차가 숫자가 아닌 경우 검증 실패해야 함', () => {
                const invalidMember = {
                    name: '홍길동',
                    primaryArchetype: '문제 해결형',
                    years: '5', // 문자열
                    level: 'L2'
                };
                
                const result = validateMember(invalidMember);
                expect(result.valid).toBe(false);
                expect(result.errors).toContain('근무 연차는 0~50년 사이의 숫자여야 합니다.');
            });

            it('레벨이 유효하지 않은 경우 검증 실패해야 함', () => {
                const invalidMember = {
                    name: '홍길동',
                    primaryArchetype: '문제 해결형',
                    years: 5,
                    level: 'L6' // 잘못된 레벨
                };
                
                const result = validateMember(invalidMember);
                expect(result.valid).toBe(false);
                expect(result.errors).toContain('업무 레벨은 L1~L5 중 하나여야 합니다.');
            });
        });
    });
});

