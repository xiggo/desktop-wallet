import { Address } from "app/components/Address";
import { Avatar } from "app/components/Avatar";
import { Button } from "app/components/Button";
import { EmptyResults } from "app/components/EmptyResults";
import { HeaderSearchBar } from "app/components/Header/HeaderSearchBar";
import { Modal } from "app/components/Modal";
import { Table, TableCell, TableRow } from "app/components/Table";
import { TableColumn } from "app/components/Table/TableColumn.models";
import { useSearchWallet } from "app/hooks/use-search-wallet";
import React from "react";
import { useTranslation } from "react-i18next";

import { RecipientListItemProperties, RecipientProperties, SearchRecipientProperties } from "./SearchRecipient.models";

const RecipientListItem = ({ index, recipient, onAction, selectedAddress }: RecipientListItemProperties) => {
	const { t } = useTranslation();

	const renderButton = () => {
		if (selectedAddress === recipient.address) {
			return (
				<Button
					data-testid={`RecipientListItem__selected-button-${index}`}
					variant="reverse"
					onClick={() => onAction(recipient.address)}
				>
					{t("COMMON.SELECTED")}
				</Button>
			);
		}

		return (
			<Button
				data-testid={`RecipientListItem__select-button-${index}`}
				variant="secondary"
				onClick={() => onAction(recipient.address)}
			>
				{t("COMMON.SELECT")}
			</Button>
		);
	};

	return (
		<TableRow key={recipient.id} border>
			<TableCell variant="start" innerClassName="space-x-4">
				<Avatar size="lg" address={recipient.address} />
				<Address walletName={recipient.alias} address={recipient.address} />
			</TableCell>

			<TableCell>
				<span data-testid="RecipientListItem__type">
					{recipient.type === "wallet" ? t("COMMON.MY_WALLET") : t("COMMON.CONTACT")}
				</span>
			</TableCell>

			<TableCell variant="end" innerClassName="justify-end">
				{renderButton()}
			</TableCell>
		</TableRow>
	);
};

export const SearchRecipient = ({
	title,
	description,
	isOpen,
	onClose,
	onAction,
	recipients,
	selectedAddress,
}: SearchRecipientProperties) => {
	const { setSearchKeyword, filteredList: filteredRecipients, isEmptyResults } = useSearchWallet({
		wallets: recipients,
	});

	const { t } = useTranslation();

	const columns: TableColumn[] = [
		{
			Header: t("COMMON.WALLET_ADDRESS"),
			accessor: (recipient: RecipientProperties) => recipient.alias,
		},
		{
			Header: t("COMMON.TYPE"),
			accessor: "type",
		},
		{
			Header: (
				<HeaderSearchBar
					placeholder={t("TRANSACTION.MODAL_SEARCH_RECIPIENT.SEARCH_PLACEHOLDER")}
					offsetClassName="top-1/3 -translate-y-16 -translate-x-6"
					onSearch={setSearchKeyword}
					onReset={() => setSearchKeyword("")}
					debounceTimeout={100}
					noToggleBorder
				/>
			),
			accessor: "search",
			className: "justify-end no-border",
			disableSortBy: true,
		},
	];

	return (
		<Modal
			isOpen={isOpen}
			title={title || t("TRANSACTION.MODAL_SEARCH_RECIPIENT.TITLE")}
			description={description || t("TRANSACTION.MODAL_SEARCH_RECIPIENT.DESCRIPTION")}
			size="5xl"
			onClose={onClose}
		>
			<div className="mt-8">
				<Table columns={columns} data={filteredRecipients}>
					{(recipient: RecipientProperties, index: number) => (
						<RecipientListItem
							index={index}
							selectedAddress={selectedAddress}
							recipient={recipient}
							onAction={onAction}
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
