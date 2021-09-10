import { Contracts } from "@payvo/profiles";
import { useHistory } from "react-router-dom";

import { VoteDelegateProperties } from "../components/DelegateTable/DelegateTable.models";
import { appendParameters } from "../utils/url-parameters";

interface VoteActionsProperties {
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
	selectedAddress: string;
	hasWalletId: boolean;
}

export const useVoteActions = ({ profile, wallet, selectedAddress, hasWalletId }: VoteActionsProperties) => {
	const history = useHistory();

	const navigateToSendVote = (unvotes: VoteDelegateProperties[], votes: VoteDelegateProperties[]) => {
		const walletId = hasWalletId ? wallet.id() : profile.wallets().findByAddress(selectedAddress)?.id();

		const parameters = new URLSearchParams();

		appendParameters(parameters, "unvote", unvotes);

		appendParameters(parameters, "vote", votes);

		history.push({
			pathname: `/profiles/${profile.id()}/wallets/${walletId}/send-vote`,
			search: `?${parameters}`,
		});
	};

	return { navigateToSendVote };
};
