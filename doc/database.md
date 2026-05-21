# Tổng quan các field trong database


## Bảng `addresses`
*   `address_id`: ID duy nhất của địa chỉ.
*   `user_id`: ID của người dùng sở hữu địa chỉ (FK tới `users`).
*   `province`: Tỉnh/Thành phố.
*   `street`: Tên đường, số nhà.
*   `ward`: Phường/Xã.
*   `receiver_name`: Tên người nhận.
*   `phone_number`: Số điện thoại người nhận.

## Bảng `brands`
*   `brand_id`: ID duy nhất của thương hiệu.
*   `brand_name`: Tên thương hiệu (UNIQUE).
*   `description`: Mô tả thương hiệu.

## Bảng `carts`
*   `cart_id`: ID duy nhất của giỏ hàng.
*   `user_id`: ID của người dùng sở hữu giỏ hàng (FK tới `users`).
*   `created_at`: Thời gian tạo giỏ hàng.
*   `updated_at`: Thời gian cập nhật giỏ hàng.

## Bảng `carts_items`
*   `cart_item_id`: ID duy nhất của mục trong giỏ hàng.
*   `cart_id`: ID của giỏ hàng (FK tới `carts`).
*   `variant_id`: ID của biến thể sản phẩm (FK tới `product_variants`).
*   `quantity`: Số lượng sản phẩm trong mục.
*   `price_at_add`: Giá của sản phẩm tại thời điểm thêm vào giỏ hàng.

## Bảng `categories`
*   `category_id`: ID duy nhất của danh mục.
*   `category_name`: Tên danh mục (UNIQUE).
*   `description`: Mô tả danh mục.

## Bảng `devices`
*   `device_id`: ID duy nhất của thiết bị (serial number của sản phẩm vật lý).
*   `variant_id`: ID của biến thể sản phẩm mà thiết bị này thuộc về (FK tới `product_variants`).
*   `serial_number`: Số serial duy nhất của thiết bị (UNIQUE).
*   `status`: Trạng thái của thiết bị (AVAILABLE, RESERVED, SOLD, RETURNED, REPAIRING).
*   `order_detail_id`: ID chi tiết đơn hàng nếu thiết bị đã được bán (FK tới `orders_details`).
*   `warranty_end_date`: Ngày hết hạn bảo hành.
*   `sold_date`: Ngày bán thiết bị.

## Bảng `orders`
*   `order_id`: ID duy nhất của đơn hàng.
*   `user_id`: ID của người dùng đặt hàng (FK tới `users`).
*   `employee_id`: ID của nhân viên xử lý đơn hàng (FK tới `users`).
*   `order_date`: Ngày đặt hàng.
*   `total_price`: Tổng giá trị đơn hàng.
*   `address_id`: ID địa chỉ giao hàng (FK tới `addresses`).
*   `status`: Trạng thái đơn hàng (PENDING, PAID, PAYMENT_FAILED, CONFIRMED, SHIPPED, DELIVERY_FAILED, COMPLETED, CANCELLED, RETURNED, REFUNDED).
*   `payment_method`: Phương thức thanh toán (COD, CREDIT_CARD, BANK_TRANSFER, CASH, VNPAY).
*   `receiver_name`: Tên người nhận hàng (nếu khác với thông tin địa chỉ).
*   `receiver_phone`: Số điện thoại người nhận hàng (nếu khác với thông tin địa chỉ).

## Bảng `orders_details`
*   `order_detail_id`: ID duy nhất của chi tiết đơn hàng.
*   `order_id`: ID của đơn hàng (FK tới `orders`).
*   `variant_id`: ID của biến thể sản phẩm (FK tới `product_variants`).
*   `quantity`: Số lượng sản phẩm trong chi tiết đơn hàng.
*   `price`: Giá của sản phẩm tại thời điểm đặt hàng.

## Bảng `product_images`
*   `image_id`: ID duy nhất của hình ảnh (AUTO_INCREMENT).
*   `product_id`: ID của sản phẩm (FK tới `products`).
*   `variant_id`: ID của biến thể sản phẩm (FK tới `product_variants`, NULLABLE nếu là ảnh chung).
*   `image_url`: URL của hình ảnh.
*   `public_id`: Public ID của hình ảnh trên dịch vụ lưu trữ (ví dụ: Cloudinary).
*   `is_default`: Đánh dấu hình ảnh mặc định cho sản phẩm.

## Bảng `products`
*   `product_id`: ID duy nhất của sản phẩm.
*   `product_name`: Tên sản phẩm (UNIQUE).
*   `brand_id`: ID của thương hiệu (FK tới `brands`).
*   `category_id`: ID của danh mục (FK tới `categories`).
*   `description`: Mô tả sản phẩm.
*   `warranty_period`: Thời gian bảo hành (tháng).
*   `created_at`: Thời gian tạo sản phẩm.
*   `updated_at`: Thời gian cập nhật sản phẩm.

