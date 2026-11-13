# Ebedî Eyüpsultanlılar — Yazarlık & Editörlük Plugin Planı

> **Durum:** Onay bekliyor · **Sürüm:** 1.0 · **Tarih:** 2026-08-02
> **Amaç:** Bu plan, agent team'lere subtask olarak dağıtılmak üzere hazırlanmıştır.
> Her görev (task) kendi başına bir agent'a verilebilecek şekilde; girdi, çıktı,
> kabul kriteri (DoD) ve kontrol adımıyla tanımlanmıştır.

---

## 1. Amaç ve Kapsam

Eyüpsultan civarında medfun kişilerin biyografi sitesi için **tüm yazarlık ve
editöryal işleri** yürütecek bir Claude Code plugin/skill seti kurmak:

- Yeni kişi içeriği üretimi (araştırma → yazım → şema → görsel → kaynak)
- Mevcut 123 TR içeriğin iyileştirilmesi ve denetimi
- Görsel bulma, lisans kontrolü, indirme, optimizasyon; politika dahilinde üretim
- EN/FR çeviri hattı (şu an her dilde yalnızca 2 içerik var)
- Çapraz model doğrulama: **Claude yazar/orkestratör**, **Gemini CLI araştırmacı
  ve görsel motoru**, **Codex CLI bağımsız editör/fact-checker**

### Alınmış kararlar (kullanıcı onaylı)

| Karar | Sonuç |
|---|---|
| Plugin konumu | Repo içi `.claude/` (skills + agents + rules), repo ile versiyonlanır |
| `eyyub` CLI rolü | Deterministik araç katmanı: doğrulama, lint, görsel, link, envanter. LLM işi içermez |
| Görsel politikası | **Katmanlı:** Sahabe/âlimler için asla portre üretilmez (türbe, hat, mekân görseli); modern figürlerde gerçek arşiv fotoğrafı öncelikli, yoksa AI ile *portre olmayan* sembolik görsel; her görselde lisans kontrolü zorunlu |
| Harici modeller | Gemini CLI **ve** Codex CLI mevcut, ikisi de kullanılacak |

---

## 2. Mevcut Durum Envanteri (tespit edilenler)

Plan görevlerinin bir kısmı doğrudan bu tespitlerden türetilmiştir:

| Tespit | Sayı / Detay |
|---|---|
| TR kişi içeriği | 123 dosya (`content/tr/person/`) |
| EN / FR çevirisi | Her dilde yalnızca 2 dosya (~121 eksik/dil) |
| Kapak görseli (`cover`) olan | Yalnızca 4 dosya |
| `## Kaynaklar` bölümü olmayan | 6 dosya |
| Muhtemel mükerrer kayıt | `-2` sonekli 4 dosya (ebussuud-efendi-2, ibni-kemal-2, mehmet-akif-ersoy-2, gonenli-mehmed-efendi-2) |
| Frontmatter tutarsızlığı | 1 dosyada tırnaksız `category` değeri |
| Kategori taksonomisi | 8 kategori: Sanatçılar (30), Âlimler ve Mutasavvıflar (29), Devlet Adamları (23), Şair ve Yazarlar (20), Sahabe (7), Hanedan ve Saray Mensupları (6), Bilim ve Düşünce İnsanları (4), Halk Büyükleri (3) |
| Mevcut araçlar | `script/tts.ts` (OpenAI TTS), `eyyub/` Python CLI iskeleti (typer + langchain, içi boş), `content.config.ts` Zod şeması |

**Şema özeti** (`content.config.ts` → `personSchema`): `title`, `description`
(50–150 karakter!), `birth`/`death` (kısmi tarih: year/month/day + place +
circa; month→year, day→month+year zorunluluğu), `category`, `tags[]`, `cover?`,
`narrationAudio?`, `featured`, `draft`.

---

## 3. Mimari

### 3.1 Katmanlar ve model rolleri

