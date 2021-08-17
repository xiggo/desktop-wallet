import { Icon } from "app/components/Icon";
import { Tooltip } from "app/components/Tooltip";
import React from "react";

interface Properties {
	memo?: string;
}

export const TransactionRowMemo = ({ memo }: Properties) => (
	<div
		data-testid="TransactionRowMemo"
		className="inline-flex space-x-1 align-middle text-theme-secondary-700 dark:text-theme-secondary-600"
	>
		{!!memo && (
			<Tooltip className="break-all" content={memo}>
				<span className="p-1">
					<Icon data-testid="TransactionRowMemo__vendorField" name="FileLines" size="lg" />
				</span>
			</Tooltip>
		)}
	</div>
);
