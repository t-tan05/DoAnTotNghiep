import transpoter from "#config/mail";

export const sendVerifyEmail = async(to: string, code: string) => {
    await transpoter.sendMail({
        from: process.env.EMAIL_USER,
        to,

        subject: "Mã xác thực tài khoản",

        html: `
            <div style="font-family: Arial">
                <h2>Xác thực tài khoản</h2>
                <p>Mã OTP của bạn là:</p>
                <h1 style="color: blue">
                    ${code}
                </h1>

                <p>Mã sẽ hết hạn sau 10 phút.</p>
            </div>
        `
    })
};

export const sendResetPasswordEmail = async(to: string, code: string) => {
    await transpoter.sendMail({
        from: process.env.EMAIL_USER,
        to,

        subject: "Mã đặt lại mật khẩu",
        html: `
            <div style="font-family: Arial">
                <h2>Đặt lại mật khẩu</h2>
                <p>Mã OTP của bạn là:</p>
                <h1 style="color: blue">
                    ${code}
                </h1>

                <p>Mã sẽ hết hạn sau 10 phút.</p>
                <p>Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.</p>
            </div>
        `
    })
}