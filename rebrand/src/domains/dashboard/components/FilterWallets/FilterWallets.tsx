import React from "react";
import { useTranslation } from "react-i18next";

import { FilterWalletsProperties } from "./FilterWallets.contracts";
import { Dropdown } from "@/app/components/Dropdown/Dropdown";
import { FilterNetworks } from "@/app/components/FilterNetwork";
import { Icon } from "@/app/components/Icon";

export const FilterWallets = ({ networks, walletsDisplayType, useTestNetworks, onChange }: FilterWalletsProperties) => {
	const { t } = useTranslation();

	const walletDisplayOptions = [
		{ label: t("COMMON.ALL"), value: "all" },
		{ label: t("COMMON.STARRED"), value: "starred" },
		{ label: t("COMMON.LEDGER"), value: "ledger" },
	];

	return (
		<div className="flex flex-col text-left" data-testid="FilterWallets">
			<div className="mb-5">
				<div className="font-semibold text-theme-secondary-text">
					{t("DASHBOARD.FILTER_WALLETS.CRYPTOASSET.TITLE")}
				</div>
				<div className="mt-1 text-sm text-theme-secondary-500">
					{t("DASHBOARD.FILTER_WALLETS.CRYPTOASSET.DESCRIPTION")}
				</div>
			</div>

			<FilterNetworks
				useTestNetworks={useTestNetworks}
				options={networks}
				onChange={(_: any, options: any[]) => {
					onChange?.(
						"selectedNetworkIds",
						options.filter((option) => option.isSelected).map((option) => option.network.id()),
					);
				}}
			/>

			<div className="mt-6 mb-8 border-t border-dotted border-theme-secondary-300 dark:border-theme-secondary-800" />

			<div className="flex flex-col">
				<div className="flex justify-between items-center">
					<div className="font-semibold text-theme-secondary-text">
						{t("DASHBOARD.FILTER_WALLETS.WALLETS.TITLE")}
					</div>

					<Dropdown
						toggleIcon="ChevronDownSmall"
						toggleSize="sm"
						options={walletDisplayOptions}
						onSelect={({ value }) => onChange?.("walletsDisplayType", value)}
						toggleContent={(isOpen: boolean) => (
							<div
								data-testid="filter-wallets__wallets"
								className="flex justify-end items-center cursor-pointer text-theme-secondary-text"
							>
								<span className="inline-block mr-2 font-semibold">
									{walletDisplayOptions.find((option) => option.value === walletsDisplayType)?.label}
								</span>
								<Icon
									name="ChevronDownSmall"
									className={`transition-transform ${isOpen ? "transform rotate-180" : ""}`}
									size="sm"
								/>
							</div>
						)}
					/>
				</div>

				<div className="pr-12 mt-1 text-sm text-theme-secondary-500">
					{t("DASHBOARD.FILTER_WALLETS.WALLETS.DESCRIPTION")}
				</div>
			</div>
		</div>
	);
};
