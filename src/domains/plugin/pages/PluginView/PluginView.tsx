import { LaunchRender } from "plugins";
import React, { useRef } from "react";
import { FallbackProps } from "react-error-boundary";

import { Page } from "@/app/components/Layout";
import { TextArea } from "@/app/components/TextArea";
import { useQueryParameters } from "@/app/hooks";
import { PluginImage } from "@/domains/plugin/components/PluginImage";
import { usePluginManagerContext } from "@/plugins/context/PluginManagerProvider";

const ErrorFallback = ({ error }: FallbackProps) => {
	const errorMessageReference = useRef();

	return (
		<div className="flex items-center py-10 w-full">
			<div className="container flex flex-col mx-auto">
				<h3 className="mb-4">An error occurred!</h3>

				<TextArea
					className="py-4"
					initialHeight={70}
					defaultValue={error.stack || error.message}
					ref={errorMessageReference}
					disabled
				/>
			</div>
		</div>
	);
};

export const PluginView = () => {
	const queryParameters = useQueryParameters();

	const { pluginManager } = usePluginManagerContext();

	const pluginId = queryParameters.get("pluginId")!;
	const plugin = pluginManager.plugins().findById(pluginId);

	/* istanbul ignore next */
	if (!plugin) {
		return <></>;
	}

	return (
		<Page>
			<div className="py-4 px-4 sm:px-6 lg:px-10">
				<div className="flex justify-between items-center">
					<div className="flex items-center space-x-3">
						<PluginImage size="3xs" logoURL={plugin.config().logo()} />

						<div className="flex space-x-10 divide-x divide-theme-secondary-300 dark:divide-theme-secondary-700">
							<dl>
								<dd className="font-semibold text-theme-secondary-text dark:text-theme-text">
									{plugin.config().title()}
								</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div className="flex relative flex-1 w-full h-full">
				<LaunchRender manager={pluginManager} pluginId={pluginId} fallback={ErrorFallback} />
			</div>
		</Page>
	);
};
