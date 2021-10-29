import cn from "classnames";
import React, { useMemo } from "react";
import { Column, useSortBy, useTable } from "react-table";
import { styled } from "twin.macro";

import { Icon } from "../Icon";
import { defaultTableStyle } from "./Table.styles";
import { TableColumn } from "./TableColumn.models";

interface TableProperties {
	children?: any;
	className?: string;
	data: any[];
	columns: TableColumn[];
	hideHeader?: boolean;
	initialState?: Record<string, any>;
}

const TableWrapper = styled.div`
	${defaultTableStyle}
`;

export const Table = ({ children, data, columns, hideHeader = false, className, initialState }: TableProperties) => {
	const tableData = useMemo(() => data, [data]);
	const tableColumns = useMemo(() => columns, [columns]) as Column[];

	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
		{
			autoResetSortBy: false,
			columns: tableColumns,
			data: tableData,
			disableSortRemove: true,
			initialState,
		},
		useSortBy,
	);

	const renderChildNode = (data: any, index: number) => {
		if (typeof children === "function") {
			return children(data, index);
		}
		return <tr />;
	};

	return (
		<TableWrapper {...getTableProps({ className })} className={cn({ "-mt-3": !hideHeader })}>
			<table cellPadding={0} className="table-auto">
				{!hideHeader && (
					<thead>
						{headerGroups.map((headerGroup: any, index: number) => (
							<tr
								className="border-b border-theme-secondary-300 dark:border-theme-secondary-800"
								key={index}
								{...headerGroup.getHeaderGroupProps()}
							>
								{headerGroup.headers.map((column: any, thIndex: number) => (
									<th
										key={thIndex}
										className={cn(
											"group relative text-sm text-left select-none text-theme-secondary-500 border-theme-secondary-300 dark:text-theme-secondary-700 dark:border-theme-secondary-800 m-0 p-3 first:pl-0 last:pr-0 font-semibold",
											{ hasBorder: !column.className?.includes("no-border") },
											{ "w-1": column.minimumWidth },
											{ [column.responsiveClass]: column.responsiveClass },
											{
												[`${column.cellWidth} min-${column.cellWidth}`]:
													!column.minimumWidth && column.cellWidth,
											},
										)}
										data-testid={`table__th--${thIndex}`}
										{...column.getHeaderProps(column.getSortByToggleProps())}
									>
										<div
											className={cn("flex flex-inline align-top", column.className, {
												"flex-row-reverse":
													column.className?.includes("justify-end") && !column.disableSortBy,
											})}
										>
											<div>{column.render("Header")}</div>
											{column.canSort && (
												<div
													className={cn(
														"flex items-center text-theme-secondary-500 dark:text-theme-secondary-700 transition-opacity",
														{ "opacity-0 group-hover:opacity-100": !column.isSorted },
														{
															"ml-2": !column.className?.includes("justify-end"),
															"ml-auto mr-2": column.className?.includes("justify-end"),
														},
													)}
												>
													<Icon
														role="img"
														name="ChevronDownSmall"
														className={cn("transition-transform", {
															"transform rotate-180":
																(column.isSorted && !column.isSortedDesc) ||
																(!column.isSorted && !column.sortDescFirst),
														})}
														size="sm"
													/>
												</div>
											)}
										</div>
									</th>
								))}
							</tr>
						))}
					</thead>
				)}

				<tbody {...getTableBodyProps()}>
					{rows.map((row: any) => {
						prepareRow(row);
						return { ...renderChildNode(row.original, row.index), ...row.getRowProps() };
					})}
				</tbody>
			</table>
		</TableWrapper>
	);
};
