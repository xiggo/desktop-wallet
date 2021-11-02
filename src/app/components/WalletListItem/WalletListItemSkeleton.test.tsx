import React from "react";
import { render } from "utils/testing-library";

import { WalletListItemSkeleton } from "./WalletListItemSkeleton";

describe("WalletListItemSkeleton", () => {
	it.each([true, false])("should render wallet list skeleton when isCompact = %s", (isCompact: boolean) => {
		const { container, getByTestId } = render(
			<table>
				<tbody data-testid="WalletListSkeleton">
					<WalletListItemSkeleton isCompact={isCompact} />
				</tbody>
			</table>,
		);

		expect(getByTestId("WalletListSkeleton")).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});
});
