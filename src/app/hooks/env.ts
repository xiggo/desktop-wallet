import { Contracts } from "@payvo/sdk-profiles";
import { useMemo } from "react";
import { useHistory, useParams } from "react-router-dom";

import { useEnvironmentContext } from "@/app/contexts/Environment";

export const useActiveProfile = (): Contracts.IProfile => {
	const history = useHistory();

	const context = useEnvironmentContext();
	const { profileId } = useParams<{ profileId: string }>();

	return useMemo(() => {
		if (!profileId) {
			throw new Error(
				`Parameter [profileId] must be available on the route where [useActiveProfile] is called. Current route is [${history.location.pathname}].`,
			);
		}

		return context.env.profiles().findById(profileId);
	}, [context, profileId]); // eslint-disable-line react-hooks/exhaustive-deps
};

export const useActiveWallet = () => {
	const profile = useActiveProfile();
	const { walletId } = useParams<{ walletId: string }>();

	return useMemo(() => profile.wallets().findById(walletId), [profile, walletId]);
};

export const useActiveWalletWhenNeeded = (isRequired: boolean) => {
	const profile = useActiveProfile();
	const { walletId } = useParams<{ walletId: string }>();

	return useMemo(() => {
		try {
			return profile.wallets().findById(walletId);
		} catch (error) {
			if (isRequired) {
				throw error;
			}

			return undefined;
		}
	}, [isRequired, profile, walletId]);
};
