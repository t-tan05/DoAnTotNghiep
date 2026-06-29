# Tổng quan database `tech_db`

Tài liệu này mô tả các bảng chính trong file [`db_shop.sql`](../sql/db_shop.sql). Schema dùng MySQL/InnoDB, charset `utf8mb4`, khóa chính phần lớn là `varchar(50)`.

## Bảng `addresses`

- `address_id`: ID duy nhất của địa chỉ.
- `user_id`: Người dùng sở hữu địa chỉ, FK tới `users.user_id`, xóa user thì xóa địa chỉ.
- `province`: Tỉnh/Thành phố.
- `street`: Số nhà, tên đường.
- `ward`: Phường/Xã.
- `receiver_name`: Tên người nhận.
- `phone_number`: Số điện thoại người nhận.

## Bảng `brands`

- `brand_id`: ID thương hiệu.
- `brand_name`: Tên thương hiệu, unique.
- `normalized_name`: Tên đã chuẩn hóa, unique.
- `description`: Mô tả thương hiệu.

## Bảng `categories`

- `category_id`: ID danh mục.
- `category_name`: Tên danh mục, unique.
- `normalized_name`: Tên đã chuẩn hóa, unique.
- `description`: Mô tả danh mục.

## Bảng `users`

- `user_id`: ID người dùng.
- `email`: Email đăng nhập, unique.
- `pass_word`: Mật khẩu đã mã hóa.
- `name`: Tên người dùng.
- `verified`: Trạng thái xác thực email.
- `status`: Trạng thái tài khoản: `ACTIVE`, `LOCKED`.
- `locked_reason`: Lý do khóa tài khoản.
- `locked_at`: Thời điểm khóa tài khoản.
- `refreshToken`: Refresh token hiện tại.
- `verify_token`: Token xác thực email.
- `verify_token_expire`: Thời điểm hết hạn token xác thực.
- `reset_token`: Token đặt lại mật khẩu.
- `reset_token_expire`: Thời điểm hết hạn token đặt lại mật khẩu.

## Bảng `roles`

- `role_name`: Tên vai trò, PK.
- `description`: Mô tả vai trò.

## Bảng `users_roles`

- `user_id`: FK tới `users.user_id`.
- `role_name`: FK tới `roles.role_name`.
- Khóa chính kép: `user_id`, `role_name`.

## Bảng `wishlists`

- `wishlist_id`: ID dòng sản phẩm yêu thích.
- `user_id`: Người dùng sở hữu wishlist item, FK tới `users.user_id`; xóa user thì xóa wishlist item.
- `variant_id`: Biến thể sản phẩm được yêu thích, FK tới `product_variants.variant_id`; xóa variant thì xóa wishlist item.
- `created_at`: Thời điểm thêm vào danh sách yêu thích.
- Có unique key `user_id`, `variant_id` để mỗi user chỉ yêu thích một biến thể một lần.
- Có index riêng cho `user_id` và `variant_id` để tối ưu truy vấn danh sách yêu thích của user và thống kê số lượt yêu thích theo biến thể.

## Bảng `carts`

- `cart_id`: ID giỏ hàng.
- `user_id`: Người dùng sở hữu giỏ hàng, FK tới `users.user_id`.
- `created_at`: Thời điểm tạo.
- `updated_at`: Thời điểm cập nhật.

## Bảng `carts_items`

- `cart_item_id`: ID dòng sản phẩm trong giỏ.
- `cart_id`: FK tới `carts.cart_id`.
- `variant_id`: FK tới `product_variants.variant_id`.
- `quantity`: Số lượng.
- `price_at_add`: Giá sản phẩm tại thời điểm thêm vào giỏ.

## Bảng `products`

