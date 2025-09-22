import React from 'react';

interface LoginScreenProps {
    onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onLogin();
    };

    return (
        <div className="login-container">
            <div className="login-logo">URA</div>
            <h2 className="login-title">Đăng nhập URA-xLaw</h2>
            <p className="login-subtitle">Truy cập hệ thống AI pháp lý cho nhân viên ngân hàng</p>

            <form className="login-form" id="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="staff-id">Mã nhân viên</label>
                    <input type="text" id="staff-id" name="staff-id" placeholder="Nhập mã nhân viên" required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Mật khẩu</label>
                    <input type="password" id="password" name="password" placeholder="Nhập mật khẩu" required />
                </div>
                <button type="submit" className="login-btn">Đăng nhập</button>
            </form>
        </div>
    );
};

export default LoginScreen;