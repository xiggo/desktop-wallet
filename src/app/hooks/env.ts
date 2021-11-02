import { useEnvironmentContext } from "app/contexts/Environment";
import { useMemo } from "react";
import { useParams } from "react-router-dom";

export const useActiveProfile = () => {
	const context = useEnvironmentContext();
	const { profileId } = useParams<{ profileId: string }>();

	return useMemo(() => {
		if (!profileId) {
			return undefined;
		}
		try {
			return context.env.profiles().findById(profileId);
		} catch {
			return undefined;
		}
	}, [context, profileId])!;
};

export const useActiveWallet = () => {
	const profile = useActiveProfile();
	const { walletId } = useParams<{ walletId: string }>();

	return useMemo(() => profile.wallets().findById(walletId), [profile, walletId]);
};
