// Xử lý đóng modal
function initializeModalHandlers() {
    window.onclick = function(event) {
        const orderDetailModal = document.getElementById('orderDetailModal');
        const editOrderModal = document.getElementById('editOrderModal');
        const addModal = document.getElementById('addModal');
        const editModal = document.getElementById('editModal');
        
        if (event.target === orderDetailModal) {
            orderDetailModal.style.display = 'none';
        }
        
        if (event.target === editOrderModal) {
            editOrderModal.style.display = 'none';
        }

        // Thêm xử lý cho modal products
        if (event.target === addModal) {
            addModal.style.display = 'none';
        }

        if (event.target === editModal) {
            editModal.style.display = 'none';
        }
    }
}

// Khởi tạo khi trang đã load
document.addEventListener('DOMContentLoaded', initializeModalHandlers);