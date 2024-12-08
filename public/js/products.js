// Hiển thị modal thêm sản phẩm
function showAddModal() {
    document.getElementById('addModal').style.display = 'block';
}

// Hiển thị modal sửa sản phẩm
function showEditModal(productJson) {
    const product = JSON.parse(productJson);
    const form = document.getElementById('editForm');
    
    form.id.value = product.id;
    form.name.value = product.name;
    form.price.value = product.price;
    form.description.value = product.description;
    form.image.value = product.image;
    
    // Đảm bảo chọn đúng category dựa trên ID
    const categorySelect = form.querySelector('select[name="category"]');
    if (categorySelect) {
        categorySelect.value = product.category;
    }
    
    if (product.image) {
        const previewImg = document.getElementById('edit-preview-image');
        previewImg.src = product.image;
        previewImg.style.display = 'block';
    }
    
    document.getElementById('editModal').style.display = 'block';
}

// Ẩn modal
function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Xử lý xóa sản phẩm
async function deleteProduct(productId) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
        try {
            const response = await fetch('/products/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: productId })
            });
            
            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Lỗi khi xóa:', error);
        }
    }
}

// Xử lý cập nhật sản phẩm
async function updateProduct(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch(`/admin/products/update/${data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            location.reload();
        } else {
            console.error('Lỗi cập nhật:', await response.text());
        }
    } catch (error) {
        console.error('Lỗi:', error);
    }
}

// Xử lý thêm sản phẩm
async function addProduct(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = {};
    
    // Chuyển FormData thành JSON
    new FormData(form).forEach((value, key) => {
        formData[key] = value;
    });
    
    try {
        const response = await fetch('/admin/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            hideModal('addModal');
            form.reset();
            window.location.reload();
        }
    } catch (error) {
        console.error('Lỗi:', error);
    }
}