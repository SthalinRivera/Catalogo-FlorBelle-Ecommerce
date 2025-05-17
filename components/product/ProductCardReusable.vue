<!-- components/ProductCard.vue -->
<template>
    <NuxtLink :to="{ name: 'product-id', params: { id: product.slug || product.id.toString() } }"
        class="group bg-white dark:bg-slate-800 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-gray-200 dark:border-slate-700">
        <!-- Contenedor de imagen con aspect ratio fijo -->
        <div class="relative w-full aspect-square bg-gray-100 dark:bg-slate-700 overflow-hidden">
            <img :src="product.imageUrl" :alt="product.name"
                class="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" />
        </div>

        <!-- Contenido de la tarjeta -->
        <div class="p-3 flex flex-col flex-grow">
            <!-- Categoría y stock -->
            <div class="flex justify-between items-center mb-2 gap-2">
                <span
                    class="text-xs font-medium bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300 py-0.5 px-2 rounded-full truncate">
                    {{ product.category ? product.category.name : 'No category' }}
                </span>
                <div v-if="product.stock > 0"
                    class="text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {{ product.stock }} disponibles
                </div>
                <div v-else
                    class="text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-0.5 rounded-full animate-pulse">
                    AGOTADO
                </div>
            </div>

            <!-- Nombre y descripción -->
            <h2 class="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 mb-1">
                {{ product.name }}
            </h2>
            <p class="text-gray-600 dark:text-gray-300 text-xs line-clamp-2 mb-3">
                {{ product.description }}
            </p>

            <!-- Precio -->
            <div class="mt-auto text-lg font-bold text-gray-900 dark:text-white">
                S/. {{ product.price }}
            </div>
        </div>
    </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
    product: {
        id: number
        name: string
        slug?: string
        description: string
        price: number
        imageUrl: string
        stock: number
        category?: {
            name: string
        }
    }
}>();
</script>