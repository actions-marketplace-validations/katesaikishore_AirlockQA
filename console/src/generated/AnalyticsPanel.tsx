// Generated from the original console markup by html2jsx. Static design preview.
export default function AnalyticsPanel() {
  return (
    <>
<main style={{"flex": "1 1 0%", "width": "100%", "maxWidth": "1320px", "padding": "28px 32px 56px"}}>
<h1 style={{"margin": "0px", "font": "800 30px / 1.2 Manrope, system-ui, sans-serif", "letterSpacing": "-0.02em", "color": "rgb(21, 33, 28)"}}>
Analytics
</h1>
<p style={{"margin": "6px 0px 0px", "fontSize": "15.5px", "color": "rgb(90, 105, 97)"}}>
Are tests getting steadier, faster and safer? Every number below follows the filters.
</p>
<section aria-label="Filters" style={{"marginTop": "20px", "display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "10px"}}>
<div role="group" aria-label="Date range" style={{"display": "flex", "gap": "4px", "padding": "4px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "12px", "background": "rgb(255, 255, 255)"}}>
<button type="button" aria-pressed="false" style={{"height": "32px", "padding": "0px 14px", "border": "0px", "borderRadius": "8px", "cursor": "pointer", "font": "600 13.5px \"DM Sans\", system-ui, sans-serif", "background": "transparent", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
Last 7 days
</span>
</button>
<button type="button" aria-pressed="true" style={{"height": "32px", "padding": "0px 14px", "border": "0px", "borderRadius": "8px", "cursor": "pointer", "font": "600 13.5px \"DM Sans\", system-ui, sans-serif", "background": "rgb(21, 33, 28)", "color": "rgb(255, 255, 255)"}}>
<span className="sc-interp">
Last 30 days
</span>
</button>
<button type="button" aria-pressed="false" style={{"height": "32px", "padding": "0px 14px", "border": "0px", "borderRadius": "8px", "cursor": "pointer", "font": "600 13.5px \"DM Sans\", system-ui, sans-serif", "background": "transparent", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
Last 90 days
</span>
</button>
</div>
<label style={{"display": "flex", "alignItems": "center", "gap": "8px", "height": "40px", "padding": "0px 4px 0px 12px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "fontSize": "13.5px", "fontWeight": "600", "color": "rgb(70, 84, 76)"}}>
Environment
<select style={{"height": "36px", "border": "0px", "background": "transparent", "font": "600 14px \"DM Sans\", system-ui, sans-serif", "color": "rgb(21, 33, 28)"}}>
<option>
All
</option>
<option>
staging
</option>
<option>
preview
</option>
</select>
</label>
<label style={{"display": "flex", "alignItems": "center", "gap": "8px", "height": "40px", "padding": "0px 4px 0px 12px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "fontSize": "13.5px", "fontWeight": "600", "color": "rgb(70, 84, 76)"}}>
Suite
<select style={{"height": "36px", "border": "0px", "background": "transparent", "font": "600 14px \"DM Sans\", system-ui, sans-serif", "color": "rgb(21, 33, 28)"}}>
<option>
All suites
</option>
<option>
Checkout
</option>
<option>
Authentication
</option>
<option>
Account settings
</option>
<option>
Cart{" "}
&
{" "}pricing
</option>
</select>
</label>
</section>
<section aria-label="Key numbers" style={{"marginTop": "16px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(210px, 100%), 1fr))", "gap": "14px"}}>
<article style={{"padding": "18px 20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<div style={{"fontSize": "14px", "fontWeight": "600", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
Pass rate
</span>
</div>
<div style={{"marginTop": "6px", "font": "700 30px / 1.1 \"DM Sans\", system-ui, sans-serif", "letterSpacing": "-0.02em", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
96.8%
</span>
</div>
<div style={{"marginTop": "6px", "fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
<span style={{"fontWeight": "700", "color": "rgb(31, 107, 79)"}}>
<span className="sc-interp">
↑ 1.1 pts
</span>
</span>
{" "}
<span className="sc-interp">
vs previous 30 days
</span>
</div>
</article>
<article style={{"padding": "18px 20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<div style={{"fontSize": "14px", "fontWeight": "600", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
Flaky rate
</span>
</div>
<div style={{"marginTop": "6px", "font": "700 30px / 1.1 \"DM Sans\", system-ui, sans-serif", "letterSpacing": "-0.02em", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
1.9%
</span>
</div>
<div style={{"marginTop": "6px", "fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
<span style={{"fontWeight": "700", "color": "rgb(31, 107, 79)"}}>
<span className="sc-interp">
↓ 0.4 pts
</span>
</span>
{" "}
<span className="sc-interp">
fewer reruns
</span>
</div>
</article>
<article style={{"padding": "18px 20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<div style={{"fontSize": "14px", "fontWeight": "600", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
Median run
</span>
</div>
<div style={{"marginTop": "6px", "font": "700 30px / 1.1 \"DM Sans\", system-ui, sans-serif", "letterSpacing": "-0.02em", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
41s
</span>
</div>
<div style={{"marginTop": "6px", "fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
<span style={{"fontWeight": "700", "color": "rgb(31, 107, 79)"}}>
<span className="sc-interp">
↓ 6%
</span>
</span>
{" "}
<span className="sc-interp">
faster than before
</span>
</div>
</article>
<article style={{"padding": "18px 20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<div style={{"fontSize": "14px", "fontWeight": "600", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
Requests stopped
</span>
</div>
<div style={{"marginTop": "6px", "font": "700 30px / 1.1 \"DM Sans\", system-ui, sans-serif", "letterSpacing": "-0.02em", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
61
</span>
</div>
<div style={{"marginTop": "6px", "fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
<span style={{"fontWeight": "700", "color": "rgb(31, 107, 79)"}}>
<span className="sc-interp">
0
</span>
</span>
{" "}
<span className="sc-interp">
reached a real service
</span>
</div>
</article>
</section>
<div style={{"marginTop": "14px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(480px, 100%), 1fr))", "gap": "14px"}}>
<section aria-labelledby="an-pass" style={{"padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)", "minWidth": "0px"}}>
<h2 id="an-pass" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
Pass rate
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Share of runs that passed,{" "}
<span className="sc-interp">
last 30 days
</span>
</p>
<div style={{"marginTop": "16px", "display": "grid", "gridTemplateColumns": "40px minmax(0px, 1fr) 56px", "gap": "6px"}}>
<div aria-hidden="true" style={{"position": "relative", "height": "180px", "font": "500 11.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)", "textAlign": "right"}}>
<span style={{"position": "absolute", "right": "0px", "top": "-8px"}}>
98%
</span>
<span style={{"position": "absolute", "right": "0px", "top": "82px"}}>
95%
</span>
<span style={{"position": "absolute", "right": "0px", "top": "172px"}}>
92%
</span>
</div>
<div style={{"position": "relative", "height": "180px", "minWidth": "0px"}}>
<div aria-hidden="true" style={{"position": "absolute", "inset": "0px", "display": "flex", "flexDirection": "column", "justifyContent": "space-between"}}>
<span style={{"height": "1px", "background": "rgb(238, 242, 238)"}}>
</span>
<span style={{"height": "1px", "background": "rgb(238, 242, 238)"}}>
</span>
<span style={{"height": "1px", "background": "rgb(205, 214, 206)"}}>
</span>
</div>
<svg viewBox="0 0 100 180" preserveAspectRatio="none" aria-hidden="true" style={{"position": "absolute", "inset": "0px", "width": "100%", "height": "100%", "overflow": "visible"}}>
<path d="M5.00 87.0 L15.00 66.0 L25.00 48.0 L35.00 84.0 L45.00 33.0 L55.00 21.0 L65.00 57.0 L75.00 36.0 L85.00 12.0 L95.00 18.0 L95.00 180 L5.00 180 Z" fill="rgba(35,132,90,.10)" stroke="none">
</path>
<path data-anim="1" d="M5.00 87.0 L15.00 66.0 L25.00 48.0 L35.00 84.0 L45.00 33.0 L55.00 21.0 L65.00 57.0 L75.00 36.0 L85.00 12.0 L95.00 18.0" pathLength="100" fill="none" stroke="#23845A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={{"strokeDasharray": "100", "animation": "1s ease-out 0s 1 normal both running c-draw"}}>
</path>
</svg>
<div style={{"position": "absolute", "inset": "0px", "display": "grid", "gridTemplateColumns": "repeat(10, minmax(0px, 1fr))", "margin": "0px"}}>
<button type="button" className="c-hit" aria-label="Oct 8: 95.1% passed" style={{"position": "relative", "height": "180px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default"}}>
<span className="c-hair" style={{"position": "absolute", "left": "50%", "top": "0px", "bottom": "0px", "width": "1px", "background": "rgb(157, 176, 165)"}}>
</span>
<span className="c-dot" style={{"position": "absolute", "left": "50%", "top": "87px", "width": "9px", "height": "9px", "borderRadius": "50%", "background": "rgb(35, 132, 90)", "boxShadow": "rgb(255, 255, 255) 0px 0px 0px 2px", "transform": "translate(-50%, -50%)", "transition": "transform 0.12s"}}>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "top": "25px", "zIndex": "3", "transform": "translateX(-50%)", "minWidth": "110px", "padding": "8px 10px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 26px", "textAlign": "left", "fontSize": "12.5px", "lineHeight": "1.45", "color": "rgb(21, 33, 28)", "whiteSpace": "nowrap"}}>
<span style={{"display": "block", "fontWeight": "700", "fontSize": "14px"}}>
<span className="sc-interp">
95.1
</span>
%
</span>
<span style={{"display": "block", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
Oct 8
</span>
</span>
</span>
</button>
<button type="button" className="c-hit" aria-label="Oct 11: 95.8% passed" style={{"position": "relative", "height": "180px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default"}}>
<span className="c-hair" style={{"position": "absolute", "left": "50%", "top": "0px", "bottom": "0px", "width": "1px", "background": "rgb(157, 176, 165)"}}>
</span>
<span className="c-dot" style={{"position": "absolute", "left": "50%", "top": "66px", "width": "9px", "height": "9px", "borderRadius": "50%", "background": "rgb(35, 132, 90)", "boxShadow": "rgb(255, 255, 255) 0px 0px 0px 2px", "transform": "translate(-50%, -50%)", "transition": "transform 0.12s"}}>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "top": "4px", "zIndex": "3", "transform": "translateX(-50%)", "minWidth": "110px", "padding": "8px 10px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 26px", "textAlign": "left", "fontSize": "12.5px", "lineHeight": "1.45", "color": "rgb(21, 33, 28)", "whiteSpace": "nowrap"}}>
<span style={{"display": "block", "fontWeight": "700", "fontSize": "14px"}}>
<span className="sc-interp">
95.8
</span>
%
</span>
<span style={{"display": "block", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
Oct 11
</span>
</span>
</span>
</button>
<button type="button" className="c-hit" aria-label="Oct 14: 96.4% passed" style={{"position": "relative", "height": "180px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default"}}>
<span className="c-hair" style={{"position": "absolute", "left": "50%", "top": "0px", "bottom": "0px", "width": "1px", "background": "rgb(157, 176, 165)"}}>
</span>
<span className="c-dot" style={{"position": "absolute", "left": "50%", "top": "48px", "width": "9px", "height": "9px", "borderRadius": "50%", "background": "rgb(35, 132, 90)", "boxShadow": "rgb(255, 255, 255) 0px 0px 0px 2px", "transform": "translate(-50%, -50%)", "transition": "transform 0.12s"}}>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "top": "0px", "zIndex": "3", "transform": "translateX(-50%)", "minWidth": "110px", "padding": "8px 10px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 26px", "textAlign": "left", "fontSize": "12.5px", "lineHeight": "1.45", "color": "rgb(21, 33, 28)", "whiteSpace": "nowrap"}}>
<span style={{"display": "block", "fontWeight": "700", "fontSize": "14px"}}>
<span className="sc-interp">
96.4
</span>
%
</span>
<span style={{"display": "block", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
Oct 14
</span>
</span>
</span>
</button>
<button type="button" className="c-hit" aria-label="Oct 17: 95.2% passed" style={{"position": "relative", "height": "180px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default"}}>
<span className="c-hair" style={{"position": "absolute", "left": "50%", "top": "0px", "bottom": "0px", "width": "1px", "background": "rgb(157, 176, 165)"}}>
</span>
<span className="c-dot" style={{"position": "absolute", "left": "50%", "top": "84px", "width": "9px", "height": "9px", "borderRadius": "50%", "background": "rgb(35, 132, 90)", "boxShadow": "rgb(255, 255, 255) 0px 0px 0px 2px", "transform": "translate(-50%, -50%)", "transition": "transform 0.12s"}}>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "top": "22px", "zIndex": "3", "transform": "translateX(-50%)", "minWidth": "110px", "padding": "8px 10px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 26px", "textAlign": "left", "fontSize": "12.5px", "lineHeight": "1.45", "color": "rgb(21, 33, 28)", "whiteSpace": "nowrap"}}>
<span style={{"display": "block", "fontWeight": "700", "fontSize": "14px"}}>
<span className="sc-interp">
95.2
</span>
%
</span>
<span style={{"display": "block", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
Oct 17
</span>
</span>
</span>
</button>
<button type="button" className="c-hit" aria-label="Oct 20: 96.9% passed" style={{"position": "relative", "height": "180px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default"}}>
<span className="c-hair" style={{"position": "absolute", "left": "50%", "top": "0px", "bottom": "0px", "width": "1px", "background": "rgb(157, 176, 165)"}}>
</span>
<span className="c-dot" style={{"position": "absolute", "left": "50%", "top": "33px", "width": "9px", "height": "9px", "borderRadius": "50%", "background": "rgb(35, 132, 90)", "boxShadow": "rgb(255, 255, 255) 0px 0px 0px 2px", "transform": "translate(-50%, -50%)", "transition": "transform 0.12s"}}>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "top": "0px", "zIndex": "3", "transform": "translateX(-50%)", "minWidth": "110px", "padding": "8px 10px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 26px", "textAlign": "left", "fontSize": "12.5px", "lineHeight": "1.45", "color": "rgb(21, 33, 28)", "whiteSpace": "nowrap"}}>
<span style={{"display": "block", "fontWeight": "700", "fontSize": "14px"}}>
<span className="sc-interp">
96.9
</span>
%
</span>
<span style={{"display": "block", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
Oct 20
</span>
</span>
</span>
</button>
<button type="button" className="c-hit" aria-label="Oct 23: 97.3% passed" style={{"position": "relative", "height": "180px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default"}}>
<span className="c-hair" style={{"position": "absolute", "left": "50%", "top": "0px", "bottom": "0px", "width": "1px", "background": "rgb(157, 176, 165)"}}>
</span>
<span className="c-dot" style={{"position": "absolute", "left": "50%", "top": "21px", "width": "9px", "height": "9px", "borderRadius": "50%", "background": "rgb(35, 132, 90)", "boxShadow": "rgb(255, 255, 255) 0px 0px 0px 2px", "transform": "translate(-50%, -50%)", "transition": "transform 0.12s"}}>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "top": "0px", "zIndex": "3", "transform": "translateX(-50%)", "minWidth": "110px", "padding": "8px 10px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 26px", "textAlign": "left", "fontSize": "12.5px", "lineHeight": "1.45", "color": "rgb(21, 33, 28)", "whiteSpace": "nowrap"}}>
<span style={{"display": "block", "fontWeight": "700", "fontSize": "14px"}}>
<span className="sc-interp">
97.3
</span>
%
</span>
<span style={{"display": "block", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
Oct 23
</span>
</span>
</span>
</button>
<button type="button" className="c-hit" aria-label="Oct 26: 96.1% passed" style={{"position": "relative", "height": "180px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default"}}>
<span className="c-hair" style={{"position": "absolute", "left": "50%", "top": "0px", "bottom": "0px", "width": "1px", "background": "rgb(157, 176, 165)"}}>
</span>
<span className="c-dot" style={{"position": "absolute", "left": "50%", "top": "57px", "width": "9px", "height": "9px", "borderRadius": "50%", "background": "rgb(35, 132, 90)", "boxShadow": "rgb(255, 255, 255) 0px 0px 0px 2px", "transform": "translate(-50%, -50%)", "transition": "transform 0.12s"}}>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "top": "0px", "zIndex": "3", "transform": "translateX(-50%)", "minWidth": "110px", "padding": "8px 10px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 26px", "textAlign": "left", "fontSize": "12.5px", "lineHeight": "1.45", "color": "rgb(21, 33, 28)", "whiteSpace": "nowrap"}}>
<span style={{"display": "block", "fontWeight": "700", "fontSize": "14px"}}>
<span className="sc-interp">
96.1
</span>
%
</span>
<span style={{"display": "block", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
Oct 26
</span>
</span>
</span>
</button>
<button type="button" className="c-hit" aria-label="Oct 29: 96.8% passed" style={{"position": "relative", "height": "180px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default"}}>
<span className="c-hair" style={{"position": "absolute", "left": "50%", "top": "0px", "bottom": "0px", "width": "1px", "background": "rgb(157, 176, 165)"}}>
</span>
<span className="c-dot" style={{"position": "absolute", "left": "50%", "top": "36px", "width": "9px", "height": "9px", "borderRadius": "50%", "background": "rgb(35, 132, 90)", "boxShadow": "rgb(255, 255, 255) 0px 0px 0px 2px", "transform": "translate(-50%, -50%)", "transition": "transform 0.12s"}}>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "top": "0px", "zIndex": "3", "transform": "translateX(-50%)", "minWidth": "110px", "padding": "8px 10px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 26px", "textAlign": "left", "fontSize": "12.5px", "lineHeight": "1.45", "color": "rgb(21, 33, 28)", "whiteSpace": "nowrap"}}>
<span style={{"display": "block", "fontWeight": "700", "fontSize": "14px"}}>
<span className="sc-interp">
96.8
</span>
%
</span>
<span style={{"display": "block", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
Oct 29
</span>
</span>
</span>
</button>
<button type="button" className="c-hit" aria-label="Nov 1: 97.6% passed" style={{"position": "relative", "height": "180px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default"}}>
<span className="c-hair" style={{"position": "absolute", "left": "50%", "top": "0px", "bottom": "0px", "width": "1px", "background": "rgb(157, 176, 165)"}}>
</span>
<span className="c-dot" style={{"position": "absolute", "left": "50%", "top": "12px", "width": "9px", "height": "9px", "borderRadius": "50%", "background": "rgb(35, 132, 90)", "boxShadow": "rgb(255, 255, 255) 0px 0px 0px 2px", "transform": "translate(-50%, -50%)", "transition": "transform 0.12s"}}>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "top": "0px", "zIndex": "3", "transform": "translateX(-50%)", "minWidth": "110px", "padding": "8px 10px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 26px", "textAlign": "left", "fontSize": "12.5px", "lineHeight": "1.45", "color": "rgb(21, 33, 28)", "whiteSpace": "nowrap"}}>
<span style={{"display": "block", "fontWeight": "700", "fontSize": "14px"}}>
<span className="sc-interp">
97.6
</span>
%
</span>
<span style={{"display": "block", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
Nov 1
</span>
</span>
</span>
</button>
<button type="button" className="c-hit" aria-label="Nov 6: 97.4% passed" style={{"position": "relative", "height": "180px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default"}}>
<span className="c-hair" style={{"position": "absolute", "left": "50%", "top": "0px", "bottom": "0px", "width": "1px", "background": "rgb(157, 176, 165)"}}>
</span>
<span className="c-dot" style={{"position": "absolute", "left": "50%", "top": "18px", "width": "9px", "height": "9px", "borderRadius": "50%", "background": "rgb(35, 132, 90)", "boxShadow": "rgb(255, 255, 255) 0px 0px 0px 2px", "transform": "translate(-50%, -50%)", "transition": "transform 0.12s"}}>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "top": "0px", "zIndex": "3", "transform": "translateX(-50%)", "minWidth": "110px", "padding": "8px 10px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 26px", "textAlign": "left", "fontSize": "12.5px", "lineHeight": "1.45", "color": "rgb(21, 33, 28)", "whiteSpace": "nowrap"}}>
<span style={{"display": "block", "fontWeight": "700", "fontSize": "14px"}}>
<span className="sc-interp">
97.4
</span>
%
</span>
<span style={{"display": "block", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
Nov 6
</span>
</span>
</span>
</button>
</div>
</div>
<div aria-hidden="true" style={{"position": "relative", "height": "180px"}}>
<span style={{"position": "absolute", "left": "4px", "top": "18px", "transform": "translateY(-50%)", "fontSize": "13px", "fontWeight": "700", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
97.4
</span>
%
</span>
</div>
</div>
<div aria-hidden="true" style={{"margin": "8px 56px 0px 46px", "display": "flex", "justifyContent": "space-between", "fontSize": "12px", "color": "rgb(90, 105, 97)"}}>
<span>
<span className="sc-interp">
Oct 8
</span>
</span>
<span>
<span className="sc-interp">
Oct 23
</span>
</span>
<span>
<span className="sc-interp">
Nov 6
</span>
</span>
</div>
</section>
<section aria-labelledby="an-dur" style={{"padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)", "minWidth": "0px"}}>
<h2 id="an-dur" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
How long runs take
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Number of runs by duration,{" "}
<span className="sc-interp">
last 30 days
</span>
</p>
<div style={{"marginTop": "16px", "position": "relative", "height": "180px", "display": "grid", "gridTemplateColumns": "repeat(7, minmax(0px, 1fr))", "alignItems": "end", "borderBottom": "1px solid rgb(205, 214, 206)"}}>
<button type="button" className="c-bar" aria-label="<10s: 38 runs" style={{"position": "relative", "height": "180px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default", "display": "flex", "flexDirection": "column", "justifyContent": "flex-end", "alignItems": "center"}}>
<span className="c-fill" data-anim="1" style={{"display": "block", "width": "24px", "height": "18px", "borderRadius": "4px 4px 0px 0px", "background": "rgb(35, 132, 90)", "transformOrigin": "center bottom", "animation": "0.6s cubic-bezier(0.2, 0.7, 0.2, 1) 0s 1 normal both running c-grow"}}>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "bottom": "46px", "zIndex": "3", "transform": "translateX(-50%)", "padding": "8px 10px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 26px", "fontSize": "12.5px", "whiteSpace": "nowrap", "color": "rgb(21, 33, 28)"}}>
<strong style={{"fontSize": "14px"}}>
<span className="sc-interp">
38
</span>
</strong>
{" "}runs ·{" "}
<span className="sc-interp">
{"<"}
10s
</span>
</span>
</button>
<button type="button" className="c-bar" aria-label="10\u201320s: 76 runs" style={{"position": "relative", "height": "180px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default", "display": "flex", "flexDirection": "column", "justifyContent": "flex-end", "alignItems": "center"}}>
<span className="c-fill" data-anim="1" style={{"display": "block", "width": "24px", "height": "36px", "borderRadius": "4px 4px 0px 0px", "background": "rgb(35, 132, 90)", "transformOrigin": "center bottom", "animation": "0.6s cubic-bezier(0.2, 0.7, 0.2, 1) 0.04s 1 normal both running c-grow"}}>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "bottom": "64px", "zIndex": "3", "transform": "translateX(-50%)", "padding": "8px 10px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 26px", "fontSize": "12.5px", "whiteSpace": "nowrap", "color": "rgb(21, 33, 28)"}}>
<strong style={{"fontSize": "14px"}}>
<span className="sc-interp">
76
</span>
</strong>
{" "}runs ·{" "}
<span className="sc-interp">
10–20s
</span>
</span>
</button>
<button type="button" className="c-bar" aria-label="20\u201330s: 172 runs" style={{"position": "relative", "height": "180px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default", "display": "flex", "flexDirection": "column", "justifyContent": "flex-end", "alignItems": "center"}}>
<span className="c-fill" data-anim="1" style={{"display": "block", "width": "24px", "height": "83px", "borderRadius": "4px 4px 0px 0px", "background": "rgb(35, 132, 90)", "transformOrigin": "center bottom", "animation": "0.6s cubic-bezier(0.2, 0.7, 0.2, 1) 0.08s 1 normal both running c-grow"}}>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "bottom": "111px", "zIndex": "3", "transform": "translateX(-50%)", "padding": "8px 10px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 26px", "fontSize": "12.5px", "whiteSpace": "nowrap", "color": "rgb(21, 33, 28)"}}>
<strong style={{"fontSize": "14px"}}>
<span className="sc-interp">
172
</span>
</strong>
{" "}runs ·{" "}
<span className="sc-interp">
20–30s
</span>
</span>
</button>
<button type="button" className="c-bar" aria-label="30\u201340s: 265 runs" style={{"position": "relative", "height": "180px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default", "display": "flex", "flexDirection": "column", "justifyContent": "flex-end", "alignItems": "center"}}>
<span className="c-fill" data-anim="1" style={{"display": "block", "width": "24px", "height": "128px", "borderRadius": "4px 4px 0px 0px", "background": "rgb(35, 132, 90)", "transformOrigin": "center bottom", "animation": "0.6s cubic-bezier(0.2, 0.7, 0.2, 1) 0.12s 1 normal both running c-grow"}}>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "bottom": "156px", "zIndex": "3", "transform": "translateX(-50%)", "padding": "8px 10px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 26px", "fontSize": "12.5px", "whiteSpace": "nowrap", "color": "rgb(21, 33, 28)"}}>
<strong style={{"fontSize": "14px"}}>
<span className="sc-interp">
265
</span>
</strong>
{" "}runs ·{" "}
<span className="sc-interp">
30–40s
</span>
</span>
</button>
<button type="button" className="c-bar" aria-label="40\u201350s: 311 runs" style={{"position": "relative", "height": "180px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default", "display": "flex", "flexDirection": "column", "justifyContent": "flex-end", "alignItems": "center"}}>
<span style={{"marginBottom": "4px", "fontSize": "12.5px", "fontWeight": "700", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
311
</span>
</span>
<span className="c-fill" data-anim="1" style={{"display": "block", "width": "24px", "height": "150px", "borderRadius": "4px 4px 0px 0px", "background": "rgb(35, 132, 90)", "transformOrigin": "center bottom", "animation": "0.6s cubic-bezier(0.2, 0.7, 0.2, 1) 0.16s 1 normal both running c-grow"}}>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "bottom": "178px", "zIndex": "3", "transform": "translateX(-50%)", "padding": "8px 10px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 26px", "fontSize": "12.5px", "whiteSpace": "nowrap", "color": "rgb(21, 33, 28)"}}>
<strong style={{"fontSize": "14px"}}>
<span className="sc-interp">
311
</span>
</strong>
{" "}runs ·{" "}
<span className="sc-interp">
40–50s
</span>
</span>
</button>
<button type="button" className="c-bar" aria-label="50\u201360s: 92 runs" style={{"position": "relative", "height": "180px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default", "display": "flex", "flexDirection": "column", "justifyContent": "flex-end", "alignItems": "center"}}>
<span className="c-fill" data-anim="1" style={{"display": "block", "width": "24px", "height": "45px", "borderRadius": "4px 4px 0px 0px", "background": "rgb(35, 132, 90)", "transformOrigin": "center bottom", "animation": "0.6s cubic-bezier(0.2, 0.7, 0.2, 1) 0.2s 1 normal both running c-grow"}}>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "bottom": "73px", "zIndex": "3", "transform": "translateX(-50%)", "padding": "8px 10px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 26px", "fontSize": "12.5px", "whiteSpace": "nowrap", "color": "rgb(21, 33, 28)"}}>
<strong style={{"fontSize": "14px"}}>
<span className="sc-interp">
92
</span>
</strong>
{" "}runs ·{" "}
<span className="sc-interp">
50–60s
</span>
</span>
</button>
<button type="button" className="c-bar" aria-label=">60s: 25 runs" style={{"position": "relative", "height": "180px", "padding": "0px", "border": "0px", "background": "transparent", "cursor": "default", "display": "flex", "flexDirection": "column", "justifyContent": "flex-end", "alignItems": "center"}}>
<span className="c-fill" data-anim="1" style={{"display": "block", "width": "24px", "height": "12px", "borderRadius": "4px 4px 0px 0px", "background": "rgb(35, 132, 90)", "transformOrigin": "center bottom", "animation": "0.6s cubic-bezier(0.2, 0.7, 0.2, 1) 0.24s 1 normal both running c-grow"}}>
</span>
<span className="c-tip" style={{"position": "absolute", "left": "50%", "bottom": "40px", "zIndex": "3", "transform": "translateX(-50%)", "padding": "8px 10px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(21, 33, 28, 0.14) 0px 10px 26px", "fontSize": "12.5px", "whiteSpace": "nowrap", "color": "rgb(21, 33, 28)"}}>
<strong style={{"fontSize": "14px"}}>
<span className="sc-interp">
25
</span>
</strong>
{" "}runs ·{" "}
<span className="sc-interp">
{">"}
60s
</span>
</span>
</button>
</div>
<div aria-hidden="true" style={{"marginTop": "8px", "display": "grid", "gridTemplateColumns": "repeat(7, minmax(0px, 1fr))", "fontSize": "12px", "color": "rgb(90, 105, 97)", "textAlign": "center"}}>
<span>
<span className="sc-interp">
{"<"}
10s
</span>
</span>
<span>
<span className="sc-interp">
10–20s
</span>
</span>
<span>
<span className="sc-interp">
20–30s
</span>
</span>
<span>
<span className="sc-interp">
30–40s
</span>
</span>
<span>
<span className="sc-interp">
40–50s
</span>
</span>
<span>
<span className="sc-interp">
50–60s
</span>
</span>
<span>
<span className="sc-interp">
{">"}
60s
</span>
</span>
</div>
<p style={{"margin": "12px 0px 0px", "fontSize": "13.5px", "color": "rgb(70, 84, 76)"}}>
Median{" "}
<strong style={{"color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
41s
</span>
</strong>
{" "}· runs that restore a checkpoint skip their setup and land in the shortest buckets.
</p>
</section>
<section aria-labelledby="an-stop" style={{"padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)", "minWidth": "0px"}}>
<div style={{"display": "flex", "alignItems": "flex-start", "justifyContent": "space-between", "gap": "12px"}}>
<div>
<h2 id="an-stop" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
What the safety door stopped
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Stopped requests by reason,{" "}
<span className="sc-interp">
last 30 days
</span>
</p>
</div>
<a href="#policy" data-nav="policy" style={{"fontSize": "13.5px", "fontWeight": "600", "textDecoration": "none", "whiteSpace": "nowrap"}}>
Open policy
</a>
</div>
<div style={{"marginTop": "16px", "display": "grid", "gap": "12px"}}>
<div style={{"display": "grid", "gridTemplateColumns": "minmax(150px, 1fr) minmax(0px, 1.4fr)", "gap": "12px", "alignItems": "center"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "font": "600 13px \"JetBrains Mono\", monospace", "color": "rgb(21, 33, 28)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
POST */refunds*
</span>
</span>
<span style={{"display": "block", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
rule block-destructive-refunds
</span>
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<span data-anim="1" style={{"display": "block", "height": "20px", "width": "88%", "borderRadius": "0px 4px 4px 0px", "background": "rgb(217, 130, 43)", "transformOrigin": "left center", "animation": "0.6s cubic-bezier(0.2, 0.7, 0.2, 1) 0s 1 normal both running c-growx"}}>
</span>
<span style={{"fontSize": "13px", "fontWeight": "700", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
38
</span>
</span>
</span>
</div>
<div style={{"display": "grid", "gridTemplateColumns": "minmax(150px, 1fr) minmax(0px, 1.4fr)", "gap": "12px", "alignItems": "center"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "font": "600 13px \"JetBrains Mono\", monospace", "color": "rgb(21, 33, 28)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
POST /admin/settings
</span>
</span>
<span style={{"display": "block", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
rule block-admin-mutations
</span>
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<span data-anim="1" style={{"display": "block", "height": "20px", "width": "49%", "borderRadius": "0px 4px 4px 0px", "background": "rgb(217, 130, 43)", "transformOrigin": "left center", "animation": "0.6s cubic-bezier(0.2, 0.7, 0.2, 1) 0s 1 normal both running c-growx"}}>
</span>
<span style={{"fontSize": "13px", "fontWeight": "700", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
21
</span>
</span>
</span>
</div>
<div style={{"display": "grid", "gridTemplateColumns": "minmax(150px, 1fr) minmax(0px, 1.4fr)", "gap": "12px", "alignItems": "center"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "font": "600 13px \"JetBrains Mono\", monospace", "color": "rgb(21, 33, 28)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
POST webhook.site
</span>
</span>
<span style={{"display": "block", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
blocked host
</span>
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<span data-anim="1" style={{"display": "block", "height": "20px", "width": "29%", "borderRadius": "0px 4px 4px 0px", "background": "rgb(217, 130, 43)", "transformOrigin": "left center", "animation": "0.6s cubic-bezier(0.2, 0.7, 0.2, 1) 0s 1 normal both running c-growx"}}>
</span>
<span style={{"fontSize": "13px", "fontWeight": "700", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
13
</span>
</span>
</span>
</div>
<div style={{"display": "grid", "gridTemplateColumns": "minmax(150px, 1fr) minmax(0px, 1.4fr)", "gap": "12px", "alignItems": "center"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "font": "600 13px \"JetBrains Mono\", monospace", "color": "rgb(21, 33, 28)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
GET cdn.segment.io
</span>
</span>
<span style={{"display": "block", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
not on the allowed list
</span>
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<span data-anim="1" style={{"display": "block", "height": "20px", "width": "20%", "borderRadius": "0px 4px 4px 0px", "background": "rgb(217, 130, 43)", "transformOrigin": "left center", "animation": "0.6s cubic-bezier(0.2, 0.7, 0.2, 1) 0s 1 normal both running c-growx"}}>
</span>
<span style={{"fontSize": "13px", "fontWeight": "700", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
8
</span>
</span>
</span>
</div>
<div style={{"display": "grid", "gridTemplateColumns": "minmax(150px, 1fr) minmax(0px, 1.4fr)", "gap": "12px", "alignItems": "center"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "font": "600 13px \"JetBrains Mono\", monospace", "color": "rgb(21, 33, 28)", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
POST */wipe*
</span>
</span>
<span style={{"display": "block", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
secret blockedPaths
</span>
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<span data-anim="1" style={{"display": "block", "height": "20px", "width": "10%", "borderRadius": "0px 4px 4px 0px", "background": "rgb(217, 130, 43)", "transformOrigin": "left center", "animation": "0.6s cubic-bezier(0.2, 0.7, 0.2, 1) 0s 1 normal both running c-growx"}}>
</span>
<span style={{"fontSize": "13px", "fontWeight": "700", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
4
</span>
</span>
</span>
</div>
</div>
</section>
<section aria-labelledby="an-heal" style={{"padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)", "minWidth": "0px"}}>
<div style={{"display": "flex", "alignItems": "flex-start", "justifyContent": "space-between", "gap": "12px"}}>
<div>
<h2 id="an-heal" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
How broken locators were found again
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Healed steps by matching method,{" "}
<span className="sc-interp">
last 30 days
</span>
</p>
</div>
<a href="#healing" data-nav="healing" style={{"fontSize": "13.5px", "fontWeight": "600", "textDecoration": "none", "whiteSpace": "nowrap"}}>
Review heals
</a>
</div>
<div style={{"marginTop": "16px", "display": "grid", "gap": "12px"}}>
<div style={{"display": "grid", "gridTemplateColumns": "minmax(150px, 1fr) minmax(0px, 1.4fr)", "gap": "12px", "alignItems": "center"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontSize": "14px", "fontWeight": "600", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
Same test id
</span>
</span>
<span style={{"display": "block", "font": "500 12px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
exact_testid
</span>
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<span data-anim="1" style={{"display": "block", "height": "20px", "width": "88%", "borderRadius": "0px 4px 4px 0px", "background": "rgb(35, 132, 90)", "transformOrigin": "left center", "animation": "0.6s cubic-bezier(0.2, 0.7, 0.2, 1) 0s 1 normal both running c-growx"}}>
</span>
<span style={{"fontSize": "13px", "fontWeight": "700", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
38
</span>
</span>
</span>
</div>
<div style={{"display": "grid", "gridTemplateColumns": "minmax(150px, 1fr) minmax(0px, 1.4fr)", "gap": "12px", "alignItems": "center"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontSize": "14px", "fontWeight": "600", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
Accessible name
</span>
</span>
<span style={{"display": "block", "font": "500 12px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
aria_fuzzy
</span>
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<span data-anim="1" style={{"display": "block", "height": "20px", "width": "68%", "borderRadius": "0px 4px 4px 0px", "background": "rgb(35, 132, 90)", "transformOrigin": "left center", "animation": "0.6s cubic-bezier(0.2, 0.7, 0.2, 1) 0s 1 normal both running c-growx"}}>
</span>
<span style={{"fontSize": "13px", "fontWeight": "700", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
29
</span>
</span>
</span>
</div>
<div style={{"display": "grid", "gridTemplateColumns": "minmax(150px, 1fr) minmax(0px, 1.4fr)", "gap": "12px", "alignItems": "center"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontSize": "14px", "fontWeight": "600", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
Visible text
</span>
</span>
<span style={{"display": "block", "font": "500 12px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
semantic_text
</span>
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<span data-anim="1" style={{"display": "block", "height": "20px", "width": "39%", "borderRadius": "0px 4px 4px 0px", "background": "rgb(35, 132, 90)", "transformOrigin": "left center", "animation": "0.6s cubic-bezier(0.2, 0.7, 0.2, 1) 0s 1 normal both running c-growx"}}>
</span>
<span style={{"fontSize": "13px", "fontWeight": "700", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
17
</span>
</span>
</span>
</div>
<div style={{"display": "grid", "gridTemplateColumns": "minmax(150px, 1fr) minmax(0px, 1.4fr)", "gap": "12px", "alignItems": "center"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontSize": "14px", "fontWeight": "600", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
Page structure
</span>
</span>
<span style={{"display": "block", "font": "500 12px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
structural_xpath
</span>
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<span data-anim="1" style={{"display": "block", "height": "20px", "width": "20%", "borderRadius": "0px 4px 4px 0px", "background": "rgb(35, 132, 90)", "transformOrigin": "left center", "animation": "0.6s cubic-bezier(0.2, 0.7, 0.2, 1) 0s 1 normal both running c-growx"}}>
</span>
<span style={{"fontSize": "13px", "fontWeight": "700", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
8
</span>
</span>
</span>
</div>
<div style={{"display": "grid", "gridTemplateColumns": "minmax(150px, 1fr) minmax(0px, 1.4fr)", "gap": "12px", "alignItems": "center"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontSize": "14px", "fontWeight": "600", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
Similarity score
</span>
</span>
<span style={{"display": "block", "font": "500 12px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
ml_heuristic
</span>
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<span data-anim="1" style={{"display": "block", "height": "20px", "width": "10%", "borderRadius": "0px 4px 4px 0px", "background": "rgb(35, 132, 90)", "transformOrigin": "left center", "animation": "0.6s cubic-bezier(0.2, 0.7, 0.2, 1) 0s 1 normal both running c-growx"}}>
</span>
<span style={{"fontSize": "13px", "fontWeight": "700", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
4
</span>
</span>
</span>
</div>
</div>
<p style={{"margin": "14px 0px 0px", "fontSize": "13.5px", "color": "rgb(70, 84, 76)"}}>
Heals below the 80% confidence threshold are never applied — they fail the step and appear in review.
</p>
</section>
</div>
<section aria-labelledby="an-flaky" style={{"marginTop": "14px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)", "overflow": "hidden"}}>
<div style={{"padding": "18px 20px"}}>
<h2 id="an-flaky" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
Flakiest tests
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Tests that failed and then passed on the same commit
</p>
</div>
<div style={{"overflowX": "auto"}}>
<table style={{"width": "100%", "minWidth": "640px", "borderCollapse": "collapse", "fontSize": "14px"}}>
<thead>
<tr style={{"background": "rgb(247, 248, 245)"}}>
<th scope="col" style={{"padding": "10px 20px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Test
</th>
<th scope="col" style={{"padding": "10px 20px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "right", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Runs
</th>
<th scope="col" style={{"padding": "10px 20px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)", "width": "34%"}}>
Flaky rate
</th>
</tr>
</thead>
<tbody>
<tr>
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "fontWeight": "600"}}>
Checkout › applies saved payment method
</td>
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "textAlign": "right", "fontVariantNumeric": "tabular-nums", "color": "rgb(70, 84, 76)"}}>
52
</td>
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<span style={{"display": "flex", "alignItems": "center", "gap": "10px"}}>
<span style={{"flex": "1 1 0%", "height": "8px", "borderRadius": "4px", "background": "rgb(238, 242, 238)", "overflow": "hidden"}}>
<span style={{"display": "block", "width": "95%", "height": "100%", "borderRadius": "4px", "background": "rgb(217, 130, 43)"}}>
</span>
</span>
<span style={{"width": "44px", "fontWeight": "700", "fontVariantNumeric": "tabular-nums"}}>
3.8%
</span>
</span>
</td>
</tr>
<tr>
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "fontWeight": "600"}}>
Account › refreshes session after login
</td>
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "textAlign": "right", "fontVariantNumeric": "tabular-nums", "color": "rgb(70, 84, 76)"}}>
47
</td>
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<span style={{"display": "flex", "alignItems": "center", "gap": "10px"}}>
<span style={{"flex": "1 1 0%", "height": "8px", "borderRadius": "4px", "background": "rgb(238, 242, 238)", "overflow": "hidden"}}>
<span style={{"display": "block", "width": "53%", "height": "100%", "borderRadius": "4px", "background": "rgb(217, 130, 43)"}}>
</span>
</span>
<span style={{"width": "44px", "fontWeight": "700", "fontVariantNumeric": "tabular-nums"}}>
2.1%
</span>
</span>
</td>
</tr>
<tr>
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "fontWeight": "600"}}>
Cart › restores warm checkpoint
</td>
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "textAlign": "right", "fontVariantNumeric": "tabular-nums", "color": "rgb(70, 84, 76)"}}>
61
</td>
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<span style={{"display": "flex", "alignItems": "center", "gap": "10px"}}>
<span style={{"flex": "1 1 0%", "height": "8px", "borderRadius": "4px", "background": "rgb(238, 242, 238)", "overflow": "hidden"}}>
<span style={{"display": "block", "width": "40%", "height": "100%", "borderRadius": "4px", "background": "rgb(217, 130, 43)"}}>
</span>
</span>
<span style={{"width": "44px", "fontWeight": "700", "fontVariantNumeric": "tabular-nums"}}>
1.6%
</span>
</span>
</td>
</tr>
<tr>
<td style={{"padding": "12px 20px", "fontWeight": "600"}}>
Checkout › pays with a new card
</td>
<td style={{"padding": "12px 20px", "textAlign": "right", "fontVariantNumeric": "tabular-nums", "color": "rgb(70, 84, 76)"}}>
58
</td>
<td style={{"padding": "12px 20px"}}>
<span style={{"display": "flex", "alignItems": "center", "gap": "10px"}}>
<span style={{"flex": "1 1 0%", "height": "8px", "borderRadius": "4px", "background": "rgb(238, 242, 238)", "overflow": "hidden"}}>
<span style={{"display": "block", "width": "30%", "height": "100%", "borderRadius": "4px", "background": "rgb(217, 130, 43)"}}>
</span>
</span>
<span style={{"width": "44px", "fontWeight": "700", "fontVariantNumeric": "tabular-nums"}}>
1.2%
</span>
</span>
</td>
</tr>
</tbody>
</table>
</div>
</section>
</main>
    </>
  );
}
