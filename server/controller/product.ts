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


// export const productById = async (event: H3Event) => {
//   const request = getRouterParams(event);
//   if (!request.id) {
//     throw createError({
//       statusCode: 400,
//       name: "Product invalid",
//       message: "Product ID is required",
//     });
//   }

//   const product = await prisma.product.findFirst({
//     where: {
//       id: +request.id,
//     },
//     include: {
//       category: {
//         select: {
//           name: true,
//         },
//       },
//     },
//   });

//   if (!product) {
//     throw createError({
//       statusCode: 404,
//       name: "Product not found",
//       message: "No product found with the given ID",
//     });
//   }

//   return product;
// };
// export const productById = async (event: H3Event) => {
//   const request = getRouterParams(event);
//   if (!request.id) {
//     throw createError({
//       statusCode: 400,
//       name: "Product invalid",
//       message: "Product ID is required",
//     });
//   }

//   const now = new Date();
//   const product = await prisma.product.findUnique({
//     where: { id: +request.id },
//     include: {
//       category: { select: { name: true } },
//       promotions: {
//         where: {
//           startDate: { lte: now },
//           endDate: { gte: now }
//         },
//         orderBy: { discount: 'desc' },
//         take: 1
//       }
//     },
//   });

//   if (!product) {
//     throw createError({
//       statusCode: 404,
//       name: "Product not found",
//       message: "No product found with the given ID",
//     });
//   }

//   // Calcular precio con descuento
//   const currentPrice = product.promotions.length > 0
//     ? calculateDiscountedPrice(product.price, product.promotions[0])
//     : product.price;

//   return {
//     ...product,
//     currentPrice,
//     originalPrice: product.price,
//     hasPromotion: product.promotions.length > 0
//   };
// };
export const productById = async (event: H3Event) => {
  const { id } = getRouterParams(event);
  const now = new Date();

  // 1. Obtener el producto con promociones activas
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: {
      category: true,
      promotions: {
        where: {
          startDate: { lte: now },
          endDate: { gte: now }
        },
        orderBy: { discount: 'desc' }
      }
    }
  });

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: "Producto no encontrado"
    });
  }

  // 2. Convertir precios a números (evitar strings como "23")
  const price = parseFloat(product.price.toString()); // Asegura que sea número
  const hasPromotion = product.promotions.length > 0;
  const currentPromotion = hasPromotion ? product.promotions[0] : null;

  // 3. Calcular precio con descuento (manejo seguro de tipos)
  const currentPrice = currentPromotion
    ? calculateDiscountedPrice(price, currentPromotion)
    : price;

  // 4. Retornar datos consistentes (todos los precios como números)
  return {
    ...product,
    price: price,          // Número (ej: 23)
    currentPrice,          // Número (ej: 11.5 si hay 50% de descuento)
    originalPrice: price,  // Número (igual que price, pero útil para el frontend)
    hasPromotion,
    currentPromotion: currentPromotion
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

export const addProduct = async (event: H3Event): Promise<string> => {
  try {
    const body = await readBody<ProductWithPromotion>(event);

    const promo = body.promotions;

    const product = await prisma.product.create({
      data: {
        name: body.name,
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