- `product_id`: ID sản phẩm.
- `product_name`: Tên sản phẩm.
- `normalized_name`: Tên đã chuẩn hóa, unique.
- `brand_id`: FK tới `brands.brand_id`.
- `category_id`: FK tới `categories.category_id`.
- `description`: Mô tả sản phẩm.
- `warranty_period`: Thời hạn bảo hành.
- `created_at`: Thời điểm tạo.
- `updated_at`: Thời điểm cập nhật.

## Bảng `product_attributes`

- `attribute_id`: ID thuộc tính.
- `attribute_name`: Tên thuộc tính, unique.
- `normalized_name`: Tên thuộc tính đã chuẩn hóa, unique.
- `display_order`: Thứ tự hiển thị.

## Bảng `attribute_values`

- `attribute_value_id`: ID giá trị thuộc tính.
- `attribute_id`: FK tới `product_attributes.attribute_id`.
- `value`: Giá trị hiển thị.
- `normalized_value`: Giá trị đã chuẩn hóa, unique.
- `display_order`: Thứ tự hiển thị.

## Bảng `product_variants`

- `variant_id`: ID biến thể sản phẩm.
- `product_id`: FK tới `products.product_id`.
- `sku`: Mã SKU, unique, nullable.
- `price`: Giá bán của biến thể.
- `quantity_in_stock`: Số lượng tồn kho.
- `reserved_quantity`: Số lượng đang giữ/chờ xử lý.
- `sold_quantity`: Số lượng đã bán.
- `image_url`: Ảnh đại diện biến thể.
- `public_id`: Public ID ảnh.
- `created_at`: Thời điểm tạo.
- `updated_at`: Thời điểm cập nhật.

## Bảng `variant_attribute_values`

- `variant_id`: FK tới `product_variants.variant_id`.
- `attribute_value_id`: FK tới `attribute_values.attribute_value_id`.
- Khóa chính kép: `variant_id`, `attribute_value_id`.

## Bảng `product_variant_specs`

- `spec_id`: ID thông số, tự tăng.
- `variant_id`: FK tới `product_variants.variant_id`.
- `spec_key`: Tên thông số.
- `spec_value`: Giá trị thông số.
- `display_order`: Thứ tự hiển thị.

## Bảng `product_images`

- `image_id`: ID ảnh, tự tăng.
- `product_id`: FK tới `products.product_id`.
- `variant_id`: FK tới `product_variants.variant_id`, nullable nếu là ảnh chung của sản phẩm.
- `image_url`: URL ảnh.
- `public_id`: Public ID ảnh.
- `is_default`: Đánh dấu ảnh mặc định.

## Bảng `orders`

- `order_id`: ID đơn hàng.
- `user_id`: Người đặt hàng, FK tới `users.user_id`, nullable; khi xóa user thì set null.
- `employee_id`: Nhân viên xử lý đơn, FK tới `users.user_id`, nullable; khi xóa user thì set null.
- `order_date`: Thời điểm đặt hàng.
- `total_price`: Tổng giá trị đơn hàng.
- `address_id`: Địa chỉ giao hàng, FK tới `addresses.address_id`, nullable; đang dùng `ON DELETE RESTRICT`.
- `status`: Trạng thái xử lý đơn hàng: `PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERY_FAILED`, `COMPLETED`, `CANCELLED`, `RETURNED`.
- `payment_method`: Phương thức thanh toán: `COD`, `VNPAY`, `MOMO`, `ZALOPAY`, `BANK_TRANSFER`.
- `payment_status`: Trạng thái thanh toán của đơn: `UNPAID`, `PENDING`, `PAID`, `FAILED`, `REFUNDED`.
- `receiver_name`: Tên người nhận tại thời điểm đặt hàng.
- `receiver_phone`: Số điện thoại người nhận tại thời điểm đặt hàng.

## Bảng `payment_transactions`

