import { Address } from "app/components/Address";
import { Avatar } from "app/components/Avatar";
import { Button } from "app/components/Button";
import { Icon } from "app/components/Icon";
import { Tooltip } from "app/components/Tooltip";
import React from "react";
import { useTranslation } from "react-i18next";

import { LabelWrapper, StyledCircle as Circle, TextWrapper } from "./DelegateFooter.styles";

interface FooterContentProperties {
	label: string;
	value: string | number;
	iconName: string;
	disabled?: boolean;
}

const FooterContent = ({ label, value, iconName, disabled }: FooterContentProperties) => (
	<div className="flex space-x-3 px-6">
		<div className="flex flex-col space-y-2">
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
	selectedWallet: string;
	selectedVotes: string[];
	selectedUnvotes: string[];
	maxVotes: number;
	onContinue?: (unvotes: string[], votes: string[]) => void;
}

export const DelegateFooter = ({
	selectedWallet,
	selectedVotes,
	selectedUnvotes,
	maxVotes,
	onContinue,
}: DelegateFooterProperties) => {
	const { t } = useTranslation();

	const getTotalVotes = () => {
		if (maxVotes === 1) {
			return selectedVotes.length || selectedUnvotes.length;
		}

		return selectedVotes.length + selectedUnvotes.length;
	};

	return (
		<div
			className="fixed inset-x-0 bottom-0 w-screen py-8 shadow-footer-smooth dark:shadow-footer-smooth-dark bg-theme-background"
			data-testid="DelegateTable__footer"
		>
			<div className="container px-10 mx-auto">
				<div className="flex h-11 font-semibold">
					<div className="flex space-x-3 mr-auto">
						<Avatar size="lg" address={selectedWallet} noShadow />
						<div className="flex flex-col space-y-2">
							<LabelWrapper>{t("COMMON.ADDRESS")}</LabelWrapper>
							<Address address={selectedWallet} addressClass="leading-tight" size="lg" />
						</div>
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
							value={`${getTotalVotes()}/${maxVotes}`}
							iconName="VoteCombination"
						/>
					</div>

					<Tooltip content={t("VOTE.DELEGATE_TABLE.TOOLTIP.SELECTED_DELEGATE")} disabled={!!getTotalVotes()}>
						<Button
							disabled={!getTotalVotes()}
							onClick={() => onContinue?.(selectedUnvotes, selectedVotes)}
							data-testid="DelegateTable__continue-button"
						>
							{t("COMMON.CONTINUE")}
						</Button>
					</Tooltip>
				</div>
			</div>
		</div>
	);
};
