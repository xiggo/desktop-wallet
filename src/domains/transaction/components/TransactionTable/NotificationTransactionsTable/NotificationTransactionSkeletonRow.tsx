import cn from "classnames";
import React, { VFC } from "react";

import { NotificationTransactionSkeletonRowProperties } from "./NotificationTransactionsTable.contracts";
import { Circle } from "@/app/components/Circle";
import { Skeleton } from "@/app/components/Skeleton";
import { TableCell, TableRow } from "@/app/components/Table";
import { useRandomNumber } from "@/app/hooks";

export const NotificationTransactionSkeletonRow: VFC<NotificationTransactionSkeletonRowProperties> = ({
	isCompact,
}) => {
	const recipientWidth = useRandomNumber(120, 150);
	const amountWidth = useRandomNumber(100, 130);

	const renderTransactionMode = () => {
		if (isCompact) {
			return (
				<div className="flex items-center space-x-2">
					<Skeleton circle height={20} width={20} />
					<Skeleton circle height={20} width={20} />
				</div>
			);
		}

		return (
			<div className="flex items-center -space-x-1">
				<Circle className="border-transparent" size="lg">
					<Skeleton circle height={44} width={44} />
				</Circle>
				<Circle className="border-transparent" size="lg">
					<Skeleton circle height={44} width={44} />
				</Circle>
			</div>
		);
	};

	return (
		<TableRow>
			<TableCell
				variant="start"
				innerClassName={cn({ "space-x-3": isCompact }, { "space-x-4": !isCompact })}
				isCompact={isCompact}
			>
				{renderTransactionMode()}

				<Skeleton height={16} width={recipientWidth} />
			</TableCell>

			<TableCell variant="end" innerClassName="justify-end" isCompact={isCompact}>
				<span className="flex items-center px-2 space-x-1 h-7 rounded border border-theme-secondary-300 dark:border-theme-secondary-800">
					<Skeleton height={16} width={amountWidth} />
					<Skeleton height={16} width={35} />
				</span>
			</TableCell>
		</TableRow>
	);
};
