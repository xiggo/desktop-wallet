import { createFixture } from "../../../utils/e2e-utils";
import { goToContacts } from "./common";

createFixture(`Contacts routing`);

// eslint-disable-next-line jest/require-top-level-describe
test("should navigate to contacts page", async (t) => await goToContacts(t));
