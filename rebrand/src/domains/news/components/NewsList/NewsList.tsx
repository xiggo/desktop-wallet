import React from "react";
import { useTranslation } from "react-i18next";

import { NewsListProperties } from "./NewsList.contracts";
import { EmptyResults } from "@/app/components/EmptyResults";
import { Pagination } from "@/app/components/Pagination";
import { FTXAd } from "@/domains/news/components/FTXAd";
import { NewsCard, NewsCardSkeleton } from "@/domains/news/components/NewsCard";

const NewsList: React.VFC<NewsListProperties> = ({
	isLoading,
	news,
	totalCount,
	itemsPerPage,
	currentPage,
	onSelectPage,
}) => {
	const { t } = useTranslation();

	const skeletonCards = Array.from({ length: 8 }).fill({});

	if (isLoading) {
		return (
			<div className="space-y-5">
				{skeletonCards.map((_, key: number) => (
					<NewsCardSkeleton key={key} />
				))}
			</div>
		);
	}

	if (news.length === 0) {
		return (
			<EmptyResults
				className="rounded-lg border-2 border-theme-primary-100 dark:border-theme-secondary-800"
				title={t("COMMON.EMPTY_RESULTS.TITLE")}
				subtitle={t("COMMON.EMPTY_RESULTS.SUBTITLE")}
			/>
		);
	}

	return (
		<>
			<div className="space-y-5">
				{news.map((data, index) => (
					<NewsCard key={index} {...data} />
				))}

				<FTXAd />
			</div>

			<div className="flex justify-center mt-10 w-full">
				<Pagination
					totalCount={totalCount}
					itemsPerPage={itemsPerPage}
					onSelectPage={onSelectPage}
					currentPage={currentPage}
				/>
			</div>
		</>
	);
};

export { NewsList };
