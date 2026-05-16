import re

with open('d:/ORDER_APP/ORDER_APP/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add "Xóa Đơn" button
old_btns = """              <button class="btn btn-outline" style="padding:4px 8px; font-size:0.8rem" onclick="toggleOrderDetails('${order.orderNo}', this)">Xem Chi Tiết</button>
              <button class="btn btn-primary admin-only" style="padding:4px 8px; font-size:0.8rem; background: var(--accent); border: none; margin-left: 5px;" onclick="editOrder('${order.orderNo}')">Sửa Đơn</button>"""

new_btns = """              <button class="btn btn-outline" style="padding:4px 8px; font-size:0.8rem" onclick="toggleOrderDetails('${order.orderNo}', this)">Xem Chi Tiết</button>
              <button class="btn btn-primary admin-only" style="padding:4px 8px; font-size:0.8rem; background: var(--accent); border: none; margin-left: 5px;" onclick="editOrder('${order.orderNo}')">Sửa Đơn</button>
              <button class="btn btn-danger admin-only" style="padding:4px 8px; font-size:0.8rem; border: none; margin-left: 5px;" onclick="deleteOrder('${order.orderNo}')">Xóa Đơn</button>"""

html = html.replace(old_btns, new_btns)

# 2. Add imageUrl mapping in editOrder
old_mapping = """              orderItems.push({
                productName: item["Tên SP"] || "",
                artCode: item["Art Code"] || "",
                color: item["Màu"] || "","""

new_mapping = """              orderItems.push({
                productName: item["Tên SP"] || "",
                imageUrl: item["Link Ảnh"] || "",
                artCode: item["Art Code"] || "",
                color: item["Màu"] || "","""

html = html.replace(old_mapping, new_mapping)

# 3. Add deleteOrder function
delete_order_func = """
    function deleteOrder(orderNo) {
      if (!confirm(`Bạn có chắc muốn xóa đơn hàng ${orderNo}? Hành động này không thể hoàn tác.`)) return;
      
      showSpinner("Đang xóa đơn hàng...");
      
      fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify({ action: "deleteOrder", orderNo: orderNo })
      })
      .then(res => res.json())
      .then(res => {
        hideSpinner();
        if (res.success) {
          showToast(res.message || "Đã xóa đơn hàng thành công!", "success");
          loadHistory(); // Reload table
        } else {
          showToast("Lỗi xóa đơn: " + res.message, "error");
        }
      })
      .catch(err => {
        hideSpinner();
        showToast("Lỗi kết nối khi xóa đơn: " + err.message, "error");
      });
    }
"""

# Find the end of editOrder function to insert deleteOrder right after it
# Searching for:
#         .catch(err => {
#           hideSpinner();
#           showToast("Lỗi tải dữ liệu: " + err.message, "error");
#         });
#     }
# 
#     /* ================= RECEIVING ================= */

old_end_edit = """        .catch(err => {
          hideSpinner();
          showToast("Lỗi tải dữ liệu: " + err.message, "error");
        });
    }

    /* ================= RECEIVING ================= */"""

new_end_edit = """        .catch(err => {
          hideSpinner();
          showToast("Lỗi tải dữ liệu: " + err.message, "error");
        });
    }
""" + delete_order_func + """
    /* ================= RECEIVING ================= */"""

html = html.replace(old_end_edit, new_end_edit)

with open('d:/ORDER_APP/ORDER_APP/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
