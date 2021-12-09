import React from "react";
import { useTranslation } from "react-i18next";

import { Icon } from "@/app/components//Icon";
import { Button } from "@/app/components/Button";
import { ControlButton } from "@/app/components/ControlButton";
import { Dropdown } from "@/app/components/Dropdown";
import { Tooltip } from "@/app/components/Tooltip";
import { FilterWallets, FilterWalletsHookProperties } from "@/domains/dashboard/components/FilterWallets";

interface WalletsControlsProperties {
	filterProperties: FilterWalletsHookProperties;
	onCreateWallet?: (event: React.MouseEvent<HTMLElement>) => void;
	onImportWallet?: (event: React.MouseEvent<HTMLElement>) => void;
	onImportLedgerWallet?: () => void;
	onFilterChange?: (key: string, value: any) => void;
}

export const WalletsControls = React.memo(
	({
		filterProperties,
		onCreateWallet,
		onImportWallet,
		onImportLedgerWallet,
		onFilterChange,
	}: WalletsControlsProperties) => {
		const { t } = useTranslation();

		return (
			<div data-testid="WalletControls" className="flex justify-end">
				<div className="flex relative items-center pr-5 mr-8 border-r text-theme-primary-400 border-theme-secondary-300 dark:border-theme-secondary-800">
					<Dropdown
						dropdownClass="transform"
						toggleContent={
							<Tooltip content={filterProperties.disabled ? t("COMMON.NOTICE_NO_WALLETS") : undefined}>
								<span>
									<ControlButton
										isChanged={filterProperties.isFilterChanged}
										disabled={filterProperties.disabled}
									>
										<div className="flex justify-center items-center w-5 h-5">
											<Icon name="SlidersVertical" size="lg" />
										</div>
									</ControlButton>
								</span>
							</Tooltip>
						}
						disableToggle={filterProperties.disabled}
					>
						<div className="py-7 px-10 w-128">
							<FilterWallets {...filterProperties} onChange={onFilterChange} />
						</div>
					</Dropdown>
				</div>

				<div className="flex space-x-3">
					<Button
						onClick={onImportLedgerWallet}
						variant="secondary"
						data-testid="WalletControls__import-ledger"
					>
						<div className="flex items-center space-x-2">
							<Icon name="Ledger" />
							<span>{t("DASHBOARD.WALLET_CONTROLS.IMPORT_LEDGER")}</span>
						</div>
					</Button>

					<Button onClick={onImportWallet} variant="secondary" data-testid="WalletControls__import-wallet">
						<div className="flex items-center space-x-2">
							<Icon name="ArrowTurnDownBracket" />
							<span>{t("DASHBOARD.WALLET_CONTROLS.IMPORT")}</span>
						</div>
					</Button>

					<Button onClick={onCreateWallet} variant="primary" data-testid="WalletControls__create-wallet">
						<div className="flex items-center space-x-2">
							<Icon name="Plus" />
							<span>{t("DASHBOARD.WALLET_CONTROLS.CREATE")}</span>
						</div>
					</Button>
				</div>
			</div>
		);
	},
);

WalletsControls.displayName = "WalletsControls";
