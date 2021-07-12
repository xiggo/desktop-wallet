import { Icon } from "app/components/Icon";
import React from "react";

interface Properties {
	isOfficial?: boolean;
	isGrant?: boolean;
}

const usePluginIcon = () => {
	const renderPluginIcon = ({ isOfficial, isGrant }: Properties) => {
		if (isOfficial) {
			return <Icon className="text-theme-warning-600" name="OfficialArkPlugin" />;
		}

		if (isGrant) {
			return <Icon className="text-theme-warning-600" name="Grant" />;
		}
	};

	return { renderPluginIcon };
};

export { usePluginIcon };
