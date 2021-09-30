import { sortByDesc } from "@arkecosystem/utils";
import { Checkbox } from "app/components/Checkbox";
import { TableColumn } from "app/components/Table/TableColumn.models";
import { Tooltip } from "app/components/Tooltip";
import { useScheduler } from "app/hooks/use-scheduler";
import { toasts } from "app/services";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { UnlockTokensFetchError } from "./blocks/UnlockTokensFetchError";
import {
	POLLING_INTERVAL,
	UnlockableBalance,
	UnlockableBalanceSkeleton,
	UseColumnsHook,
	UseUnlockableBalancesHook,
} from "./UnlockTokens.contracts";

const useUnlockableBalances: UseUnlockableBalancesHook = (wallet) => {
	const loadCount = useRef(0);

	const { start, stop } = useScheduler({
		autostart: true,
		handler: () => fetch(),
		timeout: POLLING_INTERVAL,
	});

	const [items, setItems] = useState<UnlockableBalance[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	const fetch = async () => {
		setLoading(true);

		try {
			const response = await wallet.coin().client().unlockableBalances(wallet.address());

			setItems(
				sortByDesc(response.objects, (value) => value.timestamp.toUNIX()).map((value, index) => ({
					...value,
					id: `${index}`,
				})),
			);

			loadCount.current++;
		} catch {
			stop();

			setItems([]);

			toasts.warning(
				<UnlockTokensFetchError
					onRetry={
						/* istanbul ignore next */ () => {
							void toasts.dismiss();

							start();
						}
					}
				/>,
			);
		} finally {
			setLoading(false);
		}
	};

	return {
		isFirstLoad: loadCount.current === 1,
		items,
		loading,
	};
};

const useColumns: UseColumnsHook = ({ canSelectAll, isAllSelected, onToggleAll }) => {
	const { t } = useTranslation();

	const columnAmount: TableColumn = {
		Header: t("COMMON.AMOUNT"),
		accessor: (unlockableBalance: UnlockableBalance | UnlockableBalanceSkeleton) =>
			unlockableBalance.amount?.toNumber(),
		id: "amount",
	};

	const columnTime: TableColumn = {
		Header: t("COMMON.TIME"),
		accessor: (unlockableBalance: UnlockableBalance | UnlockableBalanceSkeleton) =>
			unlockableBalance.timestamp?.toUNIX(),
		id: "time",
	};

	const columnStatus: TableColumn = {
		Header: (
			<>
				<span className="mr-3">{t("COMMON.STATUS")}</span>
				<Tooltip content={isAllSelected ? t("COMMON.UNSELECT_ALL") : t("COMMON.SELECT_ALL")}>
					<Checkbox disabled={!canSelectAll} checked={isAllSelected} onChange={onToggleAll} />
				</Tooltip>
			</>
		),
		className: "justify-end float-right",
		id: "status",
	};

	return [columnAmount, columnTime, columnStatus];
};

export { useColumns, useUnlockableBalances };