```
┌────────────────────────────────────────────────────────┐
│  Claude Code (orkestratör + ana yazar)                 │
│  .claude/skills/* → iş akışları                        │
│  .claude/agents/* → uzman subagent tanımları           │
├────────────────────────────────────────────────────────┤
│  Gemini CLI (gemini -p "...")                          │
│  · Google Search grounding ile kaynak araştırma        │
│  · Görsel arama ve aday görsel keşfi                   │
│  · Imagen ile sembolik görsel üretimi (politika izinli)│
├────────────────────────────────────────────────────────┤
│  Codex CLI (codex exec "...")                          │
│  · Bağımsız ikinci model: fact-check, editoryal kritik │
│  · Yazarla aynı model olmadığı için körleme inceleme   │
│  · Alternatif görsel üretimi (gpt-image)               │
├────────────────────────────────────────────────────────┤
│  eyyub CLI (uv run eyyub ...) — DETERMİNİSTİK          │
│  · şema doğrulama, frontmatter lint, envanter          │
│  · görsel indirme + optimizasyon, link kontrolü        │
│  · LLM çağrısı YOK                                     │
└────────────────────────────────────────────────────────┘
```

**İlke:** LLM'in yapabileceği ama deterministik kodun daha güvenilir yaptığı
her iş (şema kontrolü, boyut/format, ölü link, envanter sayımı) `eyyub`'a;
muhakeme gerektiren her iş (yazım, kaynak değerlendirme, çeviri, kritik)
skill'lere gider. Her skill, çıktısını **her zaman** `eyyub validate` süzgecinden
geçirerek bitirir.

### 3.2 Hedef dosya ağacı

```
.claude/
  skills/
    person-new/SKILL.md          # yeni kişi uçtan uca
    person-research/SKILL.md     # kaynak araştırma (Gemini destekli)
    person-write/SKILL.md        # yazım/stil (yalnız yazım; araştırma girdisi ister)
    person-improve/SKILL.md      # mevcut içeriği iyileştirme
    person-review/SKILL.md       # editoryal + fact-check (Codex destekli)
    person-translate/SKILL.md    # EN/FR çeviri
    person-image/SKILL.md        # görsel bul/üret/indir/bağla
    person-audit/SKILL.md        # toplu denetim raporu
  agents/
    researcher.md                # araştırmacı subagent
    editor.md                    # editör/kritik subagent
    translator.md                # çevirmen subagent
  rules/                         # (skill'lerin ortak referansları)
    style-guide.md               # yazım stili + örnek metinler
    source-priority.md           # kaynak öncelik listesi (kullanıcı düzenler)
    image-policy.md              # katmanlı görsel politikası
    taxonomy.md                  # kategori + tag kuralları
CLAUDE.md                        # proje hafızası (şema, komutlar, politika özetleri)
eyyub/                           # deterministik CLI (genişletilecek)
docs/plans/authoring-plugin-plan.md   # bu plan
```

### 3.3 Harici CLI çağrı sözleşmeleri

Skill'ler harici CLI'ları **non-interactive** çağırır ve çıktıyı dosyaya alır:

- Gemini: `gemini -p "<prompt>" > out.md` (araştırma promptları kaynak URL'si
  istemeli; URL'siz iddia kabul edilmez)
- Codex: `codex exec "<görev>" ...` — review görevlerinde Codex'e **yalnızca
  içerik + kontrol listesi** verilir, Claude'un gerekçeleri verilmez (körleme
  inceleme).
- Her iki CLI için de kurulum/oturum yoksa skill bunu açıkça raporlar ve
  degrade mod (yalnız Claude web araması) ile devam eder — sessizce atlamaz.

---

## 4. Fazlar ve Görevler

> **Görev formatı:** `F<faz>-T<no>` · Bağımlılıklar belirtilmiştir; bağımlılığı
> olmayan görevler paralel dağıtılabilir. Her görevin **DoD** (Definition of
> Done) ve **Kontrol** adımı vardır. Kontrol adımı, görevi yapan agent'tan
> farklı bir agent'a (veya deterministik komuta) verilmelidir.

### Faz 0 — Temel: Politika ve Proje Hafızası

*Hepsi paralel yapılabilir; diğer tüm fazların ön koşuludur.*

#### F0-T1 · `CLAUDE.md` oluştur
- **Girdi:** `content.config.ts`, `justfile`, `package.json`, bu plan
- **İş:** Repo köküne proje hafızası: şema özeti (özellikle `description` 50–150
  karakter kuralı ve kısmi tarih kuralları), komutlar (`just dev`, `pnpm tts`,
  `uv run eyyub`), içerik dizin yapısı, dil politikası, commit konvansiyonu
  (Conventional Commits, İngilizce mesaj — mevcut `.github/copilot-instructions.md`
  ile tutarlı).
