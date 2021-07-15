import { Networks } from "@payvo/sdk";
import { NetworkIcon } from "domains/network/components/NetworkIcon";
import React from "react";
import { useTranslation } from "react-i18next";

import { TransactionDetail, TransactionDetailProperties } from "../TransactionDetail";

type TransactionNetworkProperties = {
	network: Networks.Network;
} & TransactionDetailProperties;

export const TransactionNetwork = ({ network, ...properties }: TransactionNetworkProperties) => {
	const { t } = useTranslation();

	return (
		<TransactionDetail
			data-testid="TransactionNetwork"
			label={t("TRANSACTION.CRYPTOASSET")}
			extra={<NetworkIcon network={network} />}
			{...properties}
		>
			{network.displayName()}
		</TransactionDetail>
	);
};

TransactionNetwork.defaultProps = {
	borderPosition: "top",
};
