'use client';
/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary font-sans flex flex-col items-center w-full">
      {/* SECTION 1 — NAVBAR */}
      <nav className="w-full h-[60px] bg-background border-b-[0.5px] border-[#1e1e1e] px-[48px] flex justify-between items-center">
        <div className="text-[20px] font-medium text-accent tracking-[-0.5px]">Clarix</div>
        <div className="flex flex-row gap-[8px]">
          <button className="bg-transparent border-[0.5px] border-[#2a2a2a] text-[#aaaaaa] px-[18px] py-[8px] rounded-[8px] text-[13px] hover:border-[#444444] hover:text-text-primary transition-colors">
            How it works
          </button>
          <button className="bg-transparent border-[0.5px] border-[#2a2a2a] text-[#aaaaaa] px-[18px] py-[8px] rounded-[8px] text-[13px] hover:border-[#444444] hover:text-text-primary transition-colors">
            Docs
          </button>
          <Link href="/auth" className="bg-accent border-none text-background px-[18px] py-[8px] rounded-[8px] text-[13px] font-medium hover:bg-accent-hover transition-colors flex items-center justify-center">
            Get started
          </Link>
        </div>
      </nav>

      {/* SECTION 2 — HERO */}
      <header className="text-center pt-[90px] px-[48px] pb-[70px] max-w-[780px] mx-auto w-full flex flex-col items-center">
        {/* BADGE */}
        <div className="inline-flex items-center justify-center gap-[6px] bg-surface border-[0.5px] border-[#1e3a42] text-accent text-[12px] px-[14px] py-[5px] rounded-[20px] mb-[28px]">
          <div className="w-[6px] h-[6px] bg-accent rounded-full"></div>
          AI-Powered · Source Cited · Fully Isolated
        </div>

        {/* H1 HEADING */}
        <h1 className="text-[56px] font-medium leading-[1.1] tracking-[-1.5px] text-text-primary mb-[20px]">
          Your documents.<br />
          <span className="text-accent">Finally answerable.</span>
        </h1>

        {/* PARAGRAPH */}
        <p className="text-[16px] text-text-muted leading-[1.7] max-w-[520px] mx-auto mb-[36px]">
          Clarix lets your team ask questions in plain English and get instant answers pulled exclusively from your organisation's own documents — with source citations every time.
        </p>

        {/* CTA BUTTONS ROW */}
        <div className="flex flex-row justify-center gap-[12px] flex-wrap">
          <Link href="/auth" className="bg-accent border-none text-background px-[28px] py-[12px] rounded-[10px] text-[14px] font-medium hover:bg-accent-hover transition-colors flex items-center justify-center">
            Register your organisation
          </Link>
          <Link href="/auth" className="bg-transparent border-[0.5px] border-[#2a2a2a] text-[#aaaaaa] px-[28px] py-[12px] rounded-[10px] text-[14px] hover:border-[#444444] hover:text-text-primary transition-colors flex items-center justify-center">
            Employee login →
          </Link>
        </div>

        {/* PROOF POINTS ROW */}
        <div className="flex flex-row justify-center gap-[20px] flex-wrap mt-[44px]">
          {['No hallucinations', 'Data never leaves your org', 'Source cited every time'].map((text, i) => (
            <div key={i} className="flex flex-row items-center gap-[6px] text-[12px] text-[#555555]">
              <div className="w-[14px] h-[14px] bg-[#1a3a42] rounded-full flex items-center justify-center">
                <svg viewBox="0 0 8 8" className="w-[8px] h-[8px]">
                  <path d="M1 4l2 2 4-4" stroke="#00B4D8" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                </svg>
              </div>
              {text}
            </div>
          ))}
        </div>
      </header>

      {/* SECTION 3 — BROWSER MOCKUP PREVIEW */}
      <section className="px-[48px] pb-[60px] w-full max-w-[900px] mx-auto text-left">
        <div className="bg-surface border-[0.5px] border-[#1e1e1e] rounded-[16px] overflow-hidden">
          {/* BROWSER BAR */}
          <div className="bg-card border-b-[0.5px] border-[#1e1e1e] py-[12px] px-[16px] flex flex-row items-center gap-[8px]">
            <div className="w-[10px] h-[10px] rounded-full bg-[#3a2020]"></div>
            <div className="w-[10px] h-[10px] rounded-full bg-[#3a3020]"></div>
            <div className="w-[10px] h-[10px] rounded-full bg-[#1e3a20]"></div>
            <div className="flex-1 bg-background border-[0.5px] border-[#222222] rounded-[6px] py-[5px] px-[12px] text-[11px] text-[#444444] text-center mx-[8px]">
              app.clarix.ai/chat
            </div>
          </div>
          
          {/* PREVIEW BODY */}
          <div className="p-[24px] grid grid-cols-[200px_1fr] gap-[16px] min-h-[220px]">
            {/* LEFT — SIDEBAR PANEL */}
            <div className="bg-background border-[0.5px] border-[#1e1e1e] rounded-[10px] p-[16px] flex flex-col gap-[6px]">
              <div className="text-[#555555] py-[7px] px-[10px] rounded-[6px] text-[12px]">Dashboard</div>
              <div className="text-[#555555] py-[7px] px-[10px] rounded-[6px] text-[12px]">Upload</div>
              <div className="text-[#555555] py-[7px] px-[10px] rounded-[6px] text-[12px]">Documents</div>
              <div className="bg-[#0d2e38] text-accent py-[7px] px-[10px] rounded-[6px] text-[12px]">Chat</div>
              
              <div className="mt-auto border-t-[0.5px] border-[#1e1e1e] pt-[12px]">
                <div className="text-[11px] text-[#444444]">DemoTech Inc.</div>
                <div className="text-[10px] text-[#333333] mt-[2px]">Admin</div>
              </div>
            </div>

            {/* RIGHT — CHAT AREA */}
            <div className="flex flex-col gap-[12px]">
              {/* Message 1 */}
              <div className="self-end bg-accent text-background py-[10px] px-[14px] rounded-t-[12px] rounded-br-[2px] rounded-bl-[12px] text-[12px] max-w-[260px]">
                What is our work from home policy?
              </div>

              {/* Message 2 */}
              <div className="self-start bg-card border-[0.5px] border-[#1e1e1e] text-[#cccccc] py-[10px] px-[14px] rounded-t-[12px] rounded-br-[12px] rounded-bl-[2px] text-[12px] max-w-[340px]">
                Employees are allowed up to 3 days of remote work per week, subject to manager approval. Core hours of 10am–3pm must be maintained regardless of location.
                
                <div className="flex items-center gap-[4px] bg-[#0d2e38] text-accent text-[10px] py-[3px] px-[8px] rounded-[4px] mt-[6px] w-fit">
                  <svg viewBox="0 0 8 8" className="w-[8px] h-[8px]">
                    <rect x="1" y="1" width="6" height="6" rx="1" stroke="#00B4D8" strokeWidth="0.8" fill="none" />
                    <path d="M3 3h2M3 5h1" stroke="#00B4D8" strokeWidth="0.8" strokeLinecap="round" />
                  </svg>
                  hr_policy.pdf · page 4
                </div>
              </div>

              {/* Message 3 */}
              <div className="self-end bg-accent text-background py-[10px] px-[14px] rounded-t-[12px] rounded-br-[2px] rounded-bl-[12px] text-[12px] max-w-[260px]">
                Who leads the backend team?
              </div>

              {/* Message 4 (TYPING) */}
              <div className="self-start bg-card border-[0.5px] border-[#1e1e1e] text-[#cccccc] py-[10px] px-[14px] rounded-t-[12px] rounded-br-[12px] rounded-bl-[2px] text-[12px] max-w-[340px] flex flex-row gap-[4px] items-center h-[38px]">
                <div className="w-[6px] h-[6px] bg-[#333333] rounded-full animate-pulse-dot"></div>
                <div className="w-[6px] h-[6px] bg-[#333333] rounded-full animate-pulse-dot" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-[6px] h-[6px] bg-[#333333] rounded-full animate-pulse-dot" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — FEATURES GRID */}
      <section className="px-[48px] py-[60px] w-full max-w-[900px] mx-auto flex flex-col justify-center items-center">
        <div className="text-[11px] text-accent tracking-[1.5px] uppercase text-center mb-[14px]">Why Clarix</div>
        <h2 className="text-[28px] font-medium text-center text-text-primary mb-[8px] tracking-[-0.5px]">Everything your team needs</h2>
        <p className="text-center text-[#555555] text-[14px] mb-[40px]">Built for organisations that can't afford to waste time searching.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px] text-left w-full">
          {/* CARD 1 */}
          <div className="bg-surface border-[0.5px] border-[#1e1e1e] rounded-[12px] py-[24px] px-[20px]">
            <div className="w-[36px] h-[36px] bg-[#0d2e38] rounded-[8px] flex items-center justify-center mb-[14px]">
              <svg viewBox="0 0 16 16" className="w-[16px] h-[16px] fill-none stroke-[#00B4D8] stroke-[1]">
                <circle cx="8" cy="8" r="5.5" />
                <path d="M8 5.5v3l1.5 1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-[14px] font-medium text-text-primary mb-[6px]">Instant answers</div>
            <div className="text-[12px] text-[#555555] leading-[1.6]">Ask in plain English. Get answers in seconds from your actual documents — not the internet.</div>
          </div>

          {/* CARD 2 */}
          <div className="bg-surface border-[0.5px] border-[#1e1e1e] rounded-[12px] py-[24px] px-[20px]">
            <div className="w-[36px] h-[36px] bg-[#0d2e38] rounded-[8px] flex items-center justify-center mb-[14px]">
              <svg viewBox="0 0 16 16" className="w-[16px] h-[16px] fill-none stroke-[#00B4D8] stroke-[1]">
                <rect x="2" y="2" width="5" height="5" rx="1" />
                <rect x="9" y="2" width="5" height="5" rx="1" />
                <rect x="2" y="9" width="5" height="5" rx="1" />
                <rect x="9" y="9" width="5" height="5" rx="1" />
              </svg>
            </div>
            <div className="text-[14px] font-medium text-text-primary mb-[6px]">Complete isolation</div>
            <div className="text-[12px] text-[#555555] leading-[1.6]">Each organisation's data lives in its own private workspace. No cross-tenant access. Ever.</div>
          </div>

          {/* CARD 3 */}
          <div className="bg-surface border-[0.5px] border-[#1e1e1e] rounded-[12px] py-[24px] px-[20px]">
            <div className="w-[36px] h-[36px] bg-[#0d2e38] rounded-[8px] flex items-center justify-center mb-[14px]">
              <svg viewBox="0 0 16 16" className="w-[16px] h-[16px] fill-none stroke-[#00B4D8] stroke-[1]" strokeLinecap="round">
                <path d="M3 4h10M3 8h7M3 12h5" />
              </svg>
            </div>
            <div className="text-[14px] font-medium text-text-primary mb-[6px]">Source citations</div>
            <div className="text-[12px] text-[#555555] leading-[1.6]">Every answer shows exactly which document and page it came from. No guessing, no trust issues.</div>
          </div>

          {/* CARD 4 */}
          <div className="bg-surface border-[0.5px] border-[#1e1e1e] rounded-[12px] py-[24px] px-[20px]">
            <div className="w-[36px] h-[36px] bg-[#0d2e38] rounded-[8px] flex items-center justify-center mb-[14px]">
              <svg viewBox="0 0 16 16" className="w-[16px] h-[16px] fill-none stroke-[#00B4D8] stroke-[1]" strokeLinecap="round">
                <rect x="3" y="1" width="8" height="10" rx="1" />
                <path d="M7 1v4h4" />
                <path d="M5 8h4M5 10.5h2" />
              </svg>
            </div>
            <div className="text-[14px] font-medium text-text-primary mb-[6px]">PDF, DOCX, CSV</div>
            <div className="text-[12px] text-[#555555] leading-[1.6]">Upload any document type. Clarix parses, chunks, and indexes it automatically in the background.</div>
          </div>

          {/* CARD 5 */}
          <div className="bg-surface border-[0.5px] border-[#1e1e1e] rounded-[12px] py-[24px] px-[20px]">
            <div className="w-[36px] h-[36px] bg-[#0d2e38] rounded-[8px] flex items-center justify-center mb-[14px]">
              <svg viewBox="0 0 16 16" className="w-[16px] h-[16px] fill-none stroke-[#00B4D8] stroke-[1]" strokeLinejoin="round">
                <path d="M8 3L3 6v4l5 3 5-3V6L8 3z" />
              </svg>
            </div>
            <div className="text-[14px] font-medium text-text-primary mb-[6px]">Role-based access</div>
            <div className="text-[12px] text-[#555555] leading-[1.6]">Admins manage and delete. Employees query. Each role sees exactly what they're supposed to.</div>
          </div>

          {/* CARD 6 */}
          <div className="bg-surface border-[0.5px] border-[#1e1e1e] rounded-[12px] py-[24px] px-[20px]">
            <div className="w-[36px] h-[36px] bg-[#0d2e38] rounded-[8px] flex items-center justify-center mb-[14px]">
              <svg viewBox="0 0 16 16" className="w-[16px] h-[16px] fill-none stroke-[#00B4D8] stroke-[1]" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="5.5" />
                <path d="M6 8l1.5 1.5L10 6" />
              </svg>
            </div>
            <div className="text-[14px] font-medium text-text-primary mb-[6px]">No hallucinations</div>
            <div className="text-[12px] text-[#555555] leading-[1.6]">The AI is strictly instructed to answer only from your documents or say it doesn't know.</div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — HOW IT WORKS */}
      <section className="px-[48px] py-[60px] w-full max-w-[900px] mx-auto text-center flex flex-col justify-center items-center">
        <div className="text-[11px] text-accent tracking-[1.5px] uppercase mb-[14px]">How it works</div>
        <h2 className="text-[28px] font-medium text-text-primary mb-[40px] tracking-[-0.5px]">Four steps. Zero friction.</h2>
        
        <div className="grid grid-cols-4 gap-0 relative w-full">
          {/* Horizontal line */}
          <div className="absolute top-[18px] left-[12.5%] right-[12.5%] h-[0.5px] bg-[#1e1e1e] z-[0]"></div>

          {[
            { num: "01", title: "Register your org", desc: "Create a private workspace for your company in seconds" },
            { num: "02", title: "Upload documents", desc: "Drag and drop PDFs, Word files, or spreadsheets" },
            { num: "03", title: "Clarix indexes", desc: "AI reads, chunks, and embeds your documents automatically" },
            { num: "04", title: "Ask anything", desc: "Get cited answers from your docs instantly" }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center px-[8px]">
              <div className="w-[36px] h-[36px] rounded-full bg-surface border-[0.5px] border-[#1e1e1e] flex items-center justify-center text-[12px] text-accent mb-[12px] relative z-[1]">
                {item.num}
              </div>
              <div className="text-[13px] font-medium text-text-primary mb-[4px]">{item.title}</div>
              <div className="text-[11px] text-[#555555] leading-[1.5]">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6 — BOTTOM CTA */}
      <section className="w-full py-[60px] px-[48px] text-center border-t-[0.5px] border-[#161616] flex flex-col items-center justify-center">
        <h2 className="text-[28px] font-medium text-text-primary mb-[8px] tracking-[-0.5px]">Ready to stop searching?</h2>
        <p className="text-[#555555] text-[14px] mb-[28px]">Your documents have the answers. Clarix makes them reachable.</p>
        <Link href="/auth" className="bg-accent border-none text-background px-[28px] py-[12px] rounded-[10px] text-[14px] font-medium hover:bg-accent-hover transition-colors flex items-center justify-center">
          Register your organisation →
        </Link>
      </section>

      {/* SECTION 7 — FOOTER */}
      <footer className="w-full py-[20px] px-[48px] border-t-[0.5px] border-[#161616] flex justify-between items-center mt-auto">
        <div className="text-[14px] text-accent font-medium">Clarix</div>
        <div className="text-[11px] text-[#333333]">Your knowledge. Finally within reach.</div>
      </footer>
    </div>
  );
}
