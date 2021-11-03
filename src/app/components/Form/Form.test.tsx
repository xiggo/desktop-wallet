import { screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import { useForm } from "react-hook-form";
import { fireEvent, render } from "utils/testing-library";

import { Form } from "./Form";

describe("Form", () => {
	it("should render with provider", async () => {
		const { result: form, waitForNextUpdate } = renderHook(() => useForm());
		const onSubmit = jest.fn();

		render(
			<Form context={form.current} onSubmit={onSubmit}>
				<input name="name" ref={form.current.register()} defaultValue="test" />
			</Form>,
		);

		fireEvent.submit(screen.getByTestId("Form"));

		await waitForNextUpdate();

		expect(onSubmit).toHaveBeenCalledWith({ name: "test" }, expect.anything());
	});
});
