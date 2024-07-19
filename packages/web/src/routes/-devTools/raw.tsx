import { ThemePanel } from '@radix-ui/themes'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

const showThemePanel = false

export function Raw() {
	return (
		<>
			<TanStackRouterDevtools />
			<ReactQueryDevtools initialIsOpen={false} />
			{showThemePanel && <ThemePanel />}
		</>
	)
}
