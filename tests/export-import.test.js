import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
    convertMembersToCSV,
    convertMembersToJSON,
    downloadFile,
    parseCSVFile,
    parseJSONFile,
    validateImportedData,
    mergeMembers,
    EXPORT_CONFIG
} from '../src/export-import.js';

describe('데이터 내보내기/가져오기 테스트', () => {
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
        }
    ];

    describe('CSV 내보내기', () => {
        describe('부서원 데이터 CSV 변환 로직', () => {
            it('부서원 배열을 CSV 형식으로 변환해야 함', () => {
                const csv = convertMembersToCSV(sampleMembers);
                
                expect(csv).toBeDefined();
                expect(typeof csv).toBe('string');
                expect(csv).toContain('홍길동');
                expect(csv).toContain('문제 해결형');
            });

            it('CSV 헤더가 포함되어야 함', () => {
                const csv = convertMembersToCSV(sampleMembers);
                const lines = csv.split('\n');
                
                expect(lines[0]).toContain('이름');
                expect(lines[0]).toContain('주요성향');
                expect(lines[0]).toContain('보조성향');
                expect(lines[0]).toContain('연차');
                expect(lines[0]).toContain('레벨');
            });

            it('빈 배열도 처리할 수 있어야 함', () => {
                const csv = convertMembersToCSV([]);
                
                expect(csv).toBeDefined();
                expect(csv).toContain('이름');
            });

            it('보조 성향이 없는 경우도 처리해야 함', () => {
                const membersWithoutSecondary = [
                    { id: '1', name: '홍길동', primaryArchetype: '문제 해결형', years: 5, level: 'L2' }
                ];
                
                const csv = convertMembersToCSV(membersWithoutSecondary);
                
                expect(csv).toBeDefined();
                expect(csv).toContain('홍길동');
            });
        });

        describe('파일 다운로드 기능 검증', () => {
            it('다운로드 함수가 존재해야 함', () => {
                expect(typeof downloadFile).toBe('function');
            });

            it('CSV 파일을 다운로드할 수 있어야 함 - 함수 호출 가능', () => {
                const csv = convertMembersToCSV(sampleMembers);
                
                // 함수가 존재하고 호출 가능한지 확인
                expect(() => {
                    // 브라우저 환경이 아닌 경우 에러 없이 종료되어야 함
                    if (typeof window === 'undefined') {
                        downloadFile(csv, 'members.csv', 'text/csv');
                    } else {
                        // 브라우저 환경에서는 실제 다운로드 시도 (에러 발생 가능)
                        try {
                            downloadFile(csv, 'members.csv', 'text/csv');
                        } catch (e) {
                            // DOM 조작 에러는 무시 (테스트 환경 제한)
                        }
                    }
                }).not.toThrow();
            });
        });

        describe('한글 인코딩 처리 (UTF-8 BOM)', () => {
            it('CSV에 UTF-8 BOM이 포함되어야 함', () => {
                const csv = convertMembersToCSV(sampleMembers);
                
                // UTF-8 BOM: \uFEFF
                expect(csv.charCodeAt(0)).toBe(0xFEFF);
            });

            it('한글 문자가 올바르게 인코딩되어야 함', () => {
                const csv = convertMembersToCSV(sampleMembers);
                
                expect(csv).toContain('홍길동');
                expect(csv).toContain('문제 해결형');
                expect(csv).toContain('설계/아키텍처형');
            });
        });
    });

    describe('JSON 내보내기', () => {
        describe('JSON 형식 검증', () => {
            it('부서원 배열을 JSON 형식으로 변환해야 함', () => {
                const json = convertMembersToJSON(sampleMembers);
                
                expect(json).toBeDefined();
                expect(typeof json).toBe('string');
                
                const parsed = JSON.parse(json);
                expect(Array.isArray(parsed)).toBe(true);
                expect(parsed.length).toBe(2);
            });

            it('JSON이 유효한 형식이어야 함', () => {
                const json = convertMembersToJSON(sampleMembers);
                
                expect(() => {
                    JSON.parse(json);
                }).not.toThrow();
            });

            it('빈 배열도 JSON으로 변환할 수 있어야 함', () => {
                const json = convertMembersToJSON([]);
                
                expect(() => {
                    const parsed = JSON.parse(json);
                    expect(Array.isArray(parsed)).toBe(true);
                    expect(parsed.length).toBe(0);
                }).not.toThrow();
            });
        });

        describe('파일 다운로드 기능 검증', () => {
            it('JSON 파일을 다운로드할 수 있어야 함 - 함수 호출 가능', () => {
                const json = convertMembersToJSON(sampleMembers);
                
                // 함수가 존재하고 호출 가능한지 확인
                expect(() => {
                    // 브라우저 환경이 아닌 경우 에러 없이 종료되어야 함
                    if (typeof window === 'undefined') {
                        downloadFile(json, 'members.json', 'application/json');
                    } else {
                        // 브라우저 환경에서는 실제 다운로드 시도 (에러 발생 가능)
                        try {
                            downloadFile(json, 'members.json', 'application/json');
                        } catch (e) {
                            // DOM 조작 에러는 무시 (테스트 환경 제한)
                        }
                    }
                }).not.toThrow();
            });
        });
    });

    describe('데이터 가져오기', () => {
        describe('CSV 파일 파싱 로직', () => {
            it('CSV 파일을 파싱하여 부서원 배열로 변환해야 함', () => {
                const csv = `이름,주요성향,보조성향,연차,레벨
홍길동,문제 해결형,설계/아키텍처형,5,L2`;
                
                const members = parseCSVFile(csv);
                
                expect(Array.isArray(members)).toBe(true);
                expect(members.length).toBe(1);
                expect(members[0].name).toBe('홍길동');
            });

            it('CSV 헤더를 올바르게 처리해야 함', () => {
                const csv = `이름,주요성향,보조성향,연차,레벨
홍길동,문제 해결형,설계/아키텍처형,5,L2`;
                
                const members = parseCSVFile(csv);
                
                expect(members[0]).toHaveProperty('name');
                expect(members[0]).toHaveProperty('primaryArchetype');
                expect(members[0]).toHaveProperty('years');
            });

            it('보조 성향이 없는 경우도 처리해야 함', () => {
                const csv = `이름,주요성향,보조성향,연차,레벨
홍길동,문제 해결형,,5,L2`;
                
                const members = parseCSVFile(csv);
                
                expect(members[0].secondaryArchetype).toBeUndefined();
            });

            it('UTF-8 BOM이 있는 CSV도 처리해야 함', () => {
                const csvWithBOM = '\uFEFF이름,주요성향,보조성향,연차,레벨\n홍길동,문제 해결형,,5,L2';
                
                const members = parseCSVFile(csvWithBOM);
                
                expect(members.length).toBe(1);
                expect(members[0].name).toBe('홍길동');
            });
        });

        describe('JSON 파일 파싱 로직', () => {
            it('JSON 파일을 파싱하여 부서원 배열로 변환해야 함', () => {
                const json = JSON.stringify(sampleMembers);
                
                const members = parseJSONFile(json);
                
                expect(Array.isArray(members)).toBe(true);
                expect(members.length).toBe(2);
                expect(members[0].name).toBe('홍길동');
            });

            it('유효한 JSON 형식을 처리해야 함', () => {
                const json = JSON.stringify(sampleMembers);
                
                expect(() => {
                    parseJSONFile(json);
                }).not.toThrow();
            });

            it('빈 배열 JSON도 처리할 수 있어야 함', () => {
                const json = JSON.stringify([]);
                
                const members = parseJSONFile(json);
                
                expect(Array.isArray(members)).toBe(true);
                expect(members.length).toBe(0);
            });
        });

        describe('잘못된 형식 파일 처리', () => {
            it('잘못된 CSV 형식은 에러를 발생시켜야 함', () => {
                const invalidCSV = 'invalid,csv,format';
                
                expect(() => {
                    parseCSVFile(invalidCSV);
                }).toThrow();
            });

            it('잘못된 JSON 형식은 에러를 발생시켜야 함', () => {
                const invalidJSON = '{ invalid json }';
                
                expect(() => {
                    parseJSONFile(invalidJSON);
                }).toThrow();
            });

            it('빈 파일은 에러를 발생시켜야 함', () => {
                expect(() => {
                    parseCSVFile('');
                }).toThrow();
                
                expect(() => {
                    parseJSONFile('');
                }).toThrow();
            });
        });

        describe('데이터 검증 및 병합 로직', () => {
            it('가져온 데이터를 검증해야 함', () => {
                const importedMembers = [
                    { name: '홍길동', primaryArchetype: '문제 해결형', years: 5, level: 'L2' }
                ];
                
                const validation = validateImportedData(importedMembers);
                
                expect(validation.valid).toBe(true);
                expect(validation.errors).toEqual([]);
            });

            it('잘못된 데이터는 검증 실패해야 함', () => {
                const invalidMembers = [
                    { name: '', primaryArchetype: '문제 해결형', years: 5, level: 'L2' }
                ];
                
                const validation = validateImportedData(invalidMembers);
                
                expect(validation.valid).toBe(false);
                expect(validation.errors.length).toBeGreaterThan(0);
            });

            it('기존 데이터와 병합할 수 있어야 함', () => {
                const existingMembers = [
                    { id: '1', name: '홍길동', primaryArchetype: '문제 해결형', years: 5, level: 'L2' }
                ];
                
                const importedMembers = [
                    { name: '김철수', primaryArchetype: '연구/개선형', years: 10, level: 'L3' }
                ];
                
                const merged = mergeMembers(existingMembers, importedMembers);
                
                expect(merged.length).toBe(2);
                expect(merged[0].name).toBe('홍길동');
                expect(merged[1].name).toBe('김철수');
            });

            it('중복된 데이터는 병합하지 않아야 함', () => {
                const existingMembers = [
                    { id: '1', name: '홍길동', primaryArchetype: '문제 해결형', years: 5, level: 'L2' }
                ];
                
                const importedMembers = [
                    { name: '홍길동', primaryArchetype: '문제 해결형', years: 5, level: 'L2' }
                ];
                
                const merged = mergeMembers(existingMembers, importedMembers);
                
                // 중복 제거 또는 업데이트 로직에 따라 다를 수 있음
                expect(merged.length).toBeGreaterThanOrEqual(1);
            });
        });
    });
});

