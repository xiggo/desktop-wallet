import { Contracts } from "@payvo/sdk-profiles";
import cn from "classnames";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import tw, { styled } from "twin.macro";
import { Amount } from "@/app/components/Amount";
import { Icon } from "@/app/components/Icon";
import { WalletIcon } from "@/app/components/WalletIcons";
import { useConfiguration } from "@/app/contexts";
import { useActiveProfile, useTheme } from "@/app/hooks";
import {
	LabelledTextProperties,
	WalletsGroupChevronTogglerProperties,
	WalletsGroupNetworkIconProperties,
	WalletsGroupNetworkNameProperties,
	WalletsGroupNetworkTotalProperties,
} from "@/domains/wallet/components/WalletsGroup/WalletsGroup.contracts";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";
import { Skeleton } from "@/app/components/Skeleton";

export const LabelledText: React.FC<LabelledTextProperties> = ({ label, children, maxWidthReference }) => {
	const [width, setWidth] = useState<number | undefined>();
	const columnReference = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		if (!columnReference.current || !maxWidthReference) {
			return;
		}

		const maxColumnWidth = maxWidthReference.current;
		const columnWidth = columnReference.current.getBoundingClientRect().width;
		if (columnWidth >= maxColumnWidth) {
			maxWidthReference.current = columnWidth;
			return;
		}
		setWidth(maxColumnWidth);
	}, [columnReference, maxWidthReference, children]);

	return (
		<div
			className={"flex flex-col font-semibold space-y-1 pl-4 first:pl-0 text-right"}
			ref={columnReference}
			style={width ? { width: `${width}px` } : undefined}
		>
			<span className="text-sm text-theme-secondary-500 dark:text-theme-secondary-700 whitespace-nowrap">
				{label}
			</span>

			{typeof children === "function"
				? children("text-lg text-theme-secondary-900 dark:text-theme-secondary-200")
				: children}
		</div>
	);
};

export const WalletGroupWrapper = styled.div<{ isInactive?: boolean; isCollapsed?: boolean }>`
	${tw`mb-4 dark:bg-theme-background rounded-xl flex gap-x-3 flex-col transition-shadow duration-200`}

	${({ isInactive }) =>
		isInactive
			? tw`ring-1 ring-theme-secondary-300 dark:ring-theme-secondary-800`
			: tw`ring-2 ring-theme-primary-100 dark:ring-theme-secondary-800`}

	${({ isCollapsed }) =>
		isCollapsed &&
		tw`hover:(ring-theme-background shadow-xl dark:(ring-theme-secondary-800 bg-theme-secondary-800 shadow-none))`}
`;

export const GroupNetworkIcon: React.VFC<WalletsGroupNetworkIconProperties> = ({ network, isWalletsCollapsed }) => {
	const { isDarkMode } = useTheme();

	return (
		<div
			className={cn(
				"flex w-11 h-11 rounded-xl justify-center items-center bg-clip-padding hover:(border-theme-background shadow-xl)",
				{
					"bg-theme-background text-theme-secondary-700 ring-2 ring-theme-secondary-800": isDarkMode,
					"bg-theme-secondary-100 text-theme-secondary-100": !isDarkMode,
					"group-hover:ring-theme-secondary-700 group-hover:bg-theme-secondary-800":
						isWalletsCollapsed && isDarkMode,
				},
			)}
		>
			<NetworkIcon
				isCompact
				network={network}
				shadowClassName={
					"rounded-lg w-46 h-46 group-hover:bg-theme-secondary-100 dark:(bg-theme-background group-hover:ring-black group-hover:bg-black)"
				}
				size="lg"
			/>
		</div>
	);
};

export const GroupNetworkName: React.VFC<WalletsGroupNetworkNameProperties> = ({ network }) => (
	<div className="flex flex-grow space-x-3 justify-between py-3 px-3">
		<h1 className="mb-0 text-lg" data-testid="header__title">
			{network.displayName()}
		</h1>
		{network.isTest() && <WalletIcon type="TestNetwork" />}
		<div className={"flex-grow"} />
	</div>
);

