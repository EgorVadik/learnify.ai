'use client'

import { MDXEditor, type MDXEditorMethods } from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { ALL_PLUGINS } from './config'
import { useEffect, useRef, useState } from 'react'
import { saveNote } from '@/actions/notes'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useWindowEvent } from '@mantine/hooks'
import { Icons } from '@/components/icons'
import { Session } from 'next-auth'

type EditorProps = {
    id: string
    content: string | null
    userId: string
    session: Session | null
}

export const Editor = ({ content, id, session, userId }: EditorProps) => {
    const [mounted, setMounted] = useState(false)
    const editorRef = useRef<MDXEditorMethods>(null)
    const [markdown, setMarkdown] = useState(content)
    const [isSaving, setIsSaving] = useState(false)

    useWindowEvent('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault()
            handleSave()
        }
    })

    useWindowEvent('error', (e) => {
        if (e.message.includes('Cannot read properties of undefined')) {
            toast.error(
                "Nested lists cannot contain deeply nested lists while the parent list is empty. The note state won't be saved until this issue is fixed.",
                {
                    duration: 10000,
                },
            )
        }
    })

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const res = await saveNote({
                id,
                content: editorRef.current?.getMarkdown() ?? '',
            })

            if (!res.success) {
                toast.error(res.error)
                return
            }

            toast.success('Note saved')
        } catch (error) {
            toast.error('Failed to save note')
        } finally {
            setIsSaving(false)
        }
    }

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className='flex h-full w-full flex-1 flex-col overflow-x-hidden'>
            <div className='grow'>
                <MDXEditor
                    ref={editorRef}
                    markdown={markdown ?? ''}
                    onChange={(md) => setMarkdown(md)}
                    placeholder={'Start writing your note...'}
                    autoFocus
                    plugins={ALL_PLUGINS(content ?? '')}
                    contentEditableClassName='w-full max-w-none text-lg px-8 py-5 prose shadow-md'
                    suppressHtmlProcessing
                    readOnly={userId !== session?.user.id}
                />
            </div>
            <div className='p-4'>
                <Button
                    variant={'primary'}
                    className='w-full'
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving && <Icons.Spinner />}
                    Save
                </Button>
            </div>
        </div>
    )
}
