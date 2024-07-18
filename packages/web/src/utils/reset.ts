import { useCallback, useState } from 'react'

export function useReset() {
	const [key, setKey] = useState(0)
	const reset = useCallback(() => setKey((k) => k + 1), [setKey])
	return [String(key), reset] as const
}
