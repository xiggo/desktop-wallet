import { Contracts, Environment } from "@payvo/profiles";
import { FilterOption } from "domains/vote/components/VotesFilter";
import { useCallback, useMemo, useState } from "react";

export const useDelegates = ({
	env,
	profile,
	searchQuery,
	voteFilter,
}: {
	env: Environment;
	profile: Contracts.IProfile;
	searchQuery: string;
	voteFilter: FilterOption;
}) => {
	const [delegates, setDelegates] = useState<Contracts.IReadOnlyWallet[]>([]);
	const [votes, setVotes] = useState<Contracts.VoteRegistryItem[] | undefined>();
	const [isLoadingDelegates, setIsLoadingDelegates] = useState(false);

	const currentVotes = useMemo(
		() => votes?.filter((vote) => delegates.some((delegate) => vote.wallet?.address() === delegate.address())),
		[votes, delegates],
	);

	const fetchDelegates = useCallback(
		async (wallet) => {
			setIsLoadingDelegates(true);
			await env.delegates().sync(profile, wallet.coinId(), wallet.networkId());
			const delegates = env.delegates().all(wallet.coinId(), wallet.networkId());

			setDelegates(delegates);
			setIsLoadingDelegates(false);
		},
		[env, profile],
	);

	const filteredDelegatesVotes: any = useMemo(() => {
		if (voteFilter === "all") {
			return delegates.filter((delegate) => !delegate.isResignedDelegate());
		}

		return currentVotes?.filter(({ wallet }) => !wallet?.isResignedDelegate()).map(({ wallet }) => wallet);
	}, [delegates, currentVotes, voteFilter]);

	const filteredDelegates = useMemo(() => {
		if (searchQuery.length === 0) {
			return filteredDelegatesVotes;
		}

		/* istanbul ignore next */
		// @ts-ignore @TODO ?????
		return filteredDelegatesVotes?.filter((delegate) => {
			// @ts-ignore @TODO ?????
			const wallet = delegate.wallet ?? delegate;

			return (
				wallet.address().toLowerCase().includes(searchQuery.toLowerCase()) ||
				wallet.username()?.toLowerCase()?.includes(searchQuery.toLowerCase())
			);
		});
	}, [filteredDelegatesVotes, searchQuery]);

	const fetchVotes = useCallback(
		(address) => {
			const wallet = profile.wallets().findByAddress(address);
			let votes: Contracts.VoteRegistryItem[];

			try {
				votes = wallet!.voting().current();
			} catch {
				votes = [];
			}

			setVotes(votes);
		},
		[profile],
	);

	const hasResignedDelegateVotes = useMemo(() => currentVotes?.some(({ wallet }) => wallet?.isResignedDelegate()), [
		currentVotes,
	]);

	return {
		currentVotes,
		delegates,
		fetchDelegates,
		fetchVotes,
		filteredDelegates,
		hasResignedDelegateVotes,
		isLoadingDelegates,
		votes,
	};
};
