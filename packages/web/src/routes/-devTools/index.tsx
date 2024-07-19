import { lazy, Suspense } from 'react'

const Lazy = import.meta.env.DEV
	? lazy(() =>
			import('./raw').then((res) => ({
				default: res.Raw,
			})),
		)
	: () => null

export function DevTools() {
	return (
			<Suspense fallback={null}>
				<Lazy />
			</Suspense>
	)
}
