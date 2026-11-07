// Generated from the original console markup by html2jsx. Static design preview.
export default function AuditPanel() {
  return (
    <>
<main style={{"flex": "1 1 0%", "width": "100%", "maxWidth": "1320px", "padding": "28px 32px 56px"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "flex-end", "justifyContent": "space-between", "gap": "16px"}}>
<div style={{"minWidth": "0px", "maxWidth": "780px"}}>
<h1 style={{"margin": "0px", "font": "800 30px / 1.2 Manrope, system-ui, sans-serif", "letterSpacing": "-0.02em", "color": "rgb(21, 33, 28)"}}>
Evidence
</h1>
<p style={{"margin": "6px 0px 0px", "fontSize": "15.5px", "color": "rgb(90, 105, 97)"}}>
Every run writes a step-by-step log, links each entry to the one before it, and signs the result. Change a single entry and the receipt stops checking out.
</p>
</div>
<div style={{"display": "flex", "flexWrap": "wrap", "gap": "10px"}}>
<button type="button" className="c-btn c-sec" style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "40px", "padding": "0px 16px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "color": "rgb(21, 33, 28)", "font": "600 14.5px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M12 4v12M6 10l6 6 6-6M5 20h14">
</path>
</svg>
Export HTML report
</button>
<a className="c-btn c-pri" href="#verify" style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "40px", "padding": "0px 16px", "borderRadius": "10px", "background": "rgb(47, 111, 91)", "color": "rgb(255, 255, 255)", "fontSize": "14.5px", "fontWeight": "600", "textDecoration": "none"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
Verify a bundle
</a>
</div>
</div>
<section aria-labelledby="ev-latest" style={{"marginTop": "20px", "padding": "22px", "borderRadius": "18px", "background": "rgb(15, 29, 23)", "color": "rgb(215, 231, 221)"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "flex-start", "justifyContent": "space-between", "gap": "14px"}}>
<div>
<div style={{"fontSize": "13px", "fontWeight": "700", "letterSpacing": "0.06em", "textTransform": "uppercase", "color": "rgb(143, 179, 160)"}}>
Latest receipt
</div>
<h2 id="ev-latest" style={{"margin": "4px 0px 0px", "font": "800 22px / 1.25 Manrope, system-ui, sans-serif", "color": "rgb(255, 255, 255)"}}>
run_40549cd06baf
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "14px", "color": "rgb(169, 196, 182)"}}>
Nov 6, 2026 · 08:40:27 UTC · local run · 393 ms
</p>
</div>
<span data-anim="1" style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "34px", "padding": "0px 14px", "borderRadius": "999px", "background": "rgb(127, 214, 174)", "color": "rgb(15, 29, 23)", "fontSize": "14px", "fontWeight": "800", "animation": "0.3s ease 0s 1 normal both running c-pop"}}>
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
<span className="sc-interp">
Valid chain
</span>
</span>
</div>
<dl style={{"margin": "18px 0px 0px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", "gap": "14px 24px", "fontSize": "14px"}}>
<div>
<dt style={{"color": "rgb(169, 196, 182)"}}>
Merkle root
</dt>
<dd style={{"margin": "2px 0px 0px", "fontFamily": "\"JetBrains Mono\", monospace", "color": "rgb(255, 255, 255)", "overflowWrap": "anywhere"}}>
e2114ac9fab789cbffd7cebba2fab189 58a23ec41bbdc0af7a0f3f1ba8f6aece
</dd>
</div>
<div>
<dt style={{"color": "rgb(169, 196, 182)"}}>
Signature · HMAC-SHA256
</dt>
<dd style={{"margin": "2px 0px 0px", "fontFamily": "\"JetBrains Mono\", monospace", "color": "rgb(255, 255, 255)", "overflowWrap": "anywhere"}}>
3c05ca9c533fb6903624f8188ec698b9 13c3bfad569c8c8562b74efcc2ef0a24
</dd>
</div>
<div>
<dt style={{"color": "rgb(169, 196, 182)"}}>
Signing key
</dt>
<dd style={{"margin": "2px 0px 0px", "fontFamily": "\"JetBrains Mono\", monospace", "color": "rgb(255, 255, 255)"}}>
airlock-signer-key-id-01
</dd>
</div>
</dl>
<div style={{"marginTop": "18px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(150px, 100%), 1fr))", "gap": "10px"}}>
<div style={{"padding": "12px 14px", "borderRadius": "12px", "background": "rgb(23, 43, 34)"}}>
<div style={{"font": "700 22px / 1.1 \"DM Sans\", system-ui, sans-serif", "color": "rgb(255, 255, 255)"}}>
5
</div>
<div style={{"fontSize": "12.5px", "color": "rgb(169, 196, 182)"}}>
ledger blocks
</div>
</div>
<div style={{"padding": "12px 14px", "borderRadius": "12px", "background": "rgb(23, 43, 34)"}}>
<div style={{"font": "700 22px / 1.1 \"DM Sans\", system-ui, sans-serif", "color": "rgb(255, 255, 255)"}}>
2
</div>
<div style={{"fontSize": "12.5px", "color": "rgb(169, 196, 182)"}}>
stand-in keys configured
</div>
</div>
<div style={{"padding": "12px 14px", "borderRadius": "12px", "background": "rgb(23, 43, 34)"}}>
<div style={{"font": "700 22px / 1.1 \"DM Sans\", system-ui, sans-serif", "color": "rgb(255, 255, 255)"}}>
1
</div>
<div style={{"fontSize": "12.5px", "color": "rgb(169, 196, 182)"}}>
request blocked
</div>
</div>
<div style={{"padding": "12px 14px", "borderRadius": "12px", "background": "rgb(23, 43, 34)"}}>
<div style={{"font": "700 22px / 1.1 \"DM Sans\", system-ui, sans-serif", "color": "rgb(255, 255, 255)"}}>
0
</div>
<div style={{"fontSize": "12.5px", "color": "rgb(169, 196, 182)"}}>
requests allowed out
</div>
</div>
<div style={{"padding": "12px 14px", "borderRadius": "12px", "background": "rgb(23, 43, 34)"}}>
<div style={{"font": "700 16px / 1.4 \"DM Sans\", system-ui, sans-serif", "color": "rgb(255, 255, 255)"}}>
Not measured
</div>
<div style={{"fontSize": "12.5px", "color": "rgb(169, 196, 182)"}}>
real secrets in sandbox
</div>
</div>
</div>
</section>
<section aria-labelledby="ev-chain" style={{"marginTop": "14px", "padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "flex-start", "justifyContent": "space-between", "gap": "12px"}}>
<div>
<h2 id="ev-chain" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
The ledger, link by link
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Each block stores the hash of the block before it. Try changing one to see why tampering shows.
</p>
</div>
<button type="button" className="c-btn c-sec" aria-pressed="false" style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "38px", "padding": "0px 14px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "color": "rgb(21, 33, 28)", "font": "600 14px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4">
</path>
</svg>
<span className="sc-interp">
Tamper with block #2
</span>
</button>
</div>
<ol style={{"listStyle": "none", "margin": "18px 0px 0px", "padding": "0px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(170px, 100%), 1fr))", "gap": "12px"}}>
<li data-anim="1" style={{"position": "relative", "padding": "14px", "border": "2px solid rgb(207, 227, 215)", "borderRadius": "14px", "background": "rgb(255, 255, 255)", "fontFamily": "\"JetBrains Mono\", monospace", "animation": "0.35s ease 0s 1 normal both running c-pop"}}>
<div style={{"display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "8px", "fontSize": "12px", "fontWeight": "700", "color": "rgb(31, 107, 79)"}}>
<span>
#
<span className="sc-interp">
0
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "4px"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
<span className="sc-interp">
linked
</span>
</span>
</div>
<div style={{"marginTop": "8px", "fontSize": "13px", "fontWeight": "700", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
EXEC_START
</span>
</div>
<div style={{"marginTop": "2px", "fontFamily": "\"DM Sans\", system-ui, sans-serif", "fontSize": "12.5px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
Run began · checkout-flow
</span>
</div>
<div style={{"marginTop": "10px", "display": "grid", "gap": "2px", "fontSize": "12px", "color": "rgb(90, 105, 97)"}}>
<span>
prev{" "}
<span style={{"color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
00000000
</span>
</span>
</span>
<span>
hash{" "}
<span style={{"color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
4f1c2a9e
</span>
</span>
</span>
</div>
</li>
<li data-anim="1" style={{"position": "relative", "padding": "14px", "border": "2px solid rgb(207, 227, 215)", "borderRadius": "14px", "background": "rgb(255, 255, 255)", "fontFamily": "\"JetBrains Mono\", monospace", "animation": "0.35s ease 0.08s 1 normal both running c-pop"}}>
<div style={{"display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "8px", "fontSize": "12px", "fontWeight": "700", "color": "rgb(31, 107, 79)"}}>
<span>
#
<span className="sc-interp">
1
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "4px"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
<span className="sc-interp">
linked
</span>
</span>
</div>
<div style={{"marginTop": "8px", "fontSize": "13px", "fontWeight": "700", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
SECRET_SWAP
</span>
</div>
<div style={{"marginTop": "2px", "fontFamily": "\"DM Sans\", system-ui, sans-serif", "fontSize": "12.5px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
STRIPE_KEY stand-in replaced
</span>
</div>
<div style={{"marginTop": "10px", "display": "grid", "gap": "2px", "fontSize": "12px", "color": "rgb(90, 105, 97)"}}>
<span>
prev{" "}
<span style={{"color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
4f1c2a9e
</span>
</span>
</span>
<span>
hash{" "}
<span style={{"color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
9b02d7c1
</span>
</span>
</span>
</div>
</li>
<li data-anim="1" style={{"position": "relative", "padding": "14px", "border": "2px solid rgb(207, 227, 215)", "borderRadius": "14px", "background": "rgb(255, 255, 255)", "fontFamily": "\"JetBrains Mono\", monospace", "animation": "0.35s ease 0.16s 1 normal both running c-pop"}}>
<div style={{"display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "8px", "fontSize": "12px", "fontWeight": "700", "color": "rgb(31, 107, 79)"}}>
<span>
#
<span className="sc-interp">
2
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "4px"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
<span className="sc-interp">
linked
</span>
</span>
</div>
<div style={{"marginTop": "8px", "fontSize": "13px", "fontWeight": "700", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
EGRESS_BLOCKED
</span>
</div>
<div style={{"marginTop": "2px", "fontFamily": "\"DM Sans\", system-ui, sans-serif", "fontSize": "12.5px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
POST /v1/refunds stopped
</span>
</div>
<div style={{"marginTop": "10px", "display": "grid", "gap": "2px", "fontSize": "12px", "color": "rgb(90, 105, 97)"}}>
<span>
prev{" "}
<span style={{"color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
9b02d7c1
</span>
</span>
</span>
<span>
hash{" "}
<span style={{"color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
c7e95b30
</span>
</span>
</span>
</div>
</li>
<li data-anim="1" style={{"position": "relative", "padding": "14px", "border": "2px solid rgb(207, 227, 215)", "borderRadius": "14px", "background": "rgb(255, 255, 255)", "fontFamily": "\"JetBrains Mono\", monospace", "animation": "0.35s ease 0.24s 1 normal both running c-pop"}}>
<div style={{"display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "8px", "fontSize": "12px", "fontWeight": "700", "color": "rgb(31, 107, 79)"}}>
<span>
#
<span className="sc-interp">
3
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "4px"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
<span className="sc-interp">
linked
</span>
</span>
</div>
<div style={{"marginTop": "8px", "fontSize": "13px", "fontWeight": "700", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
ASSERTION_EVAL
</span>
</div>
<div style={{"marginTop": "2px", "fontFamily": "\"DM Sans\", system-ui, sans-serif", "fontSize": "12.5px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
Total shows $50.00 · passed
</span>
</div>
<div style={{"marginTop": "10px", "display": "grid", "gap": "2px", "fontSize": "12px", "color": "rgb(90, 105, 97)"}}>
<span>
prev{" "}
<span style={{"color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
c7e95b30
</span>
</span>
</span>
<span>
hash{" "}
<span style={{"color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
21ad8f64
</span>
</span>
</span>
</div>
</li>
<li data-anim="1" style={{"position": "relative", "padding": "14px", "border": "2px solid rgb(207, 227, 215)", "borderRadius": "14px", "background": "rgb(255, 255, 255)", "fontFamily": "\"JetBrains Mono\", monospace", "animation": "0.35s ease 0.32s 1 normal both running c-pop"}}>
<div style={{"display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "8px", "fontSize": "12px", "fontWeight": "700", "color": "rgb(31, 107, 79)"}}>
<span>
#
<span className="sc-interp">
4
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "4px"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
<span className="sc-interp">
linked
</span>
</span>
</div>
<div style={{"marginTop": "8px", "fontSize": "13px", "fontWeight": "700", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
EXEC_COMPLETE
</span>
</div>
<div style={{"marginTop": "2px", "fontFamily": "\"DM Sans\", system-ui, sans-serif", "fontSize": "12.5px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
Run finished in 393 ms
</span>
</div>
<div style={{"marginTop": "10px", "display": "grid", "gap": "2px", "fontSize": "12px", "color": "rgb(90, 105, 97)"}}>
<span>
prev{" "}
<span style={{"color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
21ad8f64
</span>
</span>
</span>
<span>
hash{" "}
<span style={{"color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
e8c6c259
</span>
</span>
</span>
</div>
</li>
</ol>
<div role="status" style={{"marginTop": "14px", "display": "flex", "gap": "10px", "alignItems": "flex-start", "padding": "12px 14px", "borderRadius": "12px", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)", "fontSize": "14px"}}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{"flex": "0 0 auto", "marginTop": "1px"}}>
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
<span>
<span className="sc-interp">
Every block points at the hash of the one before it, and the Merkle root of all blocks is signed. Nothing has changed since signing.
</span>
</span>
</div>
</section>
<div style={{"marginTop": "14px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(420px, 100%), 1fr))", "gap": "14px", "alignItems": "start"}}>
<section id="verify" aria-labelledby="ev-verify" style={{"padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<h2 id="ev-verify" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
Verify a bundle
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Checks the signature with your key and recomputes the Merkle root — the same check as{" "}
<code style={{"fontFamily": "\"JetBrains Mono\", monospace"}}>
airlock audit
</code>
.
</p>
<div style={{"marginTop": "14px", "padding": "24px", "border": "2px dashed rgb(201, 214, 204)", "borderRadius": "14px", "background": "rgb(251, 252, 250)", "textAlign": "center"}}>
<span style={{"width": "44px", "height": "44px", "margin": "0px auto", "borderRadius": "12px", "background": "rgb(226, 242, 233)", "color": "rgb(47, 111, 91)", "display": "flex", "alignItems": "center", "justifyContent": "center"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M12 16V4M6 10l6-6 6 6M5 20h14">
</path>
</svg>
</span>
<div style={{"marginTop": "10px", "fontWeight": "700"}}>
Drop an attestation.json here
</div>
<div style={{"fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
or{" "}
<label htmlFor="ev-file" style={{"color": "rgb(47, 111, 91)", "fontWeight": "600", "cursor": "pointer", "textDecoration": "underline"}}>
choose a file
</label>
<input id="ev-file" type="file" accept="application/json" style={{"position": "absolute", "width": "1px", "height": "1px", "opacity": "0"}} />
</div>
</div>
<div style={{"marginTop": "12px", "display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "10px"}}>
<span style={{"flex": "1 1 0%", "minWidth": "200px", "display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "40px", "padding": "0px 12px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)"}}>
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M7 3h7l5 5v13H7z">
</path>
<path d="M14 3v5h5">
</path>
</svg>
latest-attestation.json
</span>
<button type="button" className="c-btn c-pri" style={{"height": "40px", "padding": "0px 16px", "border": "0px", "borderRadius": "10px", "background": "rgb(47, 111, 91)", "color": "rgb(255, 255, 255)", "font": "600 14.5px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
Verify
</button>
</div>
</section>
<section aria-labelledby="ev-soc" style={{"padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<h2 id="ev-soc" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
Where this evidence can help an audit
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
AirlockQA produces evidence. It doesn’t assess or certify controls — your auditor does.
</p>
<ul style={{"listStyle": "none", "margin": "14px 0px 0px", "padding": "0px", "display": "grid", "gap": "8px"}}>
<li style={{"display": "grid", "gridTemplateColumns": "70px minmax(0px, 1fr) auto", "gap": "12px", "alignItems": "center", "padding": "10px 12px", "border": "1px solid rgb(238, 242, 238)", "borderRadius": "10px"}}>
<span style={{"font": "700 13px \"JetBrains Mono\", monospace"}}>
CC6.1
</span>
<span style={{"fontSize": "14px"}}>
Logical access{" "}
<span style={{"display": "block", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
stand-in keys, host allow-lists
</span>
</span>
<span style={{"height": "24px", "padding": "0px 9px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)", "fontSize": "12px", "fontWeight": "700", "lineHeight": "24px"}}>
Not assessed
</span>
</li>
<li style={{"display": "grid", "gridTemplateColumns": "70px minmax(0px, 1fr) auto", "gap": "12px", "alignItems": "center", "padding": "10px 12px", "border": "1px solid rgb(238, 242, 238)", "borderRadius": "10px"}}>
<span style={{"font": "700 13px \"JetBrains Mono\", monospace"}}>
CC6.6
</span>
<span style={{"fontSize": "14px"}}>
Boundary protection{" "}
<span style={{"display": "block", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
blocked and allowed request records
</span>
</span>
<span style={{"height": "24px", "padding": "0px 9px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)", "fontSize": "12px", "fontWeight": "700", "lineHeight": "24px"}}>
Not assessed
</span>
</li>
<li style={{"display": "grid", "gridTemplateColumns": "70px minmax(0px, 1fr) auto", "gap": "12px", "alignItems": "center", "padding": "10px 12px", "border": "1px solid rgb(238, 242, 238)", "borderRadius": "10px"}}>
<span style={{"font": "700 13px \"JetBrains Mono\", monospace"}}>
CC7.1
</span>
<span style={{"fontSize": "14px"}}>
Change verification{" "}
<span style={{"display": "block", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
signed results per commit
</span>
</span>
<span style={{"height": "24px", "padding": "0px 9px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)", "fontSize": "12px", "fontWeight": "700", "lineHeight": "24px"}}>
Not assessed
</span>
</li>
<li style={{"display": "grid", "gridTemplateColumns": "70px minmax(0px, 1fr) auto", "gap": "12px", "alignItems": "center", "padding": "10px 12px", "border": "1px solid rgb(238, 242, 238)", "borderRadius": "10px"}}>
<span style={{"font": "700 13px \"JetBrains Mono\", monospace"}}>
CC8.1
</span>
<span style={{"fontSize": "14px"}}>
Non-repudiation{" "}
<span style={{"display": "block", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
hash chain and signature
</span>
</span>
<span style={{"height": "24px", "padding": "0px 9px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)", "fontSize": "12px", "fontWeight": "700", "lineHeight": "24px"}}>
Not assessed
</span>
</li>
</ul>
</section>
</div>
<section aria-labelledby="ev-hist" style={{"marginTop": "14px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)", "overflow": "hidden"}}>
<div style={{"padding": "18px 20px"}}>
<h2 id="ev-hist" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
All receipts
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Stored in .airlock/compliance · keep them with your build records
</p>
</div>
<div style={{"overflowX": "auto"}}>
<table style={{"width": "100%", "minWidth": "820px", "borderCollapse": "collapse", "fontSize": "13.5px"}}>
<thead>
<tr style={{"background": "rgb(247, 248, 245)"}}>
<th scope="col" style={{"padding": "10px 20px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Receipt
</th>
<th scope="col" style={{"padding": "10px 12px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Created
</th>
<th scope="col" style={{"padding": "10px 12px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Merkle root
</th>
<th scope="col" style={{"padding": "10px 12px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Chain
</th>
<th scope="col" style={{"padding": "10px 20px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "right", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
File
</th>
</tr>
</thead>
<tbody>
<tr className="c-row">
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "fontFamily": "\"JetBrains Mono\", monospace"}}>
run_40549cd06baf
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(70, 84, 76)"}}>
Nov 6, 08:40
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)", "fontFamily": "\"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)"}}>
e2114ac9…6aece
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<span style={{"height": "24px", "padding": "0px 9px", "borderRadius": "999px", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)", "fontSize": "12px", "fontWeight": "700", "lineHeight": "24px", "display": "inline-block"}}>
Valid
</span>
</td>
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "textAlign": "right"}}>
<a href="#verify" style={{"fontWeight": "600", "textDecoration": "none"}}>
Download
</a>
</td>
</tr>
<tr className="c-row">
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "fontFamily": "\"JetBrains Mono\", monospace"}}>
run_b6277fcda718
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(70, 84, 76)"}}>
Nov 5, 21:04
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)", "fontFamily": "\"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)"}}>
7a90b2e4…c311f
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<span style={{"height": "24px", "padding": "0px 9px", "borderRadius": "999px", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)", "fontSize": "12px", "fontWeight": "700", "lineHeight": "24px", "display": "inline-block"}}>
Valid
</span>
</td>
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "textAlign": "right"}}>
<a href="#verify" style={{"fontWeight": "600", "textDecoration": "none"}}>
Download
</a>
</td>
</tr>
<tr className="c-row">
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "fontFamily": "\"JetBrains Mono\", monospace"}}>
run_e8c6c2594903
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(70, 84, 76)"}}>
Nov 5, 13:21
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)", "fontFamily": "\"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)"}}>
d4417c08…92ab0
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<span style={{"height": "24px", "padding": "0px 9px", "borderRadius": "999px", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)", "fontSize": "12px", "fontWeight": "700", "lineHeight": "24px", "display": "inline-block"}}>
Valid
</span>
</td>
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "textAlign": "right"}}>
<a href="#verify" style={{"fontWeight": "600", "textDecoration": "none"}}>
Download
</a>
</td>
</tr>
<tr className="c-row">
<td style={{"padding": "12px 20px", "fontFamily": "\"JetBrains Mono\", monospace"}}>
run_8dc3cd21a56f
</td>
<td style={{"padding": "12px", "color": "rgb(70, 84, 76)"}}>
Nov 5, 09:15
</td>
<td style={{"padding": "12px", "fontFamily": "\"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)"}}>
0be3a6d1…71fe4
</td>
<td style={{"padding": "12px"}}>
<span style={{"height": "24px", "padding": "0px 9px", "borderRadius": "999px", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)", "fontSize": "12px", "fontWeight": "700", "lineHeight": "24px", "display": "inline-block"}}>
Valid
</span>
</td>
<td style={{"padding": "12px 20px", "textAlign": "right"}}>
<a href="#verify" style={{"fontWeight": "600", "textDecoration": "none"}}>
Download
</a>
</td>
</tr>
</tbody>
</table>
</div>
</section>
<p className="proof-caption" style={{"marginTop": "24px", "fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
Example identifiers are not signed evidence. Cryptographic proof is verified against the SHA-256 Merkle root.
</p>
</main>
    </>
  );
}
