import React from "react";
import tw, { styled } from "twin.macro";

import { SideBarItem } from "./SideBarItem";

export interface Item {
	icon?: string;
	itemKey: string;
	label: string;
	route: string;
}

interface Properties {
	activeItem: string;
	handleActiveItem: (key: string) => void;
	items: Item[];
}

const SideBarContainer = styled.div`
	${tw`h-full`}

	width: 210px;
`;

export const SideBar: React.FC<Properties> = ({ activeItem, handleActiveItem, items }: Properties) => (
	<SideBarContainer>
		<ul>
			{items.map(({ label, route, itemKey, icon }, index) => (
				<SideBarItem
					label={label}
					route={route}
					icon={icon}
					itemKey={itemKey}
					key={index}
					handleActiveItem={handleActiveItem}
					isActive={activeItem === itemKey}
				/>
			))}
		</ul>
	</SideBarContainer>
);
