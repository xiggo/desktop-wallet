import { Contracts } from "@payvo/profiles";
import { Networks } from "@payvo/sdk";
import { useEnvironmentContext } from "app/contexts";
import { useCallback } from "react";
import { assertProfile, assertString } from "utils/assertions";

interface Properties {
	address?: string;
	network?: Networks.Network;
	profile?: Contracts.IProfile;
}

export const useWalletAlias = () => {
	const { env } = useEnvironmentContext();

	const getWalletAlias = useCallback(
		({ address, profile, network }: Properties) => {
			try {
				assertString(address);
				assertProfile(profile);

				const contact = profile.contacts().findByAddress(address)[0];

				if (contact) {
					return contact.name();
				}

				const alias = profile.wallets().findByAddress(address)?.displayName();

				if (alias) {
					return alias;
				}

				if (network) {
					const delegate = env.delegates().findByAddress(network.coin(), network.id(), address);
					return delegate.username();
				}
			} catch {
				//
			}

			return undefined;
		},
		[env],
	);

	return { getWalletAlias };
};
