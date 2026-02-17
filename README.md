# Roast My Room 🔥

A Next.js 14 application that uses local AI (Ollama) to roast your room photos. No cloud APIs, no costs - runs entirely on your GPU.

## Features

🔥 **Local AI Only**: Uses Ollama with moondream (vision) and qwen2.5:3b (text) models  
🎨 **Beautiful UI**: Dark theme with fire animations, flicker effects, and smooth transitions  
📱 **Drag & Drop**: Easy image upload with preview  
🌶️ **Intensity Levels**: Gentle 😏, Medium 🔥, or Savage 💀 roasts  
📊 **Score System**: Chaos Level, Vibe Check, and Survival Odds  
⚡ **Typewriter Effect**: Roast text animates character by character  

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Ollama (Local LLM Server)
- moondream (Vision Model)
- qwen2.5:3b (Text Model)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Ollama

Download and install Ollama from [ollama.com](https://ollama.com/)

### 3. Pull Required Models

```bash
ollama pull moondream
ollama pull qwen2.5:3b
```

### 4. Start the Application

```bash
npm run dev
```

### 5. Open in Browser

Navigate to `http://localhost:3000`

## How It Works

1. **Upload**: Drop or click to upload a room photo
2. **Describe**: moondream analyzes the image and describes the room
3. **Roast**: qwen2.5:3b generates a roast based on your intensity selection
4. **Score**: The system generates three humorous scores based on the content

## Intensity Levels

- **Gentle 😏**: Friendly, kind roasts with genuine compliments
- **Medium 🔥**: Sharp wit with specific design critiques  
- **Savage 💀**: Brutally honest with maximum comedic ruthlessness

## Local Mode Benefits

✅ **Privacy**: Your photos never leave your computer  
✅ **Cost**: No API fees - runs on your hardware  
✅ **Offline**: Works without internet connection  
✅ **Speed**: Optimized for local GPU processing  

## Troubleshooting

### Ollama Not Running
If you see "Ollama Offline" in the header:
1. Make sure Ollama is installed and running
2. Start the required models: `ollama run moondream && ollama run qwen2.5:3b`

### Models Not Found
If you get model errors:
1. Pull the models: `ollama pull moondream && ollama pull qwen2.5:3b`
2. Verify they're available: `ollama list`

### Image Processing
- Images are automatically resized to 512px width for faster processing
- Maximum file size: 10MB
- Supported formats: JPG, PNG, WebP

## Development

The project uses Next.js 14 App Router with TypeScript. Key files:

- `app/page.tsx` - Main UI component
- `app/api/roast/route.ts` - Ollama integration API
- `app/globals.css` - All animations and styling
- `app/layout.tsx` - Global layout and fonts

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Made with 🔥 · Powered by Local AI