import ArrayInterpolator from '../src/ArrayInterpolator';

const subject = new ArrayInterpolator();

describe('ArrayInterpolator', () => {
  describe("when the input is empty", () => {
    it("returns an empty array", () => {
      expect(subject.call([])).toHaveLength(0);
    });
  });

  describe("When there is an empty spot", () => {
    it("fills it", () => {
      const input = [1,2,0,0,5];

      expect(subject.call(input)).toEqual([1,2,3,4,5]);
    });
  });

  describe("When the empty spot is a 0", () => {
    it("fills it", () => {
      const input = [1,2,0,4];

      expect(subject.call(input)).toEqual([1,2,3,4]);
    });
  });

  describe("When the empty spot is null", () => {
    it("fills it", () => {
      const input = [1,2,null,4];

      expect(subject.call(input)).toEqual([1,2,3,4]);
    });
  });

  describe("When there is only one existing value", () => {
    it("does not try to interpolate anything", () => {
      const input = [ 0, 0, 2, 0, 0 ];

      expect(subject.call(input)).toEqual([0, 0, 2, 0, 0]);
    });
  });
});
