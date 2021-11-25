import React from "react";

import { httpClient } from "@/app/services";
import { WithPluginManager } from "@/plugins/types";

export const HttpPluginProvider = ({ children, manager }: WithPluginManager<{ children: React.ReactNode }>) => {
	const result = manager.plugins().applyFilters("service.http", "options", {});
	httpClient.withOptions(result);

	return <div>{children}</div>;
};
