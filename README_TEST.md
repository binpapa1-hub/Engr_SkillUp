# 테스트 가이드

## 📋 목적

이 문서는 Engineering Capability Growth Framework (ECGF) 프로젝트의 테스트 작성, 실행, 유지보수에 대한 가이드입니다.

## 🎯 테스트 목적

- 코드 품질 보장: 모든 기능이 의도한 대로 동작하는지 검증
- 리팩토링 안전성: 코드 변경 시 기존 기능이 깨지지 않도록 보호
- 문서화: 테스트 코드 자체가 사용 예시와 동작 방식의 문서 역할
- 회귀 버그 방지: 이전에 수정한 버그가 다시 발생하지 않도록 보장

## 📝 테스트 시나리오

### 1. 단위 테스트 (Unit Tests)

각 모듈의 개별 함수와 메서드를 독립적으로 테스트합니다.

**주요 테스트 파일:**
- `tests/member.test.js` - 부서원 관리 기능
- `tests/ui.test.js` - UI 인터랙션
- `tests/validation.test.js` - 데이터 검증
- `tests/statistics.test.js` - 통계 계산
- `tests/export-import.test.js` - 데이터 내보내기/가져오기
- `tests/search-filter.test.js` - 검색 및 필터링
- `tests/evaluation.test.js` - 역량 평가
- `tests/growth-mentoring.test.js` - 성장 경로 및 멘토링
- `tests/error-handling.test.js` - 에러 핸들링
- `tests/performance.test.js` - 성능 및 확장성
- `tests/integration.test.js` - 통합 테스트
- `tests/accessibility.test.js` - 접근성 및 사용성
- `tests/documentation.test.js` - 문서화

### 2. 통합 테스트 (Integration Tests)

여러 모듈이 함께 동작하는 시나리오를 테스트합니다.

**주요 시나리오:**
- 부서원 등록 → 목록 조회 → 수정 → 삭제 전체 플로우
- 데이터 저장 → 페이지 새로고침 → 데이터 복원
- 탭 전환 → 데이터 입력 → 저장 → 목록 갱신

### 3. 성능 테스트 (Performance Tests)

대량 데이터 처리 및 성능 임계값을 테스트합니다.

**주요 시나리오:**
- 100명 이상 부서원 데이터 로드 성능
- 목록 렌더링 성능 (가상 스크롤 필요 여부)
- 검색/필터링 성능 (대량 데이터)

## 🛠️ 테스트 데이터 셋업 가이드

### 기본 테스트 데이터 구조

```javascript
const memberData = {
    name: '홍길동',
    primaryArchetype: '문제 해결형',
    secondaryArchetype: '설계/아키텍처형', // 선택사항
    years: 5,
    level: 'L2'
};
```

### 테스트 데이터 예시

#### 레벨별 부서원 데이터

```javascript
// L1 - Foundation (1~3년)
const l1Member = {
    name: '신입사원',
    primaryArchetype: '문제 해결형',
    years: 2,
    level: 'L1'
};

// L2 - Practitioner (4~7년)
const l2Member = {
    name: '중급사원',
    primaryArchetype: '설계/아키텍처형',
    years: 5,
    level: 'L2'
};

// L3 - Senior Engineer (8~12년)
const l3Member = {
    name: '시니어',
    primaryArchetype: '연구/개선형',
    years: 10,
    level: 'L3'
};

// L4 - Staff / Principal (13~20년)
const l4Member = {
    name: '스태프',
    primaryArchetype: '리더/멘토형',
    years: 15,
    level: 'L4'
};

// L5 - Master (21년+)
const l5Member = {
    name: '마스터',
    primaryArchetype: '리더/멘토형',
    years: 25,
    level: 'L5'
};
```

#### 성향별 부서원 데이터

```javascript
// 5가지 주요 성향
const archetypes = [
    '문제 해결형',
    '설계/아키텍처형',
    '연구/개선형',
    '현장/운영형',
    '리더/멘토형'
];
```

### beforeEach에서 데이터 초기화

```javascript
beforeEach(() => {
    // localStorage 초기화
    localStorage.clear();
    
    // DOM 초기화
    document.body.innerHTML = '';
});
```

## 🚀 테스트 실행 방법

### 기본 테스트 실행

```bash
# Watch 모드로 테스트 실행 (파일 변경 시 자동 재실행)
npm test

# 테스트 한 번만 실행
npm run test:run

# 테스트 UI 실행 (브라우저에서 확인)
npm run test:ui

# 커버리지 리포트 생성
npm run test:coverage
```

