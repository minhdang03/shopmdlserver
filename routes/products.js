const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../data/products.json');
const categoriesPath = path.join(__dirname, '../data/categories.json');

// GET /products
router.get('/', async (req, res) => {
    try {
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        
        // Thêm thông tin category vào mỗi sản phẩm
        const productsWithCategories = productsData.products.map(product => {
            const category = categoriesData.categories.find(c => c.slug === product.category);
            return {
                ...product,
                categoryName: category ? category.name : 'Chưa phân loại'
            };
        });

        res.render('products', { 
            products: productsWithCategories,
            categories: categoriesData.categories,
            title: 'Quản lý sản phẩm'
        });
    } catch (error) {
        res.status(500).render('error', { error: 'Không thể đọc dữ liệu sản phẩm' });
    }
});

// POST /products
router.post('/', (req, res) => {
    try {
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        
        // Kiểm tra category có tồn tại
        const categoryExists = categoriesData.categories.some(c => c.slug === req.body.category);
        
        const newProduct = {
            id: Date.now(),
            name: req.body.name,
            price: Number(req.body.price),
            description: req.body.description || '',
            image: req.body.image || '',
            category: categoryExists ? req.body.category : 'uncategorized',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        productsData.products.push(newProduct);
        fs.writeFileSync(productsPath, JSON.stringify(productsData, null, 2));
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: 'Không thể thêm sản phẩm mới' });
    }
});

// PUT /products/update/:id
router.put('/update/:id', async (req, res) => {
    try {
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        
        const productId = parseInt(req.params.id);
        const index = productsData.products.findIndex(p => p.id === productId);
        
        if (index !== -1) {
            // Log để debug
            console.log('Category từ request:', req.body.category);
            console.log('Danh mục hiện có:', categoriesData.categories.map(c => c.id));
            
            // Kiểm tra category có tồn tại
            const categoryExists = categoriesData.categories.some(c => c.id === req.body.category);
            console.log('Category tồn tại:', categoryExists);
            
            // Cập nhật sản phẩm
            productsData.products[index] = {
                ...productsData.products[index],
                name: req.body.name,
                price: Number(req.body.price),
                description: req.body.description || '',
                image: req.body.image || '',
                category: req.body.category, // Sử dụng category ID trực tiếp
                updatedAt: new Date().toISOString()
            };
            
            fs.writeFileSync(productsPath, JSON.stringify(productsData, null, 2));
            
            // Log sản phẩm sau khi cập nhật
            console.log('Sản phẩm sau khi cập nhật:', productsData.products[index]);
            
            res.json(productsData.products[index]);
        } else {
            res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        console.error('Lỗi cập nhật sản phẩm:', error);
        res.status(500).json({ error: 'Không thể cập nhật sản phẩm' });
    }
});

module.exports = router;