- `transaction_id`: ID giao dịch thanh toán.
- `order_id`: FK tới `orders.order_id`; xóa đơn thì xóa giao dịch.
- `payment_method`: Phương thức thanh toán của giao dịch: `COD`, `VNPAY`, `MOMO`, `ZALOPAY`, `BANK_TRANSFER`.
- `amount`: Số tiền giao dịch.
- `status`: Trạng thái giao dịch: `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`, `REFUNDED`.
- `transaction_code`: Mã giao dịch từ cổng thanh toán hoặc ngân hàng.
- `provider`: Nhà cung cấp/cổng thanh toán.
- `provider_response`: Raw response hoặc payload trả về từ provider.
- `paid_at`: Thời điểm thanh toán thành công.
- `created_at`: Thời điểm tạo giao dịch.
- `updated_at`: Thời điểm cập nhật giao dịch.

## Bảng `orders_details`

- `order_detail_id`: ID chi tiết đơn hàng.
- `order_id`: FK tới `orders.order_id`.
- `variant_id`: FK tới `product_variants.variant_id`.
- `quantity`: Số lượng mua.
- `price`: Giá bán tại thời điểm đặt hàng.

## Bảng `devices`

- `device_id`: ID thiết bị vật lý.
- `variant_id`: FK tới `product_variants.variant_id`.
- `serial_number`: Số serial, unique.
- `status`: Trạng thái thiết bị: `AVAILABLE`, `RESERVED`, `SOLD`, `RETURNED`, `REPAIRING`.
- `order_detail_id`: FK tới `orders_details.order_detail_id`, nullable.
- `warranty_end_date`: Ngày hết hạn bảo hành.
- `sold_date`: Ngày bán.

## Bảng `inventory_transactions`

- `transaction_id`: ID giao dịch kho.
- `variant_id`: FK tới `product_variants.variant_id`.
- `order_id`: FK tới `orders.order_id`, nullable; xóa đơn thì set null.
- `type`: Loại giao dịch kho: `IMPORT`, `RESERVE`, `RELEASE`, `SOLD`, `ADJUST`.
- `quantity`: Số lượng thay đổi.
- `before_quantity`: Số lượng tồn trước thay đổi.
- `after_quantity`: Số lượng tồn sau thay đổi.
- `note`: Ghi chú nghiệp vụ.
- `created_by`: FK tới `users.user_id`, nullable.
- `created_at`: Thời điểm tạo giao dịch kho.

## Bảng `promotions`

- `promotion_id`: ID khuyến mãi.
- `promotion_name`: Tên khuyến mãi.
- `description`: Mô tả.
- `discount_type`: Loại giảm giá: `PERCENT`, `FIXED`.
- `discount_value`: Giá trị giảm.
- `start_date`: Thời điểm bắt đầu.
- `end_date`: Thời điểm kết thúc.
- `is_active`: Trạng thái hoạt động.

## Bảng `products_promotions`

- `product_id`: FK tới `products.product_id`.
- `promotion_id`: FK tới `promotions.promotion_id`.
- Khóa chính kép: `product_id`, `promotion_id`.

## Bảng `reviews`

- `review_id`: ID đánh giá, tự tăng.
- `product_id`: FK tới `products.product_id`.
- `user_id`: FK tới `users.user_id`.
- `rating`: Điểm đánh giá.
- `comment`: Nội dung đánh giá.
- `created_at`: Thời điểm tạo đánh giá.
- `order_id`: FK tới `orders.order_id`.
- Có unique key `order_id`, `product_id` để mỗi sản phẩm trong một đơn chỉ được đánh giá một lần.

## Bảng `statistics`

- `stat_id`: ID thống kê.
- `stat_date`: Ngày thống kê, unique.
- `total_orders`: Tổng số đơn hàng.
- `total_revenue`: Tổng doanh thu.
- `total_profit`: Tổng lợi nhuận.
- `total_products_sold`: Tổng số sản phẩm đã bán.
- `total_inventory`: Tổng tồn kho.
- `created_at`: Thời điểm tạo.
- `updated_at`: Thời điểm cập nhật.

## Bảng `statistics_products`

