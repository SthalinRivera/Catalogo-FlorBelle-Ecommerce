    <template>
        <div class="max-w-9xl mx-auto p-4">
            <Breadcrumb :items="[{ title: 'Productos', to: '/dashboard/products' }]" />

            <!-- Header Section -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <!-- Título -->
                <div>
                    <h1 class="text-3xl font-bold">Gestión de Productos</h1>
                    <p class="text-gray-500 dark:text-gray-400 mt-1">
                        Gestiona tu inventario de productos y detalles
                    </p>
                </div>

                <!-- Controles -->
                <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <!-- Ordenar -->
                    <USelect v-model="sortOrder" :options="[
                        { label: 'Más recientes primero', value: 'desc' },
                        { label: 'Más antiguos primero', value: 'asc' }
                    ]" @change="filterProducts" class="w-full sm:w-48" placeholder="Ordenar por" />

                    <!-- Buscador -->
                    <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass-20-solid"
                        placeholder="Buscar productos..." class="w-full sm:w-64" />

                    <!-- Botones -->
                    <div class="flex gap-2">
                        <UButton icon="i-heroicons-document-arrow-down" color="green" @click="exportToExcel">
                            Exportar
                        </UButton>
                        <UButton icon="i-heroicons-plus-circle" color="blue" @click="openModal">
                            Agregar
                        </UButton>
                    </div>
                </div>
            </div>
            <!-- Loading State -->
            <div v-if="loading">
                <SkeletonTableProducts></SkeletonTableProducts>
            </div>

            <!-- Error State -->
            <div v-else-if="error"
                class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                <p class="text-red-600 dark:text-red-400 font-medium">{{ error }}</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="products.length === 0"
                class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                <div
                    class="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <i class="ri-box-2-line text-3xl text-gray-400 dark:text-gray-500"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-2">No se encontraron productos.</h3>
                <p class="text-gray-500 dark:text-gray-400 mb-4">Comienza agregando tu primer producto.</p>
                <button @click="openModal()"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Agregar Producto.
                </button>
            </div>

            <div v-else
                class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div class=" overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Producto</th>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Categoría</th>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Prommocion</th>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Precio</th>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Stock</th>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Fecha creación
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Acción</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            <tr v-for="product in paginatedProducts" :key="product.id"
                                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0 h-10 w-10 cursor-pointer"
                                            @click="openImageModal(product.imageUrl || 'https://via.placeholder.com/40')">
                                            <img class="h-10 w-10 rounded-md object-cover hover:opacity-80 transition-opacity"
                                                :src="product.imageUrl || 'https://via.placeholder.com/40'"
                                                alt="Product image">
                                        </div>
                                        <div class="ml-4">
                                            <div class="text-sm font-medium text-gray-900 dark:text-white">{{
                                                product.name
                                                }}</div>
                                            <div class="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{{
                                                truncateText(product.description, 50) }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span
                                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                        {{ getCategoryName(product.categoryId) }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span v-if="product.promotions.length > 0"
                                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                        {{ product.promotions[0].discount }}% de descuento
                                    </span>
                                    <span v-else
                                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400">
                                        Sin promoción
                                    </span>
                                </td>
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    S/. {{ product.price }}
                                </td>


                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span :class="{
                                        'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200': product.stock > 10,
                                        'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200': product.stock > 0 && product.stock <= 10,
                                        'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200': product.stock === 0
                                    }" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                                        {{ product.stock }} en stock
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {{ formatDate(product.createdAt) }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div class="flex justify-end gap-2">
                                        <button @click="openModal(product)"
                                            class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors">
                                            <i class="ri-pencil-line"></i>
                                        </button>
                                        <button @click="deleteProduct(product.id)"
                                            class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors">
                                            <i class="ri-delete-bin-line"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                </div>
                <!-- Paginación -->
                <div v-if="filteredProducts.length > 0"
                    class="flex flex-col items-center px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 space-y-3">
                    <!-- Información de resultados -->
                    <div class="text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left w-full">
                        Mostrando {{ Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length) }}
                        a {{ Math.min(currentPage * itemsPerPage, filteredProducts.length) }}
                        de {{ filteredProducts.length }} resultados
                    </div>

                    <!-- Controles de paginación -->
                    <div class="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
                        <!-- Selector de items por página -->
                        <select v-model="itemsPerPage"
                            class="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white w-full sm:w-auto">
                            <option value="5">5 por página</option>
                            <option value="10">10 por página</option>
                            <option value="20">20 por página</option>
                            <option value="50">50 por página</option>
                        </select>

                        <!-- Navegación -->
                        <div class="flex items-center gap-2 w-full sm:w-auto justify-center">
                            <!-- Botón Anterior -->
                            <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1"
                                class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 dark:bg-gray-700 dark:text-white">
                                Anterior
                            </button>

                            <!-- Números de página - scroll horizontal en móvil -->
                            <div class="flex overflow-x-auto gap-1 hide-scrollbar">
                                <button v-for="page in totalPages" :key="page" @click="currentPage = page" :class="{
                                    'bg-blue-600 text-white': currentPage === page,
                                    'hover:bg-gray-100 dark:hover:bg-gray-600': currentPage !== page
                                }"
                                    class="min-w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors">
                                    {{ page }}
                                </button>
                            </div>

                            <!-- Botón Siguiente -->
                            <button @click="currentPage = Math.min(totalPages, currentPage + 1)"
                                :disabled="currentPage === totalPages"
                                class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 dark:bg-gray-700 dark:text-white">
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal  Edit Product-->
            <div v-if="showModal"
                class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl font-bold text-gray-800 dark:text-white">
                                {{ editingProduct ? "Editar Producto" : "Agregar Producto" }}
                            </h2>
                            <button @click="showModal = false"
                                class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                <i class="ri-close-line text-2xl"></i>
                            </button>
                        </div>

                        <form @submit.prevent="saveProduct" class="space-y-4" novalidate>
                            <div>
                                <label
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                                <input v-model="formState.name" type="text" required placeholder="Nombre del producto"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                            </div>

                            <div>
                                <label
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                                <textarea v-model="formState.description" rows="3" placeholder="Descripción breve"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"></textarea>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio</label>
                                    <div class="relative">
                                        <span
                                            class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">S/.</span>
                                        <input v-model="formState.price" type="number" min="0" step="0.01" required
                                            placeholder="0.00"
                                            class="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                                    </div>
                                </div>

                                <div>
                                    <label
                                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
                                    <input v-model="formState.stock" type="number" min="0" required
                                        placeholder="Cantidad disponible"
                                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                                </div>
                            </div>

                            <div>
                                <label
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
                                <select v-model="formState.categoryId" required
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                                    <option value="">Selecciona una categoría</option>
                                    <option v-for="category in categories" :key="category.id" :value="category.id">
                                        {{ category.name }}
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Imagen
                                    del producto</label>
                                <div class="mt-1 flex items-center gap-4">
                                    <!-- Contenedor principal de carga -->
                                    <div class="mx-auto">
                                        <!-- Estado inicial (antes de subir) -->
                                        <label v-if="!imageUrl" class="flex flex-col items-center justify-center w-64 h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 
                        border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400
                        bg-gray-50/50 dark:bg-gray-800/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/20
                        group relative overflow-hidden">

                                            <!-- Efecto de fondo sutil -->
                                            <div
                                                class="absolute inset-0 bg-[radial-gradient(circle_at_center,#e0f2fe_0%,transparent_70%)] opacity-0 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_center,#1e3a8a_0%,transparent_70%)] transition-opacity duration-500">
                                            </div>

                                            <div
                                                class="flex flex-col items-center justify-center pt-5 pb-6 text-center relative z-10">
                                                <!-- Icono animado -->
                                                <svg class="w-12 h-12 mb-4 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform"
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="1.5"
                                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12">
                                                    </path>
                                                </svg>
                                                <p class="text-sm text-gray-600 dark:text-gray-300">Haz clic o arrastra
                                                    una imagen</p>
                                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Formatos: JPG,
                                                    PNG, WEBP</p>
                                            </div>

                                            <input type="file" class="hidden" @change="handleFileUpload"
                                                accept="image/*">
                                        </label>

                                        <!-- Estado cuando la imagen está cargada -->
                                        <div v-else class="relative group">
                                            <img :src="imageUrl"
                                                class="w-64 h-40 rounded-xl object-cover border border-gray-200 dark:border-gray-700">
                                            <!-- Botón para cambiar imagen -->
                                            <button @click="resetImage"
                                                class="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-700 transition-all">
                                                <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor"
                                                    viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                                                    </path>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Barra de progreso -->
                                    <div v-if="uploadProgress > 0 && uploadProgress < 100" class="flex-1">
                                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                            <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                                                :style="{ width: uploadProgress + '%' }"></div>
                                        </div>
                                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Subiendo: {{
                                            uploadProgress.toFixed(2) }}%</p>

                                    </div>
                                </div>
                            </div>
                            <div>
                                <label
                                    class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <input type="checkbox" v-model="formState.promo" @change="onPromoToggle"
                                        class="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600">
                                    ¿Este producto está en promoción?
                                </label>
                            </div>

                            <!-- Campos que se muestran solo si el producto está en promoción -->
                            <div v-if="formState.promo" class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Descuento (%)
                                    </label>
                                    <input v-model.number="formState.promotions.discount" type="number" min="1"
                                        max="100" required placeholder="Ej: 20"
                                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                                    <p v-if="formState.promotions.discount < 1 || formState.promotions.discount > 100"
                                        class="text-xs text-red-500 mt-1">
                                        El descuento debe ser entre 1% y 100%
                                    </p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Válido hasta
                                    </label>
                                    <input v-model="formState.promotions.endDate" type="date" required
                                        :min="format(new Date(), 'yyyy-MM-dd')"
                                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                                    <p v-if="formState.promotions.endDate && new Date(formState.promotions.endDate) <= new Date()"
                                        class="text-xs text-red-500 mt-1">
                                        La fecha debe ser futura
                                    </p>
                                </div>
                            </div>
                            <div class="flex justify-end gap-3 pt-4">
                                <button type="button" @click="showModal = false"
                                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" :disabled="!isFormValid" :class="{
                                    'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500': isFormValid,
                                    'bg-gray-400 cursor-not-allowed': !isFormValid
                                }"
                                    class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors">
                                    {{ editingProduct ? "Actualizar Producto" : "Agregar Producto" }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <!-- Modal para imagen completa usando UModal -->
            <UModal v-model="showImageModal">
                <div class="relative ">
                    <button @click="closeImageModal"
                        class="absolute top-2 right-2 p-1 rounded-full bg-gray-800/50 hover:bg-gray-700/75 text-white transition-colors">
                        <i class="ri-close-line text-xl"></i>
                    </button>

                    <img :src="selectedImage ?? undefined" class="max-w-full max-h-[80vh] object-contain rounded-lg"
                        alt="Imagen completa" v-if="selectedImage !== null">
                </div>
            </UModal>
        </div>
    </template>

<script setup lang="ts">
import { ref, reactive, watchEffect, nextTick, computed } from "vue";
import { format } from 'date-fns';
import * as XLSX from 'xlsx'; // Importar librería para exportar a Excel

import { useNuxtApp } from "#app";
import { useFirebaseUpload } from '~/composables/useFirebaseUpload';
import SkeletonTableProducts from "~/components/UI/Skeleton/SkeletonTableProducts.vue";
import type { Product } from "~/interfaces/product";

const { $toast } = useNuxtApp();
const products = ref<any[]>([]);
const filteredProducts = ref<any[]>([]); // Para los productos filtrados
const categories = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showModal = ref(false);
const editingProduct = ref<any | null>(null);
const imageUrl = ref<string | null>(null);
const searchQuery = ref(''); // Para el buscador
const currentPage = ref(1); // Paginación
const itemsPerPage = ref(10); // Items por página

const sortOrder = ref('desc'); // 'desc' para recientes primero, 'asc' para más antiguos
definePageMeta({
    middleware: ['auth'],
    layout: 'dashboard',
});
// Configuración de paginación
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage.value));
const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredProducts.value.slice(start, end);
});


