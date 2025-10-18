#!/usr/bin/env tsx
/**
 * LLMs.txt Generator
 * 
 * Bu script, her kişi için ayrı bir llms.txt dosyası oluşturur.
 * Build aşamasında çalıştırılır ve .output/public/person/[slug]/llms.txt dosyaları oluşturur.
 */

import { promises as fs } from 'fs';
import { join, dirname, basename } from 'path';
import matter from 'gray-matter';

interface PersonFrontmatter {
  title: string;
  description?: string;
  birth?: {
    year?: number;
    place?: string;
  };
  death?: {
    year?: number;
    place?: string;
  };
  category?: string;
  tags?: string[];
  narrationAudio?: string;
  featured?: boolean;
  draft?: boolean;
}

interface LLMContent {
  slug: string;
  title: string;
  description: string;
  birth: string;
  death: string;
  category: string;
  tags: string[];
  content: string;
  narrationAudio?: string;
  locale: string;
}

const SUPPORTED_LOCALES = ['tr', 'en', 'fr'];
const LOCALE_NAMES: Record<string, string> = {
  tr: 'Türkçe',
  en: 'English',
  fr: 'Français',
};

// Her dil için route path'leri
const LOCALE_ROUTES: Record<string, string> = {
  tr: 'kisi',
  en: 'person',
  fr: 'personne',
};

const CONTENT_DIR = join(process.cwd(), 'content');
const OUTPUT_DIR = join(process.cwd(), '.output', 'public');

/**
 * Markdown içeriğini temizler ve LLM için uygun hale getirir
 */
function cleanMarkdownForLLM(content: string): string {
  return content
    // MDC özel syntaxlarını kaldır
    .replace(/::[\w-]+(?:\{[^}]*\})?/g, '')
    .replace(/:::/g, '')
    // Fazla boşlukları ve satır sonlarını temizle
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Frontmatter ve içerik okur
 */
async function readPersonFile(locale: string, filename: string): Promise<LLMContent | null> {
  const filePath = join(CONTENT_DIR, locale, 'person', filename);
  
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const frontmatter = data as PersonFrontmatter;

    // Draft içerikleri atla
    if (frontmatter.draft) {
      return null;
    }

    const slug = basename(filename, '.md');

    return {
      slug,
      title: frontmatter.title || slug,
      description: frontmatter.description || '',
      birth: frontmatter.birth
        ? `${frontmatter.birth.year || '?'}${frontmatter.birth.place ? `, ${frontmatter.birth.place}` : ''}`
        : 'Bilinmiyor',
      death: frontmatter.death
        ? `${frontmatter.death.year || '?'}${frontmatter.death.place ? `, ${frontmatter.death.place}` : ''}`
        : 'Bilinmiyor',
      category: frontmatter.category || 'Genel',
      tags: frontmatter.tags || [],
      content: cleanMarkdownForLLM(content),
      narrationAudio: frontmatter.narrationAudio,
      locale,
    };
  } catch (error) {
    // Dosya yoksa sessizce geç (bu normaldir, her kişi her dilde olmayabilir)
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error(`❌ Dosya okunamadı: ${filePath}`, error);
    }
    return null;
  }
}

/**
 * LLM içeriğini formatlar
 */
function formatLLMContent(data: LLMContent, allLocales: Map<string, LLMContent>): string {
  const lines: string[] = [];

  // Başlık
  lines.push(`# ${data.title}`);
  lines.push('');

  // Kısa açıklama
  if (data.description) {
    lines.push(`> ${data.description}`);
    lines.push('');
  }

  // Temel bilgiler
  lines.push('## Temel Bilgiler');
  lines.push('');
  lines.push(`- **Doğum**: ${data.birth}`);
  lines.push(`- **Vefat**: ${data.death}`);
  lines.push(`- **Kategori**: ${data.category}`);
  
  if (data.tags.length > 0) {
    lines.push(`- **Etiketler**: ${data.tags.join(', ')}`);
  }
  
  if (data.narrationAudio) {
    lines.push(`- **Sesli Anlatım**: ${data.narrationAudio}`);
  }
  
  lines.push('');

  // Dil alternatifleri
  if (allLocales.size > 1) {
    lines.push('## Diğer Dillerde');
    lines.push('');
    
    for (const [locale, localeData] of allLocales.entries()) {
      if (locale !== data.locale) {
        const localeName = LOCALE_NAMES[locale] || locale;
        const routePath = LOCALE_ROUTES[locale];
        const prefix = locale === 'tr' ? '' : `/${locale}`;
        lines.push(`- **${localeName}**: ${prefix}/${routePath}/${localeData.slug}/llms.txt`);
      }
    }
    
    lines.push('');
  }

  // Ana içerik
  lines.push('## Biyografi');
  lines.push('');
  lines.push(data.content);
  lines.push('');

  // Footer
  lines.push('---');
  lines.push('');
  lines.push('Bu dosya, büyük dil modelleri (LLM\'ler) için hazırlanmış bir dokümantasyon dosyasıdır.');
  lines.push(`Kaynak: Ebedi Eyüpsultanlılar - ${data.title}`);
  lines.push('Lisans: CC BY-NC-SA 4.0');

  return lines.join('\n');
}

