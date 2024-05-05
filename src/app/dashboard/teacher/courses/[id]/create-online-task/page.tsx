import { MainWrapper } from '@/components/online-exam/main-wrapper'

export default function Page({ params: { id } }: { params: { id: string } }) {
    return <MainWrapper courseId={id} />
}
