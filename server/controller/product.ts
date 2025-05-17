import { H3Event } from "h3";
import { PrismaClient } from "@prisma/client";
import { Product } from "~/interfaces/product";

const prisma = new PrismaClient();
type ProductWithPromotion = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: number;
  promotions?: {
    title: string;
    description: string;
    discount: number;
    isPercentage: boolean;
    startDate: string; // o Date si ya viene como objeto Date
    endDate: string;   // o Date si ya viene como objeto Date
  };
};

export const allProduct = async () => {
  return await prisma.product.findMany({
    orderBy: {
      id: "asc"
    },
    include: {
      category: true,
      promotions: true, // Aquí agregamos la inclusión de promociones
    },
  });
}


export const paginatedProducts = async (event: H3Event) => {
  const query = getQuery(event);
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 12;
  const skip = (page - 1) * limit;

  const [products, totalItems] = await Promise.all([
    prisma.product.findMany({ skip, take: limit /* ... */ }),
    prisma.product.count()
  ]);

  // Estructura de respuesta CORRECTA
  return {
    data: products,
    meta: {  // Asegúrate de incluir este objeto meta
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      itemsPerPage: limit
    }
  };
}


export const productById = async (event: H3Event) => {
  const { id } = getRouterParams(event); // puede ser slug o id
  const now = new Date();

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID o slug requerido",
    });
  }

  // Detectar si es un número (ID) o texto (slug)
  const isNumericId = !isNaN(Number(id));

  // Buscar producto por ID o por slug
  const product = await prisma.product.findFirst({
    where: isNumericId
      ? { id: Number(id) }
      : { slug: id },
    include: {
      category: true,
      promotions: {
        where: {
          startDate: { lte: now },
          endDate: { gte: now },
        },
        orderBy: { discount: "desc" },
      },
    },
  });

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: "Producto no encontrado",
    });
  }

  const price = parseFloat(product.price.toString());
  const hasPromotion = product.promotions.length > 0;
  const currentPromotion = hasPromotion ? product.promotions[0] : null;

  const currentPrice = currentPromotion
    ? calculateDiscountedPrice(price, currentPromotion)
    : price;

  return {
    ...product,
    price,
    originalPrice: price,
    currentPrice,
    hasPromotion,
    currentPromotion,
  };
};

// Función auxiliar para calcular descuentos
function calculateDiscountedPrice(price: number, promotion: any) {
  // Asegurar que el descuento sea número (evitar strings como "50")
  const discount = parseFloat(promotion.discount.toString());

  if (promotion.isPercentage) {
    return price * (1 - discount / 100); // Descuento porcentual (ej: 50% → 23 * 0.5 = 11.5)
  } else {
    return Math.max(0, price - discount); // Descuento fijo (ej: 10€ de descuento)
  }
}
export const productByCategoryId = async (event: H3Event) => {
  const request = getRouterParams(event);  // Extracts parameters from the event object

  const categoryId = Number(request.id); // Ensure categoryId is a number

  if (isNaN(categoryId)) {
    throw createError({
      statusCode: 400,
      name: "Invalid Category ID",
      message: "El ID de categoría debe ser un número válido.",
    });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId: categoryId,
      },
      include: {
        category: true,
      },
      orderBy: {
        id: "asc",
      },

    });

    return products;
  } catch (error: any) {
    console.error("Error al obtener productos por categoría:", error);
    throw createError({
      statusCode: 500,
      name: "Error Fetching Category Products",
      message: error.message,
    });
  }
};

