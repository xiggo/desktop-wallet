import { Contracts, DTO } from "@payvo/sdk-profiles";
import { Circle } from "app/components/Circle";
import { Clipboard } from "app/components/Clipboard";
import { Header } from "app/components/Header";
import { Icon } from "app/components/Icon";
import { TruncateMiddleDynamic } from "app/components/TruncateMiddleDynamic";
import { useEnvironmentContext } from "app/contexts";
import {
	TransactionAmount,
	TransactionDetail,
	TransactionFee,
	TransactionRecipients,
	TransactionSender,
	TransactionTimestamp,
	TransactionVotes,
} from "domains/transaction/components/TransactionDetail";
import { useTransactionTypes } from "domains/transaction/hooks/use-transaction-types";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Signatures } from "./Signatures";

export const SummaryStep = ({
	wallet,
	transaction,
}: {
	wallet: Contracts.IReadWriteWallet;
	transaction: DTO.ExtendedSignedTransactionData;
}) => {
	const { env } = useEnvironmentContext();
	const { t } = useTranslation();

	const { getLabel } = useTransactionTypes();

	const [senderAddress, setSenderAddress] = useState("");

	const reference = useRef(null);

	const type = transaction.type();

	// TODO: Move this helpers to SignedData on platform-sdk
	const participants = transaction
		.get<{ publicKeys: string[] }>("multiSignature")
		.publicKeys.filter((pubKey) => pubKey !== wallet.publicKey());

	let recipients: any;
	let transactionAmount: number;

	if (transaction.isTransfer() || transaction.isMultiPayment()) {
		recipients = transaction.recipients();
		transactionAmount = transaction.amount();
	}

	const [delegates, setDelegates] = useState<{
		votes: Contracts.IReadOnlyWallet[];
		unvotes: Contracts.IReadOnlyWallet[];
	}>({
		unvotes: [],
		votes: [],
	});

	useEffect(() => {
		const setAddress = async () => {
			const { address } = await wallet.coin().address().fromPublicKey(transaction.get("senderPublicKey"));
			setSenderAddress(address);
		};

		const findVoteDelegates = () => {
			if (["vote", "unvote"].includes(type)) {
				const asset = transaction.get<{ votes: string[] }>("asset");
				const votes = asset.votes.filter((vote) => vote.startsWith("+")).map((s) => s.slice(1));
				const unvotes = asset.votes.filter((vote) => vote.startsWith("-")).map((s) => s.slice(1));

				setDelegates({
					unvotes: env.delegates().map(wallet, unvotes),
					votes: env.delegates().map(wallet, votes),
				});
			}
		};

		setAddress();
		findVoteDelegates();
	}, [env, wallet, transaction, type]);

	return (
		<section>
			<Header title={getLabel(type)} />

			<TransactionSender address={senderAddress} alias={wallet.alias()} border={false} />

			{recipients && <TransactionRecipients currency={wallet.currency()} recipients={recipients} />}

			{(transaction.isTransfer() || transaction.isMultiPayment()) && (
				<TransactionAmount
					amount={transactionAmount!}
					currency={wallet.currency()}
					isMultiPayment={recipients.length > 1}
					isSent={true}
				/>
			)}

			{(type === "vote" || type === "unvote") && <TransactionVotes {...delegates} />}

			{type === "ipfs" && (
				<TransactionDetail
					label={t("TRANSACTION.IPFS_HASH")}
					extra={
						<Circle className="border-theme-text" size="lg">
							<Icon name="Ipfs" size="lg" />
						</Circle>
					}
				>
					{transaction.get<{ hash: string }>("asset").hash}
				</TransactionDetail>
			)}

			<TransactionFee currency={wallet.currency()} value={transaction.fee()} />

			<TransactionTimestamp timestamp={transaction.timestamp()} />

			<TransactionDetail label={t("TRANSACTION.CONFIRMATIONS")}>
				{t("TRANSACTION.MODAL_MULTISIGNATURE_DETAIL.WAITING_FOR_SIGNATURES")}
			</TransactionDetail>

			<TransactionDetail label={t("TRANSACTION.ID")}>
				<div className="flex items-center space-x-3">
					<span ref={reference} className="overflow-hidden">
						<TruncateMiddleDynamic value={transaction.id()} parentRef={reference} />
					</span>

					<span className="flex text-theme-primary-300 dark:text-theme-secondary-600">
						<Clipboard variant="icon" data={transaction.id()}>
							<Icon name="Copy" />
						</Clipboard>
					</span>
				</div>
			</TransactionDetail>

			<div className="px-10 pt-6 -mx-10 mt-4 border-t border-theme-secondary-300 dark:border-theme-secondary-800">
				<Signatures transactionId={transaction.id()} publicKeys={participants} wallet={wallet} />
			</div>
		</section>
	);
};
