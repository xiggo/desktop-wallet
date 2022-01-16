import React from "react";

import { LayoutControls } from "@/app/components/LayoutControls";

interface PluginManagerControlsProperties {
	onSelectGridView: any;
	onSelectListView: any;
	selectedViewType: string;
}

export const PluginManagerControls = ({
	onSelectGridView,
	onSelectListView,
	selectedViewType = "grid",
}: PluginManagerControlsProperties) => (
	<div data-testid="PluginManagerControls" className="flex items-center">
		<LayoutControls
			onSelectGridView={onSelectGridView}
			onSelectListView={onSelectListView}
			selectedViewType={selectedViewType}
		/>
	</div>
);
