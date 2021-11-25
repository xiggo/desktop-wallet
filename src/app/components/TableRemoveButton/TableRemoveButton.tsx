import React, { MouseEvent } from "react";

import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";

export const TableRemoveButton = ({
	isCompact,
	onClick,
}: {
	isCompact?: boolean;
	onClick: (event: MouseEvent) => void;
}) => {
	if (isCompact) {
		return (
			<Button
				size="icon"
				data-testid="TableRemoveButton"
				variant="transparent"
				className="text-theme-danger-400 hover:text-theme-danger-500"
				onClick={onClick}
				icon="Trash"
			/>
		);
	}

	return (
		<Button data-testid="TableRemoveButton" variant="danger" onClick={onClick}>
			<Icon name="Trash" size="lg" />
		</Button>
	);
};
