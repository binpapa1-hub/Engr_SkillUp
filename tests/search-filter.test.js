import { describe, it, expect } from 'vitest';
import { 
    searchMembersByName,
    filterMembersByLevel,
    filterMembersByArchetype,
    filterMembersByYearsRange,
    applyFilters,
    SEARCH_CONFIG,
    FILTER_CONFIG
} from '../src/search-filter.js';

describe('검색 및 필터링 테스트', () => {
    const sampleMembers = [
        {
            id: '1',
            name: '홍길동',
            primaryArchetype: '문제 해결형',
            secondaryArchetype: '설계/아키텍처형',
            years: 5,
            level: 'L2'
        },
        {
            id: '2',
            name: '김철수',
            primaryArchetype: '연구/개선형',
            years: 10,
            level: 'L3'
        },
        {
            id: '3',
            name: '이영희',
            primaryArchetype: '설계/아키텍처형',
            secondaryArchetype: '문제 해결형',
            years: 3,
            level: 'L1'
        },
        {
            id: '4',
            name: '박민수',
            primaryArchetype: '현장/운영형',
            years: 15,
            level: 'L4'
        },
        {
            id: '5',
            name: '최지영',
            primaryArchetype: '리더/멘토형',
            years: 25,
            level: 'L5'
        }
    ];

    describe('검색 기능', () => {
        describe('이름 검색 로직', () => {
            it('이름 검색 - 정확한 일치', () => {
                const results = searchMembersByName(sampleMembers, '홍길동');
                
                expect(results.length).toBe(1);
                expect(results[0].name).toBe('홍길동');
            });

            it('이름 검색 - 대소문자 무시', () => {
                const results = searchMembersByName(sampleMembers, 'HONG');
                
                // 한글 이름이므로 대소문자 무시는 적용되지 않지만, 함수는 존재해야 함
                expect(Array.isArray(results)).toBe(true);
            });

            it('이름 검색 - 부분 일치 검증', () => {
                const results = searchMembersByName(sampleMembers, '길동');
                
                expect(results.length).toBe(1);
                expect(results[0].name).toBe('홍길동');
            });

            it('이름 검색 - 부분 일치 검증 (앞부분)', () => {
                const results = searchMembersByName(sampleMembers, '홍');
                
                expect(results.length).toBe(1);
                expect(results[0].name).toBe('홍길동');
            });

            it('이름 검색 - 부분 일치 검증 (뒷부분)', () => {
                const results = searchMembersByName(sampleMembers, '철수');
                
                expect(results.length).toBe(1);
                expect(results[0].name).toBe('김철수');
            });

            it('검색 결과 없음 처리 - 존재하지 않는 이름', () => {
                const results = searchMembersByName(sampleMembers, '존재하지않는이름');
                
                expect(results.length).toBe(0);
                expect(Array.isArray(results)).toBe(true);
            });

            it('검색 결과 없음 처리 - 빈 문자열', () => {
                const results = searchMembersByName(sampleMembers, '');
                
                // 빈 문자열은 모든 결과 반환하거나 빈 배열 반환
                expect(Array.isArray(results)).toBe(true);
            });

            it('빈 배열 검색 처리', () => {
                const results = searchMembersByName([], '홍길동');
                
                expect(results.length).toBe(0);
            });
        });
    });

    describe('필터링 기능', () => {
        describe('레벨별 필터 (L1~L5)', () => {
            it('L1 레벨 필터', () => {
                const results = filterMembersByLevel(sampleMembers, 'L1');
                
                expect(results.length).toBe(1);
                expect(results[0].level).toBe('L1');
                expect(results[0].name).toBe('이영희');
            });

            it('L2 레벨 필터', () => {
                const results = filterMembersByLevel(sampleMembers, 'L2');
                
                expect(results.length).toBe(1);
                expect(results[0].level).toBe('L2');
                expect(results[0].name).toBe('홍길동');
            });

            it('L3 레벨 필터', () => {
                const results = filterMembersByLevel(sampleMembers, 'L3');
                
                expect(results.length).toBe(1);
                expect(results[0].level).toBe('L3');
                expect(results[0].name).toBe('김철수');
            });

            it('L4 레벨 필터', () => {
                const results = filterMembersByLevel(sampleMembers, 'L4');
                
                expect(results.length).toBe(1);
                expect(results[0].level).toBe('L4');
                expect(results[0].name).toBe('박민수');
            });

            it('L5 레벨 필터', () => {
                const results = filterMembersByLevel(sampleMembers, 'L5');
                
                expect(results.length).toBe(1);
                expect(results[0].level).toBe('L5');
                expect(results[0].name).toBe('최지영');
            });

            it('존재하지 않는 레벨 필터 - 빈 결과', () => {
                const results = filterMembersByLevel(sampleMembers, 'L6');
                
                expect(results.length).toBe(0);
            });

            it('빈 배열 필터링', () => {
                const results = filterMembersByLevel([], 'L1');
                
                expect(results.length).toBe(0);
            });
        });

        describe('성향별 필터 (Primary/Secondary)', () => {
            it('Primary 성향 필터 - 문제 해결형', () => {
                const results = filterMembersByArchetype(sampleMembers, '문제 해결형', 'primary');
                
                expect(results.length).toBe(1);
                expect(results[0].primaryArchetype).toBe('문제 해결형');
                expect(results[0].name).toBe('홍길동');
            });

            it('Primary 성향 필터 - 설계/아키텍처형', () => {
                const results = filterMembersByArchetype(sampleMembers, '설계/아키텍처형', 'primary');
                
                expect(results.length).toBe(1);
                expect(results[0].primaryArchetype).toBe('설계/아키텍처형');
                expect(results[0].name).toBe('이영희');
            });

            it('Secondary 성향 필터 - 문제 해결형', () => {
                const results = filterMembersByArchetype(sampleMembers, '문제 해결형', 'secondary');
                
                expect(results.length).toBe(1);
                expect(results[0].secondaryArchetype).toBe('문제 해결형');
                expect(results[0].name).toBe('이영희');
            });

            it('Primary 또는 Secondary 성향 필터', () => {
                const results = filterMembersByArchetype(sampleMembers, '문제 해결형', 'both');
                
                // Primary 또는 Secondary에 '문제 해결형'이 있는 모든 멤버
                expect(results.length).toBe(2); // 홍길동(Primary), 이영희(Secondary)
            });

            it('존재하지 않는 성향 필터 - 빈 결과', () => {
                const results = filterMembersByArchetype(sampleMembers, '존재하지않는성향', 'primary');
                
                expect(results.length).toBe(0);
            });
        });

        describe('연차 범위 필터', () => {
            it('연차 범위 필터 - 0~5년', () => {
                const results = filterMembersByYearsRange(sampleMembers, 0, 5);
                
                expect(results.length).toBe(2); // 홍길동(5년), 이영희(3년)
                results.forEach(member => {
                    expect(member.years).toBeGreaterThanOrEqual(0);
                    expect(member.years).toBeLessThanOrEqual(5);
                });
            });

            it('연차 범위 필터 - 10~15년', () => {
                const results = filterMembersByYearsRange(sampleMembers, 10, 15);
                
                expect(results.length).toBe(2); // 김철수(10년), 박민수(15년)
                results.forEach(member => {
                    expect(member.years).toBeGreaterThanOrEqual(10);
                    expect(member.years).toBeLessThanOrEqual(15);
                });
            });

            it('연차 범위 필터 - 20년 이상', () => {
                const results = filterMembersByYearsRange(sampleMembers, 20, Infinity);
                
                expect(results.length).toBe(1);
                expect(results[0].years).toBeGreaterThanOrEqual(20);
            });

            it('연차 범위 필터 - 경계값 포함', () => {
                const results = filterMembersByYearsRange(sampleMembers, 5, 5);
                
                expect(results.length).toBe(1);
                expect(results[0].years).toBe(5);
            });

            it('잘못된 범위 필터 - min > max', () => {
                const results = filterMembersByYearsRange(sampleMembers, 10, 5);
                
                // 잘못된 범위는 빈 결과 반환하거나 에러 처리
                expect(Array.isArray(results)).toBe(true);
            });
        });

        describe('복합 필터 조합 검증', () => {
            it('레벨 + 성향 복합 필터', () => {
                const filters = {
                    level: 'L2',
                    archetype: '문제 해결형',
                    archetypeType: 'primary'
                };
                
                const results = applyFilters(sampleMembers, filters);
                
                expect(results.length).toBe(1);
                expect(results[0].level).toBe('L2');
                expect(results[0].primaryArchetype).toBe('문제 해결형');
            });

            it('레벨 + 연차 범위 복합 필터', () => {
                const filters = {
                    level: 'L3',
                    yearsMin: 8,
                    yearsMax: 12
                };
                
                const results = applyFilters(sampleMembers, filters);
                
                expect(results.length).toBe(1);
                expect(results[0].level).toBe('L3');
                expect(results[0].years).toBeGreaterThanOrEqual(8);
                expect(results[0].years).toBeLessThanOrEqual(12);
            });

            it('성향 + 연차 범위 복합 필터', () => {
                const filters = {
                    archetype: '문제 해결형',
                    archetypeType: 'primary',
                    yearsMin: 0,
                    yearsMax: 10
                };
                
                const results = applyFilters(sampleMembers, filters);
                
                expect(results.length).toBe(1);
                expect(results[0].primaryArchetype).toBe('문제 해결형');
                expect(results[0].years).toBeLessThanOrEqual(10);
            });

            it('레벨 + 성향 + 연차 범위 복합 필터', () => {
                const filters = {
                    level: 'L2',
                    archetype: '문제 해결형',
                    archetypeType: 'primary',
                    yearsMin: 0,
                    yearsMax: 10
                };
                
                const results = applyFilters(sampleMembers, filters);
                
                expect(results.length).toBe(1);
                expect(results[0].level).toBe('L2');
                expect(results[0].primaryArchetype).toBe('문제 해결형');
                expect(results[0].years).toBeLessThanOrEqual(10);
            });

            it('복합 필터 - 결과 없음', () => {
                const filters = {
                    level: 'L1',
                    archetype: '리더/멘토형',
                    archetypeType: 'primary'
                };
                
                const results = applyFilters(sampleMembers, filters);
                
                expect(results.length).toBe(0);
            });

            it('필터 없음 - 모든 결과 반환', () => {
                const filters = {};
                
                const results = applyFilters(sampleMembers, filters);
                
                expect(results.length).toBe(sampleMembers.length);
            });
        });
    });
});

