import { Table } from "app/components/Table";
import React from "react";
import { useTranslation } from "react-i18next";

import { NotificationTransactionSkeletonRow } from "./NotificationTransactionSkeletonRow";

export const NotificationTransactionsSkeleton = ({ limit = 10 }: { limit?: number }) => {
	const { t } = useTranslation();

	const skeletonRows = new Array(limit).fill({});

	return (
		<div>
			<div className="space-y-2">
				<div className="text-base font-semibold text-theme-secondary-500">
					{t("COMMON.NOTIFICATIONS.TRANSACTIONS_TITLE")}
				</div>

				<Table hideHeader columns={[{ Header: "-", className: "hidden" }]} data={skeletonRows}>
					{() => <NotificationTransactionSkeletonRow />}
				</Table>
			</div>
		</div>
	);
};
