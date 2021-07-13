import { Contracts } from "@payvo/sdk-profiles";
import { Button } from "app/components/Button";
import { Icon } from "app/components/Icon";
import { StepIndicator } from "app/components/StepIndicator";
import { TabPanel, Tabs } from "app/components/Tabs";
import { LedgerData, useLedgerContext } from "app/contexts";
import { useActiveProfile } from "app/hooks";
import { NetworkStep } from "domains/wallet/components/NetworkStep";
import React, { useCallback, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { assertWallet } from "utils/assertions";

import { LedgerConnectionStep } from "./LedgerConnectionStep";
import { LedgerImportStep } from "./LedgerImportStep";
import { LedgerScanStep } from "./LedgerScanStep";

const Paginator = ({
	activeIndex,
	isMultiple,
	isNextDisabled,
	isNextLoading,
	onBack,
	onFinish,
	onNext,
	onRetry,
	showRetry,
	size,
}: {
	activeIndex: number;
	isMultiple: boolean;
	isNextDisabled?: boolean;
	isNextLoading?: boolean;
	onBack: () => void;
	onFinish: () => void;
	onNext: () => void;
	onRetry?: () => void;
	showRetry?: boolean;
	size: number;
}) => {
	const { t } = useTranslation();

	return (
		<div className="flex justify-between mt-10">
			<div>
				{showRetry && (
					<Button variant="secondary" onClick={onRetry} data-testid="Paginator__retry-button">
						<Icon name="Reset" />
						<span>{t("COMMON.RETRY")}</span>
					</Button>
				)}
			</div>

			<div className="flex space-x-3">
				{activeIndex < size && (
					<Button variant="secondary" onClick={onBack} data-testid="Paginator__back-button">
						{t("COMMON.BACK")}
					</Button>
				)}

				{activeIndex < size && (
					<Button
						disabled={isNextDisabled || isNextLoading}
						isLoading={isNextLoading}
						onClick={onNext}
						data-testid="Paginator__continue-button"
					>
						{t("COMMON.CONTINUE")}
					</Button>
				)}

				{activeIndex === size && (
					<Button disabled={isNextDisabled} data-testid="Paginator__finish-button" onClick={onFinish}>
						{isMultiple ? t("COMMON.BACK_TO_DASHBOARD") : t("COMMON.GO_TO_WALLET")}
					</Button>
				)}
			</div>
		</div>
	);
};

interface Properties {
	activeIndex?: number;
	onClickEditWalletName: (wallet: Contracts.IReadWriteWallet) => void;
}

export const LedgerTabs = ({ activeIndex = 1, onClickEditWalletName }: Properties) => {
	const activeProfile = useActiveProfile();

	const history = useHistory();
	const { importLedgerWallets, isBusy } = useLedgerContext();

	const { t } = useTranslation();

	const { formState, handleSubmit } = useFormContext();
	const { isValid, isSubmitting } = formState;

	const [importedWallets, setImportedWallets] = useState<LedgerData[]>([]);
	const [activeTab, setActiveTab] = useState<number>(activeIndex);

	const isMultiple = importedWallets.length > 1;

	const [showRetry, setShowRetry] = useState(false);
	const retryFunctionReference = useRef<() => void>();

	const importWallets = useCallback(
		async ({ network, wallets }: any) => {
			setImportedWallets(wallets);
			const coin = activeProfile.coins().set(network.coin(), network.id());
			await importLedgerWallets(wallets, coin, activeProfile);
		},
		[importLedgerWallets, activeProfile],
	);

	const handleNext = useCallback(async () => {
		if (activeTab === 3) {
			await handleSubmit((data: any) => importWallets(data))();
		}

		setActiveTab(activeTab + 1);
	}, [activeTab, handleSubmit, importWallets]);

	const handleBack = () => {
		if (activeTab === 1) {
			return history.push(`/profiles/${activeProfile.id()}/dashboard`);
		}

		setActiveTab(activeTab - (activeTab === 3 ? 2 : 1));
	};

	const handleRetry = useCallback((function_?: () => void) => {
		retryFunctionReference.current = function_;
		setShowRetry(!!function_);
	}, []);

	const handleFinish = () => {
		if (isMultiple) {
			history.push(`/profiles/${activeProfile.id()}/dashboard`);
			return;
		}

		const importedWallet = activeProfile.wallets().findByAddress(importedWallets[0].address);
		assertWallet(importedWallet);

		history.push(`/profiles/${activeProfile.id()}/wallets/${importedWallet?.id()}`);
	};

	return (
		<Tabs activeId={activeTab}>
			<StepIndicator size={4} activeIndex={activeTab} />

			<div data-testid="LedgerTabs" className="mt-8">
				<TabPanel tabId={1}>
					<NetworkStep
						profile={activeProfile}
						title={t("WALLETS.PAGE_IMPORT_WALLET.NETWORK_STEP.TITLE")}
						subtitle={t("WALLETS.PAGE_IMPORT_WALLET.NETWORK_STEP.SUBTITLE")}
					/>
				</TabPanel>
				<TabPanel tabId={2}>
					<LedgerConnectionStep onConnect={() => setActiveTab(3)} />
				</TabPanel>
				<TabPanel tabId={3}>
					<LedgerScanStep profile={activeProfile} setRetryFn={handleRetry} />
				</TabPanel>
				<TabPanel tabId={4}>
					<LedgerImportStep
						wallets={importedWallets}
						profile={activeProfile}
						onClickEditWalletName={onClickEditWalletName}
					/>
				</TabPanel>
			</div>

			<Paginator
				activeIndex={activeTab}
				isMultiple={isMultiple}
				isNextDisabled={isBusy || !isValid}
				isNextLoading={isSubmitting}
				onBack={handleBack}
				onFinish={handleFinish}
				onNext={handleNext}
				onRetry={retryFunctionReference.current}
				showRetry={showRetry}
				size={4}
			/>
		</Tabs>
	);
};
