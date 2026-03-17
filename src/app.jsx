import { useState, useRef, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const LESSONS = [
  { id:"stocks", emoji:"📈", title:"What is a Stock?", color:"#4f46e5", summary:"Owning a piece of a real company",
    content:`When you buy a stock, you're buying a tiny piece of ownership in a company. If Apple has 1,000,000 shares and you own 1 share, you own 1/1,000,000 of Apple!\n\n💡 Why companies sell stock: They need money to grow — build new products, hire people, expand.\n\n📊 How you make money:\n• Stock price goes UP → sell for profit\n• Dividends → some companies pay you just for owning their stock\n\n⚠️ Risk: Prices can also go DOWN if the company does poorly.`,
    example:"You bought 1 share of Nike for $90. A year later it's worth $110. You made $20 profit — a 22% gain! 🎉" },
  { id:"bonds", emoji:"🏦", title:"What is a Bond?", color:"#059669", summary:"Lending money to earn interest",
    content:`A bond is like being the bank! You lend money to a company or government, and they promise to pay you back with interest.\n\n💡 Key terms:\n• Principal: The amount you lend (e.g., $1,000)\n• Interest rate (coupon): What they pay you annually (e.g., 5%)\n• Maturity date: When they pay back the full amount\n\n✅ Bonds are generally SAFER than stocks but earn less.`,
    example:"You buy a $1,000 US Treasury Bond at 4% for 5 years. You get $40/year for 5 years, then your $1,000 back. 🇺🇸" },
  { id:"calls", emoji:"☎️", title:"What is a Call Option?", color:"#d97706", summary:"The right to buy at a set price",
    content:`A call gives you the RIGHT (not obligation) to BUY a stock at a specific price before a certain date.\n\n💡 Like a coupon: "I can buy Nike for $90 anytime in the next 3 months."\n\nIf Nike hits $110, you use your coupon to buy at $90 → instant $20 profit!\nIf Nike drops, you just throw the coupon away.\n\n📊 Why use calls?\n• Control more stock with less money\n• Your max loss is only the option price`,
    example:"You pay $3 for a call on Apple at $200. Apple shoots to $230. You buy at $200, sell at $230 — $27 profit on a $3 bet! 🚀" },
  { id:"puts", emoji:"📉", title:"What is a Put Option?", color:"#dc2626", summary:"The right to sell at a set price",
    content:`A put gives you the RIGHT to SELL a stock at a specific price — even if it crashes!\n\n💡 Think of it as insurance: "No matter what, I can sell my stock for $90."\n\n📊 Two uses:\n• Protection (hedge): Insurance on stocks you own\n• Speculation: Bet that a stock will go DOWN\n\n⚠️ Options are advanced! Most beginners should start with regular stocks first.`,
    example:"You own Tesla at $250 and buy a put at $240 for $5. Tesla crashes to $180. You still sell at $240, saving $55/share! 🛡️" },
  { id:"health", emoji:"🏥", title:"Is a Company Healthy?", color:"#7c3aed", summary:"How to read financial signs",
    content:`Just like doctors check vitals, investors check financial metrics!\n\n💰 Revenue Growth: Is it making more money each year?\n\n📈 Profit Margin: Out of every $1 earned, how much is profit? (Higher = better)\n\n💳 Debt-to-Equity: How much does it owe vs. own? (Lower = safer)\n\n🔄 P/E Ratio: How much do you pay for $1 of earnings? (~15-20 is average)\n\n💵 Free Cash Flow: After expenses, how much cash is left? Positive = healthy!`,
    example:"Apple 2024: Revenue $391B, Profit Margin 26%, tons of cash. Very healthy! 🍎" },
  { id:"diversify", emoji:"🌈", title:"Diversification", color:"#0891b2", summary:"Don't put all eggs in one basket",
    content:`Diversification means spreading money across MANY investments so one bad one doesn't ruin everything.\n\n💡 Like this: If you put all your money in one lemonade stand and it rains all summer, you lose everything. But invest in lemonade, hot chocolate, AND umbrellas — you're covered!\n\n📊 Ways to diversify:\n• Different companies (Apple + Ford + J&J)\n• Different industries (tech + healthcare + energy)\n• Index Funds like S&P 500 buy 500 companies automatically!`,
    example:"Warren Buffett: 'Diversification is protection against ignorance.' Even pros spread their bets! 🧠" }
];

const QUIZ = [
  { q:"When you buy a stock, what are you actually buying?", options:["A loan to a company","A piece of ownership in a company","A government bond","An insurance policy"], answer:1 },
  { q:"A bond is most like...", options:["Buying a house","Owning a business","Being the bank and lending money","Playing the lottery"], answer:2 },
  { q:"A CALL option gives you the right to...", options:["Sell a stock at a set price","Buy a stock at a set price","Collect dividends","Vote at shareholder meetings"], answer:1 },
  { q:"A company with HIGH debt and LOW cash flow is...", options:["Very healthy","A risky investment","Always a great buy","Guaranteed to succeed"], answer:1 },
  { q:"Diversification means...", options:["Putting all money in one stock","Only buying tech stocks","Spreading money across many investments","Avoiding bonds completely"], answer:2 },
  { q:"P/E ratio stands for...", options:["Profit & Earnings","Price-to-Earnings","Percent of Equity","Portfolio Evaluation"], answer:1 },
  { q:"A PUT option protects you when a stock...", options:["Goes up a lot","Stays the same","Goes down a lot","Pays dividends"], answer:2 },
];

const SHORTCUTS = ["Apple","Tesla","Amazon","Microsoft","Nike","McDonald's","Google","Netflix"];

function genHistory(ticker, price, days = 90) {
  const seed = ticker.split('').reduce((a, c, i) => a + c.charCodeAt(0) * (i + 3), 0);
  const rand = s => { const x = Math.sin(s * 9301 + 49297) * 233280; return x - Math.floor(x); };
  let p = price;
  const arr = [];
  for (let i = days; i >= 0; i--) {
    arr.unshift(Math.max(0.5, Math.round(p * 100) / 100));
    p = p / (1 + (rand(seed + i) - 0.485) * 0.025);
  }
  const today = new Date();
  return arr.map((val, idx) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - idx));
    return { date: `${d.getMonth()+1}/${d.getDate()}`, price: val };
  });
}

