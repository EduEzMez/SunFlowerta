const API="https://api.kaspa.org/info/price?stringOnly=true"

let prices=[]

const chart=LightweightCharts.createChart(document.getElementById("chart"),{

layout:{
background:{color:"#231F20"},
textColor:"#B6B6B6"
},

grid:{
vertLines:{color:"#333"},
horzLines:{color:"#333"}
}

})

const series=chart.addLineSeries({

color:"#70C7BA",
lineWidth:2

})


async function getPrice(){

const res=await fetch(API)

const data=await res.json()

const price=parseFloat(data.price)

update(price)

}


function update(price){

document.getElementById("price").innerText="$"+price.toFixed(5)

prices.push(price)

if(prices.length>200){

prices.shift()

}

series.update({

time:Math.floor(Date.now()/1000),
value:price

})

analyze()

}


function EMA(period){

if(prices.length<period) return 0

let k=2/(period+1)

let ema=prices[0]

for(let i=1;i<prices.length;i++){

ema=prices[i]*k + ema*(1-k)

}

return ema

}


function RSI(){

if(prices.length<14) return 50

let gains=0
let losses=0

for(let i=prices.length-14;i<prices.length;i++){

let diff=prices[i]-prices[i-1]

if(diff>0) gains+=diff
else losses-=diff

}

let rs=gains/losses

return 100-(100/(1+rs))

}


function MACD(){

const ema12=EMA(12)
const ema26=EMA(26)

return ema12-ema26

}


function ATR(){

let sum=0

for(let i=1;i<prices.length;i++){

sum+=Math.abs(prices[i]-prices[i-1])

}

return sum/prices.length

}


function fibonacci(){

const high=Math.max(...prices)
const low=Math.min(...prices)

const diff=high-low

return {

support:high-diff*0.618,

resistance:high-diff*0.382

}

}


function analyze(){

if(prices.length<50) return

const price=prices[prices.length-1]

const ema20=EMA(20)
const ema50=EMA(50)

const rsi=RSI()

const macd=MACD()

const atr=ATR()

const fib=fibonacci()

document.getElementById("rsi").innerText=rsi.toFixed(2)

document.getElementById("macd").innerText=macd.toFixed(5)

let trend="Neutral"

if(ema20>ema50) trend="Bullish"

if(ema20<ema50) trend="Bearish"

document.getElementById("trend").innerText=trend


let signal="WAIT"

let advice=""


if(trend==="Bullish" && rsi<40 && price<fib.support){

signal="BUY"

const target=price+atr*8
const stop=price-atr*4

advice=`

<b>Entrada:</b> ${price.toFixed(5)} <br>
<b>Objetivo:</b> ${target.toFixed(5)} <br>
<b>Stop Loss:</b> ${stop.toFixed(5)}

`

alert("📈 BUY SIGNAL")

}


else if(trend==="Bearish" && rsi>60 && price>fib.resistance){

signal="SELL"

const buyBack=price-atr*8

advice=`

<b>Venta:</b> ${price.toFixed(5)} <br>
<b>Recompra:</b> ${buyBack.toFixed(5)}

`

alert("📉 SELL SIGNAL")

}


const box=document.getElementById("signalBox")

box.innerText=signal

box.className=""

if(signal==="BUY") box.classList.add("buy")

if(signal==="SELL") box.classList.add("sell")

document.getElementById("advisor").innerHTML=advice

}


setInterval(getPrice,60000)

getPrice()