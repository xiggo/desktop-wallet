import { Contracts } from "@payvo/sdk-profiles";
import { TFunction } from "i18next";
import { lowerCaseEquals } from "utils/equals";

export const alias = ({
	t,
	walletAddress,
	profile,
	unsavedAliases,
}: {
	t: TFunction;
	walletAddress: string;
	profile: Contracts.IProfile;
	unsavedAliases?: string[];
}) => {
	const maxLength = 42;

	return {
		maxLength: {
			message: t("COMMON.VALIDATION.MAX_LENGTH", {
				field: t("WALLETS.WALLET_NAME"),
				maxLength,
			}),
			value: maxLength,
		},
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("WALLETS.WALLET_NAME"),
		}),
		validate: {
			duplicateAlias: (value: string) => {
				const alias = value.trim();

				const error = t("WALLETS.VALIDATION.ALIAS_ASSIGNED", { alias });

				if (unsavedAliases?.some((unsavedAlias) => lowerCaseEquals(unsavedAlias, alias))) {
					return error;
				}

				const walletSameAlias = profile.wallets().findByAlias(alias);

				if (!walletSameAlias || walletSameAlias.address() === walletAddress) {
					return true;
				}

				return error;
			},
			empty: (alias: string) => {
				if (alias.trim() === "") {
					return t("WALLETS.VALIDATION.ALIAS_REQUIRED");
				}

				return true;
			},
		},
	};
};
