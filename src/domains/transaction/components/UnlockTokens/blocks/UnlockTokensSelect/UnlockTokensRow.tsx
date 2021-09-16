import { AmountCrypto } from "app/components/Amount";
import { Checkbox } from "app/components/Checkbox";
import { Icon } from "app/components/Icon";
import { TableCell, TableRow } from "app/components/Table";
import React from "react";
import { useTranslation } from "react-i18next";

import { UnlockableBalance, UnlockableBalanceSkeleton } from "../../UnlockTokens.contracts";
import { UnlockTokensRowSkeleton } from "./UnlockTokensRowSkeleton";

interface Properties {
	loading: boolean;
	item: UnlockableBalance | UnlockableBalanceSkeleton;
	ticker: string;
	checked: boolean;
	onToggle: () => void;
}

export const UnlockTokensRow: React.FC<Properties> = ({ loading, item, ticker, onToggle, checked }: Properties) => {
	const { t } = useTranslation();

	if (loading) {
		return <UnlockTokensRowSkeleton />;
	}

	const date = item.timestamp.format("DD MMM YYYY");
	const time = item.timestamp.format("HH:mm:ss");
	const relativeTime = item.timestamp.fromNow();

	return (
		<TableRow>
			<TableCell variant="start" isCompact>
				<AmountCrypto
					className="font-bold text-theme-secondary-900 dark:text-theme-secondary-200"
					value={item.amount.toHuman()}
					ticker={ticker}
				/>
			</TableCell>

			<TableCell isCompact>
				<time className="text-theme-secondary-700" dateTime={item.timestamp.toDate().toUTCString()}>
					{date} {t("COMMON.AT")} {time} ({relativeTime})
				</time>
			</TableCell>

			<TableCell variant="end" isCompact innerClassName="justify-end">
				{item.isReady ? (
					<div className="flex items-center">
						<div className="flex items-center">
							<span className="text-theme-secondary-700" data-testid="UnlockableBalanceRow__status">
								{t("TRANSACTION.UNLOCK_TOKENS.UNLOCKABLE")}
							</span>
							<Icon name="LockOpen" size="lg" className="text-theme-primary-600 mr-3 ml-2" />
						</div>
						<Checkbox checked={checked} onChange={onToggle} />
					</div>
				) : (
					<div className="flex items-center">
						<div className="flex items-center">
							<span className="text-theme-secondary-700" data-testid="UnlockableBalanceRow__status">
								{t("TRANSACTION.UNLOCK_TOKENS.LOCKED")}
							</span>
							<Icon name="Lock" size="lg" className="text-theme-secondary-700 mr-3 ml-2" />
						</div>
						<Checkbox checked={false} disabled />
					</div>
				)}
			</TableCell>
		</TableRow>
	);
};
