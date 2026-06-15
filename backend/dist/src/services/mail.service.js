import transpoter from "#config/mail";
export const sendVerifyEmail = async (to, code) => {
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
    });
};
export const sendResetPasswordEmail = async (to, code) => {
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
    });
};
export const sendNotifyPasswordForEmployee = async (to, password) => {
    await transpoter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: "Tài khoản nhân viên đã được tạo",
        html: `
            <div style="font-family: Arial">
                <h2>Tài khoản nhân viên đã được tạo</h2>
                <p>Email đăng nhập của bạn là: <b>${to}</b></p>
                <p>Mật khẩu tạm thời của bạn là:</p>
                <h2 style="color: blue">${password}</h2>
                <p>Vui lòng đăng nhập và đổi mật khẩu ngay trong lần đăng nhập đầu tiên.</p>
                <p>Nếu bạn không biết về tài khoản này, vui lòng liên hệ quản trị viên.</p>
            </div>
        `,
    });
};
