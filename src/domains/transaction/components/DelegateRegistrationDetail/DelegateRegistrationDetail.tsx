import { Circle } from "app/components/Circle";
import { Icon } from "app/components/Icon";
import { Modal } from "app/components/Modal";
import {
	TransactionConfirmations,
	TransactionDetail,
	TransactionExplorerLink,
	TransactionFee,
	TransactionSender,
	TransactionTimestamp,
} from "domains/transaction/components/TransactionDetail";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface DelegateRegistrationDetailProperties {
	isOpen: boolean;
	transaction: any;
	onClose?: any;
}

export const DelegateRegistrationDetail = ({ isOpen, transaction, onClose }: DelegateRegistrationDetailProperties) => {
	const { t } = useTranslation();

	const wallet = useMemo(() => transaction.wallet(), [transaction]);

	return (
		<Modal title={t("TRANSACTION.MODAL_DELEGATE_REGISTRATION_DETAIL.TITLE")} isOpen={isOpen} onClose={onClose}>
			<TransactionExplorerLink transaction={transaction} />

			<TransactionSender address={transaction.sender()} alias={wallet.alias()} border={false} />

			<TransactionDetail
				label={t("TRANSACTION.DELEGATE_NAME")}
				extra={
					<Circle
						className="text-theme-text border-theme-text dark:text-theme-secondary-600 dark:border-theme-secondary-600"
						size="lg"
					>
						<Icon name="Delegate" size="lg" />
					</Circle>
				}
			>
				{transaction.username()}
			</TransactionDetail>

			<TransactionFee currency={wallet.currency()} value={transaction.fee()} />

			<TransactionTimestamp timestamp={transaction.timestamp()} />

			<TransactionConfirmations transaction={transaction} />
		</Modal>
	);
};

DelegateRegistrationDetail.defaultProps = {
	isOpen: false,
};

DelegateRegistrationDetail.displayName = "DelegateRegistrationDetail";
