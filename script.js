// ===============================
// ZXing Online Decoder
// Script.js Part 1
// ===============================

const fileInput=document.getElementById("fileInput");
const chooseBtn=document.getElementById("chooseFileBtn");
const cameraBtn=document.getElementById("cameraBtn");
const pasteBtn=document.getElementById("pasteBtn");

const preview=document.getElementById("preview");
const result=document.getElementById("result");

const reader=new ZXing.BrowserMultiFormatReader();

let stream=null;

// ------------------------------

chooseBtn.onclick=()=>{

fileInput.click();

};

// ------------------------------

fileInput.addEventListener("change",e=>{

const file=e.target.files[0];

if(!file) return;

readImage(file);

});

// ------------------------------

function readImage(file){

preview.innerHTML="";
result.style.display="none";

const img=document.createElement("img");

img.src=URL.createObjectURL(file);

img.onload=()=>{

preview.innerHTML="";

preview.appendChild(img);

decodeImage(img);

};

}

// ------------------------------

async function decodeImage(img){

try{

const scan=await reader.decodeFromImageElement(img);

showResult(scan.text);

}

catch(e){

showError("No QR Code found.");

}

}

// ------------------------------

function showError(msg){

result.style.display="block";

result.innerHTML=`

<div class="result-card">

<div class="result-title">

❌ Scan Failed

</div>

<p>${msg}</p>

</div>

`;

}
// ===============================
// Camera Scan
// ===============================

cameraBtn.onclick = async () => {

try{

stream = await navigator.mediaDevices.getUserMedia({
video:{
facingMode:"environment"
}
});

const video=document.createElement("video");

video.autoplay=true;
video.playsInline=true;
video.srcObject=stream;

preview.innerHTML="";
preview.appendChild(video);

reader.decodeFromVideoElement(video,(resultObj)=>{

if(resultObj){

stream.getTracks().forEach(track=>track.stop());

showResult(resultObj.getText());

}

});

}catch(err){

showError("Camera access denied.");

}

};

// ===============================
// Paste Image
// ===============================

pasteBtn.onclick=async()=>{

try{

const items=await navigator.clipboard.read();

for(const item of items){

for(const type of item.types){

if(type.startsWith("image/")){

const blob=await item.getType(type);

readImage(blob);

return;

}

}

}

showError("Clipboard has no image.");

}catch(e){

showError("Clipboard permission denied.");

}

};

// ===============================
// Smart Result
// ===============================

function showResult(text){

result.style.display="block";

let html="";

if(text.startsWith("WIFI:")){

const ssid=text.match(/S:([^;]*)/)?.[1]||"";
const pass=text.match(/P:([^;]*)/)?.[1]||"";
const sec=text.match(/T:([^;]*)/)?.[1]||"";

html=`

<div class="result-card">

<div class="result-title">📶 Wi-Fi QR</div>

<p><strong>Network:</strong> ${ssid}</p>

<p><strong>Password:</strong> <b>${pass}</b></p>

<p><strong>Security:</strong> ${sec}</p>

<button class="copy-btn"
onclick="navigator.clipboard.writeText('${pass}')">
Copy Password
</button>

</div>

`;

}

else if(text.startsWith("http")){

html=`

<div class="result-card">

<div class="result-title">🌐 Website</div>

<p>${text}</p>

<a class="copy-btn"
href="${text}"
target="_blank">
Open Website
</a>

</div>

`;

}

else if(text.startsWith("mailto:")){

html=`

<div class="result-card">

<div class="result-title">📧 Email</div>

<p>${text.replace("mailto:","")}</p>

</div>

`;

}

else if(text.startsWith("tel:")){

html=`

<div class="result-card">

<div class="result-title">📞 Phone</div>

<p>${text.replace("tel:","")}</p>

</div>

`;

}

else{

html=`

<div class="result-card">

<div class="result-title">QR Result</div>

<p>${text}</p>

<button class="copy-btn"
onclick="navigator.clipboard.writeText(\`${text}\`)">
Copy Result
</button>

</div>

`;

}

result.innerHTML=html;

}
// ===== Premium Toast =====

function showToast(message){

const old=document.getElementById("toast");

if(old) old.remove();

const toast=document.createElement("div");

toast.id="toast";

toast.innerHTML="✅ "+message;

toast.style.cssText=`
position:fixed;
left:50%;
bottom:25px;
transform:translateX(-50%);
background:#16a34a;
color:#fff;
padding:14px 22px;
border-radius:12px;
font-weight:700;
z-index:99999;
box-shadow:0 10px 30px rgba(0,0,0,.2);
`;

document.body.appendChild(toast);

setTimeout(()=>{
toast.remove();
},2200);

}

// ===== Copy =====

function copyText(text){

navigator.clipboard.writeText(text);

showToast("Copied Successfully");

}
// ===== Premium Result Card =====

