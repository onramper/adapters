import roundUp from "./roundUp";


test("round up to 0 decimals", () => {
    expect(roundUp(13.4178, 0)).toBe(14);
});

test("round up to 1 decimals", () => {
    expect(roundUp(13.4178, 1)).toBe(13.5);
});

test("round up to 2 decimals", () => {
    expect(roundUp(13.4178, 2)).toBe(13.42);
});

test("round up 0 decimals value", () => {
    expect(roundUp(13, 2)).toBe(13);
});