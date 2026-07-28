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
