import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, intensity } = body;

    console.log('Received request:', { intensity, imageLength: image?.length });

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Strip data URL prefix if present (e.g., "data:image/jpeg;base64,/9j/4AAQ...")
    let base64Image = image;
    if (image.includes(',')) {
      base64Image = image.split(',')[1];
    }

    console.log('Calling moondream...');
    
    // Step 1: Vision analysis with moondream
    const visionResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'moondream',
        prompt: 'Describe this room in detail. List specific objects visible, clutter level, aesthetic choices, and any questionable design decisions.',
        images: [base64Image],
        stream: false
      })
    });

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error('Moondream error:', errorText);
      throw new Error(`Vision model failed: ${errorText}`);
    }

    const visionData = await visionResponse.json();
    const roomDescription = visionData.response;
    console.log('Room description:', roomDescription.substring(0, 100) + '...');

    // Step 2: Roast generation
    const prompts = {
      gentle: `You are a witty, friendly interior design critic. Give a funny but kind 2-3 sentence roast of this room. End with one compliment.\n\nRoom: "${roomDescription}"`,
      medium: `You are a savage-but-fair design comedian. Roast this room with sharp wit in 3-4 sentences. Be specific.\n\nRoom: "${roomDescription}"`,
      savage: `You are brutally honest with zero filter. Tear apart this room in 4-5 sentences of pure comedic ruthlessness.\n\nRoom: "${roomDescription}"`
    };

    console.log('Calling qwen2.5:3b with intensity:', intensity);
    
    const roastResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:3b',
        prompt: prompts[intensity as keyof typeof prompts] || prompts.medium,
        stream: false,
        options: {
          temperature: intensity === 'savage' ? 0.9 : 0.7,
          num_predict: 150
        }
      })
    });

    if (!roastResponse.ok) {
      const errorText = await roastResponse.text();
      console.error('Qwen error:', errorText);
      throw new Error(`Text model failed: ${errorText}`);
    }

    const roastData = await roastResponse.json();
    const roastText = roastData.response.trim();

    // Generate scores
    const scores = [
      { label: 'Chaos Level', value: intensity === 'savage' ? 9 : intensity === 'medium' ? 6 : 4 },
      { label: 'Vibe Check', value: intensity === 'savage' ? 2 : intensity === 'medium' ? 5 : 7 },
      { label: 'Survival Odds', value: intensity === 'savage' ? 1 : intensity === 'medium' ? 4 : 6 }
    ];

    console.log('Success! Roast generated.');
    return NextResponse.json({ roast: roastText, scores });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: String(error)
    }, { status: 500 });
  }
}