## Bảng `product_attributes`
*   `attribute_id`: ID duy nhất của loại thuộc tính (ví dụ: "Color", "RAM").
*   `attribute_name`: Tên loại thuộc tính (UNIQUE).
*   `display_order`: Thứ tự hiển thị.

## Bảng `attribute_values`
*   `attribute_value_id`: ID duy nhất của giá trị thuộc tính (ví dụ: "Đen", "8GB").
*   `attribute_id`: ID của loại thuộc tính (FK tới `product_attributes`).
*   `value`: Giá trị cụ thể của thuộc tính.
*   `hex_code`: Mã màu (nếu là thuộc tính màu sắc).
*   `display_order`: Thứ tự hiển thị.

## Bảng `product_variants`
*   `variant_id`: ID duy nhất của biến thể sản phẩm (SKU).
*   `product_id`: ID của sản phẩm gốc (FK tới `products`).
*   `sku`: Mã SKU (UNIQUE, NULLABLE).
*   `price`: Giá của biến thể sản phẩm.
*   `quantity_in_stock`: Số lượng tồn kho.
*   `reserved_quantity`: Số lượng đang được đặt trước.
*   `sold_quantity`: Số lượng đã bán.
*   `image_url`: URL hình ảnh đại diện cho biến thể.
*   `public_id`: Public ID của hình ảnh.
*   `created_at`: Thời gian tạo biến thể.
*   `updated_at`: Thời gian cập nhật biến thể.

## Bảng `inventory_transactions`
*   `transaction_id`: ID duy nhất của giao dịch kho.
*   `variant_id`: ID của biến thể sản phẩm bị thay đổi tồn kho (FK tới `product_variants`).
*   `order_id`: ID đơn hàng liên quan đến giao dịch kho, nếu có (FK tới `orders`, nullable).
*   `type`: Loại giao dịch kho (IMPORT, RESERVE, RELEASE, SOLD, ADJUST).
*   `quantity`: Số lượng thay đổi trong giao dịch.
*   `before_quantity`: Số lượng tồn kho trước khi thay đổi.
*   `after_quantity`: Số lượng tồn kho sau khi thay đổi.
*   `note`: Ghi chú nghiệp vụ của giao dịch kho.
*   `created_by`: ID người dùng/nhân viên tạo giao dịch, nếu có (FK tới `users`, nullable).
*   `created_at`: Thời gian tạo giao dịch kho.

## Bảng `variant_attribute_values`
*   `variant_id`: ID của biến thể sản phẩm (FK tới `product_variants`).
*   `attribute_value_id`: ID của giá trị thuộc tính (FK tới `attribute_values`).

## Bảng `product_variant_specs`
*   `spec_id`: ID duy nhất của thông số (AUTO_INCREMENT).
*   `variant_id`: ID của biến thể sản phẩm (FK tới `product_variants`).
*   `spec_key`: Tên thông số (ví dụ: "DPI", "Thời lượng pin", "Kiểu Switch", "Cảm biến").
*   `spec_value`: Giá trị của thông số (ví dụ: "16000", "50 giờ", "Mechanical Blue", "PixArt 3395").
*   `display_order`: Thứ tự hiển thị thông số.

## Bảng `products_promotions`
*   `product_id`: ID của sản phẩm (FK tới `products`).
*   `promotion_id`: ID của khuyến mãi (FK tới `promotions`).

## Bảng `promotions`
*   `promotion_id`: ID duy nhất của khuyến mãi.
*   `promotion_name`: Tên khuyến mãi.
*   `description`: Mô tả khuyến mãi.
*   `discount_type`: Loại giảm giá (PERCENT, FIXED).
*   `discount_value`: Giá trị giảm giá.
*   `start_date`: Ngày bắt đầu khuyến mãi.
*   `end_date`: Ngày kết thúc khuyến mãi.
*   `is_active`: Trạng thái hoạt động của khuyến mãi.

## Bảng `reviews`
*   `review_id`: ID duy nhất của đánh giá (AUTO_INCREMENT).
*   `product_id`: ID của sản phẩm (FK tới `products`).
*   `user_id`: ID của người dùng đánh giá (FK tới `users`).
*   `rating`: Điểm đánh giá (1-5).
*   `comment`: Nội dung đánh giá.
*   `created_at`: Thời gian tạo đánh giá.
*   `order_id`: ID của đơn hàng liên quan đến đánh giá (FK tới `orders`).

## Bảng `roles`
*   `role_name`: Tên vai trò (ADMIN, EMPLOYEE, USER) (PK).
*   `description`: Mô tả vai trò.

## Bảng `statistics`
*   `stat_id`: ID duy nhất của thống kê.
*   `stat_date`: Ngày thống kê (UNIQUE).
*   `total_orders`: Tổng số đơn hàng.
*   `total_revenue`: Tổng doanh thu.
*   `total_profit`: Tổng lợi nhuận.
*   `total_products_sold`: Tổng số sản phẩm đã bán.
*   `total_inventory`: Tổng số tồn kho.
*   `created_at`: Thời gian tạo thống kê.
*   `updated_at`: Thời gian cập nhật thống kê.

