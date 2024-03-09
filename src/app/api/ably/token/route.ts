import { NextResponse } from 'next/server'
import * as Ably from 'ably/promises'
// import { z } from 'zod'
// import { isMongoId } from '@/lib/utils'
import { getServerAuthSession } from '@/server/auth'

// const clientIdSchema = z.string().min(1).refine(isMongoId, {
//     message: 'Invalid client ID',
// })

export async function POST(req: Request) {
    // const data = await req.json()
    const session = await getServerAuthSession()

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // const clientId = clientIdSchema.parse(data.clientId)
        const client = new Ably.Rest(process.env.ABLY_API_KEY!)
        const tokenRequestData = await client.auth.createTokenRequest({
            clientId: session.user.id,
        })
        return NextResponse.json(tokenRequestData)
    } catch (error) {
        // if (error instanceof z.ZodError) {
        //     return NextResponse.json(error.issues, { status: 400 })
        // }

        return NextResponse.json(error, { status: 500 })
    }
}
