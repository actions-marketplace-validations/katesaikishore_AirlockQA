// Generated from the original console markup by html2jsx. Static design preview.
export default function TimewarpPanel() {
  return (
    <>
<main style={{"flex": "1 1 0%", "width": "100%", "maxWidth": "1320px", "padding": "28px 32px 56px"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "12px"}}>
<h1 style={{"margin": "0px", "font": "800 30px / 1.2 Manrope, system-ui, sans-serif", "letterSpacing": "-0.02em", "color": "rgb(21, 33, 28)"}}>
Time warp
</h1>
<span style={{"height": "26px", "padding": "0px 10px", "borderRadius": "999px", "background": "rgb(240, 237, 248)", "color": "rgb(87, 71, 154)", "fontSize": "12.5px", "fontWeight": "700", "lineHeight": "26px", "letterSpacing": "0.04em"}}>
PREVIEW
</span>
</div>
<p style={{"margin": "6px 0px 0px", "maxWidth": "780px", "fontSize": "15.5px", "color": "rgb(90, 105, 97)"}}>
See what your app shows days from now — trials ending, coupons expiring, renewal reminders — without waiting for the calendar.
</p>
<div role="note" style={{"marginTop": "18px", "display": "flex", "gap": "12px", "alignItems": "flex-start", "padding": "14px 16px", "border": "1px solid rgb(220, 214, 239)", "borderRadius": "14px", "background": "rgb(247, 245, 252)"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#57479A" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{"flex": "0 0 auto", "marginTop": "1px"}}>
<circle cx="12" cy="12" r="9">
</circle>
<path d="M12 11v5.5M12 7.6v.1">
</path>
</svg>
<div style={{"fontSize": "14.5px", "color": "rgb(21, 33, 28)"}}>
<strong>
What moves:
</strong>
{" "}the clock that JavaScript’s{" "}
<code style={{"fontFamily": "\"JetBrains Mono\", monospace"}}>
Date
</code>
{" "}reads inside the test page, including pages it opens next.{" "}
<strong>
What doesn’t:
</strong>
{" "}browser timers, your servers, databases, cron jobs and certificates keep real time — so server-side expiry needs its own test.
</div>
</div>
<div style={{"marginTop": "16px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(440px, 100%), 1fr))", "gap": "14px", "alignItems": "start"}}>
<section aria-labelledby="tw-ctrl" style={{"padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<h2 id="tw-ctrl" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
Move the page clock
</h2>
<div style={{"marginTop": "16px", "display": "grid", "gridTemplateColumns": "minmax(0px, 1fr) 40px minmax(0px, 1fr)", "gap": "10px", "alignItems": "center"}}>
<div style={{"padding": "14px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "14px", "textAlign": "center"}}>
<div style={{"fontSize": "12.5px", "fontWeight": "700", "letterSpacing": "0.05em", "textTransform": "uppercase", "color": "rgb(90, 105, 97)"}}>
Page time now
</div>
<div style={{"marginTop": "6px", "font": "800 30px / 1 Manrope, system-ui, sans-serif"}}>
Nov 6
</div>
<div style={{"marginTop": "4px", "font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)"}}>
2026 · 10:42
</div>
</div>
<svg width="40" height="24" viewBox="0 0 40 24" fill="none" stroke="#2F6F5B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M4 12h30M26 5l8 7-8 7">
</path>
</svg>
<div style={{"perspective": "600px"}}>
<div data-anim="1" style={{"padding": "14px", "border": "2px solid rgb(47, 111, 91)", "borderRadius": "14px", "background": "rgb(242, 248, 244)", "textAlign": "center", "transformOrigin": "center center", "animation": "0.6s ease 0.01s 1 normal both running c-flip"}}>
<div style={{"fontSize": "12.5px", "fontWeight": "700", "letterSpacing": "0.05em", "textTransform": "uppercase", "color": "rgb(31, 107, 79)"}}>
After the warp
</div>
<div style={{"marginTop": "6px", "font": "800 30px / 1 Manrope, system-ui, sans-serif"}}>
<span className="sc-interp">
Nov 20
</span>
</div>
<div style={{"marginTop": "4px", "font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
2026 · 10:42
</span>
</div>
</div>
</div>
</div>
<div style={{"marginTop": "16px", "fontSize": "13.5px", "fontWeight": "700"}}>
Jump ahead by
</div>
<div role="group" aria-label="Jump ahead by" style={{"marginTop": "8px", "display": "flex", "flexWrap": "wrap", "gap": "8px"}}>
<button type="button" aria-pressed="false" style={{"height": "38px", "padding": "0px 14px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "color": "rgb(21, 33, 28)", "cursor": "pointer", "font": "600 14px \"JetBrains Mono\", monospace"}}>
<span className="sc-interp">
+1 hour
</span>
</button>
<button type="button" aria-pressed="false" style={{"height": "38px", "padding": "0px 14px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "color": "rgb(21, 33, 28)", "cursor": "pointer", "font": "600 14px \"JetBrains Mono\", monospace"}}>
<span className="sc-interp">
+1 day
</span>
</button>
<button type="button" aria-pressed="true" style={{"height": "38px", "padding": "0px 14px", "border": "1px solid rgb(47, 111, 91)", "borderRadius": "10px", "background": "rgb(47, 111, 91)", "color": "rgb(255, 255, 255)", "cursor": "pointer", "font": "600 14px \"JetBrains Mono\", monospace"}}>
<span className="sc-interp">
+14 days
</span>
</button>
<button type="button" aria-pressed="false" style={{"height": "38px", "padding": "0px 14px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "color": "rgb(21, 33, 28)", "cursor": "pointer", "font": "600 14px \"JetBrains Mono\", monospace"}}>
<span className="sc-interp">
+30 days
</span>
</button>
</div>
<div style={{"marginTop": "16px", "display": "flex", "flexWrap": "wrap", "gap": "10px", "alignItems": "center"}}>
<button type="button" className="c-btn c-pri" style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "42px", "padding": "0px 18px", "border": "0px", "borderRadius": "10px", "background": "rgb(47, 111, 91)", "color": "rgb(255, 255, 255)", "font": "700 14.5px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<circle cx="12" cy="12" r="8.5">
</circle>
<path d="M12 7.5V12l3 2">
</path>
</svg>
Apply to the test page
</button>
<button type="button" className="c-btn c-sec" style={{"height": "42px", "padding": "0px 16px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "color": "rgb(21, 33, 28)", "font": "600 14.5px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
Reset to real time
</button>
</div>
<div style={{"marginTop": "14px", "padding": "10px 12px", "borderRadius": "10px", "background": "rgb(15, 29, 23)", "font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(215, 231, 221)", "overflowX": "auto", "whiteSpace": "nowrap"}}>
<span style={{"color": "rgb(127, 214, 174)"}}>
$
</span>
{" "}npx airlock warp "
<span className="sc-interp">
+14 days
</span>
"
</div>
</section>
<section aria-labelledby="tw-prev" style={{"padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<h2 id="tw-prev" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
What the test page shows
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
staging.shop.test/account · trial started Oct 30
</p>
<div style={{"marginTop": "14px", "overflow": "hidden", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "14px"}}>
<div style={{"display": "flex", "alignItems": "center", "gap": "6px", "padding": "8px 12px", "borderBottom": "1px solid rgb(227, 232, 226)", "background": "rgb(247, 248, 245)"}}>
<span style={{"width": "9px", "height": "9px", "borderRadius": "50%", "background": "rgb(227, 232, 226)"}}>
</span>
<span style={{"width": "9px", "height": "9px", "borderRadius": "50%", "background": "rgb(227, 232, 226)"}}>
</span>
<span style={{"width": "9px", "height": "9px", "borderRadius": "50%", "background": "rgb(227, 232, 226)"}}>
</span>
<span style={{"marginLeft": "8px", "font": "500 12px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
staging.shop.test/account
</span>
</div>
<div style={{"padding": "18px"}}>
<div data-anim="1" style={{"display": "flex", "gap": "12px", "alignItems": "flex-start", "padding": "14px", "borderRadius": "12px", "background": "rgb(255, 243, 226)", "border": "1px solid rgb(243, 211, 174)", "animation": "0.35s ease 0.01s 1 normal both running c-in"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9A4A07" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{"flex": "0 0 auto", "marginTop": "1px"}}>
<circle cx="12" cy="12" r="8.5">
</circle>
<path d="M12 7.5V12l3 2">
</path>
</svg>
<div>
<div style={{"fontWeight": "700", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
Your free trial has ended
</span>
</div>
<div style={{"fontSize": "14px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
Upgrade to keep your projects and run history.
</span>
</div>
</div>
</div>
<div style={{"marginTop": "14px", "display": "grid", "gap": "8px"}}>
<span style={{"height": "10px", "width": "70%", "borderRadius": "5px", "background": "rgb(238, 242, 238)"}}>
</span>
<span style={{"height": "10px", "width": "48%", "borderRadius": "5px", "background": "rgb(238, 242, 238)"}}>
</span>
<span style={{"height": "10px", "width": "60%", "borderRadius": "5px", "background": "rgb(238, 242, 238)"}}>
</span>
</div>
</div>
</div>
<div data-anim="1" style={{"marginTop": "14px", "padding": "14px", "borderRadius": "12px", "background": "rgb(15, 29, 23)", "color": "rgb(215, 231, 221)", "font": "500 12.5px / 1.75 \"JetBrains Mono\", monospace", "animation": "0.3s ease 0s 1 normal both running c-in"}}>
<div style={{"color": "rgb(143, 179, 160)"}}>
TimeWarpResult
</div>
<div>
<span style={{"color": "rgb(127, 214, 174)"}}>
scope
</span>
{" "}browser-page
</div>
<div>
<span style={{"color": "rgb(127, 214, 174)"}}>
previousTimeIso
</span>
{" "}2026-11-06T10:42:00.000Z
</div>
<div>
<span style={{"color": "rgb(127, 214, 174)"}}>
targetTimeIso
</span>
{" "}
<span className="sc-interp">
2026-11-20T10:42:00.000Z
</span>
</div>
<div>
<span style={{"color": "rgb(127, 214, 174)"}}>
deltaMs
</span>
{" "}
<span className="sc-interp">
1209600000
</span>
</div>
<div>
<span style={{"color": "rgb(127, 214, 174)"}}>
affectedPageAPIs
</span>
{" "}Date, Date.now()
</div>
<div>
<span style={{"color": "rgb(127, 214, 174)"}}>
ledger
</span>
{" "}TIMEWARP_ADVANCED
</div>
</div>
</section>
</div>
<section aria-labelledby="tw-uses" style={{"marginTop": "14px"}}>
<h2 id="tw-uses" style={{"margin": "0px 0px 10px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
Good uses — and one to avoid for now
</h2>
<div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", "gap": "12px"}}>
<article style={{"padding": "16px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "14px", "background": "rgb(255, 255, 255)"}}>
<div style={{"display": "flex", "alignItems": "center", "gap": "8px", "fontWeight": "700"}}>
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1F6B4F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
Trial or plan banners
</div>
<p style={{"margin": "6px 0px 0px", "fontSize": "14px", "color": "rgb(70, 84, 76)"}}>
The page computes “days left” from{" "}
<code style={{"fontFamily": "\"JetBrains Mono\", monospace"}}>
Date
</code>
{" "}— a perfect fit.
</p>
</article>
<article style={{"padding": "16px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "14px", "background": "rgb(255, 255, 255)"}}>
<div style={{"display": "flex", "alignItems": "center", "gap": "8px", "fontWeight": "700"}}>
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1F6B4F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
Coupon and sale end dates
</div>
<p style={{"margin": "6px 0px 0px", "fontSize": "14px", "color": "rgb(70, 84, 76)"}}>
Check the countdown and the “expired” message shown in the browser.
</p>
</article>
<article style={{"padding": "16px", "border": "1px solid rgb(243, 211, 174)", "borderRadius": "14px", "background": "rgb(255, 251, 245)"}}>
<div style={{"display": "flex", "alignItems": "center", "gap": "8px", "fontWeight": "700"}}>
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9A4A07" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
<path d="M6 12h12">
</path>
</svg>
Real subscription expiry
</div>
<p style={{"margin": "6px 0px 0px", "fontSize": "14px", "color": "rgb(70, 84, 76)"}}>
Your server decides when a plan ends, and its clock doesn’t move. Test that on the server side.
</p>
</article>
</div>
</section>
</main>
    </>
  );
}
