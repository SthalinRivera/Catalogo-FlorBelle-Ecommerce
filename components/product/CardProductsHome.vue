<template>
  <div class="my-6">
    <h1
      class="text-slate-900 dark:text-white font-bold text-2xl mb-4 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-1 after:w-16 after:bg-pink-500 after:rounded-full pb-1">
      Accesorios destacados
    </h1>

    <!-- Controles de búsqueda y ordenamiento -->
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
      <!-- Campo de búsqueda -->
      <UInput v-model="searchQuery" placeholder="Buscar accesorios..." icon="i-heroicons-magnifying-glass"
        class="w-full sm:w-64" />

      <!-- Selector de ordenamiento -->
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <span class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Ordenar por:</span>
        <USelect v-model="sortOption" :options="sortOptions" option-attribute="label" value-attribute="value"
          class="min-w-40 w-full" />
      </div>
    </div>

    <!-- Contador de resultados -->
    <p class="text-lg text-gray-700 dark:text-gray-200 mb-4">
      {{ filteredProducts.length }} accesorios encontrados
    </p>

    <!-- Lista de productos -->
    <div class="grid gap-2 md:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <ProductCardReusable v-for="product in paginatedProducts" :key="product.id" :product="product" />
    </div>

    <!-- Paginación -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      <div class="text-sm text-gray-600 dark:text-gray-400">
        Mostrando {{ startItem }}-{{ endItem }} de {{ filteredProducts.length }} accesorios
      </div>

      <UPagination v-model="currentPage" :page-count="perPage" :total="filteredProducts.length" :ui="{
        wrapper: 'flex items-center gap-1',
        rounded: '!rounded-full min-w-8 w-8 h-8',
        default: {
          activeButton: { variant: 'solid' },
          inactiveButton: { color: 'gray' }
        }
      }">
        <template #prev="{ onClick }">
          <UButton icon="i-heroicons-chevron-left-20-solid" color="gray" variant="ghost" :disabled="currentPage === 1"
            @click="onClick" class="w-8 h-8" />
        </template>

        <template #next="{ onClick }">
          <UButton icon="i-heroicons-chevron-right-20-solid" color="gray" variant="ghost"
            :disabled="currentPage === pageCount" @click="onClick" class="w-8 h-8" />
        </template>
      </UPagination>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProductCardReusable from './ProductCardReusable.vue';

const { data: products } = await useFetch('/api/v1/product/');

// Variables reactivas
const searchQuery = ref('');
const sortOption = ref('name-asc');
const currentPage = ref(1);
const perPage = ref(12);

// Opciones de ordenamiento
const sortOptions = [
  { label: 'Nombre: A-Z', value: 'name-asc' },
  { label: 'Nombre: Z-A', value: 'name-desc' },
  { label: 'Precio: Menor a Mayor', value: 'price-asc' },
  { label: 'Precio: Mayor a Menor', value: 'price-desc' },
];

// Productos filtrados
const filteredProducts = computed(() => {
  let filtered = [...products.value || []];

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter(product =>
      product.title?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm)
    );
  }

  // Ordenar productos
  switch (sortOption.value) {
    case 'name-asc':
      filtered.sort((a, b) => a.name?.localeCompare(b.name));
      break;
    case 'name-desc':
      filtered.sort((a, b) => b.name?.localeCompare(a.name));
      break;
    case 'price-asc':
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case 'price-desc':
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
  }

  return filtered;
});

// Productos paginados
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  const end = start + perPage.value;
  return filteredProducts.value.slice(start, end);
});

// Cálculos para la paginación
const pageCount = computed(() => Math.ceil(filteredProducts.value.length / perPage.value));
const startItem = computed(() => (currentPage.value - 1) * perPage.value + 1);
const endItem = computed(() => Math.min(currentPage.value * perPage.value, filteredProducts.value.length));

// Resetear página cuando cambian los filtros
watch([searchQuery, sortOption], () => {
  currentPage.value = 1;
});
</script>