import { isNil } from "@arkecosystem/utils";
import { Contracts, DTO } from "@payvo/profiles";
import { Amount, AmountCrypto } from "app/components/Amount";
import { formatCrypto, formatFiat, getDecimalsByTicker } from "app/components/Amount/Amount.helpers";
import { Label } from "app/components/Label";
import { Tooltip } from "app/components/Tooltip";
import React from "react";
import { useTranslation } from "react-i18next";

interface ExchangeTooltipProperties {
	value: number;
	ticker: string;
	isTestNetwork?: boolean;
	children: React.ReactNode;
}

const ExchangeTooltip: React.FC<ExchangeTooltipProperties> = ({
	value,
	ticker,
	isTestNetwork,
	children,
}: ExchangeTooltipProperties) => {
	const { t } = useTranslation();

	const exchangeAmount = (): string => {
		if (isTestNetwork) {
			return t("COMMON.NOT_AVAILABLE");
		}

		const isFiat = getDecimalsByTicker(ticker) <= 2;

		if (isFiat) {
			return formatFiat({ ticker, value });
		}

		return formatCrypto({ ticker, value });
	};

	return (
		<Tooltip content={exchangeAmount()} className="xl:opacity-0">
			<div data-testid="TransactionAmount__tooltip">{children}</div>
		</Tooltip>
	);
};

interface TransactionRowProperties {
	isSent: boolean;
	wallet: Contracts.IReadWriteWallet;
	total: number;
	convertedTotal?: number;
	exchangeCurrency?: string;
	exchangeTooltip?: boolean;
	isTestNetwork?: boolean;
}

const BaseTransactionRowAmount: React.FC<TransactionRowProperties> = ({
	isSent,
	wallet,
	total,
	convertedTotal,
	exchangeCurrency,
	exchangeTooltip,
	isTestNetwork,
}: TransactionRowProperties) => {
	const isNegative = total !== 0 && isSent;
	const TransactionAmount = (
		<Label color={isSent ? "danger" : "success"} className="whitespace-nowrap">
			<AmountCrypto showSign ticker={wallet.currency()} value={total} isNegative={isNegative} />
		</Label>
	);

	if (!exchangeCurrency || isNil(convertedTotal)) {
		return TransactionAmount;
	}

	if (!exchangeTooltip) {
		return <Amount value={convertedTotal} ticker={exchangeCurrency} className="text-theme-secondary-text" />;
	}

	return (
		<ExchangeTooltip value={convertedTotal} ticker={exchangeCurrency} isTestNetwork={isTestNetwork}>
			{TransactionAmount}
		</ExchangeTooltip>
	);
};

const TransactionRowAmount = ({
	transaction,
	exchangeCurrency,
	exchangeTooltip,
}: {
	transaction: DTO.ExtendedConfirmedTransactionData;
	exchangeCurrency?: string;
	exchangeTooltip?: boolean;
}): JSX.Element => (
	<BaseTransactionRowAmount
		isSent={transaction.isSent()}
		wallet={transaction.wallet()}
		total={transaction.total()}
		convertedTotal={transaction.convertedTotal()}
		exchangeCurrency={exchangeCurrency}
		exchangeTooltip={exchangeTooltip}
		isTestNetwork={transaction.wallet().network().isTest()}
	/>
);

export { BaseTransactionRowAmount, TransactionRowAmount };
