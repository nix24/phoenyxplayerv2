import { NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate YouTube URL
    if (!ytdl.validateURL(url)) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    // Get video info
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    const thumbnail = info.videoDetails.thumbnails[0]?.url;

    // Get audio stream
    const stream = ytdl(url, {
      quality: "highestaudio",
      filter: "audioonly",
    });

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    return NextResponse.json({
      title,
      thumbnail,
      audioData: Array.from(buffer),
    });
  } catch (error) {
    console.error("YouTube download error:", error);
    return NextResponse.json(
      { error: "Failed to process YouTube video" },
      { status: 500 }
    );
  }
}
