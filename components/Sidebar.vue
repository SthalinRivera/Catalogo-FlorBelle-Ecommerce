<template>
    <div>
        <!-- Mobile Toggle Button -->
        <button v-if="!isMobileSidebarOpen && isMobile" @click="openMobileSidebar"
            class="md:hidden fixed top-0 left-0 z-50 p-3 hover:bg-white dark:hover:bg-gray-700" aria-label="Menú">
            <i class="ri-menu-line text-gray-700 dark:text-gray-300 text-xl"></i>
        </button>

        <!-- Sidebar -->
        <div ref="sidebar" :class="[
            'fixed md:sticky top-0 z-40 h-screen transition-all duration-300 flex flex-col justify-between',
            'bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900',
            'border-r border-gray-200 dark:border-gray-700',
            'shadow-xl dark:shadow-gray-900/40',
            sidebarWidthClass,
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        ]" @mouseenter="onSidebarHover" @mouseleave="onSidebarLeave">

            <!-- Close Button (mobile only) -->
            <button v-if="isMobileSidebarOpen && isMobile" @click="closeMobileSidebar"
                class="md:hidden absolute top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 transition-all hover:scale-105">
                <Icon name="heroicons:x-mark" class="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            <!-- Header -->
            <div
                class="px-4 py-5 flex items-center justify-between backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700">
                <NuxtLink to="/dashboard" class="flex items-center space-x-3 overflow-hidden"
                    @click="closeMobileSidebar">
                    <div
                        class="w-9 h-9 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                        <Icon name="heroicons:cube" class="w-5 h-5" />
                    </div>
                    <transition name="fade">
                        <span v-if="showFullContent"
                            class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-400">
                            Dashboard
                        </span>
                    </transition>
                </NuxtLink>
                <button @click="toggleSidebarMode" v-if="!isMobile"
                    class="p-2 rounded-lg focus:outline-none hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-all"
                    aria-label="Toggle sidebar">
                    <Icon :name="isExpanded ? 'heroicons:chevron-double-left' : 'heroicons:chevron-double-right'"
                        class="w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform hover:scale-110" />
                </button>
            </div>

            <!-- User Profile -->
            <div class="px-3 mt-2 mb-4">
                <NuxtLink to="/profile" class="flex items-center p-2 rounded-xl transition-all group" :class="[
                    'hover:bg-white dark:hover:bg-gray-700/50',
                    'hover:shadow-md hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20',
                    'border border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                ]" @click="closeMobileSidebar">
                    <div class="relative shrink-0">
                        <img class="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-800 group-hover:border-indigo-300 dark:group-hover:border-indigo-500 transition-all"
                            :src="user.urlFoto || 'https://avatars.dicebear.com/api/initials/' + (user.name || 'User') + '.svg'"
                            alt="User avatar">
                        <div
                            class="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800">
                        </div>
                    </div>
                    <transition name="slide-fade">
                        <div v-if="showFullContent" class="ml-3 min-w-0">
                            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {{ user.name || 'Usuario' }}
                            </p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {{ user.email || 'usuario@ejemplo.com' }}
                            </p>
                        </div>
                    </transition>
                </NuxtLink>
            </div>

            <!-- Navigation Menu -->
            <nav class="flex-1 overflow-y-auto py-2 px-2">
                <ul class="space-y-1">
                    <li v-for="item in menuItems" :key="item.to">
                        <!-- Items without submenu -->
                        <NuxtLink v-if="!item.submenu" :to="item.to"
                            class="flex items-center p-3 rounded-xl transition-all group relative" :class="[
                                $route.path.startsWith(item.to)
                                    ? 'bg-indigo-50/80 text-indigo-600 dark:bg-gray-700/80 dark:text-indigo-400'
                                    : 'hover:bg-gray-100/70 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300',
                                'hover:shadow-sm hover:shadow-indigo-100/30 dark:hover:shadow-indigo-900/10'
                            ]" @click="closeMobileSidebar">
                            <div class="relative flex-shrink-0">
                                <Icon :name="item.icon" class="w-5 h-5 transition-transform group-hover:scale-110" />
                                <div v-if="$route.path.startsWith(item.to)"
                                    class="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-full">
                                </div>
                            </div>

                            <div class="min-w-0 flex items-center">
                                <transition name="slide-fade">
                                    <span v-if="showFullContent" class="ml-3 font-medium truncate">
                                        {{ item.title }}
                                    </span>
                                </transition>
                                <transition name="fade">
                                    <span v-if="showFullContent && item.badge"
                                        class="ml-2 px-2 py-0.5 text-xs rounded-full whitespace-nowrap flex-shrink-0"
                                        :class="[
                                            item.badge === 'new' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : '',
                                            item.badge === 'pro' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : ''
                                        ]">
                                        {{ item.badge === 'new' ? 'Nuevo' : 'Pro' }}
                                    </span>
                                </transition>
                            </div>
                        </NuxtLink>

                        <!-- Items with submenu -->
                        <div v-else>
                            <button @click="toggleSubmenu(item.to)"
                                class="flex items-center justify-between w-full p-3 rounded-xl transition-all group relative"
                                :class="[
                                    isSubmenuOpen(item.to) || $route.path.startsWith(item.to)
                                        ? 'bg-indigo-50/80 text-indigo-600 dark:bg-gray-700/80 dark:text-indigo-400'
                                        : 'hover:bg-gray-100/70 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300',
                                    'hover:shadow-sm hover:shadow-indigo-100/30 dark:hover:shadow-indigo-900/10'
                                ]">
                                <div class="flex items-center">
                                    <div class="relative flex-shrink-0">
                                        <Icon :name="item.icon"
                                            class="w-5 h-5 transition-transform group-hover:scale-110" />
                                        <div v-if="$route.path.startsWith(item.to)"
                                            class="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-full">
                                        </div>
                                    </div>
                                    <transition name="slide-fade">
                                        <span v-if="showFullContent" class="ml-3 font-medium truncate">
                                            {{ item.title }}
                                        </span>
                                    </transition>
                                </div>
                                <transition name="fade">
                                    <Icon v-if="showFullContent"
                                        :name="isSubmenuOpen(item.to) ? 'heroicons:chevron-up' : 'heroicons:chevron-down'"
                                        class="w-4 h-4 ml-2 text-gray-500 dark:text-gray-400 transition-transform duration-200"
                                        :class="{ 'transform rotate-180': isSubmenuOpen(item.to) }" />
                                </transition>
                            </button>

                            <transition name="slide-fade">
                                <div v-if="isSubmenuOpen(item.to) && showFullContent" class="pl-8 mt-1 space-y-1">
                                    <NuxtLink v-for="subItem in item.submenu" :key="subItem.to" :to="subItem.to"
                                        class="flex items-center p-2 rounded-lg transition-all group" :class="[
                                            $route.path === subItem.to
                                                ? 'bg-indigo-100/50 text-indigo-600 dark:bg-gray-700 dark:text-indigo-400'
                                                : 'hover:bg-gray-100/50 dark:hover:bg-gray-700/30 text-gray-600 dark:text-gray-300',
                                        ]" @click="closeMobileSidebar">
                                        <Icon :name="subItem.icon" class="w-4 h-4 mr-2" />
                                        <span class="text-sm">{{ subItem.title }}</span>
                                        <span v-if="subItem.badge" class="ml-auto px-1.5 py-0.5 text-xs rounded-full"
                                            :class="[
                                                subItem.badge === 'new' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : '',
                                                subItem.badge === 'pro' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : ''
                                            ]">
                                            {{ subItem.badge === 'new' ? 'Nuevo' : 'Pro' }}
                                        </span>
                                    </NuxtLink>
                                </div>
                            </transition>
                        </div>
                    </li>
                </ul>
            </nav>

            <!-- Logout Button -->
            <div class="min-w-0 px-3 mb-5">
                <button @click="salir"
                    class="flex items-center w-full p-3 rounded-xl transition-all group hover:bg-red-50/70 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400">
                    <Icon name="heroicons:arrow-left-on-rectangle"
                        class="w-5 h-5 transition-transform group-hover:scale-110 flex-shrink-0" />
                    <transition name="slide-fade">
                        <span v-if="showFullContent" class="ml-1 font-medium">
                            Salir
                        </span>
                    </transition>
                </button>
            </div>
        </div>

        <!-- Mobile Overlay -->
        <div v-if="isMobileSidebarOpen && isMobile" @click="closeMobileSidebar"
            class="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden transition-opacity duration-300"></div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const { user, clear } = useUserSession();
