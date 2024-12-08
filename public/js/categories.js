function showAddModal() {
    const modal = new bootstrap.Modal(document.getElementById('addModal'));
    modal.show();
}

function showEditModal(categoryData) {
    const category = JSON.parse(categoryData);
    const form = document.getElementById('editCategoryForm');
    form.id.value = category.id;
    form.name.value = category.name;
    form.slug.value = category.slug;
    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
}

async function addCategory(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch('/admin/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            location.reload();
        }
    } catch (error) {
        console.error('Lỗi:', error);
    }
}

async function updateCategory(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch(`/admin/categories/${data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            location.reload();
        }
    } catch (error) {
        console.error('Lỗi:', error);
    }
}

async function deleteCategory(id) {
    if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
        try {
            const response = await fetch(`/admin/categories/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                location.reload();
            }
        } catch (error) {
            console.error('Lỗi:', error);
        }
    }
}