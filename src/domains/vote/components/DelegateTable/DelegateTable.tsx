import { Contracts } from "@payvo/profiles";
import { EmptyResults } from "app/components/EmptyResults";
import { Pagination } from "app/components/Pagination";
import { Table } from "app/components/Table";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { DelegateFooter } from "./DelegateFooter";
import { DelegateRow } from "./DelegateRow";

interface DelegateTableProperties {
	delegates: Contracts.IReadOnlyWallet[];
	emptyText?: string;
	isLoading?: boolean;
	itemsPerPage?: number;
	maxVotes: number;
	selectedUnvoteAddresses?: string[];
	selectedVoteAddresses?: string[];
	selectedWallet: string;
	votes?: Contracts.VoteRegistryItem[];
	onContinue?: (unvotes: string[], votes: string[]) => void;
	isPaginationDisabled?: boolean;
	subtitle?: React.ReactNode;
}

export const DelegateTable = ({
	delegates,
	isLoading,
	itemsPerPage,
	maxVotes,
	selectedUnvoteAddresses,
	selectedVoteAddresses,
	selectedWallet,
	votes,
	onContinue,
	isPaginationDisabled,
	subtitle,
}: DelegateTableProperties) => {
	const { t } = useTranslation();
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedUnvotes, setSelectedUnvotes] = useState<string[]>(selectedUnvoteAddresses || []);
	const [selectedVotes, setSelectedVotes] = useState<string[]>(selectedVoteAddresses || []);
	const [isVoteDisabled, setIsVoteDisabled] = useState(false);

	const columns = [
		{
			Header: t("VOTE.DELEGATE_TABLE.NAME"),
			accessor: (delegate: Contracts.IReadOnlyWallet) => isLoading || delegate.username(),
			className: "justify-start",
		},
		{
			Header: t("COMMON.EXPLORER"),
			accessor: (delegate: Contracts.IReadOnlyWallet) => isLoading || delegate.explorerLink(),
			className: "justify-center",
			disableSortBy: true,
		},
		{
			Header: t("VOTE.DELEGATE_TABLE.VOTE"),
			accessor: "onSelect",
			className: "justify-end",
			disableSortBy: true,
		},
	];

	const totalDelegates = delegates.length;
	const hasVotes = votes!.length > 0;

	useEffect(() => {
		if (hasVotes && selectedVotes.length === maxVotes) {
			setIsVoteDisabled(true);
		} else {
			setIsVoteDisabled(false);
		}
	}, [hasVotes, maxVotes, selectedVotes]);

	useEffect(() => window.scrollTo({ behavior: "smooth", top: 0 }), [currentPage]);

	const toggleUnvotesSelected = (address: string) => {
		if (selectedUnvotes.find((delegateAddress) => delegateAddress === address)) {
			setSelectedUnvotes(selectedUnvotes.filter((delegateAddress) => delegateAddress !== address));

			if (maxVotes === 1 && selectedVotes.length > 0) {
				setSelectedVotes([]);
			}

			return;
		}

		if (maxVotes === 1) {
			setSelectedUnvotes([address]);
		} else {
			setSelectedUnvotes([...selectedUnvotes, address]);
		}
	};

	const toggleVotesSelected = (address: string) => {
		if (selectedVotes.find((delegateAddress) => delegateAddress === address)) {
			setSelectedVotes(selectedVotes.filter((delegateAddress) => delegateAddress !== address));

			if (maxVotes === 1 && hasVotes) {
				setSelectedUnvotes([]);
			}

			return;
		}

		if (maxVotes === 1) {
			setSelectedVotes([address]);

			if (hasVotes) {
				setSelectedUnvotes(votes!.map(({ wallet }) => wallet!.address()));
			}
		} else {
			setSelectedVotes([...selectedVotes, address]);
		}
	};

	const handleSelectPage = (page: number) => {
		setCurrentPage(page);
	};

	const paginator = (items: Contracts.IReadOnlyWallet[], currentPage: number, itemsPerPage: number) => {
		if (isPaginationDisabled) {
			return items;
		}

		const offset = (currentPage - 1) * itemsPerPage;
		return items.slice(offset).slice(0, itemsPerPage);
	};

	const showSkeleton = useMemo(() => totalDelegates === 0 && isLoading, [totalDelegates, isLoading]);
	const skeletonList = Array.from({ length: 8 }).fill({});
	const data = showSkeleton ? skeletonList : paginator(delegates, currentPage, itemsPerPage!);

	if (!isLoading && totalDelegates === 0) {
		return (
			<EmptyResults
				className="mt-16"
				title={t("COMMON.EMPTY_RESULTS.TITLE")}
				subtitle={t("VOTE.VOTES_PAGE.NO_RESULTS")}
			/>
		);
	}

	return (
		<div data-testid="DelegateTable">
			<h2 className="mb-6 text-2xl font-bold">{t("VOTE.DELEGATE_TABLE.TITLE")}</h2>

			{subtitle && subtitle}

			<Table columns={columns} data={data}>
				{(delegate: Contracts.IReadOnlyWallet, index: number) => {
					let isVoted = false;

					if (hasVotes) {
						isVoted = !!votes?.find(({ wallet }) => wallet?.address() === delegate?.address?.());
					}

					return (
						<DelegateRow
							index={index}
							delegate={delegate}
							selectedUnvotes={selectedUnvotes}
							selectedVotes={selectedVotes}
							isVoted={isVoted}
							isVoteDisabled={isVoteDisabled}
							isLoading={showSkeleton}
							onUnvoteSelect={toggleUnvotesSelected}
							onVoteSelect={toggleVotesSelected}
						/>
					);
				}}
			</Table>

			<div className="flex justify-center mt-8 w-full">
				{totalDelegates > itemsPerPage! && !isPaginationDisabled && (
					<Pagination
						totalCount={totalDelegates}
						itemsPerPage={itemsPerPage}
						currentPage={currentPage}
						onSelectPage={handleSelectPage}
					/>
				)}
			</div>

			<DelegateFooter
				selectedWallet={selectedWallet}
				selectedVotes={selectedVotes}
				selectedUnvotes={selectedUnvotes}
				maxVotes={maxVotes}
				onContinue={onContinue}
			/>
		</div>
	);
};

DelegateTable.defaultProps = {
	delegates: [],
	isLoading: false,
	itemsPerPage: 51,
	votes: [],
};
