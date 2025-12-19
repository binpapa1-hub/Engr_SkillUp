/**
 * 역량 평가 시스템
 */

/**
 * 평가 가중치 설정
 */
export const EVALUATION_WEIGHTS = {
    technical: 40,        // 기술 역량: 40%
    problemSolving: 25,   // 문제 해결: 25%
    collaboration: 20,     // 협업/리더십: 20%
    assetization: 15       // 기술 자산화: 15%
};

/**
 * 승진 기준 임계값
 */
export const PROMOTION_THRESHOLD = 80; // 80% 이상

/**
 * 레벨별 역량 매트릭스 데이터
 */
const CAPABILITY_MATRIX = {
    L1: {
        level: 'L1',
        capabilities: {
            technical: [
                '기본 원리 이해',
                '기본 도구 사용',
                '코드 작성 능력'
            ],
            problemSolving: [
                '문제 재현',
                '가설 제시',
                '기본 디버깅'
            ],
            collaboration: [
                '코드 리뷰 참여',
                '문서화',
                '팀 커뮤니케이션'
            ],
            assetization: [
                '작업 내용 문서화',
                '학습 내용 정리'
            ]
        }
    },
    L2: {
        level: 'L2',
        capabilities: {
            technical: [
                '독립적 기능 구현',
                '설계 패턴 이해',
                '성능 최적화 기초'
            ],
            problemSolving: [
                'Root Cause 분석',
                '해결 방안 제시',
                '장애 대응'
            ],
            collaboration: [
                '코드 리뷰 주도',
                '기술 공유',
                '멘토링 참여'
            ],
            assetization: [
                '개선 사례 문서화',
                '기술 가이드 작성'
            ]
        }
    },
    L3: {
        level: 'L3',
        capabilities: {
            technical: [
                '시스템 단위 설계',
                '아키텍처 이해',
                '확장성 고려'
            ],
            problemSolving: [
                '구조적 문제 정의',
                '장기적 해결 방안',
                '리스크 관리'
            ],
            collaboration: [
                '기술 리더십',
                '크로스팀 협업',
                '의사결정 참여'
            ],
            assetization: [
                '기술 가이드 작성',
                '아키텍처 문서화'
            ]
        }
    },
    L4: {
        level: 'L4',
        capabilities: {
            technical: [
                '아키텍처 설계',
                '기술 전략 수립',
                '기술 부채 관리'
            ],
            problemSolving: [
                '조직 차원 문제 해결',
                '전략적 의사결정',
                '복잡한 문제 분석'
            ],
            collaboration: [
                '조직 리더십',
                '기술 문화 형성',
                '외부 협력'
            ],
            assetization: [
                '핵심 기술 문서화',
                '기술 표준 수립'
            ]
        }
    },
    L5: {
        level: 'L5',
        capabilities: {
            technical: [
                '기술 철학 제시',
                '장기 기술 비전',
                '혁신적 솔루션'
            ],
            problemSolving: [
                '산업 차원 문제 해결',
                '전략적 비전 제시',
                '복잡한 시스템 설계'
            ],
            collaboration: [
                '조직 문화 형성',
                '외부 발표/기고',
                '업계 리더십'
            ],
            assetization: [
                '기술 철학 문서화',
                '업계 표준 기여'
            ]
        }
    }
};

/**
 * 레벨별 역량 매트릭스를 가져옵니다.
 * @param {string} level - 레벨 (L1~L5)
 * @returns {Object} 역량 매트릭스 객체
 */
export function getCapabilityMatrix(level) {
    const validLevels = ['L1', 'L2', 'L3', 'L4', 'L5'];
    
    if (!validLevels.includes(level)) {
        throw new Error(`유효하지 않은 레벨입니다: ${level}`);
    }
    
    return CAPABILITY_MATRIX[level];
}

/**
 * 역량 달성률을 계산합니다.
 * @param {Object} evaluation - 평가 데이터
 * @param {string} category - 카테고리 ('technical', 'problemSolving', 'collaboration', 'assetization', 'all')
 * @returns {Object} { percentage: number, achieved: number, total: number }
 */
