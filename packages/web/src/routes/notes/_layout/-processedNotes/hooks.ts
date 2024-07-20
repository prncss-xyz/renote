import { useContext } from 'react'
import { useStore } from 'zustand'

import { ProcessedNotes, ProcessedNotesCtx } from './core'

export function useProcessedNotes<T>(selector: (state: ProcessedNotes) => T) {
	const store = useContext(ProcessedNotesCtx)
	if (!store) throw new Error('useProcessedNotes must be used within Provider')
	return useStore(store, selector)
}
