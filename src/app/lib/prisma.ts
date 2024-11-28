import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

const TrackSchema = z.object({
    id: z.string(),
    url: z.string(),
    title: z.string(),
    artists: z.array(z.string()),
    tags: z.array(z.string()),
    fileSize: z.number().optional(),
    data: z.instanceof(Buffer),
})

export type Track = z.infer<typeof TrackSchema>

export class PlayerDB {
    async addTrack(track: Track) {
        const validatedTrack = TrackSchema.parse(track)
        return await prisma.track.create({
            data: {
                ...validatedTrack,
                tags: JSON.stringify(validatedTrack.tags),
                artists: JSON.stringify(validatedTrack.artists),
                data: validatedTrack.data
            }
        })
    }

    async getTracks() {
        const tracks = await prisma.track.findMany()
        return tracks.map(track => ({
            ...track,
            artists: JSON.parse(track.artists) as string[],
            tags: JSON.parse(track.tags) as string[]
        }))
    }

    async getTrackById(id: string) {
        const track = await prisma.track.findUnique({
            where: { id }
        })
        if (!track) return null
        return {
            ...track,
            tags: JSON.parse(track.tags) as string[]
        }
    }

    async deleteTrack(id: string) {
        await prisma.track.delete({
            where: { id }
        })
    }

    async dropDatabase() {
        await prisma.track.deleteMany()
    }
}

export const playerDB = new PlayerDB()

// Initialize database - this runs the Prisma migrations
export async function initializeDatabase() {
    try {
        await prisma.$connect()
        console.log('Database initialized successfully')
    } catch (error) {
        console.error('Failed to initialize database:', error)
        throw error
    }
}