## Bảng `statistics_products`
*   `stat_id`: ID của thống kê (FK tới `statistics`).
*   `product_id`: ID của sản phẩm (FK tới `products`).
*   `quantity_sold`: Số lượng đã bán của sản phẩm trong ngày thống kê.
*   `revenue`: Doanh thu từ sản phẩm trong ngày thống kê.
*   `profit`: Lợi nhuận từ sản phẩm trong ngày thống kê.

## Bảng `users`
*   `user_id`: ID duy nhất của người dùng.
*   `email`: Email người dùng (UNIQUE).
*   `pass_word`: Mật khẩu đã mã hóa.
*   `name`: Tên người dùng.
*   `refreshToken`: Mã refresh token.
*   `verified`: Trạng thái xác thực email.
*   `status`: Trạng thái của tài khoản.
*   `locked_reason`: Lý do lock tài khoản.
*   `locked_at`: Thời gian lock tài khoản.
*   `verify_token`: Token xác thực email.
*   `verify_token_expire`:Thời gian xác thực token.
*   `reset_token`: Token đặt lại mật khẩu.
*   `reset_token_expire`: Thời gian hết hạn của token đặt lại mật khẩu.

## Bảng `users_roles`
*   `user_id`: ID của người dùng (FK tới `users`).
*   `role_name`: Tên vai trò (FK tới `roles`).

## Bảng `warranties`
*   `warranty_id`: ID duy nhất của phiếu bảo hành.
*   `device_id`: ID của thiết bị được bảo hành (FK tới `devices`).
*   `customer_id`: ID của khách hàng (FK tới `users`).
*   `received_date`: Ngày nhận thiết bị bảo hành.
*   `expected_return_date`: Ngày dự kiến trả thiết bị.
*   `return_date`: Ngày trả thiết bị thực tế.
*   `issue_description`: Mô tả lỗi.
*   `repair_actions`: Các hành động sửa chữa đã thực hiện.
*   `accessory_changed`: Các phụ kiện đã thay thế.
*   `status`: Trạng thái bảo hành (RECEIVED, IN_PROGRESS, COMPLETED, RETURNED, CANCELLED).
*   `note`: Ghi chú.
*   `created_at`: Thời gian tạo phiếu bảo hành.
*   `updated_at`: Thời gian cập nhật phiếu bảo hành.

## Bảng `warranty_processes`
*   `process_id`: ID duy nhất của quy trình bảo hành.
*   `warranty_id`: ID của phiếu bảo hành (FK tới `warranties`).
*   `employee_id`: ID của nhân viên thực hiện (FK tới `users`).
*   `action`: Hành động đã thực hiện (ví dụ: "Kiểm tra", "Sửa chữa").
*   `note`: Ghi chú về hành động.
*   `created_at`: Thời gian thực hiện hành động.

## Bảng `blog_categories`
*   `category_id`: ID duy nhất của danh mục blog.
*   `category_name`: Tên danh mục blog (UNIQUE).
*   `description`: Mô tả danh mục blog.
*   `created_at`: Thời gian tạo.
*   `updated_at`: Thời gian cập nhật.

## Bảng `blog_posts`
*   `post_id`: ID duy nhất của bài viết blog.
*   `title`: Tiêu đề bài viết.
*   `slug`: Slug của bài viết (UNIQUE, dùng cho URL).
*   `content`: Nội dung bài viết (LONGTEXT).
*   `author_id`: ID của tác giả (FK tới `users`).
*   `category_id`: ID của danh mục blog (FK tới `blog_categories`, NULLABLE).
*   `status`: Trạng thái bài viết (DRAFT, PUBLISHED, ARCHIVED).
*   `published_at`: Thời gian xuất bản bài viết.
*   `created_at`: Thời gian tạo bài viết.
*   `updated_at`: Thời gian cập nhật bài viết.
*   `thumbnail_url`: URL ảnh thumbnail của bài viết.

## Trigger quản lý kho
*   `trg_orders_details_after_insert`: Tự động trừ `quantity_in_stock`, tăng `sold_quantity` trong `product_variants` khi thêm chi tiết đơn hàng, đồng thời ghi một dòng `SOLD` vào `inventory_transactions` với số lượng trước và sau khi trừ kho.
*   `trg_orders_after_update`: Khi trạng thái đơn hàng chuyển sang nhóm hoàn kho (`CANCELLED`, `RETURNED`, `REFUNDED`, `DELIVERY_FAILED`, `PAYMENT_FAILED`), hệ thống tự hoàn kho và ghi giao dịch `RELEASE`. Khi đơn hàng chuyển ngược từ nhóm hoàn kho sang trạng thái xử lý/bán, hệ thống tự trừ kho lại và ghi giao dịch `SOLD`.
*   Các trigger này giúp lịch sử kho được ghi nhận tự động ở tầng database, không cần xử lý thủ công ở tầng application.
