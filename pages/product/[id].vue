<template>
    <div class=" my-2 md:my-8 px-4 sm:px-6 lg:px-8">
        <!-- Encabezado -->
        <div class="text-center mb-2 md:mb-12">
            <h1 class="text-lg md:text-5xl font-bold text-gray-900 dark:text-white mb-1 md:mb-4">Detalles del Producto
            </h1>
            <div class="w-24 h-1 bg-pink-500 mx-auto rounded-full"></div>
        </div>

        <!-- Contenedor principal -->
        <div class="max-w-6xl mx-auto overflow-hidden rounded-2xl shadow-xl dark:shadow-pink-900/30">
            <div class="flex flex-col lg:flex-row bg-white dark:bg-gray-800">
                <!-- Galería de imágenes -->
                <div class="lg:w-1/2 p-2 md:p-6 bg-gray-50 dark:bg-gray-700">
                    <div class="relative h-96 rounded-lg overflow-hidden">
                        <img class="w-full h-full object-cover transition-all duration-300 hover:scale-105 cursor-zoom-in"
                            :src="currentDisplayImage" :alt="product.name"
                            @click="openImageModal(currentDisplayImage)" />
                        <span v-if="product.stock < 10"
                            class="absolute top-4 right-4 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                            ¡Últimas unidades!
                        </span>
                    </div>
                    <div class="flex mt-0 md:mt-4 space-x-2 overflow-x-auto py-1 md:py-2">
                        <div v-for="(img, index) in productImages" :key="index"
                            class="w-16 h-16 rounded-lg border-2 overflow-hidden cursor-pointer flex-shrink-0"
                            :class="{ 'border-pink-400': currentImageIndex === index, 'border-transparent': currentImageIndex !== index }"
                            @click="changeImage(index)">
                            <img class="w-full h-full object-cover" :src="img" :alt="`Vista previa ${index + 1}`" />
                        </div>
                    </div>
                </div>

                <!-- Detalles del producto -->
                <div class="lg:w-1/2  p-2 md:p-8 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center mb-2">
                            <span class="text-pink-500 dark:text-pink-400 text-sm font-medium">
                                {{ product.category ? product.category.name : 'Sin categoría' }}
                            </span>
                        </div>
                        <h2 class="text-lg md:text-s3xl font-bold text-gray-900 dark:text-white mb-3">{{ product.name }}
                        </h2>
                        <!-- Badge de promoción - Versión mejorada -->
                        <div v-if="product.hasPromotion" class="bg-rose-600 text-white px-3 py-2 rounded-lg shadow-md">
                            <div class="font-bold text-sm md:text-base flex items-center gap-1">
                                <UIcon name="i-heroicons-tag" class="w-4 h-4" />
                                {{ product.currentPromotion.isPercentage
                                    ? `-${product.currentPromotion.discount}% DE DESCUENTO`
                                    : `-S/. ${product.currentPromotion.discount} DE DESCUENTO` }}
                            </div>
                            <div class="text-xs mt-1 flex items-center">
                                <UIcon name="i-heroicons-clock" class="w-3 h-3 mr-1" />
                                Válido hasta {{ formatDate(product.currentPromotion.endDate) }}
                            </div>
                        </div>

                        <!-- Sección de precios mejorada -->
                        <div class="flex items-center justify-between my-4">
                            <div>
                                <!-- Precio actual (con descuento si aplica) -->
                                <p class="text-xl md:text-3xl font-bold text-rose-600 dark:text-rose-400">
                                    S/ {{ product.currentPrice.toFixed(2) }}
                                </p>

                                <!-- Precio original tachado (si hay promoción) -->
                                <p v-if="product.hasPromotion"
                                    class="text-sm text-gray-500 dark:text-gray-400 line-through">
                                    S/ {{ product.originalPrice.toFixed(2) }}
                                </p>

                                <!-- Ahorro calculado -->
                                <p v-if="product.hasPromotion"
                                    class="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                    Ahorras S/ {{ (product.originalPrice - product.currentPrice).toFixed(2) }}
                                </p>
                            </div>

                            <!-- Valoración con estrellas -->
                            <div class="flex flex-col items-end">
                                <div class="flex text-amber-400">
                                    <UIcon v-for="i in 5" :key="i"
                                        :name="i <= 4 ? 'i-heroicons-star-solid' : 'i-heroicons-star-half-solid'"
                                        class="w-5 h-5" />
                                </div>
                                <span class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    (24 reseñas) <!-- Cambiado de "reviews" a "reseñas" -->
                                </span>
                            </div>
                        </div>

                        <div class="mb-6">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Descripción</h3>
                            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {{ product.description }}
                            </p>
                        </div>

                        <div class="mb-6">
                            <label
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cantidad</label>
                            <div class="flex items-center">
                                <button
                                    class="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-3 py-1 rounded-l-lg disabled:opacity-50"
                                    :disabled="quantity <= 1 || product.stock === 0"
                                    @click="quantity > 1 ? quantity-- : null">
                                    -
                                </button>
                                <span class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-1">
                                    {{ product.stock === 0 ? 0 : quantity }}
                                </span>
                                <button
                                    class="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-3 py-1 rounded-r-lg disabled:opacity-50"
                                    :disabled="quantity >= product.stock || product.stock === 0"
                                    @click="quantity < product.stock ? quantity++ : null">
                                    +
                                </button>
                                <span class="ml-4 text-sm" :class="{
                                    'text-gray-500 dark:text-gray-400': product.stock > 0,
                                    'text-red-500 dark:text-red-400 font-semibold': product.stock === 0
                                }">
                                    {{ product.stock > 0 ? `${product.stock} disponibles` : 'AGOTADO' }}
                                </span>


                            </div>
                        </div>
                    </div>


                    <div class="space-y-3">
                        <button @click="handleAddToCart(product)"
                            :disabled="product.stock === 0 || quantity > (product.stock - (productInCart ? productInCart.quantity : 0))"
                            class="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-pink-500/20 flex items-center justify-center disabled:from-gray-400 disabled:to-gray-500 disabled:hover:from-gray-400 disabled:hover:to-gray-500 disabled:cursor-not-allowed">
                            <UIcon name="i-heroicons-shopping-cart-solid" class="w-5 h-5 mr-2" />
                            {{ product.stock > 0 ? `Añadir al carrito - S/ ${(product.hasPromotion ?
                                product.currentPrice.toFixed(2) : product.price) * quantity}` : 'Producto agotado' }}
                        </button>


                        <button @click="toggleFavorite(product)"
                            class="w-full border border-pink-500 text-pink-500 dark:text-pink-400 dark:border-pink-400 py-3 px-6 rounded-lg font-medium transition-all duration-300 hover:bg-pink-50 dark:hover:bg-pink-900/30 flex items-center justify-center">

                            <UIcon :name="isFavorite(product.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
                                class="w-5 h-5 mr-2" :class="{
                                    'text-pink-500 dark:text-pink-400': !isFavorite(product.id),
                                    'text-red-500 dark:text-red-500': isFavorite(product.id)
                                }" />
                            {{ isFavorite(product.id) ? 'En favoritos' : 'Añadir a favoritos' }}
                        </button>

                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de imagen -->
        <Transition name="fade">
            <div v-if="isImageModalOpen"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
                @click.self="closeImageModal">
                <div class="relative max-w-6xl w-full max-h-screen flex items-center">
                    <button @click.stop="prevImage"
                        class="absolute left-4 z-10 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition-colors">
                        <UIcon name="i-heroicons-chevron-left" class="w-8 h-8" />
                    </button>

                    <div class="w-full flex justify-center">
                        <img class="max-h-[90vh] max-w-full object-contain" :src="currentImage" :alt="product.name" />
                    </div>

                    <button @click.stop="nextImage"
                        class="absolute right-4 z-10 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition-colors">
                        <UIcon name="i-heroicons-chevron-right" class="w-8 h-8" />
                    </button>

                    <button @click="closeImageModal"
                        class="absolute top-4 right-4 text-white hover:text-pink-400 transition-colors">
                        <UIcon name="i-heroicons-x-mark" class="w-8 h-8" />
                    </button>

                    <div class="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                        <span v-for="(img, index) in productImages" :key="index"
                            class="w-2 h-2 rounded-full transition-colors"
                            :class="{ 'bg-pink-500': currentImageIndex === index, 'bg-white/50': currentImageIndex !== index }">
                        </span>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- Beneficios -->
        <Benefits></Benefits>

        <!-- Productos relacionados -->
        <div class="max-w-6xl mx-auto mt-16">
            <div class="flex items-center justify-between mb-8">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Productos relacionados</h2>
                <NuxtLink to="/product" class="text-pink-500 dark:text-pink-400 hover:underline flex items-center">
                    Ver todos
                    <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-1" />
                </NuxtLink>
            </div>
            <div class="grid gap-2 md:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                <ProductCardReusable v-for="product in relatedProducts" :key="product.id" :product="product" />
            </div>
        </div>
        <!-- Modal del carrito -->
        <ShoppingCart :isOpen="isOpen" @update:isOpen="isOpen = $event" />
    </div>
