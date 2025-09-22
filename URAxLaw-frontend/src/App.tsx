import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import Panel from './components/Panel';
import UpgradeModal from './components/UpgradeModal';
import DocumentsView from './components/DocumentsView';
import type { Message } from './types';
import { streamChatQuery, retrieveContextOnce } from './api/client';
import ReasoningModal from './components/ReasoningModal';
import type { ReasoningPhase } from './components/ReasoningModal';
import type { AgentPipelineState } from './components/AgentPipeline';

// Message type now comes solely from ./types to avoid duplication

// small helper
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

function App() {
    const [theme, setTheme] = useState('light');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'initial-bot-message',
            sender: 'bot',
            content: `**Xin chào!** Tôi là trợ lý pháp lý URA-xLaw. Tôi có thể giúp bạn tra cứu, so sánh, và tạo checklist tuân thủ từ các văn bản pháp luật ngân hàng.  
  
Bạn có thể thử các câu hỏi sau hoặc dùng các nút "Tác vụ Nâng cao" ở thanh bên phải:

*   \`Điều kiện cho vay thế chấp là gì?\`
*   \`Tạo checklist tuân thủ cho việc mở thẻ tín dụng\`
*   \`So sánh Nghị định 10/2023 và 99/2022 về đăng ký tsđb\``
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [activeSection, setActiveSection] = useState<'chat' | 'documents' | 'checklist' | 'history'>('chat');
    const [reasoningOpen, setReasoningOpen] = useState(false);
    const [pipeline, setPipeline] = useState<AgentPipelineState>({
        intent: { status: 'idle' },
        retriever: { status: 'idle' },
        applicability: { status: 'idle' },
        citation: { status: 'idle' },
        llm: { status: 'idle' }
    });
    const [reasoningPhase, setReasoningPhase] = useState<ReasoningPhase>('idle');
    const [retrievalContent, setRetrievalContent] = useState('');
    const [reasoningLine, setReasoningLine] = useState('');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    const handleSendMessage = async (query: string) => {
        if (!query.trim()) return;

        const userMessage = { id: `user-${Date.now()}`, sender: 'user' as const, content: query };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        const normalized = query.trim().toLowerCase();
        // CANNED RESPONSES — no backend with typing effect (no visible placeholder text)
        if (normalized === 'checklist mở thẻ tín dụng') {
            const botId = `bot-${Date.now()}`;
            await sleep(5000); // slight think delay

            const header = `### Checklist: Mở Thẻ Tín Dụng\n\n<span class="status-badge valid">Còn hiệu lực</span>\n\n`;
            const li = [
                `<li>Nhận diện và xác minh thông tin khách hàng (KYC).<span class="cite">Trích dẫn: Điều 10, TT 19/2016/TT-NHNN</span></li>`,
                `<li>Yêu cầu khách hàng điền vào giấy đề nghị phát hành thẻ theo mẫu của TCTD.<span class="cite">Khoản 1, Điều 10, TT 19/2016</span></li>`,
                `<li>Thu thập và thẩm định hồ sơ chứng minh nhân thân (CCCD/Hộ chiếu).<span class="cite">Phụ lục, TT 19/2016</span></li>`,
                `<li>Thu thập và thẩm định hồ sơ chứng minh khả năng tài chính (HĐLĐ, sao kê lương).<span class="cite">Quy định nội bộ</span></li>`,
                `<li>Kiểm tra lịch sử tín dụng của khách hàng trên CIC.<span class="cite">Điều 9, TT 03/2013/TT-NHNN</span></li>`,
                `<li>Ký kết hợp đồng phát hành và sử dụng thẻ với khách hàng.<span class="cite">Điều 13, TT 19/2016</span></li>`
            ];
            const renderList = (count: number) => `<div class="checklist">\n<ul>\n${li.slice(0, count).join('\n')}\n</ul>\n</div>`;

            // push initial header with empty list
            setMessages(prev => [...prev, { id: botId, sender: 'bot' as const, content: header + renderList(0) }]);
            for (let i = 1; i <= li.length; i++) {
                setMessages(prev => prev.map(m => m.id === botId ? { ...m, content: header + renderList(i) } : m));
                await sleep(180);
            }
            return;
        }

        if (normalized === 'so sánh nghị định 10/2023 và 99/2022 về đăng ký tsđb') {
            const botId = `bot-${Date.now()}`;
            await sleep(5000); // slight think delay

            const header = `### Diff & Redline: Đăng ký Tài sản bảo đảm\n\n<span class="status-badge valid">Phân tích thay đổi</span>\n\n`;
            const p1 = `<p>“Đã chuẩn hóa thuật ngữ 'TSDB' thành 'Tài sản bảo đảm'.”</p>`;
            const p2 = `<p>Đoạn mô tả sự thay đổi giữa NĐ 99/2022 và NĐ 10/2023.</p>`;
            const p3 = `<p><strong>Phần tác động nghiệp vụ:</strong> “Việc bổ sung hình thức cấp bản sao điện tử giúp đẩy nhanh quá trình xử lý hồ sơ, giảm thiểu thủ tục giấy tờ cho cả ngân hàng và khách hàng.”</p>`;
            const li1 = `<li><strong>Quy định cũ (NĐ 99/2022):</strong> Cơ quan đăng ký cấp văn bản chứng nhận đăng ký biện pháp bảo đảm dưới dạng văn bản giấy.</li>`;
            const li2 = `<li><strong>Quy định mới (NĐ 10/2023):</strong> Cơ quan đăng ký cấp văn bản chứng nhận dưới dạng văn bản giấy hoặc văn bản điện tử có giá trị pháp lý tương đương.</li>`;

            const steps = [
                p1,
                p1 + p2,
                p1 + p2 + p3,
                p1 + p2 + p3 + `<ul>${li1}</ul>`,
                p1 + p2 + p3 + `<ul>${li1}${li2}</ul>`
            ];

            // push initial header only
            setMessages(prev => [...prev, { id: botId, sender: 'bot' as const, content: header }]);
            for (let i = 0; i < steps.length; i++) {
                const content = header + steps[i];
                setMessages(prev => prev.map(m => m.id === botId ? { ...m, content } : m));
                await sleep(220);
            }
            return;
        }

        const botMessageId = `bot-${Date.now()}`;
        const thinkingMessage = { id: botMessageId, sender: 'bot' as const, content: `<i class="fas fa-spinner fa-spin"></i> URA đang áp dụng các agent (Retriever, Applicability, Citation...) để xử lý...` };
        setMessages(prev => [...prev, thinkingMessage]);

        // Prep for reasoning and pipeline visualization
        setRetrievalContent('');
        setReasoningPhase('retrieving');
        setPipeline({
            intent: { status: 'detecting' },
            retriever: { status: 'waiting' },
            applicability: { status: 'idle' },
            citation: { status: 'idle' },
            llm: { status: 'intentPending' }
        });
        setReasoningLine('Intent agent đang phân loại câu hỏi');

        // Simulate LLM intent classification (UI only)
        // In a real scenario, other intents would be handled here
        const intentName = 'Tạo checklist';
        await new Promise(res => setTimeout(res, 400));
        setPipeline(prev => ({
            ...prev,
            intent: { status: 'valid', intentName },
            llm: { status: 'intentDone', intentName },
            retriever: { status: 'retrieving' }
        }));
        setReasoningLine('Retriever agent đang truy xuất tài liệu');

        const historyForRequest = [...messages, userMessage];
        let retrievalFailed = false;
        let retrievedHasContent = false; // capture immediately

        // 1. Retrieval phase: Get context without streaming to the main chat
        await retrieveContextOnce({
            query,
            messages: historyForRequest,
            onResult: (content) => {
                setRetrievalContent(content);
                setReasoningPhase('retrieved');
                const hasContent = (content?.trim().length ?? 0) > 0;
                retrievedHasContent = hasContent;
                // Parse counts for entities / relationships / document chunks
                let eCount: number | undefined; let rCount: number | undefined; let dCount: number | undefined;
                if (hasContent) {
                    try {
                        const section = (name: string) => {
                            const rx = new RegExp(`-----${name}-----\\s*([\\s\\S]*?)(?=-----|$)`);
                            const m = content.match(rx); return m && m[1] ? m[1].trim() : '';
                        };
                        const parseArr = (raw: string): unknown[] | null => {
                            if (!raw) return null;
                            let txt = raw;
                            if (txt.startsWith('```')) { txt = txt.replace(/^```[a-zA-Z0-9_-]*\s*/, ''); const idx = txt.lastIndexOf('```'); if (idx !== -1) txt = txt.slice(0, idx); }
                            txt = txt.trim();
                            const firstBracket = txt.indexOf('['); const lastBracket = txt.lastIndexOf(']');
                            if (firstBracket !== -1 && lastBracket > firstBracket) {
                                const cand = txt.slice(firstBracket, lastBracket + 1);
                                try { const arr: unknown = JSON.parse(cand); return Array.isArray(arr) ? arr as unknown[] : null; } catch { /* ignore malformed segment */ }
                            }
                            try { const parsed: unknown = JSON.parse(txt); return Array.isArray(parsed) ? parsed as unknown[] : null; } catch { /* ignore malformed root */ }
                            return null;
                        };
                        const ents = parseArr(section('Entities\\(KG\\)')); if (ents) eCount = ents.length;
                        const rels = parseArr(section('Relationships\\(KG\\)')); if (rels) rCount = rels.length;
                        const docs = parseArr(section('Document Chunks\\(DC\\)')); if (docs) dCount = docs.length;
                    } catch { /* ignore parse errors */ }
                }
                const fakeDocCount = hasContent ? (dCount ?? Math.floor(Math.random()*5)+4) : 0; // fallback
                setPipeline(prev => ({
                    ...prev,
                    retriever: { status: hasContent ? 'success' : 'empty', info: hasContent ? `Đã tìm thấy ${fakeDocCount} tài liệu` : 'Không tìm thấy ngữ cảnh', eCount, rCount, dCount },
                    applicability: hasContent ? { status: 'processing' } : prev.applicability,
                    llm: hasContent ? { status: 'answerPending', intentName } : prev.llm
                }));
                if (hasContent) {
                    setReasoningLine(`Đã tìm thấy ${fakeDocCount} tài liệu liên quan đến câu hỏi`);
                }
            },
            onError: () => {
                retrievalFailed = true;
                setReasoningPhase('idle');
                setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, content: 'Đã có lỗi xảy ra khi truy vấn ngữ cảnh.' } : m));
                setPipeline(prev => ({ ...prev, retriever: { status: 'error' }, llm: prev.llm }));
            }
        });

        // Stop if retrieval failed or returned no content (use immediate flag to avoid stale state race)
        if (retrievalFailed || !retrievedHasContent) {
            if (!retrievalFailed) {
                setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, content: 'Không tìm thấy tài liệu phù hợp để trả lời câu hỏi của bạn.' } : m));
            }
            return;
        }

        // 2. Applicability & Effectivity phase (simulate)
        setReasoningLine('Applicability agent đang đánh giá hiệu lực văn bản');
        await new Promise(res => setTimeout(res, 500));
        setPipeline(prev => ({
            ...prev,
            applicability: { status: 'done', summary: '3/3 văn bản còn hiệu lực' },
            citation: { status: 'auditing' },
        }));
        setReasoningLine('Citation agent đang hậu kiểm trích dẫn & guardrail');
        await new Promise(res => setTimeout(res, 600));
        // Random flag/no flag for demo
        const flagged = Math.random() < 0.25;
        setPipeline(prev => ({
            ...prev,
            citation: flagged ? { status: 'flagged', issues: 'Thiếu điều khoản phụ' } : { status: 'passed' },
            llm: { status: 'answerPending', intentName }
        }));
        setReasoningLine('LLM chuẩn bị tạo câu trả lời cuối');

        // 3. Generation phase: Stream the final answer to the chat window
        setReasoningPhase('generating');
        setPipeline(prev => ({ ...prev, llm: { status: 'answerGenerating', intentName } }));
        let accumulated = '';

        await streamChatQuery({
            query,
            messages: historyForRequest,
            overrides: { only_need_context: false },
            onToken: (delta) => {
                accumulated += delta;
                setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, content: accumulated } : m));
            },
            onError: () => {
                setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, content: 'Đã có lỗi xảy ra khi tạo câu trả lời.' } : m));
                setReasoningPhase('idle');
                setPipeline(prev => ({ ...prev, llm: { status: 'error', intentName } }));
            },
            onComplete: () => {
                setReasoningPhase('idle');
                setPipeline(prev => ({ ...prev, llm: { status: 'answerDone', intentName } }));
                setReasoningLine('Hoàn tất');
            }
        });
    };

    const handleShortcut = (text: string) => {
        setInputValue(text);
        handleSendMessage(text);
    };

    return (
        <>
            {!isLoggedIn ? (
                <div id="login-screen" className="screen active">
                    <LoginScreen onLogin={handleLogin} />
                </div>
            ) : (
                <div id="app-screen" className="screen active">
                    <div className={`app ${activeSection === 'documents' ? 'documents-mode' : ''}`} role="application" aria-label="URA-xLaw Chatbot">
                        <Sidebar
                            theme={theme}
                            onToggleTheme={toggleTheme}
                            onLogout={handleLogout}
                            onOpenUpgradeModal={() => setIsModalOpen(true)}
                            onNavigate={(section) => setActiveSection(section)}
                            activeSection={activeSection}
                        />
                        {activeSection === 'chat' && (
                            <ChatWindow
                                messages={messages}
                                inputValue={inputValue}
                                setInputValue={setInputValue}
                                onSendMessage={handleSendMessage}
                                onOpenReasoningModal={() => setReasoningOpen(true)}
                                hasRetrievalContext={!!retrievalContent}
                                reasoningLine={reasoningLine}
                            />
                        )}
                        {activeSection === 'documents' && (
                            <DocumentsView />
                        )}
                        {activeSection !== 'documents' && activeSection === 'chat' && (
                            <Panel onShortcutClick={handleShortcut} />
                        )}
                        {activeSection !== 'chat' && activeSection !== 'documents' && (
                            <main className="placeholder" style={{ padding: '24px', flex: 1 }}>
                                <h2 style={{ marginTop: 0 }}>
                                    {activeSection === 'checklist' ? 'Checklist (đang phát triển)' : 'Lịch sử (đang phát triển)'}
                                </h2>
                                <p>Bạn hãy quay lại sau.</p>
                            </main>
                        )}
                    </div>
                </div>
            )}
            <UpgradeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
            <ReasoningModal
                isOpen={reasoningOpen}
                phase={reasoningPhase}
                retrievalContent={retrievalContent}
                pipelineState={pipeline}
                onClose={() => setReasoningOpen(false)}
            />
        </>
    );
}

export default App;
