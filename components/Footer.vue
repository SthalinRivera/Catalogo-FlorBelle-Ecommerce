<template>
    <div>
        <footer
            class="w-full bg-gradient-to-r from-white to-gray-100 dark:from-slate-800 dark:to-slate-900 text-slate-800 dark:text-slate-200 shadow-lg transition-colors duration-300">
            <div class="px-4 pt-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
                <div class="grid gap-10 row-gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
                    <div class="sm:col-span-2">
                        <NuxtLink to="/" class="flex items-center gap-2">
                            <img src="/logo-ligh.png" alt="Logo Claro" class="h-8 block dark:hidden">
                            <img src="/logo-dark.png" alt="Logo Oscuro" class="h-8 hidden dark:block">
                        </NuxtLink>
                        <div class="mt-6 lg:max-w-sm">
                            <p class="text-sm text-slate-600 dark:text-slate-300">
                                Cuidado personal, frescura natural y detalles únicos. Encuentra elegancia y bienestar en
                                un solo lugar.
                            </p>

                        </div>
                    </div>
                    <div class="space-y-2 text-sm">
                        <p class="text-base font-bold tracking-wide text-slate-800 dark:text-white">Contacto</p>
                        <div class="flex">
                            <p class="mr-1 text-slate-600 dark:text-slate-300">Teléfono:</p>
                            <a href="tel:850-123-5021"
                                class="transition-colors duration-300 hover:text-pink-600 dark:hover:text-pink-400">+51
                                942269610</a>
                        </div>
                        <div class="flex">
                            <p class="mr-1 text-slate-600 dark:text-slate-300">Email:</p>
                            <a href="mailto:info@lorem.mail"
                                class="transition-colors duration-300 hover:text-pink-600 dark:hover:text-pink-400">florbelle.com@gmail.com</a>
                        </div>
                        <div class="flex">
                            <p class="mr-1 text-slate-600 dark:text-slate-300">Dirección:</p>
                            <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer"
                                class="transition-colors duration-300 hover:text-pink-600 dark:hover:text-pink-400">
                                Chimbote-Perú</a>
                        </div>
                    </div>
                    <div>
                        <span class="text-base font-bold tracking-wide text-slate-800 dark:text-white">Síguenos</span>
                        <div class="flex items-center mt-2 space-x-4">

                            <a href="#" target="_blank"
                                class="text-slate-600 dark:text-slate-300 hover:text-pink-500 dark:hover:text-pink-400 transition-transform transform hover:scale-110">
                                <i class="ri-instagram-fill ri-xl"></i>
                            </a>
                            <a href="https://web.facebook.com/profile.php?id=61576045855744" target="_blank"
                                class="text-slate-600 dark:text-slate-300 hover:text-pink-500 dark:hover:text-pink-400 transition-transform transform hover:scale-110">
                                <i class="ri-facebook-fill ri-xl"></i>
                            </a>
                        </div>
                        <p class="mt-4 text-sm text-slate-600 dark:text-slate-300">
                            Síguenos en nuestras redes para más ofertas y novedades.
                        </p>
                    </div>
                </div>
                <div
                    class="flex flex-col-reverse justify-between pt-5 pb-10 border-t border-gray-200 dark:border-slate-700 lg:flex-row">
                    <p class="text-sm text-slate-600 dark:text-slate-400">
                        © 2025 FlorBelle. Todos los derechos reservados.
                    </p>
                    <ul class="flex flex-col mb-3 space-y-2 lg:mb-0 sm:space-y-0 sm:space-x-5 sm:flex-row">
                        <li>
                            <a href="/faq"
                                class="text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300 hover:text-pink-600 dark:hover:text-pink-400">F.A.Q</a>
                        </li>
                        <li>
                            <a href="/politica-privacidad"
                                class="text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300 hover:text-pink-600 dark:hover:text-pink-400">Política
                                de privacidad</a>
                        </li>
                        <li>
                            <a href="/terminos-condiciones"
                                class="text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300 hover:text-pink-600 dark:hover:text-pink-400">Términos
                                y condiciones</a>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped></style>