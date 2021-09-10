import { Contracts } from "@payvo/profiles";

export interface SendVoteStepProperties {
	wallet: Contracts.IReadWriteWallet;
	votes: Contracts.VoteRegistryItem[];
	unvotes: Contracts.VoteRegistryItem[];
}
