import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";
import VerifyResetCodePage from "@/pages/auth/VerifyResetCodePage";
import ForbiddenPage from "@/pages/public/ForbiddenPage";
import HomePage from "@/pages/public/HomePage";
import NotFoundPage from "@/pages/public/NotFoundPage";
import { Route, Routes } from "react-router-dom";
import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import PublicLayout from "@/components/layout/PublicLayout";
import ProfileLayout from "@/components/profile/ProfileLayout";
import AccountProfilePage from "@/pages/profile/AccountProfilePage";
import ChangePasswordPage from "@/pages/profile/ChangePasswordPage";
import AddressPage from "@/pages/profile/AddressPage";


export default function AppRoute() {
    return (
        <Routes>
            <Route element={<PublicLayout />} >
                <Route index path="/" element={<HomePage/>}/>
                <Route path="/gioi-thieu" element={<div>Gioi thieu</div>} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/account" element={<ProfileLayout />}>
                        <Route index element={<AccountProfilePage />} />
                        <Route path="password" element={<ChangePasswordPage />} />
                        <Route path="addresses" element={<AddressPage />} />
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
                <Route path="/admin" element={<div>Admin dashboard</div>}/>
            </Route>

            <Route path="/403" element={<ForbiddenPage/>} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}