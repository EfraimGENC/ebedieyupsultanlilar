import "dotenv/config";
import OpenAI from "openai";
import { writeFileSync, readFileSync, unlinkSync } from "node:fs";
import { join, basename } from "node:path";
import matter from "gray-matter";
import ffmpeg from "fluent-ffmpeg";

// Get command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: pnpm run tts <content-file-path>");
  console.error("Example: pnpm run tts content/tr/person/ibni-kemal.md");
  process.exit(1);
}

const contentFilePath = args[0];
const openai = new OpenAI();

// Language-specific templates
const templates = {
  tr: {
    birth: "Doğum",
    death: "Ölüm",
    about: "Hakkında",
  },
  en: {
    birth: "Birth",
    death: "Death",
    about: "About",
  },
  fr: {
    birth: "Naissance",
    death: "Décès",
    about: "À propos",
  },
};

// Parse content file
function parseContentFile(filePath: string) {
  const fullPath = join(process.cwd(), filePath);
  const fileContent = readFileSync(fullPath, "utf-8");
  const { data: frontmatter, content } = matter(fileContent);

  // Extract language from file path (e.g., content/tr/person/ibni-kemal.md -> tr)
  const pathParts = filePath.split("/");
  const language = pathParts[1] as keyof typeof templates;

  // Extract slug from filename
  const slug = basename(filePath, ".md");

  return { frontmatter, content, language, slug, fullPath };
}

// Update markdown file with narrationAudio field
function updateMarkdownWithAudio(filePath: string, audioPath: string) {
  console.log(`Attempting to update ${filePath} with audio path: ${audioPath}`);

  const fileContent = readFileSync(filePath, "utf-8");
  const { data: frontmatter, content } = matter(fileContent);

  // Add or update narrationAudio field
  frontmatter.narrationAudio = audioPath;

  // Reconstruct the file content
  const updatedContent = matter.stringify(content, frontmatter);

  writeFileSync(filePath, updatedContent);
  console.log(
    `✅ Successfully updated markdown file with audio path: ${audioPath}`
  );
}

// Compress audio file to 64 kbps, 44.1 kHz, mono MP3
function compressAudio(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(
      `🎵 Compressing audio: ${basename(inputPath)} -> 64 kbps, 44.1 kHz, mono`
    );

    ffmpeg(inputPath)
      .audioChannels(1) // mono
      .audioFrequency(44100) // 44.1 kHz
      .audioBitrate("64k") // 64 kbps
      .format("mp3")
      .on("end", () => {
        console.log(`✅ Audio compression completed: ${basename(outputPath)}`);
        resolve();
      })
      .on("error", (err) => {
        console.error(`❌ Audio compression failed:`, err.message);
        reject(err);
      })
      .save(outputPath);
  });
}

// Check if ffmpeg is available
async function checkFFmpeg(): Promise<boolean> {
  return new Promise((resolve) => {
    ffmpeg.getAvailableFormats((err) => {
      if (err) {
        console.warn(
          `⚠️  ffmpeg not found. Audio compression will be skipped.`
        );
        console.warn(`   Install ffmpeg with: brew install ffmpeg`);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

// Generate input text based on template
function generateInputText(
  frontmatter: any,
  content: string,
  language: keyof typeof templates
) {
  const template = templates[language];

  let inputText = `${frontmatter.title}: ${frontmatter.category}; ${frontmatter.description}\n`;

  // Add birth information
  if (frontmatter.birth) {
    const birth = frontmatter.birth;
    inputText += `${template.birth}: `;
    if (birth.day) inputText += `${birth.day} `;
    if (birth.month) inputText += `${birth.month} `;
    if (birth.year) inputText += `${birth.year} `;
    if (birth.place) inputText += `${birth.place}`;
    inputText += `\n`;
  }

  // Add death information
  if (frontmatter.death) {
    const death = frontmatter.death;
    inputText += `${template.death}: `;
    if (death.day) inputText += `${death.day} `;
    if (death.month) inputText += `${death.month} `;
    if (death.year) inputText += `${death.year} `;
    if (death.place) inputText += `${death.place}`;
    inputText += `\n`;
  }

  // Add about section
  inputText += `${template.about}:\n${content.trim()}`;

  return inputText;
}

// Main execution
async function main() {
  try {
    const { frontmatter, content, language, slug, fullPath } =
      parseContentFile(contentFilePath);

    const inputText = generateInputText(frontmatter, content, language);
    const filename = `${slug}-${language}.mp3`;
    const audioPath = `/person/narrationAudio/${filename}`;

    console.log("Generating TTS for:", filename);
    console.log("Input text preview:", inputText.substring(0, 200) + "...");

    // Check if ffmpeg is available
    const hasFFmpeg = await checkFFmpeg();

    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "ash",
      input: inputText,
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
"You are guiding visitors through the sacred resting places of scholars, poets, and leaders in Eyüpsultan. Your voice carries both the weight of history and the tranquility of faith — inspiring respect, reflection, and serenity in every listener."
      `,
      response_format: "mp3",
    });

    // Convert response to buffer and save to file
    const buffer = Buffer.from(await response.arrayBuffer());

    if (hasFFmpeg) {
      // Use compression workflow
      const tempFilename = `${slug}-${language}-temp.mp3`;
      const finalFilename = `${slug}-${language}.mp3`;

      const tempOutputPath = join(
        process.cwd(),
        "public",
        "person",
        "narrationAudio",
        tempFilename
      );

      const finalOutputPath = join(
        process.cwd(),
        "public",
        "person",
        "narrationAudio",
        finalFilename
      );

      // Save the raw TTS file temporarily
      writeFileSync(tempOutputPath, buffer);
      console.log(`📁 Raw audio file saved to: ${tempOutputPath}`);

      // Compress the audio file
      await compressAudio(tempOutputPath, finalOutputPath);

      // Clean up temporary file
      unlinkSync(tempOutputPath);
      console.log(`🗑️  Temporary file cleaned up: ${tempOutputPath}`);

      console.log(`🎉 Final compressed audio file ready: ${finalOutputPath}`);
    } else {
      // Save without compression
      const finalOutputPath = join(
        process.cwd(),
        "public",
        "person",
        "narrationAudio",
        filename
      );

      writeFileSync(finalOutputPath, buffer);
      console.log(`📁 Audio file saved (uncompressed): ${finalOutputPath}`);
      console.log(
        `ℹ️  To enable compression, install ffmpeg: brew install ffmpeg`
      );
    }

    // Update the markdown file with narrationAudio field
    updateMarkdownWithAudio(fullPath, audioPath);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
