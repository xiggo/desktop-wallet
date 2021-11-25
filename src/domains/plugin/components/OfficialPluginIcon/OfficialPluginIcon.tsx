import React from "react";

import { Icon } from "@/app/components/Icon";
import { Size } from "@/types";

export const OfficialPluginIcon = ({ size }: { size?: Size }) => (
	<Icon className="text-theme-warning-600" name="ShieldCheckMark" size={size} />
);
