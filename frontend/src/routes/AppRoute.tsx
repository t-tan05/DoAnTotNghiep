import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";
import VerifyResetCodePage from "@/pages/auth/VerifyResetCodePage";
import ForbiddenPage from "@/pages/public/ForbiddenPage";
import HomePage from "@/pages/public/HomeLandingPage";
import NotFoundPage from "@/pages/public/NotFoundPage";
import ProductDetailPage from "@/pages/public/ProductDetailPage";
import { Route, Routes } from "react-router-dom";
import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";
import CustomerRoute from "./CustomerRoute";
import AdminRoute from "./AdminRoute";
import PublicLayout from "@/components/layout/PublicLayout";
import ProfileLayout from "@/components/profile/ProfileLayout";
import AccountProfilePage from "@/pages/profile/AccountProfilePage";
import ChangePasswordPage from "@/pages/profile/ChangePasswordPage";
import AddressPage from "@/pages/profile/AddressPage";
import OrderHistoryPage from "@/pages/profile/OrderHistoryPage";
import WishlistPage from "@/pages/profile/WishlistPage";
import WarrantyDetailPage from "@/pages/profile/WarrantyDetailPage";
import WarrantyListPage from "@/pages/profile/WarrantyListPage";
import WarrantyRequestPage from "@/components/profile/WarrantyLookupRequest";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminStatisticsPage from "@/pages/admin/AdminStatisticsPage";
import AdminBrandPage from "@/pages/admin/AdminBrandsPage";
import AdminCategoriesPage from "@/pages/admin/AdminCategoriesPage";
import AdminProductsPage from "@/pages/admin/AdminProductsPage";
import AdminProductDetailPage from "@/pages/admin/AdminProductDetailPage";
import AdminProductLinesPage from "@/pages/admin/AdminProductLinesPage";
import AdminProductAttributesPage from "@/pages/admin/AdminProductAttributesPage";
import AdminProductVariantFormPage from "@/pages/admin/AdminProductVariantFormPage";
import AdminPromotionsPage from "@/pages/admin/AdminPromotionsPage";
import BlogListPage from "@/pages/public/BlogListPage";
import BlogDetailPage from "@/pages/public/BlogDetailPage";
import AdminBlogsPage from "@/pages/admin/AdminBlogsPage";
import EmployeeBlogsPage from "@/pages/employee/EmployeeBlogsPage";
import EmployeeBlogFormPage from "@/pages/employee/EmployeeBlogFormPage";
import EmployeeBlogPreviewPage from "@/pages/employee/EmployeeBlogPreviewPage";
import EmployeeExternalNewsPage from "@/pages/employee/EmployeeExternalNewsPage";
import EmployeeRoute from "./EmployeeRoute";
import EmployeeLayout from "@/components/employee/layout/EmployeeLayout";
import CartPage from "@/pages/customer/CartPage";
import CheckoutPage from "@/pages/customer/CheckoutPage";
import PaymentReturnPage from "@/pages/customer/PaymentReturnPage";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";
import EmployeeOrdersPage from "@/pages/employee/EmployeeOrdersPage";
import AdminOrderDetailPage from "@/pages/admin/AdminOrderDetailPage";
import EmployeeOrderDetailPage from "@/pages/employee/EmployeeOrderDetailPage";
import ProductListPage from "@/pages/public/ProductListPage";
import DeliveryPolicyPage from "@/pages/public/DeliveryPolicyPage";
import ReturnPolicyPage from "@/pages/public/ReturnPolicyPage";
import WarrantyPolicyPage from "@/pages/public/WarrantyPolicyPage";
import AdminWarrantiesPage from "@/pages/admin/AdminWarrantiesPage";
import AdminWarrantyDetailPage from "@/pages/admin/AdminWarrantyDetailPage";
import EmployeeWarrantiesPage from "@/pages/employee/EmployeeWarrantiesPage";
import EmployeeWarrantyDetailPage from "@/pages/employee/EmployeeWarrantyDetailPage";
import AdminCmsCollectionsPage from "@/pages/admin/AdminCmsCollectionsPage";
import AdminCmsCollectionDetailPage from "@/pages/admin/AdminCmsCollectionDetailPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import EmployeeCmsCollectionsPage from "@/pages/employee/EmployeeCmsCollectionsPage";
import EmployeeCmsCollectionDetailPage from "@/pages/employee/EmployeeCmsCollectionDetailPage";
import AdminReviewsPage from "@/pages/admin/AdminReviewsPage";
import ComparePage from "@/pages/public/ComparePage";

