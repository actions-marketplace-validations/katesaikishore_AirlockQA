// Generated from the original console markup by html2jsx. Static design preview.
export default function DashboardPanel() {
  return (
    <>
<main style={{"flex": "1 1 0%", "width": "100%", "maxWidth": "1320px", "padding": "28px 32px 56px"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "flex-end", "justifyContent": "space-between", "gap": "16px"}}>
<div style={{"minWidth": "0px"}}>
<h1 style={{"margin": "0px", "font": "800 30px / 1.2 Manrope, system-ui, sans-serif", "letterSpacing": "-0.02em", "color": "rgb(21, 33, 28)"}}>
Good morning, Maya
</h1>
<p style={{"margin": "6px 0px 0px", "fontSize": "15.5px", "color": "rgb(90, 105, 97)"}}>
Here’s how your tests did this week, Oct 31 – Nov 6.
</p>
</div>
<div style={{"display": "flex", "flexWrap": "wrap", "gap": "10px"}}>
<a className="c-btn c-sec" href="#cicd" data-nav="integrations" style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "40px", "padding": "0px 16px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "color": "rgb(21, 33, 28)", "fontSize": "14.5px", "fontWeight": "600", "textDecoration": "none"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M6 3.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5zM6 8.5v12M18 15.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5zM18 15.5V9a2 2 0 0 0-2-2h-4M14 4.5L11.5 7 14 9.5">
</path>
</svg>
Connect CI
</a>
<a className="c-btn c-pri" href="#recorder" data-nav="recorder" style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "40px", "padding": "0px 16px", "borderRadius": "10px", "background": "rgb(47, 111, 91)", "color": "rgb(255, 255, 255)", "fontSize": "14.5px", "fontWeight": "600", "textDecoration": "none"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
<path d="M12 5v14M5 12h14">
</path>
</svg>
Record a test
</a>
</div>
</div>
<section aria-labelledby="ov-setup" data-anim="1" style={{"marginTop": "22px", "padding": "18px 20px", "border": "1px solid rgb(207, 227, 215)", "borderRadius": "16px", "background": "rgb(242, 248, 244)", "animation": "0.5s ease 0s 1 normal both running c-in"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "justifyContent": "space-between", "gap": "12px"}}>
<div style={{"display": "flex", "alignItems": "center", "gap": "14px", "minWidth": "0px"}}>
<div style={{"position": "relative", "flex": "0 0 auto", "width": "46px", "height": "46px", "borderRadius": "50%", "background": "conic-gradient(rgb(47, 111, 91) 0deg, rgb(47, 111, 91) 75%, rgb(214, 231, 220) 75%, rgb(214, 231, 220) 100%)"}}>
<span style={{"position": "absolute", "inset": "5px", "borderRadius": "50%", "background": "rgb(242, 248, 244)", "display": "flex", "alignItems": "center", "justifyContent": "center", "font": "700 12.5px \"JetBrains Mono\", monospace", "color": "rgb(31, 107, 79)"}}>
3/4
</span>
</div>
<div style={{"minWidth": "0px"}}>
<h2 id="ov-setup" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif", "color": "rgb(21, 33, 28)"}}>
Almost set up — connect CI to run on every change
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "14px", "color": "rgb(70, 84, 76)"}}>
Your tests already run locally. One step left to run them on every push and pull request.
</p>
</div>
</div>
<button type="button" style={{"height": "34px", "padding": "0px 12px", "border": "0px", "borderRadius": "9px", "background": "transparent", "color": "rgb(70, 84, 76)", "font": "600 14px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
Hide
</button>
</div>
<ol style={{"listStyle": "none", "margin": "16px 0px 0px", "padding": "0px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", "gap": "10px"}}>
<li style={{"display": "flex", "alignItems": "center", "gap": "10px", "padding": "12px 14px", "borderRadius": "12px", "background": "rgb(255, 255, 255)", "border": "1px solid rgb(220, 234, 223)", "fontSize": "14px", "color": "rgb(70, 84, 76)"}}>
<span style={{"flex": "0 0 auto", "width": "24px", "height": "24px", "borderRadius": "50%", "background": "rgb(47, 111, 91)", "color": "rgb(255, 255, 255)", "display": "inline-flex", "alignItems": "center", "justifyContent": "center"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
</span>
<span>
<s style={{"textDecorationColor": "rgb(157, 176, 165)"}}>
Install the CLI
</s>
<span style={{"position": "absolute", "width": "1px", "height": "1px", "overflow": "hidden", "clip": "rect(0px, 0px, 0px, 0px)"}}>
{" "}(done)
</span>
</span>
</li>
<li style={{"display": "flex", "alignItems": "center", "gap": "10px", "padding": "12px 14px", "borderRadius": "12px", "background": "rgb(255, 255, 255)", "border": "1px solid rgb(220, 234, 223)", "fontSize": "14px", "color": "rgb(70, 84, 76)"}}>
<span style={{"flex": "0 0 auto", "width": "24px", "height": "24px", "borderRadius": "50%", "background": "rgb(47, 111, 91)", "color": "rgb(255, 255, 255)", "display": "inline-flex", "alignItems": "center", "justifyContent": "center"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
</span>
<span>
<s style={{"textDecorationColor": "rgb(157, 176, 165)"}}>
Record your first test
</s>
<span style={{"position": "absolute", "width": "1px", "height": "1px", "overflow": "hidden", "clip": "rect(0px, 0px, 0px, 0px)"}}>
{" "}(done)
</span>
</span>
</li>
<li style={{"display": "flex", "alignItems": "center", "gap": "10px", "padding": "12px 14px", "borderRadius": "12px", "background": "rgb(255, 255, 255)", "border": "1px solid rgb(220, 234, 223)", "fontSize": "14px", "color": "rgb(70, 84, 76)"}}>
<span style={{"flex": "0 0 auto", "width": "24px", "height": "24px", "borderRadius": "50%", "background": "rgb(47, 111, 91)", "color": "rgb(255, 255, 255)", "display": "inline-flex", "alignItems": "center", "justifyContent": "center"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
</span>
<span>
<s style={{"textDecorationColor": "rgb(157, 176, 165)"}}>
Add a safety policy
</s>
<span style={{"position": "absolute", "width": "1px", "height": "1px", "overflow": "hidden", "clip": "rect(0px, 0px, 0px, 0px)"}}>
{" "}(done)
</span>
</span>
</li>
<li>
<a href="#cicd" data-nav="integrations" className="c-row" style={{"display": "flex", "alignItems": "center", "gap": "10px", "padding": "12px 14px", "borderRadius": "12px", "background": "rgb(255, 255, 255)", "border": "2px solid rgb(47, 111, 91)", "fontSize": "14px", "fontWeight": "700", "color": "rgb(21, 33, 28)", "textDecoration": "none"}}>
<span style={{"flex": "0 0 auto", "width": "24px", "height": "24px", "borderRadius": "50%", "border": "2px dashed rgb(47, 111, 91)", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "font": "700 11px \"JetBrains Mono\", monospace", "color": "rgb(47, 111, 91)"}}>
4
</span>
<span style={{"flex": "1 1 0%"}}>
Connect CI
</span>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2F6F5B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12h14M13 6l6 6-6 6">
</path>
</svg>
</a>
</li>
</ol>
</section>
<section aria-label="This week at a glance" style={{"marginTop": "22px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", "gap": "14px"}}>
<article style={{"padding": "18px 20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<div style={{"display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "8px", "fontSize": "14px", "fontWeight": "600", "color": "rgb(70, 84, 76)"}}>
Runs this week
<span style={{"width": "30px", "height": "30px", "borderRadius": "9px", "background": "rgb(226, 242, 233)", "color": "rgb(47, 111, 91)", "display": "inline-flex", "alignItems": "center", "justifyContent": "center"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M3 12h4l2.5-6 5 12 2.5-6h4">
</path>
</svg>
</span>
</div>
<div style={{"marginTop": "8px", "font": "700 32px / 1.1 \"DM Sans\", system-ui, sans-serif", "letterSpacing": "-0.02em", "color": "rgb(21, 33, 28)"}}>
446
</div>
<div style={{"marginTop": "6px", "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "8px", "fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
<span>
<span style={{"fontWeight": "700", "color": "rgb(31, 107, 79)"}}>
↑ 12.8%
</span>
{" "}vs last week
</span>
<svg width="84" height="26" viewBox="0 0 84 26" aria-hidden="true">
<polyline points="0,20 7.6,18 15.3,21 22.9,16 30.5,17 38.2,13 45.8,15 53.5,11 61.1,12 68.7,8 76.4,10 84,4" fill="none" stroke="#B7C7BD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
</polyline>
<polyline points="68.7,8 76.4,10 84,4" fill="none" stroke="#23845A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
</polyline>
<circle cx="84" cy="4" r="3" fill="#23845A">
</circle>
</svg>
</div>
</article>
<article style={{"padding": "18px 20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<div style={{"display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "8px", "fontSize": "14px", "fontWeight": "600", "color": "rgb(70, 84, 76)"}}>
Pass rate
<span style={{"width": "30px", "height": "30px", "borderRadius": "9px", "background": "rgb(234, 241, 251)", "color": "rgb(36, 88, 155)", "display": "inline-flex", "alignItems": "center", "justifyContent": "center"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
</span>
</div>
<div style={{"marginTop": "8px", "font": "700 32px / 1.1 \"DM Sans\", system-ui, sans-serif", "letterSpacing": "-0.02em", "color": "rgb(21, 33, 28)"}}>
96.2%
</div>
<div style={{"marginTop": "6px", "fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
<span style={{"fontWeight": "700", "color": "rgb(31, 107, 79)"}}>
↑ 0.6 pts
</span>
{" "}vs last week · 429 of 446 passed
</div>
</article>
<article style={{"padding": "18px 20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<div style={{"display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "8px", "fontSize": "14px", "fontWeight": "600", "color": "rgb(70, 84, 76)"}}>
Requests stopped
<span style={{"width": "30px", "height": "30px", "borderRadius": "9px", "background": "rgb(255, 243, 226)", "color": "rgb(154, 74, 7)", "display": "inline-flex", "alignItems": "center", "justifyContent": "center"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5c-4.3-1.3-7.5-4.9-7.5-9.5V6z">
</path>
</svg>
</span>
</div>
<div style={{"marginTop": "8px", "font": "700 32px / 1.1 \"DM Sans\", system-ui, sans-serif", "letterSpacing": "-0.02em", "color": "rgb(21, 33, 28)"}}>
17
</div>
<div style={{"marginTop": "6px", "fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
by the safety door — none reached a real service
</div>
</article>
<article style={{"padding": "18px 20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<div style={{"display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "8px", "fontSize": "14px", "fontWeight": "600", "color": "rgb(70, 84, 76)"}}>
Locators healed
<span style={{"width": "30px", "height": "30px", "borderRadius": "9px", "background": "rgb(240, 237, 248)", "color": "rgb(87, 71, 154)", "display": "inline-flex", "alignItems": "center", "justifyContent": "center"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
<circle cx="12" cy="12" r="7">
</circle>
<path d="M12 2v3M12 19v3M2 12h3M19 12h3">
</path>
</svg>
</span>
</div>
<div style={{"marginTop": "8px", "font": "700 32px / 1.1 \"DM Sans\", system-ui, sans-serif", "letterSpacing": "-0.02em", "color": "rgb(21, 33, 28)"}}>
23
</div>
<div style={{"marginTop": "6px", "fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
average match 91% ·{" "}
<a href="#healing" data-nav="healing" style={{"fontWeight": "700", "color": "rgb(154, 74, 7)", "textDecoration": "none"}}>
3 to review
</a>
</div>
</article>
</section>
<div style={{"marginTop": "14px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(420px, 100%), 1fr))", "gap": "14px", "alignItems": "stretch"}}>
<section aria-labelledby="ov-activity" style={{"gridColumn": "span 1", "padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)", "minWidth": "0px"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "flex-start", "justifyContent": "space-between", "gap": "12px"}}>
<div>
<h2 id="ov-activity" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif", "color": "rgb(21, 33, 28)"}}>
Run activity
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Runs per day by result, last 7 days
</p>
</div>
<div role="group" aria-label="View as" style={{"display": "inline-flex", "gap": "2px", "padding": "3px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(247, 248, 245)"}}>
<button type="button" aria-pressed="true" style={{"height": "30px", "padding": "0px 12px", "border": "0px", "borderRadius": "8px", "cursor": "pointer", "font": "600 13px \"DM Sans\", system-ui, sans-serif", "background": "rgb(255, 255, 255)", "color": "rgb(21, 33, 28)", "boxShadow": "rgba(21, 33, 28, 0.12) 0px 1px 2px"}}>
Chart
</button>
<button type="button" aria-pressed="false" style={{"height": "30px", "padding": "0px 12px", "border": "0px", "borderRadius": "8px", "cursor": "pointer", "font": "600 13px \"DM Sans\", system-ui, sans-serif", "background": "transparent", "color": "rgb(90, 105, 97)", "boxShadow": "none"}}>
Table
</button>
</div>
</div>
<ul aria-label="Legend" style={{"listStyle": "none", "margin": "14px 0px 0px", "padding": "0px", "display": "flex", "flexWrap": "wrap", "gap": "8px 18px", "fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
<li style={{"display": "inline-flex", "alignItems": "center", "gap": "7px"}}>
<span style={{"width": "10px", "height": "10px", "borderRadius": "3px", "background": "rgb(35, 132, 90)"}}>
</span>
Passed
</li>
<li style={{"display": "inline-flex", "alignItems": "center", "gap": "7px"}}>
<span style={{"width": "10px", "height": "10px", "borderRadius": "3px", "background": "rgb(217, 130, 43)"}}>
</span>
Policy blocked
</li>
<li style={{"display": "inline-flex", "alignItems": "center", "gap": "7px"}}>
<span style={{"width": "10px", "height": "10px", "borderRadius": "3px", "background": "rgb(180, 35, 24)"}}>
</span>
Failed
</li>
</ul>
<div style={{"position": "relative", "marginTop": "12px", "display": "grid", "gridTemplateColumns": "32px minmax(0px, 1fr)", "gap": "8px"}}>
<div aria-hidden="true" style={{"position": "relative", "height": "200px", "font": "500 11.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)", "textAlign": "right"}}>
<span style={{"position": "absolute", "right": "0px", "top": "-8px"}}>
100
</span>
<span style={{"position": "absolute", "right": "0px", "top": "42px"}}>
75
</span>
<span style={{"position": "absolute", "right": "0px", "top": "92px"}}>
50
</span>
<span style={{"position": "absolute", "right": "0px", "top": "142px"}}>
25
</span>
<span style={{"position": "absolute", "right": "0px", "top": "192px"}}>
0
</span>
</div>
<div style={{"minWidth": "0px"}}>
<div style={{"position": "relative", "height": "200px"}}>
<div aria-hidden="true" style={{"position": "absolute", "inset": "0px", "display": "flex", "flexDirection": "column", "justifyContent": "space-between"}}>
<span style={{"height": "1px", "background": "rgb(238, 242, 238)"}}>
</span>
<span style={{"height": "1px", "background": "rgb(238, 242, 238)"}}>
</span>
<span style={{"height": "1px", "background": "rgb(238, 242, 238)"}}>
</span>
<span style={{"height": "1px", "background": "rgb(238, 242, 238)"}}>
</span>
<span style={{"height": "1px", "background": "rgb(205, 214, 206)"}}>
</span>
</div>
<div style={{"position": "absolute", "inset": "0px", "display": "grid", "gridTemplateColumns": "repeat(7, minmax(0px, 1fr))"}}>
<button type="button" className="c-col" aria-label="Oct 31: 42 runs, 39 passed, 1 policy blocked, 2 failed" style={{"position": "relative", "height": "200px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default", "display": "flex", "flexDirection": "column", "justifyContent": "flex-end", "alignItems": "center"}}>
<span data-anim="1" style={{"display": "flex", "flexDirection": "column-reverse", "gap": "2px", "width": "24px", "transformOrigin": "center bottom", "animation": "0.7s cubic-bezier(0.2, 0.7, 0.2, 1) 0s 1 normal both running c-grow"}}>
<span style={{"display": "block", "height": "78px", "background": "rgb(35, 132, 90)"}}>
</span>
<span style={{"display": "block", "height": "2px", "background": "rgb(217, 130, 43)"}}>
</span>
<span style={{"display": "block", "height": "4px", "borderRadius": "4px 4px 0px 0px", "background": "rgb(180, 35, 24)"}}>
</span>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "bottom": "98px", "zIndex": "3", "minWidth": "150px", "padding": "10px 12px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 28px", "textAlign": "left", "fontSize": "12.5px", "lineHeight": "1.5", "color": "rgb(21, 33, 28)"}}>
<span style={{"display": "block", "fontWeight": "700"}}>
<span className="sc-interp">
Oct 31
</span>
{" "}·{" "}
<span className="sc-interp">
42
</span>
{" "}runs
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<span style={{"width": "8px", "height": "8px", "borderRadius": "2px", "background": "rgb(35, 132, 90)"}}>
</span>
<span className="sc-interp">
39
</span>
{" "}passed
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<span style={{"width": "8px", "height": "8px", "borderRadius": "2px", "background": "rgb(217, 130, 43)"}}>
</span>
<span className="sc-interp">
1
</span>
{" "}blocked
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<span style={{"width": "8px", "height": "8px", "borderRadius": "2px", "background": "rgb(180, 35, 24)"}}>
</span>
<span className="sc-interp">
2
</span>
{" "}failed
</span>
</span>
</button>
<button type="button" className="c-col" aria-label="Nov 1: 55 runs, 53 passed, 1 policy blocked, 1 failed" style={{"position": "relative", "height": "200px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default", "display": "flex", "flexDirection": "column", "justifyContent": "flex-end", "alignItems": "center"}}>
<span data-anim="1" style={{"display": "flex", "flexDirection": "column-reverse", "gap": "2px", "width": "24px", "transformOrigin": "center bottom", "animation": "0.7s cubic-bezier(0.2, 0.7, 0.2, 1) 0.05s 1 normal both running c-grow"}}>
<span style={{"display": "block", "height": "106px", "background": "rgb(35, 132, 90)"}}>
</span>
<span style={{"display": "block", "height": "2px", "background": "rgb(217, 130, 43)"}}>
</span>
<span style={{"display": "block", "height": "2px", "borderRadius": "4px 4px 0px 0px", "background": "rgb(180, 35, 24)"}}>
</span>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "bottom": "124px", "zIndex": "3", "minWidth": "150px", "padding": "10px 12px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 28px", "textAlign": "left", "fontSize": "12.5px", "lineHeight": "1.5", "color": "rgb(21, 33, 28)"}}>
<span style={{"display": "block", "fontWeight": "700"}}>
<span className="sc-interp">
Nov 1
</span>
{" "}·{" "}
<span className="sc-interp">
55
</span>
{" "}runs
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<span style={{"width": "8px", "height": "8px", "borderRadius": "2px", "background": "rgb(35, 132, 90)"}}>
</span>
<span className="sc-interp">
53
</span>
{" "}passed
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<span style={{"width": "8px", "height": "8px", "borderRadius": "2px", "background": "rgb(217, 130, 43)"}}>
</span>
<span className="sc-interp">
1
</span>
{" "}blocked
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<span style={{"width": "8px", "height": "8px", "borderRadius": "2px", "background": "rgb(180, 35, 24)"}}>
</span>
<span className="sc-interp">
1
</span>
{" "}failed
</span>
</span>
</button>
<button type="button" className="c-col" aria-label="Nov 2: 49 runs, 46 passed, 1 policy blocked, 2 failed" style={{"position": "relative", "height": "200px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default", "display": "flex", "flexDirection": "column", "justifyContent": "flex-end", "alignItems": "center"}}>
<span data-anim="1" style={{"display": "flex", "flexDirection": "column-reverse", "gap": "2px", "width": "24px", "transformOrigin": "center bottom", "animation": "0.7s cubic-bezier(0.2, 0.7, 0.2, 1) 0.1s 1 normal both running c-grow"}}>
<span style={{"display": "block", "height": "92px", "background": "rgb(35, 132, 90)"}}>
</span>
<span style={{"display": "block", "height": "2px", "background": "rgb(217, 130, 43)"}}>
</span>
<span style={{"display": "block", "height": "4px", "borderRadius": "4px 4px 0px 0px", "background": "rgb(180, 35, 24)"}}>
</span>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "bottom": "112px", "zIndex": "3", "minWidth": "150px", "padding": "10px 12px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 28px", "textAlign": "left", "fontSize": "12.5px", "lineHeight": "1.5", "color": "rgb(21, 33, 28)"}}>
<span style={{"display": "block", "fontWeight": "700"}}>
<span className="sc-interp">
Nov 2
</span>
{" "}·{" "}
<span className="sc-interp">
49
</span>
{" "}runs
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<span style={{"width": "8px", "height": "8px", "borderRadius": "2px", "background": "rgb(35, 132, 90)"}}>
</span>
<span className="sc-interp">
46
</span>
{" "}passed
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<span style={{"width": "8px", "height": "8px", "borderRadius": "2px", "background": "rgb(217, 130, 43)"}}>
</span>
<span className="sc-interp">
1
</span>
{" "}blocked
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<span style={{"width": "8px", "height": "8px", "borderRadius": "2px", "background": "rgb(180, 35, 24)"}}>
</span>
<span className="sc-interp">
2
</span>
{" "}failed
</span>
</span>
</button>
<button type="button" className="c-col" aria-label="Nov 3: 72 runs, 70 passed, 1 policy blocked, 1 failed" style={{"position": "relative", "height": "200px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default", "display": "flex", "flexDirection": "column", "justifyContent": "flex-end", "alignItems": "center"}}>
<span data-anim="1" style={{"display": "flex", "flexDirection": "column-reverse", "gap": "2px", "width": "24px", "transformOrigin": "center bottom", "animation": "0.7s cubic-bezier(0.2, 0.7, 0.2, 1) 0.15s 1 normal both running c-grow"}}>
<span style={{"display": "block", "height": "140px", "background": "rgb(35, 132, 90)"}}>
</span>
<span style={{"display": "block", "height": "2px", "background": "rgb(217, 130, 43)"}}>
</span>
<span style={{"display": "block", "height": "2px", "borderRadius": "4px 4px 0px 0px", "background": "rgb(180, 35, 24)"}}>
</span>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "bottom": "150px", "zIndex": "3", "minWidth": "150px", "padding": "10px 12px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 28px", "textAlign": "left", "fontSize": "12.5px", "lineHeight": "1.5", "color": "rgb(21, 33, 28)"}}>
<span style={{"display": "block", "fontWeight": "700"}}>
<span className="sc-interp">
Nov 3
</span>
{" "}·{" "}
<span className="sc-interp">
72
</span>
{" "}runs
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<span style={{"width": "8px", "height": "8px", "borderRadius": "2px", "background": "rgb(35, 132, 90)"}}>
</span>
<span className="sc-interp">
70
</span>
{" "}passed
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<span style={{"width": "8px", "height": "8px", "borderRadius": "2px", "background": "rgb(217, 130, 43)"}}>
</span>
<span className="sc-interp">
1
</span>
{" "}blocked
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<span style={{"width": "8px", "height": "8px", "borderRadius": "2px", "background": "rgb(180, 35, 24)"}}>
</span>
<span className="sc-interp">
1
</span>
{" "}failed
</span>
</span>
</button>
<button type="button" className="c-col" aria-label="Nov 4: 64 runs, 62 passed, 0 policy blocked, 2 failed" style={{"position": "relative", "height": "200px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default", "display": "flex", "flexDirection": "column", "justifyContent": "flex-end", "alignItems": "center"}}>
<span data-anim="1" style={{"display": "flex", "flexDirection": "column-reverse", "gap": "2px", "width": "24px", "transformOrigin": "center bottom", "animation": "0.7s cubic-bezier(0.2, 0.7, 0.2, 1) 0.2s 1 normal both running c-grow"}}>
<span style={{"display": "block", "height": "124px", "background": "rgb(35, 132, 90)"}}>
</span>
<span style={{"display": "block", "height": "0px", "background": "rgb(217, 130, 43)"}}>
</span>
<span style={{"display": "block", "height": "4px", "borderRadius": "4px 4px 0px 0px", "background": "rgb(180, 35, 24)"}}>
</span>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "bottom": "140px", "zIndex": "3", "minWidth": "150px", "padding": "10px 12px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 28px", "textAlign": "left", "fontSize": "12.5px", "lineHeight": "1.5", "color": "rgb(21, 33, 28)"}}>
<span style={{"display": "block", "fontWeight": "700"}}>
<span className="sc-interp">
Nov 4
</span>
{" "}·{" "}
<span className="sc-interp">
64
</span>
{" "}runs
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<span style={{"width": "8px", "height": "8px", "borderRadius": "2px", "background": "rgb(35, 132, 90)"}}>
</span>
<span className="sc-interp">
62
</span>
{" "}passed
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<span style={{"width": "8px", "height": "8px", "borderRadius": "2px", "background": "rgb(217, 130, 43)"}}>
</span>
<span className="sc-interp">
0
</span>
{" "}blocked
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<span style={{"width": "8px", "height": "8px", "borderRadius": "2px", "background": "rgb(180, 35, 24)"}}>
</span>
<span className="sc-interp">
2
</span>
{" "}failed
</span>
</span>
</button>
<button type="button" className="c-col" aria-label="Nov 5: 88 runs, 85 passed, 2 policy blocked, 1 failed" style={{"position": "relative", "height": "200px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default", "display": "flex", "flexDirection": "column", "justifyContent": "flex-end", "alignItems": "center"}}>
<span data-anim="1" style={{"display": "flex", "flexDirection": "column-reverse", "gap": "2px", "width": "24px", "transformOrigin": "center bottom", "animation": "0.7s cubic-bezier(0.2, 0.7, 0.2, 1) 0.25s 1 normal both running c-grow"}}>
<span style={{"display": "block", "height": "170px", "background": "rgb(35, 132, 90)"}}>
</span>
<span style={{"display": "block", "height": "4px", "background": "rgb(217, 130, 43)"}}>
</span>
<span style={{"display": "block", "height": "2px", "borderRadius": "4px 4px 0px 0px", "background": "rgb(180, 35, 24)"}}>
</span>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "bottom": "150px", "zIndex": "3", "minWidth": "150px", "padding": "10px 12px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 28px", "textAlign": "left", "fontSize": "12.5px", "lineHeight": "1.5", "color": "rgb(21, 33, 28)"}}>
<span style={{"display": "block", "fontWeight": "700"}}>
<span className="sc-interp">
Nov 5
</span>
{" "}·{" "}
<span className="sc-interp">
88
</span>
{" "}runs
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<span style={{"width": "8px", "height": "8px", "borderRadius": "2px", "background": "rgb(35, 132, 90)"}}>
</span>
<span className="sc-interp">
85
</span>
{" "}passed
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<span style={{"width": "8px", "height": "8px", "borderRadius": "2px", "background": "rgb(217, 130, 43)"}}>
</span>
<span className="sc-interp">
2
</span>
{" "}blocked
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<span style={{"width": "8px", "height": "8px", "borderRadius": "2px", "background": "rgb(180, 35, 24)"}}>
</span>
<span className="sc-interp">
1
</span>
{" "}failed
</span>
</span>
</button>
<button type="button" className="c-col" aria-label="Nov 6: 76 runs, 74 passed, 1 policy blocked, 1 failed" style={{"position": "relative", "height": "200px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default", "display": "flex", "flexDirection": "column", "justifyContent": "flex-end", "alignItems": "center"}}>
<span data-anim="1" style={{"display": "flex", "flexDirection": "column-reverse", "gap": "2px", "width": "24px", "transformOrigin": "center bottom", "animation": "0.7s cubic-bezier(0.2, 0.7, 0.2, 1) 0.3s 1 normal both running c-grow"}}>
<span style={{"display": "block", "height": "148px", "background": "rgb(35, 132, 90)"}}>
</span>
<span style={{"display": "block", "height": "2px", "background": "rgb(217, 130, 43)"}}>
</span>
<span style={{"display": "block", "height": "2px", "borderRadius": "4px 4px 0px 0px", "background": "rgb(180, 35, 24)"}}>
</span>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "bottom": "150px", "zIndex": "3", "minWidth": "150px", "padding": "10px 12px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 28px", "textAlign": "left", "fontSize": "12.5px", "lineHeight": "1.5", "color": "rgb(21, 33, 28)"}}>
<span style={{"display": "block", "fontWeight": "700"}}>
<span className="sc-interp">
Nov 6
</span>
{" "}·{" "}
<span className="sc-interp">
76
</span>
{" "}runs
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<span style={{"width": "8px", "height": "8px", "borderRadius": "2px", "background": "rgb(35, 132, 90)"}}>
</span>
<span className="sc-interp">
74
</span>
{" "}passed
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<span style={{"width": "8px", "height": "8px", "borderRadius": "2px", "background": "rgb(217, 130, 43)"}}>
</span>
<span className="sc-interp">
1
</span>
{" "}blocked
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<span style={{"width": "8px", "height": "8px", "borderRadius": "2px", "background": "rgb(180, 35, 24)"}}>
</span>
<span className="sc-interp">
1
</span>
{" "}failed
</span>
</span>
</button>
</div>
</div>
<div aria-hidden="true" style={{"marginTop": "8px", "display": "grid", "gridTemplateColumns": "repeat(7, minmax(0px, 1fr))", "fontSize": "12px", "color": "rgb(90, 105, 97)", "textAlign": "center"}}>
<span>
<span className="sc-interp">
Oct 31
</span>
</span>
<span>
<span className="sc-interp">
Nov 1
</span>
</span>
<span>
<span className="sc-interp">
Nov 2
</span>
</span>
<span>
<span className="sc-interp">
Nov 3
</span>
</span>
<span>
<span className="sc-interp">
Nov 4
</span>
</span>
<span>
<span className="sc-interp">
Nov 5
</span>
</span>
<span>
<span className="sc-interp">
Nov 6
</span>
</span>
</div>
</div>
</div>
</section>
<section aria-labelledby="ov-door" style={{"padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)", "display": "flex", "flexDirection": "column", "minWidth": "0px"}}>
<div style={{"display": "flex", "alignItems": "flex-start", "justifyContent": "space-between", "gap": "12px"}}>
<div>
<h2 id="ov-door" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif", "color": "rgb(21, 33, 28)"}}>
Safety door this week
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Every request your tests tried to make
</p>
</div>
<a href="#policy" data-nav="policy" style={{"fontSize": "13.5px", "fontWeight": "600", "textDecoration": "none", "whiteSpace": "nowrap"}}>
Open policy
</a>
</div>
<div style={{"marginTop": "16px", "display": "grid", "gridTemplateColumns": "repeat(3, minmax(0px, 1fr))", "gap": "10px"}}>
<div style={{"padding": "12px", "borderRadius": "12px", "background": "rgb(242, 248, 244)"}}>
<div style={{"font": "700 22px / 1.1 \"DM Sans\", system-ui, sans-serif", "color": "rgb(21, 33, 28)"}}>
1,962
</div>
<div style={{"marginTop": "2px", "fontSize": "12.5px", "color": "rgb(70, 84, 76)"}}>
allowed
</div>
</div>
<div style={{"padding": "12px", "borderRadius": "12px", "background": "rgb(255, 246, 234)"}}>
<div style={{"font": "700 22px / 1.1 \"DM Sans\", system-ui, sans-serif", "color": "rgb(21, 33, 28)"}}>
17
</div>
<div style={{"marginTop": "2px", "fontSize": "12.5px", "color": "rgb(70, 84, 76)"}}>
stopped
</div>
</div>
<div style={{"padding": "12px", "borderRadius": "12px", "background": "rgb(243, 241, 250)"}}>
<div style={{"font": "700 22px / 1.1 \"DM Sans\", system-ui, sans-serif", "color": "rgb(21, 33, 28)"}}>
412
</div>
<div style={{"marginTop": "2px", "fontSize": "12.5px", "color": "rgb(70, 84, 76)"}}>
keys swapped
</div>
</div>
</div>
<div style={{"marginTop": "18px", "fontSize": "12.5px", "fontWeight": "700", "letterSpacing": "0.06em", "textTransform": "uppercase", "color": "rgb(90, 105, 97)"}}>
Most often stopped
</div>
<ul style={{"listStyle": "none", "margin": "8px 0px 0px", "padding": "0px", "display": "grid", "gap": "2px"}}>
<li style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 1fr) auto", "gap": "10px", "alignItems": "center", "padding": "10px 0px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "font": "600 13px \"JetBrains Mono\", monospace", "color": "rgb(21, 33, 28)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
POST */refunds*
</span>
<span style={{"display": "block", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
rule block-destructive-refunds
</span>
</span>
<span style={{"font": "700 14px \"DM Sans\", system-ui, sans-serif", "color": "rgb(21, 33, 28)"}}>
9
</span>
</li>
<li style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 1fr) auto", "gap": "10px", "alignItems": "center", "padding": "10px 0px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "font": "600 13px \"JetBrains Mono\", monospace", "color": "rgb(21, 33, 28)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
POST /admin/settings
</span>
<span style={{"display": "block", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
rule block-admin-mutations
</span>
</span>
<span style={{"font": "700 14px \"DM Sans\", system-ui, sans-serif", "color": "rgb(21, 33, 28)"}}>
5
</span>
</li>
<li style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 1fr) auto", "gap": "10px", "alignItems": "center", "padding": "10px 0px"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "font": "600 13px \"JetBrains Mono\", monospace", "color": "rgb(21, 33, 28)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
POST webhook.site
</span>
<span style={{"display": "block", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
host on the blocked list
</span>
</span>
<span style={{"font": "700 14px \"DM Sans\", system-ui, sans-serif", "color": "rgb(21, 33, 28)"}}>
3
</span>
</li>
</ul>
</section>
</div>
<section aria-labelledby="ov-recent" style={{"marginTop": "14px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)", "overflow": "hidden"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "justifyContent": "space-between", "gap": "12px", "padding": "18px 20px"}}>
<div>
<h2 id="ov-recent" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif", "color": "rgb(21, 33, 28)"}}>
Recent runs
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Local and cloud runs, newest first
</p>
</div>
<a className="c-btn c-sec" href="#runs" data-nav="runs" style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "36px", "padding": "0px 14px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "color": "rgb(21, 33, 28)", "fontSize": "14px", "fontWeight": "600", "textDecoration": "none"}}>
All runs
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12h14M13 6l6 6-6 6">
</path>
</svg>
</a>
</div>
<div style={{"overflowX": "auto"}}>
<div style={{"minWidth": "820px"}}>
<div aria-hidden="true" style={{"display": "grid", "gridTemplateColumns": "minmax(180px, 1.6fr) 150px minmax(180px, 1.4fr) 90px 90px 80px", "gap": "12px", "padding": "10px 20px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "background": "rgb(247, 248, 245)", "fontSize": "12.5px", "fontWeight": "700", "color": "rgb(90, 105, 97)"}}>
<span>
Run
</span>
<span>
Result
</span>
<span>
Branch · commit
</span>
<span>
Where
</span>
<span>
Duration
</span>
<span>
Started
</span>
</div>
<a className="c-row" href="#run-detail" data-nav="run-detail" style={{"display": "grid", "gridTemplateColumns": "minmax(180px, 1.6fr) 150px minmax(180px, 1.4fr) 90px 90px 80px", "gap": "12px", "alignItems": "center", "padding": "14px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(21, 33, 28)", "textDecoration": "none"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "700"}}>
Checkout payment
</span>
<span style={{"display": "block", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
#1043
</span>
</span>
<span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "7px", "height": "26px", "padding": "0px 10px", "borderRadius": "999px", "background": "rgb(234, 241, 251)", "color": "rgb(36, 88, 155)", "fontSize": "12.5px", "fontWeight": "700"}}>
<span data-anim="1" style={{"width": "7px", "height": "7px", "borderRadius": "50%", "background": "rgb(36, 88, 155)", "animation": "1.4s ease-in-out 0s infinite normal none running c-pulse"}}>
</span>
Running · 11/18
</span>
</span>
<span style={{"minWidth": "0px", "font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
main · b31f0a2
</span>
<span style={{"color": "rgb(70, 84, 76)"}}>
Cloud
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "color": "rgb(70, 84, 76)"}}>
0:24
</span>
<span style={{"color": "rgb(90, 105, 97)"}}>
now
</span>
</a>
<a className="c-row" href="#run-detail" data-nav="run-detail" style={{"display": "grid", "gridTemplateColumns": "minmax(180px, 1.6fr) 150px minmax(180px, 1.4fr) 90px 90px 80px", "gap": "12px", "alignItems": "center", "padding": "14px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(21, 33, 28)", "textDecoration": "none"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "700"}}>
Checkout payment
</span>
<span style={{"display": "block", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
#1042
</span>
</span>
<span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "26px", "padding": "0px 10px", "borderRadius": "999px", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)", "fontSize": "12.5px", "fontWeight": "700"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
Passed
</span>
</span>
<span style={{"minWidth": "0px", "font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
main · a84d2c1
</span>
<span style={{"color": "rgb(70, 84, 76)"}}>
Cloud
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "color": "rgb(70, 84, 76)"}}>
42.8s
</span>
<span style={{"color": "rgb(90, 105, 97)"}}>
10:42
</span>
</a>
<a className="c-row" href="#run-detail" data-nav="run-detail" style={{"display": "grid", "gridTemplateColumns": "minmax(180px, 1.6fr) 150px minmax(180px, 1.4fr) 90px 90px 80px", "gap": "12px", "alignItems": "center", "padding": "14px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(21, 33, 28)", "textDecoration": "none"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "700"}}>
Admin access control
</span>
<span style={{"display": "block", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
#1041
</span>
</span>
<span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "26px", "padding": "0px 10px", "borderRadius": "999px", "background": "rgb(255, 243, 226)", "color": "rgb(154, 74, 7)", "fontSize": "12.5px", "fontWeight": "700"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5c-4.3-1.3-7.5-4.9-7.5-9.5V6z">
</path>
</svg>
Policy blocked
</span>
</span>
<span style={{"minWidth": "0px", "font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
feat/role-checks · c07be93
</span>
<span style={{"color": "rgb(70, 84, 76)"}}>
Cloud
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "color": "rgb(70, 84, 76)"}}>
31.2s
</span>
<span style={{"color": "rgb(90, 105, 97)"}}>
10:18
</span>
</a>
<a className="c-row" href="#run-detail" data-nav="run-detail" style={{"display": "grid", "gridTemplateColumns": "minmax(180px, 1.6fr) 150px minmax(180px, 1.4fr) 90px 90px 80px", "gap": "12px", "alignItems": "center", "padding": "14px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(21, 33, 28)", "textDecoration": "none"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "700"}}>
Warm state branching
</span>
<span style={{"display": "block", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
#1040
</span>
</span>
<span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "26px", "padding": "0px 10px", "borderRadius": "999px", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)", "fontSize": "12.5px", "fontWeight": "700"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
Passed
</span>
</span>
<span style={{"minWidth": "0px", "font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
main · 93fc018
</span>
<span style={{"color": "rgb(70, 84, 76)"}}>
Local
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "color": "rgb(70, 84, 76)"}}>
26.7s
</span>
<span style={{"color": "rgb(90, 105, 97)"}}>
09:54
</span>
</a>
<a className="c-row" href="#run-detail" data-nav="run-detail" style={{"display": "grid", "gridTemplateColumns": "minmax(180px, 1.6fr) 150px minmax(180px, 1.4fr) 90px 90px 80px", "gap": "12px", "alignItems": "center", "padding": "14px 20px", "color": "rgb(21, 33, 28)", "textDecoration": "none"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "700"}}>
Checkout payment
</span>
<span style={{"display": "block", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
#1039
</span>
</span>
<span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "26px", "padding": "0px 10px", "borderRadius": "999px", "background": "rgb(253, 237, 235)", "color": "rgb(180, 35, 24)", "fontSize": "12.5px", "fontWeight": "700"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
<path d="M7 7l10 10M17 7L7 17">
</path>
</svg>
Failed · 16/18
</span>
</span>
<span style={{"minWidth": "0px", "font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
fix/checkout-retry · e612af4
</span>
<span style={{"color": "rgb(70, 84, 76)"}}>
Cloud
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "color": "rgb(70, 84, 76)"}}>
51.9s
</span>
<span style={{"color": "rgb(90, 105, 97)"}}>
09:31
</span>
</a>
</div>
</div>
</section>
<div style={{"marginTop": "14px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(380px, 100%), 1fr))", "gap": "14px"}}>
<section aria-labelledby="ov-attn" style={{"padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<h2 id="ov-attn" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif", "color": "rgb(21, 33, 28)"}}>
Needs attention
</h2>
<ul style={{"listStyle": "none", "margin": "12px 0px 0px", "padding": "0px", "display": "grid", "gap": "8px"}}>
<li>
<a className="c-row" href="#run-detail" data-nav="run-detail" style={{"display": "flex", "alignItems": "flex-start", "gap": "12px", "padding": "12px", "border": "1px solid rgb(238, 242, 238)", "borderRadius": "12px", "color": "rgb(21, 33, 28)", "textDecoration": "none"}}>
<span style={{"flex": "0 0 auto", "width": "32px", "height": "32px", "borderRadius": "9px", "background": "rgb(253, 237, 235)", "color": "rgb(180, 35, 24)", "display": "inline-flex", "alignItems": "center", "justifyContent": "center"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
<path d="M7 7l10 10M17 7L7 17">
</path>
</svg>
</span>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "700"}}>
Checkout failed on fix/checkout-retry
</span>
<span style={{"display": "block", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
X-Ray:{" "}
<span style={{"fontFamily": "\"JetBrains Mono\", monospace"}}>
POST /api/checkout
</span>
{" "}returned 500 at step 17
</span>
</span>
</a>
</li>
<li>
<a className="c-row" href="#healing" data-nav="healing" style={{"display": "flex", "alignItems": "flex-start", "gap": "12px", "padding": "12px", "border": "1px solid rgb(238, 242, 238)", "borderRadius": "12px", "color": "rgb(21, 33, 28)", "textDecoration": "none"}}>
<span style={{"flex": "0 0 auto", "width": "32px", "height": "32px", "borderRadius": "9px", "background": "rgb(255, 243, 226)", "color": "rgb(154, 74, 7)", "display": "inline-flex", "alignItems": "center", "justifyContent": "center"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
<circle cx="12" cy="12" r="7">
</circle>
<path d="M12 2v3M12 19v3M2 12h3M19 12h3">
</path>
</svg>
</span>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "700"}}>
3 healed locators waiting for review
</span>
<span style={{"display": "block", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Accept them to update your specs, or reject to keep the old selector
</span>
</span>
</a>
</li>
<li>
<a className="c-row" href="#tests" data-nav="explorer" style={{"display": "flex", "alignItems": "flex-start", "gap": "12px", "padding": "12px", "border": "1px solid rgb(238, 242, 238)", "borderRadius": "12px", "color": "rgb(21, 33, 28)", "textDecoration": "none"}}>
<span style={{"flex": "0 0 auto", "width": "32px", "height": "32px", "borderRadius": "9px", "background": "rgb(234, 241, 251)", "color": "rgb(36, 88, 155)", "display": "inline-flex", "alignItems": "center", "justifyContent": "center"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M3 12h4l2.5-6 5 12 2.5-6h4">
</path>
</svg>
</span>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "700"}}>
Flaky: Checkout › applies saved payment method
</span>
<span style={{"display": "block", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
2 failures in 52 runs (3.8%)
</span>
</span>
</a>
</li>
</ul>
</section>
<section aria-labelledby="ov-receipt" style={{"padding": "20px", "borderRadius": "16px", "background": "rgb(15, 29, 23)", "color": "rgb(215, 231, 221)"}}>
<div style={{"display": "flex", "alignItems": "flex-start", "justifyContent": "space-between", "gap": "12px"}}>
<div>
<h2 id="ov-receipt" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif", "color": "rgb(255, 255, 255)"}}>
Latest signed receipt
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(169, 196, 182)"}}>
run_40549cd06baf · Nov 6, 08:40
</p>
</div>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "28px", "padding": "0px 10px", "borderRadius": "999px", "background": "rgb(127, 214, 174)", "color": "rgb(15, 29, 23)", "fontSize": "12.5px", "fontWeight": "800"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
Valid chain
</span>
</div>
<dl style={{"margin": "16px 0px 0px", "display": "grid", "gridTemplateColumns": "auto minmax(0px, 1fr)", "gap": "8px 16px", "fontSize": "13.5px"}}>
<dt style={{"color": "rgb(169, 196, 182)"}}>
Merkle root
</dt>
<dd style={{"margin": "0px", "fontFamily": "\"JetBrains Mono\", monospace", "color": "rgb(255, 255, 255)", "overflowWrap": "anywhere"}}>
e2114ac9fab789cb…a8f6aece
</dd>
<dt style={{"color": "rgb(169, 196, 182)"}}>
Signature
</dt>
<dd style={{"margin": "0px", "fontFamily": "\"JetBrains Mono\", monospace", "color": "rgb(255, 255, 255)", "overflowWrap": "anywhere"}}>
HMAC-SHA256 · 3c05ca9c…0a24
</dd>
<dt style={{"color": "rgb(169, 196, 182)"}}>
Ledger
</dt>
<dd style={{"margin": "0px", "color": "rgb(255, 255, 255)"}}>
5 blocks · 1 request blocked · 2 stand-in keys
</dd>
</dl>
<div style={{"marginTop": "16px", "display": "flex", "flexWrap": "wrap", "gap": "10px"}}>
<a className="c-btn" href="#evidence" data-nav="audit" style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "38px", "padding": "0px 14px", "borderRadius": "10px", "background": "rgb(184, 228, 206)", "color": "rgb(15, 29, 23)", "fontSize": "14px", "fontWeight": "700", "textDecoration": "none"}}>
Verify{" "}
&
{" "}view ledger
</a>
<a className="c-btn" href="#evidence" data-nav="audit" style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "38px", "padding": "0px 14px", "border": "1px solid rgb(47, 75, 63)", "borderRadius": "10px", "color": "rgb(231, 242, 236)", "fontSize": "14px", "fontWeight": "600", "textDecoration": "none"}}>
Download bundle
</a>
</div>
</section>
</div>
</main>
    </>
  );
}
