import { contentsZero, NoteMeta, noteZero } from '@/core/models'
import { CodeNode } from '@lexical/code'
import { LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
/* import ToolbarPlugin from "./plugins/toolBar"; */
import { Box, Button, Card, DataList, Flex, ScrollArea } from '@radix-ui/themes'

import { serialize } from './encoding'
import { NavNotes } from './navNotes'
import { OnChangePlugin } from './plugins/onChange'

import './index.css'

import { usePurgeNote, useRestoreNote } from '@/db'
import { useDoubleClick } from '@/hooks/doubleClick'
import { useLocation, useRouter, useSearch } from '@tanstack/react-router'
import { useCallback } from 'react'

import { useRemove } from './remove'
import { TagBar } from './tagBar'

const from = '/notes/_layout'

export function EditorCreate({ id }: { id: string }) {
	/*
  const searchTag = useSearch({ from: "/notes" }).tag.trim(); // all special values are reduced to empty string
  const tags = searchTag ? [searchTag] : [];
  const meta = { ...noteZero, tags, id };
  */
	const meta = { ...noteZero, id }
	return (
		<Editor
			meta={meta}
			contents={contentsZero}
			editable={true}
			deleted={false}
		/>
	)
}

export function Editor({
	meta,
	contents,
	editable,
	deleted,
}: {
	meta: NoteMeta
	contents: string
	editable: boolean
	deleted: boolean
}) {
	const edit = useEdit(meta.id, deleted)
	const handleDoubleClick = useDoubleClick(edit)
	return (
		<LexicalComposer
			key={meta.id}
			initialConfig={{
				...config,
				editorState: () => serialize(contents),
				editable,
			}}
		>
			<Flex direction="column" gap="2" flexGrow="1">
				<NavNotes id={meta.id} deleted={deleted} archived={meta.archive} />
				{deleted && <Deleted id={meta.id} />}
				{/* <ToolbarPlugin /> */}
				<DataList.Root>
					<TagBar meta={meta} />
				</DataList.Root>
				<ScrollArea type="auto" scrollbars="vertical">
					<Card className="editor" onClick={handleDoubleClick}>
						<RichTextPlugin
							contentEditable={<ContentEditable />}
							placeholder={<></>}
							ErrorBoundary={LexicalErrorBoundary}
						/>
					</Card>
				</ScrollArea>
				<MarkdownShortcutPlugin />
				<AutoFocusPlugin />
				<OnChangePlugin meta={meta} contents={contents} />
			</Flex>
			<HistoryPlugin />
		</LexicalComposer>
	)
}

function Restore({ id }: { id: string }) {
	const { mutate } = useRestoreNote()
	const onClick = useRemove(id, mutate)
	return <Button onClick={onClick}>Restore</Button>
}

function Purge({ id }: { id: string }) {
	const { mutate } = usePurgeNote()
	const onClick = useRemove(id, mutate)
	return <Button onClick={onClick}>Purge</Button>
}

function Deleted({ id }: { id: string }) {
	return (
		<Flex direction="row" align="baseline" justify="between" gap="2">
			<Box>This note has been deleted.</Box>
			<Flex gap="1">
				<Restore id={id} />
				<Purge id={id} />
			</Flex>
		</Flex>
	)
}

function useEdit(id: string, deleted: boolean) {
	const { pathname } = useLocation()
	const disabled = pathname.startsWith('/notes/edit')
	const { navigate } = useRouter()
	const search = useSearch({ from })
	return useCallback(() => {
		if (disabled || deleted) return
		navigate({
			to: '/notes/edit/$id',
			params: { id },
			search,
		})
	}, [disabled, deleted, navigate, id, search])
}

function onError(error: unknown) {
	// eslint-disable-next-line no-console
	console.error(error)
}

const config = {
	namespace: 'MyEditor',
	nodes: [
		CodeNode,
		HeadingNode,
		LinkNode,
		ListNode,
		ListItemNode,
		QuoteNode,
		HorizontalRuleNode,
	],
	onError,
}
