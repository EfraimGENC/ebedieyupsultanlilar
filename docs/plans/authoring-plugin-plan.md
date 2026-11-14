# Ebedî Eyüpsultanlılar — Yazarlık & Editörlük Sistemi Planı

> **Sürüm:** 2.0 (v1'in yeniden tasarımı) · **Tarih:** 2026-11-14 · **Durum:** Onay bekliyor
>
> Bu plan agent team'lere subtask olarak dağıtılmak üzere yazıldı. Her görev tek
> bir agent'a verilebilecek büyüklükte; işi, bitmiş sayılma ölçütü (DoD) ve işi
> yapandan **farklı** bir agent'ın ya da deterministik bir komutun yürüteceği
> kontrol adımıyla tanımlı.

## 0. v1'den ne değişti

| Konu | v1 | v2 |
|---|---|---|
| Metni kim üretir | Claude yazar, Gemini araştırır, Codex denetler (sabit) | **Rol bazlı, değiştirilebilir model.** Araştırma, yazım, editörlük, çeviri rollerinin her biri için sağlayıcı ve model seçilir; istek başına değiştirilebilir |
| Claude'un işi | Yazar + orkestratör | **Yalnızca akış ve orkestrasyon.** Claude düzyazı üretmez |
| Çağrı biçimi | Yalnız CLI, anlık | Üç taşıma: **CLI**, **anlık API**, **batch API** (≈%50 indirim, ≤24 saat) |
| Yazım kuralları nerede | `.claude/skills/person-write` (Claude'a özel) | **Sağlayıcıdan bağımsız rol paketleri** (`editorial/roles/`); her model aynı paketi kullanır |
| `eyyub`'un rolü | Deterministik araçlar, LLM çağrısı yok | Deterministik araçlar **+ model geçidi** (karar vermeyen taşıma katmanı) |
| Süreklilik | Yok | **İş defteri** (job ledger): batch ve çok oturumlu işler kaldığı yerden sürer |

Değişmeyen kararlar: skill'ler repo içinde yaşar; görsel politikası katmanlıdır
(sahabe ve âlimler için portre yok, her AI görseli insan onaylı); Gemini ve
OpenAI erişimi birlikte kullanılır.

---

## 1. Mevcut durum (repo taramasından)

| Tespit | Değer |
|---|---|
| TR kişi içeriği | 123 dosya (`content/tr/person/`) |
| EN / FR çeviri | Her dilde 2 dosya (dil başına ~121 eksik) |
| Kapak görseli olan | 4 dosya |
| `## Kaynaklar` bölümü olmayan | 6 dosya |
| Muhtemel mükerrer | `-2` sonekli 4 dosya (ebussuud-efendi, ibni-kemal, mehmet-akif-ersoy, gonenli-mehmed-efendi) |
| Frontmatter tutarsızlığı | 1 dosyada tırnaksız `category` |
| Kategoriler | Sanatçılar 31, Âlimler ve Mutasavvıflar 29, Devlet Adamları 23, Şair ve Yazarlar 20, Sahabe 7, Hanedan ve Saray Mensupları 6, Bilim ve Düşünce İnsanları 4, Halk Büyükleri 3 |
| Mevcut araçlar | `script/tts.ts` (OpenAI TTS), `eyyub/` (typer + langchain iskeleti, içi boş), `content.config.ts` (Zod şeması) |

Şema (`personSchema`): `title`, `description` (50–150 karakter), `birth` / `death`
(kısmi tarih: `year`/`month`/`day`, `place`, `circa`; ay yılı, gün ay ve yılı
gerektirir), `category`, `tags[]`, `cover?`, `narrationAudio?`, `featured`, `draft`.

---

## 2. Tasarım ilkeleri

1. **Rol sabittir, model değişkendir.** Sistem "yazar", "editör" gibi rolleri
   tanır; rolü hangi modelin oynadığı bir yapılandırma satırıdır.
2. **Claude orkestratördür.** Akışı yürütür, modeli seçer, deterministik
   kontrolleri koşturur, çıktıları dosyaya işletir, insana eskale eder, commit
   atar. Düzyazı yazmaz; sağlayıcıya ulaşılamazsa iş bekler ve raporlanır.
3. **Tek doğruluk kaynağı.** Yazım kuralları tek yerde durur; CLI, anlık API ve
   batch aynı derlenmiş prompt'u alır. Hiçbir kural bir sağlayıcıya özel
   dosyada çoğaltılmaz.
4. **Model serbest metin değil, şemalı veri döndürür.** Her rolün bir çıktı
   şeması vardır. Markdown dosyasını model değil `eyyub apply` yazar; bozuk
   YAML ve şema ihlali yapısal olarak engellenir.
5. **Yazan denetleyemez.** Editör rolü, yazarla aynı sağlayıcıdan olamaz.
6. **Kaynaksız olgu yok.** Metindeki her olgu araştırma paketindeki kaynaklı
   bir iddiaya dayanır.
7. **Her adım kayıtlıdır.** Hangi model, hangi taşıma, hangi prompt sürümü,
   hangi batch: iş defterinde durur. Bu kayıt aynı zamanda "Türkçe'de hangi
   model daha iyi yazıyor" sorusunu veriyle cevaplar.

---

## 3. Mimari

### 3.1 Katmanlar

```
Kullanıcı ── "şu kişiyi ekle", "yazar ChatGPT olsun", "kalanları batch'le iyileştir"
   │
   ▼
Claude Code — ORKESTRASYON          (.claude/skills/)
   akış · model seçimi · kapılar · insan onayı · git
   │  yalnızca eyyub komutları çağırır
   ▼
eyyub — DETERMİNİSTİK ARAÇLAR + MODEL GEÇİDİ          (eyyub/)
   validate · inventory · apply · image · links · job
   prompt build · llm run · batch submit/collect
   │                       │                      │
   ▼                       ▼                      ▼
 CLI taşıması          Anlık API             Batch API
 gemini / codex        Gemini / OpenAI       Gemini / OpenAI
   │                       │                      │
   └────────── ROL PAKETLERİ (editorial/roles/) ──┘
     researcher · writer · editor · translator · image-scout · image-gen
     her biri: brief.md + output.schema.json + örnekler
```

### 3.2 Roller

| Rol | İş | Girdi | Çıktı (şemalı) | Web gerekir mi |
|---|---|---|---|---|
| `researcher` | Kaynak bulur, iddia–kaynak tablosu çıkarır | ad, tarih, kısa tanım, kaynak öncelik listesi | `research.json`: olgular, iddialar (kaynak + kademe), çelişkiler | Evet |
| `writer` | Özet ve detaylı biyografi yazar | araştırma paketi + stil rehberi + taksonomi | `draft.json`: frontmatter alanları, özet, gövde, kaynaklar | Hayır |
| `editor` | Stil, imla, olgu–kaynak eşleşmesi, hassasiyet denetimi | taslak + araştırma paketi + QA matrisi | `review.json`: bulgular, iddia başına destek kararı, puan, hüküm | Hayır |
| `translator` | EN/FR çeviri | onaylı TR içerik + terim sözlüğü | `draft.json` (hedef dil) | Hayır |
| `image-scout` | Gerçek görsel adayı ve lisans kanıtı bulur | kişi + görsel politikası katmanı | adaylar: URL, kaynak sayfa, lisans, gerekçe | Evet |
| `image-gen` | Politika izin veriyorsa sembolik görsel üretir | onaylı görsel brifi | görsel dosyası + kullanılan prompt | Hayır |

### 3.3 Model seçimi

Tek yapılandırma dosyası: `editorial/models.yml`. Model kimlikleri yalnızca
burada durur; skill ve rol paketlerinde model adı geçmez.

```yaml
aliases:                      # kimlikler F0-T2'de `eyyub llm models` çıktısından doldurulur
  gemini-pro:   { provider: gemini, model: "<…>" }
  gemini-flash: { provider: gemini, model: "<…>" }
  gpt:          { provider: openai, model: "<…>" }
  gpt-mini:     { provider: openai, model: "<…>" }

roles:                        # başlangıç varsayılanları; F3-T6 karşılaştırmasıyla kesinleşir
  researcher:  { model: gemini-pro, transport: cli }
  writer:      { model: gemini-pro, transport: api, mode: instant }
  editor:      { model: auto-opposite, transport: api, mode: instant }
  translator:  { model: gpt, transport: api, mode: batch }
  image-scout: { model: gemini-pro, transport: cli }
  image-gen:   { model: "<görsel modeli>", transport: api }

rules:
  editor_differs_from_writer_provider: true
  batch_threshold: 10         # bu sayıdan büyük toplu işlerde varsayılan mode: batch
```

**Öncelik sırası:** istek başına verilen seçim → iş dosyasındaki seçim →
`models.yml` varsayılanı. Model, takma adla (`gpt`) ya da ham biçimde
(`gemini:<model-kimliği>`) verilebilir; böylece yapılandırmaya eklenmemiş bir
Gemini modeli de tek seferlik denenebilir.

Kullanıcının Claude'a söyleyeceği örnekler ve karşılıkları:

| İstek | Claude'un yaptığı |
|---|---|
| "Ali Kuşçu'yu ekle (1403–1474, astronom)" | Varsayılan modellerle tam akış |
| "Yazarı ChatGPT yap" | `--writer gpt`; editör otomatik olarak Gemini'ye döner |
| "Bunu gemini-flash ile yeniden yazdır" | Yalnız yazım adımını `--writer gemini-flash` ile tekrarlar |
| "Hem Gemini hem GPT yazsın, karşılaştır" | `--compare gemini-pro,gpt`: iki taslak, karşı sağlayıcının kör puanı, seçim kullanıcıda |
| "Kaynaksız içerikleri batch ile iyileştir" | Kampanya: batch gönderir, defteri commit'ler, sonuçlar gelince sürdürür |
| "Varsayılan çevirmen gemini-pro olsun" | `models.yml` içinde tek satır değişir |

### 3.4 Taşımalar

| Taşıma | Kimlik doğrulama | Maliyet | Web araması | Süre | Uygun olduğu yer |
|---|---|---|---|---|---|
| `cli` (`gemini -p`, `codex exec`) | Abonelik oturumu ya da API anahtarı | Abonelik kotası | Var; ajan çok adımlı arar ve sayfa okur | Anlık | Araştırma, görsel arama, tek seferlik denemeler |
| `api` (anlık) | API anahtarı | Token başına | Sağlayıcının arama aracı varsa | Anlık | Tek kişilik yazım, editörlük, çeviri |
| `batch` | API anahtarı | Anlık API'nin yaklaşık yarısı | **Varsayılan: yok** (aşağıya bakın) | ≤24 saat, çoğunlukla daha kısa | 10+ içerikli yazım, editörlük, çeviri, görsel üretim kampanyaları |

Batch için iki kısıt tasarımı belirliyor:

- **Batch, abonelikle değil API anahtarıyla çalışır.** ChatGPT ya da Google
  aboneliği batch'i kapsamaz; ayrı API faturalaması gerekir.
- **Batch içinde web araması varsayılmaz.** OpenAI tarafında batch isteklerinde
  web aramasının reddedildiği raporlanıyor; Gemini tarafı bu plan yazılırken
  doğrulanamadı (F0-T2 doğrulayacak). Bu yüzden akış şöyle kurulur: **araştırma
  anlık ve ajanik yapılır, araştırma paketi dosyaya yazılır; yazım, editörlük
  ve çeviri bu paketi girdi alarak batch'e gider.** Yazar zaten araştırma
  paketi dışına çıkamadığı için bu ayrım kaliteyi düşürmez.

### 3.5 Diğer modeller "writer skill"ini nasıl kullanır

Kısa cevap: kullanır; ama skill keşfine güvenilerek değil, **derlenmiş prompt**
ile.

"Writer skill" aslında bir **rol paketidir**: `editorial/roles/writer/` altında
brif, çıktı şeması ve örnekler. `eyyub prompt build --role writer --slug <slug>`
komutu bu paketi stil rehberi, taksonomi ve o kişinin araştırma paketiyle
birleştirip tek bir prompt dosyası üretir. Bu dosya hangi yoldan gönderilirse
gönderilsin aynıdır:

```
eyyub prompt build ──► prompt.md ─┬─► gemini -m <model> -p        (CLI)
                                  ├─► codex exec -m <model>       (CLI)
                                  ├─► Gemini / OpenAI anlık API
                                  └─► batch JSONL satırı
```

İkinci yol olarak **yerel skill sarmalayıcıları** da kurulur. Agent Skills açık
bir standart: Gemini CLI, Codex CLI ve Antigravity CLI proje içindeki
`.agents/skills/<ad>/SKILL.md` dosyalarını keşfediyor. Bu dizine, rol paketine
yönlendiren ince sarmalayıcılar konur; böylece doğrudan Gemini CLI'da ya da
Codex'te çalışırken aynı yazar kuralları adıyla çağrılabilir.

Otomatik akışın yerel skill keşfine dayanmamasının üç nedeni var: batch ve
anlık API'de skill mekanizması yoktur; CLI'da skill'in devreye girmesi modelin
kararına bağlıdır ve Gemini CLI'da onay ister; derlenmiş prompt ise sürümlenir,
özetlenir (hash) ve test edilebilir.

| Dizin | Kimin için | İçerik |
|---|---|---|
| `.claude/skills/` | Claude Code | Orkestrasyon akışları |
| `editorial/roles/` | Her model, her taşıma | Rol paketleri (tek doğruluk kaynağı) |
| `.agents/skills/` | Gemini CLI, Codex, Antigravity'yi doğrudan kullanan insan | Rol paketlerine yönlendiren sarmalayıcılar |

### 3.6 İş defteri ve durum makinesi

Batch 24 saate kadar sürebildiği ve bulut oturumları geçici olduğu için her
kişinin durumu repoda tutulur:

```
editorial/work/<slug>/
  job.yml                 durum, adım geçmişi, model/taşıma/prompt hash, batch kimliği, token kullanımı
  research.json           araştırma paketi (kalıcı: içeriğin kaynak kanıtı)
  draft.<model>.json      taslak(lar)
  review.<model>.json     editör raporu
```

Durumlar: `queued → researched → drafted → reviewed → revising → imaged →
awaiting-approval → published`. Geçişleri yalnızca `eyyub job` yapar; bir adım
çıktısı şemadan geçmeden durum ilerlemez. Yeni bir oturum `eyyub job list` ile
nerede kalındığını görür.

### 3.7 Tek kişi akışı (anlık)

| # | Adım | Kim | Kapı |
|---|---|---|---|
| 1 | Kayıt: girdiyi al, mükerrer ara, `job init` | Claude + eyyub | Aynı kişi varsa dur, kullanıcıya sor |
| 2 | Araştırma | `researcher` (CLI, web) | Paket şemaya uygun; kaynak URL'leri canlı; en az bir kademe 1–2 kaynak |
| 3 | Yazım | `writer` (seçilen model) | `eyyub apply` + `validate`; tarihler araştırma paketiyle birebir aynı |
| 4 | Denetim | `editor` (karşı sağlayıcı) | Hüküm: geçti / revize / insan onayı |
| 5 | Revizyon | `writer`, bulgularla; en çok 2 tur | 2 turda geçmezse insana eskale |
| 6 | Görsel | `image-scout` → `eyyub image fetch`; gerekirse `image-gen` | Lisans kanıtı; Katman A ve her AI görseli insan onayı |
| 7 | Kapanış: `validate`, `links check`, derleme, commit, PR | Claude + eyyub | Hepsi yeşil; `draft: false` yalnız insan onayıyla |

Batch kampanyasında aynı adımlar toplu yürür: araştırma anlık ve sınırlı
paralellikle, 3–5. adımlar batch turlarıyla. Her tur sonunda defter commit'lenir.

### 3.8 Hedef dosya ağacı

```
editorial/
  models.yml                      rol → model yönlendirmesi
  capabilities.md                 CLI/API yeteneklerinin doğrulanmış kaydı (F0-T2)
  policies/                       style-guide · source-priority · image-policy · taxonomy · glossary · qa-matrix
  roles/<rol>/                    brief.md · output.schema.json · examples/
  work/<slug>/                    iş defteri ve ara çıktılar
  batches/<batch-id>.yml          gönderilen batch'lerin kaydı
.claude/skills/                   person-new · person-improve · person-review · person-image
                                  person-translate · campaign · editorial-status
.agents/skills/                   diğer CLI'lar için sarmalayıcılar
CLAUDE.md · AGENTS.md             proje hafızası (ortak çekirdek AGENTS.md'de)
eyyub/                            deterministik araçlar + model geçidi
tests/fixtures/content/           Zod ve eyyub'un ortak doğrulama örnekleri
```

---

## 4. Görevler

Görev kimliği `F<faz>-T<no>`. "Önkoşul" yazmayan görevler fazı içinde paralel
yürür. İnsan kararı gereken görevler **[İNSAN]** ile işaretli.

### Faz 0 — Temel: ortam, yetenek doğrulama, politikalar

**F0-T1 · Proje hafızası (`AGENTS.md`, `CLAUDE.md`)**
- İş: `AGENTS.md`'ye ortak çekirdek (şema özeti, dizin yapısı, komutlar, commit
  kuralı: Conventional Commits, İngilizce). `CLAUDE.md` bunu içe aktarır ve
  orkestrasyon kurallarını ekler: Claude düzyazı yazmaz, model yalnız
  `models.yml` üzerinden seçilir, durum yalnız `eyyub job` ile ilerler.
- DoD: İki dosya toplam 200 satırı geçmez; içindeki her komut çalışır.
- Kontrol: Başka bir agent her komutu çalıştırır; hata veren komut görevi iade ettirir.

**F0-T2 · Yetenek doğrulaması (spike)**
- İş: Gerçek makinede `gemini`, `codex` ve iki API'yi dene; sonuçları
  `editorial/capabilities.md`'ye yaz. Doğrulanacaklar: kurulu sürümler;
  etkileşimsiz çağrı ve model seçme bayrakları; stdin'den prompt; JSON çıktı;
  etkileşimsiz modda web araması; araçları kısıtlama (yalnız arama ve sayfa
  okuma, kabuk ve dosya yazma kapalı); kullanılabilir model listesi; **Gemini
  batch'te Google Search grounding çalışıyor mu**; **OpenAI batch'te web
  araması ve görsel üretimi çalışıyor mu**; batch dosya ve istek sınırları;
  şemalı çıktının üç taşımada da zorlanabildiği.
- DoD: Her madde "çalışıyor / çalışmıyor / koşullu" olarak, denenen komut ve
  gözlenen çıktıyla kayıtlı. `models.yml` takma adları gerçek kimliklerle dolu.
- Kontrol: Başka bir agent kayıttaki 5 komutu rastgele seçip yeniden çalıştırır.
- Not: Bu görevin sonucu F2 tasarım ayrıntılarını belirler; F2 bundan önce başlamaz.

**F0-T3 · Ortam kurulumu (yerel ve bulut)**
- İş: `.env.example` (`GEMINI_API_KEY`, `OPENAI_API_KEY`; gerçek anahtar asla
  commit'lenmez), yerel kurulum adımları, bulut oturumu için kurulum betiği
  (CLI'ların kurulumu, `uv sync`), bulut ortamında tanımlanacak sırlar ve ağ
  izin listesine eklenecek sağlayıcı host'ları (en az
  `generativelanguage.googleapis.com` ve `api.openai.com`).
- DoD: Temiz bir makinede belgedeki adımlarla `eyyub llm models` iki
  sağlayıcıyı da listeler.
- Kontrol: Adımlar sıfırdan bir ortamda başka bir agent tarafından uygulanır.

**F0-T4 · Stil rehberi (`policies/style-guide.md`) [İNSAN]**
- İş: Ton, yapı (açılış özeti + `##` başlıklı detay bölümleri + `## Kaynaklar`),
  uzunluk hedefleri, imla (şapkalı harfler, dönem terimleri, unvanlar), dinî
  figürlerde saygı ifadeleri, yasaklar (uydurma alıntı, kaynaksız tarih,
  menkıbenin tarihî olgu gibi verilmesi). İyi ve kötü örnek çiftleri. Kullanıcının
  vereceği sistem prompt'u bu dosyanın çekirdeğidir.
- DoD: Bir model bu dosyayı okuyarak mevcut bir içeriği gerekçeli puanlayabilir.
- Kontrol: İki farklı sağlayıcıya aynı içerik puanlatılır; gerekçeler rehbere
  atıf yapamıyorsa rehber belirsizdir, revize edilir. Sonra kullanıcı onayı.

**F0-T5 · Kaynak öncelik listesi (`policies/source-priority.md`) [İNSAN]**
- İş: Kademeli liste. Öneri: (1) TDV İslâm Ansiklopedisi, akademik yayınlar,
  arşivler; (2) belediye ve sempozyum yayınları, kurumsal ansiklopediler;
  (3) saygın basın arşivi, müze ve vakıf siteleri; (4) yalnız çapraz kontrol:
  Wikipedia ve bloglar (tek kaynak olamaz, `## Kaynaklar`a yazılmaz). Çelişki
  kuralı, Hicrî–Milâdî çevrimde `circa`, alıntı biçimi.
- DoD: Bir kaynağın kademesi dosyadan tartışmasız okunur.
- Kontrol: Kullanıcı onayı; kullanıcının öncelikli kaynakları burada listelenir.

**F0-T6 · Görsel politikası (`policies/image-policy.md`) [İNSAN]**
- İş: Katman A (sahabe, âlim, mutasavvıf: portre ve tasvir yok; türbe, hat,
  kitabe, mekân), Katman B (fotoğraf öncesi diğer kişiler: kamu malı dönem
  eseri, yoksa A kuralları), Katman C (fotoğraf çağı: gerçek arşiv fotoğrafı
  öncelikli, yoksa portre olmayan sembolik AI görseli). Lisans kanıtı kuralı
  (içerik lisansı CC BY-NC-SA ile uyum), atıf biçimi, dosya adı ve teknik ölçüler.
- DoD: Her kategori için karar ağacı; "temsilî görsel" ibaresi kuralı.
- Kontrol: Kullanıcı onayı.

**F0-T7 · Taksonomi ve terim sözlüğü (`policies/taxonomy.md`, `glossary.md`)**
- İş: 8 kategorinin birebir yazımı ve atama kuralları; etiket kuralları (3–6
  etiket, var olanı yeniden kullanma). Sözlük: Şeyhülislâm, Mihmandâr-ı Nebî
  gibi terimlerin EN/FR karşılığı ya da açıklamalı bırakılma kuralı.
- DoD: Yeni içerikte kategori ve etiket seçimi belirsizlik bırakmaz.
- Kontrol: Mevcut 123 içerik kurallarla çapraz kontrol edilir; çelişkiler raporlanır.

### Faz 1 — `eyyub`: deterministik çekirdek

**F1-T1 · CLI iskeleti ve `validate`**
- İş: `eyyub validate [yol|--all] [--json]`. `content.config.ts` kurallarının
  Pydantic karşılığı. Kayma önlemi: `tests/fixtures/content/{valid,invalid}/`
  altındaki ortak örnekler hem Zod (vitest) hem eyyub (pytest) tarafından
  doğrulanır; iki taraf aynı hükmü vermezse CI kırılır.
- DoD: 123 dosyada çalışır, tırnaksız kategoriyi yakalar, her kural için en az
  bir olumsuz örnek var, ruff temiz.
- Kontrol: Ortak örnek testi; kasıtlı bozulmuş 5 dosya.

**F1-T2 · `inventory`** (önkoşul: F1-T1)
- İş: Dil kapsamı, kapak, ses, kaynak bölümü, gövde uzunluğu, kategori ve
  etiket dağılımı, mükerrer adayları. `--json` ve `--report`.
- DoD: Bölüm 1'deki tabloyu komut kendisi üretir.
- Kontrol: Sayılar bu plandaki elle sayımlarla karşılaştırılır.

**F1-T3 · `image fetch` / `image check`** (önkoşul: F1-T1)
- İş: URL'den indir, EXIF temizle, en düşük çözünürlüğü doğrula, web için
  optimize edip `public/person/<slug>.jpg` olarak yaz. `check`: bağlanmamış ya
  da dosyası eksik kapakları raporla.
- DoD: Tek komutla siteye hazır görsel; mevcut 4 kapak doğru raporlanır.
- Kontrol: Büyük, küçük ve bozuk görsel örnekleriyle test.

**F1-T4 · `links check`** (önkoşul: F1-T1)
- İş: Dış bağlantıların durumunu sınırlı eşzamanlılıkla denetle; `--json`.
- DoD: 123 dosya tek komutla taranır.
- Kontrol: Bilinen canlı ve ölü adreslerle test.

**F1-T5 · `apply` ve `extract`** (önkoşul: F1-T1)
- İş: `apply`: şemalı taslağı (`draft.json`) kurallı markdown dosyasına çevirir
  (frontmatter sırası, tırnaklama, `## Kaynaklar` biçimi). `extract`: mevcut
  markdown'ı aynı yapıya geri çevirir (iyileştirme ve çeviri akışlarının girdisi).
- DoD: `extract → apply` gidiş dönüşü mevcut 123 dosyada anlamsal fark üretmez.
- Kontrol: Gidiş dönüş testi CI'da; `apply` çıktısı her zaman `validate`'ten geçer.

**F1-T6 · İş defteri (`job`)** (önkoşul: F1-T1)
- İş: `job init / status / list / advance`; Bölüm 3.6'daki durum makinesi.
  Geçersiz geçiş reddedilir; her geçiş model, taşıma, prompt hash ve zaman
  damgasıyla kaydedilir.
- DoD: Yarıda kesilen bir akış yeni oturumda `job list` ile bulunup sürdürülür.
- Kontrol: Durum makinesi için tablo güdümlü test; geçersiz geçiş senaryoları.

### Faz 2 — Model geçidi (önkoşul: F0-T2, F1-T1)

**F2-T1 · `models.yml` ve çözümleyici**
- İş: Dosya şeması, `eyyub llm resolve --role <rol> [--model <takma ad|sağlayıcı:kimlik>]`,
  `eyyub llm models` (sağlayıcılardan canlı liste). Öncelik sırası ve
  "editör yazarla aynı sağlayıcıdan olamaz" kuralı burada uygulanır.
- DoD: Bölüm 3.3'teki altı örnek isteğin her biri doğru modele çözülür.
- Kontrol: Çözümleme için tablo güdümlü test; kural ihlali açık hata verir.

**F2-T2 · `prompt build`**
- İş: Rol paketi + ilgili politikalar + kişi girdisini tek prompt'a derler;
  içerik özetini (hash) döndürür. Hangi rolün hangi politikayı aldığı rol
  paketinde bildirilir.
- DoD: Aynı girdi her zaman bayt düzeyinde aynı prompt'u üretir.
- Kontrol: Anlık görüntü (snapshot) testleri.

**F2-T3 · Anlık taşımalar: `llm run`** (önkoşul: F2-T1, F2-T2)
- İş: `eyyub llm run --role R --slug S [--model M] [--transport cli|api]`.
  Dört bağdaştırıcı: Gemini CLI, Codex CLI, Gemini API, OpenAI API (resmî
  SDK'lar; langchain bağımlılığı kaldırılır). Çıktı rol şemasına göre
  doğrulanır; uymazsa hata mesajıyla en çok 2 kez yeniden istenir. CLI
  bağdaştırıcıları ajanı salt okunur ve kısıtlı araçlarla çalıştırır. Kullanım
  ve kaynak bilgisi deftere yazılır.
- DoD: Aynı rol dört bağdaştırıcıdan da şemaya uygun çıktı döndürür.
- Kontrol: Bağdaştırıcılar için sahte sağlayıcıyla birim testleri; gerçek
  sağlayıcılarla birer duman testi; CLI ajanının dosya yazamadığının doğrulanması.

**F2-T4 · Batch taşıması** (önkoşul: F2-T3)
- İş: `eyyub batch submit --role R (--slugs … | --state …) [--model M]`,
  `status`, `collect`, `cancel`. Gönderim `editorial/batches/` altına kaydedilir.
  `collect` sonuçları şemayla doğrular, geçenleri deftere işler, kalanları
  yeniden deneme listesine alır. Kısmi başarı normal durumdur.
- DoD: 5 kişilik gerçek bir batch iki sağlayıcıda da gönderilip toplanır;
  toplama, gönderimi yapan oturumdan farklı bir oturumda çalışır.
- Kontrol: Sahte sağlayıcıyla kısmi hata, süre aşımı ve yinelenen toplama testleri.

**F2-T5 · Kullanım ve kalite istatistikleri** (önkoşul: F2-T3)
- İş: `eyyub stats`: model başına token kullanımı, taşıma dağılımı, yazar
  modeline göre editör puanı ve revizyon turu sayısı.
- DoD: Rapor yalnız defter verisinden üretilir.
- Kontrol: Sabit bir defter örneğiyle beklenen rapor karşılaştırması.

### Faz 3 — Rol paketleri (önkoşul: F0 politikaları, F2-T2)

Her paket: `brief.md`, `output.schema.json`, en az 2 örnek girdi–çıktı.
Ortak DoD: paket iki sağlayıcıda da şemaya uygun çıktı üretir.
Ortak kontrol: aşağıdaki pakete özel senaryo, paketi yazmayan bir agent tarafından.

| Görev | Paket | Pakete özel kontrol |
|---|---|---|
| F3-T1 | `researcher` (+ araştırma paketi şeması: olgular, iddia–kaynak–kademe, çelişkiler) | Çıktıdaki 5 rastgele iddia için kaynak sayfası açılıp iddiayı desteklediği doğrulanır; kaynaksız iddia şemada temsil edilemez |
| F3-T2 | `writer` | Araştırma paketinde olmayan bir olgu eklenmiş taslağı editör yakalar; tarihler pakette ne ise odur |
| F3-T3 | `editor` (bulgular, iddia başına destek kararı, puan, hüküm) | Yanlış tarih + kaynaksız iddia + stil ihlali ekilmiş taslakta üçü de bulunur |
| F3-T4 | `translator` | 3 cümlelik geri çeviri örneklemesinde anlam kayması yok; `description` sınırı hedef dilde korunur |
| F3-T5 | `image-scout`, `image-gen` | Lisans kanıtı olmayan aday önerilmez; Katman A kişisi için portre brifi üretilemez |

**F3-T6 · Model karşılaştırması (bake-off) [İNSAN]** (önkoşul: F3-T1..T4, F2-T3)
- İş: Farklı kategorilerden 5 kişi için aynı araştırma paketiyle her aday model
  birer taslak yazar; taslaklar karşı sağlayıcının editörü tarafından kör
  puanlanır; sonuç tablosu ve taslaklar kullanıcıya sunulur. Aynı çalışma
  araştırma ve çeviri rolleri için de yapılır.
- DoD: Rol başına puan tablosu; kullanıcı kararıyla `models.yml` varsayılanları güncel.
- Kontrol: Kullanıcı değerlendirmesi. Puan tablosu `eyyub stats` çıktısıyla tutarlı.

### Faz 4 — Claude orkestrasyon skill'leri (önkoşul: F1, F2-T3, F3)

Ortak kural: skill'ler düzyazı üretmez, model kimliği içermez, yalnız `eyyub`
komutlarını çağırır ve her adımda durumu kullanıcıya bildirir.

| Görev | Skill | İş | Kontrol |
|---|---|---|---|
| F4-T1 | `person-new` | Bölüm 3.7 akışı; `--writer`, `--researcher`, `--editor`, `--compare`, `--mode` seçenekleri | Sitede olmayan bir kişiyle uçtan uca koşu; yazar değiştirilerek tekrar |
| F4-T2 | `person-improve` | `extract` → eksikleri araştır → yeniden yaz → denetle. Mevcut doğru bilgi silinmez; her değişiklik gerekçeli | Kaynaksız 6 dosyadan birinde pilot; fark insan tarafından incelenir |
| F4-T3 | `person-review` | Bağımsız denetim: deterministik kontroller + editör rolü; tek rapor | Hata ekilmiş içerikte tüm hatalar raporda |
| F4-T4 | `person-image` | Katmanı belirle → aday bul → lisans doğrula → indir ya da üret → onaya sun | Bir Katman A ve bir Katman C pilotu |
| F4-T5 | `person-translate` | Yalnız denetimden geçmiş TR içerik çevrilir; çeviri de denetlenir | 1 EN + 1 FR pilot, mevcut çevirilerle üslup tutarlılığı |
| F4-T6 | `campaign` | Toplu iş: hedef kümeyi seç, anlık adımları sınırlı paralellikle yürüt, batch gönder, defteri commit'le, sonraki oturumda topla ve sürdür; 10'luk PR'lar | 5 kişilik kampanya iki ayrı oturumda tamamlanır |
| F4-T7 | `editorial-status` | `inventory`, `job list`, `links check`, `stats` çıktılarından durum raporu; sayılar yalnız komut çıktısından | Rapor sayıları JSON çıktılarıyla birebir |
| F4-T8 | `.agents/skills/` sarmalayıcıları | Rol paketlerine yönlendiren `SKILL.md` dosyaları | Gemini CLI ve Codex'te skill listelenir ve adıyla çağrılır |

### Faz 5 — Pilot ve kampanyalar

**F5-T1 · Bilinen sorunların temizliği** (önkoşul: F1-T1)
- a. Tırnaksız `category` düzeltilir. b. `-2` sonekli 4 dosya incelenir;
  mükerrerse birleştirme önerisi hazırlanır **[İNSAN]** (slug silmek adresi
  kırar; yönlendirme ihtiyacı not edilir). c. Kaynaksız 6 dosya F4-T2 ile iyileştirilir.
- Kontrol: `validate --all` temiz; her kalem ayrı commit.

**F5-T2 · Pilot kapısı [İNSAN]** (önkoşul: F4-T1..T5, F3-T6)
- İş: 2 yeni kişi + 2 iyileştirme + 1 çeviri + 2 görsel, anlık modda.
- DoD: Kullanıcı çıktıları onaylar; istenen düzeltmeler politikalara ve rol
  paketlerine işlenir.
- **Bu kapı geçilmeden hiçbir kampanya başlamaz.**

| Görev | Kampanya | Kapsam ve sıra | Kontrol |
|---|---|---|---|
| F5-T3 | İyileştirme (batch) | Kısa gövde, kaynaksız ve kapaksız kesişimi önce | Parti başına denetim + %20 insan örneklemi |
| F5-T4 | Görsel | ~119 kapaksız içerik; fotoğraf çağı kişileri önce, Katman A tamamı insan onaylı | `image check` + onay kaydı |
| F5-T5 | Çeviri (batch) | ~121 içerik × 2 dil; `featured` olanlar, sonra Sahabe, sonra kalanlar; dil başına ayrı PR | Parti başına 2 dosyada tam denetim + geri çeviri |
| F5-T6 | Dönemsel denetim | `editorial-status` raporunu haftalık üreten iş akışı (isteğe bağlı) | Rapor ile komut çıktıları birebir |

---

## 5. Kalite matrisi

Bir içerik `draft: false` olmadan önce tamamı sağlanır.

| # | Kontrol | Sorumlu |
|---|---|---|
| 1 | Frontmatter şemaya uygun | `eyyub validate` |
| 2 | `## Kaynaklar` var; en az 2 kaynak, en az biri kademe 1–2 | `eyyub` + araştırma paketi |
| 3 | Her olgusal iddianın araştırma paketinde kaynaklı karşılığı var | `editor` |
| 4 | Frontmatter tarih ve yerleri araştırma paketiyle birebir; belirsizlikte `circa` | `eyyub apply` (deterministik) |
| 5 | Stil rehberine uygunluk | `editor` (karşı sağlayıcı) |
| 6 | İmla, özel adlar, unvanlar | `editor` |
| 7 | Dinî ve kültürel hassasiyet | `editor` + Katman A'da insan |
| 8 | Görsel politikaya uygun, lisans kanıtlı, atıflı | `eyyub image check` + insan |
| 9 | Dış bağlantılar canlı | `eyyub links check` |
| 10 | Mükerrer değil | `eyyub inventory` |
| 11 | Çeviride anlam kayması yok, sözlüğe uygun | `editor` + geri çeviri |
| 12 | Site derlemesi kırılmıyor | CI ya da yerel `nuxt generate` |
| 13 | Yazar ve editör farklı sağlayıcıdan; ikisi de defterde kayıtlı | `eyyub job` |

İnsan onayı gerektiren durumlar: Katman A kişisine yeni görsel; her AI görseli;
mükerrer birleştirme ya da silme; çözülemeyen kaynak çelişkisi; kademe 1–2
kaynağı bulunamayan yeni içerik; 2 revizyon turunda geçemeyen taslak;
`draft: false` yapılması.

## 6. Riskler

| Risk | Önlem |
|---|---|
| Uydurma tarih ya da olay | Araştırma paketi dışı olgu yasağı; karşı sağlayıcı editörü; tarihlerin deterministik eşleşmesi |
| Web içeriğinden prompt enjeksiyonu | Araştırma ajanı salt okunur ve kısıtlı araçla çalışır; çıktısı yalnız şemalı veri olarak kabul edilir; repo'ya yalnız `eyyub` yazar |
| Batch'te web araması yok | Araştırma anlık yapılır; batch adımları hazır paketle çalışır |
| Batch sonucu beklerken oturumun kapanması | Defter ve batch kaydı commit'lenir; her oturum `job list` ile sürdürür |
| Model kimliklerinin eskimesi | Kimlikler yalnız `models.yml`'de; `eyyub llm models` ile doğrulanır |
| API anahtarı sızıntısı | Yalnız `.env` ve ortam sırları; `.gitignore` ve commit öncesi tarama |
| Beklenmeyen API maliyeti | Batch eşiği; `eyyub stats`; kampanya başlamadan tahmini istek sayısı kullanıcıya bildirilir |
| Zod ile eyyub doğrulamasının ayrışması | Ortak örnek seti iki tarafta da test edilir |
| Görsel telifi, dinî hassasiyet | Lisans kanıtı zorunlu; katmanlı politika; insan onayı |
| Adres kırılması | Slug değişmez; birleştirme yalnız insan kararıyla |
| Bir sağlayıcının erişilemez olması | İş bekler ve raporlanır; rol başka sağlayıcıya ancak kullanıcı isteğiyle kaydırılır; editör kuralı gevşetilmez |

## 7. Agent team dağıtımı

| Dalga | Görevler | Not |
|---|---|---|
| 1 | F0-T1..T7, F1-T1 | F0-T2 ve F0-T3 gerçek anahtarlar ve CLI'lar ister; F0-T4/T5/T6 kullanıcı onayıyla kapanır |
| 2 | F1-T2..T6, F2-T1, F2-T2, F5-T1a | Deterministik çekirdek ve geçidin temeli |
| 3 | F2-T3, F3-T1..T5 | Anlık taşımalar ve rol paketleri birlikte olgunlaşır |
| 4 | F2-T4, F2-T5, F3-T6, F4-T1..T5 | Batch, karşılaştırma, tekil skill'ler |
| 5 | F4-T6..T8, F5-T1b/c, F5-T2 | Kampanya skill'i ve pilot kapısı |
| 6 | F5-T3..T6 | Kampanyalar; yalnız pilot onayından sonra |

Her görevin teslim biçimi: görev kimliği, değişen dosyalar, koşulan kontroller
ve sonuçları, insan onayı bekleyen kalemler.

## 8. Açık kararlar

Agent'lar bloke olmasın diye her birinin varsayılanı var; kullanıcı değiştirebilir.

| # | Karar | Varsayılan |
|---|---|---|
| 1 | Rol başına varsayılan model | Araştırma ve yazım Gemini, editör karşı sağlayıcı, çeviri GPT; F3-T6 sonucuyla kesinleşir |
| 2 | Özet ve detaylı biyografi nerede durur | İkisi de gövdede: ilk `##` başlığından önceki paragraflar özet, sonrası detay. Şema değişmez |
| 3 | Kaynak ve görsel atfı için frontmatter alanı (`sources[]`, `coverCredit`) eklensin mi | Hayır; mevcut `## Kaynaklar` düzeni sürer. İstenirse ayrı bir site görevi olarak planlanır |
| 4 | `editorial/work/` repoya commit'lensin mi | Evet; yayın sonrası taslaklar silinir, araştırma paketi ve son editör raporu kanıt olarak kalır |
| 5 | Mevcut içeriklerdeki soru cümlesiyle biten kapanış üslubu | F0-T4'te kullanıcıya sorulur |
| 6 | Seslendirme (`pnpm tts`) akışa bağlansın mı | Hayır; yayın sonrası elle tetiklenir |