export function calculateCapabilityAchievement(evaluation, category = 'all') {
    if (category === 'all') {
        // 전체 역량 달성률 계산
        let totalAchieved = 0;
        let totalItems = 0;
        
        const categories = ['technical', 'problemSolving', 'collaboration', 'assetization'];
        categories.forEach(cat => {
            if (evaluation[cat]) {
                totalAchieved += evaluation[cat].achieved || 0;
                totalItems += evaluation[cat].total || 0;
            }
        });
        
        const percentage = totalItems > 0 ? Math.round((totalAchieved / totalItems) * 100) : 0;
        
        return {
            percentage,
            achieved: totalAchieved,
            total: totalItems
        };
    } else {
        // 특정 카테고리 달성률 계산
        const categoryData = evaluation[category];
        if (!categoryData) {
            return { percentage: 0, achieved: 0, total: 0 };
        }
        
        const achieved = categoryData.achieved || 0;
        const total = categoryData.total || 0;
        const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0;
        
        return {
            percentage,
            achieved,
            total
        };
    }
}

/**
 * 승진 기준을 확인합니다.
 * @param {Object} evaluation - 평가 데이터
 * @returns {Object} { eligible: boolean, achievementRate: number }
 */
export function checkPromotionCriteria(evaluation) {
    const achievement = calculateCapabilityAchievement(evaluation, 'all');
    const achievementRate = achievement.percentage;
    
    return {
        eligible: achievementRate >= PROMOTION_THRESHOLD,
        achievementRate
    };
}

/**
 * 평가 점수를 계산합니다.
 * @param {Object} evaluation - 평가 점수 객체 (0~100점)
 * @returns {Object} 계산된 점수 객체
 */
export function calculateEvaluationScore(evaluation) {
    const technicalScore = (evaluation.technical || 0) * (EVALUATION_WEIGHTS.technical / 100);
    const problemSolvingScore = (evaluation.problemSolving || 0) * (EVALUATION_WEIGHTS.problemSolving / 100);
    const collaborationScore = (evaluation.collaboration || 0) * (EVALUATION_WEIGHTS.collaboration / 100);
    const assetizationScore = (evaluation.assetization || 0) * (EVALUATION_WEIGHTS.assetization / 100);
    
    const totalScore = Math.round(
        technicalScore + 
        problemSolvingScore + 
        collaborationScore + 
        assetizationScore
    );
    
    return {
        technicalScore: Math.round(technicalScore * 100) / 100,
        problemSolvingScore: Math.round(problemSolvingScore * 100) / 100,
        collaborationScore: Math.round(collaborationScore * 100) / 100,
        assetizationScore: Math.round(assetizationScore * 100) / 100,
        totalScore
    };
}

// 로컬 스토리지에서 평가 결과 관리
const EVALUATION_STORAGE_KEY = 'ecgf_evaluations';

/**
 * 평가 결과를 저장합니다.
 * @param {string} memberId - 부서원 ID
 * @param {Object} evaluation - 평가 데이터
 * @returns {Object} 저장된 평가 결과
 */
export function saveEvaluationResult(memberId, evaluation) {
    if (!memberId) {
        throw new Error('부서원 ID는 필수입니다.');
    }
    
    const evaluations = getEvaluationResults();
    
    const evaluationResult = {
        memberId,
        evaluation,
        timestamp: Date.now(),
        score: calculateEvaluationScore(evaluation)
    };
    
    // 기존 평가 결과 업데이트 또는 새로 추가
    const existingIndex = evaluations.findIndex(e => e.memberId === memberId);
    if (existingIndex !== -1) {
        evaluations[existingIndex] = evaluationResult;
    } else {
        evaluations.push(evaluationResult);
    }
    
    localStorage.setItem(EVALUATION_STORAGE_KEY, JSON.stringify(evaluations));
    
    return evaluationResult;
}

/**
 * 평가 결과를 조회합니다.
 * @param {string} memberId - 부서원 ID
 * @returns {Object|null} 평가 결과 또는 null
 */
export function getEvaluationResult(memberId) {
    if (!memberId) {
        return null;
    }
    
    const evaluations = getEvaluationResults();
    return evaluations.find(e => e.memberId === memberId) || null;
}

/**
 * 모든 평가 결과를 가져옵니다.
 * @returns {Array} 평가 결과 배열
 */
function getEvaluationResults() {
    try {
        const data = localStorage.getItem(EVALUATION_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        return [];
    }
}

