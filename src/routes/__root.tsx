import { MyRooterContext } from "@/main";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Flex, TabNav, ThemePanel } from "@radix-ui/themes";
import { selectNotesOptsZero } from "@/core/noteSelection";

export const Route = createRootRouteWithContext<MyRooterContext>()({
  component: Component,
});

function Notes() {
  const active = useLocation({
    select: ({ pathname }) => pathname.startsWith("/notes"),
  });
  return (
    <TabNav.Link active={active} asChild>
      <Link to="/notes/edit" search={selectNotesOptsZero}>
        Notes
      </Link>
    </TabNav.Link>
  );
}

function Settings() {
  const active = useLocation({
    select: ({ pathname }) => pathname === "/settings",
  });
  return (
    <TabNav.Link active={active} asChild>
      <Link to="/settings">Settings</Link>
    </TabNav.Link>
  );
}

const showThemePanel = false;

function Component() {
  return (
    <Flex direction="column" gap="3">
      <TabNav.Root>
        <Notes />
        <Settings />
      </TabNav.Root>
      <Outlet />
      <TanStackRouterDevtools />
      <ReactQueryDevtools initialIsOpen={false} />
      {showThemePanel && <ThemePanel />}
    </Flex>
  );
}
