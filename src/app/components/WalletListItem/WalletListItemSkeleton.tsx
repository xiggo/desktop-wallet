import { Button } from "app/components/Button";
import { Icon } from "app/components/Icon";
import { WalletListItemSkeletonProperties } from "app/components/WalletListItem/WalletListItem.contracts";
import cn from "classnames";
import React from "react";
import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";

import { Circle } from "@/app/components/Circle";
import { TableCell, TableRow } from "@/app/components/Table";

export const WalletListItemSkeleton: React.VFC<WalletListItemSkeletonProperties> = ({ isCompact }) => {
	const { t } = useTranslation();
	return (
		<TableRow>
			<TableCell variant="start" innerClassName={cn(isCompact ? "space-x-3" : "space-x-4")} isCompact={isCompact}>
				<div
					className={cn(
						"flex justify-center divide-x divide-theme-secondary-300 dark:divide-theme-secondary-800",
						{
							"h-11 gap-4": !isCompact,
							"h-5 gap-3": isCompact,
						},
					)}
				>
					<div data-testid={`WalletIcon__Starred`} className={`flex items-center justify-center `}>
						<Skeleton height={20} width={20} />
					</div>
					<div />
				</div>
				<div className={cn("flex items-center", { "space-x-4": isCompact }, { "-space-x-1": !isCompact })}>
					<Circle className="border-transparent" size={isCompact ? "xs" : "lg"}>
						<Skeleton height={20} width={20} />
					</Circle>
				</div>
				<Skeleton height={20} width={200} />
			</TableCell>

			<TableCell innerClassName="justify-center text-sm font-bold text-center align-middle" isCompact={isCompact}>
				<Skeleton height={20} width={100} />
			</TableCell>

			<TableCell innerClassName="font-semibold justify-end" isCompact={isCompact}>
				<Skeleton height={20} width={150} />
			</TableCell>

			<TableCell variant="end" innerClassName="justify-end text-theme-secondary-400" isCompact={isCompact}>
				<Skeleton height={20} width={100} />
			</TableCell>
			<TableCell variant="end" innerClassName="justify-end text-theme-secondary-text" isCompact={isCompact}>
				<Button
					size={isCompact ? "icon" : undefined}
					data-testid="WalletHeader__send-button"
					disabled={true}
					variant={isCompact ? "transparent" : "secondary"}
					className={cn("ml-3", {
						"my-auto ": !isCompact,
						"text-theme-primary-600 hover:text-theme-primary-700 -mr-3": isCompact,
					})}
				>
					{t("COMMON.SEND")}
				</Button>
				<div data-testid="WalletHeader__more-button" className="ml-3">
					<Button
						variant={isCompact ? "transparent" : "secondary"}
						size={isCompact ? "icon" : undefined}
						disabled={true}
						className={cn("w-11", {
							"-mr-3 text-theme-primary-300 hover:text-theme-primary-600": isCompact,
							"flex-1 text-white bg-theme-primary-600 hover:bg-theme-primary-700": !isCompact,
						})}
					>
						<Icon name="EllipsisVertical" size="lg" />
					</Button>
				</div>
			</TableCell>
		</TableRow>
	);
};
