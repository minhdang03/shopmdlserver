// Quản lý trạng thái đơn hàng
async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            window.location.reload();
        } else {
            alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra');
    }
}

// Xử lý modal chi tiết đơn hàng
async function showOrderDetails(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
            const order = await response.json();
            const modal = document.getElementById('orderDetailModal');
            const content = document.getElementById('orderDetailContent');
            
            content.innerHTML = `
                <h3>Thông tin khách hàng</h3>
                <p>Tên: ${order.customerInfo.name}</p>
                <p>SĐT: ${order.customerInfo.phone}</p>
                <p>Email: ${order.customerInfo.email || 'Không có'}</p>
                <p>Địa chỉ: ${order.customerInfo.address || 'Không có'}</p>
                <p>Ghi chú: ${order.customerInfo.note || 'Không có'}</p>

                <h3>Sản phẩm</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Tên sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.orderItems.map(item => `
                            <tr>
                                <td>${item.productName}</td>
                                <td>${item.quantity}</td>
                                <td>${item.price.toLocaleString('vi-VN')}đ</td>
                                <td>${(item.price * item.quantity).toLocaleString('vi-VN')}đ</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <h3>Tổng tiền: ${order.totalAmount.toLocaleString('vi-VN')}đ</h3>
            `;
            
            modal.style.display = 'block';
        }
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra khi tải chi tiết đơn hàng');
    }
}

function hideOrderDetails() {
    document.getElementById('orderDetailModal').style.display = 'none';
}

// Xử lý lọc và tìm kiếm
function filterOrders() {
    const status = document.getElementById('statusFilter').value;
    const search = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.getElementById('orderTableBody').getElementsByTagName('tr');

    for (let row of rows) {
        const orderStatus = row.getAttribute('data-status');
        const orderId = row.cells[0].textContent.toLowerCase();
        const phone = row.cells[2].textContent.toLowerCase();
        
        const statusMatch = status === 'all' || orderStatus === status;
        const searchMatch = orderId.includes(search) || phone.includes(search);
        
        row.style.display = statusMatch && searchMatch ? '' : 'none';
    }
}

// Xử lý sắp xếp bảng
function sortTable(n) {
    const table = document.querySelector('table');
    let rows, switching = true;
    let i, shouldSwitch, dir = 'asc';
    let switchcount = 0;

    while (switching) {
        switching = false;
        rows = table.rows;

        for (i = 1; i < rows.length - 1; i++) {
            shouldSwitch = false;
            const x = rows[i].getElementsByTagName('td')[n];
            const y = rows[i + 1].getElementsByTagName('td')[n];

            if (dir === 'asc') {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }

        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount === 0 && dir === 'asc') {
                dir = 'desc';
                switching = true;
            }
        }
    }
}

// Xử lý modal chỉnh sửa đơn hàng
async function showEditOrderModal(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
            const order = await response.json();
            
            document.getElementById('editOrderId').value = order.id;
            document.getElementById('editCustomerName').value = order.customerInfo.name;
            document.getElementById('editCustomerPhone').value = order.customerInfo.phone;
            document.getElementById('editCustomerAddress').value = order.customerInfo.address;
            document.getElementById('editOrderNote').value = order.customerInfo.note || '';
            document.getElementById('editOrderStatus').value = order.status;
            
            document.getElementById('editOrderModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra khi tải thông tin đơn hàng');
    }
}

function hideEditModal() {
    document.getElementById('editOrderModal').style.display = 'none';
}

async function updateOrderDetails(event) {
    event.preventDefault();
    const form = event.target;
    const orderId = document.getElementById('editOrderId').value;
    
    const updatedOrder = {
        customerInfo: {
            name: form.customerName.value,
            phone: form.customerPhone.value,
            address: form.customerAddress.value,
            note: form.note.value
        },
        status: form.status.value
    };
    
    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedOrder)
        });
        
        if (response.ok) {
            window.location.reload();
        } else {
            alert('Có lỗi xảy ra khi cập nhật đơn hàng');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Có lỗi xảy ra');
    }
}