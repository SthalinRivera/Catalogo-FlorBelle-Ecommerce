<template>
    <div class="max-w-9xl mx-auto p-4">
        <Breadcrumb :items="[
            { title: 'Productos', to: '/dashboard/products' },
            { title: 'Promoción', to: '/dashboard/promotion' }
        ]" />

        <!-- Header y botón -->
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Promociones</h1>
                <p class="text-gray-500 dark:text-gray-400 mt-1">Gestiona tu promociones de productos</p>
            </div>
            <UButton @click="openModal()" icon="i-heroicons-plus" color="primary" variant="solid"
                label="Nueva Promoción" />
        </div>

        <!-- Filtros y búsqueda -->
        <div class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <UInput v-model="searchQuery" placeholder="Buscar promociones..." icon="i-heroicons-magnifying-glass" />
            <USelect v-model="sortField" :options="sortOptions" placeholder="Ordenar por" />
            <USelect v-model="sortDirection" :options="[
                { value: 'asc', label: 'Ascendente' },
                { value: 'desc', label: 'Descendente' }
            ]" />
            <USelect v-model="statusFilter" :options="[
                { value: 'all', label: 'Todos los estados' },
                { value: 'active', label: 'Solo activas' },
                { value: 'inactive', label: 'Solo inactivas' },
                { value: 'upcoming', label: 'Próximas' },
                { value: 'expired', label: 'Expiradas' }
            ]" />
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-12">
            <UIcon name="i-heroicons-arrow-path-20-solid" class="animate-spin h-12 w-12 text-primary-500 mb-4" />
            <p class="text-gray-600 dark:text-gray-400">Cargando productos...</p>
        </div>

        <!-- Error State -->
        <UAlert v-else-if="error" icon="i-heroicons-exclamation-triangle" color="red" variant="outline" :title="error"
            class="mb-4" />

        <!-- Empty State -->
        <UCard v-else-if="filteredPromotions.length === 0" class="text-center">
            <template #header>
                <div
                    class="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <UIcon name="i-heroicons-tag" class="text-3xl text-gray-400 dark:text-gray-500" />
                </div>
                <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-2">No se encontraron promociones.</h3>
                <p class="text-gray-500 dark:text-gray-400 mb-4">Comienza agregando tu primera promoción.</p>
            </template>

            <UButton @click="openModal()" icon="i-heroicons-plus" color="primary" variant="solid"
                label="Agregar Promoción" />
        </UCard>

        <!-- Tabla con Nuxt UI -->
        <div v-else>
            <UTable :rows="paginatedPromotions" :columns="columns" :loading="loading" class="w-full"
                :sort="{ column: sortField, direction: sortDirection }" @sort="onSort">
                <!-- Custom cell for Product -->
                <template #product-data="{ row }">
                    <div class="flex items-center">
                        <UAvatar :src="row.product.imageUrl || 'https://via.placeholder.com/40'" size="sm"
                            class="mr-3" />
                        <div>
                            <div class="font-medium">{{ row.product.name }}</div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">
                                {{ row.product.category?.name }}
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Custom cell for Discount -->
                <template #discount-data="{ row }">
                    <UBadge :label="row.isPercentage ? `${row.discount}%` : `S/. ${row.discount}`"
                        :color="row.isPercentage ? 'blue' : 'green'" variant="subtle" />
                </template>

                <!-- Custom cell for Date Range -->
                <template #dateRange-data="{ row }">
                    <div>
                        <div class="text-sm">{{ formatDate(row.startDate) }}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">
                            al {{ formatDate(row.endDate) }}
                        </div>
                    </div>
                </template>

                <!-- Custom cell for Status -->
                <template #status-data="{ row }">
                    <div>
                        <UBadge :label="isPromoActive(row) ? 'Activa' : 'Inactiva'"
                            :color="isPromoActive(row) ? 'green' : 'red'" variant="subtle" />
                        <div v-if="!isPromoActive(row)" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {{ getPromoStatusText(row) }}
                        </div>
                    </div>
                </template>

                <!-- Custom cell for Actions -->
                <template #actions-data="{ row }">
                    <div class="flex justify-end space-x-2">
                        <UButton @click="openEditModal(row)" icon="i-heroicons-pencil" color="gray" variant="ghost" />
                        <UButton @click="confirmDelete(row)" icon="i-heroicons-trash" color="red" variant="ghost" />
                    </div>
                </template>
            </UTable>

            <!-- Paginación -->
            <div class="flex justify-between items-center px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
                <div class="text-sm text-gray-500 dark:text-gray-400">
                    Mostrando {{ paginationInfo.from }} a {{ paginationInfo.to }} de {{ paginationInfo.total }}
                    promociones
                </div>
                <UPagination v-model="paginationState.page" :page-count="paginationState.perPage"
                    :total="filteredPromotions.length" />
            </div>
        </div>

        <!-- Modal para crear/editar promoción -->
        <UModal v-model="showModal">
            <UCard>
                <template #header>
                    <h2 class="text-xl font-bold">{{ editing ? 'Editar Promoción' : 'Nueva Promoción' }}</h2>
                </template>
                <div class="p-6">
                    <form @submit.prevent="submitPromotion" class="space-y-4">
                        <UFormGroup label="Producto" required>
                            <USelect v-model="form.productId"
                                :options="products.map(p => ({ value: p.id, label: `${p.name} (S/. ${p.price})` }))"
                                placeholder="Selecciona un producto" required />
                        </UFormGroup>

                        <UFormGroup label="Título (opcional)">
                            <UInput v-model="form.title" />
                        </UFormGroup>

                        <div class="grid grid-cols-2 gap-4">
                            <UFormGroup label="Descuento" required>
                                <UInput v-model="form.discount" type="number" min="0" required />
                            </UFormGroup>

                            <UFormGroup label="¿Es porcentaje?">
                                <UToggle v-model="form.isPercentage" />
                            </UFormGroup>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <UFormGroup label="Fecha inicio" required>
                                <UInput v-model="form.startDate" type="date" required />
                            </UFormGroup>

                            <UFormGroup label="Fecha fin" required>
                                <UInput v-model="form.endDate" type="date" required />
                            </UFormGroup>
                        </div>

                        <UFormGroup label="Descripción (opcional)">
                            <UTextarea v-model="form.description" rows="3" />
                        </UFormGroup>

                        <div class="flex justify-end space-x-3 pt-4">
                            <UButton type="button" @click="showModal = false" color="gray" variant="ghost"
                                label="Cancelar" />
                            <UButton type="submit" color="primary" variant="solid"
                                :label="editing ? 'Actualizar' : 'Crear'" />
                        </div>
                    </form>
                </div>
            </UCard>
        </UModal>

        <!-- Modal de confirmación para eliminar -->
        <UModal v-model="showDeleteDialog">
            <UCard>
                <template #header>
                    <h3 class="text-lg font-bold">Confirmar Eliminación</h3>
                </template>
                <p>¿Estás seguro de que deseas eliminar esta promoción?</p>
                <template #footer>
                    <div class="flex justify-end space-x-3">
                        <UButton @click="showDeleteDialog = false" color="gray" variant="ghost" label="Cancelar" />
                        <UButton @click="deletePromotion" color="red" variant="solid" label="Eliminar" />
                    </div>
                </template>
            </UCard>
        </UModal>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { format, isAfter, isBefore, parseISO } from 'date-fns';

