import userEvent from "@testing-library/user-event";
import React from "react";

import { PluginList } from "./PluginList";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { render, screen, within } from "@/utils/testing-library";

const plugins = [
	{
		author: "ARK.io",
		category: "utility",
		id: "ark-explorer",
		isInstalled: false,
		isOfficial: true,
		rating: 4.2,
		size: "4.2 MB",
		title: "ARK Explorer",
		updateStatus: {
			isAvailable: false,
		},
		version: "1.3.8",
	},
	{
		author: "ARK.io",
		category: "other",
		id: "ark-avatars",
		isInstalled: true,
		rating: 3.8,
		size: "163 KB",
		title: "ARK Avatars",
		updateStatus: {
			isAvailable: false,
		},
		version: "1.3.8",
	},
];

describe("PluginList", () => {
	it("should render pagination", () => {
		const morePlugins = [
			{
				author: "Breno Polanski",
				category: "other",
				id: "drakula-theme",
				isEnabled: true,
				isInstalled: true,
				size: "163 KB",
				title: "Drakula Theme",
				updateStatus: {
					isAvailable: false,
				},
				version: "1.3.8",
			},
			{
				author: "ARK.io",
				category: "other",
				id: "avfc-theme",
				isEnabled: true,
				isInstalled: true,
				size: "163 KB",
				title: "Avfc Theme",
				updateStatus: {
					isAvailable: false,
				},
				version: "1.3.8",
			},
			{
				author: "ARK.io",
				category: "other",
				id: "red-snow-theme",
				isEnabled: true,
				isInstalled: true,
				size: "163 KB",
				title: "Red snow theme",
				updateStatus: {
					isAvailable: false,
				},
				version: "1.3.8",
			},
		];
		const { asFragment } = render(<PluginList pluginsPerPage={4} plugins={[...plugins, ...morePlugins]} />);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(4);
		expect(screen.getByTestId("Pagination")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should not render pagination", () => {
		const { asFragment } = render(<PluginList plugins={plugins} />);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(2);
		expect(screen.queryByTestId("Pagination")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render without pagination", () => {
		const { asFragment } = render(<PluginList plugins={plugins} showPagination={false} />);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(2);
		expect(screen.queryByTestId("Pagination")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should split by page", () => {
		const { asFragment } = render(<PluginList plugins={plugins} pluginsPerPage={1} />);

		expect(screen.getAllByTestId("TableRow")).toHaveLength(1);

		expect(screen.getByText("ARK Avatars")).toBeInTheDocument();
		expect(screen.queryByText("ARK Explorer")).not.toBeInTheDocument();

		userEvent.click(screen.getByTestId("Pagination__next"));

		expect(screen.getByText("ARK Explorer")).toBeInTheDocument();
		expect(screen.queryByText("ARK Avatars")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should trigger install", () => {
		const onInstall = jest.fn();

		const { asFragment } = render(<PluginList plugins={plugins} onInstall={onInstall} />);

		userEvent.click(within(screen.getAllByTestId("TableRow")[1]).getByTestId("PluginListItem__install"));

		expect(onInstall).toHaveBeenCalledTimes(1);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should trigger delete", () => {
		const onDelete = jest.fn();

		const { asFragment } = render(<PluginList plugins={plugins} onDelete={onDelete} />);

		userEvent.click(within(screen.getAllByTestId("TableRow")[0]).getByTestId("dropdown__toggle"));
		userEvent.click(within(screen.getAllByTestId("TableRow")[0]).getByText(commonTranslations.DELETE));

		expect(onDelete).toHaveBeenCalledTimes(1);
		expect(asFragment()).toMatchSnapshot();
	});
});
