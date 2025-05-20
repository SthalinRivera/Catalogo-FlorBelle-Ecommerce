<template>
    <div class="my-6">
        <h1
            class="text-slate-900 dark:text-white font-bold text-2xl mb-6 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-1 after:w-20 after:bg-pink-500 after:rounded-full pb-2">
            Productos en Oferta
        </h1>

        <!-- Filtros y ordenación -->
        <div class="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <UInput v-model="searchQuery" placeholder="Buscar productos..." icon="i-heroicons-magnifying-glass"
                class="min-w-[250px]" />

            <div class="flex items-center gap-4">
                <USelect v-model="sortBy" :options="sortOptions" class="w-40" />
                <USelect v-model="sortOrder" :options="orderOptions" class="w-28" />
                <USelect v-model="itemsPerPage" :options="[6, 12, 24]" class="w-24" />
            </div>
        </div>

        <!-- Estado de carga -->
        <div v-if="pending" class="flex justify-center py-12">
            <UProgress animation="carousel" />
        </div>

        <!-- Estado vacío -->
        <div v-else-if="!pending && filteredProducts.length === 0"
            class="relative overflow-hidden rounded-xl shadow-lg my-8 min-h-[400px] flex items-center justify-center group border-2 border-dashed border-gray-200 dark:border-slate-700">
            <div class="text-center p-8 max-w-2xl mx-auto">
                <div
                    class="mb-6 inline-flex p-5 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-700 shadow-inner">
                    <UIcon name="i-heroicons-tag" class="w-12 h-12 text-gray-400 dark:text-slate-500" />
                </div>
                <h3 class="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-3">
                    ¡No se encontraron productos!
                </h3>
                <p class="text-lg text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    No hay productos que coincidan con tu búsqueda.
                </p>
            </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="text-red-500">
            Error al cargar las ofertas: {{ error.message }}
        </div>

        <!-- Contenido principal -->
        <div v-else>
            <!-- Grid de productos -->
            <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <NuxtLink v-for="product in paginatedProducts" :key="product.id"
                    :to="`/product/${product.slug || product.id}`"
                    class="group flex bg-gray-50 dark:bg-slate-800  transition-all duration-300 md:flex-row rounded-lg">
                    <!-- Imagen del producto -->
                    <div class="relative overflow-hidden rounded-s-lg ">
                        <img class="object-cover w-80 h-32 md:w-96 md:h-80  rounded-s-lg transition-transform duration-300 group-hover:scale-105"
                            :src="product.imageUrl || 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-4.0.3&auto=format&fit=crop&w=765&q=80'"
                            :alt="product.name" />
                    </div>

                    <!-- Contenido del producto -->
                    <div class="flex flex-col justify-center p-4 leading-normal w-full">
                        <!-- Promoción encima de la imagen -->
                        <div v-if="product.currentPromotion"
                            class="absolute top-1 right-2 bg-gradient-to-r text-gray-900 dark:text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg inline-block z-10  text-xs sm:text-sm">

                            <!-- Vista móvil (resumido) -->
                            <p class="sm:hidden font-bold text-gray-900 dark:text-white text-xl leading-none">
                                {{ product.currentPromotion.isPercentage
                                    ? `-${product.currentPromotion.discount}%`
                                    : `-S/ ${product.currentPromotion.discount}` }}
                            </p>
                            <span class=" sm:hidden text-gray-900 dark:text-white font-medium text-xs">
                                de dto.
                            </span>

                            <!-- Vista normal (pantallas medianas en adelante) -->
                            <div class="hidden sm:block">
                                <p class="font-semibold leading-tight">
                                    {{ product.currentPromotion.title }}
                                </p>

                                <p class="text-gray-900 dark:text-white font-bold leading-none">
                                    <span class="text-xl">
                                        {{ product.currentPromotion.isPercentage
                                            ? `${product.currentPromotion.discount}%`
                                            : `S/ ${product.currentPromotion.discount}` }}
                                    </span>
                                    <span class="text-gray-900 dark:text-white font-medium text-xs">
                                        de dto.
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div>
                            <h5 class="mb-1 text-md tracking-tight text-gray-900 dark:text-white">
                                {{ product.name || 'Producto sin nombre' }}
                            </h5>
                            <p class="mb-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                {{ product.description || 'Descripción no disponible' }}
                            </p>
                        </div>

                        <!-- Precio y stock -->
                        <div class="mt-2 flex items-center justify-between">
                            <div class="flex items-center">
                                <span
                                    class=" flex  items-center text-sm md:text-lg font-bold text-gray-900 dark:text-white">
                                    <div class="mr-2">
                                        S/ {{ product.currentPrice.toFixed(2) || '0.00' }}
                                    </div>
                                    <div v-if="product.originalPrice > product.currentPrice"
                                        class="text-sm text-gray-500 line-through">
                                        S/ {{ product.originalPrice.toFixed(2) }}

                                    </div>
                                </span>

                            </div>
                            <span v-if="product.stock > 0"
                                class="text-xs md:text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                                <span class="md:hidden">{{ product.stock }} disp.</span>
                                <span class="hidden md:inline">{{ product.stock }} disponibles</span>
                            </span>
                            <span v-else
                                class="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full animate-pulse">
                                AGOTADO
                            </span>
                        </div>
                    </div>
                </NuxtLink>
            </div>

            <!-- Paginación -->
            <div class="mt-8 flex justify-center" v-if="filteredProducts.length > itemsPerPage">
                <UPagination v-model="currentPage" :page-count="itemsPerPage" :total="filteredProducts.length" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// Estado reactivo
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(6);
const sortBy = ref('name');
const sortOrder = ref('asc');

// Opciones de ordenación
const sortOptions = [
    { value: 'name', label: 'Nombre' },
    { value: 'price', label: 'Precio' },
    { value: 'discount', label: 'Descuento' }
];

const orderOptions = [
    { value: 'asc', label: 'Ascendente' },
    { value: 'desc', label: 'Descendente' }
];

// Obtener datos
const { data: products, pending, error } = await useFetch('/api/v1/promotionactive');

// Procesar productos
const processedProducts = computed(() => {
    if (!products.value) return [];

    return products.value.map(product => ({
        ...product,
        currentPrice: product.currentPrice || product.price,
        originalPrice: product.originalPrice || product.price
    }));
});

// Filtrar productos
const filteredProducts = computed(() => {
    const query = searchQuery.value.toLowerCase();
    return processedProducts.value.filter(product =>
        product.name.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query))
    ).sort((a, b) => {
        // Ordenación
        if (sortBy.value === 'name') {
            return sortOrder.value === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        } else if (sortBy.value === 'price') {
            return sortOrder.value === 'asc'
                ? a.currentPrice - b.currentPrice
                : b.currentPrice - a.currentPrice;
        } else if (sortBy.value === 'discount') {
            const discountA = a.originalPrice - a.currentPrice;
            const discountB = b.originalPrice - b.currentPrice;
            return sortOrder.value === 'asc'
                ? discountA - discountB
                : discountB - discountA;
        }
        return 0;
    });
});

// Productos paginados
const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredProducts.value.slice(start, end);
});

// Resetear página cuando cambian los filtros
watch([searchQuery, sortBy, sortOrder, itemsPerPage], () => {
    currentPage.value = 1;
});
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>