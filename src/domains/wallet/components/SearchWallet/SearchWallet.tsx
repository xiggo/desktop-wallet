import { Contracts } from "@payvo/profiles";
import { Address } from "app/components/Address";
import { Amount, AmountCrypto } from "app/components/Amount";
import { Avatar } from "app/components/Avatar";
import { Button } from "app/components/Button";
import { EmptyResults } from "app/components/EmptyResults";
import { HeaderSearchBar } from "app/components/Header/HeaderSearchBar";
import { Modal } from "app/components/Modal";
import { Table, TableCell, TableRow } from "app/components/Table";
import { useSearchWallet } from "app/hooks/use-search-wallet";
import { NetworkIcon } from "domains/network/components/NetworkIcon";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { SearchWalletListItemProperties, SearchWalletProperties } from "./SearchWallet.models";

const SearchWalletListItem = ({
	address,
	balance,
	network,
	convertedBalance,
	currency,
	disabled,
	exchangeCurrency,
	index,
	name,
	showConvertedValue,
	showNetwork,
	onAction,
}: SearchWalletListItemProperties) => {
	const { t } = useTranslation();

	return (
		<TableRow>
			<TableCell variant="start" innerClassName="space-x-4">
				<div className="flex-shrink-0 -space-x-2">
					{showNetwork && <NetworkIcon size="lg" network={network} />}
					<Avatar size="lg" address={address} />
				</div>
				<Address walletName={name} address={address} maxNameChars={16} />
			</TableCell>

			<TableCell innerClassName="font-semibold justify-end">
				<AmountCrypto value={balance} ticker={currency} />
			</TableCell>

			{showConvertedValue && (
				<TableCell innerClassName="text-theme-secondary-400 justify-end">
					<Amount value={convertedBalance} ticker={exchangeCurrency} />
				</TableCell>
			)}

			<TableCell variant="end" innerClassName="justify-end">
				<Button
					data-testid={`SearchWalletListItem__select-${index}`}
					disabled={disabled}
					variant="secondary"
					onClick={() => onAction({ address, name, network })}
				>
					{t("COMMON.SELECT")}
				</Button>
			</TableCell>
		</TableRow>
	);
};

export const SearchWallet = ({
	isOpen,
	title,
	description,
	disableAction,
	wallets,
	searchPlaceholder,
	size,
	showConvertedValue,
	showNetwork,
	onClose,
	onSelectWallet,
	profile,
}: SearchWalletProperties) => {
	const { setSearchKeyword, filteredList: filteredWallets, isEmptyResults } = useSearchWallet(wallets);

	const { t } = useTranslation();

	const columns = useMemo(() => {
		const commonColumns = [
			{
				Header: t("COMMON.WALLET_ADDRESS"),
				accessor: (wallet: Contracts.IReadWriteWallet) => wallet.alias() || wallet.address(),
			},
			{
				Header: t("COMMON.BALANCE"),
				accessor: (wallet: Contracts.IReadWriteWallet) => wallet.balance?.().toFixed(0),
				className: "justify-end",
			},
		];

		if (showConvertedValue) {
			return [
				...commonColumns,
				{
					Header: t("COMMON.VALUE"),
					accessor: (wallet: Contracts.IReadWriteWallet) => wallet.convertedBalance?.().toFixed(0),
					className: "justify-end",
				},
				{
					Header: (
						<HeaderSearchBar
							placeholder={searchPlaceholder}
							offsetClassName="top-1/3 -translate-y-16 -translate-x-6"
							onSearch={setSearchKeyword}
							onReset={() => setSearchKeyword("")}
							debounceTimeout={100}
							noToggleBorder
						/>
					),
					accessor: "search",
					className: "justify-end",
					disableSortBy: true,
				},
			];
		}

		return [
			...commonColumns,
			{
				Header: (
					<HeaderSearchBar
						placeholder={searchPlaceholder}
						offsetClassName="top-1/3 -translate-y-16 -translate-x-6"
						onSearch={setSearchKeyword}
						onReset={() => setSearchKeyword("")}
						debounceTimeout={100}
						noToggleBorder
					/>
				),
				accessor: "search",
				className: "justify-end",
				disableSortBy: true,
			},
		];
	}, [searchPlaceholder, setSearchKeyword, showConvertedValue, t]);

	return (
		<Modal title={title} description={description} isOpen={isOpen} size={size} onClose={onClose}>
			<div className="mt-8">
				<Table columns={columns} data={filteredWallets}>
					{(wallet: Contracts.IReadWriteWallet, index: number) => (
						<SearchWalletListItem
							index={index}
							address={wallet.address()}
							balance={wallet.balance()}
							convertedBalance={wallet.convertedBalance()}
							disabled={disableAction?.(wallet)}
							network={wallet.network()}
							currency={wallet.currency()}
							exchangeCurrency={
								wallet.exchangeCurrency() ||
								(profile?.settings().get(Contracts.ProfileSetting.ExchangeCurrency) as string)
							}
							name={wallet.alias()}
							showConvertedValue={showConvertedValue}
							showNetwork={showNetwork}
							onAction={onSelectWallet}
						/>
					)}
				</Table>

				{isEmptyResults && (
					<EmptyResults
						className="mt-16"
						title={t("COMMON.EMPTY_RESULTS.TITLE")}
						subtitle={t("COMMON.EMPTY_RESULTS.SUBTITLE")}
					/>
				)}
			</div>
		</Modal>
	);
};

SearchWallet.defaultProps = {
	isOpen: false,
	showConvertedValue: true,
	showNetwork: true,
	size: "5xl",
};
