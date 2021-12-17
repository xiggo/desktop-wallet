import cn from "classnames";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/app/components/Icon";
import { useTheme } from "@/app/hooks";
import {
	GroupChevronToggle,
	GroupNetworkIcon,
	GroupNetworkName,
	GroupNetworkTotal,
	LabelledText,
} from "@/domains/wallet/components/WalletsGroup/WalletsGroup.blocks";
import {
	WalletsGroupHeaderProperties,
	WalletsGroupHeaderSkeletonProperties,
} from "@/domains/wallet/components/WalletsGroup/WalletsGroup.contracts";
import { Skeleton } from "@/app/components/Skeleton";

export const WalletsGroupHeader: React.VFC<WalletsGroupHeaderProperties> = ({
	wallets,
	network,
	toggleWalletsPanel,
	isWalletsExpanded,
	isSinglePageMode = false,
	maxWidthReferences,
}) => {
	const { isDarkMode } = useTheme();

	const wrapperClassName = cn("h-20 py-4 px-4 flex flex-row items-center", {
		"bg-transparent border-theme-secondary-800": isDarkMode,
		"border-b": isWalletsExpanded,
		"border-theme-secondary-300": !isDarkMode,
	});

	return (
		<div className={wrapperClassName} data-testid="WalletsGroup_Header">
			<GroupNetworkIcon network={network} isWalletsCollapsed={!isWalletsExpanded} />
			<GroupNetworkName network={network} />
			<GroupNetworkTotal
				network={network}
				wallets={wallets}
				isSinglePageMode={isSinglePageMode}
				maxWidthReferences={maxWidthReferences}
			/>
			{!isSinglePageMode && (
				<GroupChevronToggle toggleWalletsPanel={toggleWalletsPanel} isWalletsExpanded={isWalletsExpanded} />
			)}
		</div>
	);
};

export const WalletsGroupHeaderSkeleton: React.VFC<WalletsGroupHeaderSkeletonProperties> = ({
	isPlaceholder = false,
	isSinglePageMode = false,
}) => {
	const { t } = useTranslation();

	const labelClassname = "text-lg text-theme-secondary-600 dark:text-theme-secondary-700";
	const labelNotAvailable = t("COMMON.NOT_AVAILABLE");

	return (
		<div
			className={cn(
				"h-20 py-4 px-4 flex flex-row items-center transition-colors-shadow duration-200 hover:bg-red-700 hover:(ring-theme-background shadow-xl)",
			)}
			data-testid="WalletsGroup_HeaderSkeleton"
		>
			<div
				className={
					"flex flex-row w-11 h-11 rounded-lg justify-center ring-1 ring-theme-secondary-300 dark:ring-theme-secondary-800 bg-clip-padding bg-theme-background text-theme-secondary-100 dark:bg-theme-background dark:text-theme-secondary-700 flex-shrink-0 items-center -space-x-1"
				}
			>
				{isPlaceholder ? <></> : <Skeleton width={28} height={28} />}
			</div>
			<div className="flex-grow space-x-3 justify-between py-3 px-3">
				<h1
					className="mb-0 text-lg text-theme-secondary-500 dark:text-theme-secondary-700"
					data-testid="header__title"
				>
					{isPlaceholder ? t("COMMON.CRYPTOASSET") : <Skeleton width={190} height={20} />}
				</h1>
			</div>
			<div className="flex space-x-3 divide-x divide-theme-secondary-300 dark:divide-theme-secondary-800">
				<LabelledText label={t("COMMON.WALLETS")}>
					<span className={labelClassname}>
						{isPlaceholder ? labelNotAvailable : <Skeleton width={60} height={20} />}
					</span>
				</LabelledText>

				<LabelledText label={t("COMMON.TOTAL_BALANCE")}>
					<span className={labelClassname}>
						{isPlaceholder ? labelNotAvailable : <Skeleton width={160} height={20} />}
					</span>
				</LabelledText>

				<LabelledText label={t("COMMON.TOTAL_CURRENCY")}>
					<span className={labelClassname}>
						{isPlaceholder ? labelNotAvailable : <Skeleton width={130} height={20} />}
					</span>
				</LabelledText>
				{!isSinglePageMode && <div />}
			</div>

			{!isSinglePageMode && (
				<div
					className={cn("flex ml-4 w-8 h-8 justify-center items-center content-center rounded-lg ring-1 ", {
						"ring-theme-primary-100": !isPlaceholder,
						"ring-theme-secondary-300 bg-theme-background dark:ring-theme-secondary-800": isPlaceholder,
					})}
				>
					<Icon
						name="ChevronDownSmall"
						className={cn(`transition-transform`, {
							"text-theme-secondary-500": isPlaceholder,
						})}
						size="sm"
					/>
				</div>
			)}
		</div>
	);
};
