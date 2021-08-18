import { Contracts, DTO } from "@payvo/profiles";
import { Header } from "app/components/Header";
import { Image } from "app/components/Image";
import React from "react";
import { useTranslation } from "react-i18next";

import { Signatures } from "./Signatures";

export const SentStep = ({
	transaction,
	wallet,
}: {
	transaction: DTO.ExtendedSignedTransactionData;
	wallet: Contracts.IReadWriteWallet;
}) => {
	const { t } = useTranslation();
	return (
		<section>
			<Header title={t("TRANSACTION.SUCCESS.TITLE")} />

			<Image name="TransactionSuccessBanner" domain="transaction" className="my-4 w-full" />

			<p className="text-theme-secondary-700">
				{t("TRANSACTION.MODAL_MULTISIGNATURE_DETAIL.STEP_3.DESCRIPTION")}
			</p>

			<div className="mt-4">
				<Signatures transaction={transaction} wallet={wallet} />
			</div>
		</section>
	);
};
