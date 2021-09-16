import { Contracts } from "@payvo/profiles";
import { UnlockableBalance as SDKUnlockableBalance } from "@payvo/sdk/distribution/services"; // @TODO: refactor export path in sdk
import { TableColumn } from "app/components/Table/TableColumn.models";

const POLLING_INTERVAL = 1000 * 60; // 1 min

enum Step {
	SelectStep,
	ReviewStep,
	AuthenticationStep,
	SummaryStep,
	ErrorStep,
}

interface UnlockableBalance extends SDKUnlockableBalance {
	id: string;
}

interface UnlockTokensFormState {
	fee: number;
	amount: number;
	selectedObjects: UnlockableBalance[];

	// authentication fields
	mnemonic: string | undefined;
	secondMnemonic: string | undefined;
	encryptionPassword: string | undefined;
	wif: string | undefined;
	privateKey: string | undefined;
	secret: string | undefined;
}

type UnlockableBalanceSkeleton = Record<string, never>;

type UseUnlockableBalancesHook = (
	wallet: Contracts.IReadWriteWallet,
) => {
	items: UnlockableBalance[];
	loading: boolean;
};

type UseColumnsHook = (config: {
	canSelectAll: boolean;
	isAllSelected: boolean;
	onToggleAll: () => void;
}) => TableColumn[];

type UseFeesHook = (config: {
	profile: Contracts.IProfile;
	coin: string;
	network: string;
}) => {
	calculateFee: (objects: UnlockableBalance[]) => Promise<number>;
};

export type {
	UnlockableBalance,
	UnlockableBalanceSkeleton,
	UnlockTokensFormState,
	UseColumnsHook,
	UseFeesHook,
	UseUnlockableBalancesHook,
};

export { POLLING_INTERVAL, Step };
