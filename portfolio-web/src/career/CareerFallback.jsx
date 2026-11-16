import { useId } from 'react'

// The same white/teal character as the intro's SVG fallback. These illustrations
// are only used when a browser cannot create a Babylon/WebGL engine.
function Bot({ x, y, scale = 1, role = 'idle', paint }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className="cf-bot">
        <g fill={paint} stroke="#C4D0CC" strokeWidth="1.4">
          <path d="M44 118v28q0 8 7 8t7-8v-28" /><path d="M66 118v28q0 8 7 8t7-8v-28" />
        </g>
        <g fill="#24877A"><rect x="35" y="148" width="27" height="12" rx="6"/><rect x="65" y="148" width="27" height="12" rx="6"/></g>
        <g className={'cf-arm cf-arm-left ' + (role === 'typing' ? 'cf-type-left' : '')}>
          <rect x="25" y="91" width="13" height="36" rx="7" fill={paint} stroke="#C4D0CC"/><circle cx="31.5" cy="130" r="8" fill="#24877A"/>
        </g>
        <g className={'cf-arm cf-arm-right ' + (role === 'support' ? 'cf-call' : role === 'typing' ? 'cf-type-right' : role === 'teacher' ? 'cf-point' : role === 'flagman' ? 'cf-halt' : '')}>
          <rect x="82" y="91" width="13" height="36" rx="7" fill={paint} stroke="#C4D0CC"/><circle cx="88.5" cy="130" r="8" fill="#24877A"/>
        </g>
        <rect x="32" y="82" width="56" height="48" rx="22" fill={paint} stroke="#C4D0CC" strokeWidth="1.4"/>
        {role === 'flagman' ? <path d="M36 88l14 7h20l14-7v31H36z" fill="#E4B851"/> : <><circle cx="60" cy="105" r="9" fill="white" stroke="#24877A" strokeWidth="3"/><circle cx="60" cy="105" r="3" fill="#24877A"/></>}
        <g className="cf-head">
          <rect x="9" y="36" width="14" height="27" rx="7" fill="#24877A"/><rect x="97" y="36" width="14" height="27" rx="7" fill="#24877A"/>
          <rect x="20" y="14" width="80" height="64" rx="28" fill={paint} stroke="#C4D0CC" strokeWidth="1.4"/>
          <rect x="29" y="26" width="62" height="40" rx="18" fill="#173333"/>
          <g className="cf-eyes" fill="#A6F1DF"><ellipse cx="46" cy="46" rx="4.5" ry="6"/><ellipse cx="74" cy="46" rx="4.5" ry="6"/></g>
          <path d="M55 59q5 5 10 0" fill="none" stroke="#9CE5D1" strokeWidth="2" strokeLinecap="round"/>
          <path d="M60 14V3" stroke="#B6C8C3" strokeWidth="4"/><circle cx="60" cy="4" r="4.5" fill="#24877A"/>
          {role === 'support' && <g fill="none" stroke="#344A49" strokeWidth="5"><path d="M15 48V31a45 34 0 0 1 90 0v18"/><path d="M15 51q-3 19 32 13" strokeWidth="3"/><rect x="10" y="35" width="9" height="23" rx="4" fill="#344A49"/><rect x="101" y="35" width="9" height="23" rx="4" fill="#344A49"/></g>}
          {role === 'flagman' && <g fill="#E4B851"><path d="M23 23q3-24 37-24t37 24z"/><rect x="15" y="19" width="90" height="7" rx="3"/></g>}
        </g>
      </g>
    </g>
  )
}

function Desk({ coding }) {
  return <g>
    <path d="M130 245v53m220-53v53" stroke="#B9C9C4" strokeWidth="7" strokeLinecap="round"/>
    <rect x="110" y="232" width="260" height="13" rx="6" fill="#FBFCFA" stroke="#C5D3CE"/>
    <path d="M189 219v12m-18 0h38" stroke="#9BB3AA" strokeWidth="5" strokeLinecap="round"/>
    <rect x="126" y="139" width="129" height="84" rx="8" fill="#344A49"/>
    <rect x="133" y="146" width="115" height="68" rx="3" fill="#183B37"/>
    <g className="cf-screen">
      {coding ? <g strokeWidth="3" strokeLinecap="round"><path d="M143 159h43m-34 11h72m-72 11h54m-63 11h30" stroke="#A1D5C1"/><path d="M196 159h25m-47 33h50" stroke="#DBBC8D"/><path className="cf-code-cursor" d="M180 200v7" stroke="#D8EEE3"/></g> : <g>
        <circle cx="190" cy="170" r="12" fill="#6AAF9E"/><path d="M180 173q10-23 20 0m-20 0v5m20-5v5" stroke="#E4F7EF" strokeWidth="3" fill="none"/>
        {Array.from({length:12},(_,i)=><rect key={i} className="cf-sound" style={{animationDelay: `${i * -0.13}s`}} x={145+i*7.5} y="191" width="3" height={8+i%3*3} rx="1.5" fill="#8ED8BC"/>)}</g>}
    </g>
    <rect x="265" y="225" width="65" height="5" rx="2.5" fill="#9EB6AD"/>
    <path d="M272 224h50" stroke="#D9E4DF" strokeWidth="2" strokeDasharray="3 3"/>
  </g>
}

