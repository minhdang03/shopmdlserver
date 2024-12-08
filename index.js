const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const adminRoutes = require('./routes/admin');
const app = express();
const PORT = 3002;

// Đặt các middleware cơ bản TRƯỚC
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));

// Cấu hình EJS và layouts
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/admin-layout');
app.set('views', path.join(__dirname, 'views'));

// Đặt route categories và products ở đây
app.use('/admin/products', require('./routes/products'));
app.use('/admin/categories', require('./routes/categories'));

// Đăng ký các routes
app.use('/admin', adminRoutes);

// Middleware logging
app.use((req, res, next) => {
    console.log('Request URL:', req.url);
    next();
});

// Đường dẫn đến files
const productsPath = path.join(__dirname, 'data', 'products.json');
const ordersPath = path.join(__dirname, 'data', 'orders.json');
const categoriesPath = path.join(__dirname, 'data', 'categories.json');

// Kiểm tra và tạo files nếu chưa tồn tại
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

if (!fs.existsSync(productsPath)) {
    fs.writeFileSync(productsPath, JSON.stringify({ products: [] }, null, 2));
}

if (!fs.existsSync(ordersPath)) {
    fs.writeFileSync(ordersPath, JSON.stringify({ orders: [] }, null, 2));
}

if (!fs.existsSync(categoriesPath)) {
    fs.writeFileSync(categoriesPath, JSON.stringify({ categories: [] }, null, 2));
}

// Đặt route này TRƯỚC tất cả các middleware khác
app.get('/admin/dashboard', (req, res) => {
    try {
        // Đọc file orders.json
        const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
        
        // Đảm bảo orders là một mảng
        const orders = ordersData.orders || [];
        
        // Log để debug
        console.log('Orders data:', orders);
        
        // Render với dữ liệu đã kiểm tra và đặt trong object locals
        res.locals.orders = orders;
        res.render('admin-dashboard', {
            title: 'Admin Dashboard'
        });
    } catch (error) {
        console.error('Lỗi đọc dữ liệu:', error);
        res.locals.orders = [];
        res.render('admin-dashboard', {
            title: 'Admin Dashboard'
        });
    }
});

// Trang quản lý sản phẩm
app.get('/admin/products', (req, res) => {
    try {
        const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        res.render('products', { products: products.products });
    } catch (error) {
        res.status(500).render('error', { error: 'Không thể đọc dữ liệu sản phẩm' });
    }
});

// Trang thêm sản phẩm mới
app.get('/admin/products/new', (req, res) => {
    res.render('product-new');
});

