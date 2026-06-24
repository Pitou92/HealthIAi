import { clamp, formatCalories, formatWeight, formatHeight } from './index';

describe('utils/index', () => {
  describe('clamp', () => {
    it('should return the value if it is within the range', () => {
      expect(clamp(5, 1, 10)).toBe(5);
    });

    it('should return the minimum if the value is less than the minimum', () => {
      expect(clamp(-5, 1, 10)).toBe(1);
    });

    it('should return the maximum if the value is greater than the maximum', () => {
      expect(clamp(15, 1, 10)).toBe(10);
    });
  });

  describe('formatCalories', () => {
    it('should format calories correctly', () => {
      expect(formatCalories(2500)).toBe('2500 kcal');
      expect(formatCalories(0)).toBe('0 kcal');
    });
  });

  describe('formatWeight', () => {
    it('should format weight correctly', () => {
      expect(formatWeight(75.5)).toBe('75.5 kg');
      expect(formatWeight(80)).toBe('80 kg');
    });
  });

  describe('formatHeight', () => {
    it('should format height correctly', () => {
      expect(formatHeight(180)).toBe('180 cm');
    });
  });
});
