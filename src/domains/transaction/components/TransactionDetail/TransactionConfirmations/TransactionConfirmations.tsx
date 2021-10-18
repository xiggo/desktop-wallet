import { BigNumber } from "@payvo/helpers";
import { DTO } from "@payvo/profiles";
import { Icon } from "app/components/Icon";
import React from "react";
import { useTranslation } from "react-i18next";

import { TransactionDetail } from "../TransactionDetail";

interface TransactionConfirmationsProperties {
	transaction: DTO.ExtendedConfirmedTransactionData;
}

export const TransactionConfirmations = ({ transaction }: TransactionConfirmationsProperties) => {
	const { t } = useTranslation();

	const renderConfirmationStatus = (isConfirmed: boolean, confirmations: BigNumber) => {
		const confirmationStatusStyle = isConfirmed ? "text-theme-success-600" : "text-theme-warning-300";

		if (isConfirmed) {
			return (
				<div className="flex items-center space-x-2">
					<Icon name="CircleCheckMark" className={confirmationStatusStyle} size="lg" />
					<span>{confirmations.toNumber()}</span>
				</div>
			);
		}

		return (
			<div className="flex items-center space-x-2">
				<Icon name="Clock" className={confirmationStatusStyle} size="lg" />
				<span>{t("TRANSACTION.NOT_YET_CONFIRMED")}</span>
			</div>
		);
	};

	return (
		<TransactionDetail label={t("TRANSACTION.CONFIRMATIONS")}>
			{renderConfirmationStatus(transaction.isConfirmed(), transaction.confirmations())}
		</TransactionDetail>
	);
};
