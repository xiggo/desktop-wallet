import { DateTime } from "@payvo/intl";
import React from "react";
import { useTranslation } from "react-i18next";

const dateDifference = (date: string) => {
	const now = DateTime.make();
	const target = DateTime.make(date);

	for (const period of ["Years", "Months", "Days", "Hours", "Minutes"]) {
		// @ts-ignore
		const count: number = now[`diffIn${period}`](target);

		if (count > 0) {
			return { count, key: period.toUpperCase() };
		}
	}

	return { key: "FEW_SECONDS" };
};

export const TimeAgo = ({ date }: { date: string }) => {
	const { t } = useTranslation();

	const { count, key } = dateDifference(date);

	const timeAgoText =
		count && count > 1 ? t(`COMMON.DATETIME.${key}_AGO_PLURAL`, { count }) : t(`COMMON.DATETIME.${key}_AGO`);
	return <span data-testid="timeago">{timeAgoText}</span>;
};