export default function AppRoute() {
    return (
        <Routes>
            <Route element={<PublicLayout />} >
                <Route index path="/" element={<HomePage/>}/>
                <Route path="/gioi-thieu" element={<div>Gioi thieu</div>} />
                <Route path="/tin-tuc" element={<BlogListPage />} />
                <Route path="/tin-tuc/:postId" element={<BlogDetailPage />} />
                <Route path="/c/:cmsSlug" element={<ProductListPage />} />
                <Route path="/products/:productId" element={<ProductDetailPage />} />
                <Route path="/so-sanh" element={<ComparePage />} />
                <Route path="/chinh-sach/bao-hanh" element={<WarrantyPolicyPage />} />
                <Route path="/chinh-sach/doi-tra" element={<ReturnPolicyPage />} />
                <Route path="/chinh-sach/giao-hang" element={<DeliveryPolicyPage />} />
                <Route path="/payment/vnpay-return" element={<PaymentReturnPage />}/>
                <Route element={<ProtectedRoute />}>
                    <Route path="/account" element={<ProfileLayout />}>
                        <Route index element={<AccountProfilePage />} />
                        <Route path="password" element={<ChangePasswordPage />} />
                        <Route element={<CustomerRoute />}>
                            <Route path="orders" element={<OrderHistoryPage />} />
                            <Route path="wishlist" element={<WishlistPage />} />
                            <Route path="warranties" element={<WarrantyListPage />} />
                            <Route path="warranties/new" element={<WarrantyRequestPage />} />
                            <Route path="warranties/:warrantyId" element={<WarrantyDetailPage />} />
                            <Route path="addresses" element={<AddressPage />} />
                        </Route>
                    </Route>

                    <Route element={<CustomerRoute />}>
                        <Route path="/cart" element={<CartPage />}/>
                        <Route path="/checkout" element={<CheckoutPage />}/>
                    </Route>
                </Route>
            </Route>

            <Route element={<GuestRoute/>}>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>} />
                <Route path="/verify-email" element={<VerifyEmailPage/>} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/verify-reset-code" element={<VerifyResetCodePage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="product-lines" element={<AdminProductLinesPage />} />
                    <Route path="products/:productId" element={<AdminProductDetailPage />}/>
                    <Route path="products/:productId/variants/new" element={<AdminProductVariantFormPage />}/>
                    <Route path="products/:productId/variants/:variantId/edit" element={<AdminProductVariantFormPage />}/>

                    <Route path="attributes" element={<AdminProductAttributesPage />}/>
                    <Route path="categories" element={<AdminCategoriesPage />} />
                    <Route path="brands" element={<AdminBrandPage />} />
                    <Route path="promotions" element={<AdminPromotionsPage />} />
                    <Route path="cms" element={<AdminCmsCollectionsPage />} />
                    <Route path="cms/:collectionId" element={<AdminCmsCollectionDetailPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
                    <Route path="warranties" element={<AdminWarrantiesPage />} />
                    <Route path="warranties/:warrantyId" element={<AdminWarrantyDetailPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="reviews" element={<AdminReviewsPage />} />
                    <Route path="statistics" element={<AdminStatisticsPage />} />
                    <Route path="blogs" element={<AdminBlogsPage />} />
                    <Route path="settings" element={<div>Cài đặt</div>} />
                </Route>
            </Route>

            <Route element={<EmployeeRoute />}>
                <Route path="/employee" element={<EmployeeLayout />}>
                    <Route index element={<EmployeeBlogsPage />} />
                    <Route path="blogs" element={<EmployeeBlogsPage />} />
                    <Route path="blogs/new" element={<EmployeeBlogFormPage />} />
                    <Route path="blogs/:postId/edit" element={<EmployeeBlogFormPage />} />
                    <Route path="blogs/:postId/preview" element={<EmployeeBlogPreviewPage />} />
                    <Route path="orders" element={<EmployeeOrdersPage />} />
                    <Route path="orders/:orderId" element={<EmployeeOrderDetailPage />} />
                    <Route path="warranties" element={<EmployeeWarrantiesPage />} />
                    <Route path="warranties/:warrantyId" element={<EmployeeWarrantyDetailPage />} />
                    <Route path="cms" element={<EmployeeCmsCollectionsPage />} />
                    <Route path="cms/:collectionId" element={<EmployeeCmsCollectionDetailPage />} />
                    <Route path="external-news" element={<EmployeeExternalNewsPage />} />
                </Route>
            </Route>

            <Route path="/403" element={<ForbiddenPage/>} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}