function renderResult(type,text){

let bytes=new TextEncoder().encode(text).length;

result.innerHTML=`

<div class="result-card">

<div class="success-header">

<i class="fa-solid fa-circle-check"></i>

<div>

<div>Decode Succeeded</div>

<small style="color:#64748b;font-size:14px;">QR Code decoded successfully</small>

</div>

</div>

<div class="result-box">
<div class="result-label">TYPE</div>
<div class="result-value">${type}</div>
</div>

<div class="result-box">
<div class="result-label">RAW TEXT</div>
<div class="result-value">${text}</div>
</div>

<div class="result-box">
<div class="result-label">RAW BYTES</div>
<div class="result-value">${bytes} Bytes</div>
</div>

<div class="action-grid">

<button class="action-btn primary"
onclick="copyText(\`${text}\`)">

📋 Copy

</button>

<button class="action-btn success"
onclick="navigator.share ? navigator.share({text:'${text}'}) : copyText(\`${text}\`)">

📤 Share

</button>

</div>

</div>

`;

result.style.display="block";

}

// ===== Smart Result Upgrade =====

const oldRenderResult = renderResult;

renderResult = function(type, text){

// 🌐 Website
if(text.startsWith("http://") || text.startsWith("https://")){

const bytes=new TextEncoder().encode(text).length;

result.innerHTML=`

<div class="result-card">

<div class="success-header">
<i class="fa-solid fa-circle-check"></i>
<div>
<div>Decode Succeeded</div>
<small>Website Detected</small>
</div>
</div>

<div class="result-box">
<div class="result-label">WEBSITE</div>
<div class="result-value">${text}</div>
</div>

<div class="result-box">
<div class="result-label">RAW BYTES</div>
<div class="result-value">${bytes} Bytes</div>
</div>

<div class="action-grid">

<a class="action-btn success"
href="${text}"
target="_blank">

🌍 Open

</a>

<button class="action-btn primary"
onclick="copyText('${text}')">

📋 Copy

</button>

</div>

</div>

`;

result.style.display="block";
return;

}

// 📶 Wi-Fi
if(text.startsWith("WIFI:")){

const ssid=text.match(/S:([^;]*)/)?.[1]||"";
const pass=text.match(/P:([^;]*)/)?.[1]||"";
const sec=text.match(/T:([^;]*)/)?.[1]||"";

result.innerHTML=`

<div class="result-card">

<div class="success-header">
<i class="fa-solid fa-circle-check"></i>
<div>
<div>Decode Succeeded</div>
<small>Wi-Fi QR Detected</small>
</div>
</div>

<div class="result-box">
<div class="result-label">NETWORK</div>
<div class="result-value">${ssid}</div>
</div>

<div class="result-box">
<div class="result-label">PASSWORD</div>
<div class="result-value"><strong style="color:#dc2626;font-size:18px;">${pass}</strong></div>
</div>

<div class="result-box">
<div class="result-label">SECURITY</div>
<div class="result-value">${sec}</div>
</div>

<div class="action-grid">

<button class="action-btn primary"
onclick="copyText('${pass}')">

📋 Copy Password

</button>

<button class="action-btn success"
onclick="navigator.share && navigator.share({text:'Wi-Fi: ${ssid}\nPassword: ${pass}'})">

📤 Share

</button>

</div>

</div>

`;

result.style.display="block";
return;

}

// Other QR types
oldRenderResult(type,text);

};
// ===== Premium Helpers =====

// Loading
function showLoading(){

result.style.display="block";

result.innerHTML=`

<div class="loading-box">

<div class="loading-spinner"></div>

<p>Decoding QR Code...</p>

</div>

`;

}

// New Scan
function newScan(){

preview.innerHTML="";

result.innerHTML="";

result.style.display="none";

fileInput.value="";

}

// Show / Hide Password
function togglePassword(){

const pass=document.getElementById("wifiPassword");

const eye=document.getElementById("eyeIcon");

if(!pass) return;

if(pass.dataset.show==="1"){

pass.textContent="••••••••••";

pass.dataset.show="0";

eye.className="fa-solid fa-eye";

}else{

pass.textContent=pass.dataset.password;

pass.dataset.show="1";

eye.className="fa-solid fa-eye-slash";

}

}
// ===== Wi-Fi Result Upgrade =====

function renderWifiCard(ssid,password,security){

result.style.display="block";

result.innerHTML=`

<div class="result-card">

<div class="success-header">
<i class="fa-solid fa-circle-check"></i>
<div>
<div>Decode Succeeded</div>
<small>Wi-Fi QR Code Detected</small>
</div>
</div>

<div class="result-box">
<div class="result-label">NETWORK NAME</div>
<div class="result-value">${ssid}</div>
</div>

<div class="result-box">
<div class="result-label">PASSWORD</div>

<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">

<span id="wifiPassword"
class="password-value"
data-password="${password}"
data-show="0">

••••••••••

</span>

<i id="eyeIcon"
class="fa-solid fa-eye eye-btn"
onclick="togglePassword()"></i>

</div>

</div>

<div class="result-box">
<div class="result-label">SECURITY</div>
<div class="result-value">${security}</div>
</div>

<div class="action-grid">

<button class="action-btn primary"
onclick="copyText('${password}')">

📋 Copy Password

</button>

<button class="action-btn success"
onclick="navigator.share && navigator.share({
title:'Wi-Fi',
text:'Network: ${ssid}\nPassword: ${password}'
})">

📤 Share

</button>

</div>

<button
class="newscan-btn"
onclick="newScan()">

🔄 Scan Another QR

</button>

</div>

`;

}

