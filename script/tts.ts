import OpenAI from "openai";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const openai = new OpenAI();

const response = await openai.audio.speech.create({
  model: "gpt-4o-mini-tts",
  voice: "ash",
  input:
    "Gönenli Mehmed Efendi (Mehmet Öğütçü), Cumhuriyet dönemi Türkiye'sinin en önemli manevi şahsiyetlerinden biri olarak kabul edilir. Balıkesir'in Gönen ilçesinde dünyaya gelen ve ömrünü Kur'an hizmetine adayan Gönenli Hoca, Reisü'l-Kurra (en büyük Kur'an okuyucusu) unvanını da taşımıştır. Özellikle 1940-1980 yılları arasında, Kur'an eğitiminin kısıtlı olduğu zorlu dönemlerde yüzlerce hafız yetiştirmiş, Kur'an kurslarının açılmasına öncülük etmiştir. Sultanahmet Camii'nde uzun yıllar sürdürdüğü imamlık ve vaizlik görevleri sırasında, sade ve samimi üslubuyla binlerce insanın gönlüne dokunmuş, onlara manevi bir rehber olmuştur.\nOnu değerli kılan, sadece derin ilmi değil, aynı zamanda Kur'an talebelerine ve fakirlere olan şefkati, fedakârlığı ve cömertliğidir. Kendisine ait bir cebi olmadığı, kazancının tamamını talebeleri ve ihtiyaç sahipleri için harcadığı bilinir. Bu yönüyle bir ilim adamı olmanın ötesinde, yaşayan bir ahlak abidesi ve bir gönül insanı olarak hafızalara kazınmıştır. İstanbul'un manevi dokusunda derin izler bırakan Gönenli Mehmed Efendi, vefatının ardından dahi dualarla anılmaya devam etmektedir. Türbesi, İstanbul'un Eyüpsultan ilçesinde yer almakta ve pek çok kişi tarafından ziyaret edilmektedir.",
  instructions: `
You are a serene, respectful, and knowledgeable tour guide, speaking with a voice that reflects both the spiritual depth of Islamic tradition and the historical grandeur of the Ottoman era.

Your narration style should feel like guiding visitors through sacred places — calm, dignified, and inspiring.

Rules:
- Tone & Delivery:
  • Calm, steady, warm voice.
  • Slight emphasis on names of scholars, saints, or Ottoman figures.
  • Reverent tone when quoting prayers, verses, or hadiths.
- Pacing:
  • Slightly slower than normal.
  • Short, thoughtful pauses after important sentences.
- Emphasis:
  • Highlight names
  • Emphasize places or eras with a brief pause.
- Emotion:
  • Sincere and humble, without exaggeration.
  • Balance warmth and reverence.
- Style:
  • Not casual or overly modern.
  • Blend informative narration with subtle poetic flow.
  • End sentences with a soft downward cadence.

Role:
“You are guiding visitors through the sacred resting places of scholars, poets, and leaders in Eyüpsultan. Your voice carries both the weight of history and the tranquility of faith — inspiring respect, reflection, and serenity in every listener.”
  `,
  response_format: "mp3",
});

// Convert response to buffer and save to file
const buffer = Buffer.from(await response.arrayBuffer());
const filename = "mehmet-akif-ersoy-en.mp3"; // You can customize this filename
const outputPath = join(
  process.cwd(),
  "public",
  "person",
  "narrationAudio",
  filename
);

writeFileSync(outputPath, buffer);
console.log(`Audio file saved to: ${outputPath}`);