</template>

<script setup lang="ts">
import type { Product } from '~/interfaces/product';
import { useProductShoppingCartStore } from '~/stores/productShoppingCart';
const productStore = useProductStore();
const { $toast } = useNuxtApp();
const route = useRoute();
// const { id } = route.params;
const slug = route.params.id;

const { addToFavorites } = useProductStore();
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

// Estado reactivo
const isOpen = ref(false);
const quantity = ref(1);
const { addProductShoppingCart } = useProductShoppingCartStore();

// Estado para la galería de imágenes
const productImages = ref<string[]>([]);
const currentImageIndex = ref(0);
const isImageModalOpen = ref(false);
const currentImage = ref('');

// Obtener datos del producto
const { data: productData, error } = await useFetch<Product>(`/api/v1/product/${slug}`);

if (error.value) {
    throw createError({
        status: 404,
        statusText: "Producto no encontrado"
    });
}

// Producto reactivo
// Producto reactivo
const product = computed(() => productData.value || {
    id: '',
    name: 'Cargando...',
    slug: '',
    description: '',
    price: 0,
    stock: 0,
    imageUrl: '',
    category: null,
    hasPromotion: false,
    currentPrice: 0,
    originalPrice: 0,
    currentPromotion: null
});

// Inicializar imágenes del producto
productImages.value = [
    product.value.imageUrl,
];

