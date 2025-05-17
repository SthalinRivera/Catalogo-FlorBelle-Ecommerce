import * as productController from "../controller/product";
import * as favoritesController from "../controller/favorites";
import * as userController from "../controller/user";
import * as categoryController from "../controller/category";
import * as roleController from "../controller/role";
import * as salesController from "../controller/sales";
import * as orderController from "../controller/order";
import * as promotionController from "../controller/promotion";

import * as dashboardController from "../controller/dashboard";
import * as visitController from "../controller/visit";
import { createRouter, defineEventHandler } from 'h3';
const router = createRouter();

// 📦 PRODUCTOS
router.post('/addProduct', defineEventHandler(productController.addProduct));
router.get('/product/paginated', defineEventHandler(productController.paginatedProducts)); // Nueva ruta

router.get('/product', defineEventHandler(productController.allProduct));
router.get('/product/:id', defineEventHandler(productController.productById));
router.put('/updateProduct/:id', defineEventHandler(productController.updateProduct));
router.delete('/deleteProduct/:id', defineEventHandler(productController.deleteProduct));
router.get('/productByCategorySlug/:slug', defineEventHandler(productController.productBySlug));
router.get('/productByCategoryId/:id', defineEventHandler(productController.productByCategoryId));
router.get('/productByCategoryIdCount/:id', defineEventHandler(categoryController.productByCategoryIdCount));


// 📦 ÓRDENES
router.get('/orders/', defineEventHandler(orderController.getAllOrders));
router.post('/addOrder', defineEventHandler(orderController.addOrder));
router.post('/addWhatsAppOrder', defineEventHandler(orderController.addWhatsAppOrder));
router.get('/orders/:id', defineEventHandler(orderController.getOrderById));
router.get('/ordersByUser/:id', defineEventHandler(orderController.getOrdersByUser));
// Obtener estadísticas de órdenes
router.get('/orders/stats', defineEventHandler(orderController.getOrderStats));

// ❤️ FAVORITOS
router.post('/addlike', defineEventHandler(favoritesController.addLike));
router.get('/allfavorites', defineEventHandler(favoritesController.allFavorites));


// 🗂️ CATEGORÍAS
router.get('/category', defineEventHandler(categoryController.allCategory));
router.get('/categoryById/:id', defineEventHandler(categoryController.categoryById));
router.post('/addCategory', defineEventHandler(categoryController.addCategory));
router.put('/updateCategory/:id', defineEventHandler(categoryController.updateCategory));
router.delete('/deleteCategory/:id', defineEventHandler(categoryController.deleteCategory));
router.get('/personalizedCategory', defineEventHandler(categoryController.personalizedCategory));

// 👤 USUARIOS
router.get('/allUser', defineEventHandler(userController.allUser));
router.get('/userById/:id', defineEventHandler(userController.userById));
router.post('/addUser', defineEventHandler(userController.addUser));
router.put('/updateUser/:id', defineEventHandler(userController.updateUser));
router.put('/updateUserAvatar/:id', defineEventHandler(userController.updateUserAvatar));
router.put('/updateUserPhone/:id', defineEventHandler(userController.updateUserPhone));
router.delete('/userDelete/:id', defineEventHandler(userController.deleteUser));


// 🧩 ROLES
router.get('/roles', defineEventHandler(roleController.allRole));


// 💥 PROMOCIONES
router.get('/promotions', defineEventHandler(promotionController.allActivePromotions));
router.get('/promotions/:id', defineEventHandler(promotionController.promotionById));
router.post('/promotions', defineEventHandler(promotionController.addPromotion));
router.put('/promotions/:id', defineEventHandler(promotionController.updatePromotion));
router.delete('/promotions/:id', defineEventHandler(promotionController.deletePromotion));
router.get('/products/:id/promotions', defineEventHandler(promotionController.promotionsByProductId));
router.get('/promotionactive', defineEventHandler(promotionController.allActivePromotions2));

// 👤 User Routes (admin)
router.get('/users/clients', defineEventHandler(userController.getClients));

// 📦 Order Routes (admin)
router.patch('/orders/:id/status', defineEventHandler(orderController.updateOrderStatus));
router.get('/salesReport', defineEventHandler(salesController.salesReport));

router.get('/dashboardReport', defineEventHandler(dashboardController.dashboardReport));
router.get('/getVisits', defineEventHandler(visitController.getVisits));
router.post('/addVisit', defineEventHandler(visitController.addVisit));
router.get('/getVisitStats', defineEventHandler(visitController.getVisitStats));

export default useBase("/api/v1", router.handler);
