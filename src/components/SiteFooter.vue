<script setup>
import ProviderIcon from '@/components/ProviderIcon.vue'

const MUALLIF = { ism: "Ma'ruf Sheraliyev", github: 'https://github.com/mfs1011' }
const REPO = 'https://github.com/mfs1011/dev-docs'
</script>

<template>
    <footer class="site-footer">
        <div class="site-footer-inner">
            <p class="site-footer-about">
                O'zbek tilidagi dasturchi qo'llanmalari. Mazmun rasmiy hujjatlarga tayanadi, misollar ishga tushirib tekshirilgan.
            </p>

            <div class="site-footer-meta">
                <span>
                    Tayyorladi:
                    <a :href="MUALLIF.github" target="_blank" rel="noopener" class="site-footer-author">
                        <ProviderIcon provider="github" />
                        {{ MUALLIF.ism }}
                    </a>
                </span>
                <a :href="`${REPO}/issues`" target="_blank" rel="noopener">Xato yoki taklif</a>
                <a :href="REPO" target="_blank" rel="noopener">Manba kodi</a>
            </div>
        </div>
    </footer>
</template>