const currentDisplayImage = computed(() => productImages.value[currentImageIndex.value]);
console.log("productos  relaciones ", product.value.id);

// Obtener productos relacionados
const { data: relatedProductsData } = await useFetch<Product[]>(`/api/v1/productByCategoryId/${product.value.categoryId}`,
    { default: () => [] }
);

const relatedProducts = computed(() => relatedProductsData.value || []);

// Funciones de la galería
const changeImage = (index: number) => {
    currentImageIndex.value = index;
};

const openImageModal = (imageUrl: string) => {
    currentImage.value = imageUrl;
    currentImageIndex.value = productImages.value.indexOf(imageUrl);
    isImageModalOpen.value = true;
    document.body.style.overflow = 'hidden';
};

const closeImageModal = () => {
    isImageModalOpen.value = false;
    document.body.style.overflow = '';
};

const nextImage = () => {
    currentImageIndex.value = (currentImageIndex.value + 1) % productImages.value.length;
    currentImage.value = productImages.value[currentImageIndex.value];
};

const prevImage = () => {
    currentImageIndex.value = (currentImageIndex.value - 1 + productImages.value.length) % productImages.value.length;
    currentImage.value = productImages.value[currentImageIndex.value];
};

// Función para añadir al carrito
const addToCart = (relatedProduct: Product) => {
    const shoppingCartStore = useProductShoppingCartStore();

    // Verificar si el producto está agotado
    if (relatedProduct.stock === 0) {
        $toast.error("Este producto está agotado");
        return;
    }

    // Calcular cuántas unidades ya hay en el carrito
    const existingItem = shoppingCartStore.productShoppingCart.find(item => item.id === relatedProduct.id);
    const alreadyInCart = existingItem ? existingItem.quantity : 0;
    const totalRequested = alreadyInCart + 1; // Cantidad fija de 1 para productos relacionados

    // Verificar si hay suficiente stock
    if (totalRequested > relatedProduct.stock) {
        const available = relatedProduct.stock - alreadyInCart;
        $toast.error(`No hay suficiente stock. Solo puedes agregar ${available > 0 ? available : 0} unidad(es) más`);
        return;
    }

    const productWithQuantity = {
        ...relatedProduct,
        quantity: 1,
        price: relatedProduct.hasPromotion ? relatedProduct.currentPrice : relatedProduct.price
    };

    const added = shoppingCartStore.addProductShoppingCart(productWithQuantity);
    if (added) {
        isOpen.value = true;
        $toast.success("¡Producto añadido al carrito!");
    } else {
        $toast.error("No se pudo agregar al carrito. Stock insuficiente.");
    }
};
// Manejar teclado para navegación
const handleKeyDown = (e: KeyboardEvent) => {
    if (!isImageModalOpen.value) return;

    if (e.key === 'Escape') {
        closeImageModal();
    } else if (e.key === 'ArrowRight') {
        nextImage();
    } else if (e.key === 'ArrowLeft') {
        prevImage();
    }
};

