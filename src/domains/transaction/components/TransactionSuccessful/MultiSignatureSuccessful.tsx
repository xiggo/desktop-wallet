import { Contracts, DTO } from "@payvo/profiles";
import { Header } from "app/components/Header";
import { Image } from "app/components/Image";
import {
	TransactionNetwork,
	TransactionSender,
	TransactionType,
} from "domains/transaction/components/TransactionDetail";
import React from "react";
import { useTranslation } from "react-i18next";

interface TransactionSuccessfulProperties {
	children?: React.ReactNode;
	transaction?: DTO.ExtendedSignedTransactionData;
	senderWallet?: Contracts.IReadWriteWallet;
}

export const MultiSignatureSuccessful = ({ children, transaction, senderWallet }: TransactionSuccessfulProperties) => {
	const { t } = useTranslation();

	return (
		<section data-testid="TransactionSuccessful" className="space-y-8">
			<Header title={t("TRANSACTION.SUCCESS.CREATED")} />

			<Image name="TransactionSignedBanner" domain="transaction" className="w-full" />

			<p className="text-theme-secondary-text">{t("TRANSACTION.SUCCESS.MUSIG_DESCRIPTION")}</p>

			<div>
				{senderWallet && transaction && (
					<>
						<TransactionType type={transaction.type()} />

						<TransactionNetwork network={senderWallet.network()} />

						<TransactionSender
							address={senderWallet.address()}
							alias={senderWallet.alias()}
							isDelegate={senderWallet.isDelegate() && !senderWallet.isResignedDelegate()}
						/>
					</>
				)}

				{children}
			</div>
		</section>
	);
};
