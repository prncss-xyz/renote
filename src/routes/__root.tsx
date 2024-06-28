import { MyRooterContext } from "@/main";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Flex } from "@radix-ui/themes";
import { selectNotesOptsZero } from "@/core/noteSelection";

export const Route = createRootRouteWithContext<MyRooterContext>()({
  component: () => (
    <Flex direction="column" gap="2">
      <Flex direction="row" gap="2">
        <Link to="/notes/edit" search={selectNotesOptsZero}>
          Notes
        </Link>
        <Link to="/settings">Settings</Link>
      </Flex>
      <Outlet />
      <TanStackRouterDevtools />
      <ReactQueryDevtools initialIsOpen={false} />
    </Flex>
  ),
});
