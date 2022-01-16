import { Contracts } from "@payvo/sdk-profiles";
import cn from "classnames";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { LabelWrapper, StyledCircle as Circle, TextWrapper } from "./DelegateFooter.styles";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Avatar } from "@/app/components/Avatar";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { VoteDelegateProperties } from "@/domains/vote/components/DelegateTable/DelegateTable.contracts";

interface FooterContentProperties {
	label: string;
	value: string | number;
	iconName: string;
	disabled?: boolean;
}

const FooterContent = ({ label, value, iconName, disabled }: FooterContentProperties) => (
	<div className="flex space-x-3 px-6">
		<div className="flex flex-col space-y-2 text-right">
			<LabelWrapper>{label}</LabelWrapper>
			<TextWrapper disabled={disabled} data-testid={`DelegateTable__footer--${iconName.toLocaleLowerCase()}`}>
				{value}
			</TextWrapper>
		</div>
		<Circle disabled={disabled} size="lg">
			<Icon name={iconName} size="lg" />
		</Circle>
	</div>
);

interface DelegateFooterProperties {
	selectedWallet: Contracts.IReadWriteWallet;
	availableBalance: number;
	selectedVotes: VoteDelegateProperties[];
	selectedUnvotes: VoteDelegateProperties[];
	maxVotes: number;
	onContinue?: (unvotes: VoteDelegateProperties[], votes: VoteDelegateProperties[]) => void;
}

export const DelegateFooter = ({
	selectedWallet,
	availableBalance,
	selectedVotes,
	selectedUnvotes,
	maxVotes,
	onContinue,
}: DelegateFooterProperties) => {
	const { t } = useTranslation();
	const [tooltipContent, setTooltipContent] = useState("");
	const [isContinueDisabled, setIsContinueDisabled] = useState(true);
	const requiresStakeAmount = selectedWallet.network().votesAmountMinimum() > 0;

	const totalVotes = useMemo(() => {
		if (maxVotes === 1) {
			if (selectedVotes.length > 0) {
				return selectedVotes.length;
			}

			return selectedUnvotes.length;
		}

		return selectedVotes.length + selectedUnvotes.length;
	}, [maxVotes, selectedUnvotes, selectedVotes]);

	useEffect(() => {
		if (totalVotes < 1) {
			setTooltipContent(t("VOTE.DELEGATE_TABLE.TOOLTIP.SELECTED_DELEGATE"));
			setIsContinueDisabled(true);
			return;
		}

		const hasZeroAmount =
			selectedVotes.some(({ amount }) => amount === 0) || selectedUnvotes.some(({ amount }) => amount === 0);

		if (requiresStakeAmount && hasZeroAmount) {
			setTooltipContent(t("VOTE.DELEGATE_TABLE.TOOLTIP.INVALID_AMOUNT"));
			setIsContinueDisabled(true);
			return;
		}

		setTooltipContent("");
		setIsContinueDisabled(false);
	}, [totalVotes, requiresStakeAmount, selectedUnvotes, selectedVotes, t]);

	return (
		<div
			className="fixed inset-x-0 bottom-0 w-screen py-8 shadow-footer-smooth dark:shadow-footer-smooth-dark bg-theme-background"
			data-testid="DelegateTable__footer"
		>
			<div className="container px-10 mx-auto">
				<div className="flex h-11 font-semibold">
					<div className="flex mr-auto divide-x divide-theme-secondary-300 dark:divide-theme-secondary-800">
						<div className={cn("flex space-x-3", { "pr-5": requiresStakeAmount })}>
							<Avatar size="lg" address={selectedWallet.address()} noShadow />
							<div className={cn("flex flex-col space-y-2", { "w-36": requiresStakeAmount })}>
								<LabelWrapper>{t("COMMON.ADDRESS")}</LabelWrapper>
								<Address address={selectedWallet.address()} addressClass="leading-tight" size="lg" />
							</div>
						</div>

						{requiresStakeAmount && (
							<div
								className="flex flex-col space-y-2 px-6"
								data-testid="DelegateTable__available-balance"
							>
								<LabelWrapper>
									{t("VOTE.DELEGATE_TABLE.VOTE_AMOUNT.AVAILABLE_TO_VOTE", {
										percent: Math.ceil((availableBalance / selectedWallet.balance()) * 100),
									})}
								</LabelWrapper>
								<TextWrapper>
									<Amount value={availableBalance} ticker={selectedWallet.network().ticker()} />
								</TextWrapper>
							</div>
						)}
					</div>

					<div className="flex mr-2 divide-x divide-theme-secondary-300 dark:divide-theme-secondary-800">
						<FooterContent
							disabled={selectedVotes.length === 0}
							label={t("VOTE.DELEGATE_TABLE.VOTES")}
							value={selectedVotes.length}
							iconName="Vote"
						/>

						<FooterContent
							disabled={selectedUnvotes.length === 0}
							label={t("VOTE.DELEGATE_TABLE.UNVOTES")}
							value={selectedUnvotes.length}
							iconName="Unvote"
						/>

						<FooterContent
							label={t("VOTE.DELEGATE_TABLE.TOTAL")}
							value={`${totalVotes}/${maxVotes}`}
							iconName="VoteCombination"
						/>
					</div>

					<Tooltip content={tooltipContent} disabled={!isContinueDisabled}>
						<span data-testid="DelegateTable__continue--wrapper">
							<Button
								disabled={isContinueDisabled}
								onClick={() => onContinue?.(selectedUnvotes, selectedVotes)}
								data-testid="DelegateTable__continue-button"
							>
								{t("COMMON.CONTINUE")}
							</Button>
						</span>
					</Tooltip>
				</div>
			</div>
		</div>
	);
};
