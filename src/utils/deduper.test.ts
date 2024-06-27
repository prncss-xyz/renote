import { getDeduper } from "./deduper";

describe("deduper", () => {
  it("should ", async () => {
    const delai = 500;
    const cb = vitest.fn();
    const deduped = getDeduper(delai, cb);
    let i = 0;
    deduped("a", ++i);
    deduped("a", i);
    deduped("a", ++i);
    deduped("a", ++i);
    await new Promise((resolve) => setTimeout(() => resolve(true), delai));
    deduped("a", i);
    await new Promise((resolve) => setTimeout(() => resolve(true), delai));
    expect(cb.mock.calls).toEqual([
      ["a", 1],
      ["a", 2],
      ["a", 3],
      ["a", 3],
    ]);
  });
});