const route = useRoute();
const router = useRouter();

// Sidebar states
const isExpanded = ref(true);
const isHovered = ref(false);
const isMobileSidebarOpen = ref(false);
const isMobile = ref(false);
const firstLoad = ref(true);
const sidebar = ref(null);
const openSubmenus = ref([]);

// Menu items with submenus
const menuItems = [
    {
        to: '/dashboard',
        title: 'Dashboard',
        icon: 'heroicons:chart-bar'
    },
    {
        to: '/product',
        title: 'Ver Tienda',
        icon: 'heroicons:building-storefront'
    },
    {
        to: '/dashboard/order-history',
        title: 'Historial de Pedidos',
        icon: 'heroicons:shopping-bag',
        badge: 'new'
    },

    {
        to: '/dashboard/productss',
        title: 'Administrar Productos',
        icon: 'heroicons:archive-box',
        submenu: [
            {
                to: '/dashboard/products',
                title: 'Ver Productos',
                icon: 'heroicons:list-bullet'
            },
            {
                to: '/dashboard/products/categories',
                title: 'Categorías',
                icon: 'heroicons:tag'
            },

            {
                to: '/dashboard/products/promotion',
                title: 'Promociones',
                icon: 'heroicons:sparkles',
                badge: 'pro'
            }
        ]
    },
    {
        to: '/dashboard/users',
        title: 'Administrar Usuarios',
        icon: 'heroicons:users'
    },
    {
        to: '/dashboard/sales',
        title: 'Reportes de Ventas',
        icon: 'heroicons:banknotes',
        badge: 'pro'
    },
];

