import { Page } from "app/components/Layout";
import { useActiveProfile, useQueryParams } from "app/hooks";
import React from "react";
import { assertString } from "utils/assertions";

export const ExchangeView = () => {
	const queryParameters = useQueryParams();

	const profile = useActiveProfile();

	const exchangeId = queryParameters.get("exchangeId");
	assertString(exchangeId);

	// @TODO
	const renderExchange = () => <></>;

	return (
		<Page profile={profile}>
			<div className="flex relative flex-1 w-full h-full">{renderExchange()}</div>
		</Page>
	);
};
