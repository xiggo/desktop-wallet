import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActiveProfile } from "@/app/hooks";
import { useWalletFilters } from "@/domains/dashboard/components/FilterWallets";
import { WalletsControls } from "@/domains/wallet/components/WalletsControls";
import { LedgerWaitingDevice } from "@/domains/wallet/components/Ledger";
import { useWalletActions } from "@/domains/wallet/hooks/use-wallet-actions";

export const PortfolioHeader: React.VFC = () => {
	const { t } = useTranslation();
	const profile = useActiveProfile();
	const filterProperties = useWalletFilters({ profile });
	const { handleImport, handleCreate, handleImportLedger } = useWalletActions();

	const [isWaitingLedger, setIsWaitingLedger] = useState(false);

	const { update } = filterProperties;

	const handleDeviceAvailable = useCallback(() => {
		setIsWaitingLedger(false);
		handleImportLedger();
	}, [handleImportLedger]);

	const handleWaitingLedgerDevice = useCallback(() => {
		setIsWaitingLedger(true);
	}, []);

	return (
		<>
			<div className="flex justify-between items-center mb-8" data-testid="Portfolio__Header">
				<div className="text-2xl font-bold">{t("COMMON.PORTFOLIO")}</div>

				<div className="text-right">
					<WalletsControls
						filterProperties={filterProperties}
						onCreateWallet={handleCreate}
						onImportWallet={handleImport}
						onImportLedgerWallet={handleWaitingLedgerDevice}
						onFilterChange={update}
					/>
				</div>
			</div>
			{isWaitingLedger && (
				<LedgerWaitingDevice
					isOpen={true}
					onDeviceAvailable={handleDeviceAvailable}
					onClose={() => setIsWaitingLedger(false)}
				/>
			)}
		</>
	);
};
