import React from "react";

import { SvgCollection } from "@/app/assets/svg";

interface ReviewRatingProperties {
	rating: number;
	width: number;
	showTotal: boolean;
}

export const ReviewRating = ({ rating, width = 4, showTotal = false }: ReviewRatingProperties) => (
	<div className="flex items-center" data-testid="ReviewRating">
		<div className="relative">
			{rating > 0 && (
				<div className="overflow-hidden absolute" style={{ width: `${((rating - 1) / 4) * 100}%` }}>
					<SvgCollection.Star className={`text-theme-warning-400 w-${width}`} />
				</div>
			)}

			<SvgCollection.Star className={`text-theme-secondary-500 dark:bg-theme-secondary-700 w-${width}`} />
		</div>

		<span className="ml-1">{rating > 0 ? rating : "-"}</span>

		{showTotal && <span className="text-theme-secondary-500">/5</span>}
	</div>
);
