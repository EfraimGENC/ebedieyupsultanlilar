import { execSync } from "node:child_process";
import { readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const AUDIO_DIR = join(process.cwd(), "public", "person", "narrationAudio");

// Check if ffmpeg is available
function checkFfmpeg() {
  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
    console.log("✅ ffmpeg is available");
  } catch (error) {
    console.error("❌ ffmpeg is not installed or not available in PATH");
    console.error("Please install ffmpeg first:");
    console.error("  macOS: brew install ffmpeg");
    console.error("  Ubuntu: sudo apt install ffmpeg");
    console.error("  Windows: Download from https://ffmpeg.org/download.html");
    process.exit(1);
  }
}

// Get all MP3 files in the directory
function getMp3Files(directory: string): string[] {
  if (!existsSync(directory)) {
    console.error(`❌ Directory does not exist: ${directory}`);
    process.exit(1);
  }

  const files = readdirSync(directory);
  const mp3Files = files.filter((file) => {
    const filePath = join(directory, file);
    return (
      statSync(filePath).isFile() && extname(file).toLowerCase() === ".mp3"
    );
  });

  return mp3Files;
}

// Compress a single MP3 file
function compressAudio(inputPath: string, outputPath: string): void {
  console.log(`🔄 Compressing: ${inputPath}`);

  try {
    // ffmpeg command: mono, 44.1kHz sample rate, 64k bitrate
    const command = `ffmpeg -i "${inputPath}" -ac 1 -ar 44100 -b:a 64k "${outputPath}" -y`;

    execSync(command, {
      stdio: "pipe",
      cwd: process.cwd(),
    });

    console.log(`✅ Compressed: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Failed to compress ${inputPath}:`, error);
    throw error;
  }
}

// Get file size in KB
function getFileSize(filePath: string): number {
  const stats = statSync(filePath);
  return Math.round(stats.size / 1024);
}

// Main execution
async function main() {
  console.log("🎵 Audio Compression Tool");
  console.log("========================");

  // Check if ffmpeg is available
  checkFfmpeg();

  // Get all MP3 files
  const mp3Files = getMp3Files(AUDIO_DIR);

  if (mp3Files.length === 0) {
    console.log("No MP3 files found in", AUDIO_DIR);
    return;
  }

  console.log(`Found ${mp3Files.length} MP3 files to compress:`);
  mp3Files.forEach((file) => console.log(`  - ${file}`));
  console.log();

  let successCount = 0;
  let totalOriginalSize = 0;
  let totalCompressedSize = 0;

  // Process each file
  for (const file of mp3Files) {
    const inputPath = join(AUDIO_DIR, file);
    const tempOutputPath = join(AUDIO_DIR, `temp_${file}`);

    try {
      // Get original file size
      const originalSize = getFileSize(inputPath);
      totalOriginalSize += originalSize;

      // Compress to temporary file
      compressAudio(inputPath, tempOutputPath);

      // Get compressed file size
      const compressedSize = getFileSize(tempOutputPath);
      totalCompressedSize += compressedSize;

      // Replace original with compressed version
      execSync(`mv "${tempOutputPath}" "${inputPath}"`);

      const reduction = Math.round(
        ((originalSize - compressedSize) / originalSize) * 100
      );
      console.log(
        `  📊 ${file}: ${originalSize}KB → ${compressedSize}KB (${reduction}% reduction)`
      );

      successCount++;
    } catch (error) {
      console.error(`❌ Failed to compress ${file}`);

      // Clean up temp file if it exists
      try {
        execSync(`rm -f "${tempOutputPath}"`);
      } catch {}
    }
  }

  console.log();
  console.log("📈 Compression Summary:");
  console.log(
    `  ✅ Successfully compressed: ${successCount}/${mp3Files.length} files`
  );

  if (totalOriginalSize > 0) {
    const totalReduction = Math.round(
      ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100
    );
    console.log(
      `  📊 Total size: ${totalOriginalSize}KB → ${totalCompressedSize}KB (${totalReduction}% reduction)`
    );
  }

  if (successCount === mp3Files.length) {
    console.log("🎉 All audio files compressed successfully!");
  } else {
    console.log(
      `⚠️  ${mp3Files.length - successCount} files failed to compress`
    );
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
