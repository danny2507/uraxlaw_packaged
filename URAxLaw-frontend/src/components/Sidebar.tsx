import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faComments, faFileAlt, faTasks, faHistory,
    faRocket, faSun, faMoon, faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';

interface SidebarProps {
    theme: string;
    onToggleTheme: () => void;
    onLogout: () => void;
    onOpenUpgradeModal: () => void;
    onNavigate: (section: 'chat' | 'documents' | 'checklist' | 'history') => void;
    activeSection?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ theme, onToggleTheme, onLogout, onOpenUpgradeModal, onNavigate, activeSection = 'chat' }) => {
    return (
        <aside className="sidebar" aria-label="Thanh điều hướng chính">
            <div>
                <div className="brand" role="banner">
                    <div className="logo">URA</div>
                    <div>
                        <h1 style={{ fontSize: '14px', marginBottom: '4px' }}>URA-xLaw</h1>
                        <p style={{ margin: 0 }}>AI pháp lý cho Ngân hàng</p>
                    </div>
                </div>

                <nav className="nav" aria-label="Điều hướng chính">
                    <a href="#" className={activeSection==='chat' ? 'active' : ''} onClick={(e)=>{e.preventDefault();onNavigate('chat');}}><FontAwesomeIcon icon={faComments} /> <span>Chat</span></a>
                    <a href="#" className={activeSection==='documents' ? 'active' : ''} onClick={(e)=>{e.preventDefault();onNavigate('documents');}}><FontAwesomeIcon icon={faFileAlt} /> <span>Văn bản</span></a>
                    <a href="#" className={activeSection==='checklist' ? 'active' : ''} onClick={(e)=>{e.preventDefault();onNavigate('checklist');}}><FontAwesomeIcon icon={faTasks} /> <span>Checklist</span></a>
                    <a href="#" className={activeSection==='history' ? 'active' : ''} onClick={(e)=>{e.preventDefault();onNavigate('history');}}><FontAwesomeIcon icon={faHistory} /> <span>Lịch sử</span></a>
                </nav>

                {/* Keep recent block for now only when chat view */}
                {activeSection === 'chat' && (
                    <div className="recent" style={{ marginTop: '14px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--muted)' }}>Gần đây</div>
                        <div className="item"><div>Checklist mở thẻ tín dụng</div><small>14:02 • hôm nay</small></div>
                        <div className="item"><div>So sánh NĐ 10 và 99</div><small>11:51 • hôm nay</small></div>
                        <div className="item"><div>Điều kiện vay thế chấp</div><small>09:33 • 2 Thg 8</small></div>
                    </div>
                )}
            </div>
            <div className="sidebar-footer">
                <button className="upgrade-btn" onClick={onOpenUpgradeModal}>
                    <FontAwesomeIcon icon={faRocket} /> Nâng cấp
                </button>
                <button className="footer-btn" id="theme-switcher" title="Chuyển đổi giao diện" onClick={onToggleTheme}>
                    <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
                    <span className="footer-btn-text">{theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}</span>
                </button>
                <button className="footer-btn" onClick={onLogout} title="Đăng xuất">
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span className="footer-btn-text">Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;