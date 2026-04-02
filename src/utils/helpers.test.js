import { describe, it, expect } from 'vitest';
import { calculateScore, determineStatus } from './helpers.js';

describe('Validation Helpers', () => {
    it('calculates score correctly with no fails', () => {
        expect(calculateScore(10, 0)).toBe(100);
    });

    it('calculates score correctly with some fails', () => {
        expect(calculateScore(10, 5)).toBe(50);
        expect(calculateScore(10, 10)).toBe(0);
    });

    it('determines status APTO', () => {
        expect(determineStatus(0, false)).toBe('APTO');
        expect(determineStatus(0, true)).toBe('APTO CON OBSERVACIONES');
    });

    it('determines status ADVERTENCIA for 1 or 2 fails', () => {
        expect(determineStatus(1, false)).toBe('ADVERTENCIA');
        expect(determineStatus(2, false)).toBe('ADVERTENCIA');
    });

    it('determines status NO APTO for >2 fails', () => {
        expect(determineStatus(3, false)).toBe('NO APTO');
    });
});
