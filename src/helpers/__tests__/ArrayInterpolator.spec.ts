import { ArrayInterpolator } from "../ArrayInterpolator";

describe("ArrayInterpolator", () => {
    it("should not change a filled array", () => {
        const interpolator = new ArrayInterpolator();

        const input = [10, 20, 30, 40, 50];

        const actual = interpolator.call(input);

        assertEqualMembers(actual, input);
    });

    it("should not change a totally empty array", () => {
        const interpolator = new ArrayInterpolator();

        const input = [null, null, null, null, null];

        const actual = interpolator.call(input);

        assertEqualMembers(actual, input);
    });

    it("should leave leading nulls", () => {
        const interpolator = new ArrayInterpolator();

        const input = [null, null, 30, 40, 50];

        const actual = interpolator.call(input);

        assertEqualMembers(actual, input);
    });

    it("should leave trailing nulls", () => {
        const interpolator = new ArrayInterpolator();

        const input = [10, 20, 30, null, null];

        const actual = interpolator.call(input);

        assertEqualMembers(actual, input);
    });

    it("should interpolate data", () => {
        const interpolator = new ArrayInterpolator();

        const input = [10, null, null, null, 50];

        const actual = interpolator.call(input);

        assertEqualMembers(actual, [10, 20, 30, 40, 50]);
    });

    it("should interpolate data", () => {
        const interpolator = new ArrayInterpolator();

        const input = [null, 10, null, 30, null, 50];

        const actual = interpolator.call(input);

        assertEqualMembers(actual, [null, 10, 20, 30, 40, 50]);
    });

    function assertEqualMembers(actual: unknown[], expected: unknown[]) {
        for (let i = 0; i < expected.length; i++) {
            expect(actual[i]).toEqual(expected[i]);
        }

        // Do this check last so we get earlier feedback on
        // array contents.
        expect(actual.length).toEqual(expected.length);
    }
});
