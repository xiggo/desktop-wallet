import { Contracts } from "@payvo/sdk-profiles";
import React, { useCallback, useState } from "react";
import { useHistory } from "react-router-dom";
import { openExternal } from "utils/electron-utils";
import { DropdownOption } from "@/app/components/Dropdown";
import { useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile } from "@/app/hooks";
import { WalletActionsModalType } from "@/domains/wallet/components/WalletActionsModals/WalletActionsModals.contracts";

export const useWalletActions = (wallet?: Contracts.IReadWriteWallet) => {
	const { persist } = useEnvironmentContext();
	const profile = useActiveProfile();
	const history = useHistory();

	const [activeModal, setActiveModal] = useState<WalletActionsModalType | undefined>(undefined);

	const stopEventBubbling = useCallback((event?: React.MouseEvent<HTMLElement>) => {
		event?.preventDefault();
		event?.stopPropagation();
	}, []);

	const handleOpen = useCallback(
		(event?: React.MouseEvent<HTMLElement>) => {
			if (!wallet) {
				return;
			}
			stopEventBubbling(event);
			history.push(`/profiles/${profile.id()}/wallets/${wallet.id()}`);
		},
		[history, profile, wallet, stopEventBubbling],
	);

	const handleSend = useCallback(
		(event?: React.MouseEvent<HTMLElement>) => {
			if (!wallet) {
				return;
			}
			stopEventBubbling(event);
			history.push(`/profiles/${profile.id()}/wallets/${wallet.id()}/send-transfer`);
		},
		[history, profile, wallet, stopEventBubbling],
	);

	const handleToggleStar = useCallback(
		async (event?: React.MouseEvent<HTMLElement>) => {
			if (!wallet) {
				return;
			}
			stopEventBubbling(event);
			wallet.toggleStarred();
			await persist();
		},
		[wallet, persist, stopEventBubbling],
	);

	const handleDelete = useCallback(
		async (event?: React.MouseEvent<HTMLElement>) => {
			if (!wallet) {
				return;
			}
			stopEventBubbling(event);

			profile.wallets().forget(wallet.id());
			profile.notifications().transactions().forgetByRecipient(wallet.address());
			await persist();

			history.push(`/profiles/${profile.id()}/dashboard`);
		},
		[profile, history, wallet, persist, stopEventBubbling],
	);

	const handleSelectOption = useCallback(
		(option: DropdownOption) => {
			if (!wallet) {
				return;
			}

			if (option.value === "multi-signature") {
				history.push(`/profiles/${profile.id()}/wallets/${wallet.id()}/send-registration/multiSignature`);
			}

			if (option.value === "second-signature" && !wallet.usesPassword()) {
				history.push(`/profiles/${profile.id()}/wallets/${wallet.id()}/send-registration/secondSignature`);
			}

			if (option.value === "delegate-registration") {
				history.push(`/profiles/${profile.id()}/wallets/${wallet.id()}/send-registration/delegateRegistration`);
			}

			if (option.value === "delegate-resignation") {
				history.push(`/profiles/${profile.id()}/wallets/${wallet.id()}/send-delegate-resignation`);
			}

			if (option.value === "store-hash") {
				history.push(`/profiles/${profile.id()}/wallets/${wallet.id()}/send-ipfs`);
			}

			if (option.value === "open-explorer") {
				openExternal(wallet.explorerLink());
			}

			setActiveModal(option.value.toString() as WalletActionsModalType);
		},
		[history, profile, wallet, setActiveModal],
	);

	const handleCreate = useCallback(
		(event?: React.MouseEvent<HTMLElement>) => {
			stopEventBubbling(event);
			history.push(`/profiles/${profile.id()}/wallets/create`);
		},
		[history, profile, stopEventBubbling],
	);

	const handleImport = useCallback(
		(event?: React.MouseEvent<HTMLElement>) => {
			stopEventBubbling(event);
			history.push(`/profiles/${profile.id()}/wallets/import`);
		},
		[history, profile, stopEventBubbling],
	);

	const handleImportLedger = useCallback(
		(event?: React.MouseEvent<HTMLElement>) => {
			stopEventBubbling(event);
			history.push(`/profiles/${profile.id()}/wallets/import?ledger=true`);
		},
		[history, profile, stopEventBubbling],
	);

	const handleConfirmEncryptionWarning = useCallback(
		(event?: React.MouseEvent<HTMLElement>) => {
			if (!wallet) {
				return;
			}
			stopEventBubbling(event);
			history.push(`/profiles/${profile.id()}/wallets/${wallet.id()}/send-registration/secondSignature`);
		},
		[history, profile, wallet, stopEventBubbling],
	);

	return {
		activeModal,
		handleConfirmEncryptionWarning,
		handleCreate,
		handleDelete,
		handleImport,
		handleImportLedger,
		handleOpen,
		handleSelectOption,
		handleSend,
		handleToggleStar,
		setActiveModal,
	};
};
