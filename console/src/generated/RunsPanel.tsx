// Generated from the original console markup by html2jsx. Static design preview.
export default function RunsPanel() {
  return (
    <>
<main style={{"flex": "1 1 0%", "width": "100%", "maxWidth": "1320px", "padding": "28px 32px 56px"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "flex-end", "justifyContent": "space-between", "gap": "16px"}}>
<div style={{"minWidth": "0px"}}>
<h1 style={{"margin": "0px", "font": "800 30px / 1.2 Manrope, system-ui, sans-serif", "letterSpacing": "-0.02em", "color": "rgb(21, 33, 28)"}}>
Runs
</h1>
<p style={{"margin": "6px 0px 0px", "fontSize": "15.5px", "color": "rgb(90, 105, 97)"}}>
Every test run — on laptops, in CI and on cloud runners. Each one leaves a signed receipt.
</p>
</div>
<div style={{"display": "flex", "flexWrap": "wrap", "gap": "10px"}}>
<button type="button" className="c-btn c-sec" style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "40px", "padding": "0px 16px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "color": "rgb(21, 33, 28)", "font": "600 14.5px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M12 4v12M6 10l6 6 6-6M5 20h14">
</path>
</svg>
Export CSV
</button>
<button type="button" className="c-btn c-pri" aria-expanded="false" style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "40px", "padding": "0px 16px", "border": "0px", "borderRadius": "10px", "background": "rgb(47, 111, 91)", "color": "rgb(255, 255, 255)", "font": "600 14.5px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
<path d="M8 5.5v13l10.5-6.5z">
</path>
</svg>
New run
</button>
</div>
</div>
<section aria-label="Filters" style={{"marginTop": "22px", "display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "10px"}}>
<label style={{"flex": "1 1 260px", "display": "flex", "alignItems": "center", "gap": "8px", "height": "40px", "padding": "0px 12px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "color": "rgb(90, 105, 97)"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
<circle cx="11" cy="11" r="6.5">
</circle>
<path d="M20 20l-4.2-4.2">
</path>
</svg>
<span style={{"position": "absolute", "width": "1px", "height": "1px", "overflow": "hidden", "clip": "rect(0px, 0px, 0px, 0px)"}}>
Filter runs
</span>
<input type="search" placeholder="Filter by suite, branch, commit or person" defaultValue="" style={{"flex": "1 1 0%", "minWidth": "0px", "border": "0px", "background": "transparent", "outline": "none", "font": "14.5px \"DM Sans\", system-ui, sans-serif", "color": "rgb(21, 33, 28)"}} />
</label>
<div role="group" aria-label="Result" style={{"display": "flex", "flexWrap": "wrap", "gap": "4px", "padding": "4px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "12px", "background": "rgb(255, 255, 255)"}}>
<button type="button" aria-pressed="true" style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "32px", "padding": "0px 12px", "border": "0px", "borderRadius": "8px", "cursor": "pointer", "font": "600 13.5px \"DM Sans\", system-ui, sans-serif", "background": "rgb(21, 33, 28)", "color": "rgb(255, 255, 255)"}}>
<span className="sc-interp">
All
</span>
<span style={{"minWidth": "20px", "height": "20px", "padding": "0px 6px", "borderRadius": "999px", "background": "rgba(255, 255, 255, 0.18)", "fontSize": "12px", "lineHeight": "20px"}}>
<span className="sc-interp">
10
</span>
</span>
</button>
<button type="button" aria-pressed="false" style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "32px", "padding": "0px 12px", "border": "0px", "borderRadius": "8px", "cursor": "pointer", "font": "600 13.5px \"DM Sans\", system-ui, sans-serif", "background": "transparent", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
Passed
</span>
<span style={{"minWidth": "20px", "height": "20px", "padding": "0px 6px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "fontSize": "12px", "lineHeight": "20px"}}>
<span className="sc-interp">
6
</span>
</span>
</button>
<button type="button" aria-pressed="false" style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "32px", "padding": "0px 12px", "border": "0px", "borderRadius": "8px", "cursor": "pointer", "font": "600 13.5px \"DM Sans\", system-ui, sans-serif", "background": "transparent", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
Failed
</span>
<span style={{"minWidth": "20px", "height": "20px", "padding": "0px 6px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "fontSize": "12px", "lineHeight": "20px"}}>
<span className="sc-interp">
2
</span>
</span>
</button>
<button type="button" aria-pressed="false" style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "32px", "padding": "0px 12px", "border": "0px", "borderRadius": "8px", "cursor": "pointer", "font": "600 13.5px \"DM Sans\", system-ui, sans-serif", "background": "transparent", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
Blocked
</span>
<span style={{"minWidth": "20px", "height": "20px", "padding": "0px 6px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "fontSize": "12px", "lineHeight": "20px"}}>
<span className="sc-interp">
1
</span>
</span>
</button>
<button type="button" aria-pressed="false" style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "32px", "padding": "0px 12px", "border": "0px", "borderRadius": "8px", "cursor": "pointer", "font": "600 13.5px \"DM Sans\", system-ui, sans-serif", "background": "transparent", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
Running
</span>
<span style={{"minWidth": "20px", "height": "20px", "padding": "0px 6px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "fontSize": "12px", "lineHeight": "20px"}}>
<span className="sc-interp">
1
</span>
</span>
</button>
</div>
<label style={{"display": "flex", "alignItems": "center", "gap": "8px", "height": "40px", "padding": "0px 4px 0px 12px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "fontSize": "13.5px", "fontWeight": "600", "color": "rgb(70, 84, 76)"}}>
Where
<select style={{"height": "36px", "border": "0px", "background": "transparent", "font": "600 14px \"DM Sans\", system-ui, sans-serif", "color": "rgb(21, 33, 28)", "cursor": "pointer"}}>
<option value="all">
Anywhere
</option>
<option value="Cloud">
Cloud
</option>
<option value="Local">
Local
</option>
</select>
</label>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "40px", "padding": "0px 12px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "fontSize": "14px", "fontWeight": "600", "color": "rgb(21, 33, 28)"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<rect x="4" y="5.5" width="16" height="15" rx="2">
</rect>
<path d="M4 10h16M8.5 3.5v4M15.5 3.5v4">
</path>
</svg>
Last 7 days
</span>
</section>
<section aria-label="Run list" style={{"marginTop": "14px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)", "overflow": "hidden"}}>
<div style={{"overflowX": "auto"}}>
<div style={{"minWidth": "1040px"}}>
<div aria-hidden="true" style={{"display": "grid", "gridTemplateColumns": "minmax(190px, 1.5fr) 160px minmax(180px, 1.3fr) 80px 120px 130px 80px 90px 70px", "gap": "12px", "padding": "11px 20px", "borderBottom": "1px solid rgb(227, 232, 226)", "background": "rgb(247, 248, 245)", "fontSize": "12.5px", "fontWeight": "700", "color": "rgb(90, 105, 97)"}}>
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
Triggered by
</span>
<span>
Steps
</span>
<span>
Duration
</span>
<span>
Evidence
</span>
<span>
Started
</span>
</div>
<a className="c-row" href="#run-detail" data-nav="run-detail" style={{"display": "grid", "gridTemplateColumns": "minmax(190px, 1.5fr) 160px minmax(180px, 1.3fr) 80px 120px 130px 80px 90px 70px", "gap": "12px", "alignItems": "center", "padding": "13px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(21, 33, 28)", "textDecoration": "none", "background": "transparent"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "700", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
Checkout payment
</span>
</span>
<span style={{"display": "block", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
#
<span className="sc-interp">
1043
</span>
</span>
</span>
<span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "26px", "padding": "0px 10px", "borderRadius": "999px", "fontSize": "12.5px", "fontWeight": "700", "whiteSpace": "nowrap", "background": "rgb(234, 241, 251)", "color": "rgb(36, 88, 155)"}}>
<span data-anim="1" style={{"width": "7px", "height": "7px", "borderRadius": "50%", "background": "currentcolor", "animation": "1.4s ease-in-out 0s infinite normal none running c-pulse"}}>
</span>
<span className="sc-interp">
Running
</span>
</span>
</span>
<span style={{"minWidth": "0px", "font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
main
</span>
{" "}·{" "}
<span className="sc-interp">
b31f0a2
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.1 4.75 4.75 0 0 0 7 18.5z">
</path>
</svg>
<span className="sc-interp">
Cloud
</span>
</span>
<span style={{"minWidth": "0px", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
CI pipeline
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<span style={{"flex": "1 1 0%", "height": "6px", "borderRadius": "3px", "background": "rgb(238, 242, 238)", "overflow": "hidden"}}>
<span style={{"display": "block", "height": "100%", "borderRadius": "3px", "width": "61%", "background": "rgb(36, 88, 155)"}}>
</span>
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
11/18
</span>
</span>
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
0:24
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "5px", "fontSize": "13px", "fontWeight": "600", "color": "rgb(90, 105, 97)"}}>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M12 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 1 0 0-17zM12 7.5V12l3 2">
</path>
</svg>
<span className="sc-interp">
Pending
</span>
</span>
<span style={{"color": "rgb(90, 105, 97)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
now
</span>
</span>
</a>
<a className="c-row" href="#run-detail" data-nav="run-detail" style={{"display": "grid", "gridTemplateColumns": "minmax(190px, 1.5fr) 160px minmax(180px, 1.3fr) 80px 120px 130px 80px 90px 70px", "gap": "12px", "alignItems": "center", "padding": "13px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(21, 33, 28)", "textDecoration": "none", "background": "transparent"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "700", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
Checkout payment
</span>
</span>
<span style={{"display": "block", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
#
<span className="sc-interp">
1042
</span>
</span>
</span>
<span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "26px", "padding": "0px 10px", "borderRadius": "999px", "fontSize": "12.5px", "fontWeight": "700", "whiteSpace": "nowrap", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
<span className="sc-interp">
Passed
</span>
</span>
</span>
<span style={{"minWidth": "0px", "font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
main
</span>
{" "}·{" "}
<span className="sc-interp">
a84d2c1
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.1 4.75 4.75 0 0 0 7 18.5z">
</path>
</svg>
<span className="sc-interp">
Cloud
</span>
</span>
<span style={{"minWidth": "0px", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
Maya Chen
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<span style={{"flex": "1 1 0%", "height": "6px", "borderRadius": "3px", "background": "rgb(238, 242, 238)", "overflow": "hidden"}}>
<span style={{"display": "block", "height": "100%", "borderRadius": "3px", "width": "100%", "background": "rgb(35, 132, 90)"}}>
</span>
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
18/18
</span>
</span>
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
42.8s
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "5px", "fontSize": "13px", "fontWeight": "600", "color": "rgb(31, 107, 79)"}}>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6">
</path>
</svg>
<span className="sc-interp">
Signed
</span>
</span>
<span style={{"color": "rgb(90, 105, 97)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
10:42
</span>
</span>
</a>
<a className="c-row" href="#run-detail" data-nav="run-detail" style={{"display": "grid", "gridTemplateColumns": "minmax(190px, 1.5fr) 160px minmax(180px, 1.3fr) 80px 120px 130px 80px 90px 70px", "gap": "12px", "alignItems": "center", "padding": "13px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(21, 33, 28)", "textDecoration": "none", "background": "transparent"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "700", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
Admin access control
</span>
</span>
<span style={{"display": "block", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
#
<span className="sc-interp">
1041
</span>
</span>
</span>
<span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "26px", "padding": "0px 10px", "borderRadius": "999px", "fontSize": "12.5px", "fontWeight": "700", "whiteSpace": "nowrap", "background": "rgb(255, 243, 226)", "color": "rgb(154, 74, 7)"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5c-4.3-1.3-7.5-4.9-7.5-9.5V6z">
</path>
</svg>
<span className="sc-interp">
Policy blocked
</span>
</span>
</span>
<span style={{"minWidth": "0px", "font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
feat/role-checks
</span>
{" "}·{" "}
<span className="sc-interp">
c07be93
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.1 4.75 4.75 0 0 0 7 18.5z">
</path>
</svg>
<span className="sc-interp">
Cloud
</span>
</span>
<span style={{"minWidth": "0px", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
CI pipeline
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<span style={{"flex": "1 1 0%", "height": "6px", "borderRadius": "3px", "background": "rgb(238, 242, 238)", "overflow": "hidden"}}>
<span style={{"display": "block", "height": "100%", "borderRadius": "3px", "width": "92%", "background": "rgb(217, 130, 43)"}}>
</span>
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
11/12
</span>
</span>
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
31.2s
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "5px", "fontSize": "13px", "fontWeight": "600", "color": "rgb(31, 107, 79)"}}>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6">
</path>
</svg>
<span className="sc-interp">
Signed
</span>
</span>
<span style={{"color": "rgb(90, 105, 97)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
10:18
</span>
</span>
</a>
<a className="c-row" href="#run-detail" data-nav="run-detail" style={{"display": "grid", "gridTemplateColumns": "minmax(190px, 1.5fr) 160px minmax(180px, 1.3fr) 80px 120px 130px 80px 90px 70px", "gap": "12px", "alignItems": "center", "padding": "13px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(21, 33, 28)", "textDecoration": "none", "background": "transparent"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "700", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
Warm state branching
</span>
</span>
<span style={{"display": "block", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
#
<span className="sc-interp">
1040
</span>
</span>
</span>
<span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "26px", "padding": "0px 10px", "borderRadius": "999px", "fontSize": "12.5px", "fontWeight": "700", "whiteSpace": "nowrap", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
<span className="sc-interp">
Passed
</span>
</span>
</span>
<span style={{"minWidth": "0px", "font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
main
</span>
{" "}·{" "}
<span className="sc-interp">
93fc018
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M4 5h16v11H4zM2.5 19h19">
</path>
</svg>
<span className="sc-interp">
Local
</span>
</span>
<span style={{"minWidth": "0px", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
Jordan Lee
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<span style={{"flex": "1 1 0%", "height": "6px", "borderRadius": "3px", "background": "rgb(238, 242, 238)", "overflow": "hidden"}}>
<span style={{"display": "block", "height": "100%", "borderRadius": "3px", "width": "100%", "background": "rgb(35, 132, 90)"}}>
</span>
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
14/14
</span>
</span>
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
26.7s
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "5px", "fontSize": "13px", "fontWeight": "600", "color": "rgb(31, 107, 79)"}}>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6">
</path>
</svg>
<span className="sc-interp">
Signed
</span>
</span>
<span style={{"color": "rgb(90, 105, 97)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
09:54
</span>
</span>
</a>
<a className="c-row" href="#run-detail" data-nav="run-detail" style={{"display": "grid", "gridTemplateColumns": "minmax(190px, 1.5fr) 160px minmax(180px, 1.3fr) 80px 120px 130px 80px 90px 70px", "gap": "12px", "alignItems": "center", "padding": "13px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(21, 33, 28)", "textDecoration": "none", "background": "transparent"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "700", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
Checkout payment
</span>
</span>
<span style={{"display": "block", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
#
<span className="sc-interp">
1039
</span>
</span>
</span>
<span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "26px", "padding": "0px 10px", "borderRadius": "999px", "fontSize": "12.5px", "fontWeight": "700", "whiteSpace": "nowrap", "background": "rgb(253, 237, 235)", "color": "rgb(180, 35, 24)"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M7 7l10 10M17 7L7 17">
</path>
</svg>
<span className="sc-interp">
Failed
</span>
</span>
</span>
<span style={{"minWidth": "0px", "font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
fix/checkout-retry
</span>
{" "}·{" "}
<span className="sc-interp">
e612af4
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.1 4.75 4.75 0 0 0 7 18.5z">
</path>
</svg>
<span className="sc-interp">
Cloud
</span>
</span>
<span style={{"minWidth": "0px", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
CI pipeline
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<span style={{"flex": "1 1 0%", "height": "6px", "borderRadius": "3px", "background": "rgb(238, 242, 238)", "overflow": "hidden"}}>
<span style={{"display": "block", "height": "100%", "borderRadius": "3px", "width": "89%", "background": "rgb(180, 35, 24)"}}>
</span>
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
16/18
</span>
</span>
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
51.9s
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "5px", "fontSize": "13px", "fontWeight": "600", "color": "rgb(31, 107, 79)"}}>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6">
</path>
</svg>
<span className="sc-interp">
Signed
</span>
</span>
<span style={{"color": "rgb(90, 105, 97)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
09:31
</span>
</span>
</a>
<a className="c-row" href="#run-detail" data-nav="run-detail" style={{"display": "grid", "gridTemplateColumns": "minmax(190px, 1.5fr) 160px minmax(180px, 1.3fr) 80px 120px 130px 80px 90px 70px", "gap": "12px", "alignItems": "center", "padding": "13px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(21, 33, 28)", "textDecoration": "none", "background": "transparent"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "700", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
Admin access control
</span>
</span>
<span style={{"display": "block", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
#
<span className="sc-interp">
1038
</span>
</span>
</span>
<span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "26px", "padding": "0px 10px", "borderRadius": "999px", "fontSize": "12.5px", "fontWeight": "700", "whiteSpace": "nowrap", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
<span className="sc-interp">
Passed
</span>
</span>
</span>
<span style={{"minWidth": "0px", "font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
main
</span>
{" "}·{" "}
<span className="sc-interp">
6d0b18e
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.1 4.75 4.75 0 0 0 7 18.5z">
</path>
</svg>
<span className="sc-interp">
Cloud
</span>
</span>
<span style={{"minWidth": "0px", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
Maya Chen
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<span style={{"flex": "1 1 0%", "height": "6px", "borderRadius": "3px", "background": "rgb(238, 242, 238)", "overflow": "hidden"}}>
<span style={{"display": "block", "height": "100%", "borderRadius": "3px", "width": "100%", "background": "rgb(35, 132, 90)"}}>
</span>
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
12/12
</span>
</span>
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
29.4s
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "5px", "fontSize": "13px", "fontWeight": "600", "color": "rgb(31, 107, 79)"}}>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6">
</path>
</svg>
<span className="sc-interp">
Signed
</span>
</span>
<span style={{"color": "rgb(90, 105, 97)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
09:04
</span>
</span>
</a>
<a className="c-row" href="#run-detail" data-nav="run-detail" style={{"display": "grid", "gridTemplateColumns": "minmax(190px, 1.5fr) 160px minmax(180px, 1.3fr) 80px 120px 130px 80px 90px 70px", "gap": "12px", "alignItems": "center", "padding": "13px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(21, 33, 28)", "textDecoration": "none", "background": "transparent"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "700", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
Warm state branching
</span>
</span>
<span style={{"display": "block", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
#
<span className="sc-interp">
1037
</span>
</span>
</span>
<span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "26px", "padding": "0px 10px", "borderRadius": "999px", "fontSize": "12.5px", "fontWeight": "700", "whiteSpace": "nowrap", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
<span className="sc-interp">
Passed
</span>
</span>
</span>
<span style={{"minWidth": "0px", "font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
feat/warm-state
</span>
{" "}·{" "}
<span className="sc-interp">
e701baf
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.1 4.75 4.75 0 0 0 7 18.5z">
</path>
</svg>
<span className="sc-interp">
Cloud
</span>
</span>
<span style={{"minWidth": "0px", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
CI pipeline
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<span style={{"flex": "1 1 0%", "height": "6px", "borderRadius": "3px", "background": "rgb(238, 242, 238)", "overflow": "hidden"}}>
<span style={{"display": "block", "height": "100%", "borderRadius": "3px", "width": "100%", "background": "rgb(35, 132, 90)"}}>
</span>
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
14/14
</span>
</span>
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
27.1s
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "5px", "fontSize": "13px", "fontWeight": "600", "color": "rgb(31, 107, 79)"}}>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6">
</path>
</svg>
<span className="sc-interp">
Signed
</span>
</span>
<span style={{"color": "rgb(90, 105, 97)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
08:46
</span>
</span>
</a>
<a className="c-row" href="#run-detail" data-nav="run-detail" style={{"display": "grid", "gridTemplateColumns": "minmax(190px, 1.5fr) 160px minmax(180px, 1.3fr) 80px 120px 130px 80px 90px 70px", "gap": "12px", "alignItems": "center", "padding": "13px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(21, 33, 28)", "textDecoration": "none", "background": "transparent"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "700", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
Notes app smoke
</span>
</span>
<span style={{"display": "block", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
#
<span className="sc-interp">
1036
</span>
</span>
</span>
<span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "26px", "padding": "0px 10px", "borderRadius": "999px", "fontSize": "12.5px", "fontWeight": "700", "whiteSpace": "nowrap", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
<span className="sc-interp">
Passed
</span>
</span>
</span>
<span style={{"minWidth": "0px", "font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
main
</span>
{" "}·{" "}
<span className="sc-interp">
4ac2e19
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M4 5h16v11H4zM2.5 19h19">
</path>
</svg>
<span className="sc-interp">
Local
</span>
</span>
<span style={{"minWidth": "0px", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
Priya Nair
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<span style={{"flex": "1 1 0%", "height": "6px", "borderRadius": "3px", "background": "rgb(238, 242, 238)", "overflow": "hidden"}}>
<span style={{"display": "block", "height": "100%", "borderRadius": "3px", "width": "100%", "background": "rgb(35, 132, 90)"}}>
</span>
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
6/6
</span>
</span>
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
8.3s
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "5px", "fontSize": "13px", "fontWeight": "600", "color": "rgb(31, 107, 79)"}}>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6">
</path>
</svg>
<span className="sc-interp">
Signed
</span>
</span>
<span style={{"color": "rgb(90, 105, 97)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
Nov 5
</span>
</span>
</a>
<a className="c-row" href="#run-detail" data-nav="run-detail" style={{"display": "grid", "gridTemplateColumns": "minmax(190px, 1.5fr) 160px minmax(180px, 1.3fr) 80px 120px 130px 80px 90px 70px", "gap": "12px", "alignItems": "center", "padding": "13px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(21, 33, 28)", "textDecoration": "none", "background": "transparent"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "700", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
Checkout payment
</span>
</span>
<span style={{"display": "block", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
#
<span className="sc-interp">
1035
</span>
</span>
</span>
<span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "26px", "padding": "0px 10px", "borderRadius": "999px", "fontSize": "12.5px", "fontWeight": "700", "whiteSpace": "nowrap", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
<span className="sc-interp">
Passed
</span>
</span>
</span>
<span style={{"minWidth": "0px", "font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
main
</span>
{" "}·{" "}
<span className="sc-interp">
7b21cd0
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.1 4.75 4.75 0 0 0 7 18.5z">
</path>
</svg>
<span className="sc-interp">
Cloud
</span>
</span>
<span style={{"minWidth": "0px", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
CI pipeline
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<span style={{"flex": "1 1 0%", "height": "6px", "borderRadius": "3px", "background": "rgb(238, 242, 238)", "overflow": "hidden"}}>
<span style={{"display": "block", "height": "100%", "borderRadius": "3px", "width": "100%", "background": "rgb(35, 132, 90)"}}>
</span>
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
18/18
</span>
</span>
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
41.2s
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "5px", "fontSize": "13px", "fontWeight": "600", "color": "rgb(31, 107, 79)"}}>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6">
</path>
</svg>
<span className="sc-interp">
Signed
</span>
</span>
<span style={{"color": "rgb(90, 105, 97)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
Nov 5
</span>
</span>
</a>
<a className="c-row" href="#run-detail" data-nav="run-detail" style={{"display": "grid", "gridTemplateColumns": "minmax(190px, 1.5fr) 160px minmax(180px, 1.3fr) 80px 120px 130px 80px 90px 70px", "gap": "12px", "alignItems": "center", "padding": "13px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(21, 33, 28)", "textDecoration": "none", "background": "transparent"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "700", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
Admin access control
</span>
</span>
<span style={{"display": "block", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
#
<span className="sc-interp">
1034
</span>
</span>
</span>
<span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "26px", "padding": "0px 10px", "borderRadius": "999px", "fontSize": "12.5px", "fontWeight": "700", "whiteSpace": "nowrap", "background": "rgb(253, 237, 235)", "color": "rgb(180, 35, 24)"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M7 7l10 10M17 7L7 17">
</path>
</svg>
<span className="sc-interp">
Failed
</span>
</span>
</span>
<span style={{"minWidth": "0px", "font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
feat/role-checks
</span>
{" "}·{" "}
<span className="sc-interp">
1f9a7e2
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.1 4.75 4.75 0 0 0 7 18.5z">
</path>
</svg>
<span className="sc-interp">
Cloud
</span>
</span>
<span style={{"minWidth": "0px", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
CI pipeline
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<span style={{"flex": "1 1 0%", "height": "6px", "borderRadius": "3px", "background": "rgb(238, 242, 238)", "overflow": "hidden"}}>
<span style={{"display": "block", "height": "100%", "borderRadius": "3px", "width": "83%", "background": "rgb(180, 35, 24)"}}>
</span>
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
10/12
</span>
</span>
</span>
<span style={{"fontVariantNumeric": "tabular-nums", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
33.0s
</span>
</span>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "5px", "fontSize": "13px", "fontWeight": "600", "color": "rgb(31, 107, 79)"}}>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6">
</path>
</svg>
<span className="sc-interp">
Signed
</span>
</span>
<span style={{"color": "rgb(90, 105, 97)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
Nov 5
</span>
</span>
</a>
</div>
</div>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "justifyContent": "space-between", "gap": "12px", "padding": "14px 20px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
<span>
Showing{" "}
<span className="sc-interp">
10
</span>
{" "}of 446 runs this week
</span>
<div style={{"display": "flex", "gap": "8px"}}>
<button type="button" disabled style={{"height": "34px", "padding": "0px 12px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "9px", "background": "rgb(247, 248, 245)", "color": "rgb(90, 105, 97)", "font": "600 13.5px \"DM Sans\", system-ui, sans-serif"}}>
Previous
</button>
<button type="button" style={{"height": "34px", "padding": "0px 12px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "9px", "background": "rgb(255, 255, 255)", "color": "rgb(21, 33, 28)", "font": "600 13.5px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
Next
</button>
</div>
</div>
</section>
</main>
    </>
  );
}