// Función para manejar la adición al carrito con validación

const handleAddToCart = (productItem: Product) => {
    const shoppingCartStore = useProductShoppingCartStore();

    // Verificar si el producto está agotado
    if (productItem.stock === 0) {
        $toast.error("Este producto está agotado");
        return;
    }

    // Calcular cuántas unidades ya hay en el carrito
    const existingItem = shoppingCartStore.productShoppingCart.find(item => item.id === productItem.id);
    const alreadyInCart = existingItem ? existingItem.quantity : 0;
    const totalRequested = alreadyInCart + quantity.value;

    // Verificar si hay suficiente stock
    if (totalRequested > productItem.stock) {
        const available = productItem.stock - alreadyInCart;
        $toast.error(`No hay suficiente stock. Solo puedes agregar ${available > 0 ? available : 0} unidad(es) más`);
        return;
    }

    // Crear un objeto con el precio correcto (con descuento si aplica)
    const productToAdd = {
        ...productItem,
        quantity: quantity.value,
        price: productItem.hasPromotion ? productItem.currentPrice : productItem.price
    };

    const added = shoppingCartStore.addProductShoppingCart(productToAdd);
    if (added) {
        isOpen.value = true;
        $toast.success("¡Producto añadido al carrito!");
        quantity.value = 1;
    } else {
        $toast.error("No se pudo agregar al carrito. Stock insuficiente.");
    }
};


onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown);
    document.body.style.overflow = '';
});

const shoppingCartStore = useProductShoppingCartStore();
const productInCart = computed(() => {
    return shoppingCartStore.productShoppingCart.find(item => item.id === product.value.id);
});

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};
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

.transition-transform {
    transition-property: transform;
}

.group:hover .group-hover\:scale-105 {
    transform: scale(1.05);
}

/* Animación para el modal */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Cursor que indica que se puede hacer zoom */
.cursor-zoom-in {
    cursor: zoom-in;
}

/* Personalización del scroll para las miniaturas */
::-webkit-scrollbar {
    height: 4px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
    background: #555;
}

.dark ::-webkit-scrollbar-track {
    background: #374151;
}

.dark ::-webkit-scrollbar-thumb {
    background: #6b7280;
}

.dark ::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
}
</style>