- **DoD:** 150 satırı geçmeyen, komutları çalıştırılabilir halde içeren CLAUDE.md.
- **Kontrol:** Farklı bir agent CLAUDE.md'deki her komutu çalıştırır; hata veren
  komut varsa görev iade edilir.

#### F0-T2 · `style-guide.md` yaz
- **Girdi:** Mevcut en iyi 5 içerik (örn. `ebu-eyyub-el-ensari.md`,
  `mehmet-akif-ersoy.md`) + kullanıcının stil tercihi
- **İş:** `.claude/rules/style-guide.md`: ton (edebi ama abartısız, saygılı,
  "değil midir?" tarzı okuyucuya dokunan kapanışlar mevcut içerikte var —
  korunacak mı kullanıcıya sorulacak), paragraf yapısı (kısa özet + detay
  bölümleri), uzunluk hedefleri (özet 1 paragraf; detaylı biyografi hedefi:
  3–6 paragraf, `##` başlıklarla), Türkçe imla kuralları (â/î şapkalı harfler,
  dönem terimleri), dini figürlerde saygı ifadeleri kuralı (Hz., tutarlı
  kullanım), **yapılmayacaklar** listesi (uydurma alıntı, kaynaksız tarih,
  menkıbe ile tarihi olayın ayrıştırılmadan verilmesi).
- **DoD:** İyi/kötü örnek çiftleri içeren, bir LLM'in doğrudan sistem promptu
  olarak kullanabileceği rehber.
- **Kontrol:** Rehber Codex CLI'a verilip mevcut bir içerik puanlatılır; rehber
  belirsizse (puanlama gerekçeleri rehbere atıf yapamıyorsa) revize edilir.

