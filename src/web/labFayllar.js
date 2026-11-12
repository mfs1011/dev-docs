// Laboratoriya fayllari (web-trenajor/lab) — sahifa VM ochilganda /root/.lab-* ga yozadi, so'ng SOZLA bajariladi.
import nginx from '../../web-trenajor/lab/nginx.conf?raw'
import sozla from '../../web-trenajor/lab/sozla.sh?raw'
import yuritma from '../../web-trenajor/lab/yuritma.sh?raw'
import index from '../../web-trenajor/lab/index.html?raw'
import logo from '../../web-trenajor/lab/logo.svg?raw'
import uslub from '../../web-trenajor/lab/uslub.css?raw'

export const LAB_FAYLLAR = { 'nginx.conf': nginx, 'sozla.sh': sozla, 'yuritma.sh': yuritma, 'index.html': index, 'logo.svg': logo, 'uslub.css': uslub }
export const SOZLA = ' sh /root/.lab-sozla.sh; clear'
