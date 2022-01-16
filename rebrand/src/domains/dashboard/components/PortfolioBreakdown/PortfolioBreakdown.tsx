import React, { useCallback, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { assertNumber } from "utils/assertions";
import { LabelledText, Legend, PortfolioBreakdownSkeleton, Tooltip } from "./PortfolioBreakdown.blocks";
import { PortfolioBreakdownProperties } from "./PortfolioBreakdown.contracts";
import { formatAmount, formatPercentage, getColor, getOtherGroupColor } from "./PortfolioBreakdown.helpers";
import { Amount } from "@/app/components/Amount";
import { EmptyBlock } from "@/app/components/EmptyBlock";
import {
	AddToOtherGroupFunction,
	GRAPH_COLOR_EMPTY,
	GRAPH_COLOR_EMPTY_DARK,
	GraphDataPoint,
} from "@/app/components/Graphs/Graphs.contracts";
import { LineGraph } from "@/app/components/Graphs/LineGraph";
import { useTheme } from "@/app/hooks";
import { PortfolioBreakdownDetails } from "@/domains/dashboard/components/PortfolioBreakdownDetails";
import { usePortfolioBreakdown } from "@/domains/dashboard/hooks/use-portfolio-breakdown";

export const PortfolioBreakdown: React.VFC<PortfolioBreakdownProperties> = ({
	profile,
	profileIsSyncingExchangeRates,
	selectedNetworkIds,
	liveNetworkIds,
}) => {
	const { t } = useTranslation();
	const { isDarkMode } = useTheme();

	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const showDetailsModal = useCallback(() => setIsDetailsOpen(true), []);
	const hideDetailsModal = useCallback(() => setIsDetailsOpen(false), []);

	const isFilteringNetworks = useMemo(
		() => !liveNetworkIds.every((id) => selectedNetworkIds.includes(id)),
		[liveNetworkIds, selectedNetworkIds],
	);

	const { loading, balance, assets, walletsCount, ticker } = usePortfolioBreakdown({
		profile,
		profileIsSyncingExchangeRates,
		selectedNetworkIds,
	});

	const hasZeroBalance = balance === 0;

	const lineGraphData = useMemo<GraphDataPoint[]>(() => {
		if (hasZeroBalance) {
			return assets.map((asset) => ({
				color: isDarkMode ? GRAPH_COLOR_EMPTY_DARK : GRAPH_COLOR_EMPTY,
				data: {
					amount: 0,
					amountFormatted: formatAmount(0, ticker),
					label: asset.label,
					percentFormatted: `0%`,
				},
				value: 0,
			}));
		}

		return assets.map((asset, index) => ({
			color: getColor(index, isDarkMode),
			data: {
				amount: asset.convertedAmount,
				amountFormatted: formatAmount(asset.convertedAmount, ticker),
				label: asset.label,
				percentFormatted: formatPercentage(asset.percent),
			},
			value: asset.percent,
		}));
	}, [assets, hasZeroBalance, isDarkMode, ticker]);

	const addToOtherGroup = useCallback<AddToOtherGroupFunction>(
		(otherGroup, entry) => {
			const amount = (otherGroup?.data.amount ?? 0) + entry.data.amount;
			assertNumber(amount);

			const value = (otherGroup?.value ?? 0) + entry.value;

			return {
				color: getOtherGroupColor(isDarkMode),
				data: {
					amount,
					amountFormatted: formatAmount(amount, ticker),
					label: t("COMMON.OTHER"),
					percentFormatted: formatPercentage(value),
				},
				value,
			};
		},
		[isDarkMode, t, ticker],
	);

	if (loading) {
		return <PortfolioBreakdownSkeleton />;
	}

	if (assets.length === 0 && !isFilteringNetworks) {
		return <></>;
	}

	if (assets.length === 0 && isFilteringNetworks) {
		return (
			<EmptyBlock>
				<Trans i18nKey="DASHBOARD.PORTFOLIO_BREAKDOWN.FILTERED" />
			</EmptyBlock>
		);
	}

	return (
		<>
			<div
				className="py-4 px-6 bg-theme-secondary-100 dark:bg-black rounded-xl flex"
				data-testid="PortfolioBreakdown"
			>
				<div className="flex space-x-4 divide-x divide-theme-secondary-300 dark:divide-theme-secondary-800">
					<LabelledText label={t("COMMON.YOUR_BALANCE")}>
						{(textClassName) => <Amount className={textClassName} ticker={ticker} value={balance} />}
					</LabelledText>

					<LabelledText label={t("COMMON.ASSETS")}>
						{(textClassName) => (
							<span data-testid="PortfolioBreakdown__assets" className={textClassName}>
								{assets.length}
							</span>
						)}
					</LabelledText>

					<LabelledText label={t("COMMON.WALLETS")}>
						{(textClassName) => (
							<span data-testid="PortfolioBreakdown__wallets" className={textClassName}>
								{walletsCount}
							</span>
						)}
					</LabelledText>
				</div>

				<div className="flex-1 ml-6">
					<LineGraph
						data={lineGraphData}
						addToOtherGroup={addToOtherGroup}
						renderAsEmpty={hasZeroBalance}
						renderTooltip={(dataPoint) => <Tooltip dataPoint={dataPoint} />}
						renderLegend={(dataPoints) => (
							<Legend
								dataPoints={dataPoints}
								hasZeroBalance={hasZeroBalance}
								onMoreDetailsClick={showDetailsModal}
							/>
						)}
					/>
				</div>
			</div>

			<PortfolioBreakdownDetails
				isOpen={isDetailsOpen}
				assets={assets}
				balance={balance}
				exchangeCurrency={ticker}
				onClose={hideDetailsModal}
			/>
		</>
	);
};
