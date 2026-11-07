// Generated from the original console markup by html2jsx. Static design preview.
export default function FixturesPanel() {
  return (
    <>
<main style={{"flex": "1 1 0%", "width": "100%", "maxWidth": "1320px", "padding": "28px 32px 56px"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "12px"}}>
<h1 style={{"margin": "0px", "font": "800 30px / 1.2 Manrope, system-ui, sans-serif", "letterSpacing": "-0.02em", "color": "rgb(21, 33, 28)"}}>
Fixtures
</h1>
<span style={{"height": "26px", "padding": "0px 10px", "borderRadius": "999px", "background": "rgb(240, 237, 248)", "color": "rgb(87, 71, 154)", "fontSize": "12.5px", "fontWeight": "700", "lineHeight": "26px", "letterSpacing": "0.04em"}}>
PREVIEW
</span>
</div>
<p style={{"margin": "6px 0px 0px", "maxWidth": "780px", "fontSize": "15.5px", "color": "rgb(90, 105, 97)"}}>
Save an outside service’s answer once, then replay it in every run — so a test doesn’t fail just because that service had a bad day.
</p>
<div role="note" style={{"marginTop": "18px", "display": "flex", "gap": "12px", "alignItems": "flex-start", "padding": "14px 16px", "border": "1px solid rgb(220, 214, 239)", "borderRadius": "14px", "background": "rgb(247, 245, 252)"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#57479A" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{"flex": "0 0 auto", "marginTop": "1px"}}>
<circle cx="12" cy="12" r="9">
</circle>
<path d="M12 11v5.5M12 7.6v.1">
</path>
</svg>
<div style={{"fontSize": "14.5px", "color": "rgb(21, 33, 28)"}}>
Fixtures answer requests made{" "}
<strong>
inside the test browser
</strong>
. Your servers’ own calls aren’t captured, and a request with no saved answer currently goes out to the real network — every miss is listed below so nothing slips by unnoticed.
</div>
</div>
<div style={{"marginTop": "16px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", "gap": "14px"}}>
<section aria-labelledby="fx-mode" style={{"padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<h2 id="fx-mode" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
Mode for the next run
</h2>
<div role="radiogroup" aria-labelledby="fx-mode" style={{"marginTop": "12px", "display": "grid", "gap": "8px"}}>
<button type="button" role="radio" aria-checked="false" style={{"display": "flex", "gap": "12px", "alignItems": "flex-start", "padding": "12px 14px", "border": "2px solid rgb(227, 232, 226)", "borderRadius": "12px", "background": "rgb(255, 255, 255)", "cursor": "pointer", "textAlign": "left", "fontFamily": "inherit", "color": "rgb(21, 33, 28)"}}>
<span data-anim="1" style={{"flex": "0 0 auto", "width": "10px", "height": "10px", "marginTop": "6px", "borderRadius": "50%", "background": "rgb(194, 65, 12)"}}>
</span>
<span>
<strong style={{"display": "block"}}>
Record answers
</strong>
<span style={{"fontSize": "13.5px", "color": "rgb(70, 84, 76)"}}>
Let requests through once and save what comes back.
</span>
</span>
</button>
<button type="button" role="radio" aria-checked="true" style={{"display": "flex", "gap": "12px", "alignItems": "flex-start", "padding": "12px 14px", "border": "2px solid rgb(47, 111, 91)", "borderRadius": "12px", "background": "rgb(242, 248, 244)", "cursor": "pointer", "textAlign": "left", "fontFamily": "inherit", "color": "rgb(21, 33, 28)"}}>
<svg width="12" height="12" viewBox="0 0 24 24" fill="#2F6F5B" aria-hidden="true" style={{"flex": "0 0 auto", "marginTop": "5px"}}>
<path d="M7 4l13 8-13 8z">
</path>
</svg>
<span>
<strong style={{"display": "block"}}>
Replay saved answers
</strong>
<span style={{"fontSize": "13.5px", "color": "rgb(70, 84, 76)"}}>
Matching requests get the saved answer instantly.
</span>
</span>
</button>
</div>
<div style={{"marginTop": "12px", "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "12px", "padding": "12px 14px", "border": "1px dashed rgb(211, 219, 212)", "borderRadius": "12px"}}>
<span>
<strong style={{"display": "block", "fontSize": "14px"}}>
Block requests with no saved answer
</strong>
<span style={{"fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
Strict mode is on the roadmap
</span>
</span>
<button type="button" role="switch" aria-checked="false" aria-disabled="true" aria-label="Strict mode, not available yet" style={{"position": "relative", "width": "44px", "height": "26px", "padding": "0px", "border": "0px", "borderRadius": "999px", "background": "rgb(227, 232, 226)", "cursor": "not-allowed"}}>
<span style={{"position": "absolute", "top": "3px", "left": "3px", "width": "20px", "height": "20px", "borderRadius": "50%", "background": "rgb(255, 255, 255)"}}>
</span>
</button>
</div>
</section>
<section aria-label="Fixture stats" style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(140px, 100%), 1fr))", "gap": "12px"}}>
<div style={{"padding": "16px 18px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<div style={{"fontSize": "14px", "fontWeight": "600", "color": "rgb(70, 84, 76)"}}>
Saved answers
</div>
<div style={{"marginTop": "6px", "font": "700 28px / 1.1 \"DM Sans\", system-ui, sans-serif"}}>
5
</div>
<div style={{"fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
1 synthetic
</div>
</div>
<div style={{"padding": "16px 18px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<div style={{"fontSize": "14px", "fontWeight": "600", "color": "rgb(70, 84, 76)"}}>
Served this week
</div>
<div style={{"marginTop": "6px", "font": "700 28px / 1.1 \"DM Sans\", system-ui, sans-serif"}}>
1,140
</div>
<div style={{"fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
requests answered locally
</div>
</div>
<div style={{"padding": "16px 18px", "border": "1px solid rgb(243, 211, 174)", "borderRadius": "16px", "background": "rgb(255, 251, 245)"}}>
<div style={{"fontSize": "14px", "fontWeight": "600", "color": "rgb(70, 84, 76)"}}>
Misses
</div>
<div style={{"marginTop": "6px", "font": "700 28px / 1.1 \"DM Sans\", system-ui, sans-serif"}}>
2
</div>
<div style={{"fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
went to the real network
</div>
</div>
<div style={{"position": "relative", "overflow": "hidden", "padding": "16px 18px", "borderRadius": "16px", "background": "rgb(15, 29, 23)", "color": "rgb(215, 231, 221)"}}>
<div style={{"fontSize": "14px", "fontWeight": "600", "color": "rgb(169, 196, 182)"}}>
Now replaying
</div>
<div style={{"marginTop": "6px", "font": "600 13px \"JetBrains Mono\", monospace", "color": "rgb(255, 255, 255)"}}>
GET /v1/rates · 200
</div>
<span data-anim="1" style={{"position": "absolute", "bottom": "0px", "left": "0px", "width": "28%", "height": "3px", "background": "rgb(127, 214, 174)", "animation": "2.4s linear 0s infinite normal none running c-play"}}>
</span>
</div>
</section>
</div>
<div style={{"marginTop": "14px", "display": "flex", "flexWrap": "wrap", "gap": "14px", "alignItems": "flex-start"}}>
<section aria-labelledby="fx-list" style={{"flex": "999 1 560px", "minWidth": "0px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)", "overflow": "hidden"}}>
<div style={{"padding": "16px 20px"}}>
<h2 id="fx-list" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
Saved answers
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Pick one to see exactly what the browser receives
</p>
</div>
<div style={{"overflowX": "auto"}}>
<div style={{"minWidth": "640px"}}>
<div aria-hidden="true" style={{"display": "grid", "gridTemplateColumns": "64px minmax(220px, 2fr) 70px 80px 110px", "gap": "12px", "padding": "10px 20px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "background": "rgb(247, 248, 245)", "fontSize": "12.5px", "fontWeight": "700", "color": "rgb(90, 105, 97)"}}>
<span>
Method
</span>
<span>
Request
</span>
<span>
Status
</span>
<span>
Size
</span>
<span>
Used in
</span>
</div>
<button type="button" className="c-row" aria-pressed="false" style={{"width": "100%", "display": "grid", "gridTemplateColumns": "64px minmax(220px, 2fr) 70px 80px 110px", "gap": "12px", "alignItems": "center", "padding": "12px 20px", "borderWidth": "0px 0px 1px 3px", "borderStyle": "none none solid solid", "borderColor": "currentcolor currentcolor rgb(238, 242, 238) transparent", "borderImage": "none", "background": "rgb(255, 255, 255)", "cursor": "pointer", "textAlign": "left", "fontFamily": "inherit", "color": "rgb(21, 33, 28)"}}>
<span style={{"font": "700 12.5px \"JetBrains Mono\", monospace", "color": "rgb(36, 88, 155)"}}>
<span className="sc-interp">
GET
</span>
</span>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "font": "500 13px \"JetBrains Mono\", monospace", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
/v1/payment_methods
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
api.stripe.com
</span>
</span>
</span>
<span style={{"font": "600 13px \"JetBrains Mono\", monospace", "color": "rgb(31, 107, 79)"}}>
<span className="sc-interp">
200
</span>
</span>
<span style={{"fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
2.1 KB
</span>
</span>
<span style={{"fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
312 runs
</span>
</span>
</button>
<button type="button" className="c-row" aria-pressed="true" style={{"width": "100%", "display": "grid", "gridTemplateColumns": "64px minmax(220px, 2fr) 70px 80px 110px", "gap": "12px", "alignItems": "center", "padding": "12px 20px", "borderWidth": "0px 0px 1px 3px", "borderStyle": "none none solid solid", "borderColor": "currentcolor currentcolor rgb(238, 242, 238) rgb(47, 111, 91)", "borderImage": "none", "background": "rgb(242, 248, 244)", "cursor": "pointer", "textAlign": "left", "fontFamily": "inherit", "color": "rgb(21, 33, 28)"}}>
<span style={{"font": "700 12.5px \"JetBrains Mono\", monospace", "color": "rgb(36, 88, 155)"}}>
<span className="sc-interp">
GET
</span>
</span>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "font": "500 13px \"JetBrains Mono\", monospace", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
/v1/rates?base=USD
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
api.exchangerate.test
</span>
</span>
</span>
<span style={{"font": "600 13px \"JetBrains Mono\", monospace", "color": "rgb(31, 107, 79)"}}>
<span className="sc-interp">
200
</span>
</span>
<span style={{"fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
1.4 KB
</span>
</span>
<span style={{"fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
488 runs
</span>
</span>
</button>
<button type="button" className="c-row" aria-pressed="false" style={{"width": "100%", "display": "grid", "gridTemplateColumns": "64px minmax(220px, 2fr) 70px 80px 110px", "gap": "12px", "alignItems": "center", "padding": "12px 20px", "borderWidth": "0px 0px 1px 3px", "borderStyle": "none none solid solid", "borderColor": "currentcolor currentcolor rgb(238, 242, 238) transparent", "borderImage": "none", "background": "rgb(255, 255, 255)", "cursor": "pointer", "textAlign": "left", "fontFamily": "inherit", "color": "rgb(21, 33, 28)"}}>
<span style={{"font": "700 12.5px \"JetBrains Mono\", monospace", "color": "rgb(154, 74, 7)"}}>
<span className="sc-interp">
POST
</span>
</span>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "font": "500 13px \"JetBrains Mono\", monospace", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
/v1/payment_intents
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
api.stripe.com
</span>
<span style={{"height": "18px", "padding": "0px 6px", "borderRadius": "999px", "background": "rgb(240, 237, 248)", "color": "rgb(87, 71, 154)", "fontSize": "11px", "fontWeight": "700", "lineHeight": "18px"}}>
synthetic
</span>
</span>
</span>
<span style={{"font": "600 13px \"JetBrains Mono\", monospace", "color": "rgb(31, 107, 79)"}}>
<span className="sc-interp">
200
</span>
</span>
<span style={{"fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
0.9 KB
</span>
</span>
<span style={{"fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
205 runs
</span>
</span>
</button>
<button type="button" className="c-row" aria-pressed="false" style={{"width": "100%", "display": "grid", "gridTemplateColumns": "64px minmax(220px, 2fr) 70px 80px 110px", "gap": "12px", "alignItems": "center", "padding": "12px 20px", "borderWidth": "0px 0px 1px 3px", "borderStyle": "none none solid solid", "borderColor": "currentcolor currentcolor rgb(238, 242, 238) transparent", "borderImage": "none", "background": "rgb(255, 255, 255)", "cursor": "pointer", "textAlign": "left", "fontFamily": "inherit", "color": "rgb(21, 33, 28)"}}>
<span style={{"font": "700 12.5px \"JetBrains Mono\", monospace", "color": "rgb(36, 88, 155)"}}>
<span className="sc-interp">
GET
</span>
</span>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "font": "500 13px \"JetBrains Mono\", monospace", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
/flags
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
cdn.featureflags.test
</span>
</span>
</span>
<span style={{"font": "600 13px \"JetBrains Mono\", monospace", "color": "rgb(31, 107, 79)"}}>
<span className="sc-interp">
200
</span>
</span>
<span style={{"fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
0.6 KB
</span>
</span>
<span style={{"fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
96 runs
</span>
</span>
</button>
<button type="button" className="c-row" aria-pressed="false" style={{"width": "100%", "display": "grid", "gridTemplateColumns": "64px minmax(220px, 2fr) 70px 80px 110px", "gap": "12px", "alignItems": "center", "padding": "12px 20px", "borderWidth": "0px 0px 1px 3px", "borderStyle": "none none solid solid", "borderColor": "currentcolor currentcolor rgb(238, 242, 238) transparent", "borderImage": "none", "background": "rgb(255, 255, 255)", "cursor": "pointer", "textAlign": "left", "fontFamily": "inherit", "color": "rgb(21, 33, 28)"}}>
<span style={{"font": "700 12.5px \"JetBrains Mono\", monospace", "color": "rgb(36, 88, 155)"}}>
<span className="sc-interp">
GET
</span>
</span>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "font": "500 13px \"JetBrains Mono\", monospace", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
/v1/shipping/quote
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
api.shipping.test
</span>
</span>
</span>
<span style={{"font": "600 13px \"JetBrains Mono\", monospace", "color": "rgb(31, 107, 79)"}}>
<span className="sc-interp">
200
</span>
</span>
<span style={{"fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
0.8 KB
</span>
</span>
<span style={{"fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
41 runs
</span>
</span>
</button>
</div>
</div>
</section>
<section aria-labelledby="fx-body" style={{"flex": "1 1 320px", "minWidth": "0px", "borderRadius": "16px", "background": "rgb(15, 29, 23)", "color": "rgb(215, 231, 221)", "overflow": "hidden"}}>
<div style={{"padding": "14px 18px", "borderBottom": "1px solid rgb(35, 57, 47)"}}>
<h2 id="fx-body" style={{"margin": "0px", "font": "700 15.5px / 1.3 Manrope, system-ui, sans-serif", "color": "rgb(255, 255, 255)"}}>
Saved response
</h2>
<p style={{"margin": "2px 0px 0px", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(169, 196, 182)", "overflowWrap": "anywhere"}}>
<span className="sc-interp">
GET api.exchangerate.test/v1/rates?base=USD
</span>
</p>
</div>
<pre data-anim="1" style={{"margin": "0px", "padding": "16px 18px", "overflowX": "auto", "font": "500 12.5px / 1.7 \"JetBrains Mono\", ui-monospace, monospace", "whiteSpace": "pre", "color": "rgb(215, 231, 221)", "animation": "0.25s ease 0s 1 normal both running c-in"}}>
<span className="sc-interp">
{"{\n  \"base\": \"USD\",\n  \"date\": \"2026-11-03\",\n  \"rates\": { \"EUR\": 0.92, \"GBP\": 0.79, \"INR\": 83.4 }\n}"}
</span>
</pre>
<div style={{"padding": "12px 18px", "borderTop": "1px solid rgb(35, 57, 47)", "fontSize": "13px", "color": "rgb(169, 196, 182)"}}>
<span className="sc-interp">
Recorded Nov 3. Pinned so prices in tests never drift with real rates.
</span>
</div>
</section>
</div>
<section aria-labelledby="fx-miss" style={{"marginTop": "14px", "border": "1px solid rgb(243, 211, 174)", "borderRadius": "16px", "background": "rgb(255, 255, 255)", "overflow": "hidden"}}>
<div style={{"padding": "16px 20px", "background": "rgb(255, 251, 245)"}}>
<h2 id="fx-miss" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
Misses — no saved answer, sent to the real network
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Record these, or add the host to your blocked list in Request policy
</p>
</div>
<ul style={{"listStyle": "none", "margin": "0px", "padding": "0px"}}>
<li className="c-row" style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "10px 16px", "padding": "12px 20px", "borderTop": "1px solid rgb(246, 230, 210)"}}>
<span style={{"font": "700 12.5px \"JetBrains Mono\", monospace", "color": "rgb(36, 88, 155)"}}>
GET
</span>
<span style={{"flex": "1 1 0%", "minWidth": "220px", "font": "500 13px \"JetBrains Mono\", monospace"}}>
api.analytics.test/v1/track
</span>
<span style={{"fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
run #1042 · step 9
</span>
<a href="#policy" data-nav="policy" style={{"fontSize": "13.5px", "fontWeight": "600", "textDecoration": "none"}}>
Block this host
</a>
</li>
<li className="c-row" style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "10px 16px", "padding": "12px 20px", "borderTop": "1px solid rgb(246, 230, 210)"}}>
<span style={{"font": "700 12.5px \"JetBrains Mono\", monospace", "color": "rgb(36, 88, 155)"}}>
GET
</span>
<span style={{"flex": "1 1 0%", "minWidth": "220px", "font": "500 13px \"JetBrains Mono\", monospace"}}>
maps.test/v2/geocode?q=…
</span>
<span style={{"fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
run #1039 · step 12
</span>
<button type="button" style={{"height": "32px", "padding": "0px 12px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "9px", "background": "rgb(255, 255, 255)", "color": "rgb(21, 33, 28)", "font": "600 13.5px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
Record next time
</button>
</li>
</ul>
</section>
</main>
    </>
  );
}