// Función para filtrar productos
const filterProducts = () => {
    let filtered = [...products.value]; // Inicializa con copia de los productos

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            getCategoryName(product.categoryId).toLowerCase().includes(query)
        );
    }

    // Ordenar según sortOrder
    filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder.value === 'desc' ? dateB - dateA : dateA - dateB;
    });

    filteredProducts.value = filtered;
    currentPage.value = 1; // Resetear a la primera página al filtrar
};


// Función para exportar a Excel
const exportToExcel = () => {
    const dataToExport = filteredProducts.value.map(product => ({
        'Nombre': product.name,
        'Descripción': product.description,
        'Categoría': getCategoryName(product.categoryId),
        'Precio': product.price,
        'Stock': product.stock,
        'Promoción': product.hasPromotion ? 'Sí' : 'No',
        'Fecha Creación': product.createdAt || 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
    XLSX.writeFile(workbook, "productos.xlsx");
};


// Modificar fetchProducts para actualizar filteredProducts
const fetchProducts = async () => {
    loading.value = true;
    try {

        const { data } = await useFetch("/api/v1/product");
        products.value = data.value || [];
        filteredProducts.value = [...products.value];
    } catch (err) {
        error.value = "Failed to load products.";
    } finally {
        loading.value = false;
    }
};

// Observar cambios en searchQuery
watch(searchQuery, filterProducts);

// Observar cambios en sortOrder
watch(sortOrder, filterProducts);

// Observar cambios en products
watch(products, filterProducts, { deep: true });


const { uploadProgress, uploadImage } = useFirebaseUpload();

const handleFileUpload = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
        imageUrl.value = await uploadImage(file);
    }
};

const formState = reactive({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    imageUrl: "",
    categoryId: "",
    promo: false,
    promotions: {
        title: "", // Puedes hacer esto dinámico si quieres
        description: "",
        discount: 0,
        isPercentage: true, // O hazlo controlable desde el formulario si es necesario
        startDate: "", // o puedes pedirlo desde el formulario
        endDate: ""
    }
});



const resetImage = () => {
    imageUrl.value = null;
    formState.imageUrl = "";
};
const isFormValid = computed(() => {
    return formState.name.trim() !== '' &&
        formState.description.trim() !== '' &&
        formState.price > 0 &&
        formState.stock >= 0 &&
        formState.categoryId !== '' &&
        (imageUrl.value || formState.imageUrl !== '');
});



// Obtener categorías
const fetchCategories = async () => {
    try {
        const { data } = await useFetch("/api/v1/category");
        categories.value = data.value || [];
    } catch (err) {
        error.value = "Failed to load categories.";
    }
};
const onPromoToggle = () => {
    if (!formState.promo) {
        // Limpiar datos de promoción si se desactiva el checkbox
        formState.promotions = {
            title: "",
            description: "",
            discount: 0,
            isPercentage: true,
            startDate: "",
            endDate: ""
        };
    }
};
// Abrir modal
const openModal = async (product: Product | null = null) => {
    editingProduct.value = product;

    if (product) {
        // Cargamos los datos del producto en el formulario
        Object.assign(formState, {
            name: product.name || "",
            description: product.description || "",
            price: product.price || 0,
            stock: product.stock || 0,
            categoryId: product.categoryId || "",
            imageUrl: product.imageUrl || "",
            // Cambiar esta parte para manejar correctamente las promociones
            promo: product.promotions && product.promotions.length > 0
        });


        // Llenar promoción si existe
        if (product.promotions && product.promotions.length > 0) {

            const firstPromo = product.promotions[0];
            formState.promotions = {
                title: firstPromo.title || "Promoción especial",
                description: firstPromo.description || "Descuento por tiempo limitado",
                discount: firstPromo.discount || 0,
                isPercentage: firstPromo.isPercentage !== undefined ? firstPromo.isPercentage : true,
                startDate: firstPromo.startDate || format(new Date(), 'yyyy-MM-dd'),
                endDate: firstPromo.endDate ? format(new Date(firstPromo.endDate), 'yyyy-MM-dd') : ""
            };
        } else {
            formState.promotions = {
                title: "Promoción especial",
                description: "Descuento por tiempo limitado",
                discount: 0,
                isPercentage: true,
                startDate: format(new Date(), 'yyyy-MM-dd'),
                endDate: ""
            };
        }

        imageUrl.value = product.imageUrl || null;
    } else {
        // Reiniciamos el formulario si no hay producto
        Object.assign(formState, {
            name: "",
            description: "",
            price: 0,
            stock: 0,
            categoryId: "",
            imageUrl: "",
            promo: false,
            promotions: {
                discount: 0,
                endDate: ""
            }
        });
        imageUrl.value = null;
    }

    showModal.value = false;
    await nextTick();
    showModal.value = true;
};

// Guardar producto
const saveProduct = async () => {
    try {

        const productData = {
            ...formState,
            imageUrl: imageUrl.value || formState.imageUrl,
        };

        if (editingProduct.value) {

            const { data, error } = await useFetch(`/api/v1/updateProduct/${editingProduct.value.id}`, {
                method: "PUT",
                body: productData
            });
            if (error.value) {
                console.error("Update error:", error.value);
                $toast.error(error.value.data?.message || "Error al actualizar el producto");
                return;
            }

            $toast.success("Producto actualizado correctamente");
        } else {
            const response = await useFetch("/api/v1/addProduct", {
                method: "POST",
                body: productData
            });

            if (response.error.value) {
                console.error("Error al guardar el producto:", response.error.value);
                $toast.error(response.error.value.data?.message || "Error al guardar el producto");
                return;
            }

            $toast.success("Producto agregado correctamente");
        }

        showModal.value = false;
        fetchProducts();
    } catch (error) {
        $toast.error("Error al guardar el producto");
        console.error("Error saving product:", error);
    }
};

// Eliminar producto
const deleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
        await useFetch(`/api/v1/deleteProduct/${productId}`, { method: "DELETE" });
        products.value = products.value.filter(p => p.id !== productId);
        $toast.success("Product deleted successfully");
    } catch (error) {
        $toast.error("Failed to delete product.");
    }
};

// Obtener el nombre de la categoría
const getCategoryName = (categoryId: number) => {
    const category = categories.value.find(cat => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
};

const truncateText = (text: string, maxLength: number): string => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};
// Cargar datos
watchEffect(async () => {
    await nextTick();
    fetchProducts();
    fetchCategories();
});


const showImageModal = ref(false);
const selectedImage = ref<string | undefined>(undefined)

const openImageModal = (imageUrl: string | undefined) => {
    selectedImage.value = imageUrl
    showImageModal.value = true
}

const closeImageModal = () => {
    showImageModal.value = false
    selectedImage.value = undefined
}

const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
        closeImageModal();
    }
};

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
};
</script>

<style scoped>
/* Agrega esto en tu componente */
.modal-overlay {
    cursor: pointer;
}

.modal-content {
    cursor: auto;
}
</style>
