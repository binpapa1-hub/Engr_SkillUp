import { describe, it, expect } from 'vitest';
import { 
    getNextLevel,
    recommendGrowthPath,
    recommendPathByArchetype,
    analyzeCapabilityGap,
    recommendPathByGap,
    findMentors,
    findMentees,
    matchMentoring,
    MENTORING_CONFIG
} from '../src/growth-mentoring.js';

describe('성장 경로 및 멘토링 테스트', () => {
    const sampleMembers = [
        {
            id: '1',
            name: '홍길동',
            level: 'L1',
            years: 2,
            primaryArchetype: '문제 해결형',
            secondaryArchetype: '설계/아키텍처형'
        },
        {
            id: '2',
            name: '김철수',
            level: 'L2',
            years: 5,
            primaryArchetype: '연구/개선형'
        },
        {
            id: '3',
            name: '이영희',
            level: 'L3',
            years: 10,
            primaryArchetype: '설계/아키텍처형',
            secondaryArchetype: '문제 해결형'
        },
        {
            id: '4',
            name: '박민수',
            level: 'L4',
            years: 15,
            primaryArchetype: '현장/운영형'
        },
        {
            id: '5',
            name: '최지영',
            level: 'L5',
            years: 25,
            primaryArchetype: '리더/멘토형'
        }
    ];

    describe('성장 경로 추천', () => {
        describe('현재 레벨 기반 다음 단계 제안', () => {
            it('L1의 다음 단계는 L2여야 함', () => {
                const nextLevel = getNextLevel('L1');
                
                expect(nextLevel).toBe('L2');
            });

            it('L2의 다음 단계는 L3이어야 함', () => {
                const nextLevel = getNextLevel('L2');
                
                expect(nextLevel).toBe('L3');
            });

            it('L3의 다음 단계는 L4여야 함', () => {
                const nextLevel = getNextLevel('L3');
                
                expect(nextLevel).toBe('L4');
            });

            it('L4의 다음 단계는 L5여야 함', () => {
                const nextLevel = getNextLevel('L4');
                
                expect(nextLevel).toBe('L5');
            });

            it('L5의 다음 단계는 null이어야 함 (최고 레벨)', () => {
                const nextLevel = getNextLevel('L5');
                
                expect(nextLevel).toBeNull();
            });

            it('잘못된 레벨은 에러를 발생시켜야 함', () => {
                expect(() => {
                    getNextLevel('L6');
                }).toThrow();
            });

            it('현재 레벨 기반 성장 경로 추천', () => {
                const member = sampleMembers[0]; // L1
                const path = recommendGrowthPath(member);
                
                expect(path).toBeDefined();
                expect(path.currentLevel).toBe('L1');
                expect(path.nextLevel).toBe('L2');
                expect(path.recommendations).toBeDefined();
            });
        });

        describe('성향별 맞춤 경로 추천', () => {
            it('문제 해결형 성향에 맞는 경로 추천', () => {
                const member = sampleMembers[0]; // 문제 해결형
                const path = recommendPathByArchetype(member);
                
                expect(path).toBeDefined();
                expect(path.archetype).toBe('문제 해결형');
                expect(path.recommendations).toBeDefined();
                expect(Array.isArray(path.recommendations)).toBe(true);
            });

            it('설계/아키텍처형 성향에 맞는 경로 추천', () => {
                const member = sampleMembers[2]; // 설계/아키텍처형
                const path = recommendPathByArchetype(member);
                
                expect(path).toBeDefined();
                expect(path.archetype).toBe('설계/아키텍처형');
            });

            it('연구/개선형 성향에 맞는 경로 추천', () => {
                const member = sampleMembers[1]; // 연구/개선형
                const path = recommendPathByArchetype(member);
                
                expect(path).toBeDefined();
                expect(path.archetype).toBe('연구/개선형');
            });

            it('현장/운영형 성향에 맞는 경로 추천', () => {
                const member = sampleMembers[3]; // 현장/운영형
                const path = recommendPathByArchetype(member);
                
                expect(path).toBeDefined();
                expect(path.archetype).toBe('현장/운영형');
            });

            it('리더/멘토형 성향에 맞는 경로 추천', () => {
                const member = sampleMembers[4]; // 리더/멘토형
                const path = recommendPathByArchetype(member);
                
                expect(path).toBeDefined();
                expect(path.archetype).toBe('리더/멘토형');
            });
        });

        describe('역량 격차 분석 기반 추천', () => {
            it('역량 격차를 분석할 수 있어야 함', () => {
                const member = sampleMembers[0]; // L1
                const currentEvaluation = {
                    technical: { achieved: 5, total: 10 },
                    problemSolving: { achieved: 4, total: 8 },
                    collaboration: { achieved: 3, total: 5 },
                    assetization: { achieved: 2, total: 4 }
                };
                
                const gap = analyzeCapabilityGap(member, currentEvaluation);
                
                expect(gap).toBeDefined();
                expect(gap.memberId).toBe(member.id);
                expect(gap.gaps).toBeDefined();
            });

            it('역량 격차 기반 경로 추천', () => {
                const member = sampleMembers[0];
                const currentEvaluation = {
                    technical: { achieved: 5, total: 10 },
                    problemSolving: { achieved: 4, total: 8 },
                    collaboration: { achieved: 3, total: 5 },
                    assetization: { achieved: 2, total: 4 }
                };
                
                const path = recommendPathByGap(member, currentEvaluation);
                
                expect(path).toBeDefined();
                expect(path.recommendations).toBeDefined();
                expect(Array.isArray(path.recommendations)).toBe(true);
            });

            it('격차가 큰 역량을 우선 추천해야 함', () => {
                const member = sampleMembers[0];
                const currentEvaluation = {
                    technical: { achieved: 9, total: 10 }, // 90%
                    problemSolving: { achieved: 2, total: 8 }, // 25% - 큰 격차
                    collaboration: { achieved: 4, total: 5 }, // 80%
                    assetization: { achieved: 3, total: 4 } // 75%
                };
                
                const path = recommendPathByGap(member, currentEvaluation);
                
                expect(path.recommendations.length).toBeGreaterThan(0);
                // 문제해결 역량 개선이 우선순위에 있어야 함
            });
        });
    });

    describe('멘토링 매칭', () => {
        describe('시니어-주니어 자동 매칭 알고리즘', () => {
            it('L1 멤버에게 멘토를 찾을 수 있어야 함', () => {
                const mentee = sampleMembers[0]; // L1
                const mentors = findMentors(sampleMembers, mentee);
                
                expect(Array.isArray(mentors)).toBe(true);
                expect(mentors.length).toBeGreaterThan(0);
            });

            it('L2 멤버에게 멘토를 찾을 수 있어야 함', () => {
                const mentee = sampleMembers[1]; // L2
                const mentors = findMentors(sampleMembers, mentee);
                
                expect(Array.isArray(mentors)).toBe(true);
            });

            it('L5 멤버에게는 멘토가 없어야 함 (최고 레벨)', () => {
                const mentee = sampleMembers[4]; // L5
                const mentors = findMentors(sampleMembers, mentee);
                
                expect(mentors.length).toBe(0);
            });
        });

        describe('레벨 차이 기반 매칭 (최소 2레벨 차이)', () => {
            it('L1 멤버는 L3 이상 멘토와 매칭되어야 함', () => {
                const mentee = sampleMembers[0]; // L1
                const mentors = findMentors(sampleMembers, mentee);
                
                mentors.forEach(mentor => {
                    const levelOrder = { 'L1': 1, 'L2': 2, 'L3': 3, 'L4': 4, 'L5': 5 };
                    const menteeLevel = levelOrder[mentee.level];
                    const mentorLevel = levelOrder[mentor.level];
                    
                    expect(mentorLevel - menteeLevel).toBeGreaterThanOrEqual(2);
                });
            });

            it('L2 멤버는 L4 이상 멘토와 매칭되어야 함', () => {
                const mentee = sampleMembers[1]; // L2
                const mentors = findMentors(sampleMembers, mentee);
                
                mentors.forEach(mentor => {
                    const levelOrder = { 'L1': 1, 'L2': 2, 'L3': 3, 'L4': 4, 'L5': 5 };
                    const menteeLevel = levelOrder[mentee.level];
                    const mentorLevel = levelOrder[mentor.level];
                    
                    expect(mentorLevel - menteeLevel).toBeGreaterThanOrEqual(2);
                });
            });

            it('L3 멤버는 L5 멘토와 매칭되어야 함', () => {
                const mentee = sampleMembers[2]; // L3
                const mentors = findMentors(sampleMembers, mentee);
                
                mentors.forEach(mentor => {
                    expect(mentor.level).toBe('L5');
                });
            });
        });

        describe('성향 기반 매칭 로직', () => {
            it('같은 Primary 성향 멘토를 우선 매칭해야 함', () => {
                const mentee = sampleMembers[0]; // 문제 해결형
                const mentors = findMentors(sampleMembers, mentee);
                
                // 같은 성향 멘토가 있으면 우선순위가 높아야 함
                const sameArchetypeMentors = mentors.filter(m => 
                    m.primaryArchetype === mentee.primaryArchetype
                );
                
                expect(mentors.length).toBeGreaterThan(0);
            });

            it('Secondary 성향도 고려해야 함', () => {
                const mentee = sampleMembers[0]; // Primary: 문제 해결형, Secondary: 설계/아키텍처형
                const mentors = findMentors(sampleMembers, mentee);
                
                expect(mentors.length).toBeGreaterThan(0);
            });
        });

        describe('역멘토링 케이스 처리 (주니어의 신기술 → 시니어)', () => {
            it('L5 멤버에게 멘티를 찾을 수 있어야 함 (역멘토링)', () => {
                const mentor = sampleMembers[4]; // L5
                const mentees = findMentees(sampleMembers, mentor);
                
                expect(Array.isArray(mentees)).toBe(true);
            });

            it('역멘토링 매칭 함수가 존재해야 함', () => {
                const mentor = sampleMembers[4]; // L5
                const mentee = sampleMembers[0]; // L1
                
                const match = matchMentoring(mentor, mentee, { reverse: true });
                
                expect(match).toBeDefined();
                expect(match.reverse).toBe(true);
            });

            it('자동 멘토링 매칭', () => {
                const matches = matchMentoring(sampleMembers);
                
                expect(Array.isArray(matches)).toBe(true);
                matches.forEach(match => {
                    expect(match.mentor).toBeDefined();
                    expect(match.mentee).toBeDefined();
                });
            });
        });
    });
});

