import { Contracts } from "@payvo/sdk-profiles";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Header } from "@/app/components/Header";
import { RecipientList } from "@/domains/transaction/components/RecipientList";
import { TotalAmountBox } from "@/domains/transaction/components/TotalAmountBox";
import {
	TransactionDetail,
	TransactionNetwork,
	TransactionSender,
} from "@/domains/transaction/components/TransactionDetail";

export const ReviewStep = ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => {
	const { t } = useTranslation();
	const { unregister, watch } = useFormContext();
	const { fee, participants, minParticipants } = watch();

	useEffect(() => {
		unregister("mnemonic");
	}, [unregister]);

	return (
		<section data-testid="MultiSignature__review-step">
			<Header title={t("TRANSACTION.REVIEW_STEP.TITLE")} subtitle={t("TRANSACTION.REVIEW_STEP.DESCRIPTION")} />

			<TransactionNetwork network={wallet.network()} border={false} />

			<TransactionSender address={wallet.address()} network={wallet.network()} />

			<TransactionDetail label={t("TRANSACTION.MULTISIGNATURE.PARTICIPANTS")}>
				<RecipientList
					isEditable={false}
					recipients={participants}
					showAmount={false}
					showExchangeAmount={wallet.network().isLive()}
					ticker={wallet.currency()}
					variant="condensed"
				/>
			</TransactionDetail>

			<TransactionDetail label={t("TRANSACTION.MULTISIGNATURE.MIN_SIGNATURES")} className="-mt-4">
				<div className="flex items-center space-x-1 font-semibold">
					<span>{minParticipants}</span>
					<span className="text-theme-secondary-500">
						{t("TRANSACTION.MULTISIGNATURE.OUT_OF_LENGTH", { length: participants.length })}
					</span>
				</div>
			</TransactionDetail>

			<div className="mt-2">
				<TotalAmountBox amount={0} fee={fee} ticker={wallet.currency()} />
			</div>
		</section>
	);
};
