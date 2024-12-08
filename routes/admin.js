const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Sửa lại đường dẫn tới file
const productsPath = path.join(__dirname, '../data/products.json');
const ordersPath = path.join(__dirname, '../data/orders.json');

// Route cho /admin/
router.get('/', (req, res) => {
    res.render('admin-dashboard', {
        title: 'Trang quản trị'
    });
});

// Route cho /admin/dashboard (để đảm bảo cả 2 đường dẫn đều hoạt động)
router.get('/dashboard', (req, res) => {
    res.render('admin-dashboard', {
        title: 'Trang quản trị'
    });
});

// Route products
router.get('/products', (req, res) => {
    try {
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        console.log('Categories:', productsData.categories); // Thêm log để debug
        res.render('products', {
            title: 'Quản lý sản phẩm',
            products: productsData.products || [],
            categories: productsData.categories || []
        });
    } catch (error) {
        console.error('Error:', error); // Thêm log để debug
        res.status(500).render('error', {
            title: 'Lỗi',
            error: 'Không thể đọc dữ liệu sản phẩm'
        });
    }
});

// Route orders
router.get('/orders', (req, res) => {
    try {
        const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
        res.render('orders', {
            title: 'Quản lý đơn hàng',
            orders: ordersData.orders || []
        });
    } catch (error) {
        res.status(500).render('error', {
            title: 'Lỗi',
            error: 'Không thể đọc dữ liệu đơn hàng'
        });
    }
});

// Route categories
router.get('/categories', (req, res) => {
    try {
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        res.render('categories', {
            title: 'Quản lý danh mục',
            categories: productsData.categories || []
        });
    } catch (error) {
        res.status(500).render('error', {
            title: 'Lỗi',
            error: 'Không thể đọc dữ liệu danh mục'
        });
    }
});

// API thêm danh mục mới
router.post('/categories', (req, res) => {
    try {
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        const newCategory = {
            id: (productsData.categories || []).length + 1,
            name: req.body.name,
            slug: req.body.slug
        };
        
        if (!productsData.categories) {
            productsData.categories = [];
        }
        
        productsData.categories.push(newCategory);
        fs.writeFileSync(productsPath, JSON.stringify(productsData, null, 2));
        
        res.redirect('/admin/categories');
    } catch (error) {
        res.status(500).render('error', {
            title: 'Lỗi',
            error: 'Không thể thêm danh mục'
        });
    }
});

// API xóa danh mục
router.delete('/categories/:id', (req, res) => {
    try {
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        const categoryId = parseInt(req.params.id);
        
        productsData.categories = productsData.categories.filter(c => c.id !== categoryId);
        fs.writeFileSync(productsPath, JSON.stringify(productsData, null, 2));
        
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: 'Không thể xóa danh mục' });
    }
});

// ... các route admin khác

module.exports = router;
