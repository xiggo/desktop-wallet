import cn from "classnames";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { styled } from "twin.macro";

import { getStyles } from "./PluginImage.styles";
import { CircularProgressBar } from "@/app/components/CircularProgressBar";
import { Image } from "@/app/components/Image";
import { useTheme } from "@/app/hooks";
import { Size } from "@/types";

export enum PluginImageProgressSize {
	Small = 20,
	Base = 40,
}

interface Properties {
	size?: Size;
	logoURL?: string;
	isUpdating?: boolean;
	updatingProgress?: number;
	progressSize?: PluginImageProgressSize;
	className?: string;
	showUpdatingLabel?: boolean;
}

const PluginImageWrapper = styled.div<{ size?: Size; variant?: string }>(getStyles);

export const PluginImage = ({
	size,
	logoURL,
	isUpdating,
	updatingProgress = 0,
	progressSize = PluginImageProgressSize.Base,
	className,
	showUpdatingLabel,
}: Properties) => {
	const { isDarkMode } = useTheme();

	const { t } = useTranslation();

	const colors = useMemo(
		() => ({
			progressColor: "var(--theme-color-success-600)",
			strokeColor: isDarkMode ? "var(--theme-color-success-800)" : "var(--theme-color-success-200)",
		}),
		[isDarkMode],
	);

	const [hasError, setHasError] = useState(false);

	const renderContent = () => {
		if (isUpdating) {
			return (
				<>
					<CircularProgressBar
						value={+(updatingProgress * 100).toFixed(0)}
						size={progressSize}
						strokeWidth={3}
						fontSize={0.8}
						showValue={progressSize !== PluginImageProgressSize.Small}
						{...colors}
					/>
					{showUpdatingLabel && (
						<p
							data-testid="PluginImage__updating__label"
							className="text-sm font-semibold text-theme-success-600"
						>
							{t("COMMON.UPDATING")}
						</p>
					)}
				</>
			);
		}

		if (hasError || !logoURL) {
			return <Image name="PluginLogoPlaceholder" domain="plugin" />;
		}

		return (
			<img src={logoURL} alt="Logo" className="object-cover w-full h-full" onError={() => setHasError(true)} />
		);
	};

	return (
		<PluginImageWrapper
			size={size}
			variant={isUpdating ? "progress" : undefined}
			className={cn(
				"bg-theme-primary-100 text-theme-primary-600 dark:bg-theme-secondary-800 dark:text-theme-secondary-700",
				className,
			)}
			data-testid="PluginImage"
		>
			{renderContent()}
		</PluginImageWrapper>
	);
};