/**
 * Bir slug için tüm dillerdeki içeriği okur
 */
async function getPersonInAllLocales(slug: string): Promise<Map<string, LLMContent>> {
  const allLocales = new Map<string, LLMContent>();

  for (const locale of SUPPORTED_LOCALES) {
    const data = await readPersonFile(locale, `${slug}.md`);
    if (data) {
      allLocales.set(locale, data);
    }
  }

  return allLocales;
}

/**
 * Bir kişi için tüm dillerde llms.txt dosyası oluşturur
 */
async function generateLLMFilesForPerson(slug: string): Promise<void> {
  const allLocales = await getPersonInAllLocales(slug);

  if (allLocales.size === 0) {
    console.log(`⚠️  ${slug} için hiçbir dilde içerik bulunamadı`);
    return;
  }

  for (const [locale, data] of allLocales.entries()) {
    const routePath = LOCALE_ROUTES[locale];
    const localePrefix = locale === 'tr' ? '' : `/${locale}`;
    
    // Output directory: tr için kisi/, en için en/person/, fr için fr/personne/
    let outputDir: string;
    if (locale === 'tr') {
      outputDir = join(OUTPUT_DIR, routePath, data.slug);
    } else {
      outputDir = join(OUTPUT_DIR, locale, routePath, data.slug);
    }
    
    const outputPath = join(outputDir, 'llms.txt');

    // Dizini oluştur
    await fs.mkdir(outputDir, { recursive: true });

    // LLM içeriğini oluştur
    const llmContent = formatLLMContent(data, allLocales);

    // Dosyayı yaz
    await fs.writeFile(outputPath, llmContent, 'utf-8');

    console.log(`✅ ${localePrefix}/${routePath}/${slug}/llms.txt oluşturuldu`);
  }
}

/**
 * Tüm kişiler için llms.txt dosyalarını oluşturur
 */
async function generateAllLLMFiles(): Promise<void> {
  console.log('🚀 LLM dosyaları oluşturuluyor...\n');

  // Türkçe content dizininden tüm kişileri al (referans dil)
  const personDir = join(CONTENT_DIR, 'tr', 'person');
  let files: string[];

  try {
    files = await fs.readdir(personDir);
  } catch (error) {
    console.error('❌ Content dizini okunamadı:', error);
    process.exit(1);
  }

  // .md uzantılı dosyaları filtrele
  const mdFiles = files.filter((f) => f.endsWith('.md'));

  if (mdFiles.length === 0) {
    console.log('⚠️  Hiç markdown dosyası bulunamadı');
    return;
  }

  console.log(`📝 ${mdFiles.length} kişi için LLM dosyaları oluşturuluyor...\n`);

  // Her dosya için llms.txt oluştur
  let successCount = 0;
  let errorCount = 0;

  for (const file of mdFiles) {
    const slug = basename(file, '.md');
    
    try {
      await generateLLMFilesForPerson(slug);
      successCount++;
    } catch (error) {
      console.error(`❌ ${slug} için hata:`, error);
      errorCount++;
    }
  }

  // Özet
  console.log('\n' + '='.repeat(50));
  console.log(`✨ Toplam: ${mdFiles.length} kişi`);
  console.log(`✅ Başarılı: ${successCount}`);
  if (errorCount > 0) {
    console.log(`❌ Hatalı: ${errorCount}`);
  }
  console.log('='.repeat(50));
}

// Script'i çalıştır
generateAllLLMFiles().catch((error) => {
  console.error('💥 Fatal hata:', error);
  process.exit(1);
});
