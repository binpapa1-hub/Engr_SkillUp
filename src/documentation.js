/**
 * 문서화 및 테스트 유지보수 관련 기능
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * 테스트 커버리지 목표 (80%)
 */
export const TEST_COVERAGE_TARGET = 80;

/**
 * 테스트 문서화 상태를 확인합니다.
 * @returns {Object} 문서화 상태 객체
 */
export function checkTestDocumentation() {
    const projectRoot = process.cwd();
    const testDocPath = join(projectRoot, 'README_TEST.md');
    const contributingPath = join(projectRoot, 'CONTRIBUTING.md');
    
    const testDocExists = existsSync(testDocPath);
    const contributingExists = existsSync(contributingPath);
    const hasTestDocumentation = testDocExists || contributingExists;
    
    let hasPurpose = false;
    let hasScenarios = false;
    let hasSetupGuide = false;
    let hasDataExamples = false;
    let hasExecutionGuide = false;
    let hasCoverageGuide = false;
    
    if (testDocExists) {
        try {
            const content = readFileSync(testDocPath, 'utf-8');
            hasPurpose = content.includes('목적') || content.includes('purpose') || content.includes('Purpose');
            hasScenarios = content.includes('시나리오') || content.includes('scenario') || content.includes('Scenario');
            hasSetupGuide = content.includes('셋업') || content.includes('setup') || content.includes('Setup') || content.includes('데이터');
            hasDataExamples = content.includes('예시') || content.includes('example') || content.includes('Example') || content.includes('데이터');
            hasExecutionGuide = content.includes('실행') || content.includes('run') || content.includes('Run') || content.includes('명령어');
            hasCoverageGuide = content.includes('커버리지') || content.includes('coverage') || content.includes('Coverage');
        } catch (e) {
            // 파일 읽기 실패
        }
    }
    
    if (contributingExists && !hasPurpose) {
        try {
            const content = readFileSync(contributingPath, 'utf-8');
            hasPurpose = content.includes('목적') || content.includes('purpose') || content.includes('Purpose');
            hasScenarios = content.includes('시나리오') || content.includes('scenario') || content.includes('Scenario');
            hasSetupGuide = content.includes('셋업') || content.includes('setup') || content.includes('Setup') || content.includes('데이터');
            hasDataExamples = content.includes('예시') || content.includes('example') || content.includes('Example') || content.includes('데이터');
            hasExecutionGuide = content.includes('실행') || content.includes('run') || content.includes('Run') || content.includes('명령어');
            hasCoverageGuide = content.includes('커버리지') || content.includes('coverage') || content.includes('Coverage');
        } catch (e) {
            // 파일 읽기 실패
        }
    }
    
    return {
        hasTestDocumentation,
        hasPurpose,
        hasScenarios,
        hasSetupGuide,
        hasDataExamples,
        hasExecutionGuide,
        hasCoverageGuide,
        testDocExists,
        contributingExists
    };
}

/**
 * 테스트 구조를 검증합니다.
 * @returns {Object} 테스트 구조 검증 결과
 */
export function validateTestStructure() {
    const projectRoot = process.cwd();
    const testsDir = join(projectRoot, 'tests');
    
    const testFiles = [];
    let isValid = false;
    
    if (existsSync(testsDir)) {
        try {
            const files = readdirSync(testsDir);
            testFiles.push(...files.filter(f => f.endsWith('.test.js') || f.endsWith('.spec.js')));
            isValid = testFiles.length > 0;
        } catch (e) {
            // 디렉토리 읽기 실패
        }
    }
    
    return {
        testFiles,
        isValid,
        testsDirExists: existsSync(testsDir)
    };
}

/**
 * 테스트 커버리지를 확인합니다.
 * @returns {Object} 커버리지 정보
 */
export function checkTestCoverage() {
    // 실제 커버리지는 테스트 실행 후 생성되는 파일에서 읽어야 함
    // 여기서는 기본 구조만 제공
    const projectRoot = process.cwd();
    const coveragePath = join(projectRoot, 'coverage', 'coverage-summary.json');
    
    let currentCoverage = 0;
    let meetsTarget = false;
    
    if (existsSync(coveragePath)) {
        try {
            const coverageData = JSON.parse(readFileSync(coveragePath, 'utf-8'));
            // 전체 커버리지 계산 (lines, statements, functions, branches 평균)
            const totals = coverageData.total || {};
            const lines = totals.lines?.pct || 0;
            const statements = totals.statements?.pct || 0;
            const functions = totals.functions?.pct || 0;
            const branches = totals.branches?.pct || 0;
            
            currentCoverage = (lines + statements + functions + branches) / 4;
            meetsTarget = currentCoverage >= TEST_COVERAGE_TARGET;
        } catch (e) {
            // 커버리지 파일 읽기 실패
        }
    }
    
    return {
        currentCoverage: Math.round(currentCoverage * 100) / 100,
        targetCoverage: TEST_COVERAGE_TARGET,
        meetsTarget,
        coverageFileExists: existsSync(coveragePath)
    };
}

/**
 * 테스트 요약 정보를 가져옵니다.
 * @returns {Object} 테스트 요약 정보
 */
export function getTestSummary() {
    const structure = validateTestStructure();
    
    return {
        totalTests: structure.testFiles.length,
        passedTests: 0, // 실제로는 테스트 실행 결과에서 가져와야 함
        failedTests: 0, // 실제로는 테스트 실행 결과에서 가져와야 함
        testFiles: structure.testFiles,
        status: 'unknown', // 'passed', 'failed', 'unknown'
        priority: 'medium' // 'high', 'medium', 'low'
    };
}

