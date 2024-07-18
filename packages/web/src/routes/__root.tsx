import { selectNotesOptsZero } from '@/core/noteSelection'
import { MyRooterContext } from '@/main'
import { Flex, TabNav, ThemePanel } from '@radix-ui/themes'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
	createRootRouteWithContext,
	Link,
	Outlet,
	useLocation,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRouteWithContext<MyRooterContext>()({
	component: Component,
})

function Notes() {
	const active = useLocation({
		select: ({ pathname }) => pathname.startsWith('/notes'),
	})
	return (
		<TabNav.Link active={active} asChild>
			<Link to="/" search={selectNotesOptsZero}>
				Notes
			</Link>
		</TabNav.Link>
	)
}

function Settings() {
	const active = useLocation({
		select: ({ pathname }) => pathname === '/settings',
	})
	return (
		<TabNav.Link active={active} asChild>
			<Link to="/settings">Settings</Link>
		</TabNav.Link>
	)
}

const showThemePanel = false

function Component() {
	return (
		<Flex direction="column" gap="3">
			<TabNav.Root>
				<Notes />
				<Settings />
			</TabNav.Root>
			<Flex px="2" maxHeight="calc(100vh - 80px)">
				<Outlet />
			</Flex>
			<TanStackRouterDevtools />
			<ReactQueryDevtools initialIsOpen={false} />
			{showThemePanel && <ThemePanel />}
		</Flex>
	)
}
