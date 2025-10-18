# Varsayılan görev
default:
    @just --list

# Geliştirme sunucusunu başlat
dev:
    @pnpm dev

# Projeyi derle
build:
    pnpm build

# Statik dosyaları oluştur
generate:
    @pnpm generate

# Derlenmiş projeyi önizle
preview:
    @pnpm preview

# Tüm bağımlılıkları temizle ve yeniden yükle
clean-install:
    @just clean
    @echo "🔄 Tüm bağımlılıkları yeniden yüklüyorum..."
    @pnpm install --force

# Kapsamlı temizlik (tüm cache'leri temizle)
clean:
    @echo "🧹 Kapsamlı temizlik başlıyor..."
    @echo "📁 .nuxt klasörünü siliyorum..."
    @rm -rf .nuxt
    @echo "📁 .output klasörünü siliyorum..."
    @rm -rf .output
    @echo "📁 node_modules/.cache klasörünü siliyorum..."
    @rm -rf node_modules/.cache
    @echo "📁 .data klasörünü siliyorum..."
    @rm -rf .data
    @echo "🔧 Nuxt cleanup çalıştırıyorum..."
    @npx nuxi cleanup
    @echo "✨ Temizlik tamamlandı!"

# Temizlik sonrası generate
clean-generate:
    @just clean
    @echo "🚀 Sıfırdan generate ediyorum..."
    @pnpm generate

# Lint kontrolü yap
lint:
    @pnpm run lint

# Lint hatalarını düzelt
lint-fix:
    @pnpm run lint:fix

# Kodu formatla
format:
    @pnpm run format

# Format kontrolü yap
format-check:
    @pnpm run format:check

# TypeScript tip kontrolü
type-check:
    @pnpm run type-check

# Testleri çalıştır
test:
    @pnpm run test

# Git değişikliklerini kontrol et
check:
    @just lint
    @just format-check
    @just type-check
    @just test 

# deploy: Push main + merge to prod
deploy:
    @git push origin main
    @just merge-to-prod

# merge-to-prod: main to production branch.
merge-to-prod:
    @git push origin main:prod

# v version: Version Uptade (patch: 1.0.0 → 1.0.1) Versions: major minor patch
v version:
    @pnpm version {{ version }} --no-commit-hooks
    @just deploy

# v-pre preid: Prerelease version (alpha: 1.0.0 → 1.0.1-alpha.0) preid: alpha, beta, rc
v-pre preid:
    @pnpm version prerelease --preid={{ preid }} --no-commit-hooks
    @just deploy

# version: Get the current version from package.json
version:
    @echo "Current version: v$(node -p 'require("./package.json").version')"

# generate-llms: Generate llms.txt files for all persons
generate-llms:
    @pnpm run generate-llms
