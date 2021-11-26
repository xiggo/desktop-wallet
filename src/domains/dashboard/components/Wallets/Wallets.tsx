import { Contracts } from "@payvo/sdk-profiles";
import React, { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { DropdownOption } from "@/app/components/Dropdown";
import { Section } from "@/app/components/Layout";
import { useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile } from "@/app/hooks";
import { useWalletFilters } from "@/domains/dashboard/components/FilterWallets";
import { WalletsControls } from "@/domains/dashboard/components/WalletsControls";
import { DeleteWallet } from "@/domains/wallet/components/DeleteWallet";
import { LedgerWaitingDevice } from "@/domains/wallet/components/Ledger/LedgerWaitingDevice";
import { UpdateWalletName } from "@/domains/wallet/components/UpdateWalletName";
import { assertWallet } from "@/utils/assertions";

import { useWalletDisplay } from "./hooks";
import { WalletsProperties } from "./Wallets.contracts";
import { WalletsGrid } from "./WalletsGrid";
import { WalletsList } from "./WalletsList";

type WalletActionType = "delete" | "rename";

export const Wallets: FC<WalletsProperties> = ({
	title,
	onCreateWallet,
	onImportWallet,
	onImportLedgerWallet,
	walletsCount,
	listPagerLimit = 10,
	isLoading,
}) => {
	const [isWaitingLedger, setIsWaitingLedger] = useState(false);

	const [modal, setModal] = useState<WalletActionType | undefined>();
	const [selectedWallet, setSelectedWallet] = useState<Contracts.IReadWriteWallet>();

	const history = useHistory();
	const activeProfile = useActiveProfile();
	const { persist } = useEnvironmentContext();

	const { t } = useTranslation();

	const filterProperties = useWalletFilters({ profile: activeProfile });
	const { viewType, walletsDisplayType, selectedNetworkIds, update } = filterProperties;

	const profileIsSyncedWithNetwork = !activeProfile.hasBeenPartiallyRestored();
	const wallets = useMemo(() => {
		if (activeProfile.settings().get(Contracts.ProfileSetting.UseTestNetworks)) {
			return activeProfile.wallets().values();
		}

		return activeProfile
			.wallets()
			.values()
			.filter((wallet) => wallet.network().isLive());
	}, [activeProfile, walletsCount, profileIsSyncedWithNetwork]); // eslint-disable-line react-hooks/exhaustive-deps

	const { listWallets, gridWallets, sliderOptions, hasWalletsMatchingOtherNetworks } = useWalletDisplay({
		displayType: walletsDisplayType,
		selectedNetworkIds,
		wallets,
	});

	const walletActions: DropdownOption[] = [
		{ label: t("COMMON.RENAME"), value: "rename" },
		{ label: t("COMMON.DELETE"), value: "delete" },
	];

	const handleWalletAction = (action: string, wallet: Contracts.IReadWriteWallet) => {
		setSelectedWallet(wallet);
		setModal(action as WalletActionType);
	};

	const resetWalletAction = () => {
		setModal(undefined);
		setSelectedWallet(undefined);
	};

	const handleDeleteWallet = async () => {
		assertWallet(selectedWallet);

		activeProfile.wallets().forget(selectedWallet.id());
		activeProfile.notifications().transactions().forgetByRecipient(selectedWallet.address());

		resetWalletAction();

		await persist();
	};

	const handleClick = (walletId: string) => {
		history.push(`/profiles/${activeProfile.id()}/wallets/${walletId}`);
	};

	const handleDeviceAvailable = () => {
		setIsWaitingLedger(false);
		onImportLedgerWallet?.();
	};

	const useCompactTables = !activeProfile.appearance().get("useExpandedTables");

	return (
		<Section>
			<div className="flex justify-between items-center mb-8">
				<div className="text-2xl font-bold">{title}</div>

				<div className="text-right">
					<WalletsControls
						filterProperties={filterProperties}
						onCreateWallet={onCreateWallet}
						onImportWallet={onImportWallet}
						onImportLedgerWallet={() => setIsWaitingLedger(true)}
						onSelectGridView={() => update("viewType", "grid")}
						onSelectListView={() => update("viewType", "list")}
						onFilterChange={update}
					/>
				</div>
			</div>

			<WalletsGrid
				actions={walletActions}
				onWalletAction={handleWalletAction}
				isVisible={viewType === "grid"}
				isLoading={isLoading && walletsCount === 0}
				wallets={gridWallets}
				sliderOptions={sliderOptions}
			/>

			<WalletsList
				hasWalletsMatchingOtherNetworks={hasWalletsMatchingOtherNetworks}
				isLoading={isLoading && walletsCount === 0}
				isVisible={viewType === "list"}
				onRowClick={handleClick}
				wallets={listWallets}
				walletsPerPage={listPagerLimit}
				walletsDisplayType={walletsDisplayType}
				isCompact={useCompactTables}
			/>

			{isWaitingLedger && (
				<LedgerWaitingDevice
					isOpen={true}
					onDeviceAvailable={handleDeviceAvailable}
					onClose={() => setIsWaitingLedger(false)}
				/>
			)}

			{modal === "delete" && (
				<DeleteWallet onClose={resetWalletAction} onCancel={resetWalletAction} onDelete={handleDeleteWallet} />
			)}

			{modal === "rename" && !!selectedWallet && (
				<UpdateWalletName
					onAfterSave={resetWalletAction}
					onCancel={resetWalletAction}
					profile={activeProfile}
					wallet={selectedWallet}
				/>
			)}
		</Section>
	);
};