#### F0-T3 · `source-priority.md` yaz
- **İş:** `.claude/rules/source-priority.md` — kademeli kaynak listesi.
  Başlangıç önerisi (kullanıcı düzenleyecek, dosya başına "KULLANICI ONAYI
  GEREKLİ" notu konur):
  1. **Birincil:** TDV İslâm Ansiklopedisi (islamansiklopedisi.org.tr),
     akademik yayınlar (DergiPark, üniversite tezleri), Devlet Arşivleri
  2. **İkincil:** Eyüpsultan Belediyesi yayınları/sempozyum kitapları, İBB
     Atatürk Kitaplığı, kurumsal ansiklopediler, biyografi sözlükleri
  3. **Destekleyici:** Saygın basın arşivleri, müze/vakıf siteleri
  4. **Yalnızca çapraz kontrol:** Wikipedia, popüler bloglar (asla tek kaynak
     olamaz; `## Kaynaklar`a yazılmaz)
  Ayrıca: çelişen kaynak kuralı (üst kademe kazanır; çözülemiyorsa iki görüş de
  "kaynaklarda ihtilaf" notuyla verilir), tarih çevirisi kuralı (Hicrî↔Milâdî
  çevrimlerde `circa: true`).
- **DoD:** Kademe + çatışma çözüm kuralları + alıntılama formatı tanımlı dosya.
- **Kontrol:** Kullanıcı onayı (bu dosya kullanıcının "verdiğim kaynaklar"
  girdisinin resmî yeri olacak).

#### F0-T4 · `image-policy.md` yaz
- **İş:** Katmanlı politikanın yazılı hali:
  - **Katman A (Sahabe, din âlimleri, mutasavvıflar):** portre/tasvir asla —
    ne gerçek iddialı ne AI. Kullanılabilir: türbe/kabir fotoğrafı, hat/kitabe,
    mekân, dönem objesi. AI üretimi yalnızca mekân/obje/desen için ve
    "temsilî görsel" ibaresiyle.
  - **Katman B (fotoğraf çağı öncesi diğer figürler — devlet adamları, sanatçılar):**
    dönem minyatürü/gravürü/tablosu (kamu malı ise) → yoksa Katman A kuralları.
  - **Katman C (fotoğraf çağı figürleri):** gerçek arşiv fotoğrafı öncelikli;
    lisans uygunsa indirilir; bulunamazsa AI ile portre olmayan sembolik görsel.
  - **Her katman için:** lisans kontrol zorunluluğu (kamu malı / CC uyumlu;
    sitenin içerik lisansı CC BY-NC-SA ile uyumluluk), kaynak atıf formatı
    (`## Kaynaklar` altına `[Fotoğraf](url)` satırı — mevcut konvansiyon),
    dosya adı `public/person/<slug>.jpg`, hedef boyut/format kuralları.
- **DoD:** Her katman için karar ağacı + atıf formatı + teknik spesifikasyon.
- **Kontrol:** Kullanıcı onayı (dinî hassasiyet içerdiği için insan onayı şart).

#### F0-T5 · `taxonomy.md` yaz
- **İş:** 8 mevcut kategorinin tam listesi (birebir yazımıyla), hangi kişi
  tipinin hangi kategoriye gireceği kuralları, tag kuralları (küçük harf mi,
  özel isim istisnaları, 3–6 tag hedefi, mevcut tag'lerden yeniden kullanım
  önceliği — tag envanteri `eyyub inventory` çıktısından).
- **DoD:** Yeni içerikte kategori/tag seçimini belirsizliğe yer bırakmadan
  yönlendiren dosya.
- **Kontrol:** Mevcut 123 içeriğin kategorileri dosyadaki kurallarla çapraz
  kontrol edilir; kural-veri çelişkisi varsa raporlanır.

---

### Faz 1 — `eyyub` Deterministik Araç Katmanı

*F0'dan bağımsız başlayabilir. F1-T1 diğer F1 görevlerinin ön koşuludur.*

#### F1-T1 · CLI iskeleti ve `validate` komutu
- **İş:** Typer app'i gerçek komut yapısına kavuştur. İlk komut:
  `eyyub validate [path|--all]` — frontmatter'ı `content.config.ts`'deki
  kurallarla birebir doğrular (Python tarafında aynı kurallar: description
  50–150, kısmi tarih zorunlulukları, kategori taksonomiden, tırnak/format
  tutarlılığı). Çıkış kodu: hata varsa ≠ 0. `--json` çıktısı agent'ların
  parse etmesi için.
- **Bağımlılık:** yok (taksonomi listesi F0-T5'ten gelir; o hazır değilse
  mevcut içerikten türetilir ve sonra senkronlanır)
- **DoD:** 123 dosya üzerinde çalışır; bilinen hata (tırnaksız kategori)
  yakalanır; `--json` çıktısı şemalıdır; ruff temiz.
- **Kontrol:** Kasıtlı bozuk 5 fixture dosyasıyla test (`pytest`); her kural
  için en az bir negatif test.

#### F1-T2 · `inventory` / `audit` komutu
- **İş:** `eyyub inventory --json`: tüm içeriklerin durumu — dil kapsamı
  (tr/en/fr var mı), cover var mı, narrationAudio var mı, Kaynaklar bölümü var
  mı, gövde uzunluğu, kategori/tag dağılımı, mükerrer aday tespiti (başlık
  benzerliği + `-N` sonek). Markdown rapor çıktısı da (`--report`) üretir.
- **Bağımlılık:** F1-T1
- **DoD:** Bölüm 2'deki envanter tablosunu komut kendisi üretebilir durumda.
- **Kontrol:** Rapor sayıları bu plandaki elle sayılmış değerlerle karşılaştırılır.

#### F1-T3 · `image` komut grubu
- **İş:** `eyyub image fetch <url> --slug <slug>`: indir, EXIF temizle, boyut
  doğrula (min çözünürlük), `public/person/<slug>.jpg` olarak optimize et
  (hedef: makul web boyutu, örn. uzun kenar 1200px, kalite ~82);
  `eyyub image check --all`: cover alanı dolu ama dosyası olmayan / dosyası
  olup frontmatter'da bağlanmamış görselleri raporla.
- **Bağımlılık:** F1-T1
- **DoD:** Bir URL'den tek komutla site-hazır görsel; check komutu mevcut 4
  cover'ı doğru raporlar.
- **Kontrol:** Büyük/küçük/bozuk görsel fixture'larıyla test.

#### F1-T4 · `links` komutu
- **İş:** `eyyub links check [path|--all]`: içeriklerdeki tüm dış bağlantıların
  HTTP durumunu kontrol et (timeout, redirect takibi, 200 dışı raporu),
  `--json` çıktı. Kaynak linklerinin çürümesine karşı periyodik denetim aracı.
- **Bağımlılık:** F1-T1
- **DoD:** 123 dosya taraması tek komutla; rate-limit dostu (eş zamanlılık
  sınırı).
- **Kontrol:** Bilinen ölü + canlı URL fixture'ları ile test.

#### F1-T5 · `scaffold` komutu
- **İş:** `eyyub scaffold <slug> --lang tr --title "..." --category "..."`:
  şemaya uygun, doldurulmaya hazır frontmatter iskeleti üretir (draft: true
  ile). Skill'lerin elle YAML yazıp bozma riskini sıfırlar.
- **Bağımlılık:** F1-T1
- **DoD:** Üretilen dosya `eyyub validate`'ten geçer.
- **Kontrol:** validate ile round-trip testi CI'da.

---

### Faz 2 — Çekirdek Skill'ler: Araştırma ve Yazım

*Ön koşul: F0 (politika dosyaları) + F1-T1/T5.*

#### F2-T1 · `person-research` skill'i
- **İş:** `SKILL.md` yaz. Akış: (1) girdi al (ad, doğum/ölüm, kısa tanım —
  eksikse sor); (2) Gemini CLI ile Google-grounded arama (prompt şablonu:
  kaynak URL'si zorunlu, `source-priority.md` kademeleri prompt'a gömülü);
  (3) Claude kendi web aramasıyla ikinci tur; (4) bulguları **iddia + kaynak +
  kademe** tablosuna dök; (5) çelişkileri işaretle; (6) çıktıyı
  `scratch/research/<slug>.md` dosyasına yaz (repo'ya commit edilmez —
  gitignore'a eklenir). Kaynaksız hiçbir iddia tabloya giremez.
- **DoD:** Skill, örnek bir kişiyle uçtan uca koşturulmuş; çıktı formatı
  `person-write`'ın beklediği yapıda.
- **Kontrol:** Üretilen araştırma dosyasındaki 5 rastgele iddia, Codex CLI'a
  "bu kaynak bu iddiayı destekliyor mu?" diye doğrulatılır.

#### F2-T2 · `person-write` skill'i
- **İş:** Akış: (1) araştırma dosyasını girdi al (yoksa önce `person-research`
  çağır); (2) `style-guide.md`'yi yükle; (3) `eyyub scaffold` ile iskelet;
  (4) description (50–150 kr), özet paragraf, detaylı biyografi (`## ` bölümleri),
  `## Kaynaklar` (yalnızca araştırma tablosundaki, kademe 1–3 kaynaklar);
  (5) frontmatter'ı doldur (taksonomiden kategori, tarih kuralları — belirsiz
  yıl → `circa: true`); (6) `eyyub validate` + düzelt; (7) `draft: true` bırak
  (yayına alma kararı review sonrası).
- **Kural:** Araştırma tablosunda olmayan hiçbir olgu metne giremez. Metindeki
  her tarih/yer/unvan tabloda karşılığı olan bir iddiadır.
- **DoD:** Örnek kişi için validate'ten geçen, stil rehberine uyan taslak.
- **Kontrol:** `person-review` (F3-T1) bu çıktı üzerinde koşar.

#### F2-T3 · `person-new` skill'i (uçtan uca orkestrasyon)
- **İş:** Kullanıcının ana giriş noktası: `person-research` → `person-write` →
  `person-image` → `person-review` zincirini yürütür; her adım arasında durum
  raporu verir; review'dan geçmezse yazımı revize eder (en fazla 2 tur, sonra
  insana eskale). Sonunda: dosya listesi + kalan manuel işler (ör. görsel
  onayı) raporu.
