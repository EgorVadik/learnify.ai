import { Header } from '@/components/nav/header'
import { MainWrapper } from '@/components/online-exam/main-wrapper'

export default function Page({ params: { id } }: { params: { id: string } }) {
    return (
        <>
            <Header title='Online Task' />
            <MainWrapper courseId={id} />
        </>
    )
}
