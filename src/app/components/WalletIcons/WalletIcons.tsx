import { Contracts } from "@payvo/profiles";
import { Icon } from "app/components/Icon";
import { Tooltip } from "app/components/Tooltip";
import React from "react";
import { useTranslation } from "react-i18next";
import { Size } from "types";

const getIconName = (type: string) => {
	switch (type) {
		case "Starred":
			return "Star";
		case "MultiSignature":
			return "Multisig";
		case "SecondSignature":
			return "Key";
		default:
			return type;
	}
};

const getIconColor = (type: string) =>
	type === "Starred" ? "text-theme-warning-400" : "text-theme-secondary-700 dark:text-theme-secondary-600";

const WalletIcon = ({
	type,
	label,
	iconColor,
	iconSize,
}: {
	type: string;
	label?: string;
	iconColor?: string;
	iconSize?: Size;
}) => {
	const { t } = useTranslation();

	return (
		<Tooltip content={label || t(`COMMON.${type.toUpperCase()}`)}>
			<div
				data-testid={`WalletIcon__${getIconName(type)}`}
				className={`inline-block p-1 ${iconColor || getIconColor(type)}`}
			>
				<Icon name={getIconName(type)} size={iconSize} />
			</div>
		</Tooltip>
	);
};

export const WalletIcons = ({
	exclude,
	wallet,
	...iconProperties
}: {
	exclude?: string[];
	iconColor?: string;
	iconSize?: Size;
	wallet: Contracts.IReadWriteWallet;
}) => {
	const { t } = useTranslation();

	return (
		<>
			{!exclude?.includes("isKnown") && wallet.isKnown() && (
				<WalletIcon
					type="Verified"
					label={t(`COMMON.VERIFIED`, { value: wallet.knownName() })}
					{...iconProperties}
				/>
			)}
			{!exclude?.includes("isSecondSignature") && wallet.hasSyncedWithNetwork() && wallet.isSecondSignature() && (
				<WalletIcon type="SecondSignature" label={t("COMMON.SECOND_SIGNATURE")} {...iconProperties} />
			)}
			{!exclude?.includes("isLedger") && wallet.isLedger() && <WalletIcon type="Ledger" {...iconProperties} />}
			{!exclude?.includes("isStarred") && wallet.isStarred() && <WalletIcon type="Starred" {...iconProperties} />}
			{!exclude?.includes("isMultiSignature") && wallet.hasSyncedWithNetwork() && wallet.isMultiSignature() && (
				<WalletIcon type="MultiSignature" {...iconProperties} />
			)}
		</>
	);
};