- **Bağımlılık:** F2-T1, F2-T2 (F3-T1 ve F4 skill'leri hazır olana dek o
  adımları "atlandı" diye raporlayarak çalışabilir)
- **DoD:** Tek komutla ("şu kişiyi ekle: ...") taslak içerik + rapor.
- **Kontrol:** Pilot: fiilen eksik olan bir kişiyle uçtan uca koşu; çıktı
  kullanıcıya sunulur.

#### F2-T4 · `researcher` subagent tanımı
- **İş:** `.claude/agents/researcher.md`: yalnız okuma + web araçlarıyla,
  `person-research` akışını arka planda koşturabilen agent tanımı (toplu
  üretimde paralellik için).
- **DoD:** Agent tanımı `person-research` skill'ine atıf verir, araç kısıtları
  doğru.
- **Kontrol:** İki kişilik paralel araştırma denemesi.

---

### Faz 3 — Kalite: Review ve Fact-Check

*Ön koşul: F0-T2/T3, F1-T1. F2 ile paralel geliştirilebilir.*

#### F3-T1 · `person-review` skill'i
- **İş:** Üç aşamalı denetim; her aşama sonucu tek rapor dosyasında birleşir:
  1. **Deterministik:** `eyyub validate` + `eyyub links check` + `eyyub image
     check` (varsa).
  2. **Codex körleme incelemesi:** İçerik + kontrol listesi (`style-guide.md`
     + aşağıdaki QA matrisi) Codex CLI'a verilir; Claude'un notları verilmez.
     Codex'ten yapılandırılmış bulgu listesi istenir (satır, sorun, önem).
  3. **Claude fact-check:** Metindeki her olgusal iddia `## Kaynaklar`daki
     kaynaklarla eşleştirilir; kaynağı olmayan iddialar listelenir; dinî
     hassasiyet taraması (Katman A figürlerinde üslup, tasvir imaları).
  - Sonuç: `GEÇTİ` / `REVİZE` / `İNSAN ONAYI GEREKLİ` kararı + bulgu listesi.
