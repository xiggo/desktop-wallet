import { Icon } from "app/components/Icon";
import React from "react";
import { Size } from "types";

export const OfficialPluginIcon = ({ size }: { size?: Size }) => (
	<Icon className="text-theme-warning-600" name="ShieldCheckMark" size={size} />
);
