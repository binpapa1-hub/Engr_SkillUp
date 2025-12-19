import { describe, it, expect } from 'vitest';
import { 
    getCapabilityMatrix,
    calculateCapabilityAchievement,
    checkPromotionCriteria,
    calculateEvaluationScore,
    saveEvaluationResult,
    getEvaluationResult,
    EVALUATION_WEIGHTS,
    PROMOTION_THRESHOLD
} from '../src/evaluation.js';

describe('역량 평가 시스템 테스트', () => {
    describe('역량 매트릭스', () => {
        describe('레벨별 역량 체크리스트 데이터 구조 검증', () => {
            it('L1 레벨의 역량 매트릭스를 가져올 수 있어야 함', () => {
                const matrix = getCapabilityMatrix('L1');
                
                expect(matrix).toBeDefined();
                expect(matrix.level).toBe('L1');
                expect(matrix.capabilities).toBeDefined();
                expect(typeof matrix.capabilities).toBe('object');
            });

            it('L2 레벨의 역량 매트릭스를 가져올 수 있어야 함', () => {
                const matrix = getCapabilityMatrix('L2');
                
                expect(matrix).toBeDefined();
                expect(matrix.level).toBe('L2');
            });

            it('L3 레벨의 역량 매트릭스를 가져올 수 있어야 함', () => {
                const matrix = getCapabilityMatrix('L3');
                
                expect(matrix).toBeDefined();
                expect(matrix.level).toBe('L3');
            });

            it('L4 레벨의 역량 매트릭스를 가져올 수 있어야 함', () => {
                const matrix = getCapabilityMatrix('L4');
                
                expect(matrix).toBeDefined();
                expect(matrix.level).toBe('L4');
            });

            it('L5 레벨의 역량 매트릭스를 가져올 수 있어야 함', () => {
                const matrix = getCapabilityMatrix('L5');
                
                expect(matrix).toBeDefined();
                expect(matrix.level).toBe('L5');
            });

            it('역량 매트릭스에 4개 카테고리가 있어야 함', () => {
                const matrix = getCapabilityMatrix('L2');
                
                expect(matrix.capabilities).toBeDefined();
                expect(typeof matrix.capabilities).toBe('object');
                expect(matrix.capabilities).toHaveProperty('technical');
                expect(matrix.capabilities).toHaveProperty('problemSolving');
                expect(matrix.capabilities).toHaveProperty('collaboration');
                expect(matrix.capabilities).toHaveProperty('assetization');
            });

            it('잘못된 레벨은 에러를 발생시켜야 함', () => {
                expect(() => {
                    getCapabilityMatrix('L6');
                }).toThrow();
            });
        });

        describe('역량 달성률 계산 로직', () => {
            const sampleEvaluation = {
                technical: { achieved: 8, total: 10 },
                problemSolving: { achieved: 6, total: 8 },
                collaboration: { achieved: 4, total: 5 },
                assetization: { achieved: 3, total: 4 }
            };

            it('기술 역량 달성률을 계산해야 함', () => {
                const achievement = calculateCapabilityAchievement(sampleEvaluation, 'technical');
                
                expect(achievement).toBeDefined();
                expect(achievement.percentage).toBe(80); // 8/10 * 100
            });

            it('문제해결 역량 달성률을 계산해야 함', () => {
                const achievement = calculateCapabilityAchievement(sampleEvaluation, 'problemSolving');
                
                expect(achievement.percentage).toBe(75); // 6/8 * 100
            });

            it('협업 역량 달성률을 계산해야 함', () => {
                const achievement = calculateCapabilityAchievement(sampleEvaluation, 'collaboration');
                
                expect(achievement.percentage).toBe(80); // 4/5 * 100
            });

            it('자산화 역량 달성률을 계산해야 함', () => {
                const achievement = calculateCapabilityAchievement(sampleEvaluation, 'assetization');
                
                expect(achievement.percentage).toBe(75); // 3/4 * 100
            });

            it('전체 역량 달성률을 계산해야 함', () => {
                const achievement = calculateCapabilityAchievement(sampleEvaluation, 'all');
                
                expect(achievement).toBeDefined();
                expect(achievement.percentage).toBeGreaterThan(0);
                expect(achievement.percentage).toBeLessThanOrEqual(100);
            });

            it('빈 평가 데이터는 0% 달성률을 반환해야 함', () => {
                const emptyEvaluation = {
                    technical: { achieved: 0, total: 10 },
                    problemSolving: { achieved: 0, total: 8 },
                    collaboration: { achieved: 0, total: 5 },
                    assetization: { achieved: 0, total: 4 }
                };
                
                const achievement = calculateCapabilityAchievement(emptyEvaluation, 'all');
                
                expect(achievement.percentage).toBe(0);
            });

            it('100% 달성률을 계산할 수 있어야 함', () => {
                const perfectEvaluation = {
                    technical: { achieved: 10, total: 10 },
                    problemSolving: { achieved: 8, total: 8 },
                    collaboration: { achieved: 5, total: 5 },
                    assetization: { achieved: 4, total: 4 }
                };
                
                const achievement = calculateCapabilityAchievement(perfectEvaluation, 'all');
                
                expect(achievement.percentage).toBe(100);
            });
        });

        describe('승진 기준 판단 로직 (80% 이상 충족)', () => {
            it('80% 이상 달성 시 승진 가능해야 함', () => {
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

            it('79% 달성 시 승진 불가능해야 함', () => {
                const evaluation = {
                    technical: { achieved: 7, total: 10 },
                    problemSolving: { achieved: 8, total: 10 },
                    collaboration: { achieved: 8, total: 10 },
                    assetization: { achieved: 8, total: 10 }
                };
                
                const result = checkPromotionCriteria(evaluation);
                
                expect(result.eligible).toBe(false);
                expect(result.achievementRate).toBeLessThan(80);
            });

            it('정확히 80% 달성 시 승진 가능해야 함', () => {
                const evaluation = {
                    technical: { achieved: 8, total: 10 },
                    problemSolving: { achieved: 8, total: 10 },
                    collaboration: { achieved: 8, total: 10 },
                    assetization: { achieved: 8, total: 10 }
                };
                
                const result = checkPromotionCriteria(evaluation);
                
                expect(result.eligible).toBe(true);
                expect(result.achievementRate).toBe(80);
            });

            it('100% 달성 시 승진 가능해야 함', () => {
                const evaluation = {
                    technical: { achieved: 10, total: 10 },
                    problemSolving: { achieved: 10, total: 10 },
                    collaboration: { achieved: 10, total: 10 },
                    assetization: { achieved: 10, total: 10 }
                };
                
                const result = checkPromotionCriteria(evaluation);
                
                expect(result.eligible).toBe(true);
                expect(result.achievementRate).toBe(100);
            });
        });
    });

    describe('평가 시스템', () => {
        describe('평가 항목별 가중치 적용', () => {
            it('기술 역량 가중치 40% 적용 검증', () => {
                const evaluation = {
                    technical: 80,
                    problemSolving: 0,
                    collaboration: 0,
                    assetization: 0
                };
                
                const score = calculateEvaluationScore(evaluation);
                
                // 기술 역량 80점 * 40% = 32점
                expect(score.technicalScore).toBe(32);
            });

            it('문제 해결 가중치 25% 적용 검증', () => {
                const evaluation = {
                    technical: 0,
                    problemSolving: 80,
                    collaboration: 0,
                    assetization: 0
                };
                
                const score = calculateEvaluationScore(evaluation);
                
                // 문제 해결 80점 * 25% = 20점
                expect(score.problemSolvingScore).toBe(20);
            });

            it('협업/리더십 가중치 20% 적용 검증', () => {
                const evaluation = {
                    technical: 0,
                    problemSolving: 0,
                    collaboration: 80,
                    assetization: 0
                };
                
                const score = calculateEvaluationScore(evaluation);
                
                // 협업/리더십 80점 * 20% = 16점
                expect(score.collaborationScore).toBe(16);
            });

            it('기술 자산화 가중치 15% 적용 검증', () => {
                const evaluation = {
                    technical: 0,
                    problemSolving: 0,
                    collaboration: 0,
                    assetization: 80
                };
                
                const score = calculateEvaluationScore(evaluation);
                
                // 기술 자산화 80점 * 15% = 12점
                expect(score.assetizationScore).toBe(12);
            });

            it('모든 가중치의 합이 100%여야 함', () => {
                const totalWeight = 
                    EVALUATION_WEIGHTS.technical +
                    EVALUATION_WEIGHTS.problemSolving +
                    EVALUATION_WEIGHTS.collaboration +
                    EVALUATION_WEIGHTS.assetization;
                
                expect(totalWeight).toBe(100);
            });
        });

        describe('종합 점수 계산 로직', () => {
            it('모든 항목의 가중치 점수를 합산해야 함', () => {
                const evaluation = {
                    technical: 80,
                    problemSolving: 80,
                    collaboration: 80,
                    assetization: 80
                };
                
                const score = calculateEvaluationScore(evaluation);
                
                // 80 * 0.4 + 80 * 0.25 + 80 * 0.2 + 80 * 0.15 = 32 + 20 + 16 + 12 = 80
                expect(score.totalScore).toBe(80);
            });

            it('부분 점수도 올바르게 계산되어야 함', () => {
                const evaluation = {
                    technical: 100,
                    problemSolving: 50,
                    collaboration: 75,
                    assetization: 60
                };
                
                const score = calculateEvaluationScore(evaluation);
                
                // 100 * 0.4 + 50 * 0.25 + 75 * 0.2 + 60 * 0.15 = 40 + 12.5 + 15 + 9 = 76.5
                // 반올림으로 77이 될 수 있음
                expect(score.totalScore).toBeGreaterThanOrEqual(76);
                expect(score.totalScore).toBeLessThanOrEqual(77);
            });

            it('0점 평가도 처리할 수 있어야 함', () => {
                const evaluation = {
                    technical: 0,
                    problemSolving: 0,
                    collaboration: 0,
                    assetization: 0
                };
                
                const score = calculateEvaluationScore(evaluation);
                
                expect(score.totalScore).toBe(0);
            });

            it('100점 만점 평가를 처리할 수 있어야 함', () => {
                const evaluation = {
                    technical: 100,
                    problemSolving: 100,
                    collaboration: 100,
                    assetization: 100
                };
                
                const score = calculateEvaluationScore(evaluation);
                
                expect(score.totalScore).toBe(100);
            });
        });

        describe('평가 결과 저장 및 조회', () => {
            it('평가 결과를 저장할 수 있어야 함', () => {
                const memberId = 'test-member-1';
                const evaluation = {
                    technical: 80,
                    problemSolving: 75,
                    collaboration: 85,
                    assetization: 70
                };
                
                const result = saveEvaluationResult(memberId, evaluation);
                
                expect(result).toBeDefined();
                expect(result.memberId).toBe(memberId);
            });

            it('저장된 평가 결과를 조회할 수 있어야 함', () => {
                const memberId = 'test-member-1';
                const evaluation = {
                    technical: 80,
                    problemSolving: 75,
                    collaboration: 85,
                    assetization: 70
                };
                
                saveEvaluationResult(memberId, evaluation);
                const retrieved = getEvaluationResult(memberId);
                
                expect(retrieved).toBeDefined();
                expect(retrieved.memberId).toBe(memberId);
                expect(retrieved.evaluation.technical).toBe(80);
            });

            it('존재하지 않는 평가 결과는 null을 반환해야 함', () => {
                const result = getEvaluationResult('non-existent-id');
                
                expect(result).toBeNull();
            });

            it('평가 결과에 타임스탬프가 포함되어야 함', () => {
                const memberId = 'test-member-2';
                const evaluation = {
                    technical: 80,
                    problemSolving: 75,
                    collaboration: 85,
                    assetization: 70
                };
                
                const result = saveEvaluationResult(memberId, evaluation);
                
                expect(result.timestamp).toBeDefined();
                expect(typeof result.timestamp).toBe('number');
            });
        });
    });
});

