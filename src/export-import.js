/**
 * 데이터 내보내기/가져오기 기능
 */

/**
 * 내보내기 설정
 */
export const EXPORT_CONFIG = {
    csvDelimiter: ',',
    csvEncoding: 'UTF-8',
    includeBOM: true
};

/**
 * 부서원 배열을 CSV 형식으로 변환합니다.
 * @param {Array} members - 부서원 배열
 * @returns {string} CSV 문자열
 */
export function convertMembersToCSV(members) {
    if (!Array.isArray(members)) {
        throw new Error('부서원 데이터는 배열이어야 합니다.');
    }
    
    // UTF-8 BOM 추가
    let csv = EXPORT_CONFIG.includeBOM ? '\uFEFF' : '';
    
    // 헤더
    const headers = ['이름', '주요성향', '보조성향', '연차', '레벨'];
    csv += headers.join(EXPORT_CONFIG.csvDelimiter) + '\n';
    
    // 데이터 행
    members.forEach(member => {
        const row = [
            member.name || '',
            member.primaryArchetype || '',
            member.secondaryArchetype || '',
            member.years || '',
            member.level || ''
        ];
        csv += row.join(EXPORT_CONFIG.csvDelimiter) + '\n';
    });
    
    return csv;
}

/**
 * 부서원 배열을 JSON 형식으로 변환합니다.
 * @param {Array} members - 부서원 배열
 * @returns {string} JSON 문자열
 */
export function convertMembersToJSON(members) {
    if (!Array.isArray(members)) {
        throw new Error('부서원 데이터는 배열이어야 합니다.');
    }
    
    return JSON.stringify(members, null, 2);
}

/**
 * 파일을 다운로드합니다.
 * @param {string} content - 파일 내용
 * @param {string} filename - 파일명
 * @param {string} mimeType - MIME 타입
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
    if (typeof window === 'undefined') {
        // Node.js 환경에서는 다운로드 불가
        return;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * CSV 파일을 파싱하여 부서원 배열로 변환합니다.
 * @param {string} csvContent - CSV 파일 내용
 * @returns {Array} 부서원 배열
 */
export function parseCSVFile(csvContent) {
    if (!csvContent || csvContent.trim() === '') {
        throw new Error('CSV 파일 내용이 비어있습니다.');
    }
    
    // UTF-8 BOM 제거
    let content = csvContent;
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }
    
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
        throw new Error('CSV 파일 형식이 올바르지 않습니다. 헤더와 최소 1개의 데이터 행이 필요합니다.');
    }
    
    // 헤더 파싱
    const headers = lines[0].split(EXPORT_CONFIG.csvDelimiter).map(h => h.trim());
    
    // 필수 헤더 확인
    const requiredHeaders = ['이름', '주요성향', '연차', '레벨'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
        throw new Error(`필수 헤더가 누락되었습니다: ${missingHeaders.join(', ')}`);
    }
    
    // 데이터 행 파싱
    const members = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(EXPORT_CONFIG.csvDelimiter).map(v => v.trim());
        
        if (values.length !== headers.length) {
            continue; // 잘못된 행은 건너뛰기
        }
        
        const member = {
            name: values[headers.indexOf('이름')] || '',
            primaryArchetype: values[headers.indexOf('주요성향')] || '',
            secondaryArchetype: values[headers.indexOf('보조성향')] || undefined,
            years: parseInt(values[headers.indexOf('연차')]) || 0,
            level: values[headers.indexOf('레벨')] || ''
        };
        
        // 빈 secondaryArchetype은 undefined로
        if (!member.secondaryArchetype || member.secondaryArchetype === '') {
            member.secondaryArchetype = undefined;
        }
        
        members.push(member);
    }
    
    return members;
}

/**
 * JSON 파일을 파싱하여 부서원 배열로 변환합니다.
 * @param {string} jsonContent - JSON 파일 내용
 * @returns {Array} 부서원 배열
 */
export function parseJSONFile(jsonContent) {
    if (!jsonContent || jsonContent.trim() === '') {
        throw new Error('JSON 파일 내용이 비어있습니다.');
    }
    
    try {
        const parsed = JSON.parse(jsonContent);
        
        if (!Array.isArray(parsed)) {
            throw new Error('JSON 데이터는 배열 형식이어야 합니다.');
        }
        
        return parsed;
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error('잘못된 JSON 형식입니다.');
        }
        throw error;
    }
}

/**
 * 가져온 데이터를 검증합니다.
 * @param {Array} members - 검증할 부서원 배열
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateImportedData(members) {
    const errors = [];
    
    if (!Array.isArray(members)) {
        errors.push('데이터는 배열 형식이어야 합니다.');
        return { valid: false, errors };
    }
    
    members.forEach((member, index) => {
        if (!member.name || member.name.trim() === '') {
            errors.push(`행 ${index + 1}: 이름은 필수 입력 항목입니다.`);
        }
        
        if (!member.primaryArchetype) {
            errors.push(`행 ${index + 1}: 주요 성향은 필수 선택 항목입니다.`);
        }
        
        if (typeof member.years !== 'number' || isNaN(member.years) || member.years < 0 || member.years > 50) {
            errors.push(`행 ${index + 1}: 근무 연차는 0~50년 사이의 숫자여야 합니다.`);
        }
        
        if (!member.level || !['L1', 'L2', 'L3', 'L4', 'L5'].includes(member.level)) {
            errors.push(`행 ${index + 1}: 업무 레벨은 L1~L5 중 하나여야 합니다.`);
        }
    });
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * 기존 데이터와 가져온 데이터를 병합합니다.
 * @param {Array} existingMembers - 기존 부서원 배열
 * @param {Array} importedMembers - 가져온 부서원 배열
 * @param {Object} options - 병합 옵션
 * @returns {Array} 병합된 부서원 배열
 */
export function mergeMembers(existingMembers, importedMembers, options = {}) {
    const { 
        skipDuplicates = true, 
        duplicateKey = 'name' 
    } = options;
    
    if (!Array.isArray(existingMembers)) {
        existingMembers = [];
    }
    
    if (!Array.isArray(importedMembers)) {
        importedMembers = [];
    }
    
    const merged = [...existingMembers];
    
    importedMembers.forEach(imported => {
        if (skipDuplicates) {
            // 중복 체크 (이름 기준)
            const isDuplicate = merged.some(existing => {
                if (duplicateKey === 'name') {
                    return existing.name === imported.name;
                }
                return existing.id === imported.id;
            });
            
            if (!isDuplicate) {
                // ID 생성 (없는 경우)
                if (!imported.id) {
                    imported.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                }
                merged.push(imported);
            }
        } else {
            // 중복 무시하고 모두 추가
            if (!imported.id) {
                imported.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            }
            merged.push(imported);
        }
    });
    
    return merged;
}

