import { Contracts, DTO } from "@payvo/profiles";
import { Form } from "app/components/Form";
import { Modal } from "app/components/Modal";
import { TabPanel, Tabs } from "app/components/Tabs";
import { useEnvironmentContext, useLedgerContext } from "app/contexts";
import { useLedgerModelStatus } from "app/hooks";
import { toasts } from "app/services";
import { ErrorStep } from "domains/transaction/components/ErrorStep";
import { SignInput, useMultiSignatureRegistration, useWalletSignatory } from "domains/transaction/hooks";
import { handleBroadcastError } from "domains/transaction/utils";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AuthenticationStep } from "../AuthenticationStep";
import { Paginator } from "./MultiSignatureDetail.helpers";
import { SentStep } from "./SentStep";
import { SummaryStep } from "./SummaryStep";

interface MultiSignatureDetailProperties {
	isOpen: boolean;
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
	transaction: DTO.ExtendedSignedTransactionData;
	onClose?: () => void;
}

export const MultiSignatureDetail = ({
	isOpen,
	wallet,
	profile,
	transaction,
	onClose,
}: MultiSignatureDetailProperties) => {
	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const { t } = useTranslation();
	const { persist } = useEnvironmentContext();
	const { hasDeviceAvailable, isConnected, connect, transport, ledgerDevice } = useLedgerContext();

	const { isLedgerModelSupported } = useLedgerModelStatus({
		connectedModel: ledgerDevice?.id,
		supportedModels: [Contracts.WalletLedgerModel.NanoX],
	});

	const form = useForm({ mode: "onChange" });
	const { handleSubmit, formState } = form;
	const { isValid, isSubmitting } = formState;

	const [activeStep, setActiveStep] = useState(1);

	const { sign } = useWalletSignatory(wallet);
	const { addSignature } = useMultiSignatureRegistration();

	const isMultiSignatureReady = useMemo(() => {
		try {
			return wallet.coin().multiSignature().isMultiSignatureReady(transaction.data());
		} catch {
			return false;
		}
	}, [wallet, transaction]);

	const canBeBroadcasted =
		wallet.transaction().canBeBroadcasted(transaction.id()) &&
		!wallet.transaction().isAwaitingConfirmation(transaction.id()) &&
		isMultiSignatureReady;

	const canBeSigned = useMemo(() => {
		try {
			return wallet.transaction().canBeSigned(transaction.id());
		} catch {
			return false;
		}
	}, [wallet, transaction]);

	const broadcast = useCallback(async () => {
		try {
			if (!wallet.transaction().canBeBroadcasted(transaction.id())) {
				return;
			}

			const response = await wallet.transaction().broadcast(transaction.id());
			handleBroadcastError(response);

			await wallet.transaction().sync();
			wallet.transaction().restore();

			await persist();
			setActiveStep(3);
		} catch (error) {
			setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
			setActiveStep(10);
		}
	}, [wallet, transaction, persist]);

	const sendSignature = useCallback(
		async ({ encryptionPassword, mnemonic, privateKey, secondMnemonic, secret, wif }: SignInput) => {
			try {
				if (wallet.isLedger()) {
					await connect(profile, wallet.coinId(), wallet.networkId());
					await wallet.ledger().connect(transport);
				}

				const signatory = await sign({
					encryptionPassword,
					mnemonic,
					privateKey,
					secondMnemonic,
					secret,
					wif,
				});

				await addSignature({ signatory, transactionId: transaction.id(), wallet });
				await wallet.transaction().sync();
				wallet.transaction().restore();

				setActiveStep(3);
				await persist();
			} catch {
				toasts.error(t("TRANSACTION.MULTISIGNATURE.ERROR.FAILED_TO_SIGN"));
			}
		},
		[transaction, wallet, t, sign, addSignature, connect, profile, transport, persist],
	);

	const handleSign = () => {
		setActiveStep(2);

		if (wallet.isLedger() && isLedgerModelSupported) {
			handleSubmit((data: any) => sendSignature(data))();
		}
	};

	// Reset ledger authentication steps after reconnecting supported ledger
	useEffect(() => {
		const isAuthenticationStep = activeStep === 2;

		if (isAuthenticationStep && wallet.isLedger() && isLedgerModelSupported) {
			handleSubmit((data: any) => sendSignature(data))();
		}
	}, [ledgerDevice]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<Modal title={""} isOpen={isOpen} onClose={onClose}>
			<Form context={form} onSubmit={broadcast}>
				<Tabs activeId={activeStep}>
					<TabPanel tabId={1}>
						<SummaryStep wallet={wallet} transaction={transaction} />
					</TabPanel>

					<TabPanel tabId={2}>
						<AuthenticationStep
							wallet={wallet}
							ledgerIsAwaitingDevice={!hasDeviceAvailable}
							ledgerIsAwaitingApp={!isConnected}
							ledgerConnectedModel={ledgerDevice?.id}
							ledgerSupportedModels={[Contracts.WalletLedgerModel.NanoX]}
						/>
					</TabPanel>

					<TabPanel tabId={3}>
						<SentStep transaction={transaction} wallet={wallet} />
					</TabPanel>

					<TabPanel tabId={10}>
						<ErrorStep
							onBack={onClose}
							isRepeatDisabled={isSubmitting}
							onRepeat={broadcast}
							errorMessage={errorMessage}
						/>
					</TabPanel>

					<Paginator
						activeStep={activeStep}
						canBeSigned={canBeSigned}
						canBeBroadcasted={canBeBroadcasted}
						onCancel={onClose}
						onSign={handleSign}
						onBack={() => setActiveStep(1)}
						onContinue={handleSubmit((data: any) => sendSignature(data))}
						isLoading={isSubmitting || (wallet.isLedger() && activeStep === 2 && !isLedgerModelSupported)}
						isEnabled={isValid}
						isSubmitting={isSubmitting}
					/>
				</Tabs>
			</Form>
		</Modal>
	);
};

MultiSignatureDetail.defaultProps = {
	isOpen: false,
};

MultiSignatureDetail.displayName = "MultiSignatureDetail";
