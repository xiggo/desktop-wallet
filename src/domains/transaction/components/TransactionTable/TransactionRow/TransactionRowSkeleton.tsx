import { Circle } from "app/components/Circle";
import { Skeleton } from "app/components/Skeleton";
import { TableCell, TableRow } from "app/components/Table";
import { useRandomNumber } from "app/hooks";
import React, { useMemo } from "react";
import { Size } from "types";

type Properties = {
	showSignColumn?: boolean;
	showCurrencyColumn?: boolean | "";
	isCompact: boolean;
} & React.HTMLProps<any>;

export const TransactionRowSkeleton = ({ showSignColumn, showCurrencyColumn, isCompact }: Properties) => {
	const recipientWidth = useRandomNumber(120, 150);
	const infoIconCount = useRandomNumber(0, 3);
	const amountWidth = useRandomNumber(100, 130);
	const currencyWidth = Math.floor(amountWidth * 0.75);

	let circleSize: Size = "lg";
	let circleSizeSkeleton = 44;

	/* istanbul ignore next */
	if (isCompact) {
		circleSize = "sm";
		circleSizeSkeleton = 32;
	}

	const infoIcons = useMemo(
		() =>
			new Array(infoIconCount)
				.fill(undefined)
				.map((_: any, index: number) => <Skeleton key={index} width={16} height={16} />),
		[infoIconCount],
	);

	return (
		<TableRow>
			<TableCell variant="start" isCompact={isCompact}>
				<Skeleton width={16} height={16} />
			</TableCell>

			<TableCell isCompact={isCompact}>
				<Skeleton height={16} width={150} />
			</TableCell>

			<TableCell isCompact={isCompact}>
				<div className="flex items-center mr-4 -space-x-1">
					<Circle className="border-transparent" size={circleSize}>
						<Skeleton circle height={circleSizeSkeleton} width={circleSizeSkeleton} />
					</Circle>
					<Circle className="border-transparent" size={circleSize}>
						<Skeleton circle height={circleSizeSkeleton} width={circleSizeSkeleton} />
					</Circle>
				</div>

				<Skeleton height={16} width={recipientWidth} />
			</TableCell>

			<TableCell innerClassName="justify-center" isCompact={isCompact}>
				<span className="flex items-center space-x-2">{infoIcons}</span>
			</TableCell>

			{!isCompact && (
				<TableCell innerClassName="justify-center">
					<Skeleton circle width={22} height={22} />
				</TableCell>
			)}

			<TableCell innerClassName="justify-end" isCompact={isCompact}>
				<span className="flex items-center px-2 space-x-1 h-7 rounded border border-theme-secondary-300 dark:border-theme-secondary-800">
					<Skeleton height={16} width={amountWidth} />
					<Skeleton height={16} width={35} />
				</span>
			</TableCell>

			{showSignColumn && (
				<TableCell variant="end" innerClassName="justify-end" isCompact={isCompact}>
					<Skeleton height={44} width={100} />
				</TableCell>
			)}

			{showCurrencyColumn && (
				<TableCell variant="end" className="hidden xl:block" innerClassName="justify-end" isCompact={isCompact}>
					<span className="flex items-center space-x-1">
						<Skeleton height={16} width={currencyWidth} />
						<Skeleton height={16} width={35} />
					</span>
				</TableCell>
			)}
		</TableRow>
	);
};

TransactionRowSkeleton.defaultProps = {
	showCurrencyColumn: false,
	showSignColumn: false,
};
