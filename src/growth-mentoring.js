/**
 * 성장 경로 및 멘토링 기능
 */

/**
 * 멘토링 설정
 */
export const MENTORING_CONFIG = {
    minLevelDifference: 2, // 최소 2레벨 차이
    preferSameArchetype: true // 같은 성향 우선
};

/**
 * 레벨 순서
 */
const LEVEL_ORDER = {
    'L1': 1,
    'L2': 2,
    'L3': 3,
    'L4': 4,
    'L5': 5
};

/**
 * 다음 레벨을 반환합니다.
 * @param {string} currentLevel - 현재 레벨
 * @returns {string|null} 다음 레벨 또는 null (최고 레벨인 경우)
 */
export function getNextLevel(currentLevel) {
    const validLevels = ['L1', 'L2', 'L3', 'L4', 'L5'];
    
    if (!validLevels.includes(currentLevel)) {
        throw new Error(`유효하지 않은 레벨입니다: ${currentLevel}`);
    }
    
    const currentOrder = LEVEL_ORDER[currentLevel];
    const nextOrder = currentOrder + 1;
    
    const nextLevel = Object.keys(LEVEL_ORDER).find(level => LEVEL_ORDER[level] === nextOrder);
    
    return nextLevel || null;
}

/**
 * 성장 경로를 추천합니다.
 * @param {Object} member - 부서원 객체
 * @returns {Object} 성장 경로 추천 객체
 */
export function recommendGrowthPath(member) {
    const nextLevel = getNextLevel(member.level);
    
    const recommendations = [];
    
    if (nextLevel) {
        recommendations.push(`${nextLevel} 레벨 달성을 위한 역량 개발`);
        recommendations.push('상위 레벨 멘토와의 멘토링');
        recommendations.push('복잡한 프로젝트 참여');
    } else {
        recommendations.push('조직 내 기술 리더십 강화');
        recommendations.push('외부 발표 및 기고');
        recommendations.push('업계 표준 기여');
    }
    
    return {
        memberId: member.id,
        currentLevel: member.level,
        nextLevel,
        recommendations
    };
}

/**
 * 성향별 맞춤 경로를 추천합니다.
 * @param {Object} member - 부서원 객체
 * @returns {Object} 성향별 경로 추천 객체
 */
export function recommendPathByArchetype(member) {
    const archetype = member.primaryArchetype;
    
    const archetypePaths = {
        '문제 해결형': [
            '장애 대응 및 트러블슈팅 경험 축적',
            'Root Cause 분석 능력 강화',
            '장애 대응 프로세스 개선'
        ],
        '설계/아키텍처형': [
            '시스템 아키텍처 설계 경험',
            '확장성 및 성능 고려 설계',
            '아키텍처 문서화 및 공유'
        ],
        '연구/개선형': [
            '신기술 연구 및 도입',
            '성능 최적화 프로젝트',
            '자동화 및 품질 개선'
        ],
        '현장/운영형': [
            '운영 안정성 강화',
            '운영 프로세스 최적화',
            '장애 대응 체계 구축'
        ],
        '리더/멘토형': [
            '멘토링 및 기술 전파',
            '팀 리더십 강화',
            '조직 문화 형성'
        ]
    };
    
    const recommendations = archetypePaths[archetype] || [
        '전반적인 역량 개발',
        '다양한 프로젝트 경험',
        '기술 문서화 및 공유'
    ];
    
    return {
        memberId: member.id,
        archetype,
        recommendations
    };
}

/**
 * 역량 격차를 분석합니다.
 * @param {Object} member - 부서원 객체
 * @param {Object} currentEvaluation - 현재 평가 데이터
 * @returns {Object} 역량 격차 분석 결과
 */
export function analyzeCapabilityGap(member, currentEvaluation) {
    const gaps = [];
    
    // 각 역량별 달성률 계산
    const technicalRate = currentEvaluation.technical 
        ? (currentEvaluation.technical.achieved / currentEvaluation.technical.total) * 100 
        : 0;
    const problemSolvingRate = currentEvaluation.problemSolving 
        ? (currentEvaluation.problemSolving.achieved / currentEvaluation.problemSolving.total) * 100 
        : 0;
    const collaborationRate = currentEvaluation.collaboration 
        ? (currentEvaluation.collaboration.achieved / currentEvaluation.collaboration.total) * 100 
        : 0;
    const assetizationRate = currentEvaluation.assetization 
        ? (currentEvaluation.assetization.achieved / currentEvaluation.assetization.total) * 100 
        : 0;
    
    // 목표 달성률 (80%)
    const targetRate = 80;
    
    if (technicalRate < targetRate) {
        gaps.push({
            category: 'technical',
            currentRate: technicalRate,
            targetRate,
            gap: targetRate - technicalRate
        });
    }
    
    if (problemSolvingRate < targetRate) {
        gaps.push({
            category: 'problemSolving',
            currentRate: problemSolvingRate,
            targetRate,
            gap: targetRate - problemSolvingRate
        });
    }
    
    if (collaborationRate < targetRate) {
        gaps.push({
            category: 'collaboration',
            currentRate: collaborationRate,
            targetRate,
            gap: targetRate - collaborationRate
        });
    }
    
    if (assetizationRate < targetRate) {
        gaps.push({
            category: 'assetization',
            currentRate: assetizationRate,
            targetRate,
            gap: targetRate - assetizationRate
        });
    }
    
    // 격차가 큰 순서로 정렬
    gaps.sort((a, b) => b.gap - a.gap);
    
    return {
        memberId: member.id,
        gaps
    };
}

