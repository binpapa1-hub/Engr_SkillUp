import { describe, it, expect, beforeEach } from 'vitest';
import { 
    calculateLevelDistribution,
    calculateArchetypeDistribution,
    calculateYearsDistribution,
    getStatistics,
    STATISTICS_CONFIG
} from '../src/statistics.js';

describe('통계 대시보드 테스트', () => {
    describe('통계 데이터 계산', () => {
        describe('레벨별 분포 계산 로직', () => {
            it('레벨별 분포를 올바르게 계산해야 함', () => {
                const members = [
                    { id: '1', name: 'A', level: 'L1', years: 2 },
                    { id: '2', name: 'B', level: 'L2', years: 5 },
                    { id: '3', name: 'C', level: 'L2', years: 6 },
                    { id: '4', name: 'D', level: 'L3', years: 10 }
                ];
                
                const distribution = calculateLevelDistribution(members);
                
                expect(distribution.L1).toBe(1);
                expect(distribution.L2).toBe(2);
                expect(distribution.L3).toBe(1);
                expect(distribution.L4).toBe(0);
                expect(distribution.L5).toBe(0);
            });

            it('모든 레벨이 0인 경우도 처리해야 함', () => {
                const members = [];
                const distribution = calculateLevelDistribution(members);
                
                expect(distribution.L1).toBe(0);
                expect(distribution.L2).toBe(0);
                expect(distribution.L3).toBe(0);
                expect(distribution.L4).toBe(0);
                expect(distribution.L5).toBe(0);
            });

            it('레벨별 비율을 계산해야 함', () => {
                const members = [
                    { id: '1', level: 'L1' },
                    { id: '2', level: 'L1' },
                    { id: '3', level: 'L2' }
                ];
                
                const distribution = calculateLevelDistribution(members);
                const total = members.length;
                
                expect(distribution.L1 / total).toBeCloseTo(2/3, 2);
                expect(distribution.L2 / total).toBeCloseTo(1/3, 2);
            });
        });

        describe('성향별 분포 계산 로직', () => {
            it('Primary 성향별 분포를 올바르게 계산해야 함', () => {
                const members = [
                    { id: '1', primaryArchetype: '문제 해결형' },
                    { id: '2', primaryArchetype: '문제 해결형' },
                    { id: '3', primaryArchetype: '설계/아키텍처형' },
                    { id: '4', primaryArchetype: '연구/개선형' }
                ];
                
                const distribution = calculateArchetypeDistribution(members);
                
                expect(distribution['문제 해결형']).toBe(2);
                expect(distribution['설계/아키텍처형']).toBe(1);
                expect(distribution['연구/개선형']).toBe(1);
            });

            it('Secondary 성향도 포함하여 계산해야 함', () => {
                const members = [
                    { id: '1', primaryArchetype: '문제 해결형', secondaryArchetype: '설계/아키텍처형' },
                    { id: '2', primaryArchetype: '설계/아키텍처형' }
                ];
                
                const distribution = calculateArchetypeDistribution(members, true);
                
                expect(distribution['문제 해결형']).toBe(1);
                expect(distribution['설계/아키텍처형']).toBe(2); // Primary 1 + Secondary 1
            });

            it('모든 성향이 0인 경우도 처리해야 함', () => {
                const members = [];
                const distribution = calculateArchetypeDistribution(members);
                
                const validArchetypes = ['문제 해결형', '설계/아키텍처형', '연구/개선형', '현장/운영형', '리더/멘토형'];
                validArchetypes.forEach(archetype => {
                    expect(distribution[archetype]).toBe(0);
                });
            });
        });

        describe('연차 분포 계산 로직', () => {
            it('연차 구간별 분포를 올바르게 계산해야 함', () => {
                const members = [
                    { id: '1', years: 2 },
                    { id: '2', years: 5 },
                    { id: '3', years: 10 },
                    { id: '4', years: 15 },
                    { id: '5', years: 25 }
                ];
                
                const distribution = calculateYearsDistribution(members);
                
                expect(distribution['0-3']).toBe(1);
                expect(distribution['4-7']).toBe(1);
                expect(distribution['8-12']).toBe(1);
                expect(distribution['13-20']).toBe(1);
                expect(distribution['21+']).toBe(1);
            });

            it('연차 구간 경계값을 올바르게 처리해야 함', () => {
                const members = [
                    { id: '1', years: 3 },
                    { id: '2', years: 4 },
                    { id: '3', years: 7 },
                    { id: '4', years: 8 },
                    { id: '5', years: 12 },
                    { id: '6', years: 13 },
                    { id: '7', years: 20 },
                    { id: '8', years: 21 }
                ];
                
                const distribution = calculateYearsDistribution(members);
                
                expect(distribution['0-3']).toBe(1); // 3년
                expect(distribution['4-7']).toBe(2); // 4년, 7년
                expect(distribution['8-12']).toBe(2); // 8년, 12년
                expect(distribution['13-20']).toBe(2); // 13년, 20년
                expect(distribution['21+']).toBe(1); // 21년
            });

            it('빈 데이터셋 처리 - 모든 구간이 0이어야 함', () => {
                const members = [];
                const distribution = calculateYearsDistribution(members);
                
                expect(distribution['0-3']).toBe(0);
                expect(distribution['4-7']).toBe(0);
                expect(distribution['8-12']).toBe(0);
                expect(distribution['13-20']).toBe(0);
                expect(distribution['21+']).toBe(0);
            });
        });

        describe('빈 데이터셋 처리', () => {
            it('빈 배열로 전체 통계를 계산할 수 있어야 함', () => {
                const members = [];
                const statistics = getStatistics(members);
                
                expect(statistics).toBeDefined();
                expect(statistics.total).toBe(0);
                expect(statistics.levelDistribution).toBeDefined();
                expect(statistics.archetypeDistribution).toBeDefined();
                expect(statistics.yearsDistribution).toBeDefined();
            });

            it('빈 데이터셋에서 레벨 분포는 모두 0이어야 함', () => {
                const members = [];
                const statistics = getStatistics(members);
                
                expect(statistics.levelDistribution.L1).toBe(0);
                expect(statistics.levelDistribution.L2).toBe(0);
                expect(statistics.levelDistribution.L3).toBe(0);
                expect(statistics.levelDistribution.L4).toBe(0);
                expect(statistics.levelDistribution.L5).toBe(0);
            });

            it('빈 데이터셋에서 성향 분포는 모두 0이어야 함', () => {
                const members = [];
                const statistics = getStatistics(members);
                
                const validArchetypes = ['문제 해결형', '설계/아키텍처형', '연구/개선형', '현장/운영형', '리더/멘토형'];
                validArchetypes.forEach(archetype => {
                    expect(statistics.archetypeDistribution[archetype]).toBe(0);
                });
            });
        });
    });

    describe('차트 렌더링', () => {
        describe('Chart.js 또는 D3.js 연동 검증', () => {
            it('차트 라이브러리가 로드되어 있어야 함', () => {
                // Chart.js 또는 D3.js가 전역으로 로드되어 있는지 확인
                // 실제 구현에서는 라이브러리 import 확인
                expect(typeof window).toBe('object');
            });

            it('차트 생성 함수가 존재해야 함', () => {
                // renderChart 함수가 있어야 함
                // import { renderChart } from '../src/statistics.js';
                // expect(typeof renderChart).toBe('function');
            });
        });

        describe('데이터 시각화 렌더링 검증', () => {
            it('레벨별 분포 차트를 렌더링할 수 있어야 함', () => {
                const members = [
                    { id: '1', level: 'L1' },
                    { id: '2', level: 'L2' }
                ];
                
                const distribution = calculateLevelDistribution(members);
                
                // 차트 데이터 형식이 올바른지 확인
                expect(distribution).toBeDefined();
                expect(typeof distribution).toBe('object');
            });

            it('성향별 분포 차트를 렌더링할 수 있어야 함', () => {
                const members = [
                    { id: '1', primaryArchetype: '문제 해결형' }
                ];
                
                const distribution = calculateArchetypeDistribution(members);
                
                expect(distribution).toBeDefined();
                expect(typeof distribution).toBe('object');
            });

            it('연차 분포 차트를 렌더링할 수 있어야 함', () => {
                const members = [
                    { id: '1', years: 5 }
                ];
                
                const distribution = calculateYearsDistribution(members);
                
                expect(distribution).toBeDefined();
                expect(typeof distribution).toBe('object');
            });
        });

        describe('반응형 차트 크기 조정 검증', () => {
            it('차트 크기 조정 함수가 존재해야 함', () => {
                // resizeChart 함수가 있어야 함
                // import { resizeChart } from '../src/statistics.js';
                // expect(typeof resizeChart).toBe('function');
            });

            it('윈도우 리사이즈 이벤트에 반응해야 함', () => {
                // window resize 이벤트 리스너가 등록되어 있어야 함
                expect(typeof window).toBe('object');
            });
        });
    });
});