- **DoD:** Mevcut bir içerik üzerinde 3 aşama da koşup tek rapor üretiyor.
- **Kontrol:** Kasıtlı hata ekilmiş bir kopya içerikle (yanlış tarih + kaynaksız
  iddia + şema hatası) test: 3 hatanın 3'ü de yakalanmalı.

#### F3-T2 · `editor` subagent tanımı
- **İş:** `.claude/agents/editor.md`: review akışını bağımsız koşturan, yazım
  yapmayan (yalnız bulgu raporlayan) agent.
- **DoD + Kontrol:** F3-T1'in kontrol senaryosunu subagent olarak koşturmak.

#### F3-T3 · QA matrisi ve karar eşikleri
- **İş:** Bu plandaki Bölüm 5 QA matrisini `.claude/rules/` altına taşı,
  her madde için `otomatik (eyyub) / Codex / Claude / insan` sorumlusu ata;
  `İNSAN ONAYI GEREKLİ` tetikleyicilerini kesinleştir (öneri: Katman A figürü +
  yeni görsel; kaynaklar arası çözülemeyen çelişki; kademe-1 kaynak yokluğu).
- **DoD:** Review skill'i matrise atıfla çalışıyor.
- **Kontrol:** Kullanıcı onayı.

---

### Faz 4 — Görsel Hattı

*Ön koşul: F0-T4 (politika, kullanıcı onaylı) + F1-T3.*

#### F4-T1 · `person-image` skill'i
- **İş:** Akış: (1) kişinin katmanını belirle (`image-policy.md` karar ağacı);
  (2) Gemini CLI ile görsel araştırması (aday URL + lisans bilgisi + kaynak
  sayfa); (3) lisans doğrulaması — kamu malı/CC kanıtı kaynak sayfadan teyit
  edilemiyorsa aday elenir; (4) uygun aday varsa `eyyub image fetch`; yoksa ve
  katman izin veriyorsa AI üretimi (Gemini Imagen veya Codex/gpt-image;
  prompt'a politika kısıtları gömülü: portre yok [A/B], "temsilî" ibaresi);
  (5) frontmatter `cover` + `## Kaynaklar`a `[Fotoğraf](url)` atfı;
  (6) **Katman A ve tüm AI üretimleri → kullanıcı onayına sunulur**, commit
  onaydan sonra.
- **DoD:** Bir Katman C kişisi (gerçek foto) + bir Katman A kişisi (mekân
  görseli) ile iki pilot koşu.
- **Kontrol:** `eyyub image check` + politika uygunluğu için `editor` subagent
  incelemesi; AI görsellerde kullanıcı onayı kayıt altına alınır (commit mesajı).

#### F4-T2 · Görsel kapama kampanyası (backlog)
- **İş:** `eyyub inventory` çıktısındaki cover'sız ~119 içerik için kategori
  bazlı toplu görev listesi üret (Sahabe=7 → tamamı Katman A, insan onaylı;
  fotoğraf çağı figürleri önce). Parti büyüklüğü: 10'luk PR'lar.
- **Bağımlılık:** F4-T1 pilotu onaylandıktan sonra.
- **DoD:** Sıralı, partilenmiş backlog dosyası; ilk parti tamamlanmış.
- **Kontrol:** Her parti PR'ında `person-review` + insan onayı (yalnız görsel
  hassasiyet maddeleri).

---

### Faz 5 — Çeviri Hattı (EN/FR)

*Ön koşul: F0-T2, F1-T1, F3-T1.*

