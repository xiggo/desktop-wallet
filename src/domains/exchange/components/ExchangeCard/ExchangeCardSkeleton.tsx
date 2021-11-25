import React from "react";

import { Card } from "@/app/components/Card";
import { Skeleton } from "@/app/components/Skeleton";
import { useRandomNumber } from "@/app/hooks";

export const ExchangeCardSkeleton = () => {
	const nameWidth = useRandomNumber(100, 180);

	return (
		<div data-testid="ExchangeCardSkeleton">
			<Card>
				<div className="flex items-center space-x-3">
					<div className="overflow-hidden flex-shrink-0 rounded-xl w-11 h-11">
						<Skeleton width={44} height={44} />
					</div>

					<div className="flex flex-col truncate">
						<Skeleton height={18} width={nameWidth} />
					</div>
				</div>
			</Card>
		</div>
	);
};
