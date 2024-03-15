'use client'

import ScrollContainer, {
    ScrollContainerProps,
} from 'react-indiana-drag-scroll'

type ScrollContainerWrapperProps = {
    children: React.ReactNode
    className?: string
} & Omit<ScrollContainerProps, 'ref'>

export const ScrollContainerWrapper = ({
    children,
    className,
    ...props
}: ScrollContainerWrapperProps) => {
    return (
        <ScrollContainer
            {...props}
            className={className}
            hideScrollbars={false}
        >
            {children}
        </ScrollContainer>
    )
}
