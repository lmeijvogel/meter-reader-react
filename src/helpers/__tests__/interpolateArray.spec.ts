import { interpolateArray } from "../interpolateArray";

describe("interpolateArray", () => {
    it("should not change a filled array", () => {
        const input = [10, 20, 30, 40, 50];

        const actual = interpolateArray(input);

        assertEqualMembers(actual, input);
    });

    it("should not change a totally empty array", () => {
        const input = [null, null, null, null, null];

        const actual = interpolateArray(input);

        assertEqualMembers(actual, input);
    });

    it("should leave leading nulls", () => {
        const input = [null, null, 30, 40, 50];

        const actual = interpolateArray(input);

        assertEqualMembers(actual, input);
    });

    it("should leave trailing nulls", () => {
        const input = [10, 20, 30, null, null];

        const actual = interpolateArray(input);

        assertEqualMembers(actual, input);
    });

    it("should interpolate data", () => {
        const input = [10, null, null, null, 50];

        const actual = interpolateArray(input);

        assertEqualMembers(actual, [10, 20, 30, 40, 50]);
    });

    it("should interpolate data", () => {
        const input = [null, 10, null, 30, null, 50];

        const actual = interpolateArray(input);

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