// Xử lý thêm sản phẩm
app.post('/admin/products', (req, res) => {
    try {
        const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        
        const newProduct = {
            id: products.products.length + 1,
            name: req.body.name || '',
            price: req.body.price ? parseInt(req.body.price) : 0,
            description: req.body.description || '',
            image: req.body.image || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        products.products.push(newProduct);
        fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
        
        // Chỉ trả về status code 200 thay vì JSON response
        res.sendStatus(200);
        
    } catch (error) {
        console.error('Lỗi:', error);
        res.status(500).send('Có lỗi xảy ra khi thêm sản phẩm');
    }
});

// Trang chỉnh sửa sản phẩm
app.get('/admin/products/:id/edit', (req, res) => {
    try {
        const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        const product = products.products.find(p => p.id === parseInt(req.params.id));
        
        if (product) {
            res.render('product-edit', { product });
        } else {
            res.status(404).render('error', { error: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        res.status(500).render('error', { error: 'Không thể đọc dữ liệu sản phẩm' });
    }
});

// Xử lý cập nhật sản phẩm
app.put('/admin/products/:id', (req, res) => {
    try {
        const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        const index = products.products.findIndex(p => p.id === parseInt(req.params.id));
        
        if (index !== -1) {
            products.products[index] = {
                ...products.products[index],
                name: req.body.name,
                price: parseInt(req.body.price),
                description: req.body.description,
                image: req.body.image,
                updatedAt: new Date().toISOString()
            };
            
            fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
            res.json(products.products[index]);
        } else {
            res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Không thể cập nhật sản phẩm' });
    }
});

// Xử lý xóa sản phẩm
app.delete('/admin/products/:id', (req, res) => {
    try {
        const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        const filteredProducts = products.products.filter(p => p.id !== parseInt(req.params.id));
        
        fs.writeFileSync(productsPath, JSON.stringify({ products: filteredProducts }, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Không thể xóa sản phẩm' });
    }
});

// API endpoints cho frontend
app.get('/api/products', (req, res) => {
    try {
        const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        const category_id = req.query.category_id;

        // Nếu có category_id, lọc sản phẩm theo category
        if (category_id) {
            const filteredProducts = products.products.filter(product => 
                product.category_id === category_id
            );
            res.json({ products: filteredProducts });
        } else {
            // Nếu không có category_id, trả về tất cả sản phẩm
            res.json(products);
        }
    } catch (error) {
        console.error('Lỗi khi đọc products:', error);
        res.status(500).json({ error: 'Không thể đọc dữ liệu sản phẩm' });
    }
});

// API lấy danh sách đơn hàng
app.get('/api/orders', (req, res) => {
    try {
        const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Không thể đọc dữ liệu đơn hàng' });
    }
});

// API tạo đơn hàng mới
app.post('/api/orders', (req, res) => {
    try {
        const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
        const newOrder = {
            id: `order_${Date.now()}`,
            ...req.body,
            status: "pending",
            createdAt: new Date().toISOString()
        };
        
        orders.orders.push(newOrder);
        fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
        
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ error: 'Không thể tạo đơn hàng' });
    }
});

// API cập nhật trạng thái đơn hàng
app.patch('/api/orders/:id', (req, res) => {
    try {
        const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
        const orderIndex = orders.orders.findIndex(order => order.id === req.params.id);
        
        if (orderIndex !== -1) {
            orders.orders[orderIndex] = {
                ...orders.orders[orderIndex],
                ...req.body
            };
            
            fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
            res.json(orders.orders[orderIndex]);
        } else {
            res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Không thể cập nhật đơn hàng' });
    }
});

// Thêm middleware logging trước route dashboard
app.use((req, res, next) => {
  console.log('Request path:', req.path);
  next();
});

// Middleware admin phải đặt SAU route dashboard
app.use('/admin', (req, res, next) => {
    // Tạm thời bỏ qua xác thực, sau này có thể thêm vào
    next();
});

// Sửa lại route quản lý đơn hàng
app.get('/admin/orders', async (req, res) => {
    try {
        const ordersData = fs.readFileSync(ordersPath, 'utf8');
        const orders = JSON.parse(ordersData);
        
        if (!orders.orders) {
            // Nếu không có mảng orders, tạo mảng rỗng
            orders.orders = [];
        }
        
        res.render('orders', { 
            orders: orders.orders,
            title: 'Quản lý đơn hàng'
        });
    } catch (error) {
        console.error('Lỗi khi đọc file orders:', error);
        res.status(500).render('error', { 
            error: 'Không thể đọc dữ liệu đơn hàng',
            title: 'Lỗi'
        });
    }
});

// API lấy chi tiết đơn hàng
app.get('/api/orders/:id', (req, res) => {
    try {
        const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
        const order = orders.orders.find(o => o.id === req.params.id);
        
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Không thể đọc dữ liệu đơn hàng' });
    }
});

// Thêm middleware ghi log
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Trang quản lý danh mục
app.get('/admin/categories', (req, res) => {
    try {
        const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        
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

app.post('/admin/categories', (req, res) => {
    try {
        const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        const newCategory = {
            id: Date.now().toString(),
            name: req.body.name,
            slug: req.body.slug || req.body.name.toLowerCase()
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

app.put('/admin/categories/:id', (req, res) => {
    try {
        const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        const index = categories.categories.findIndex(c => c.id === req.params.id);
        
        if (index !== -1) {
            categories.categories[index] = {
                ...categories.categories[index],
                name: req.body.name,
                slug: req.body.slug,
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

app.delete('/admin/categories/:id', (req, res) => {
    try {
        const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        
        const categoryToDelete = categories.categories.find(c => c.id === req.params.id);
        if (!categoryToDelete) {
            return res.status(404).json({ error: 'Không tìm thấy danh mục' });
        }

        const productsInCategory = products.products.filter(p => p.category === categoryToDelete.slug);
        if (productsInCategory.length > 0) {
            products.products = products.products.map(p => {
                if (p.category === categoryToDelete.slug) {
                    return { ...p, category: 'uncategorized' };
                }
                return p;
            });
            fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
        }

        categories.categories = categories.categories.filter(c => c.id !== req.params.id);
        fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2));
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Không thể xóa danh mục' });
    }
});

// API endpoints cho categories
app.get('/api/categories', (req, res) => {
    try {
        const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        res.json(categoriesData);
    } catch (error) {
        console.error('Lỗi khi đọc categories:', error);
        res.status(500).json({ error: 'Không thể đọc dữ liệu danh mục' });
    }
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});