- `stat_id`: FK tới `statistics.stat_id`.
- `product_id`: FK tới `products.product_id`.
- `quantity_sold`: Số lượng đã bán.
- `revenue`: Doanh thu.
- `profit`: Lợi nhuận.
- Khóa chính kép: `stat_id`, `product_id`.

## Bảng `warranties`

- `warranty_id`: ID phiếu bảo hành.
- `device_id`: FK tới `devices.device_id`.
- `customer_id`: FK tới `users.user_id`.
- `received_date`: Ngày nhận bảo hành.
- `expected_return_date`: Ngày dự kiến trả.
- `return_date`: Ngày trả thực tế.
- `issue_description`: Mô tả lỗi.
- `repair_actions`: Hành động sửa chữa.
- `accessory_changed`: Phụ kiện đã thay.
- `status`: Trạng thái bảo hành: `RECEIVED`, `IN_PROGRESS`, `COMPLETED`, `RETURNED`, `CANCELLED`.
- `note`: Ghi chú.
- `created_at`: Thời điểm tạo.
- `updated_at`: Thời điểm cập nhật.

## Bảng `warranty_processes`

- `process_id`: ID bước xử lý bảo hành.
- `warranty_id`: FK tới `warranties.warranty_id`.
- `employee_id`: FK tới `users.user_id`.
- `action`: Hành động đã thực hiện.
- `note`: Ghi chú.
- `created_at`: Thời điểm tạo.

## Bảng `blog_categories`

- `category_id`: ID danh mục blog.
- `category_name`: Tên danh mục blog, unique.
- `description`: Mô tả.
- `created_at`: Thời điểm tạo.
- `updated_at`: Thời điểm cập nhật.

## Bảng `blog_posts`

- `post_id`: ID bài viết.
- `title`: Tiêu đề.
- `slug`: Slug URL, unique.
- `content`: Nội dung bài viết.
- `author_id`: FK tới `users.user_id`.
- `category_id`: FK tới `blog_categories.category_id`, nullable.
- `status`: Trạng thái bài viết: `DRAFT`, `PUBLISHED`, `ARCHIVED`.
- `published_at`: Thời điểm xuất bản.
- `created_at`: Thời điểm tạo.
- `updated_at`: Thời điểm cập nhật.
- `thumbnail_url`: URL ảnh thumbnail.

## Trigger và tự động hóa

- `trg_product_variants_before_insert`, `trg_product_variants_before_update`: Chặn giá và tồn kho âm.
- `trg_orders_details_before_insert`, `trg_orders_details_before_update`: Chặn số lượng đặt hàng nhỏ hơn hoặc bằng 0.
- `trg_orders_details_after_insert`: Khi thêm chi tiết đơn hàng, tự trừ `quantity_in_stock`, tăng `sold_quantity` và ghi giao dịch kho `SOLD`.
- `trg_orders_details_after_update`: Khi sửa chi tiết đơn hàng, tự bù/trừ tồn kho theo chênh lệch nếu đơn chưa thuộc nhóm hoàn kho.
- `trg_orders_details_after_delete`: Khi xóa chi tiết đơn hàng, tự hoàn kho nếu đơn chưa thuộc nhóm hoàn kho.
- `trg_orders_after_update`: Khi đơn chuyển sang trạng thái hoàn kho, tự cộng lại tồn kho, giảm `sold_quantity`, ghi giao dịch `RELEASE` và giải phóng serial thiết bị.
- `trg_carts_items_before_insert`, `trg_carts_items_before_update`: Chặn số lượng trong giỏ hàng nhỏ hơn hoặc bằng 0.
- `trg_promotions_before_insert`, `trg_promotions_before_update`: Chặn giá trị khuyến mãi âm.
- `sp_cancel_expired_orders`: Tự hủy đơn `PENDING` quá 24 giờ.
- `evt_auto_cancel_pending_orders`: Chạy `sp_cancel_expired_orders` mỗi giờ.