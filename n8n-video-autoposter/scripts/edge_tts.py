#!/usr/bin/env python3
"""
Edge TTS - Free Microsoft text-to-speech wrapper.
Usage:
    python3 edge_tts.py --text "Bonjour" --voice "fr-FR-DeniseNeural" --output /tmp/out.mp3
"""
import argparse
import asyncio
import sys

try:
    import edge_tts
except ImportError:
    sys.stderr.write("edge-tts not installed. Run: pip install edge-tts\n")
    sys.exit(1)


async def synthesize(text: str, voice: str, output: str, rate: str, volume: str) -> None:
    communicate = edge_tts.Communicate(text=text, voice=voice, rate=rate, volume=volume)
    await communicate.save(output)


def main() -> int:
    parser = argparse.ArgumentParser(description="Edge TTS wrapper for n8n")
    parser.add_argument("--text", required=True)
    parser.add_argument("--voice", default="fr-FR-DeniseNeural")
    parser.add_argument("--output", required=True)
    parser.add_argument("--rate", default="+0%")
    parser.add_argument("--volume", default="+0%")
    args = parser.parse_args()

    asyncio.run(synthesize(args.text, args.voice, args.output, args.rate, args.volume))
    print(f"OK:{args.output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
