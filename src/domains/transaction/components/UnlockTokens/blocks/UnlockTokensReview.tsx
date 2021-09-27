import { Contracts } from "@payvo/profiles";
import { Button } from "app/components/Button";
import { Header } from "app/components/Header";
import { useWalletAlias } from "app/hooks";
import { useExchangeRate } from "app/hooks/use-exchange-rate";
import { TransactionAmount, TransactionFee, TransactionSender } from "domains/transaction/components/TransactionDetail";
import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { UnlockTokensFormState } from "../UnlockTokens.contracts";

interface Properties {
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
	onBack: () => void;
	onConfirm: () => void;
}

export const UnlockTokensReview: React.FC<Properties> = ({ profile, wallet, onBack, onConfirm }: Properties) => {
	const { t } = useTranslation();

	const ticker = wallet.currency();
	const exchangeTicker = wallet.exchangeCurrency();

	const { getValues } = useFormContext<UnlockTokensFormState>();

	const { getWalletAlias } = useWalletAlias();

	const { isDelegate, alias } = useMemo(
		() =>
			getWalletAlias({
				address: wallet.address(),
				network: wallet.network(),
				profile,
			}),
		[getWalletAlias, profile, wallet],
	);

	const { convert } = useExchangeRate({ exchangeTicker, ticker });

	const { amount, fee } = getValues(["amount", "fee"]);

	return (
		<>
			<Header title={t("TRANSACTION.UNLOCK_TOKENS.REVIEW.TITLE")} />

			<TransactionSender
				className="pt-4"
				address={wallet.address()}
				alias={alias}
				border={false}
				isDelegate={isDelegate}
				paddingPosition="none"
			/>

			<TransactionAmount
				isTotalAmount
				amount={amount}
				convertedAmount={convert(amount)}
				currency={ticker}
				exchangeCurrency={exchangeTicker}
				isSent={false}
				paddingPosition="top"
			/>

			<TransactionFee
				value={fee}
				convertedValue={convert(fee)}
				currency={ticker}
				exchangeCurrency={exchangeTicker}
				paddingPosition="top"
			/>

			<div className="flex justify-end space-x-3">
				<Button variant="secondary" onClick={onBack}>
					{t("COMMON.BACK")}
				</Button>
				<Button variant="primary" onClick={onConfirm}>
					{t("COMMON.CONFIRM")}
				</Button>
			</div>
		</>
	);
};