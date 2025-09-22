import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faTasks, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';

interface PanelProps {
    onShortcutClick: (text: string) => void;
}

const Panel: React.FC<PanelProps> = ({ onShortcutClick }) => {
    return (
        <aside className="panel" aria-label="Tài liệu tham khảo">
            <h3>Tham chiếu nhanh</h3>
            <div className="doc-card">
                <div className="title"><FontAwesomeIcon icon={faFileAlt} /> Thông tư 39/2016/TT-NHNN</div>
                <div className="meta">Quy định về hoạt động cho vay</div>
            </div>
            <div className="doc-card">
                <div className="title"><FontAwesomeIcon icon={faFileAlt} /> Thông tư 19/2016/TT-NHNN</div>
                <div className="meta">Quy định về hoạt động thẻ ngân hàng</div>
            </div>

            <h3 style={{ marginTop: '16px' }}>Tác vụ Nâng cao</h3>
            <div className="shortcuts">
                <div className="chip" onClick={() => onShortcutClick('Tạo checklist tuân thủ cho việc mở thẻ tín dụng')}>
                    <FontAwesomeIcon icon={faTasks} /> Tạo Checklist
                </div>
                <div className="chip" onClick={() => onShortcutClick('So sánh Nghị định 10/2023 và 99/2022 về đăng ký tsđb')}>
                    <FontAwesomeIcon icon={faExchangeAlt} /> So sánh Văn bản
                </div>
            </div>
        </aside>
    );
};

export default Panel;