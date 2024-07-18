import { NoteMeta, noteZero } from './models'
import {
	findNext,
	isSearchable,
	processNotes,
	SearchTag,
	selectNotesOptsSchema,
	selectNotesOptsZero,
} from './noteSelection'

describe('selectNotesOptsSchema', () => {
	it('should defaults to default search query', () => {
		expect(selectNotesOptsSchema.parse({})).toEqual(selectNotesOptsZero)
	})
})

describe('processNotes', () => {
	it('should return right defaults', () => {
		expect(processNotes(selectNotesOptsZero, [])).toEqual({
			notes: [],
			expend: {
				trash: false,
				archive: false,
				untagged: false,
			},
			allTags: [],
		})
	})
	it('should skip purged notes', () => {
		expect(processNotes(selectNotesOptsZero, [noteZero])).toEqual({
			notes: [],
			expend: {
				trash: false,
				archive: false,
				untagged: false,
			},
			allTags: [],
		})
	})
	describe('trash', () => {
		it('should skip when not querying', () => {
			expect(
				processNotes(selectNotesOptsZero, [
					{ ...noteZero, btime: 1, trash: true },
				]),
			).toEqual({
				notes: [],
				expend: {
					trash: true,
					archive: false,
					untagged: false,
				},
				allTags: [],
			})
		})
		it('should find when querying', () => {
			expect(
				processNotes({ ...selectNotesOptsZero, trash: true }, [
					{ ...noteZero, btime: 1, trash: true },
				]),
			).toMatchObject({
				notes: [{ btime: 1 }],
				expend: {
					trash: true,
					archive: false,
					untagged: true,
				},
				allTags: [],
			})
		})
	})
	describe('archive', () => {
		it('should skip when not querying', () => {
			expect(
				processNotes(selectNotesOptsZero, [
					{ ...noteZero, btime: 1, archive: true },
				]),
			).toMatchObject({
				notes: [],
				expend: {
					archive: true,
				},
			})
		})
		it('should find when querying', () => {
			expect(
				processNotes({ ...selectNotesOptsZero, archive: true }, [
					{ ...noteZero, btime: 1, archive: true },
				]),
			).toMatchObject({
				notes: [{ btime: 1, archive: true }],
				expend: {
					archive: true,
				},
			})
		})
	})
	describe('tags', () => {
		it('should include untagged', () => {
			expect(
				processNotes({ ...selectNotesOptsZero, tag: SearchTag.UNTAGGED }, [
					{ ...noteZero, id: '1', btime: 1, tags: ['a'] },
					{ ...noteZero, id: '2', btime: 1, tags: [] },
				]),
			).toMatchObject({
				notes: [{ id: '2' }],
				allTags: ['a'],
				expend: {
					trash: false,
					archive: false,
					untagged: true,
				},
			})
		})
		it('should include all tags', () => {
			expect(
				processNotes({ ...selectNotesOptsZero, tag: 'a' }, [
					{ ...noteZero, id: '1', btime: 1, tags: ['a'] },
					{ ...noteZero, id: '2', btime: 1, tags: ['b'] },
					{ ...noteZero, id: '3', btime: 1, tags: ['b'] },
				]),
			).toMatchObject({
				notes: [{ id: '1' }],
				allTags: ['a', 'b'],
				expend: {
					trash: false,
					archive: false,
					untagged: false,
				},
			})
		})
	})
	describe('sortBy', () => {
		const notes = [
			{ ...noteZero, btime: 3, mtime: 1, title: 'a' },
			{ ...noteZero, btime: 2, mtime: 2, title: 'b' },
			{ ...noteZero, btime: 1, mtime: 3, title: 'c' },
		]
		describe('btime', () => {
			test('asc', () => {
				expect(
					processNotes(
						{ ...selectNotesOptsZero, sortBy: 'btime', asc: true },
						notes,
					),
				).toMatchObject({
					notes: [{ btime: 1 }, { btime: 2 }, { btime: 3 }],
				})
			})
			test('desc', () => {
				expect(
					processNotes(
						{ ...selectNotesOptsZero, sortBy: 'btime', asc: false },
						notes,
					),
				).toMatchObject({
					notes: [{ btime: 3 }, { btime: 2 }, { btime: 1 }],
				})
			})
		})
		describe('mtime', () => {
			test('asc', () => {
				expect(
					processNotes(
						{ ...selectNotesOptsZero, sortBy: 'mtime', asc: true },
						notes,
					),
				).toMatchObject({
					notes: [{ mtime: 1 }, { mtime: 2 }, { mtime: 3 }],
				})
			})
			test('desc', () => {
				expect(
					processNotes(
						{ ...selectNotesOptsZero, sortBy: 'mtime', asc: false },
						notes,
					),
				).toMatchObject({
					notes: [{ mtime: 3 }, { mtime: 2 }, { mtime: 1 }],
				})
			})
		})
		describe('title', () => {
			test('asc', () => {
				expect(
					processNotes(
						{ ...selectNotesOptsZero, sortBy: 'title', asc: true },
						notes,
					),
				).toMatchObject({
					notes: [{ title: 'a' }, { title: 'b' }, { title: 'c' }],
				})
			})
			test('desc', () => {
				expect(
					processNotes(
						{ ...selectNotesOptsZero, sortBy: 'title', asc: false },
						notes,
					),
				).toMatchObject({
					notes: [{ title: 'c' }, { title: 'b' }, { title: 'a' }],
				})
			})
		})
	})
})
describe('isSearchable', () => {
	describe('should be truthy when it appears in the default search query and title is not empty', () => {
		const note = { ...noteZero, btime: 1, trash: false, title: 'a' }
		function same(note: NoteMeta) {
			return (
				!!isSearchable(note) ===
				(!!processNotes(selectNotesOptsZero, [note]).notes.length &&
					note.title.length > 0)
			)
		}
		test('passing note', () => {
			expect(same(note)).toBeTruthy()
		})
		it('btime is zero', () => {
			expect(same({ ...noteZero, btime: 0 })).toBeTruthy()
		})
		it('trash is true', () => {
			expect(same({ ...noteZero, trash: true })).toBeTruthy()
		})
		it('title is empty', () => {
			expect(same({ ...noteZero, btime: 1, title: '' })).toBeTruthy()
		})
	})
})

describe('findNext', () => {
	const notes = [
		{ ...noteZero, id: '1' },
		{ ...noteZero, id: '2' },
		{ ...noteZero, id: '3' },
	]
	test('return empty string when querying empty string', () => {
		expect(findNext(notes, '')).toBe('')
	})
	test('return empty string when no notes', () => {
		expect(findNext([], '')).toBe('')
	})
	test('return penultimate when querying note', () => {
		expect(findNext(notes, '3')).toBe('2')
	})
	test('return following note otherwise', () => {
		expect(findNext(notes, '2')).toBe('3')
	})
})
