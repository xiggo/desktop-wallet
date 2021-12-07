import React, { FC } from "react";

import { PageProperties } from "./Page.contracts";
import { NavigationBar } from "@/app/components/NavigationBar";

export const Page: FC<PageProperties> = ({ navbarVariant = "full", title, isBackDisabled, sidebar, children }) => {
	const renderSidebar = () => (
		<div className="flex flex-1">
			<div className="container flex mx-auto">
				<div className="px-12 my-8 border-r border-theme-primary-100 dark:border-theme-secondary-800">
					{sidebar}
				</div>

				<div className="w-full">{children}</div>
			</div>
		</div>
	);

	return (
		<div className="flex relative flex-col min-h-screen">
			<NavigationBar variant={navbarVariant} title={title} isBackDisabled={isBackDisabled} />

			<div className="flex flex-col flex-1">{sidebar ? renderSidebar() : children}</div>
		</div>
	);
};
