const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const ordersPath = path.join(__dirname, '../data/orders.json');
const productsPath = path.join(__dirname, '../data/products.json');

// GET /admin/orders
router.get('/', async (req, res) => {
    try {
        const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

        // Thêm thông tin chi tiết sản phẩm vào mỗi đơn hàng
        const ordersWithDetails = ordersData.orders.map(order => {
            const itemsWithDetails = order.orderItems.map(item => {
                const product = productsData.products.find(p => p.id === item.productId);
                return {
                    ...item,
                    productName: product ? product.name : 'Sản phẩm không tồn tại',
                    currentPrice: product ? product.price : 0
                };
            });

            return {
                ...order,
                orderItems: itemsWithDetails
            };
        });

        res.render('orders', { 
            orders: ordersWithDetails,
            title: 'Quản lý đơn hàng'
        });
    } catch (error) {
        res.status(500).render('error', { error: 'Không thể đọc dữ liệu đơn hàng' });
    }
});

module.exports = router;