import { Icon } from "app/components/Icon";
import React from "react";

interface Properties {
	isOfficial?: boolean;
}

const usePluginIcon = () => {
	const renderPluginIcon = ({ isOfficial }: Properties) => {
		if (isOfficial) {
			return <Icon className="text-theme-warning-600" name="OfficialPlugin" />;
		}
	};

	return { renderPluginIcon };
};

export { usePluginIcon };
