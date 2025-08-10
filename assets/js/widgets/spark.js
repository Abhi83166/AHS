// minimal sparkline renderer using Chart.js if available; falls back to canvas lines
export function sparkline(canvas, data) {
  if (window.Chart) {
    new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: { labels: data.map((_,i)=>i), datasets: [{ data, borderColor: '#60a5fa', backgroundColor: 'rgba(96,165,250,.15)', fill: true, tension: .35 }] },
      options: { plugins: { legend: { display:false } }, scales: { x:{ display:false }, y:{ display:false } }, elements: { point: { radius: 0 } }, maintainAspectRatio:false, responsive:true }
    });
    return;
  }
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.clientWidth; const h = canvas.height = canvas.clientHeight;
  ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 1.5; ctx.beginPath();
  const min = Math.min(...data), max = Math.max(...data); const range = (max - min) || 1;
  data.forEach((v,i)=>{
    const x = i/(data.length-1) * w; const y = h - ((v-min)/range) * h;
    if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();
}
