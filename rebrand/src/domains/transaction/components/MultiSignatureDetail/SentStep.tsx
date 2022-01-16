import { Contracts, DTO } from "@payvo/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { Signatures } from "./Signatures";
import { Header } from "@/app/components/Header";
import { Image } from "@/app/components/Image";

export const SentStep = ({
	transaction,
	wallet,
	isBroadcast,
}: {
	transaction: DTO.ExtendedSignedTransactionData;
	wallet: Contracts.IReadWriteWallet;
	isBroadcast: boolean;
}) => {
	const { t } = useTranslation();
	const title = isBroadcast ? t("TRANSACTION.SUCCESS.TITLE") : t("TRANSACTION.TRANSACTION_SIGNED");
	const bannerName = isBroadcast ? "TransactionSuccessBanner" : "TransactionSignedBanner";

	return (
		<section>
			<Header title={title} />

			<Image name={bannerName} domain="transaction" className="my-4 w-full" />

			<p className="text-theme-secondary-700">
				{t("TRANSACTION.MODAL_MULTISIGNATURE_DETAIL.STEP_3.DESCRIPTION")}
			</p>

			<div className="mt-4">
				<Signatures transaction={transaction} wallet={wallet} />
			</div>
		</section>
	);
};
