import { ControlButton } from "app/components/ControlButton";
import { Icon } from "app/components/Icon";
import cn from "classnames";
import React from "react";

interface LayoutControlsProperties {
	onSelectGridView: () => void;
	onSelectListView: () => void;
	selectedViewType: string;
}

export const LayoutControls = ({ onSelectGridView, onSelectListView, selectedViewType }: LayoutControlsProperties) => (
	<div className="flex items-center space-x-1">
		<div data-testid="LayoutControls__list">
			<ControlButton
				data-testid="LayoutControls__list--icon"
				className={cn({ active: selectedViewType === "list" })}
				onClick={onSelectListView}
			>
				<Icon name="ListView" size="lg" />
			</ControlButton>
		</div>

		<div data-testid="LayoutControls__grid">
			<ControlButton
				data-testid="LayoutControls__grid--icon"
				className={cn({ active: selectedViewType === "grid" })}
				onClick={onSelectGridView}
			>
				<Icon name="GridView" size="lg" />
			</ControlButton>
		</div>
	</div>
);

LayoutControls.defaultProps = {
	selectedViewType: "grid",
};
