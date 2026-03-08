const priceElement = document.getElementById("price")
const trendElement = document.getElementById("trend")
const rsiElement = document.getElementById("rsi")
const macdElement = document.getElementById("macd")
const signalElement = document.getElementById("signalBox")
const advisorElement = document.getElementById("advisor")

let prices = []

const apis = [

{
name:"CoinGecko",
url:"https://api.coingecko.com/api/v3/simple/price?ids=kaspa&vs_currencies=usd",
parse:data=>data.kaspa.usd
},

{
name:"CoinPaprika",
url:"https://api.coinpaprika.com/v1/tickers/kas-kaspa",
parse:data=>data.quotes.USD.price
},

{
name:"MEXC",
url:"https://api.mexc.com/api/v3/ticker/price?symbol=KASUSDT",
parse:data=>parseFloat(data.price)
},

{
name:"Gate.io",
url:"https://api.gateio.ws/api/v4/spot/tickers?currency_pair=KAS_USDT",
parse:data=>parseFloat(data[0].last)
}

]

async function fetchPrice(){

for(let api of apis){

try{

const res = await fetch(api.url)

if(!res.ok) continue

const data = await res.json()

const price = api.parse(data)

if(price){

console.log("API usada:",api.name)

document.getElementById("apiSource").innerText = api.name

updatePrice(price)

return

}

}catch(err){

console.log("Error con",api.name)

}

}

console.log("Todas las APIs fallaron")

}

function updatePrice(price){

priceElement.innerText="$"+price.toFixed(6)

prices.push(price)

if(prices.length>200){

prices.shift()

}

calculateIndicators()

}

function EMA(period){

if(prices.length<period) return 0

let k = 2/(period+1)

let ema = prices[0]

for(let i=1;i<prices.length;i++){

ema = prices[i]*k + ema*(1-k)

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

const ema12 = EMA(12)
const ema26 = EMA(26)

return ema12-ema26

}

function ATR(){

let sum=0

for(let i=1;i<prices.length;i++){

sum += Math.abs(prices[i]-prices[i-1])

}

return sum/prices.length

}

function fibonacci(){

const high = Math.max(...prices)
const low = Math.min(...prices)

const diff = high-low

return {

support: high-diff*0.618,
resistance: high-diff*0.382

}

}

function calculateIndicators(){

if(prices.length<30) return

const price = prices[prices.length-1]

const ema20 = EMA(20)
const ema50 = EMA(50)

const rsi = RSI()

const macd = MACD()

const atr = ATR()

const fib = fibonacci()

rsiElement.innerText=rsi.toFixed(2)

macdElement.innerText=macd.toFixed(5)

let trend="Neutral"

if(ema20>ema50) trend="Bullish"
if(ema20<ema50) trend="Bearish"

trendElement.innerText=trend

generateSignal(price,rsi,trend,atr,fib)

}

function generateSignal(price,rsi,trend,atr,fib){

let signal="WAIT"

let advice=""

if(trend==="Bullish" && rsi<40 && price<fib.support){

signal="BUY"

let target = price + atr*8
let stop = price - atr*4

advice = `
Entrada: ${price.toFixed(6)}<br>
Objetivo: ${target.toFixed(6)}<br>
Stop Loss: ${stop.toFixed(6)}
`

}

else if(trend==="Bearish" && rsi>60 && price>fib.resistance){

signal="SELL"

let rebuy = price - atr*8

advice = `
Venta: ${price.toFixed(6)}<br>
Recompra: ${rebuy.toFixed(6)}
`

}

signalElement.innerText=signal

signalElement.className=""

if(signal==="BUY") signalElement.classList.add("buy")
if(signal==="SELL") signalElement.classList.add("sell")

advisorElement.innerHTML=advice

}

setInterval(fetchPrice,60000)

fetchPrice()