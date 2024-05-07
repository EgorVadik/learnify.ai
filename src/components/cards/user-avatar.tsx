import { cn, getUsernameFallback } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type UserAvatarProps = {
    name: string
    image: string | null
    wrapperClassName?: string
    imageClassName?: string
    nameClassName?: string
    activeNow?: boolean
}

export const UserAvatar = ({
    name,
    image,
    imageClassName,
    nameClassName,
    wrapperClassName,
    activeNow = false,
}: UserAvatarProps) => {
    return (
        <div className={cn('flex items-center gap-4', wrapperClassName)}>
            <Avatar className={imageClassName}>
                <AvatarFallback>{getUsernameFallback(name)}</AvatarFallback>
                <AvatarImage src={image ?? undefined} alt={name} />
            </Avatar>

            <div
                className={cn(
                    'max-xs:max-w-[4rem] line-clamp-1 max-w-[8rem] break-all',
                    nameClassName,
                )}
            >
                {name}
                {activeNow && (
                    <span className='text-xs text-gray-200'>Active Now</span>
                )}
            </div>
        </div>
    )
}