export const productBySlug = async (event: H3Event) => {
  const { slug } = getRouterParams(event);

  if (!slug) {
    throw createError({
      statusCode: 400,
      name: "Invalid Slug",
      message: "El slug de categoría es requerido.",
    });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          orderBy: {
            id: "asc",
          },
          include: {
            category: true,
          },
        },
      },
    });

    if (!category) {
      throw createError({
        statusCode: 404,
        name: "Category Not Found",
        message: `No se encontró una categoría con el slug "${slug}"`,
      });
    }

    return category.products;
  } catch (error: any) {
    console.error("Error al obtener productos por slug:", error);
    throw createError({
      statusCode: 500,
      name: "Error Fetching Category Products",
      message: error.message,
    });
  }
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD') // elimina acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-') // reemplaza caracteres no alfanuméricos por guiones
    .replace(/^-+|-+$/g, ''); // quita guiones al inicio/final
}
export const addProduct = async (event: H3Event): Promise<string> => {
  try {
    const body = await readBody<ProductWithPromotion>(event);

    const promo = body.promotions;

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: generateSlug(body.name), // ✅ Slug generado automáticamente
        description: body.description,
        price: body.price,
        stock: body.stock,
        imageUrl: body.imageUrl,
        categoryId: body.categoryId,
        ...(promo && promo.title && promo.startDate && promo.endDate && {
          promotions: {
            create: {
              title: promo.title,
              description: promo.description ?? "",
              discount: promo.discount ?? 0,
              isPercentage: promo.isPercentage ?? false,
              startDate: new Date(promo.startDate),
              endDate: new Date(promo.endDate),
            }
          }
        })
      },
    });

    return "Producto y promoción creados con éxito.";
  } catch (error) {
    console.error("Error al crear producto:", error);
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error desconocido"
    });
  }
};


export const updateProduct = async (event: H3Event): Promise<string> => {
  try {
    const request = await readBody<ProductWithPromotion>(event);
    console.log("Request received:", JSON.stringify(request, null, 2)); // Log completo

    const requestid = getRouterParams(event);  // Extracts parameters from the event object

    const productId = Number(requestid.id); // Ensure categoryId is a number

    if (isNaN(productId)) {
      throw createError({
        statusCode: 400,
        name: "Invalid Category ID",
        message: "El ID de categoría debe ser un número válido.",
      });
    }



    const isValidDate = (date: any) => {
      const d = new Date(date);
      return d instanceof Date && !isNaN(d.getTime());
    };
    // Actualizar el producto
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: request.name,
        slug: generateSlug(request.name), // ✅ Se actualiza el slug
        description: request.description,
        price: Number(request.price),
        stock: Number(request.stock),
        imageUrl: request.imageUrl,
        categoryId: Number(request.categoryId),
        promotions: request.promotions ? {
          deleteMany: {},
          create: isValidDate(request.promotions.startDate) && isValidDate(request.promotions.endDate) ? {
            title: request.promotions.title,
            description: request.promotions.description,
            discount: Number(request.promotions.discount),
            isPercentage: Boolean(request.promotions.isPercentage),
            startDate: new Date(request.promotions.startDate),
            endDate: new Date(request.promotions.endDate),
          } : undefined
        } : undefined
      },
    });

    console.log("Product updated successfully:", updatedProduct);
    return "Producto actualizado con éxito.";
  } catch (error: any) {
    console.error("Error al actualizar producto:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      name: error.name || "Error actualizando producto",
      message: error.message || "Error desconocido",
    });
  }
};



export const deleteProduct = async (event: H3Event) => {
  try {
    const request = getRouterParams(event);
    const productId = Number(request.id);

    if (isNaN(productId)) {
      throw createError({
        statusCode: 400,
        name: "Invalid Product ID",
        message: "El ID del producto debe ser un número válido.",
      });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return { success: true, message: "Producto eliminado correctamente" };
  } catch (error: any) {
    console.error("Error al eliminar producto:", error);

    // ⚠️ Verificar si el error es una restricción de clave foránea
    if (error.code === "P2003") { // Código de error de Prisma para claves foráneas
      throw createError({
        statusCode: 400,
        name: "Foreign Key Constraint",
        message: "No se puede eliminar este producto porque está relacionado con otras entidades.",
      });
    }

    throw createError({
      statusCode: 500,
      name: "Error al eliminar",
      message: error.message,
    });
  }
};
