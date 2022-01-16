import React from "react";
import { useTranslation } from "react-i18next";

import { Circle } from "@/app/components/Circle";
import { Icon } from "@/app/components/Icon";
import { PluginImage } from "@/domains/plugin/components/PluginImage";

interface Properties {
	plugin: any;
}

export const ThirdStep = ({ plugin }: Properties) => {
	const { t } = useTranslation();

	return (
		<section data-testid="InstallPlugin__step--third">
			<p className="-mt-1 text-theme-secondary-text">{t("PLUGINS.MODAL_ENABLE_PLUGIN.DESCRIPTION")}</p>

			<div className="flex mt-8">
				<PluginImage className="mr-6" size="lg" logoURL={plugin.logo} />

				<div className="flex-1">
					<div className="flex flex-col justify-around h-full">
						<div>
							<p className="text-sm font-semibold text-theme-secondary-400">{t("COMMON.PLUGIN")}</p>
							<p className="text-lg font-semibold text-theme-black">{plugin.title}</p>
						</div>
						<div className="flex justify-between">
							<span>
								<p className="text-sm font-semibold text-theme-secondary-400">
									{t("PLUGINS.MODAL_ENABLE_PLUGIN.INSTALLATION")}
								</p>
								<p className="font-bold text-theme-secondary-text">{t("COMMON.COMPLETED")}</p>
							</span>
							<div className="">
								<Circle
									size="lg"
									className="relative z-10 bg-theme-background border-theme-secondary-300 dark:border-theme-secondary-800"
								>
									<span className="text-theme-success-600">
										<Icon name="Checkmark" />
									</span>
								</Circle>
								<Circle size="lg" className="relative z-0 bg-theme-background border-theme-success-600">
									<span className="text-xs font-semibold text-theme-success-600">100%</span>
								</Circle>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
