import { isEqual } from "@arkecosystem/utils";
import { Contracts } from "@payvo/profiles";
import { Networks } from "@payvo/sdk";
import { useDebounce, useFees } from "app/hooks";
import { InputFee } from "domains/transaction/components/InputFee";
import React, { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

interface Properties {
	type: string;
	data: Record<string, any> | undefined;
	network: Networks.Network;
	profile: Contracts.IProfile;
}

export const FeeField: React.FC<Properties> = ({ type, network, profile, ...properties }: Properties) => {
	const { calculate } = useFees(profile);

	const [isLoadingFee, setIsLoadingFee] = useState(false);

	const { setError, clearErrors, watch, setValue, getValues } = useFormContext();
	const { fees, inputFeeSettings = {} } = watch(["fees", "inputFeeSettings"]);

	// getValues does not get the value of `defaultValues` on first render
	const [defaultFee] = useState(() => watch("fee"));
	const fee = getValues("fee") || defaultFee;

	const [data, isLoadingData] = useDebounce(properties.data, 700);

	const isCalculatingFee = useMemo(() => isLoadingData || isLoadingFee, [isLoadingData, isLoadingFee]);
	const usesSizeBasedFee = useMemo(() => network.feeType() === "size", [network]);
	const usesStaticFee = useMemo(() => network.feeType() !== "dynamic" || !fees?.isDynamic, [fees, network]);

	useEffect(() => {
		if (!usesSizeBasedFee) {
			return;
		}

		if (isCalculatingFee) {
			// This message does not need i18n as it is only intended to mark
			// the form as invalid until fee calculation has been completed.
			setError("feeCalculation", { message: "fee calculation not completed" });
		} else {
			clearErrors("feeCalculation");
		}
	}, [isCalculatingFee, setError, clearErrors, usesSizeBasedFee]);

	useEffect(() => {
		const resetFees = () => {
			setValue("fees", { avg: 0, max: 0, min: 0, static: 0 });
			setValue("fee", 0, { shouldDirty: false, shouldValidate: false });
		};

		const recalculateFee = async () => {
			if (usesSizeBasedFee) {
				if (data === undefined) {
					return resetFees();
				}

				if (type === "transfer" && (!data.amount || !data.to)) {
					return resetFees();
				}

				if (type === "multiPayment" && !data.payments?.length) {
					return resetFees();
				}

				if (type === "vote" && !data.votes?.length && !data.unvotes?.length) {
					return resetFees();
				}

				if (type === "delegateRegistration" && !data.username) {
					return resetFees();
				}

				if (type === "secondSignature" && !data.mnemonic) {
					return resetFees();
				}
			}

			setIsLoadingFee(true);

			const transactionFees = await calculate({
				coin: network.coin(),
				data,
				network: network.id(),
				type,
			});

			if (!isEqual(getValues("fees"), transactionFees)) {
				setValue("fees", transactionFees, {
					shouldDirty: true,
					shouldValidate: true,
				});
			}

			setIsLoadingFee(false);
		};

		recalculateFee();
	}, [calculate, data, getValues, network, setValue, type, usesSizeBasedFee]);

	useEffect(() => {
		if (fees && getValues("fee") === undefined) {
			const feeValue = fees.isDynamic ? fees.avg : fees.static;

			setValue("fee", feeValue, { shouldDirty: true, shouldValidate: true });
		}
	}, [fees, setValue, getValues]);

	return (
		<InputFee
			min={fees?.min}
			avg={fees?.avg}
			max={fees?.max}
			loading={!fees || isLoadingFee}
			value={fee}
			step={0.01}
			disabled={usesStaticFee && !usesSizeBasedFee}
			network={network}
			profile={profile}
			onChange={(value) => {
				setValue("fee", value, { shouldDirty: true, shouldValidate: true });
			}}
			viewType={inputFeeSettings.viewType}
			onChangeViewType={(viewType) => {
				setValue(
					"inputFeeSettings",
					{ ...inputFeeSettings, viewType },
					{ shouldDirty: true, shouldValidate: true },
				);
			}}
			simpleValue={inputFeeSettings.simpleValue}
			onChangeSimpleValue={(simpleValue) => {
				setValue(
					"inputFeeSettings",
					{ ...inputFeeSettings, simpleValue },
					{ shouldDirty: true, shouldValidate: true },
				);
			}}
		/>
	);
};