#### F5-T1 · `person-translate` skill'i + `translator` subagent
- **İş:** Akış: (1) kaynak TR dosya `person-review`'dan `GEÇTİ` olmalı (çürük
  içerik çevrilmez); (2) Claude çevirir — özel adlar, unvanlar (Şeyhülislâm,
  Mihmandâr-ı Nebî gibi terimlerin çeviri/açıklama sözlüğü skill içinde
  başlatılır ve büyür), description karakter sınırı hedef dilde de korunur;
  (3) Codex CLI'a yalnızca hedef dil metni verilip "akıcılık + anlam kayması"
  kritiği istenir; (4) `eyyub validate`; (5) kaynaklar aynen taşınır
  (çevrilmez, TR kaynak da geçerli kaynaktır).
- **DoD:** 2 pilot çeviri (1 EN, 1 FR) mevcut 2 örnek çeviriyle stil açısından
  tutarlı.
- **Kontrol:** Geri-çeviri örneklemesi: çevirinin 3 cümlesi bağımsız oturumda
  TR'ye geri çevrilip anlam kayması aranır.

#### F5-T2 · Çeviri kapama kampanyası (backlog)
- **İş:** ~121 içerik × 2 dil backloğu; öncelik: `featured: true` olanlar →
  Sahabe → kalan kategoriler. 10'luk partiler, dil başına ayrı PR.
- **DoD:** Backlog dosyası + ilk parti.
- **Kontrol:** Her partide 2 rastgele dosyaya tam `person-review`.

---

### Faz 6 — Mevcut İçerik İyileştirme ve Sürekli Denetim

*Ön koşul: F2, F3.*

#### F6-T1 · `person-improve` skill'i
- **İş:** Mevcut bir içerik için: `person-review` bulgularını al → eksik
  `## Kaynaklar` tamamla (yeniden araştırma ile), kısa/yetersiz biyografiyi
  stil rehberi hedefine genişlet, frontmatter'ı düzelt. **Mevcut doğru bilgiyi
  koruma kuralı:** var olan iddialar silinmez, yalnızca kaynaklanır/düzeltilir;
  düzeltmeler diff'te gerekçelendirilir.
