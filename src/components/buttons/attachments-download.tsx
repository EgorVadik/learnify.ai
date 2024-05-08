'use client'

import { Icons } from '@/components/icons'
import { Button } from '../ui/button'
import { saveAs } from 'file-saver'
import { formatAttachmentName } from '@/lib/utils'

type AttachmentsDownloadProps = {
    attachments: {
        name: string
        url: string
    }[]
    formatAttachment?: boolean
}

export const AttachmentsDownload = ({
    attachments,
    formatAttachment = true,
}: AttachmentsDownloadProps) => {
    return (
        attachments.length > 0 && (
            <div className='flex flex-col items-start'>
                {attachments.map((attachment) => (
                    <Button
                        variant={'link'}
                        className='px-0 py-0'
                        key={attachment.url}
                        onClick={() => {
                            saveAs(attachment.url, attachment.name)
                        }}
                    >
                        <span className='flex items-center gap-2 text-sm font-medium'>
                            <Icons.Attachment />
                            {formatAttachment
                                ? formatAttachmentName(attachment.name)
                                : attachment.name}
                        </span>
                    </Button>
                ))}
            </div>
        )
    )
}
