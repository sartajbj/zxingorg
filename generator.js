// ================================
// ZXingOrg Generator.js
// Part 1 / 3
// ================================

const typeButtons = document.querySelectorAll(".type-btn");
const dynamicFields = document.getElementById("dynamicFields");
const generateBtn = document.getElementById("generateBtn");
const qrPreview = document.getElementById("qrPreview");
const downloadArea = document.getElementById("downloadArea");

let currentType = "text";

function setFields(type){

currentType = type;

switch(type){

case "text":

dynamicFields.innerHTML=`

<input
type="text"
id="qrInput"
placeholder="Enter your text">

`;

break;

case "url":

dynamicFields.innerHTML=`

<input
type="url"
id="qrInput"
placeholder="https://example.com">

`;

break;

case "wifi":

dynamicFields.innerHTML=`

<input
type="text"
id="wifiSSID"
placeholder="Wi-Fi Name (SSID)">

<input
type="password"
id="wifiPassword"
placeholder="Password">

<select id="wifiSecurity">

<option value="WPA">WPA/WPA2</option>

<option value="WEP">WEP</option>

<option value="">Open Network</option>

</select>

`;

break;

}

}

typeButtons.forEach(btn=>{

btn.addEventListener("click",()=>{

typeButtons.forEach(x=>x.classList.remove("active"));

btn.classList.add("active");

setFields(btn.dataset.type);

});

});

setFields("text");

function buildQRText(){

if(currentType==="text"){

return document.getElementById("qrInput").value.trim();

}

if(currentType==="url"){

return document.getElementById("qrInput").value.trim();

}

if(currentType==="wifi"){

const ssid=document.getElementById("wifiSSID").value.trim();

const pass=document.getElementById("wifiPassword").value.trim();

const security=document.getElementById("wifiSecurity").value;

return `WIFI:T:${security};S:${ssid};P:${pass};;`;

}

return "";

}
// ================================
// ZXingOrg Generator.js
// Part 2 / 3
// Paste BELOW Part 1
// ================================

generateBtn.addEventListener("click", generateQR);

function generateQR(){

const qrText = buildQRText();

if(!qrText){

alert("Please fill all required fields.");

return;

}

if(currentType==="wifi"){

const ssid=document.getElementById("wifiSSID").value.trim();

if(ssid===""){

alert("Wi-Fi Name (SSID) is required.");

return;

}

}

qrPreview.innerHTML="";

downloadArea.innerHTML="";

new QRCode(qrPreview,{

text:qrText,

width:260,

height:260,

colorDark:"#111827",

colorLight:"#ffffff",

correctLevel:QRCode.CorrectLevel.H

});

setTimeout(()=>{

showDownloadButton();

},200);

}

function showDownloadButton(){

const canvas=qrPreview.querySelector("canvas");

const img=qrPreview.querySelector("img");

if(!canvas && !img){

return;

}

const downloadBtn=document.createElement("a");

downloadBtn.className="primary-btn";

downloadBtn.style.marginTop="20px";

downloadBtn.innerHTML='<i class="fa-solid fa-download"></i> Download PNG';

downloadBtn.download="zxingorg-qr-code.png";

if(canvas){

downloadBtn.href=canvas.toDataURL("image/png");

}else{

downloadBtn.href=img.src;

}

downloadArea.appendChild(downloadBtn);

const copyBtn=document.createElement("button");

copyBtn.className="secondary-btn";

copyBtn.style.marginLeft="12px";

copyBtn.innerHTML='<i class="fa-solid fa-copy"></i> Copy Data';

copyBtn.addEventListener("click",copyQRData);

downloadArea.appendChild(copyBtn);

}
// ================================
// ZXingOrg Generator.js
// Part 3 / 3
// Paste BELOW Part 2
// ================================

function copyQRData() {

const text = buildQRText();

navigator.clipboard.writeText(text).then(() => {

const copyBtn = document.querySelector(".secondary-btn");

if (copyBtn) {

const old = copyBtn.innerHTML;

copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';

setTimeout(() => {

copyBtn.innerHTML = old;

}, 1800);

}

}).catch(() => {

alert("Unable to copy.");

});

}

// Press Enter to Generate
document.addEventListener("keydown", (e) => {

if (e.key === "Enter") {

generateQR();

}

});

// Auto focus first field after changing type
function focusInput() {

const first = dynamicFields.querySelector("input");

if (first) {

first.focus();

}

}

typeButtons.forEach(btn => {

btn.addEventListener("click", () => {

setTimeout(focusInput, 80);

});

});

// Initial focus
focusInput();

// Clear old QR when typing
dynamicFields.addEventListener("input", () => {

qrPreview.innerHTML = "";

downloadArea.innerHTML = "";

});

// ================================
// End of generator.js
// ================================
