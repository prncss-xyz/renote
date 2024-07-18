import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import '@radix-ui/themes/styles.css'

import { Container, Theme } from '@radix-ui/themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import './main.css'

import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient()

export type MyRooterContext = {
	queryClient: QueryClient
}

const context: MyRooterContext = {
	queryClient,
}

const router = createRouter({
	routeTree,
	context,
	defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement)
	root.render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<Theme accentColor="iris" appearance="dark">
					<Container align="center">
						<RouterProvider router={router} />
					</Container>
				</Theme>
			</QueryClientProvider>
		</StrictMode>,
	)
}
