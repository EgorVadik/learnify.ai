import { cn, getUsernameFallback } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

type UserAvatarProps = {
    name: string
    image: string | null
    wrapperClassName?: string
    imageClassName?: string
    nameClassName?: string
}

export const UserAvatar = ({
    name,
    image,
    imageClassName,
    nameClassName,
    wrapperClassName,
}: UserAvatarProps) => {
    return (
        <div className={cn('flex items-center gap-4', wrapperClassName)}>
            <Avatar className={imageClassName}>
                <AvatarFallback>{getUsernameFallback(name)}</AvatarFallback>
                <AvatarImage src={image ?? undefined} alt={name} />
            </Avatar>

            <div className={nameClassName}>{name}</div>
        </div>
    )
}