/**
 * 역량 격차 기반 경로를 추천합니다.
 * @param {Object} member - 부서원 객체
 * @param {Object} currentEvaluation - 현재 평가 데이터
 * @returns {Object} 격차 기반 경로 추천 객체
 */
export function recommendPathByGap(member, currentEvaluation) {
    const gapAnalysis = analyzeCapabilityGap(member, currentEvaluation);
    
    const recommendations = [];
    
    gapAnalysis.gaps.forEach(gap => {
        const categoryNames = {
            technical: '기술 역량',
            problemSolving: '문제 해결',
            collaboration: '협업/리더십',
            assetization: '기술 자산화'
        };
        
        recommendations.push({
            priority: gap.gap,
            category: categoryNames[gap.category],
            recommendation: `${categoryNames[gap.category]} 역량을 ${Math.round(gap.gap)}% 향상시켜야 합니다.`
        });
    });
    
    return {
        memberId: member.id,
        recommendations
    };
}

/**
 * 멘토를 찾습니다.
 * @param {Array} members - 전체 부서원 배열
 * @param {Object} mentee - 멘티 객체
 * @returns {Array} 멘토 후보 배열
 */
export function findMentors(members, mentee) {
    if (!members || !mentee) {
        return [];
    }
    
    const menteeLevelOrder = LEVEL_ORDER[mentee.level];
    if (!menteeLevelOrder) {
        return [];
    }
    
    // 최소 레벨 차이 이상인 멤버 필터링
    const potentialMentors = members.filter(member => {
        if (member.id === mentee.id) {
            return false; // 자기 자신 제외
        }
        
        const mentorLevelOrder = LEVEL_ORDER[member.level];
        if (!mentorLevelOrder) {
            return false;
        }
        
        // 최소 2레벨 차이
        return mentorLevelOrder - menteeLevelOrder >= MENTORING_CONFIG.minLevelDifference;
    });
    
    // 성향 기반 정렬 (같은 성향 우선)
    if (MENTORING_CONFIG.preferSameArchetype) {
        potentialMentors.sort((a, b) => {
            const aMatch = a.primaryArchetype === mentee.primaryArchetype || 
                          a.secondaryArchetype === mentee.primaryArchetype;
            const bMatch = b.primaryArchetype === mentee.primaryArchetype || 
                          b.secondaryArchetype === mentee.primaryArchetype;
            
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
            return 0;
        });
    }
    
    return potentialMentors;
}

/**
 * 멘티를 찾습니다 (역멘토링용).
 * @param {Array} members - 전체 부서원 배열
 * @param {Object} mentor - 멘토 객체
 * @returns {Array} 멘티 후보 배열
 */
export function findMentees(members, mentor) {
    if (!members || !mentor) {
        return [];
    }
    
    const mentorLevelOrder = LEVEL_ORDER[mentor.level];
    if (!mentorLevelOrder) {
        return [];
    }
    
    // 최소 레벨 차이 이상인 멤버 필터링
    const potentialMentees = members.filter(member => {
        if (member.id === mentor.id) {
            return false; // 자기 자신 제외
        }
        
        const menteeLevelOrder = LEVEL_ORDER[member.level];
        if (!menteeLevelOrder) {
            return false;
        }
        
        // 최소 2레벨 차이
        return mentorLevelOrder - menteeLevelOrder >= MENTORING_CONFIG.minLevelDifference;
    });
    
    return potentialMentees;
}

/**
 * 멘토링 매칭을 수행합니다.
 * @param {Array|Object} membersOrMentor - 전체 부서원 배열 또는 멘토 객체
 * @param {Object} mentee - 멘티 객체 (선택사항)
 * @param {Object} options - 옵션
 * @returns {Object|Array} 매칭 결과
 */
export function matchMentoring(membersOrMentor, mentee = null, options = {}) {
    if (Array.isArray(membersOrMentor)) {
        // 전체 멤버 배열에서 자동 매칭
        const matches = [];
        
        membersOrMentor.forEach(member => {
            const mentors = findMentors(membersOrMentor, member);
            if (mentors.length > 0) {
                matches.push({
                    mentee: member,
                    mentor: mentors[0], // 가장 적합한 멘토 선택
                    reverse: false
                });
            }
        });
        
        return matches;
    } else {
        // 개별 매칭
        const mentor = membersOrMentor;
        const reverse = options.reverse || false;
        
        if (reverse) {
            // 역멘토링: 멘토가 멘티로부터 배움
            return {
                mentor,
                mentee,
                reverse: true
            };
        } else {
            // 일반 멘토링: 멘토가 멘티에게 가르침
            return {
                mentor,
                mentee,
                reverse: false
            };
        }
    }
}

