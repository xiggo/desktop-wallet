import { Contracts } from "@payvo/profiles";
import { Avatar } from "app/components/Avatar";
import { Button } from "app/components/Button";
import { Icon } from "app/components/Icon";
import { Link } from "app/components/Link";
import { TableCell, TableRow } from "app/components/Table";
import { Tooltip } from "app/components/Tooltip";
import cn from "classnames";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { delegateExistsInVotes } from "../DelegateTable.helpers";
import { VoteDelegateProperties } from "../DelegateTable.models";
import { DelegateRowSkeleton } from "./DelegateRowSkeleton";
import { DelegateVoteAmount } from "./DelegateVoteAmount";

interface DelegateRowProperties {
	index: number;
	delegate: Contracts.IReadOnlyWallet;
	selectedUnvotes: VoteDelegateProperties[];
	selectedVotes: VoteDelegateProperties[];
	voted?: Contracts.VoteRegistryItem;
	isVoteDisabled?: boolean;
	isLoading?: boolean;
	selectedWallet: Contracts.IReadWriteWallet;
	availableBalance: number;
	setAvailableBalance: (balance: number) => void;
	toggleUnvotesSelected: (address: string, voteAmount?: number) => void;
	toggleVotesSelected: (address: string, voteAmount?: number) => void;
}

export const DelegateRow = ({
	index,
	voted,
	delegate,
	selectedUnvotes,
	selectedVotes,
	isVoteDisabled,
	isLoading,
	selectedWallet,
	availableBalance,
	setAvailableBalance,
	toggleUnvotesSelected,
	toggleVotesSelected,
}: DelegateRowProperties) => {
	const { t } = useTranslation();
	const requiresStakeAmount = selectedWallet.network().votesAmountMinimum() > 0;

	const isSelectedUnvote = useMemo(
		() =>
			!!selectedUnvotes?.find((unvote) => {
				const isEqualToDelegate = unvote.delegateAddress === delegate?.address?.();

				if (isEqualToDelegate && requiresStakeAmount) {
					return unvote.amount === voted?.amount;
				}

				return isEqualToDelegate;
			}),
		[delegate, requiresStakeAmount, selectedUnvotes, voted],
	);

	const isSelectedVote = useMemo(() => !!voted || !!delegateExistsInVotes(selectedVotes, delegate?.address?.()), [
		delegate,
		voted,
		selectedVotes,
	]);

	const isChanged = useMemo(() => {
		const alreadyExistsInVotes = !!delegateExistsInVotes(selectedVotes, delegate?.address?.());
		const alreadyExistsInUnvotes =
			!!delegateExistsInVotes(selectedUnvotes, delegate?.address?.()) && !isSelectedUnvote;

		return !!voted && (alreadyExistsInVotes || alreadyExistsInUnvotes);
	}, [selectedVotes, selectedUnvotes, isSelectedUnvote, voted, delegate]);

	const rowColor = useMemo(() => {
		if (isChanged) {
			return "bg-theme-warning-50 dark:bg-theme-background dark:border-theme-warning-600";
		}

		if (voted) {
			return !isSelectedUnvote
				? "bg-theme-primary-50 dark:bg-theme-background dark:border-theme-primary-600"
				: "bg-theme-danger-50 dark:bg-theme-background dark:border-theme-danger-400";
		}

		if (isSelectedVote) {
			return "bg-theme-primary-reverse-50 dark:bg-theme-background dark:border-theme-primary-reverse-600";
		}
	}, [isChanged, voted, isSelectedVote, isSelectedUnvote]);

	if (isLoading) {
		return <DelegateRowSkeleton requiresStakeAmount={requiresStakeAmount} />;
	}

	const renderButton = () => {
		if (isChanged) {
			return (
				<Button
					variant="warning"
					onClick={() => {
						if (delegateExistsInVotes(selectedVotes, delegate?.address?.())) {
							toggleVotesSelected?.(delegate.address());
						}

						toggleUnvotesSelected?.(delegate.address(), voted!.amount);
					}}
					data-testid={`DelegateRow__toggle-${index}`}
				>
					{t("COMMON.CHANGED")}
				</Button>
			);
		}

		if (voted) {
			return (
				<Button
					variant={isSelectedUnvote ? "danger" : "primary"}
					onClick={() => toggleUnvotesSelected?.(delegate.address())}
					data-testid={`DelegateRow__toggle-${index}`}
				>
					{!isSelectedUnvote ? t("COMMON.CURRENT") : t("COMMON.UNSELECTED")}
				</Button>
			);
		}

		if (isVoteDisabled && !isSelectedVote) {
			return (
				<Tooltip content={t("VOTE.DELEGATE_TABLE.TOOLTIP.MAX_VOTES")}>
					<span>
						<Button variant="primary" disabled data-testid={`DelegateRow__toggle-${index}`}>
							{t("COMMON.SELECT")}
						</Button>
					</span>
				</Tooltip>
			);
		}

		return (
			<Button
				variant={isSelectedVote ? "reverse" : "secondary"}
				onClick={() => toggleVotesSelected?.(delegate.address())}
				data-testid={`DelegateRow__toggle-${index}`}
			>
				{isSelectedVote ? t("COMMON.SELECTED") : t("COMMON.SELECT")}
			</Button>
		);
	};

	return (
		<TableRow key={delegate.address()}>
			<TableCell
				variant="start"
				innerClassName={cn("space-x-4 font-bold border-2 border-r-0 border-transparent", rowColor)}
			>
				<Avatar size="lg" className="-ml-0.5" address={delegate.address()} noShadow />
				<span>{delegate.username()}</span>
			</TableCell>

			<TableCell
				className="w-24"
				innerClassName={cn("justify-center border-t-2 border-b-2 border-transparent", rowColor)}
			>
				<Link
					data-testid="DelegateRow__address"
					to={delegate.explorerLink()}
					tooltip={t("COMMON.OPEN_IN_EXPLORER")}
					showExternalIcon={false}
					isExternal
				>
					<Icon name="ArrowExternal" />
				</Link>
			</TableCell>

			{requiresStakeAmount && (
				<DelegateVoteAmount
					voted={voted}
					selectedWallet={selectedWallet}
					isSelectedVote={isSelectedVote}
					isSelectedUnvote={isSelectedUnvote}
					selectedVotes={selectedVotes}
					selectedUnvotes={selectedUnvotes}
					delegateAddress={delegate.address()}
					availableBalance={availableBalance}
					setAvailableBalance={setAvailableBalance}
					toggleUnvotesSelected={toggleUnvotesSelected}
					toggleVotesSelected={toggleVotesSelected}
					rowColor={rowColor}
				/>
			)}

			<TableCell
				variant="end"
				className="w-40"
				innerClassName={cn("justify-end border-2 border-l-0 border-transparent", rowColor)}
			>
				<div className="-mr-0.5">{renderButton()}</div>
			</TableCell>
		</TableRow>
	);
};

DelegateRow.defaultProps = {
	isLoading: false,
	isVoteDisabled: false,
	isVoted: false,
	selectedUnvotes: [],
	selectedVotes: [],
};