export default function CareerFallback({ variant }) {
  const id = useId().replaceAll(':', '')
  const paint = `url(#${id}-shell)`
  const isDesk = variant === 'support' || variant === 'coding'
  return <svg className="career-fallback" viewBox="0 0 500 320" focusable="false" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-shell`} x1="0" y1="0" x2="0.8" y2="1"><stop stopColor="#FFFFFF"/><stop offset="1" stopColor="#DFE8E1"/></linearGradient>
      <radialGradient id={`${id}-shadow`}><stop stopColor="#4B6C5D" stopOpacity=".17"/><stop offset="1" stopColor="#4B6C5D" stopOpacity="0"/></radialGradient>
    </defs>
    <ellipse cx="250" cy="291" rx="191" ry="22" fill={`url(#${id}-shadow)`}/>
    {isDesk && <>
      <rect x="273" y="205" width="82" height="62" rx="13" fill="#4E8D7D"/>
      <Bot x={262} y={100} scale={0.9} role={variant === 'support' ? 'support' : 'typing'} paint={paint}/>
      <Desk coding={variant === 'coding'}/>
    </>}
    {variant === 'baggage' && <>
      <Bot x={222} y={68} scale={1.05} paint={paint}/>
      <path d="M95 249v45m310-45v45" stroke="#A7BDB3" strokeWidth="8" strokeLinecap="round"/>
      <rect x="55" y="224" width="390" height="32" rx="16" fill="#B7C9C0"/>
      <rect x="61" y="228" width="378" height="21" rx="10" fill="#344A49"/>
      <path className="cf-belt" d="M65 238h370" stroke="#9EB7AC" strokeWidth="16" strokeDasharray="2 19"/>
      {[0,1,2].map((n)=><g key={n} className="cf-suitcase" style={{animationDelay:`${n * -3.3}s`}}>
        <rect x="-8" y="168" width="21" height="15" rx="4" fill="none" stroke="#344A49" strokeWidth="4"/>
        <rect x="-25" y="181" width="56" height="46" rx="9" fill={['#408D7E','#D79878','#998DB2'][n]}/>
        <path d="M8 183v40" stroke="#E4ECE7" strokeWidth="4"/><rect x="-15" y="194" width="7" height="13" rx="1" fill="#F6F6EF"/>
      </g>)}
    </>}
    {variant === 'flagman' && <>
      <g stroke="#D7AF55" strokeWidth="5" fill="none" strokeLinejoin="round">
        <path d="M107 285V53h26v232m-26-198 26 33-26 33 26 33-26 33 26 33M73 53h259v20H73zm34 0 13-31 13 31m0 0 185 0-185 20"/>
      </g>
      <rect x="96" y="276" width="49" height="13" rx="3" fill="#A8BBAF"/>
      <rect x="125" y="72" width="31" height="29" rx="3" fill="#5F9B88"/>
      <g className="cf-hoist"><path d="M290 72v95" stroke="#455E52" strokeWidth="2"/><rect x="266" y="168" width="47" height="38" rx="3" fill="#C6A77E"/><path d="M276 169v36m27-36v36" stroke="#E6D5B8" strokeWidth="4"/></g>
      <Bot x={145} y={160} scale={0.75} role="flagman" paint={paint}/>
      <Bot x={356} y={192} scale={0.53} paint={paint}/>
      <Bot x={411} y={201} scale={0.47} paint={paint}/>
      <g className="cf-stop"><path d="M274 223v37" stroke="#AE8D60" strokeWidth="4"/><path d="M264 198h20l14 14v20l-14 14h-20l-14-14v-20z" fill="#BD514B" stroke="#FFF9EF" strokeWidth="2"/><text x="274" y="225" textAnchor="middle" fontSize="11" fontFamily="sans-serif" fontWeight="bold" fill="#FFF9EF">STOP</text></g>
      <path d="M326 281l9-24 9 24z" fill="#D9906D"/><path d="M321 283h29" stroke="#4C6758" strokeWidth="4" strokeLinecap="round"/>
    </>}
    {variant === 'classroom' && <>
      <path d="M102 195v90m221-90v90" stroke="#B7C6B9" strokeWidth="6"/>
      <rect x="68" y="57" width="293" height="153" rx="7" fill="#B59A77"/>
      <rect x="76" y="65" width="277" height="137" rx="3" fill="#2B5146"/>
      <text x="95" y="91" fill="#DEEAD7" fontSize="14" fontFamily="sans-serif">Matematik</text>
      <text x="95" y="122" fill="#DEEAD7" fontSize="15" fontFamily="monospace">f(x) = x²</text>
      <path d="M205 180h125m-70 9v-78" stroke="#AECAB4" strokeWidth="1.2"/>
      <path d="M211 121q50 118 99 0" stroke="#E0C687" fill="none" strokeWidth="2.5"/>
      <Bot x={346} y={131} scale={0.90} role="teacher" paint={paint}/>
      <path className="cf-pointer" d="M392 227L290 132" stroke="#BE9B6D" strokeWidth="3" strokeLinecap="round"/>
      <rect x="138" y="230" width="67" height="52" rx="10" fill="#6B9A86"/>
      <Bot x={133} y={155} scale={0.72} role="typing" paint={paint}/>
      <path d="M110 251v43m127-43v43" stroke="#B4C6B9" strokeWidth="5"/>
      <rect x="99" y="241" width="151" height="10" rx="5" fill="#F7FAF4" stroke="#C8D5C9"/>
      <path d="M166 234h42" stroke="#639986" strokeWidth="5"/>
    </>}
  </svg>
}
