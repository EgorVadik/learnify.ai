import { NextResponse } from 'next/server'
import * as Ably from 'ably'
import { getServerAuthSession } from '@/server/auth'

export async function POST(req: Request) {
    const session = await getServerAuthSession()

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const client = new Ably.Rest(process.env.ABLY_API_KEY!)
        const tokenRequestData = await client.auth.createTokenRequest({
            clientId: session.user.id,
        })

        return NextResponse.json(tokenRequestData)
    } catch (error) {
        return NextResponse.json(error, { status: 500 })
    }
}
