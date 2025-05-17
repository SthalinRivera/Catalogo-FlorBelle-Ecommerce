<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    <!-- Breadcrumb -->
    <nav class="flex mb-6" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-2">
        <li class="inline-flex items-center">
          <NuxtLink to="/"
            class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-pink-600 dark:text-gray-400 dark:hover:text-white">
            <UIcon name="i-heroicons-home" class="mr-2 w-4 h-4" />
            Inicio
          </NuxtLink>
        </li>
        <li>
          <div class="flex items-center">
            <UIcon name="i-heroicons-chevron-right" class="text-gray-400 w-4 h-4" />
            <NuxtLink to="/category"
              class="ml-2 text-sm font-medium text-gray-700 hover:text-pink-600 dark:text-gray-400 dark:hover:text-white">
              Categorías
            </NuxtLink>
          </div>
        </li>
        <li aria-current="page">
          <div class="flex items-center">
            <UIcon name="i-heroicons-chevron-right" class="text-gray-400 w-4 h-4" />
            <span class="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              {{ categoryName || 'Cargando...' }}
            </span>
          </div>
        </li>
      </ol>
    </nav>

    <!-- Encabezado -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {{ categoryName || 'Productos' }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          {{ products.length }} productos disponibles
        </p>
      </div>

      <!-- Filtros -->
      <div class="flex gap-3 w-full sm:w-auto">
        <select v-model="sortBy"
          class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-pink-500 focus:border-pink-500">
          <option value="price-asc">Precio: Menor a Mayor</option>
          <option value="price-desc">Precio: Mayor a Menor</option>
          <option value="name-asc">Nombre: A-Z</option>
          <option value="name-desc">Nombre: Z-A</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-16">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">Cargando productos...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="products.length === 0"
      class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
      <div class="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
        <UIcon name="i-heroicons-exclamation-circle" class="text-3xl text-gray-400 dark:text-gray-500" />
      </div>
      <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-2">No hay productos en esta categoría</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">Pronto tendremos nuevos productos disponibles</p>
      <NuxtLink to="/"
        class="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
        <UIcon name="i-heroicons-arrow-left" class="mr-2 w-4 h-4" />
        Volver a categorías
      </NuxtLink>
    </div>

    <!-- Grid de Productos -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      <div v-for="product in sortedProducts" :key="product.id"
        class="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl overflow-hidden shadow-sm sm:shadow-md hover:shadow-xl transition-shadow duration-300 group">
        <div class="relative">
          <NuxtLink :to="`/product/${product.id}`">
            <img class="w-full h-36 sm:h-48 object-cover transition-transform duration-500 group-hover:scale-105"
              :src="product.imageUrl || '/placeholder-product.jpg'" :alt="product.name" />
          </NuxtLink>
          <UButton @click="toggleFavorite(product)" :class="[
            'absolute top-2 right-2 backdrop-blur-sm rounded-full p-1 sm:p-2 transition-all duration-300 shadow-sm sm:shadow-md',
            isFavorite(product.id)
              ? 'bg-pink-500 hover:bg-pink-600 text-white'
              : 'bg-white/80 dark:bg-slate-900/80 hover:bg-pink-500 dark:hover:bg-pink-500'
          ]">
            <UIcon name="i-heroicons-heart" class="w-4 h-4 sm:w-5 sm:h-5" :class="{
              'text-pink-500 dark:text-pink-400 hover:text-white dark:hover:text-white': !isFavorite(product.id),
              'text-slate-100': isFavorite(product.id)
            }" dynamic />
          </UButton>
          <span v-if="product.stock < 5"
            class="absolute top-2 sm:top-3 left-2 sm:left-3 bg-pink-500 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded truncate max-w-[80px] sm:max-w-none">
            ¡Últimas<span class="hidden sm:inline"> unidades</span>!
          </span>
        </div>

        <div class="p-3 sm:p-4">
          <NuxtLink :to="`/product/${product.id}`">
            <h3 class="font-semibold text-sm sm:text-lg text-gray-900 dark:text-white mb-1 sm:mb-2 line-clamp-1">
              {{ product.name }}
            </h3>
          </NuxtLink>

          <p class="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
            {{ product.description || 'Descripción no disponible' }}
          </p>

          <div class="flex justify-between items-center">
            <div>
              <span class="font-bold text-sm sm:text-base text-pink-500 dark:text-pink-400">
                S/ {{ product.price }}
              </span>
            </div>
            <NuxtLink :to="`/product/${product.id}`">
              <UButton
                class="bg-gradient-to-r from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700 dark:text-white border-none py-1.5 sm:py-2 px-2 sm:px-3 rounded-md sm:rounded-lg hover:from-pink-600 hover:to-pink-700 dark:hover:from-pink-500 dark:hover:to-pink-600 transition-all duration-300 shadow-sm sm:shadow-md hover:shadow-lg">
                <span class="text-xs sm:text-sm">Ver</span>
                <template #trailing>
                  <UIcon name="i-heroicons-arrow-right-20-solid" class="w-3 h-3 sm:w-4 sm:h-4 ml-0.5 sm:ml-1" />
                </template>
              </UButton>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/interfaces/product';

const route = useRoute();
// const { id } = route.params;
const slug = route.params.id;
const { $toast } = useNuxtApp();
const productStore = useProductStore();

// Datos y estado
const products = ref<Product[]>([]);
const categoryName = ref('');
const loading = ref(true);
const sortBy = ref('price-asc');

// Obtener productos por categoría
const fetchProductsByCategory = async () => {
  try {
    loading.value = true;

    // Obtener productos
    const { data: productsData } = await useFetch<Product[]>(`/api/v1/productByCategorySlug/${slug}`,
      {
        default: () => []
      }
    );
    console.log("Products data:", productsData.value);

    // Obtener nombre de categoría
    if (productsData.value?.length > 0) {
      try {
        const { data: categoryData, error } = await useFetch(`/api/v1/categoryBySlug/${slug}`);

        if (error.value) {
          console.error("Error fetching category:", error.value);
          categoryName.value = ''; // Deja el nombre vacío si hay error
        } else {
          // Asegúrate de acceder a categoryData.value correctamente
          categoryName.value = categoryData?.value?.name || '';
          console.log("Category name:", categoryName.value);
        }
      } catch (err) {
        console.error("Error fetching category:", err);
        categoryName.value = ''; // Manejo de errores
      }
    }

    products.value = productsData.value || [];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    $toast.error('Error al cargar los productos');
  } finally {
    loading.value = false;
  }
};

// Verificar si un producto está en favoritos
const isFavorite = (productId: number) => {
  return productStore.favorites.some(item => item.id === productId);
};

// Manejar favoritos
const toggleFavorite = (product: Product) => {
  if (isFavorite(product.id)) {
    productStore.deleteFavorites(product.id);
    $toast.success("Eliminado de favoritos");
  } else {
    productStore.addToFavorites(product);
    $toast.success("Agregado a favoritos");
  }
};

// Productos ordenados
const sortedProducts = computed(() => {
  return [...products.value].sort((a, b) => {
    const [key, order] = sortBy.value.split('-');

    if (key === 'price') {
      return order === 'asc' ? a.price - b.price : b.price - a.price;
    } else if (key === 'name') {
      return order === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    return 0;
  });
});

// Observar cambios en el ID de categoría
//watch(() => route.params.id, fetchProductsByCategory, { immediate: true });
watch(() => route.params.slug, fetchProductsByCategory, { immediate: true });
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>