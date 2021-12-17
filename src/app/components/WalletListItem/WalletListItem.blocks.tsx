import cn from "classnames";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Avatar } from "@/app/components/Avatar";
import { Button } from "@/app/components/Button";
import { Dropdown } from "@/app/components/Dropdown";
import { Icon } from "@/app/components/Icon";
import { TableCell } from "@/app/components/Table";
import { Tooltip } from "@/app/components/Tooltip";
import { WalletIcons } from "@/app/components/WalletIcons";
import {
	BalanceCellProperties,
	ButtonsCellProperties,
	CurrencyCellProperties,
	InfoCellProperties,
	WalletCellProperties,
} from "@/app/components/WalletListItem/WalletListItem.contracts";
import { useConfiguration } from "@/app/contexts";
import { useActiveProfile, useWalletAlias } from "@/app/hooks";
import { useWalletOptions } from "@/domains/wallet/pages/WalletDetails/hooks/use-wallet-options";
import { Skeleton } from "@/app/components/Skeleton";

const starIconDimensions: [number, number] = [18, 18];
const excludedIcons = ["isStarred"];

export const WalletCell: React.VFC<WalletCellProperties> = ({ wallet, handleToggleStar, isCompact }) => {
	const { t } = useTranslation();
	const profile = useActiveProfile();
	const { getWalletAlias } = useWalletAlias();

	const { alias } = getWalletAlias({
		address: wallet.address(),
		network: wallet.network(),
		profile: profile,
	});

	return (
		<TableCell
			variant="start"
			size="sm"
			innerClassName={cn(isCompact ? "space-x-3" : "space-x-4")}
			isCompact={isCompact}
			data-testid="TableCell_Wallet"
		>
			<Tooltip
				content={
					wallet.isStarred()
						? t("WALLETS.PAGE_WALLET_DETAILS.UNSTAR_WALLET")
						: t("WALLETS.PAGE_WALLET_DETAILS.STAR_WALLET")
				}
			>
				<div
					data-testid="WalletIcon__Starred"
					className="flex items-center justify-center"
					onClick={handleToggleStar}
				>
					<Icon
						className={"text-theme-warning-400"}
						name={wallet.isStarred() ? "StarFilled" : "Star"}
						dimensions={starIconDimensions}
					/>
				</div>
			</Tooltip>

			<div
				className={cn(
					"flex-shrink-0 flex items-center border-l border-theme-secondary-300 dark:border-theme-secondary-800",
					{
						"pl-3 ml-3": isCompact,
						"pl-4 ml-4": !isCompact,
					},
				)}
			>
				<Avatar
					size={isCompact ? "xs" : "lg"}
					address={wallet.address()}
					shadowClassName="ring-theme-background group-hover:ring-theme-secondary-100 group-hover:bg-theme-secondary-100 dark:group-hover:ring-black dark:group-hover:bg-black"
				/>
			</div>

			<div className="w-20 flex-1">
				<Address walletName={alias} address={wallet.address()} />
			</div>
		</TableCell>
	);
};

export const InfoCell: React.VFC<InfoCellProperties> = ({ isCompact, wallet }) => (
	<TableCell innerClassName="justify-center text-sm font-bold text-center align-middle" isCompact={isCompact}>
		<div className="inline-flex items-center space-x-1">
			<WalletIcons exclude={excludedIcons} wallet={wallet} iconSize="lg" />
		</div>
	</TableCell>
);

export const BalanceCell: React.VFC<BalanceCellProperties> = ({ wallet, isCompact, isSynced }) => (
	<TableCell innerClassName="font-semibold justify-end" isCompact={isCompact}>
		{isSynced ? (
			<Amount value={wallet.balance()} ticker={wallet.network().ticker()} />
		) : (
			<Skeleton height={16} width={100} />
		)}
	</TableCell>
);

export const CurrencyCell: React.VFC<CurrencyCellProperties> = ({ wallet, isSynced, isCompact }) => {
	const { profileIsSyncingExchangeRates } = useConfiguration();
	const { t } = useTranslation();
	let currencyPlaceholder: React.ReactNode;
	if (profileIsSyncingExchangeRates) {
		currencyPlaceholder = <Skeleton height={16} width={100} />;
	} else if (wallet.network().isTest() || !isSynced) {
		currencyPlaceholder = t("COMMON.NOT_AVAILABLE");
	} else {
		currencyPlaceholder = <Amount ticker={wallet.exchangeCurrency()} value={wallet.convertedBalance()} />;
	}

	return (
		<TableCell
			data-testid={"CurrencyCell"}
			innerClassName="justify-end text-theme-secondary-text"
			isCompact={isCompact}
		>
			{currencyPlaceholder}
		</TableCell>
	);
};

export const ButtonsCell: React.VFC<ButtonsCellProperties> = ({
	wallet,
	isCompact,
	handleSend,
	handleSelectOption,
}) => {
	const { t } = useTranslation();
	const { primaryOptions, secondaryOptions } = useWalletOptions(wallet);

	const isRestoring = !wallet.hasBeenFullyRestored();
	const isButtonDisabled = wallet.balance() === 0 || isRestoring || !wallet.hasSyncedWithNetwork();

	const handleStopPropagation = useCallback((event: React.MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
	}, []);

	return (
		<TableCell variant="end" size="sm" innerClassName="justify-end text-theme-secondary-text" isCompact={isCompact}>
			<div onClick={handleStopPropagation} data-testid="WalletHeader__send-button">
				<Button
					size={isCompact ? "icon" : undefined}
					disabled={isButtonDisabled}
					variant={isCompact ? "transparent" : "secondary"}
					className={cn({
						"my-auto": !isCompact,
						"text-theme-primary-600 hover:text-theme-primary-700": isCompact,
					})}
					onClick={handleSend}
				>
					{t("COMMON.SEND")}
				</Button>
			</div>
			<div data-testid="WalletHeader__more-button" className={cn({ "ml-3": !isCompact })}>
				<Dropdown
					toggleContent={
						<Button
							variant={isCompact ? "transparent" : "secondary"}
							size={isCompact ? "icon" : undefined}
							disabled={isRestoring}
							className={cn("w-11", {
								"-mr-1.5 text-theme-primary-300 hover:text-theme-primary-600": isCompact,
								"flex-1 text-white bg-theme-primary-600 hover:bg-theme-primary-700": !isCompact,
							})}
						>
							<Icon name="EllipsisVertical" size="lg" />
						</Button>
					}
					onSelect={handleSelectOption}
					options={[primaryOptions, secondaryOptions]}
				/>
			</div>
		</TableCell>
	);
};
