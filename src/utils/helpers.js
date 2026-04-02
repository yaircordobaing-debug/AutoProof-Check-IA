/**
 * Score Calculation Helper
 * @param {number} total Items to validate
 * @param {number} fails Failed items count
 * @returns {number} Score from 0 to 100
 */
export function calculateScore(total, fails) {
    if (total === 0) return 100;
    let score = 100 - (fails * (100 / total));
    return Math.max(0, Math.round(score));
}

/**
 * Determine final status based on fails & leg overrides
 */
export function determineStatus(failsCount, hasManual) {
    if (failsCount === 0) {
        return hasManual ? 'APTO CON OBSERVACIONES' : 'APTO';
    }
    return failsCount <= 2 ? 'ADVERTENCIA' : 'NO APTO';
}