const { $toast } = useNuxtApp();

// Estado reactivo
const promotions = ref([]);
const products = ref([]);
const loading = ref(true);
const showModal = ref(false);
const showDeleteDialog = ref(false);
const editing = ref(false);
const currentPromoId = ref(null);

// Filtros y ordenamiento
const searchQuery = ref('');
const sortField = ref('product.name');
const sortDirection = ref('asc');
const statusFilter = ref('all');

const sortOptions = [
    { value: 'product.name', label: 'Nombre del producto' },
    { value: 'product.price', label: 'Precio del producto' },
    { value: 'discount', label: 'Descuento' },
    { value: 'startDate', label: 'Fecha de inicio' },
    { value: 'endDate', label: 'Fecha de fin' }
];

// Paginación
const pagination = reactive({
    page: 1,
    perPage: 10
});

const form = reactive({
    productId: null,
    title: 'Oferta Especial',
    description: '',
    discount: 0,
    isPercentage: true,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: ''
});

// Columnas para la tabla
const columns = [
    {
        key: 'product',
        label: 'Producto',
        sortable: true
    },
    {
        key: 'discount',
        label: 'Descuento',
        sortable: true
    },
    {
        key: 'dateRange',
        label: 'Vigencia',
        sortable: false // Manejamos esto manualmente
    },
    {
        key: 'status',
        label: 'Estado',
        sortable: false
    },
    {
        key: 'actions',
        label: 'Acciones',
        sortable: false
    }
];

// Configuración de página (Nuxt.js)
definePageMeta({
    middleware: ['auth'],
    layout: 'dashboard'
});

// Carga inicial de datos
const loadInitialData = async () => {
    try {
        loading.value = true;
        // Cargar promociones y productos
        const [promotionsRes, productsRes] = await Promise.all([
            $fetch('/api/v1/promotions').catch(() => []),
            $fetch('/api/v1/product').catch(() => [])
        ]);

        promotions.value = promotionsRes || [];
        products.value = productsRes || [];
    } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        $toast.error("Error al cargar datos");
    } finally {
        loading.value = false;
    }
};

// Usar useAsyncData para SSR (Nuxt.js)
onMounted(loadInitialData);


// Estado de paginación (modificado para evitar duplicación)
const paginationState = reactive({
    page: 1,
    perPage: 10
});

