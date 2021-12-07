import path from "path";
import cn from "classnames";
import React, { useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { OriginalButton } from "@/app/components/Button/OriginalButton";
import { Icon } from "@/app/components/Icon";
import { ReadableFile, useFiles } from "@/app/hooks/use-files";

interface SelectFileProperties {
	fileFormat: string;
	onSelect: (file: ReadableFile) => void;
}

export const SelectFile = ({ onSelect, fileFormat }: SelectFileProperties) => {
	const { t } = useTranslation();

	const [dropError, setDropError] = useState<React.ReactNode>();
	const [isDragging, setIsDragging] = useState(false);
	const { openFile, readFileContents } = useFiles();

	const reference = useRef<HTMLDivElement>(null);

	const handleBrowseFiles = async () => {
		const file = await openFile({ extensions: [fileFormat.replace(/\./g, "")] });

		/* istanbul ignore next */
		if (!file) {
			return;
		}

		onSelect(file);
	};

	const handleDragLeave = (event: React.DragEvent) => {
		event.preventDefault();

		/* istanbul ignore else */
		if (reference && reference.current) {
			const bounds = reference.current.getBoundingClientRect();

			/* istanbul ignore next */
			if (
				event.clientX >= Math.trunc(Number(bounds.left) + Number(bounds.width)) ||
				event.clientX <= bounds.left ||
				event.clientY >= Number(bounds.top) + Number(bounds.height) ||
				event.clientY <= bounds.top
			) {
				setIsDragging(false);
			}
		}
	};

	const handleDrop = (event: React.DragEvent) => {
		event.preventDefault();
		event.stopPropagation();

		setIsDragging(false);

		const files = event.dataTransfer.files;

		if (files.length > 1) {
			return setDropError(
				<Trans
					i18nKey="PROFILE.IMPORT.SELECT_FILE_STEP.ERRORS.TOO_MANY"
					values={{ fileCount: files.length }}
				/>,
			);
		}

		const file: File = files[0];

		if (path.extname(file.name) !== fileFormat) {
			return setDropError(
				<Trans i18nKey="PROFILE.IMPORT.SELECT_FILE_STEP.ERRORS.NOT_SUPPORTED" values={{ fileFormat }} />,
			);
		}

		const raw = readFileContents(file.path);

		onSelect(raw);
	};

	const fileFormatIcon: Record<string, string> = {
		".dwe": "ExtensionDwe",
		".json": "ExtensionJson",
	};

	const renderError = () => (
		<>
			<div className="absolute top-4 right-4 z-10 rounded transition-all duration-100 ease-linear bg-theme-primary-100 dark:bg-theme-secondary-800 dark:text-theme-secondary-600 dark:hover:bg-theme-secondary-700 dark:hover:text-theme-secondary-400 hover:bg-theme-primary-300">
				<OriginalButton
					variant="transparent"
					size="icon"
					onClick={() => setDropError(undefined)}
					className="w-8 h-8"
				>
					<Icon name="Cross" size="sm" />
				</OriginalButton>
			</div>

			<p className="whitespace-pre-line text-center">{dropError}</p>
		</>
	);

	const renderContent = () => (
		<>
			{fileFormatIcon[fileFormat] && <Icon name={fileFormatIcon[fileFormat]} size="xl" />}

			<div className="mt-8 space-x-px">
				<span className="font-semibold">{t("PROFILE.IMPORT.SELECT_FILE_STEP.DRAG_AND_DROP")} </span>
				<button
					type="button"
					onClick={handleBrowseFiles}
					title={t("PROFILE.IMPORT.SELECT_FILE_STEP.UPLOAD_TITLE")}
					data-testid="SelectFile__browse-files"
					className="relative font-semibold cursor-pointer focus:outline-none link ring-focus"
					data-ring-focus-margin="-m-1"
				>
					{t("PROFILE.IMPORT.SELECT_FILE_STEP.BROWSE_FILES")}
				</button>
			</div>

			<div className="mt-2 text-sm font-semibold text-theme-secondary-500">
				{t("PROFILE.IMPORT.SELECT_FILE_STEP.SUPPORTED_FORMAT", { fileFormat })}
			</div>
		</>
	);

	return (
		<div
			data-testid="SelectFile"
			className="relative p-2 mt-8 h-52 rounded-lg border-2 border-dashed border-theme-secondary-300 dark:border-theme-secondary-800"
		>
			<div
				data-testid="SelectFile__drop-zone"
				ref={reference}
				onDragOver={(event: React.DragEvent) => event.preventDefault()}
				onDragEnter={(event: React.DragEvent) => {
					event.preventDefault();
					setIsDragging(true);
					setDropError(undefined);
				}}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				className={cn(
					"h-full flex flex-col items-center justify-center rounded-lg transition-colors duration-200",
					{
						"bg-theme-primary-100 dark:bg-black": isDragging || dropError,
						"bg-theme-primary-50 dark:bg-theme-secondary-800": !isDragging && !dropError,
					},
				)}
			>
				{dropError ? renderError() : renderContent()}
			</div>
		</div>
	);
};
