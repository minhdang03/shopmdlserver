const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const categoriesPath = path.join(__dirname, '..', 'data', 'categories.json');
const productsPath = path.join(__dirname, '..', 'data', 'products.json');

// Đảm bảo file categories.json tồn tại
if (!fs.existsSync(categoriesPath)) {
    fs.writeFileSync(categoriesPath, JSON.stringify({ categories: [] }, null, 2));
}

// GET /admin/categories
router.get('/', (req, res) => {
    try {
        const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        
        // Thêm số lượng sản phẩm vào mỗi danh mục
        const categoriesWithCount = categoriesData.categories.map(category => {
            const productCount = productsData.products.filter(p => p.category === category.slug).length;
            return { ...category, productCount };
        });

        res.render('categories', { 
            categories: categoriesWithCount,
            title: 'Quản lý danh mục' 
        });
    } catch (error) {
        console.error('Lỗi đọc categories:', error);
        res.status(500).render('error', { 
            error: 'Không thể đọc dữ liệu danh mục',
            title: 'Lỗi'
        });
    }
});

// POST /admin/categories
router.post('/', (req, res) => {
    try {
        const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        
        // Tìm ID lớn nhất hiện tại
        const maxId = Math.max(...categories.categories.map(c => parseInt(c.id) || 0));
        
        // Tạo ID mới = maxId + 1
        const newId = (maxId + 1).toString();
        
        const newCategory = {
            id: newId, // ID mới gọn hơn
            name: req.body.name,
            slug: req.body.name.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, ''),
            createdAt: new Date().toISOString()
        };
        
        categories.categories.push(newCategory);
        fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2));
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ error: 'Không thể tạo danh mục mới' });
    }
});

// PUT /admin/categories/:id
router.put('/:id', (req, res) => {
    try {
        const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        const index = categories.categories.findIndex(c => c.id === req.params.id);
        
        if (index !== -1) {
            categories.categories[index] = {
                ...categories.categories[index],
                name: req.body.name,
                slug: categories.categories[index].id, // Giữ nguyên slug là ID
                updatedAt: new Date().toISOString()
            };
            
            fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2));
            res.json(categories.categories[index]);
        } else {
            res.status(404).json({ error: 'Không tìm thấy danh mục' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Không thể cập nhật danh mục' });
    }
});

// DELETE /admin/categories/:id
router.delete('/:id', async (req, res) => {
    try {
        const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        
        // Tìm category cần xóa
        const categoryToDelete = categories.categories.find(c => c.id === req.params.id);
        if (!categoryToDelete) {
            return res.status(404).json({ error: 'Không tìm thấy danh mục' });
        }

        // Kiểm tra xem có sản phẩm nào thuộc danh mục này không
        const productsInCategory = products.products.filter(p => p.category === categoryToDelete.slug);
        if (productsInCategory.length > 0) {
            // Cập nhật các sản phẩm sang danh mục mặc định
            products.products = products.products.map(p => {
                if (p.category === categoryToDelete.slug) {
                    return { ...p, category: 'uncategorized' };
                }
                return p;
            });
            fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
        }

        // Xóa danh mục
        categories.categories = categories.categories.filter(c => c.id !== req.params.id);
        fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2));
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Không thể xóa danh mục' });
    }
});

module.exports = router;