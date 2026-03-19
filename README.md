# TTS on Demand

A Homey app for sending text-to-speech messages to Google Cast devices (Chromecast, Nest speakers, etc.) using Google Translate's TTS engine.

## Features

- Send spoken messages to any Google Cast device on your network
- 18 supported languages (English, Swedish, German, French, Spanish, Dutch, Italian, Portuguese, Danish, Norwegian, Finnish, Polish, Japanese, Korean, Chinese, Russian, Arabic, Hindi)
- Adjustable volume control (0–100%)
- Slow speech speed option
- Dashboard widget for quick access
- Flow action card for automation

## How It Works

1. Discovers Google Cast devices on the local network via mDNS-SD
2. Converts text to speech using the Google Translate TTS API
3. Streams the audio to the selected Cast device via the Cast V2 protocol

## Installation

Will be published to Homey app store in the future!

```bash
npm install
homey app install
```

## Usage

### Dashboard Widget

The TTS widget lets you select a device, choose a language, type a message, set the volume, and send — all from the Homey dashboard.

### Flow Action

Use the **"Say something on a Google Cast device"** action card in your Homey flows with the following parameters:

| Parameter | Description |
|-----------|-------------|
| Device | The target Google Cast device |
| Text | The message to speak |
| Language | One of 18 supported languages |
| Volume | 0–100% |
| Slow | Enable slower speech speed |

## Dependencies

- [castv2-client](https://www.npmjs.com/package/castv2-client) — Google Cast V2 protocol
- [google-tts-api](https://www.npmjs.com/package/google-tts-api) — Google Translate TTS

## Requirements

- Homey >= 12.3.0 (SDK 3)
- Google Cast compatible device(s) on the same network