export const GroupNetworkTotal: React.VFC<WalletsGroupNetworkTotalProperties> = ({
	network,
	wallets,
	isSinglePageMode,
	maxWidthReferences,
}) => {
	const profile = useActiveProfile();
	const { isDarkMode } = useTheme();
	const { t } = useTranslation();

	const { profileIsSyncingExchangeRates, profileIsSyncing } = useConfiguration();

	const exchangeCurrency = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency)!;
	const [totalNetworkBalance, totalConvertedNetworkBalance] = useMemo<[number, number]>(() => {
		let totalNetworkBalance = 0;
		let totalConvertedNetworkBalance = 0;

		for (const wallet of wallets) {
			totalNetworkBalance += wallet.balance();
			totalConvertedNetworkBalance += wallet.convertedBalance();
		}

		return [totalNetworkBalance, totalConvertedNetworkBalance];
	}, [wallets]);

	const renderAmount = () =>
		network.isTest() ? (
			<span className={"text-theme-secondary-500 dark:text-theme-secondary-700"}>
				{t("COMMON.NOT_AVAILABLE")}
			</span>
		) : (
			<Amount value={totalConvertedNetworkBalance} ticker={exchangeCurrency} />
		);

	const containerClasses = cn("flex space-x-4 divide-x", {
		"divide-theme-secondary-300": !isDarkMode,
		"divide-theme-secondary-700 group-hover:divide-theme-secondary-700": isDarkMode,
	});

	return (
		<div className={containerClasses}>
			<LabelledText label={t("COMMON.WALLETS")}>
				<span className={"text-lg text-theme-secondary-600 dark:text-theme-secondary-200"}>
					{profileIsSyncing ? <Skeleton width={60} height={20} /> : wallets.length}
				</span>
			</LabelledText>

			<LabelledText label={t("COMMON.TOTAL_BALANCE")} maxWidthReference={maxWidthReferences?.balance}>
				{(className) => (
					<span className={className}>
						{profileIsSyncing ? (
							<Skeleton width={160} height={20} />
						) : (
							<Amount value={totalNetworkBalance} ticker={network.ticker()} />
						)}
					</span>
				)}
			</LabelledText>

			<LabelledText label={t("COMMON.TOTAL_CURRENCY")} maxWidthReference={maxWidthReferences?.currency}>
				{(className) => (
					<span className={className}>
						{profileIsSyncingExchangeRates || profileIsSyncing ? (
							<Skeleton width={130} height={20} />
						) : (
							renderAmount()
						)}
					</span>
				)}
			</LabelledText>
			{!isSinglePageMode && <div />}
		</div>
	);
};

export const GroupChevronToggle: React.VFC<WalletsGroupChevronTogglerProperties> = ({
	isWalletsExpanded,
	toggleWalletsPanel,
}) => {
	const { isDarkMode } = useTheme();
	return (
		<div
			className={cn(
				"flex ml-4 w-8 h-8 justify-center items-center content-center cursor-pointer rounded-lg ring-2 ",
				{
					"dark:bg-theme-primary-800 dark:ring-theme-primary-600 hover:bg-theme-secondary-800":
						isDarkMode && isWalletsExpanded,
					"dark:ring-theme-secondary-700 hover:ring-theme-primary-500": isDarkMode && !isWalletsExpanded,
					"ring-theme-primary-100 hover:ring-theme-primary-400": !isDarkMode && !isWalletsExpanded,
					"ring-theme-primary-600 bg-theme-primary-50 hover:bg-theme-primary-100":
						!isDarkMode && isWalletsExpanded,
				},
			)}
			onMouseDown={toggleWalletsPanel}
			data-testid={"NetworkGroup_Toggle"}
		>
			<Icon
				name="ChevronDownSmall"
				className={cn(`transition-transform`, { "transform rotate-180 ": isWalletsExpanded })}
				size="sm"
			/>
		</div>
	);
};
