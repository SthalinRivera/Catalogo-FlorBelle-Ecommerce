<template>
    <div class="mt-6">
        <!-- Loading State -->
        <div v-if="pending" class="flex flex-col items-center justify-center py-16">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p class="text-gray-600 dark:text-gray-400">Cargando categorías...</p>
        </div>

        <!-- Empty State - Mostrar cuando no hay categorías -->
        <div v-else-if="!categories || categories.length === 0"
            class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div
                class="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <i class="ri-folder-line text-3xl text-gray-400 dark:text-gray-500"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-2">No hay categorías disponibles</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-4">Pronto tendremos nuevas categorías para ti</p>
        </div>

        <!-- Mostrar el slider solo cuando hay categorías -->
        <CategorySlider v-else title="Nuestras Categorías" :categories="categories" default-icon="ri-store-line"
            @category-click="navigateToCategory">
            <template #description="{ category }">
                <div class="text-xs text-gray-500 dark:text-gray-400 flex  items-center">
                    <i class="ri-boxing-line mr-1"></i>
                    {{ category._count?.products || 0 }} productos
                </div>
            </template>
        </CategorySlider>
    </div>
</template>

<script setup lang="ts">
import type { Category } from '~/interfaces/category';
import CategorySlider from './CategorySlider.vue';

const { data: categoriesData, pending } = await useFetch<Category[]>('/api/v1/category', {
    transform: (data) => data.map(cat => ({
        ...cat,
        imageUrl: cat.imageUrl || '/default-image.png'
    }))
})
// Asegurarnos de que categories sea un array
const categories = computed(() => categoriesData.value || [])

const navigateToCategory = (category: Category) => {
    navigateTo(`/category/${category.slug}`)
}
</script>