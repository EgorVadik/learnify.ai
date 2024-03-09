'use client'

import ScrollContainer from 'react-indiana-drag-scroll'

type ScrollContainerWrapperProps = {
    children: React.ReactNode
    className?: string
}
export const ScrollContainerWrapper = ({
    children,
    className,
}: ScrollContainerWrapperProps) => {
    return (
        <ScrollContainer className={className} hideScrollbars={false}>
            {children}
        </ScrollContainer>
    )
}
