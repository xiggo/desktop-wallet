import { Circle } from "app/components/Circle";
import { TableCell, TableRow } from "app/components/Table";
import cn from "classnames";
import React from "react";
import Skeleton from "react-loading-skeleton";

interface WalletListItemSkeletonProperties {
	isCompact?: boolean;
}

export const WalletListItemSkeleton = ({ isCompact }: WalletListItemSkeletonProperties) => {
	const circleSize = isCompact ? 20 : 44;

	return (
		<TableRow data-testid="WalletListItemSkeleton">
			<TableCell variant="start" innerClassName="space-x-4" isCompact={isCompact}>
				<div className={cn("flex items-center", { "space-x-4": isCompact }, { "-space-x-1": !isCompact })}>
					<Circle className="border-transparent" size={isCompact ? "xs" : "lg"}>
						<Skeleton circle height={circleSize} width={circleSize} />
					</Circle>
					<Circle className="border-transparent" size={isCompact ? "xs" : "lg"}>
						<Skeleton circle height={circleSize} width={circleSize} />
					</Circle>
				</div>
				<Skeleton height={16} width={260} />
			</TableCell>

			<TableCell innerClassName="justify-center text-sm font-bold text-center align-middle" isCompact={isCompact}>
				<Skeleton height={16} width={100} />
			</TableCell>

			<TableCell innerClassName="font-semibold justify-end" isCompact={isCompact}>
				<Skeleton height={16} width={229} />
			</TableCell>

			<TableCell variant="end" innerClassName="justify-end text-theme-secondary-400" isCompact={isCompact}>
				<Skeleton height={16} width={100} />
			</TableCell>
		</TableRow>
	);
};
