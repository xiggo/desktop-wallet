import "jest-extended";

import { validatePath } from "./validate-path";

describe("#validatePath", () => {
	it("should be true if dir is a subpath", () => {
		expect(validatePath("foo", "foo/bar")).toBeTrue();
	});

	it("should be false if dir is not a subpath", () => {
		expect(validatePath("foo", "bar")).toBeFalse();
	});
});
