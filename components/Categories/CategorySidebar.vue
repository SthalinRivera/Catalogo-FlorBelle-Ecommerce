<script lang="ts" setup>
import type { Category } from '~/interfaces/category';
// Definimos la interfaz extendida para Category
interface CategoryWithCount extends Category {
    _count?: {
        products: number;
    };
    cantidadProductos?: number;
    imageUrl: string;
}
const { data: categoriesData, pending } = await useFetch<CategoryWithCount[]>('/api/v1/category', {
    transform: (data) => data.map(cat => ({
        ...cat,
        imageUrl: cat.imageUrl || '/default-image.png',
        // Usar _count.products si está disponible
        cantidadProductos: cat._count?.products || 0
    }))
})

// Asegurar que categories sea un array
const categorias = computed(() => categoriesData.value || [])

const navegarACategoria = (categoria: Category) => {
    // navigateTo(`/category/${categoria.slug || categoria.id}`)
    navigateTo(`/category/${categoria.slug || categoria.id}`)
}
</script>

<template>
    <aside class="sticky  hidden md:block top-6 z-5 h-fit">
        <div class="rounded-2xl p-5 transition-all duration-300 shadow-sm hover:shadow-md bg-white dark:bg-slate-800">
            <!-- Encabezado con icono animado -->
            <div class="flex items-center justify-between mb-6 group cursor-pointer">
                <h2 class="text-2xl font-bold flex items-center">
                    <span
                        class="mr-3 p-2 rounded-full transition-all duration-300 bg-gray-100 group-hover:bg-gray-200 dark:bg-gray-700 dark:group-hover:bg-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                clip-rule="evenodd" />
                        </svg>
                    </span>
                    Categorías
                </h2>
                <span
                    class="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {{ categorias.length }} categorías
                </span>
            </div>

            <!-- Lista de categorías -->
            <ul class="space-y-2">
                <li v-for="categoria in categorias" :key="categoria.id">
                    <button @click="navegarACategoria(categoria)"
                        class="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group hover:bg-gray-50 dark:hover:bg-gray-700"
                        :disabled="pending">
                        <div class="flex items-center">
                            <!-- Imagen de la categoría -->
                            <img :src="categoria.imageUrl" :alt="categoria.name"
                                class="w-10 h-10 mr-4 rounded-lg object-cover"
                                onerror="this.onerror=null;this.src='/default-category.png'" />
                            <div class="text-left">
                                <p class="font-medium">{{ categoria.name }}</p>
                                <p class="text-xs opacity-60">{{ categoria.cantidadProductos }} productos</p>
                                <!-- Mostrar descripción si existe -->
                                <p v-if="categoria.description" class="text-xs opacity-60 truncate max-w-[180px]">
                                    {{ categoria.description }}
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <span
                                class="text-xs font-medium px-2 py-1 rounded mr-2 bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                {{ categoria.cantidadProductos }}
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg"
                                class="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>
                </li>
            </ul>

            <!-- Botón para ver todas las categorías -->
            <NuxtLink to="/category"
                class="w-full mt-4 py-3 rounded-xl font-medium flex items-center justify-center transition-all duration-300 bg-blue-100 hover:bg-blue-200 text-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">
                Ver todas las categorías
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </NuxtLink>
        </div>
    </aside>
</template>

<style scoped>
/* Transiciones suaves */
button {
    transition-property: background-color, transform, box-shadow;
}

/* Efecto de elevación al pasar el mouse */
button:hover {
    transform: translateY(-1px);
}

/* Estados de enfoque para accesibilidad */
button:focus {
    @apply outline-none ring-2 ring-blue-500 ring-opacity-50;
}

/* Estado de carga */
button[disabled] {
    @apply opacity-50 cursor-not-allowed;
}

/* Estilo para imágenes de respaldo */
img {
    background-color: #f3f4f6;
    object-fit: cover;
}
</style>