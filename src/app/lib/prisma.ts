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
    bpm: z.number().optional(),
})

const PlaylistSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    tracks: z.array(z.object({
        id: z.string(),
        trackId: z.string(),
        playlistId: z.string(),
        order: z.number(),
        addedAt: z.date(),
    })),
})

export type Track = z.infer<typeof TrackSchema>
export type Playlist = z.infer<typeof PlaylistSchema>

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
async function initializeDatabase() {
    try {
        await prisma.$connect()
    } catch (error) {
        console.error('Failed to connect to database:', error)
    }
}

initializeDatabase()