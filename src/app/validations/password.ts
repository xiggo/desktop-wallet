import { evaluate, pwned } from "@faustbrian/node-haveibeenpwned";

export const password = (t: any) => ({
	confirmOptionalPassword: (password: string) => ({
		validate: (confirmPassword: string) => {
			if (!password && !!confirmPassword) {
				return t("COMMON.VALIDATION.FIELD_REQUIRED", {
					field: t("SETTINGS.GENERAL.PERSONAL.PASSWORD"),
				}).toString();
			}

			if (!!password && password !== confirmPassword) {
				return t("COMMON.VALIDATION.PASSWORD_MISMATCH");
			}

			return true;
		},
	}),
	confirmPassword: (password: string) => ({
		required: t("COMMON.VALIDATION.CONFIRM_PASSWORD_REQUIRED"),
		validate: (confirmPassword: string) => {
			if (!password) {
				return t("COMMON.VALIDATION.FIELD_REQUIRED", {
					field: t("SETTINGS.GENERAL.PERSONAL.PASSWORD"),
				}).toString();
			}

			if (password !== confirmPassword) {
				return t("COMMON.VALIDATION.PASSWORD_MISMATCH");
			}

			return true;
		},
	}),
	password: (currentPassword?: string) => ({
		validate: async (password: string) => {
			if (!password) {
				return true;
			}

			if (!!currentPassword && currentPassword === password) {
				return t("COMMON.VALIDATION.PASSWORD_SAME_AS_OLD");
			}

			try {
				if (!(await evaluate(password))) {
					return t("COMMON.VALIDATION.PASSWORD_WEAK");
				}

				const hasBeenLeaked = await pwned(password);

				if (hasBeenLeaked) {
					return t("COMMON.VALIDATION.PASSWORD_LEAKED");
				}
			} catch {
				// API might be unreachable, ignore this validation.
				return true;
			}

			return true;
		},
	}),
});
