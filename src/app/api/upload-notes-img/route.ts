import { backendClient } from '@/lib/edgestore-server'
import { getServerAuthSession } from '@/server/auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export async function POST(req: Request) {
    const session = await getServerAuthSession()
    if (!session) {
        return NextResponse.json(
            { error: 'You must be logged in to upload images.' },
            { status: 401 },
        )
    }

    const formData = await req.formData()
    const image = formData.get('image') as File

    try {
        const parsedImage = z.instanceof(File).parse(image)

        if (parsedImage.size > 1024 * 1024 * 1) {
            return NextResponse.json(
                { error: 'Image is too large max size is 1MB' },
                { status: 413 },
            )
        }

        if (!['image/jpeg', 'image/png'].includes(parsedImage.type)) {
            return NextResponse.json(
                { error: 'Invalid image type' },
                { status: 400 },
            )
        }

        const res = await backendClient.notes.upload({
            content: {
                blob: parsedImage,
                extension: parsedImage.name.split('.').pop() ?? 'png',
            },
        })

        return NextResponse.json({ url: res.url })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid image provided' },
                { status: 400 },
            )
        }

        return NextResponse.json(
            {
                error: 'An error occurred while uploading the image. Please try again later.',
            },
            { status: 500 },
        )
    }
}
