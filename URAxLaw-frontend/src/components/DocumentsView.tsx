import React, { useEffect, useState, useMemo } from 'react';
import { getDocumentsPaginated, type PaginatedDocumentsResponse } from '../api/client';

interface DocItem {
  id?: string;
  document_id?: string;
  doc_symbol?: string;
  symbol?: string;
  title?: string;
  name?: string;
  [key: string]: any;
}

const DocumentsView: React.FC = () => {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<DocItem | null>(null);

  const fetchPage = async (p: number, ps: number) => {
    setLoading(true); setError(null);
    try {
      const res: PaginatedDocumentsResponse = await getDocumentsPaginated({ page: p, page_size: ps, status_filter: 'processed' });
      setDocs(res.documents || []);
      setTotalPages(res.pagination.total_pages);
      setTotalCount(res.pagination.total_count);
      setStatusCounts(res.status_counts || {});
    } catch (e: any) {
      setError(e?.message || 'Không tải được danh sách văn bản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPage(page, pageSize); }, [page, pageSize]);

  const filtered = useMemo(() => {
    if (!query.trim()) return docs;
    const q = query.toLowerCase();
    return docs.filter(d => [d.id, d.file_path, d.document?.document_id, d.document?.doc_symbol, d.document?.title, d.title]
      .filter(Boolean)
      .some(v => String(v).toLowerCase().includes(q)));
  }, [docs, query]);

  const openModal = (doc: DocItem) => setSelected(doc);
  const closeModal = () => setSelected(null);

  return (
    <main className="documents-view">
      <header className="docs-header">
        <div className="docs-header-text">
          <h2>Danh sách văn bản</h2>
          <p>Tra cứu các văn bản pháp luật đã được nạp vào hệ thống.</p>
        </div>
        <div className="docs-toolbar" aria-label="Thanh công cụ văn bản">
          <input
            className="docs-search"
            placeholder="Tìm theo ký hiệu, tiêu đề..."
            value={query}
            onChange={e => { setPage(1); setQuery(e.target.value); }}
            aria-label="Tìm kiếm văn bản"
          />
          <select
            className="docs-select pagesize"
            value={pageSize}
            onChange={e => { setPage(1); setPageSize(Number(e.target.value)); }}
            aria-label="Kích thước trang"
          >
            {[10, 20, 50].map(n => <option key={n} value={n}>{n}/trang</option>)}
          </select>
          <button className="docs-btn" onClick={() => fetchPage(page, pageSize)} disabled={loading}>{loading ? '…' : 'Tải lại'}</button>
        </div>
        <div className="docs-meta" aria-live="polite">
          Tổng: {totalCount} • Trang {page}/{totalPages} {statusCounts.processed !== undefined && `• Processed: ${statusCounts.processed}`}
        </div>
      </header>

      <section className="docs-body">
        {loading && <div className="loading-msg">Đang tải dữ liệu…</div>}
        {error && <div className="error-msg">{error}</div>}
        {!loading && !error && (
          <>
            <div className="docs-count">{filtered.length} văn bản hiển thị (trong {docs.length} của trang hiện tại)</div>
            {filtered.length === 0 && <div className="empty-msg">Không có văn bản phù hợp.</div>}
            <div className="docs-grid">
              {filtered.map((d, idx) => {
                const code = d.document?.doc_symbol || d.document?.document_id || d.doc_symbol || d.id || `#${idx + 1}`;
                const title = d.document?.title || d.title || d.file_path || '—';
                return (
                  <div key={code + idx} className="doc-card" onClick={() => openModal(d)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') openModal(d); }} aria-label={`Mở chi tiết văn bản ${code}`}>
                    {/*<div className="doc-code">{code}</div>*/}
                    <div className="doc-title">{title}</div>
                    <div className="doc-updated">Cập nhật: {d.updated_at ? new Date(d.updated_at).toLocaleString() : '—'}</div>
                  </div>
                );
              })}
            </div>
            <div className="docs-pagination" aria-label="Phân trang">
              <button className="docs-btn" disabled={page <= 1 || loading} onClick={() => setPage(p => Math.max(1, p - 1))}>Trang trước</button>
              <button className="docs-btn" disabled={page >= totalPages || loading} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Trang sau</button>
              <span className="page-indicator">Trang {page}/{totalPages}</span>
              <input
                className="docs-select goto"
                type="number"
                min={1}
                max={totalPages}
                value={page}
                onChange={e => {
                  const v = Number(e.target.value) || 1; setPage(Math.min(Math.max(1, v), totalPages));
                }}
                aria-label="Đi tới trang"
              />
            </div>
          </>
        )}
      </section>

      {selected && (
        <div className="modal-overlay active" role="dialog" aria-modal="true" onClick={closeModal}>
          <div className="modal-content doc-detail-modal" onClick={e => e.stopPropagation()}>
            <span className="modal-close" onClick={closeModal} aria-label="Đóng">&times;</span>
            <div className="modal-header">
              <h2>Chi tiết văn bản</h2>
              <p className="subtitle">Thông tin raw được hiển thị để hỗ trợ debug / tra cứu nhanh.</p>
            </div>
            <div className="detail-grid">
              {Object.entries(selected).filter(([k]) => k !== 'content_summary').map(([k, v]) => (
                <div key={k} className="detail-item">
                  <div className="detail-key">{k}</div>
                  <div className="detail-value">
                    {typeof v === 'object' ? (
                      <pre>{JSON.stringify(v, null, 2)}</pre>
                    ) : (
                      String(v)
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default DocumentsView;
