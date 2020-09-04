import { Contracts } from "@arkecosystem/platform-sdk";
import { ReadOnlyWallet } from "@arkecosystem/platform-sdk-profiles";
import { Button } from "app/components/Button";
import { Form } from "app/components/Form";
import { Icon } from "app/components/Icon";
import { Page, Section } from "app/components/Layout";
import { StepIndicator } from "app/components/StepIndicator";
import { TabPanel, Tabs } from "app/components/Tabs";
import { useEnvironmentContext } from "app/contexts";
import { useActiveProfile, useActiveWallet } from "app/hooks/env";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { FirstStep } from "./Step1";
import { SecondStep } from "./Step2";
import { ThirdStep } from "./Step3";
import { FourthStep } from "./Step4";

export const SendVote = () => {
	const { t } = useTranslation();
	const { voteId, senderId } = useParams();
	const { env } = useEnvironmentContext();
	const activeProfile = useActiveProfile();
	const activeWallet = useActiveWallet();
	const networks = useMemo(() => env.availableNetworks(), [env]);

	const [activeTab, setActiveTab] = useState(1);
	const [delegate, setDelegate] = useState<ReadOnlyWallet>((null as unknown) as ReadOnlyWallet);
	const [transaction, setTransaction] = useState((null as unknown) as Contracts.SignedTransactionData);

	const form = useForm({ mode: "onChange" });
	const { clearError, formState, getValues, register, setError, setValue } = form;

	useEffect(() => {
		register("network", { required: true });
		register("senderAddress", { required: true });
		register("vote", { required: true });
		register("fee", { required: true });

		setValue("senderAddress", senderId, true);
		setValue("vote", voteId, true);

		for (const network of networks) {
			if (network.coin() === activeWallet.coinId() && network.id() === activeWallet.networkId()) {
				setValue("network", network, true);

				break;
			}
		}
	}, [activeWallet, networks, register, senderId, setValue, voteId]);

	useEffect(() => {
		setDelegate(env.delegates().findByAddress(activeWallet.coinId(), activeWallet.networkId(), voteId));
	}, [activeWallet, env, voteId]);

	const crumbs = [
		{
			route: `/profiles/${activeProfile.id()}/dashboard`,
			label: t("COMMON.GO_BACK_TO_PORTFOLIO"),
		},
	];

	const handleBack = () => {
		setActiveTab(activeTab - 1);
	};

	const handleNext = () => {
		setActiveTab(activeTab + 1);
	};

	const submitForm = async () => {
		clearError("mnemonic");
		const { fee, mnemonic, senderAddress } = getValues();
		const senderWallet = activeProfile.wallets().findByAddress(senderAddress);

		try {
			const transactionId = await senderWallet!.transaction().signVote({
				fee,
				from: senderAddress,
				sign: {
					mnemonic,
				},
				data: {
					vote: `+${delegate.publicKey()}`,
				},
			});

			await senderWallet!.transaction().broadcast(transactionId);

			await env.persist();

			setTransaction(senderWallet!.transaction().transaction(transactionId));

			handleNext();
		} catch (error) {
			console.error("Could not vote: ", error);

			setValue("mnemonic", "");
			setError("mnemonic", "manual", t("TRANSACTION.INVALID_MNEMONIC"));
		}
	};

	return (
		<Page profile={activeProfile} crumbs={crumbs}>
			<Section className="flex-1">
				<Form className="max-w-xl mx-auto" context={form} onSubmit={submitForm}>
					<Tabs activeId={activeTab}>
						<StepIndicator size={4} activeIndex={activeTab} />

						<div className="mt-8">
							<TabPanel tabId={1}>
								<FirstStep delegate={delegate} profile={activeProfile} wallet={activeWallet} />
							</TabPanel>
							<TabPanel tabId={2}>
								<SecondStep delegate={delegate} profile={activeProfile} wallet={activeWallet} />
							</TabPanel>
							<TabPanel tabId={3}>
								<ThirdStep />
							</TabPanel>
							<TabPanel tabId={4}>
								<FourthStep delegate={delegate} transaction={transaction} senderWallet={activeWallet} />
							</TabPanel>

							<div className="flex justify-end mt-8 space-x-3">
								{activeTab < 4 && (
									<>
										<Button
											disabled={activeTab === 1}
											variant="plain"
											onClick={handleBack}
											data-testid="SendVote__button--back"
										>
											{t("COMMON.BACK")}
										</Button>

										{activeTab < 3 && (
											<Button
												disabled={!formState.isValid}
												onClick={handleNext}
												data-testid="SendVote__button--continue"
											>
												{t("COMMON.CONTINUE")}
											</Button>
										)}

										{activeTab === 3 && (
											<Button
												type="submit"
												disabled={!formState.isValid}
												data-testid="SendVote__button--submit"
											>
												{t("COMMON.SEND")}
											</Button>
										)}
									</>
								)}

								{activeTab === 4 && (
									<>
										<Button variant="plain" data-testid="SendVote__button--back-to-wallet">
											{t("COMMON.BACK_TO_WALLET")}
										</Button>
										<Button
											variant="plain"
											className="space-x-2"
											data-testid="SendVote__button--copy"
										>
											<Icon name="Copy" />
											<span>{t("COMMON.COPY")}</span>
										</Button>
									</>
								)}
							</div>
						</div>
					</Tabs>
				</Form>
			</Section>
		</Page>
	);
};