// Computed properties
const filteredPromotions = computed(() => {
    let result = [...promotions.value];

    // Filtrar por búsqueda
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(promo =>
            (promo.product?.name?.toLowerCase().includes(query)) ||
            (promo.title?.toLowerCase().includes(query)) ||
            (promo.description?.toLowerCase().includes(query))
        );
    }

    // Filtrar por estado
    if (statusFilter.value !== 'all') {
        const today = new Date();
        result = result.filter(promo => {
            const startDate = new Date(promo.startDate);
            const endDate = new Date(promo.endDate);

            switch (statusFilter.value) {
                case 'active':
                    return isAfter(today, startDate) && isBefore(today, endDate);
                case 'inactive':
                    return !(isAfter(today, startDate) && isBefore(today, endDate));
                case 'upcoming':
                    return isBefore(today, startDate);
                case 'expired':
                    return isAfter(today, endDate);
                default:
                    return true;
            }
        });
    }

    // Ordenar
    if (sortField.value) {
        result.sort((a, b) => {
            let valueA, valueB;

            // Manejar campos anidados
            if (sortField.value.includes('.')) {
                const [parent, child] = sortField.value.split('.');
                valueA = a[parent]?.[child];
                valueB = b[parent]?.[child];
            } else {
                valueA = a[sortField.value];
                valueB = b[sortField.value];
            }

            // Manejar fechas
            if (sortField.value.includes('Date')) {
                valueA = new Date(valueA).getTime();
                valueB = new Date(valueB).getTime();
            }

            // Manejar números
            if (typeof valueA === 'number' || sortField.value === 'discount') {
                valueA = Number(valueA);
                valueB = Number(valueB);
            }

            // Manejar strings
            if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }

            if (valueA < valueB) {
                return sortDirection.value === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return sortDirection.value === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    return result;
});

const paginatedPromotions = computed(() => {
    const start = (paginationState.page - 1) * paginationState.perPage;
    const end = start + paginationState.perPage;
    return filteredPromotions.value.slice(start, end);
});

const paginationInfo = computed(() => {
    const total = filteredPromotions.value.length;
    const from = (paginationState.page - 1) * paginationState.perPage + 1;
    const to = Math.min(paginationState.page * paginationState.perPage, total);

    return {
        total,
        from,
        to,
        lastPage: Math.ceil(total / paginationState.perPage)
    };
});

// Métodos
const openModal = () => {
    editing.value = false;
    resetForm();
    showModal.value = true;
};

const openEditModal = (promo) => {
    editing.value = true;
    currentPromoId.value = promo.id;
    Object.assign(form, {
        productId: promo.productId,
        title: promo.title,
        description: promo.description,
        discount: promo.discount,
        isPercentage: promo.isPercentage,
        startDate: format(new Date(promo.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(promo.endDate), 'yyyy-MM-dd')
    });
    showModal.value = true;
};

const resetForm = () => {
    Object.assign(form, {
        productId: null,
        title: 'Oferta Especial',
        description: '',
        discount: 0,
        isPercentage: true,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: ''
    });
};

const onSort = (column) => {
    sortField.value = column.column;
    sortDirection.value = column.direction;
};

// Función para verificar si una promoción está activa
const isPromoActive = (promo) => {
    const today = new Date();
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);

    return isAfter(today, startDate) && isBefore(today, endDate);
};

// Función para obtener texto de estado detallado
const getPromoStatusText = (promo) => {
    const today = new Date();
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);

    if (isBefore(today, startDate)) {
        return `Inicia en ${formatDate(promo.startDate)}`;
    } else if (isAfter(today, endDate)) {
        return `Finalizó el ${formatDate(promo.endDate)}`;
    }
    return '';
};

const submitPromotion = async () => {
    try {
        const url = editing.value
            ? `/api/v1/promotions/${currentPromoId.value}`
            : '/api/v1/promotions';

        const method = editing.value ? 'PUT' : 'POST';
        const response = await $fetch(url, {
            method,
            body: {
                ...form,
                discount: Number(form.discount)
            }
        });

        showModal.value = false;
        await loadInitialData(); // Recargar datos
        $toast.success(`Promoción ${editing.value ? 'actualizada' : 'creada'} con éxito`);
    } catch (error) {
        $toast.error("Error al guardar la promoción");
        console.error(error);
    }
};

const confirmDelete = (promo) => {
    currentPromoId.value = promo.id;
    showDeleteDialog.value = true;
};

const deletePromotion = async () => {
    try {
        await $fetch(`/api/v1/promotions/${currentPromoId.value}`, {
            method: 'DELETE'
        });
        await loadInitialData();
        $toast.success("Promoción eliminada con éxito");
    } catch (error) {
        $toast.error("Error al eliminar la promoción");
        console.error(error);
    } finally {
        showDeleteDialog.value = false;
    }
};

const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
};
</script>