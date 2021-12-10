import { sortBy, uniq } from "@payvo/sdk-helpers";

export const validatePattern = (t: any, value: string, regexp: RegExp) => {
	let matches = "";

	const parts = value.split(regexp).filter((part) => part);
	parts.map((part) => (matches += part));

	return matches.length > 0
		? t("COMMON.VALIDATION.ILLEGAL_CHARACTERS", {
				characters: sortBy(uniq([...matches]))
					.map((char) => `'${char}'`)
					.join(", "),
		  })
		: true;
};
