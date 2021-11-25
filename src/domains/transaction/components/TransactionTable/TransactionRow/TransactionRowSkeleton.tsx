import cn from "classnames";
import React from "react";

import { Circle } from "@/app/components/Circle";
import { Skeleton } from "@/app/components/Skeleton";
import { TableCell, TableRow } from "@/app/components/Table";
import { useRandomNumber } from "@/app/hooks";

type Properties = {
	isCompact: boolean;
} & React.HTMLProps<any>;

export const TransactionRowSkeleton = ({ isCompact }: Properties) => {
	const senderWidth = useRandomNumber(120, 150);
	const recipientWidth = useRandomNumber(120, 150);
	const amountWidth = useRandomNumber(100, 130);
	const currencyWidth = Math.floor(amountWidth * 0.75);

	return (
		<TableRow>
			<TableCell variant="start" isCompact={isCompact}>
				<Skeleton width={16} height={16} />
			</TableCell>

			<TableCell isCompact={isCompact}>
				<Skeleton height={16} width={150} />
			</TableCell>

			<TableCell isCompact={isCompact}>
				{isCompact ? (
					<div className="flex items-center mr-4 space-x-2">
						<Skeleton circle height={20} width={20} />
						<Skeleton circle height={20} width={20} />
					</div>
				) : (
					<div className="flex items-center mr-4 -space-x-1">
						<Circle className="border-transparent" size="lg">
							<Skeleton circle height={44} width={44} />
						</Circle>
						<Circle className="border-transparent" size="lg">
							<Skeleton circle height={44} width={44} />
						</Circle>
					</div>
				)}

				<Skeleton height={16} width={senderWidth} />
			</TableCell>

			<TableCell isCompact={isCompact}>
				{isCompact ? (
					<div className="mr-4">
						<Skeleton circle height={20} width={20} />
					</div>
				) : (
					<div className="mr-4">
						<Circle className="border-transparent" size="lg">
							<Skeleton circle height={44} width={44} />
						</Circle>
					</div>
				)}

				<Skeleton height={16} width={recipientWidth} />
			</TableCell>

			<TableCell innerClassName="justify-end" isCompact={isCompact}>
				<span
					className={cn("flex items-center space-x-1 h-7", {
						"border-2 border-theme-secondary-300 dark:border-theme-secondary-800 rounded px-2": !isCompact,
					})}
				>
					<Skeleton height={16} width={amountWidth} />
					<Skeleton height={16} width={35} />
				</span>
			</TableCell>

			<TableCell variant="end" className="hidden xl:block" innerClassName="justify-end" isCompact={isCompact}>
				<span className="flex items-center space-x-1">
					<Skeleton height={16} width={currencyWidth} />
					<Skeleton height={16} width={35} />
				</span>
			</TableCell>
		</TableRow>
	);
};