### 특정 테스트 파일만 실행

```bash
# Vitest CLI 사용
npx vitest run tests/member.test.js
```

### 특정 테스트만 실행

```bash
# 테스트 이름으로 필터링
npx vitest run -t "부서원 등록"
```

## 📊 커버리지 확인 방법

### 커버리지 리포트 생성

```bash
npm run test:coverage
```

### 커버리지 리포트 확인

1. **터미널 출력**: 테스트 실행 후 터미널에 커버리지 요약이 표시됩니다.
2. **HTML 리포트**: `coverage/` 디렉토리에 HTML 리포트가 생성됩니다.
   - `coverage/index.html` 파일을 브라우저에서 열어 상세한 커버리지 정보를 확인할 수 있습니다.
3. **JSON 리포트**: `coverage/coverage-summary.json` 파일에서 프로그래밍 방식으로 커버리지 정보를 확인할 수 있습니다.

### 커버리지 목표

- **목표 커버리지**: 80% 이상
- **현재 커버리지**: 테스트 실행 후 확인 가능

### 커버리지 항목

- **Lines**: 코드 라인 커버리지
- **Statements**: 문장 커버리지
- **Functions**: 함수 커버리지
- **Branches**: 분기 커버리지

## 📚 테스트 작성 가이드

### 테스트 구조

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { functionToTest } from '../src/module.js';

describe('모듈 이름', () => {
    beforeEach(() => {
        // 각 테스트 전에 실행되는 초기화 코드
    });

    describe('기능 그룹', () => {
        it('특정 동작을 수행해야 함', () => {
            // Arrange (준비)
            const input = 'test';
            
            // Act (실행)
            const result = functionToTest(input);
            
            // Assert (검증)
            expect(result).toBe('expected');
        });
    });
});
```

### 테스트 네이밍 규칙

- **describe**: 기능 그룹을 설명하는 명확한 이름
- **it**: 테스트할 동작을 "~해야 함" 형식으로 작성

### 좋은 테스트의 특징

1. **독립성**: 다른 테스트에 의존하지 않음
2. **반복 가능성**: 여러 번 실행해도 같은 결과
3. **명확성**: 테스트 의도가 명확함
4. **빠른 실행**: 빠르게 실행 가능
5. **단일 책임**: 하나의 동작만 테스트

## 🔍 디버깅

### 테스트 실패 시 확인 사항

1. **에러 메시지 확인**: 어떤 어설션이 실패했는지 확인
2. **입력 데이터 확인**: 테스트 데이터가 올바른지 확인
3. **모킹 확인**: 모킹된 함수/객체가 올바르게 설정되었는지 확인
4. **비동기 처리**: 비동기 코드는 `async/await` 또는 `Promise`를 올바르게 처리했는지 확인

### 로그 출력

```javascript
it('디버깅 테스트', () => {
    const result = someFunction();
    console.log('Result:', result); // 디버깅용 로그
    expect(result).toBe(expected);
});
```

## 📝 테스트 유지보수

### 테스트 추가 시

1. 새로운 기능에 대한 테스트 작성
2. 기존 테스트가 여전히 통과하는지 확인
3. 커버리지 목표 달성 여부 확인

### 테스트 수정 시

1. 테스트 실패 원인 파악
2. 버그 수정 또는 테스트 수정
3. 관련 테스트도 함께 확인

### 테스트 삭제 시

1. 삭제하려는 테스트가 더 이상 필요 없는지 확인
2. 해당 기능이 제거되었는지 확인
3. 커버리지에 미치는 영향 확인

## 🎯 테스트 우선순위

### 높은 우선순위

- 핵심 비즈니스 로직
- 데이터 검증 로직
- 에러 핸들링

### 중간 우선순위

- UI 인터랙션
- 데이터 변환 로직
- 통계 계산

### 낮은 우선순위

- 유틸리티 함수
- 헬퍼 함수
- 향후 기능

## 📖 참고 자료

- [Vitest 공식 문서](https://vitest.dev/)
- [Testing Library 문서](https://testing-library.com/)
- 프로젝트 README.md의 TDD 작업 목록 참고

---

**마지막 업데이트**: 2024년
**테스트 프레임워크**: Vitest v1.6.1
**커버리지 도구**: @vitest/coverage-v8