// Submenu functions
const toggleSubmenu = (path) => {
    if (openSubmenus.value.includes(path)) {
        openSubmenus.value = openSubmenus.value.filter(item => item !== path);
    } else {
        openSubmenus.value.push(path);
    }
};

const isSubmenuOpen = (path) => {
    return openSubmenus.value.includes(path) || menuItems.find(item => item.to === path)?.submenu?.some(subItem => route.path.startsWith(subItem.to));
};

// Computed properties
const showFullContent = computed(() => {
    return isMobile.value ? isMobileSidebarOpen.value : (isExpanded.value || isHovered.value);
});

const sidebarWidthClass = computed(() => {
    if (isMobile.value) return 'w-72';
    if (isExpanded.value) return 'w-72';
    if (isHovered.value) return 'w-56';
    return 'w-20';
});

// Sidebar interactions
const onSidebarHover = () => {
    if (!isMobile.value && !isExpanded.value) {
        isHovered.value = true;
    }
};

const onSidebarLeave = () => {
    isHovered.value = false;
};

const toggleSidebarMode = () => {
    isExpanded.value = !isExpanded.value;
    localStorage.setItem('sidebarExpanded', isExpanded.value);
};

// Mobile functions
const openMobileSidebar = () => {
    isMobileSidebarOpen.value = true;
};

const closeMobileSidebar = () => {
    isMobileSidebarOpen.value = false;
};

const toggleMobileSidebar = () => {
    isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
};

// Screen size detection
const checkScreenSize = () => {
    isMobile.value = window.innerWidth < 768;
    if (isMobile.value) {
        isMobileSidebarOpen.value = false;
    } else {
        isMobileSidebarOpen.value = true;
        if (firstLoad.value) {
            const savedPreference = localStorage.getItem('sidebarExpanded');
            if (savedPreference !== null) {
                isExpanded.value = savedPreference === 'true';
            }
            firstLoad.value = false;
        }
    }
};

// Watch for route changes
watch(() => route.path, () => {
    if (isMobile.value) {
        closeMobileSidebar();
    }
});

// Initialize component
onMounted(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    // Open submenu if current route matches any subitem
    menuItems.forEach(item => {
        if (item.submenu && item.submenu.some(subItem => route.path.startsWith(subItem.to))) {
            openSubmenus.value.push(item.to);
        }
    });
});

watch(() => route.path, (newPath) => {

    openSubmenus.value = [];
    // Reabrir submenú si corresponde
    menuItems.forEach(item => {
        if (item.submenu && item.submenu.some(subItem => newPath.startsWith(subItem.to))) {
            openSubmenus.value.push(item.to);
        }
    });
});
onBeforeUnmount(() => {
    window.removeEventListener('resize', checkScreenSize);
});

// Logout function
const salir = async () => {
    try {
        await clear();
        router.push('/');
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
};
</script>

<style scoped>
/* Animations */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-fade-enter-active {
    transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.15s ease-in;
}

.slide-fade-enter-from {
    transform: translateX(-10px);
    opacity: 0;
}

.slide-fade-leave-to {
    transform: translateX(10px);
    opacity: 0;
}

/* Scrollbar styling */
nav::-webkit-scrollbar {
    width: 4px;
}

nav::-webkit-scrollbar-track {
    background: transparent;
}

nav::-webkit-scrollbar-thumb {
    background-color: rgba(165, 180, 252, 0.5);
    border-radius: 4px;
}

.dark nav::-webkit-scrollbar-thumb {
    background-color: rgba(99, 102, 241, 0.5);
}

/* Acrylic effect */
.backdrop-blur-sm {
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}

/* iOS viewport fix */
@supports (-webkit-touch-callout: none) {
    .h-screen {
        min-height: -webkit-fill-available;
    }
}
</style>