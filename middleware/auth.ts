const { user } = useUserSession();

export default defineNuxtRouteMiddleware((to, from) => {
  const { loggedIn } = useUserSession();


  if (!loggedIn.value) {
    return navigateTo("/login");
  }

  if (to.meta.role && to.meta.role !== user.value?.permiso) {
    throw createError({
      statusCode: 401,
      message: 'Usted no tiene permiso para acceder a esta ruta ;('
    });

  }
});
