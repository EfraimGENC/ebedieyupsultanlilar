<template>
  <div>
    <div class="bg-gray-50/20 dark:bg-gray-900/20 rounded-2xl p-6 shadow">
      <div class="max-w-7xl mx-auto">
        <p>Müzeyyen bir çeşme kıldı, du‘âsı müstecâb olsun.<br>
          Delîlin Hazret-i Allah, şefî‘in Mustafa olsun.<br>
          Bir içen bir dahî içe, içenlere şifâ olsun.<br>
          Re’îs Ahmed GENÇ’den, Eyüpsultân’a hediyye olsun.</p>
        <p class="m-0">— Hafız Efraim GENÇ</p>
        <span class="text-dimmed font-light">Ahmet GENÇ'in Babası</span>
      </div>
    </div>

    <img src="/about/ebedi-eyupsultanlilar-cesmesi.jpg" alt="Ebedi Eyüpsultanlılar Çeşmesi"
      class="my-4 rounded-2xl shadow" />

    <h1 class="text-4xl text-center sm:text-start">Ebedi Eyüpsultanlılar Çeşmesi</h1>

    <p>Eyüpsultan, İstanbul’un kalbinde tarih ile ebediyetin iç içe geçtiği müstesna bir beldedir. Asırlar boyunca
      padişahların tahta çıkmadan önce dua için geldiği, gönül sultanlarının burada medfun bulunduğu bu topraklar, her
      bir kabriyle birer tarih sahifesi gibidir. Bu beldenin asıl sahibi, Allah Resûlü’nün mihmandarı Ebu Eyyûb
      el-Ensârî Hazretleri’dir; diğer tüm büyükler onun aziz komşularıdır. Bizler ise bu kutlu beldede sadece misafiriz.
    </p>

    <p>Tarihin kalbi Eyüpsultan'da, ebedi bir vefa nişanesi olarak yükselen <strong>"Ebedi Eyüpsultanlılar
        Çeşmesi"</strong>, sadece
      susuzları değil, aynı zamanda bu topraklara ruh verenlerin hatıralarını da serinletiyor. Bu eşsiz eser, üç dönem
      boyunca Eyüp Belediye Başkanlığı yapan <strong>Ahmet Genç'in</strong>, tarihe vefa borcunu ödeme arzusundan doğan,
      derin bir anlam
      taşıyor.</p>

    <h2 class="text-2xl mb-2">Tarihi Mirasa Saygı</h2>

    <p>1994–2008 yılları arasında Eyüpsultan’da üç dönem boyunca belediye başkanlığı yapan <strong>Ahmet GENÇ</strong>,
      görevi süresince
      yalnızca belediyeciliğin rutin işlerini değil, aynı zamanda tarihe ve Osmanlı mirasına sahip çıkmayı da kendine
      vazife edinmiştir. Unutulmaya yüz tutmuş çeşmeler, türbeler, kabristanlıklar, hazireler ve nice tarihî eser onun
      gayretiyle yeniden hayat bulmuş, asırlık taşlar temizlenmiş, gönüllere huzur veren bir sadelikle günümüze
      kazandırılmıştır. Bu çalışmalar sırasında adı unutulmuş yahut kabri bilinmeyen pek çok değerli şahsiyetin mezarı
      da yeniden ortaya çıkmış, ilim ve kültür dünyamız için eşsiz kaynaklar oluşmuştur.</p>

    <p>Bu eşsiz mirası koruma ve gelecek nesillere aktarma misyonuyla yola çıkan Ahmet Genç, kişisel bir vefa borcu
      olarak, Eyüp Mezarlığındaki aile kabristanlığının içine, <strong>"Ebedi Eyüpsultanlılar"</strong> için bir çeşme
      inşa ettirdi. Bu
      çeşme, Eyüpsultan'a can veren, burada ebedi istirahate çekilmiş yüzlerce önemli şahsiyetin adını taşıyan mermer
      bir anıt. Her bir isim, bu beldenin ruhunu ve kimliğini oluşturan birer damla gibi, çeşmenin suyunda yankılanıyor.
    </p>

    <h2 class="text-2xl mb-2">Nesiller Arası Köprü</h2>

    <p>Ahmet Genç'in bu hayratına, oğlu <strong>Muhammed Efraim Genç</strong>'in dokunuşlarıyla modern bir katkı sunuldu
      ve
      <strong>ebedieyupsultanlilar.com</strong> adlı bir internet sitesi ile, çeşme üzerinde yer bulamayan yüzlerce
      ismin bilgisi, hayat
      hikayesi ve hatırası sanal âleme taşındı.
    </p>

    <p>Bu site, yalnızca bir biyografi arşivi değil; Eyüpsultan’ın ebedi sakinlerinin bir hatıra defteri, bir kültür
      atlasıdır. Burada anılan isimler, tarihe iz bırakmış; ilim, sanat, edebiyat, siyaset ve maneviyat sahalarında
      izzetle yaşamış şahsiyetlerdir. Onlar bu beldenin ebedi komşuları, bizler ise bu beldenin emanetçileriyiz.</p>

    <p><strong>Ebedi Eyüpsultanlılar Çeşmesi</strong> ve bu site, bir neslin tarihine sahip çıkma gayretinin, geçmiş ile
      gelecek
      arasındaki köprünün ve “hafızası olan şehir” idealinin somut bir ifadesidir.</p>


    <!-- Contact Alert -->
    <UAlert class="mt-18" icon="i-tabler-mail" color="primary" variant="soft" :title="$t('about.contact.title')"
      :description="$t('about.contact.description')">
      <template #actions>
        <UButton color="primary" variant="soft" @click="openEmail" icon="i-tabler-send">
          {{ $t('about.contact.button') }}
        </UButton>
      </template>
    </UAlert>

    <!-- Navigation -->
    <div class="mx-auto py-8">
      <div class="border-t border-gray-200 dark:border-gray-700 pt-8">
        <div class="flex justify-between items-center">
          <UButton :to="localePath('index')" color="neutral" variant="ghost" icon="i-tabler-arrow-left">
            {{ $t('nav.home') }}
          </UButton>

          <!-- Share buttons -->
          <div class="flex gap-2">
            <UButton color="neutral" variant="ghost" icon="i-tabler-share" @click="shareContent">
              {{ $t('common.share') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const localePath = useLocalePath()

definePageMeta({
  i18n: {
    paths: {
      tr: '/hakkinda',
      en: '/about',
      fr: '/a-propos',
    }
  }
})

useSeoMeta({
  title: () => $t('about.title'),
  description: () => $t('nuxtSiteConfig.description'),
  ogTitle: () => $t('about.title'),
  ogDescription: () => $t('nuxtSiteConfig.description'),
  ogType: 'website',
})

// E-posta adresini botlardan korumak için şifrelenmiş versiyon
// Base64 + ters çevirme kombinasyonu
const openEmail = () => {
  if (import.meta.client) {
    // "eyup@ebedieyupsultanlilar.com" şifrelenmiş hali
    const encoded = 'bW9jLnJhbGlsbmF0bHVzcHV5ZWlkZWJlQHB1eWU='
    const decoded = atob(encoded).split('').reverse().join('')
    window.location.href = `mailto:${decoded}`
  }
}

const shareContent = async () => {
  // Sadece tarayıcıda çalışmasını garanti altına al
  if (import.meta.client) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: $t('about.title') as string,
          text: $t('nuxtSiteConfig.description') as string,
          url: window.location.href
        })
      } catch (err) {
        await navigator.clipboard.writeText(window.location.href)
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }
}
</script>

<style></style>