const f$ = n => '$' + (n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const fPct = n => (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
const NAV = [["🏠","Home"],["📚","Learn"],["🔍","Research"],["💬","Ask AI"],["🎯","Quiz"],["⭐","Watchlist"],["💼","Portfolio"],["📈","Charts"]];

const ChartTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return <div style={{background:"#1e293b",border:"1px solid #334155",borderRadius:8,padding:"8px 12px",fontSize:12}}><div style={{color:"#94a3b8"}}>{payload[0].payload.date}</div><div style={{fontWeight:700,color:"#818cf8"}}>{f$(payload[0].value)}</div></div>;
};

export default function App() {
  const [tab, setTab] = useState(0);
  const [lesson, setLesson] = useState(null);
  const [msgs, setMsgs] = useState([{ role:"assistant", content:"Hey! 👋 I'm your Stock Market AI tutor!\n\nAsk me anything:\n• 'Is Apple a good investment?'\n• 'What is a P/E ratio?'\n• 'How do dividends work?'\n• 'Explain how options trading works'" }]);
  const [chatIn, setChatIn] = useState("");
  const [chatLoad, setChatLoad] = useState(false);
  const chatEnd = useRef(null);
  useEffect(() => chatEnd.current?.scrollIntoView({behavior:"smooth"}), [msgs]);

  const [rIn, setRIn] = useState("");
  const [rLoad, setRLoad] = useState(false);
  const [rResult, setRResult] = useState(null);
  const [cache, setCache] = useState({});

  const [watchlist, setWatchlist] = useState([]);

  const [folio, setFolio] = useState({ cash: 10000, h: {} });
  const [txns, setTxns] = useState([]);
  const [tTick, setTTick] = useState("");
  const [tShares, setTShares] = useState("");
  const [tType, setTType] = useState("buy");
  const [tMsg, setTMsg] = useState(null);

  const [cIn, setCIn] = useState("");
  const [cData, setCData] = useState(null);
  const [cName, setCName] = useState("");
  const [cLoad, setCLoad] = useState(false);

  const [qIdx, setQIdx] = useState(0);
  const [qSel, setQSel] = useState(null);
  const [qScore, setQScore] = useState(0);
  const [qDone, setQDone] = useState(false);

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  const api = async (messages, system) => {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system, messages })
    });
    const d = await r.json();
    return d.content?.[0]?.text || "";
  };

  const sendChat = async () => {
    if (!chatIn.trim() || chatLoad) return;
    const next = [...msgs, { role:"user", content:chatIn }];
    setMsgs(next); setChatIn(""); setChatLoad(true);
    try {
      const reply = await api(next.map(m => ({ role:m.role, content:m.content })),
        "You are a friendly stock market tutor for a 12-year-old. Simple language, emojis, real-world analogies. Under 200 words. Short paragraphs and bullet points.");
      setMsgs([...next, { role:"assistant", content:reply }]);
    } catch { setMsgs([...next, { role:"assistant", content:"Oops! Try again 🔄" }]); }
    setChatLoad(false);
  };

  const doResearch = async (company) => {
    const q = company || rIn;
    if (!q.trim() || rLoad) return;
    setRLoad(true); setRResult(null);
    try {
      const txt = await api(
        [{ role:"user", content:`Analyze "${q}" for a beginner investor. Return ONLY valid JSON (no backticks, no markdown, no extra text):\n{"name":"Full Company Name","ticker":"TICK","emoji":"🏢","currentPrice":0.00,"whatTheyDo":"simple 1-2 sentences","healthScore":75,"revenueGrowth":"X%","profitMargin":"X%","debtLevel":"Low","peRatio":"XX","pros":["pro1","pro2","pro3"],"cons":["con1","con2"],"kidAnalogy":"1 sentence for a 12-year-old","verdict":"Buy","verdictReason":"1 sentence"}` }],
        "You are a financial analyst. Return ONLY valid JSON. currentPrice must be a real approximate stock price as a plain number (e.g. 195.50). Use accurate real-world data."
      );
      const res = JSON.parse(txt.replace(/```[a-z]*\n?|```/g,"").trim());
      res.currentPrice = parseFloat(res.currentPrice) || 100;
      setRResult(res);
      setCache(prev => ({ ...prev, [res.ticker]: res }));
    } catch { setRResult({ error:true }); }
    setRLoad(false);
  };

  const addWatch = t => { if (!watchlist.includes(t)) setWatchlist(p => [...p, t]); };
  const delWatch = t => setWatchlist(p => p.filter(x => x !== t));

  const trade = () => {
    const n = parseFloat(tShares);
    if (!tTick || isNaN(n) || n <= 0) { setTMsg({e:1,t:"Enter a valid company and number of shares."}); return; }
    const co = cache[tTick];
    if (!co?.currentPrice) { setTMsg({e:1,t:"Research this company first to get its current price."}); return; }
    const px = co.currentPrice;
    const total = Math.round(n * px * 100) / 100;
    if (tType === "buy") {
      if (total > folio.cash) { setTMsg({e:1,t:`Need ${f$(total)} but you only have ${f$(folio.cash)} cash.`}); return; }
      const ex = folio.h[tTick];
      const newN = (ex?.shares||0) + n;
      const newCost = ex ? ((ex.shares * ex.cost) + total) / newN : px;
      setFolio(p => ({ cash: p.cash - total, h: { ...p.h, [tTick]:{ shares:newN, cost:newCost } } }));
      setTxns(p => [{ d:new Date().toLocaleDateString(), type:"BUY", t:tTick, n, px, total }, ...p]);
      setTMsg({e:0,t:`✅ Bought ${n} share${n!==1?'s':''} of ${tTick} for ${f$(total)}!`});
    } else {
      const ex = folio.h[tTick];
      if (!ex || ex.shares < n) { setTMsg({e:1,t:`You only own ${ex?.shares||0} shares of ${tTick}.`}); return; }
      const newH = { ...folio.h };
      if (ex.shares - n < 0.001) delete newH[tTick];
      else newH[tTick] = { ...ex, shares: ex.shares - n };
      const pnl = (px - ex.cost) * n;
      setFolio(p => ({ cash: p.cash + total, h: newH }));
      setTxns(p => [{ d:new Date().toLocaleDateString(), type:"SELL", t:tTick, n, px, total }, ...p]);
      setTMsg({e:0,t:`✅ Sold ${n} share${n!==1?'s':''} of ${tTick} for ${f$(total)}. P&L: ${pnl>=0?'+':''}${f$(pnl)}`});
    }
    setTShares("");
  };

  const hTicks = Object.keys(folio.h);
  const invVal = hTicks.reduce((s,t) => s + folio.h[t].shares * (cache[t]?.currentPrice || folio.h[t].cost), 0);
  const totalVal = folio.cash + invVal;
  const pnlTotal = totalVal - 10000;
  const pnlPct = (pnlTotal / 10000) * 100;

  const loadChart = async (tickerArg) => {
    const raw = tickerArg || cIn;
    const t = raw.toUpperCase().replace(/[^A-Z0-9]/g,'');
    if (!t) return;
    setCLoad(true); setCData(null); setCName(t);
    let co = cache[t];
    if (!co?.currentPrice) {
      try {
        const txt = await api(
          [{ role:"user", content:`Current stock price for "${raw}". Return ONLY JSON: {"name":"Company Name","ticker":"TICK","emoji":"📈","currentPrice":0.00}` }],
          "Return ONLY valid JSON. currentPrice must be a real approximate number."
        );
        co = JSON.parse(txt.replace(/```[a-z]*\n?|```/g,"").trim());
        co.currentPrice = parseFloat(co.currentPrice) || 100;
        setCache(prev => ({ ...prev, [co.ticker||t]: { ...prev[co.ticker||t], ...co } }));
      } catch {}
    }
    if (co?.currentPrice) {
      setCData(genHistory(t, co.currentPrice));
      setCName(co.name || t);
    } else setCData([]);
    setCLoad(false);
  };

  const selQ = i => { if (qSel!==null) return; setQSel(i); if (i===QUIZ[qIdx].answer) setQScore(s=>s+1); };
  const nextQ = () => { if (qIdx+1>=QUIZ.length){setQDone(true);return;} setQIdx(q=>q+1); setQSel(null); };
  const resetQ = () => { setQIdx(0); setQSel(null); setQScore(0); setQDone(false); };

  return (
    <div style={{fontFamily:"'Segoe UI',sans-serif",minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%)",color:"#f1f5f9"}}>

      {/* Header */}
      <div style={{background:"rgba(255,255,255,0.05)",borderBottom:"1px solid rgba(255,255,255,0.1)",padding:"11px 16px",display:"flex",alignItems:"center",gap:10}}>
        <div style={{fontSize:24}}>📊</div>
        <div>
          <div style={{fontWeight:800,fontSize:16,background:"linear-gradient(90deg,#818cf8,#34d399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Stock Market Academy</div>
          <div style={{fontSize:10,color:"#475569"}}>Learn • Research • Trade • Grow</div>
        </div>
        <div style={{marginLeft:"auto",textAlign:"right",cursor:"pointer"}} onClick={()=>setTab(6)}>
          <div style={{fontSize:10,color:"#475569"}}>Paper Portfolio</div>
          <div style={{fontWeight:800,color:pnlTotal>=0?"#10b981":"#ef4444",fontSize:15}}>{f$(totalVal)}</div>
          <div style={{fontSize:10,color:pnlTotal>=0?"#10b981":"#ef4444"}}>{fPct(pnlPct)} all time</div>
        </div>
      </div>

      {/* Nav */}
      <div style={{display:"flex",gap:2,padding:"7px 10px",overflowX:"auto",background:"rgba(0,0,0,0.25)",scrollbarWidth:"none"}}>
        {NAV.map(([icon,label],i) => (
          <button key={i} onClick={()=>setTab(i)} style={{padding:"5px 9px",borderRadius:12,border:"none",cursor:"pointer",whiteSpace:"nowrap",fontWeight:600,fontSize:10,background:tab===i?"linear-gradient(90deg,#6366f1,#8b5cf6)":"rgba(255,255,255,0.07)",color:tab===i?"#fff":"#64748b",display:"flex",flexDirection:"column",alignItems:"center",minWidth:48,gap:1}}>
            <span style={{fontSize:14}}>{icon}</span>{label}
          </button>
        ))}
      </div>

      <div style={{padding:"14px",maxWidth:680,margin:"0 auto"}}>

        {/* HOME */}
        {tab===0 && (
          <div>
            <div style={{textAlign:"center",padding:"14px 0 22px"}}>
              <div style={{fontSize:50}}>🚀</div>
              <h1 style={{fontSize:21,fontWeight:800,margin:"10px 0 6px"}}>Welcome to Stock Market Academy!</h1>
              <p style={{color:"#94a3b8",fontSize:13}}>Learn investing, research companies & practice trading with $10,000 paper money!</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:14}}>
              {[
                {icon:"📚",t:"6 Lessons",d:"Stocks, bonds, options & more",tab:1,c:"#4f46e5"},
                {icon:"🔍",t:"AI Research",d:"Analyze any company instantly",tab:2,c:"#059669"},
                {icon:"💼",t:"Paper Trading",d:"$10,000 to practice with",tab:6,c:"#d97706"},
                {icon:"📈",t:"Price Charts",d:"90-day chart any stock",tab:7,c:"#0891b2"},
                {icon:"⭐",t:"Watchlist",d:"Track your favorites",tab:5,c:"#7c3aed"},
                {icon:"🎯",t:"Quiz",d:"Test your knowledge",tab:4,c:"#dc2626"},
              ].map((c,i) => (
                <button key={i} onClick={()=>setTab(c.tab)} style={{background:`linear-gradient(135deg,${c.c}33,${c.c}11)`,border:`1px solid ${c.c}44`,borderRadius:14,padding:"13px",cursor:"pointer",textAlign:"left",color:"#f1f5f9"}}>
                  <div style={{fontSize:26}}>{c.icon}</div>
                  <div style={{fontWeight:700,fontSize:14,marginTop:5}}>{c.t}</div>
                  <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{c.d}</div>
                </button>
              ))}
            </div>
            <div style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:13,padding:"13px 15px"}}>
              <div style={{fontWeight:700,marginBottom:4}}>💡 Did You Know?</div>
              <p style={{color:"#cbd5e1",fontSize:13,margin:0}}>$1,000 invested in Amazon at its 1997 IPO would be worth over <strong style={{color:"#34d399"}}>$2,000,000+</strong> today. That's the power of long-term investing! 🌱</p>
            </div>
          </div>
        )}

        {/* LEARN */}
        {tab===1 && !lesson && (
          <div>
            <h2 style={{fontWeight:800,marginBottom:4}}>📚 Investing Lessons</h2>
            <p style={{color:"#94a3b8",marginBottom:14,fontSize:13}}>Tap any lesson to learn!</p>
            <div style={{display:"grid",gap:9}}>
              {LESSONS.map(l => (
                <button key={l.id} onClick={()=>setLesson(l)} style={{background:`linear-gradient(135deg,${l.color}22,${l.color}11)`,border:`1px solid ${l.color}44`,borderRadius:14,padding:"13px 16px",cursor:"pointer",textAlign:"left",color:"#f1f5f9",display:"flex",alignItems:"center",gap:13}}>
                  <div style={{fontSize:30}}>{l.emoji}</div>
                  <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15}}>{l.title}</div><div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{l.summary}</div></div>
                  <div style={{color:"#475569",fontSize:18}}>›</div>
                </button>
              ))}
            </div>
          </div>
        )}
        {tab===1 && lesson && (
          <div>
            <button onClick={()=>setLesson(null)} style={{background:"rgba(255,255,255,0.08)",border:"none",color:"#94a3b8",borderRadius:8,padding:"7px 13px",cursor:"pointer",marginBottom:13,fontSize:13}}>← Back</button>
            <div style={{background:`linear-gradient(135deg,${lesson.color}33,${lesson.color}11)`,border:`1px solid ${lesson.color}55`,borderRadius:18,padding:20}}>
              <div style={{fontSize:42}}>{lesson.emoji}</div>
              <h2 style={{fontWeight:800,fontSize:20,margin:"7px 0 13px"}}>{lesson.title}</h2>
              <div style={{color:"#e2e8f0",lineHeight:1.7,fontSize:14,whiteSpace:"pre-line"}}>{lesson.content}</div>
              <div style={{background:"rgba(0,0,0,0.3)",borderRadius:11,padding:"11px 14px",marginTop:16}}>
                <div style={{fontWeight:700,color:"#fbbf24",marginBottom:4,fontSize:12}}>📖 Real Example</div>
                <div style={{color:"#e2e8f0",fontSize:13}}>{lesson.example}</div>
              </div>
            </div>
            <button onClick={()=>{setTab(3);setChatIn(`Tell me more about ${lesson.title} in simple terms`);}} style={{marginTop:13,width:"100%",background:"linear-gradient(90deg,#6366f1,#8b5cf6)",border:"none",borderRadius:12,padding:"12px",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:14}}>
              💬 Ask AI More About This Topic
            </button>
          </div>
        )}

        {/* RESEARCH */}
        {tab===2 && (
          <div>
            <h2 style={{fontWeight:800,marginBottom:4}}>🔍 Company Research</h2>
            <p style={{color:"#94a3b8",marginBottom:13,fontSize:13}}>AI-powered analysis of any company!</p>
            <div style={{display:"flex",gap:8,marginBottom:9}}>
              <input value={rIn} onChange={e=>setRIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doResearch()} placeholder="Apple, TSLA, Nike..." style={{flex:1,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.13)",borderRadius:11,padding:"11px 13px",color:"#f1f5f9",fontSize:14,outline:"none"}}/>
              <button onClick={()=>doResearch()} disabled={rLoad} style={{background:"linear-gradient(90deg,#6366f1,#8b5cf6)",border:"none",borderRadius:11,padding:"11px 18px",color:"#fff",fontWeight:700,cursor:"pointer"}}>{rLoad?"...":"Go"}</button>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
              {SHORTCUTS.map(c=><button key={c} onClick={()=>{setRIn(c);doResearch(c);}} style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,padding:"4px 11px",color:"#94a3b8",fontSize:12,cursor:"pointer"}}>{c}</button>)}
            </div>
            {rLoad && <div style={{textAlign:"center",padding:36,color:"#94a3b8"}}><div style={{fontSize:34}}>🔍</div><div style={{marginTop:9}}>Analyzing {rIn}...</div></div>}
            {rResult && !rResult.error && (
              <div style={{background:"rgba(255,255,255,0.03)",borderRadius:18,padding:17,border:"1px solid rgba(255,255,255,0.09)"}}>
                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:13}}>
                  <div style={{fontSize:34}}>{rResult.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:17}}>{rResult.name} <span style={{color:"#64748b",fontSize:12}}>{rResult.ticker}</span></div>
                    <div style={{color:"#94a3b8",fontSize:12}}>{rResult.whatTheyDo}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:800,fontSize:19,color:"#818cf8"}}>{f$(rResult.currentPrice)}</div>
                    <div style={{fontSize:10,color:"#64748b"}}>~Current Price</div>
                  </div>
                </div>
                <div style={{background:"rgba(0,0,0,0.2)",borderRadius:9,padding:"9px 13px",marginBottom:13}}>
                  <div style={{fontSize:10,color:"#64748b",marginBottom:2}}>🧒 Kid Analogy</div>
                  <div style={{fontSize:13,color:"#e2e8f0"}}>{rResult.kidAnalogy}</div>
                </div>
                <div style={{marginBottom:13}}>
                  <div style={{fontSize:11,color:"#64748b",marginBottom:5}}>📊 Health Score</div>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <div style={{flex:1,background:"rgba(255,255,255,0.1)",borderRadius:999,height:10}}>
                      <div style={{width:`${rResult.healthScore}%`,height:"100%",background:rResult.healthScore>=70?"#10b981":rResult.healthScore>=50?"#f59e0b":"#ef4444",borderRadius:999}}/>
                    </div>
                    <div style={{fontWeight:700,color:rResult.healthScore>=70?"#10b981":"#f59e0b",fontSize:14}}>{rResult.healthScore}/100</div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:13}}>
                  {[["📈 Revenue Growth",rResult.revenueGrowth],["💰 Profit Margin",rResult.profitMargin],["💳 Debt Level",rResult.debtLevel],["📊 P/E Ratio",rResult.peRatio]].map(([l,v])=>(
                    <div key={l} style={{background:"rgba(255,255,255,0.05)",borderRadius:9,padding:"9px 11px"}}>
                      <div style={{fontSize:10,color:"#64748b",marginBottom:2}}>{l}</div>
                      <div style={{fontWeight:700,fontSize:13}}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:13}}>
                  <div style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:9,padding:"10px 11px"}}>
                    <div style={{color:"#10b981",fontWeight:700,marginBottom:4,fontSize:12}}>✅ Pros</div>
                    {rResult.pros?.map((p,i)=><div key={i} style={{fontSize:12,color:"#e2e8f0",marginBottom:2}}>• {p}</div>)}
                  </div>
                  <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:9,padding:"10px 11px"}}>
                    <div style={{color:"#ef4444",fontWeight:700,marginBottom:4,fontSize:12}}>⚠️ Cons</div>
                    {rResult.cons?.map((c,i)=><div key={i} style={{fontSize:12,color:"#e2e8f0",marginBottom:2}}>• {c}</div>)}
                  </div>
                </div>
                <div style={{background:rResult.verdict==="Buy"?"rgba(16,185,129,0.15)":rResult.verdict==="Skip"?"rgba(239,68,68,0.15)":"rgba(245,158,11,0.15)",border:`1px solid ${rResult.verdict==="Buy"?"rgba(16,185,129,0.4)":rResult.verdict==="Skip"?"rgba(239,68,68,0.4)":"rgba(245,158,11,0.4)"}`,borderRadius:11,padding:"11px 15px",marginBottom:11}}>
                  <div style={{fontWeight:800,fontSize:15,color:rResult.verdict==="Buy"?"#10b981":rResult.verdict==="Skip"?"#ef4444":"#f59e0b"}}>
                    {rResult.verdict==="Buy"?"🟢":rResult.verdict==="Skip"?"🔴":"🟡"} Verdict: {rResult.verdict}
                  </div>
                  <div style={{fontSize:13,color:"#e2e8f0",marginTop:4}}>{rResult.verdictReason}</div>
                </div>
                <div style={{display:"flex",gap:7}}>
                  <button onClick={()=>addWatch(rResult.ticker)} disabled={watchlist.includes(rResult.ticker)} style={{flex:1,background:watchlist.includes(rResult.ticker)?"rgba(255,255,255,0.04)":"rgba(99,102,241,0.18)",border:`1px solid ${watchlist.includes(rResult.ticker)?"rgba(255,255,255,0.08)":"rgba(99,102,241,0.4)"}`,borderRadius:9,padding:"9px",color:watchlist.includes(rResult.ticker)?"#475569":"#818cf8",fontWeight:600,cursor:"pointer",fontSize:12}}>
                    {watchlist.includes(rResult.ticker)?"⭐ Watching":"⭐ Watchlist"}
                  </button>
                  <button onClick={()=>{setTab(7);setCIn(rResult.ticker);loadChart(rResult.ticker);}} style={{flex:1,background:"rgba(8,145,178,0.18)",border:"1px solid rgba(8,145,178,0.4)",borderRadius:9,padding:"9px",color:"#22d3ee",fontWeight:600,cursor:"pointer",fontSize:12}}>📈 Chart</button>
                  <button onClick={()=>{setTab(6);setTTick(rResult.ticker);setTType("buy");}} style={{flex:1,background:"rgba(16,185,129,0.15)",border:"1px solid rgba(16,185,129,0.35)",borderRadius:9,padding:"9px",color:"#10b981",fontWeight:600,cursor:"pointer",fontSize:12}}>💼 Trade</button>
                </div>
                <div style={{fontSize:10,color:"#475569",marginTop:8,textAlign:"center"}}>*Approximate prices for educational use only. Not real financial advice.</div>
              </div>
            )}
            {rResult?.error && <div style={{textAlign:"center",padding:20,color:"#ef4444"}}>❌ Couldn't analyze that. Try a different company name!</div>}
          </div>
        )}

        {/* ASK AI */}
        {tab===3 && (
          <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 185px)"}}>
            <h2 style={{fontWeight:800,marginBottom:2}}>💬 Ask Your AI Tutor</h2>
            <p style={{color:"#94a3b8",marginBottom:9,fontSize:12}}>No question is too simple!</p>
            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:9,marginBottom:9}}>
              {msgs.map((m,i)=>(
                <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                  <div style={{maxWidth:"85%",background:m.role==="user"?"linear-gradient(135deg,#6366f1,#8b5cf6)":"rgba(255,255,255,0.07)",borderRadius:m.role==="user"?"15px 15px 3px 15px":"15px 15px 15px 3px",padding:"10px 13px",fontSize:13,lineHeight:1.6,whiteSpace:"pre-wrap"}}>
                    {m.content}
                  </div>
                </div>
              ))}
              {chatLoad && <div style={{display:"flex",justifyContent:"flex-start"}}><div style={{background:"rgba(255,255,255,0.07)",borderRadius:"15px 15px 15px 3px",padding:"10px 13px",fontSize:13,color:"#94a3b8"}}>Thinking... 🤔</div></div>}
              <div ref={chatEnd}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Ask anything about stocks, investing..." style={{flex:1,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:11,padding:"11px 13px",color:"#f1f5f9",fontSize:13,outline:"none"}}/>
              <button onClick={sendChat} disabled={chatLoad} style={{background:"linear-gradient(90deg,#6366f1,#8b5cf6)",border:"none",borderRadius:11,padding:"11px 15px",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:17}}>↑</button>
            </div>
          </div>
        )}

        {/* QUIZ */}
        {tab===4 && (
          <div>
            <h2 style={{fontWeight:800,marginBottom:4}}>🎯 Knowledge Quiz</h2>
            {!qDone ? (
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:13}}>
                  <div style={{fontSize:12,color:"#94a3b8"}}>Q{qIdx+1} of {QUIZ.length}</div>
                  <div style={{fontSize:12,color:"#fbbf24",fontWeight:700}}>Score: {qScore}/{qIdx}</div>
                </div>
                <div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:18,marginBottom:12}}>
                  <div style={{fontWeight:700,fontSize:15,marginBottom:16,lineHeight:1.4}}>{QUIZ[qIdx].q}</div>
                  <div style={{display:"grid",gap:7}}>
                    {QUIZ[qIdx].options.map((opt,i)=>{
                      let bg="rgba(255,255,255,0.06)",bd="1px solid rgba(255,255,255,0.1)";
                      if(qSel!==null){if(i===QUIZ[qIdx].answer){bg="rgba(16,185,129,0.2)";bd="1px solid #10b981";}else if(i===qSel){bg="rgba(239,68,68,0.2)";bd="1px solid #ef4444";}}
                      return <button key={i} onClick={()=>selQ(i)} style={{background:bg,border:bd,borderRadius:10,padding:"11px 13px",color:"#f1f5f9",textAlign:"left",cursor:qSel===null?"pointer":"default",fontSize:13,fontWeight:500}}>
                        {String.fromCharCode(65+i)}. {opt}
                        {qSel!==null&&i===QUIZ[qIdx].answer&&" ✅"}
                        {qSel===i&&i!==QUIZ[qIdx].answer&&" ❌"}
                      </button>;
                    })}
                  </div>
                </div>
                {qSel!==null&&<button onClick={nextQ} style={{width:"100%",background:"linear-gradient(90deg,#6366f1,#8b5cf6)",border:"none",borderRadius:11,padding:"12px",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:14}}>{qIdx+1<QUIZ.length?"Next Question →":"See Results 🏆"}</button>}
              </div>
            ) : (
              <div style={{textAlign:"center",padding:"28px 0"}}>
                <div style={{fontSize:62,marginBottom:13}}>{qScore>=6?"🏆":qScore>=4?"🥈":"📚"}</div>
                <h3 style={{fontSize:21,fontWeight:800,marginBottom:6}}>Quiz Complete!</h3>
                <div style={{fontSize:44,fontWeight:800,color:qScore>=6?"#10b981":qScore>=4?"#f59e0b":"#ef4444",marginBottom:6}}>{qScore}/{QUIZ.length}</div>
                <p style={{color:"#94a3b8",marginBottom:20}}>{qScore>=6?"Amazing! You're a stock market genius! 🌟":qScore>=4?"Great work! Review a few lessons and retry! 📚":"Keep learning — you've got this! 💪"}</p>
                <button onClick={resetQ} style={{background:"linear-gradient(90deg,#6366f1,#8b5cf6)",border:"none",borderRadius:11,padding:"12px 28px",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:14}}>Try Again 🔄</button>
              </div>
            )}
          </div>
        )}

        {/* WATCHLIST */}
        {tab===5 && (
          <div>
            <h2 style={{fontWeight:800,marginBottom:4}}>⭐ My Watchlist</h2>
            <p style={{color:"#94a3b8",marginBottom:14,fontSize:13}}>Research companies and tap "Watchlist" to track them here!</p>
            {watchlist.length===0 ? (
              <div style={{textAlign:"center",padding:"38px 18px",color:"#64748b"}}>
                <div style={{fontSize:46,marginBottom:11}}>⭐</div>
                <div style={{marginBottom:14}}>No companies yet! Go research some companies.</div>
                <button onClick={()=>setTab(2)} style={{background:"linear-gradient(90deg,#6366f1,#8b5cf6)",border:"none",borderRadius:10,padding:"10px 22px",color:"#fff",fontWeight:600,cursor:"pointer",fontSize:13}}>Go Research →</button>
              </div>
            ) : (
              <div style={{display:"grid",gap:9}}>
                {watchlist.map(t=>{
                  const co=cache[t]; if(!co) return null;
                  return (
                    <div key={t} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:13,padding:"13px 15px",display:"flex",alignItems:"center",gap:11}}>
                      <div style={{fontSize:26}}>{co.emoji}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:14}}>{co.name} <span style={{color:"#64748b",fontSize:11}}>{co.ticker}</span></div>
                        <div style={{fontSize:11,color:"#94a3b8"}}>{co.whatTheyDo}</div>
                        <div style={{display:"flex",gap:5,marginTop:5}}>
                          <span style={{fontSize:10,background:"rgba(99,102,241,0.2)",color:"#818cf8",borderRadius:5,padding:"2px 7px"}}>Health {co.healthScore}/100</span>
                          <span style={{fontSize:10,background:co.verdict==="Buy"?"rgba(16,185,129,0.2)":"rgba(245,158,11,0.2)",color:co.verdict==="Buy"?"#10b981":"#f59e0b",borderRadius:5,padding:"2px 7px"}}>{co.verdict}</span>
                        </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontWeight:800,color:"#818cf8",fontSize:15}}>{f$(co.currentPrice)}</div>
                        <div style={{display:"flex",gap:4,marginTop:5,justifyContent:"flex-end"}}>
                          <button onClick={()=>{setTab(7);loadChart(t);}} style={{background:"rgba(8,145,178,0.2)",border:"none",borderRadius:5,padding:"3px 7px",color:"#22d3ee",fontSize:11,cursor:"pointer"}}>📈</button>
                          <button onClick={()=>{setTab(6);setTTick(t);setTType("buy");}} style={{background:"rgba(16,185,129,0.2)",border:"none",borderRadius:5,padding:"3px 7px",color:"#10b981",fontSize:11,cursor:"pointer"}}>💼</button>
                          <button onClick={()=>delWatch(t)} style={{background:"rgba(239,68,68,0.15)",border:"none",borderRadius:5,padding:"3px 7px",color:"#ef4444",fontSize:11,cursor:"pointer"}}>✕</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PORTFOLIO */}
        {tab===6 && (
          <div>
            <h2 style={{fontWeight:800,marginBottom:4}}>💼 Paper Trading Portfolio</h2>
            <p style={{color:"#94a3b8",marginBottom:13,fontSize:13}}>Practice with $10,000 of fake money — zero risk, real lessons!</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:14}}>
              {[
                {l:"💵 Cash",v:f$(folio.cash),c:"#94a3b8"},
                {l:"📊 Invested",v:f$(invVal),c:"#818cf8"},
                {l:"Total P&L",v:(pnlTotal>=0?"+":"")+f$(pnlTotal),c:pnlTotal>=0?"#10b981":"#ef4444"},
              ].map(s=>(
                <div key={s.l} style={{background:"rgba(255,255,255,0.05)",borderRadius:11,padding:"11px 9px",textAlign:"center"}}>
                  <div style={{fontSize:10,color:"#64748b",marginBottom:2}}>{s.l}</div>
                  <div style={{fontWeight:700,fontSize:14,color:s.c}}>{s.v}</div>
                </div>
              ))}
            </div>
            <div style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:13,padding:"15px",marginBottom:14}}>
              <div style={{fontWeight:700,marginBottom:11}}>🔄 Place a Trade</div>
              <div style={{display:"flex",gap:6,marginBottom:9}}>
                <button onClick={()=>setTType("buy")} style={{flex:1,background:tType==="buy"?"rgba(16,185,129,0.25)":"rgba(255,255,255,0.05)",border:`1px solid ${tType==="buy"?"#10b981":"rgba(255,255,255,0.1)"}`,borderRadius:9,padding:"8px",color:tType==="buy"?"#10b981":"#94a3b8",fontWeight:600,cursor:"pointer",fontSize:13}}>🟢 Buy</button>
                <button onClick={()=>setTType("sell")} style={{flex:1,background:tType==="sell"?"rgba(239,68,68,0.2)":"rgba(255,255,255,0.05)",border:`1px solid ${tType==="sell"?"#ef4444":"rgba(255,255,255,0.1)"}`,borderRadius:9,padding:"8px",color:tType==="sell"?"#ef4444":"#94a3b8",fontWeight:600,cursor:"pointer",fontSize:13}}>🔴 Sell</button>
              </div>
              <div style={{display:"flex",gap:7,marginBottom:9}}>
                <select value={tTick} onChange={e=>setTTick(e.target.value)} style={{flex:2,background:"#1e293b",border:"1px solid rgba(255,255,255,0.13)",borderRadius:9,padding:"10px 11px",color:tTick?"#f1f5f9":"#64748b",fontSize:13,outline:"none"}}>
                  <option value="">Select company...</option>
                  {Object.keys(cache).map(t=><option key={t} value={t}>{cache[t].name} ({t})</option>)}
                </select>
                <input type="number" value={tShares} onChange={e=>setTShares(e.target.value)} placeholder="Shares" min="0.01" step="0.01" style={{flex:1,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.13)",borderRadius:9,padding:"10px 11px",color:"#f1f5f9",fontSize:13,outline:"none"}}/>
              </div>
              {tTick&&cache[tTick]&&tShares&&(
                <div style={{fontSize:12,color:"#94a3b8",marginBottom:8}}>
                  Estimated: {f$(parseFloat(tShares||0)*cache[tTick].currentPrice)} @ {f$(cache[tTick].currentPrice)}/share
                </div>
              )}
              <button onClick={trade} style={{width:"100%",background:tType==="buy"?"linear-gradient(90deg,#059669,#10b981)":"linear-gradient(90deg,#dc2626,#ef4444)",border:"none",borderRadius:10,padding:"12px",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:14}}>
                {tType==="buy"?"🟢 Buy Shares":"🔴 Sell Shares"}
              </button>
              {tMsg&&<div style={{marginTop:9,padding:"9px 12px",background:tMsg.e?"rgba(239,68,68,0.15)":"rgba(16,185,129,0.15)",border:`1px solid ${tMsg.e?"rgba(239,68,68,0.4)":"rgba(16,185,129,0.4)"}`,borderRadius:9,fontSize:13,color:tMsg.e?"#ef4444":"#10b981"}}>{tMsg.t}</div>}
              {Object.keys(cache).length===0&&<div style={{fontSize:12,color:"#64748b",marginTop:9,textAlign:"center"}}>💡 Research some companies first — they'll appear in the dropdown!</div>}
              <div style={{fontSize:10,color:"#475569",marginTop:8}}>⚠️ Paper trading only. Prices approximate. For educational use.</div>
            </div>
            {hTicks.length>0&&(
              <div style={{marginBottom:13}}>
                <div style={{fontWeight:700,marginBottom:9}}>📊 My Holdings</div>
                <div style={{display:"grid",gap:7}}>
                  {hTicks.map(t=>{
                    const h=folio.h[t],co=cache[t],px=co?.currentPrice||h.cost;
                    const mv=h.shares*px,cost=h.shares*h.cost,pnl=mv-cost,pct=(pnl/cost)*100;
                    return <div key={t} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:11,padding:"11px 13px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:14}}>{co?.emoji||"📈"} {t}</div>
                        <div style={{fontSize:11,color:"#64748b"}}>{h.shares} shares @ {f$(h.cost)} avg</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontWeight:700,fontSize:14}}>{f$(mv)}</div>
                        <div style={{fontSize:12,color:pnl>=0?"#10b981":"#ef4444"}}>{pnl>=0?"+":""}{f$(pnl)} ({fPct(pct)})</div>
                      </div>
                    </div>;
                  })}
                </div>
              </div>
            )}
            {txns.length>0&&(
              <div>
                <div style={{fontWeight:700,marginBottom:9}}>📋 Transaction History</div>
                <div style={{display:"grid",gap:5}}>
                  {txns.slice(0,10).map((tx,i)=>(
                    <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:9,padding:"9px 13px",display:"flex",justifyContent:"space-between",fontSize:12}}>
                      <div><span style={{color:tx.type==="BUY"?"#10b981":"#ef4444",fontWeight:700}}>{tx.type}</span> {tx.n} shares {tx.t}<div style={{fontSize:10,color:"#64748b"}}>{tx.d} @ {f$(tx.px)}</div></div>
                      <div style={{fontWeight:700,color:tx.type==="BUY"?"#ef4444":"#10b981"}}>{tx.type==="BUY"?"-":"+"}{f$(tx.total)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {hTicks.length===0&&txns.length===0&&(
              <div style={{textAlign:"center",padding:"28px 18px",color:"#64748b"}}>
                <div style={{fontSize:46,marginBottom:9}}>💼</div>
                <div style={{marginBottom:5}}>You have {f$(folio.cash)} ready to invest!</div>
                <div style={{fontSize:13}}>Research a company first, then come back here to trade.</div>
                <button onClick={()=>setTab(2)} style={{marginTop:13,background:"linear-gradient(90deg,#6366f1,#8b5cf6)",border:"none",borderRadius:10,padding:"10px 22px",color:"#fff",fontWeight:600,cursor:"pointer",fontSize:13}}>Go Research →</button>
              </div>
            )}
          </div>
        )}

        {/* CHARTS */}
        {tab===7 && (
          <div>
            <h2 style={{fontWeight:800,marginBottom:4}}>📈 Price Charts</h2>
            <p style={{color:"#94a3b8",marginBottom:13,fontSize:13}}>90-day simulated price history for any stock.</p>
            <div style={{display:"flex",gap:8,marginBottom:9}}>
              <input value={cIn} onChange={e=>setCIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&loadChart()} placeholder="Ticker: AAPL, TSLA, AMZN..." style={{flex:1,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.13)",borderRadius:11,padding:"11px 13px",color:"#f1f5f9",fontSize:14,outline:"none"}}/>
              <button onClick={()=>loadChart()} disabled={cLoad} style={{background:"linear-gradient(90deg,#6366f1,#8b5cf6)",border:"none",borderRadius:11,padding:"11px 18px",color:"#fff",fontWeight:700,cursor:"pointer"}}>{cLoad?"...":"Chart"}</button>
            </div>
            {Object.keys(cache).length>0&&(
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
                {Object.keys(cache).map(t=><button key={t} onClick={()=>{setCIn(t);loadChart(t);}} style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:15,padding:"4px 11px",color:"#94a3b8",fontSize:12,cursor:"pointer"}}>{t}</button>)}
              </div>
            )}
            {cLoad&&<div style={{textAlign:"center",padding:36,color:"#94a3b8"}}><div style={{fontSize:34}}>📈</div><div style={{marginTop:9}}>Loading chart...</div></div>}
            {cData&&cData.length>0&&(
              <div style={{background:"rgba(255,255,255,0.03)",borderRadius:17,padding:"16px 12px",border:"1px solid rgba(255,255,255,0.08)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,padding:"0 4px"}}>
                  <div>
                    <div style={{fontWeight:800,fontSize:17}}>{cName}</div>
                    <div style={{fontSize:11,color:"#64748b"}}>90-day simulated history</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:800,fontSize:19,color:"#818cf8"}}>{f$(cData[cData.length-1]?.price)}</div>
                    {(()=>{const chg=cData[cData.length-1].price-cData[0].price,pct=(chg/cData[0].price)*100;return<div style={{fontSize:12,color:chg>=0?"#10b981":"#ef4444"}}>{chg>=0?"+":""}{f$(chg)} ({fPct(pct)} 90d)</div>;})()}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={cData} margin={{top:5,right:5,bottom:0,left:5}}>
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{fontSize:9,fill:"#64748b"}} tickLine={false} axisLine={false} interval={Math.floor(cData.length/6)}/>
                    <YAxis tick={{fontSize:9,fill:"#64748b"}} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}`} width={52} domain={['auto','auto']}/>
                    <Tooltip content={<ChartTip/>}/>
                    <Area type="monotone" dataKey="price" stroke="#818cf8" strokeWidth={2} fill="url(#grad)" dot={false} activeDot={{r:4,fill:"#818cf8"}}/>
                  </AreaChart>
                </ResponsiveContainer>
                <div style={{display:"flex",gap:8,marginTop:13}}>
                  <button onClick={()=>{setTab(6);const t=Object.keys(cache).find(k=>cache[k].name===cName)||cIn.toUpperCase();setTTick(t);setTType("buy");}} style={{flex:1,background:"rgba(16,185,129,0.15)",border:"1px solid rgba(16,185,129,0.35)",borderRadius:9,padding:"9px",color:"#10b981",fontWeight:600,cursor:"pointer",fontSize:13}}>💼 Trade This Stock</button>
                  <button onClick={()=>{const t=Object.keys(cache).find(k=>cache[k].name===cName)||cIn.toUpperCase();addWatch(t);}} style={{flex:1,background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.35)",borderRadius:9,padding:"9px",color:"#818cf8",fontWeight:600,cursor:"pointer",fontSize:13}}>⭐ Add to Watchlist</button>
                </div>
                <div style={{fontSize:10,color:"#475569",marginTop:8,textAlign:"center"}}>📊 Simulated data for education only. Not real market data.</div>
              </div>
            )}
            {cData&&cData.length===0&&<div style={{textAlign:"center",padding:20,color:"#ef4444"}}>❌ Couldn't load chart. Try a well-known ticker like AAPL or TSLA!</div>}
            {!cData&&!cLoad&&(
              <div style={{textAlign:"center",padding:"38px 18px",color:"#64748b"}}>
                <div style={{fontSize:46,marginBottom:11}}>📈</div>
                <div>Type any stock ticker above — AAPL, TSLA, AMZN, MSFT...</div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
