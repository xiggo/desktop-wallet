import { Button } from "app/components/Button";
import React from "react";
import { useTranslation } from "react-i18next";

interface PaginatorProperties {
	activeStep: number;
	canBeSigned: boolean;
	canBeBroadcasted: boolean;
	onCancel?: () => void;
	onSign?: () => void;
	onBack?: () => void;
	onContinue?: () => void;
	isEnabled?: boolean;
	isLoading?: boolean;
	isSubmitting?: boolean;
}

export const Paginator = ({
	activeStep,
	canBeSigned,
	canBeBroadcasted,
	onCancel,
	onSign,
	onBack,
	onContinue,
	isEnabled,
	isLoading,
	isSubmitting,
}: PaginatorProperties) => {
	const { t } = useTranslation();
	const canBeSend = canBeBroadcasted && !canBeSigned && activeStep === 1;

	if (![1, 2].includes(activeStep) || (!canBeSend && !canBeSigned)) {
		return null;
	}

	return (
		<div className="flex justify-end mt-8 space-x-3">
			{(canBeSend || activeStep === 1) && (
				<Button data-testid="Paginator__cancel" variant="secondary" onClick={onCancel}>
					{t("COMMON.CANCEL")}
				</Button>
			)}

			{canBeSigned && activeStep === 1 && (
				<Button data-testid="Paginator__sign" onClick={onSign}>
					{t("COMMON.SIGN")}
				</Button>
			)}

			{canBeSend && (
				<Button
					disabled={isSubmitting}
					type="submit"
					isLoading={isSubmitting}
					data-testid="MultiSignatureDetail__broadcast"
				>
					{t("COMMON.SEND")}
				</Button>
			)}

			{activeStep === 2 && (
				<>
					<Button data-testid="Paginator__back" variant="secondary" onClick={onBack}>
						{t("COMMON.BACK")}
					</Button>

					<Button
						disabled={!isEnabled || isLoading}
						data-testid="Paginator__continue"
						isLoading={isLoading}
						onClick={onContinue}
					>
						{t("COMMON.CONTINUE")}
					</Button>
				</>
			)}
		</div>
	);
};
