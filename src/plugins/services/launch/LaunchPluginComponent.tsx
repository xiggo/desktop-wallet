import React, { useMemo } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

import { WithPluginManager } from "@/plugins/types";

interface Properties {
	pluginId: string;
	fallback: React.ComponentType<FallbackProps>;
}

export const LaunchRender = ({ pluginId, fallback, manager }: WithPluginManager<Properties>) => {
	const result = useMemo(() => {
		try {
			return manager.plugins().findById(pluginId)?.hooks().executeCommand("service:launch.render");
		} catch {
			/* istanbul ignore next */
			return;
		}
	}, [pluginId, manager]);

	return (
		<ErrorBoundary FallbackComponent={fallback}>
			<>{result || fallback}</>
		</ErrorBoundary>
	);
};
