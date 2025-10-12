"use server";

export async function generateSpeech(text: string): Promise<Buffer> {
  const resp = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.7, // giữ giọng ổn định, ít thay đổi bất ngờ
          similarity_boost: 0.8, // giống với giọng gốc (nếu clone voice), rõ ràng hơn
          style: 0.2, // một chút nhấn nhá tự nhiên
          speaking_rate: 0.9, // chậm lại 10% để dễ nghe (1.0 = mặc định)
          pitch: 1.0, // giữ nguyên cao độ (có thể hạ thấp 0.95 cho dễ nghe)
        },
      }),
    }
  );

  if (!resp.ok) {
    throw new Error("Failed to generate speech");
  }

  const audioBuffer = await resp.arrayBuffer();
  return Buffer.from(audioBuffer);
}
