import { Contracts } from "@payvo/profiles";
import React from "react";

export interface DelegateTableProperties {
	delegates: Contracts.IReadOnlyWallet[];
	emptyText?: string;
	isLoading?: boolean;
	itemsPerPage?: number;
	maxVotes: number;
	unvoteDelegates: VoteDelegateProperties[];
	voteDelegates: VoteDelegateProperties[];
	selectedWallet: Contracts.IReadWriteWallet;
	votes?: Contracts.VoteRegistryItem[];
	onContinue?: (unvotes: VoteDelegateProperties[], votes: VoteDelegateProperties[]) => void;
	isPaginationDisabled?: boolean;
	subtitle?: React.ReactNode;
}

export interface VoteDelegateProperties {
	delegateAddress: string;
	amount: number;
}
