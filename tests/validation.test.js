import { describe, it, expect } from 'vitest';
import { 
    validateLevel, 
    validateLevelYearsRange, 
    validateArchetype, 
    validateArchetypeCombination,
    getLevelByYears,
    VALID_LEVELS,
    VALID_ARCHETYPES,
    LEVEL_YEARS_RANGES
} from '../src/validation.js';

describe('레벨 및 성향 검증 로직 테스트', () => {
    describe('레벨(L1~L5) 검증', () => {
        describe('레벨별 연차 범위 검증', () => {
            it('L1: 1~3년 범위 검증 - 1년은 유효해야 함', () => {
                const result = validateLevelYearsRange('L1', 1);
                expect(result.valid).toBe(true);
            });

            it('L1: 1~3년 범위 검증 - 3년은 유효해야 함', () => {
                const result = validateLevelYearsRange('L1', 3);
                expect(result.valid).toBe(true);
            });

            it('L1: 1~3년 범위 검증 - 0년은 유효하지 않아야 함', () => {
                const result = validateLevelYearsRange('L1', 0);
                expect(result.valid).toBe(false);
            });

            it('L1: 1~3년 범위 검증 - 4년은 유효하지 않아야 함', () => {
                const result = validateLevelYearsRange('L1', 4);
                expect(result.valid).toBe(false);
            });

            it('L2: 4~7년 범위 검증 - 4년은 유효해야 함', () => {
                const result = validateLevelYearsRange('L2', 4);
                expect(result.valid).toBe(true);
            });

            it('L2: 4~7년 범위 검증 - 7년은 유효해야 함', () => {
                const result = validateLevelYearsRange('L2', 7);
                expect(result.valid).toBe(true);
            });

            it('L2: 4~7년 범위 검증 - 3년은 유효하지 않아야 함', () => {
                const result = validateLevelYearsRange('L2', 3);
                expect(result.valid).toBe(false);
            });

            it('L2: 4~7년 범위 검증 - 8년은 유효하지 않아야 함', () => {
                const result = validateLevelYearsRange('L2', 8);
                expect(result.valid).toBe(false);
            });

            it('L3: 8~12년 범위 검증 - 8년은 유효해야 함', () => {
                const result = validateLevelYearsRange('L3', 8);
                expect(result.valid).toBe(true);
            });

            it('L3: 8~12년 범위 검증 - 12년은 유효해야 함', () => {
                const result = validateLevelYearsRange('L3', 12);
                expect(result.valid).toBe(true);
            });

            it('L3: 8~12년 범위 검증 - 7년은 유효하지 않아야 함', () => {
                const result = validateLevelYearsRange('L3', 7);
                expect(result.valid).toBe(false);
            });

            it('L3: 8~12년 범위 검증 - 13년은 유효하지 않아야 함', () => {
                const result = validateLevelYearsRange('L3', 13);
                expect(result.valid).toBe(false);
            });

            it('L4: 13~20년 범위 검증 - 13년은 유효해야 함', () => {
                const result = validateLevelYearsRange('L4', 13);
                expect(result.valid).toBe(true);
            });

            it('L4: 13~20년 범위 검증 - 20년은 유효해야 함', () => {
                const result = validateLevelYearsRange('L4', 20);
                expect(result.valid).toBe(true);
            });

            it('L4: 13~20년 범위 검증 - 12년은 유효하지 않아야 함', () => {
                const result = validateLevelYearsRange('L4', 12);
                expect(result.valid).toBe(false);
            });

            it('L4: 13~20년 범위 검증 - 21년은 유효하지 않아야 함', () => {
                const result = validateLevelYearsRange('L4', 21);
                expect(result.valid).toBe(false);
            });

            it('L5: 20년+ 범위 검증 - 20년은 유효하지 않아야 함 (L4 범위)', () => {
                const result = validateLevelYearsRange('L5', 20);
                expect(result.valid).toBe(false);
            });

            it('L5: 20년+ 범위 검증 - 21년은 유효해야 함', () => {
                const result = validateLevelYearsRange('L5', 21);
                expect(result.valid).toBe(true);
            });

            it('L5: 20년+ 범위 검증 - 30년은 유효해야 함', () => {
                const result = validateLevelYearsRange('L5', 30);
                expect(result.valid).toBe(true);
            });

            it('L5: 20년+ 범위 검증 - 19년은 유효하지 않아야 함', () => {
                const result = validateLevelYearsRange('L5', 19);
                expect(result.valid).toBe(false);
            });
        });

        describe('레벨 경계값 테스트', () => {
            it('경계값 3년/4년 - 3년은 L1이어야 함', () => {
                const level = getLevelByYears(3);
                expect(level).toBe('L1');
            });

            it('경계값 3년/4년 - 4년은 L2여야 함', () => {
                const level = getLevelByYears(4);
                expect(level).toBe('L2');
            });

            it('경계값 7년/8년 - 7년은 L2여야 함', () => {
                const level = getLevelByYears(7);
                expect(level).toBe('L2');
            });

            it('경계값 7년/8년 - 8년은 L3이어야 함', () => {
                const level = getLevelByYears(8);
                expect(level).toBe('L3');
            });

            it('경계값 12년/13년 - 12년은 L3이어야 함', () => {
                const level = getLevelByYears(12);
                expect(level).toBe('L3');
            });

            it('경계값 12년/13년 - 13년은 L4여야 함', () => {
                const level = getLevelByYears(13);
                expect(level).toBe('L4');
            });

            it('경계값 20년/21년 - 20년은 L4여야 함', () => {
                const level = getLevelByYears(20);
                expect(level).toBe('L4');
            });

            it('경계값 20년/21년 - 21년은 L5여야 함', () => {
                const level = getLevelByYears(21);
                expect(level).toBe('L5');
            });
        });

        describe('잘못된 레벨 값 처리', () => {
            it('L6는 유효하지 않아야 함', () => {
                const result = validateLevel('L6');
                expect(result.valid).toBe(false);
            });

            it('빈 문자열은 유효하지 않아야 함', () => {
                const result = validateLevel('');
                expect(result.valid).toBe(false);
            });

            it('null은 유효하지 않아야 함', () => {
                const result = validateLevel(null);
                expect(result.valid).toBe(false);
            });

            it('undefined는 유효하지 않아야 함', () => {
                const result = validateLevel(undefined);
                expect(result.valid).toBe(false);
            });
        });
    });

    describe('성향(Archetype) 검증', () => {
        describe('5가지 성향 타입 검증', () => {
            it('🔧 문제 해결형은 유효해야 함', () => {
                const result = validateArchetype('문제 해결형');
                expect(result.valid).toBe(true);
            });

            it('🏗️ 설계/아키텍처형은 유효해야 함', () => {
                const result = validateArchetype('설계/아키텍처형');
                expect(result.valid).toBe(true);
            });

            it('🔬 연구/개선형은 유효해야 함', () => {
                const result = validateArchetype('연구/개선형');
                expect(result.valid).toBe(true);
            });

            it('⚙️ 현장/운영형은 유효해야 함', () => {
                const result = validateArchetype('현장/운영형');
                expect(result.valid).toBe(true);
            });

            it('👥 리더/멘토형은 유효해야 함', () => {
                const result = validateArchetype('리더/멘토형');
                expect(result.valid).toBe(true);
            });
        });

        describe('Primary/Secondary 동일 성향 선택 방지 검증', () => {
            it('Primary와 Secondary가 동일하면 유효하지 않아야 함', () => {
                const result = validateArchetypeCombination('문제 해결형', '문제 해결형');
                expect(result.valid).toBe(false);
                expect(result.errors).toContain('주요 성향과 보조 성향은 동일할 수 없습니다.');
            });

            it('Primary와 Secondary가 다르면 유효해야 함', () => {
                const result = validateArchetypeCombination('문제 해결형', '설계/아키텍처형');
                expect(result.valid).toBe(true);
            });

            it('Secondary가 없으면 유효해야 함', () => {
                const result = validateArchetypeCombination('문제 해결형', '');
                expect(result.valid).toBe(true);
            });

            it('Secondary가 null이면 유효해야 함', () => {
                const result = validateArchetypeCombination('문제 해결형', null);
                expect(result.valid).toBe(true);
            });

            it('Secondary가 undefined이면 유효해야 함', () => {
                const result = validateArchetypeCombination('문제 해결형', undefined);
                expect(result.valid).toBe(true);
            });
        });

        describe('잘못된 성향 값 처리', () => {
            it('존재하지 않는 성향은 유효하지 않아야 함', () => {
                const result = validateArchetype('존재하지 않는 성향');
                expect(result.valid).toBe(false);
            });

            it('빈 문자열은 유효하지 않아야 함', () => {
                const result = validateArchetype('');
                expect(result.valid).toBe(false);
            });

            it('null은 유효하지 않아야 함', () => {
                const result = validateArchetype(null);
                expect(result.valid).toBe(false);
            });

            it('undefined는 유효하지 않아야 함', () => {
                const result = validateArchetype(undefined);
                expect(result.valid).toBe(false);
            });
        });
    });
});

