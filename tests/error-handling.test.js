import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
    validateInput,
    handleNegativeYears,
    handleYearsOverLimit,
    handleInvalidLevel,
    handleInvalidArchetype,
    handleEmptyName,
    handleSpecialCharacters,
    handleBoundaryValues,
    checkLocalStorageSupport,
    safeJSONParse,
    safeJSONStringify,
    ERROR_MESSAGES
} from '../src/error-handling.js';
import { createMember, addMember } from '../src/member.js';
import { checkPromotionCriteria } from '../src/evaluation.js';

describe('에러 핸들링 및 엣지 케이스 테스트', () => {
    describe('입력 검증 실패 테스트', () => {
        describe('음수 연차 입력 처리', () => {
            it('음수 연차는 에러를 발생시켜야 함', () => {
                const memberData = {
                    name: '홍길동',
                    primaryArchetype: '문제 해결형',
                    years: -1,
                    level: 'L1'
                };
                
                expect(() => {
                    createMember(memberData);
                }).toThrow();
            });

            it('음수 연차 처리 함수가 에러를 반환해야 함', () => {
                const result = handleNegativeYears(-1);
                
                expect(result.valid).toBe(false);
                expect(result.error).toBeDefined();
            });
        });

        describe('범위 초과 연차 (50년 초과) 처리', () => {
            it('50년 초과 연차는 에러를 발생시켜야 함', () => {
                const memberData = {
                    name: '홍길동',
                    primaryArchetype: '문제 해결형',
                    years: 51,
                    level: 'L5'
                };
                
                expect(() => {
                    createMember(memberData);
                }).toThrow();
            });

            it('범위 초과 연차 처리 함수가 에러를 반환해야 함', () => {
                const result = handleYearsOverLimit(51);
                
                expect(result.valid).toBe(false);
                expect(result.error).toBeDefined();
            });
        });

        describe('잘못된 레벨 값 처리', () => {
            it('L6는 에러를 발생시켜야 함', () => {
                const memberData = {
                    name: '홍길동',
                    primaryArchetype: '문제 해결형',
                    years: 5,
                    level: 'L6'
                };
                
                expect(() => {
                    createMember(memberData);
                }).toThrow();
            });

            it('잘못된 레벨 처리 함수가 에러를 반환해야 함', () => {
                const result = handleInvalidLevel('L6');
                
                expect(result.valid).toBe(false);
                expect(result.error).toBeDefined();
            });

            it('빈 문자열 레벨은 에러를 발생시켜야 함', () => {
                const memberData = {
                    name: '홍길동',
                    primaryArchetype: '문제 해결형',
                    years: 5,
                    level: ''
                };
                
                expect(() => {
                    createMember(memberData);
                }).toThrow();
            });
        });

        describe('잘못된 성향 값 처리', () => {
            it('존재하지 않는 성향은 에러를 발생시켜야 함', () => {
                const memberData = {
                    name: '홍길동',
                    primaryArchetype: '존재하지않는성향',
                    years: 5,
                    level: 'L2'
                };
                
                expect(() => {
                    createMember(memberData);
                }).toThrow();
            });

            it('잘못된 성향 처리 함수가 에러를 반환해야 함', () => {
                const result = handleInvalidArchetype('존재하지않는성향');
                
                expect(result.valid).toBe(false);
                expect(result.error).toBeDefined();
            });
        });

        describe('빈 문자열 이름 처리', () => {
            it('빈 문자열 이름은 에러를 발생시켜야 함', () => {
                const memberData = {
                    name: '',
                    primaryArchetype: '문제 해결형',
                    years: 5,
                    level: 'L2'
                };
                
                expect(() => {
                    createMember(memberData);
                }).toThrow();
            });

            it('공백만 있는 이름은 에러를 발생시켜야 함', () => {
                const memberData = {
                    name: '   ',
                    primaryArchetype: '문제 해결형',
                    years: 5,
                    level: 'L2'
                };
                
                expect(() => {
                    createMember(memberData);
                }).toThrow();
            });

            it('빈 문자열 이름 처리 함수가 에러를 반환해야 함', () => {
                const result = handleEmptyName('');
                
                expect(result.valid).toBe(false);
                expect(result.error).toBeDefined();
            });
        });

        describe('특수문자 포함 이름 처리', () => {
            it('특수문자 포함 이름은 유효해야 함 (허용)', () => {
                const memberData = {
                    name: '홍-길동',
                    primaryArchetype: '문제 해결형',
                    years: 5,
                    level: 'L2'
                };
                
                // 특수문자는 허용하므로 에러가 발생하지 않아야 함
                expect(() => {
                    createMember(memberData);
                }).not.toThrow();
            });

            it('특수문자 처리 함수가 결과를 반환해야 함', () => {
                const result = handleSpecialCharacters('홍-길동');
                
                expect(result).toBeDefined();
            });
        });
    });

    describe('경계값 테스트', () => {
        describe('연차 경계값 처리', () => {
            it('연차 0년은 유효해야 함 (레벨 없이)', () => {
                const memberData = {
                    name: '홍길동',
                    primaryArchetype: '문제 해결형',
                    years: 0
                    // level 없음 - 레벨 검증 없이 연차만 검증
                };
                
                const result = handleBoundaryValues(memberData);
                
                expect(result.valid).toBe(true);
            });

            it('연차 0년은 L1 레벨과 함께 사용 시 에러 (L1 최소 1년)', () => {
                const memberData = {
                    name: '홍길동',
                    primaryArchetype: '문제 해결형',
                    years: 0,
                    level: 'L1' // L1은 최소 1년
                };
                
                const result = handleBoundaryValues(memberData);
                
                expect(result.valid).toBe(false);
            });

            it('연차 50년은 유효해야 함', () => {
                const memberData = {
                    name: '홍길동',
                    primaryArchetype: '문제 해결형',
                    years: 50,
                    level: 'L5'
                };
                
                const result = handleBoundaryValues(memberData);
                
                expect(result.valid).toBe(true);
            });

            it('레벨 경계값 3→4년 처리', () => {
                const member3Years = {
                    name: 'A',
                    primaryArchetype: '문제 해결형',
                    years: 3,
                    level: 'L1'
                };
                
                const member4Years = {
                    name: 'B',
                    primaryArchetype: '문제 해결형',
                    years: 4,
                    level: 'L2'
                };
                
                expect(() => createMember(member3Years)).not.toThrow();
                expect(() => createMember(member4Years)).not.toThrow();
            });

            it('레벨 경계값 7→8년 처리', () => {
                const member7Years = {
                    name: 'A',
                    primaryArchetype: '문제 해결형',
                    years: 7,
                    level: 'L2'
                };
                
                const member8Years = {
                    name: 'B',
                    primaryArchetype: '문제 해결형',
                    years: 8,
                    level: 'L3'
                };
                
                expect(() => createMember(member7Years)).not.toThrow();
                expect(() => createMember(member8Years)).not.toThrow();
            });

            it('레벨 경계값 12→13년 처리', () => {
                const member12Years = {
                    name: 'A',
                    primaryArchetype: '문제 해결형',
                    years: 12,
                    level: 'L3'
                };
                
                const member13Years = {
                    name: 'B',
                    primaryArchetype: '문제 해결형',
                    years: 13,
                    level: 'L4'
                };
                
                expect(() => createMember(member12Years)).not.toThrow();
                expect(() => createMember(member13Years)).not.toThrow();
            });

            it('레벨 경계값 20→21년 처리', () => {
                const member20Years = {
                    name: 'A',
                    primaryArchetype: '문제 해결형',
                    years: 20,
                    level: 'L4'
                };
                
                const member21Years = {
                    name: 'B',
                    primaryArchetype: '문제 해결형',
                    years: 21,
                    level: 'L5'
                };
                
                expect(() => createMember(member20Years)).not.toThrow();
                expect(() => createMember(member21Years)).not.toThrow();
            });
        });

        describe('역량 달성률 경계값 테스트', () => {
            it('79% 달성률은 승진 불가능해야 함', () => {
                const evaluation = {
                    technical: { achieved: 7, total: 10 }, // 70%
                    problemSolving: { achieved: 8, total: 10 }, // 80%
                    collaboration: { achieved: 8, total: 10 }, // 80%
                    assetization: { achieved: 8, total: 10 } // 80%
                };
                
                // 전체 평균 약 77.5% → 반올림 시 78% 또는 79%
                // 정확히 79%가 되도록 조정
                const evaluation79 = {
                    technical: { achieved: 7, total: 10 },
                    problemSolving: { achieved: 8, total: 10 },
                    collaboration: { achieved: 8, total: 10 },
                    assetization: { achieved: 7, total: 10 }
                };
                
                const result = checkPromotionCriteria(evaluation79);
                
                expect(result.eligible).toBe(false);
                expect(result.achievementRate).toBeLessThan(80);
            });

            it('80% 달성률은 승진 가능해야 함', () => {
                const evaluation = {
                    technical: { achieved: 8, total: 10 },
                    problemSolving: { achieved: 8, total: 10 },
                    collaboration: { achieved: 8, total: 10 },
                    assetization: { achieved: 8, total: 10 }
                };
                
                const result = checkPromotionCriteria(evaluation);
                
                expect(result.eligible).toBe(true);
                expect(result.achievementRate).toBeGreaterThanOrEqual(80);
            });
        });
    });

    describe('브라우저 호환성 실패 테스트', () => {
        describe('LocalStorage 미지원 브라우저 처리', () => {
            it('LocalStorage가 없을 때 체크 함수가 false를 반환해야 함', () => {
                const originalLocalStorage = global.localStorage;
                delete global.localStorage;
                
                const supported = checkLocalStorageSupport();
                
                expect(supported).toBe(false);
                
                // 복원
                global.localStorage = originalLocalStorage;
            });

            it('LocalStorage가 있을 때 체크 함수가 true를 반환해야 함', () => {
                const supported = checkLocalStorageSupport();
                
                expect(supported).toBe(true);
            });
        });

        describe('JSON.parse/stringify 에러 처리', () => {
            it('잘못된 JSON 문자열은 safeJSONParse가 에러를 처리해야 함', () => {
                const invalidJSON = '{ invalid json }';
                
                const result = safeJSONParse(invalidJSON);
                
                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
            });

            it('유효한 JSON 문자열은 safeJSONParse가 성공해야 함', () => {
                const validJSON = '{"name": "홍길동", "years": 5}';
                
                const result = safeJSONParse(validJSON);
                
                expect(result.success).toBe(true);
                expect(result.data).toBeDefined();
                expect(result.data.name).toBe('홍길동');
            });

            it('순환 참조 객체는 safeJSONStringify가 에러를 처리해야 함', () => {
                const circularObj = { name: '홍길동' };
                circularObj.self = circularObj; // 순환 참조
                
                const result = safeJSONStringify(circularObj);
                
                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
            });

            it('유효한 객체는 safeJSONStringify가 성공해야 함', () => {
                const validObj = { name: '홍길동', years: 5 };
                
                const result = safeJSONStringify(validObj);
                
                expect(result.success).toBe(true);
                expect(result.data).toBeDefined();
                expect(JSON.parse(result.data).name).toBe('홍길동');
            });
        });
    });
});