- **DoD:** Bilinen sorunlu bir dosyada (Kaynaklar'sız 6 dosyadan biri) pilot.
- **Kontrol:** İyileştirme sonrası `person-review` `GEÇTİ` vermeli; diff insan
  tarafından örneklemle incelenir.

#### F6-T2 · Acil temizlik görevleri (bilinen sorunlar)
Küçük, bağımsız, hemen dağıtılabilir görevler:
- **a.** Tırnaksız `category` düzelt (1 dosya) — DoD: `eyyub validate --all` temiz.
- **b.** `-2` sonekli 4 dosyayı incele: mükerrer mi, farklı kişi mi? Mükerrerse
  birleştirme önerisi raporu → **insan kararı** → uygulama. (Slug silme = URL
  kırılması; yönlendirme ihtiyacı nota eklenir.)
- **c.** `## Kaynaklar`sız 6 dosyaya F6-T1 uygulanır.
- **Kontrol:** Her biri ayrı commit; b şıkkı insan onaysız uygulanmaz.

#### F6-T3 · `person-audit` skill'i + periyodik denetim
- **İş:** `eyyub inventory + links check + validate` çıktılarını tek bir
  yönetici raporunda birleştiren skill; "durum panosu" (kapsam yüzdeleri,
  ölü linkler, draft bekleyenler, review'dan geçmemişler). İsteğe bağlı:
  haftalık çalışan bir GitHub Actions workflow'u issue olarak rapor açar.
- **DoD:** Tek komutla güncel durum raporu.
- **Kontrol:** Rapor sayıları `eyyub` JSON çıktılarıyla birebir (LLM sayı
  uydurması engeli: sayılar yalnızca komut çıktısından kopyalanır).

#### F6-T4 · Toplu iyileştirme kampanyası (backlog)
- **İş:** F6-T3 raporundan puanlanmış backlog (kısa gövde + kaynaksız +
  kapaksız kesişimi en öne). 10'luk partiler halinde `person-improve`.
- **Kontrol:** Parti başına review + insan örneklem incelemesi (%20).

---

## 5. QA / Kontrol Matrisi

Her içerik yayına (`draft: false`) geçmeden önce tamamı sağlanmalı:

| # | Kontrol | Sorumlu | Araç |
|---|---|---|---|
| 1 | Frontmatter şemaya uygun (description 50–150, tarih kuralları, kategori taksonomide) | otomatik | `eyyub validate` |
| 2 | `## Kaynaklar` var ve ≥2 kaynak, en az 1'i kademe 1–2 | otomatik + Claude | eyyub + review |
| 3 | Metindeki her olgusal iddianın kaynak karşılığı var | Claude | `person-review` aşama 3 |
| 4 | Tarih/yer bilgileri kaynaklarla tutarlı; belirsizlikte `circa` | Claude + Codex | review |
| 5 | Stil rehberine uygunluk (ton, uzunluk, yapı) | Codex (körleme) | review aşama 2 |
| 6 | Türkçe imla (şapkalı harfler, özel adlar, unvanlar) | Codex | review |
| 7 | Dinî/kültürel hassasiyet (üslup, tasvir, menkıbe/tarih ayrımı) | Claude + **insan** (Katman A) | review |
| 8 | Görsel: politika katmanına uygun, lisans kanıtlı, atıf var | otomatik + insan | `eyyub image check` + onay |
| 9 | Dış linkler canlı | otomatik | `eyyub links check` |
| 10 | Mükerrer değil (slug + başlık benzerliği) | otomatik | `eyyub inventory` |
| 11 | Çeviri: anlam kayması yok, terim sözlüğüne uygun | Codex + geri-çeviri | `person-translate` |
| 12 | `nuxt generate` içerikle kırılmıyor (parti PR'larında) | otomatik | CI / lokal build |

**İnsan onayı zorunlu tetikleyiciler:** (a) Katman A figürüne yeni görsel,
(b) her AI üretimi görsel, (c) mükerrer birleştirme/silme, (d) kaynaklar arası
çözülemeyen çelişki, (e) kademe-1/2 kaynak bulunamayan yeni içerik.

---

## 6. Riskler ve Kurallar

| Risk | Önlem |
|---|---|
| LLM halüsinasyonu (uydurma tarih/olay) | İddia-kaynak tablosu zorunlu (F2-T1); tabloda olmayan olgu metne giremez; körleme Codex incelemesi; sayılar yalnız deterministik komut çıktısından |
| Görsel telif ihlali | Lisans kanıtı olmayan aday elenir (F4-T1); CC BY-NC-SA uyumluluk kontrolü; atıf zorunlu |
| Dinî hassasiyet ihlali | Katmanlı politika + Katman A'da insan onayı; review'da özel tarama |
| Kaynak çürümesi | `eyyub links check` periyodik denetimi (F6-T3) |
| URL kırılması (slug değişikliği) | Slug'lar değişmez; mükerrer birleştirme yalnız insan kararıyla, yönlendirme notuyla |
| Harici CLI erişim sorunu | Skill'ler degrade modu raporlayarak çalışır; sessiz atlama yasak |
| Şema-eyyub senkron kayması | `content.config.ts` değişince `eyyub validate` fixture testleri kırılacak şekilde test yazılır (F1-T1) |
| Agent'ların büyük/dağınık PR üretmesi | Parti kuralı: ≤10 içerik/PR, tek konu/PR, Conventional Commits |

---

## 7. Agent Team Dağıtım Önerisi

Bağımlılık grafiğine göre dalga (wave) planı — aynı dalgadaki görevler paralel:

| Dalga | Görevler | Not |
|---|---|---|
| 1 | F0-T1..T5, F1-T1 | 6 paralel görev; F0-T3/T4 sonunda kullanıcı onayı toplanır |
| 2 | F1-T2..T5, F2-T1, F3-T3 | eyyub komutları + araştırma skill'i |
| 3 | F2-T2, F2-T4, F3-T1, F3-T2 | yazım + review |
| 4 | F2-T3 (pilot uçtan uca), F4-T1, F5-T1 | pilotlar; her biri sonunda insan değerlendirmesi |
| 5 | F6-T1, F6-T2, F6-T3 | iyileştirme araçları + acil temizlik |
| 6 | F4-T2, F5-T2, F6-T4 | kampanyalar (uzun soluklu, partiler halinde) |

**Pilot kapısı:** Dalga 4 pilotları kullanıcı tarafından beğenilmeden Dalga
6 kampanyaları başlatılmaz — stil/politika sorunları 100+ içeriğe kopyalanmadan
yakalanmalı.

**Her görev için standart teslim formatı:** görev ID'si, değişen dosyalar,
koşulan kontroller ve sonuçları, insan onayı bekleyen maddeler.
