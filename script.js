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

if(chooseBtn){
  chooseBtn.onclick=()=>{
    fileInput.click();
  };
}

// ------------------------------

if(fileInput){
  fileInput.addEventListener("change",e=>{
    const file=e.target.files[0];
    if(!file) return;
    readImage(file);
  });
}

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
  }catch(e){
    showError("No QR Code found.");
  }
}

// ------------------------------

function showError(msg){
  result.style.display="block";
  result.innerHTML=`
  <div class="result-card">
    <div class="result-title">❌ Scan Failed</div>
    <p>${msg}</p>
  </div>
  `;
}

// ===============================
// Camera Scan
// ===============================

if(cameraBtn){
  cameraBtn.onclick = async () => {
    try{
      stream = await navigator.mediaDevices.getUserMedia({
        video:{ facingMode:"environment" }
      });

      const video=document.createElement("video");
      video.autoplay=true;
      video.playsInline=true;
      video.srcObject=stream;

      preview.innerHTML="";
      preview.appendChild(video);

      reader.decodeFromVideoElement(video,(resultObj)=>{
        if(resultObj){
          if(stream){
            stream.getTracks().forEach(track=>track.stop());
          }
          showResult(resultObj.getText());
        }
      });

    }catch(err){
      showError("Camera access denied.");
    }
  };
}

// ===============================
// Paste Image
// ===============================

if(pasteBtn){
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
}

// ===============================
// Smart Result (Safe Upgrade)
// ===============================

function showResult(text){
  result.style.display="block";
  let html="";
  const bytes = new TextEncoder().encode(text).length;

  // 1. Wi-Fi QR Code
  if(text.startsWith("WIFI:")){
    const ssid = text.match(/S:([^;]*)/)?.[1] || "";
    const pass = text.match(/P:([^;]*)/)?.[1] || "";
    const sec = text.match(/T:([^;]*)/)?.[1] || "WPA";

    renderWifiCard(ssid, pass, sec);
    return;
  }

  // 2. Email QR Code
  else if(text.startsWith("mailto:")){
    const emailClean = text.replace("mailto:", "");
    const emailAddr = emailClean.split("?")[0];

    html = `
    <div class="result-card">
      <div class="success-header">
        <i class="fa-solid fa-circle-check"></i>
        <div>
          <div style="font-weight:700; font-size:18px;">Decode Succeeded</div>
          <small style="color:#64748b; font-size:13px;">Email Address Detected</small>
        </div>
      </div>

      <div class="result-box">
        <div class="result-label">EMAIL ADDRESS</div>
        <div class="result-value" style="word-break:break-all; font-weight:700;">${emailAddr}</div>
      </div>

      <div class="result-box">
        <div class="result-label">RAW CONTENT</div>
        <div class="result-value" style="word-break:break-all; font-size:13px; color:#475569;">${emailClean}</div>
      </div>

      <div class="action-grid" style="display:flex; flex-direction:column; gap:8px; margin-top:14px;">
        <a class="action-btn success" href="${text}" style="text-decoration:none; text-align:center;">
          ✉️ Send Email
        </a>
        <button class="action-btn primary" onclick="copyText('${emailAddr}')">
          📋 Copy Email
        </button>
        <button class="action-btn" onclick="shareText('${emailAddr}')">
          📤 Share
        </button>
        <button class="newscan-btn" onclick="newScan()" style="margin-top:4px;">
          🔄 Scan Another QR
        </button>
      </div>
    </div>
    `;
  }

  // 3. Website / URL QR Code
  else if(text.startsWith("http")){
    html = `
    <div class="result-card">
      <div class="success-header">
        <i class="fa-solid fa-circle-check"></i>
        <div>
          <div style="font-weight:700; font-size:18px;">Decode Succeeded</div>
          <small style="color:#64748b; font-size:13px;">Website URL Detected</small>
        </div>
      </div>

      <div class="result-box">
        <div class="result-label">URL</div>
        <div class="result-value" style="word-break:break-all; font-weight:600; color:#2563eb;">${text}</div>
      </div>

      <div class="result-box">
        <div class="result-label">RAW BYTES</div>
        <div class="result-value">${bytes} Bytes</div>
      </div>

      <div class="action-grid" style="display:flex; flex-direction:column; gap:8px; margin-top:14px;">
        <a class="action-btn success" href="${text}" target="_blank" style="text-decoration:none; text-align:center;">
          🌍 Open Link
        </a>
        <button class="action-btn primary" onclick="copyText('${text}')">
          📋 Copy Link
        </button>
        <button class="action-btn" onclick="shareText('${text}')">
          📤 Share
        </button>
        <button class="newscan-btn" onclick="newScan()" style="margin-top:4px;">
          🔄 Scan Another QR
        </button>
      </div>
    </div>
    `;
  }

  // 4. Phone QR Code
  else if(text.startsWith("tel:")){
    const phoneNum = text.replace("tel:", "");
    html = `
    <div class="result-card">
      <div class="success-header">
        <i class="fa-solid fa-circle-check"></i>
        <div>
          <div style="font-weight:700; font-size:18px;">Decode Succeeded</div>
          <small style="color:#64748b; font-size:13px;">Phone Number Detected</small>
        </div>
      </div>

      <div class="result-box">
        <div class="result-label">PHONE NUMBER</div>
        <div class="result-value" style="font-weight:700;">${phoneNum}</div>
      </div>

      <div class="action-grid" style="display:flex; flex-direction:column; gap:8px; margin-top:14px;">
        <a class="action-btn success" href="${text}" style="text-decoration:none; text-align:center;">
          📞 Call Now
        </a>
        <button class="action-btn primary" onclick="copyText('${phoneNum}')">
          📋 Copy Number
        </button>
        <button class="newscan-btn" onclick="newScan()" style="margin-top:4px;">
          🔄 Scan Another QR
        </button>
      </div>
    </div>
    `;
  }

  // 5. Plain Text / Barcode QR Code
  else{
    html = `
    <div class="result-card">
      <div class="success-header">
        <i class="fa-solid fa-circle-check"></i>
        <div>
          <div style="font-weight:700; font-size:18px;">Decode Succeeded</div>
          <small style="color:#64748b; font-size:13px;">Text Data Detected</small>
        </div>
      </div>

      <div class="result-box">
        <div class="result-label">DECODED TEXT</div>
        <div class="result-value" style="word-break:break-all; white-space:pre-wrap;">${text}</div>
      </div>

      <div class="result-box">
        <div class="result-label">RAW BYTES</div>
        <div class="result-value">${bytes} Bytes</div>
      </div>

      <div class="action-grid" style="display:flex; flex-direction:column; gap:8px; margin-top:14px;">
        <button class="action-btn primary" onclick="copyText(\`${text}\`)">
          📋 Copy Text
        </button>
        <button class="action-btn" onclick="shareText(\`${text}\`)">
          📤 Share
        </button>
        <button class="newscan-btn" onclick="newScan()" style="margin-top:4px;">
          🔄 Scan Another QR
        </button>
      </div>
    </div>
    `;
  }

  result.innerHTML = html;
  smoothToResult();
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

// ===== Premium Helpers =====

function showLoading(){
  result.style.display="block";
  result.innerHTML=`
  <div class="loading-box">
    <div class="loading-spinner"></div>
    <p>Decoding QR Code...</p>
  </div>
  `;
}

// New Scan Function (Fixes jump & resets scanner cleanly)
function newScan(){
  if(stream){
    stream.getTracks().forEach(track=>track.stop());
    stream=null;
  }

  preview.innerHTML="";
  result.innerHTML="";
  result.style.display="none";

  if(fileInput) fileInput.value="";

  const scannerSection = document.getElementById("scanner") || document.querySelector(".scanner-card") || document.querySelector(".hero");
  if(scannerSection){
    scannerSection.scrollIntoView({ behavior:"smooth", block:"center" });
  }
}

// Show / Hide Password
function togglePassword(){
  const pass=document.getElementById("wifiPassword");
  const eye=document.getElementById("eyeIcon");

  if(!pass) return;

  if(pass.dataset.show==="1"){
    pass.textContent="••••••••••";
    pass.dataset.show="0";
    eye.className="fa-solid fa-eye eye-btn";
  }else{
    pass.textContent=pass.dataset.password;
    pass.dataset.show="1";
    eye.className="fa-solid fa-eye-slash eye-btn";
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
        <div style="font-weight:700; font-size:18px;">Decode Succeeded</div>
        <small style="color:#64748b;font-size:13px;">Wi-Fi QR Code Detected</small>
      </div>
    </div>

    <!-- Side by Side Network & Security to compact the card height -->
    <div class="wifi-meta-row" style="display:flex; gap:10px; margin-bottom:10px;">
      <div class="result-box" style="flex:1; margin-bottom:0;">
        <div class="result-label">NETWORK NAME</div>
        <div class="result-value" style="font-weight:700;">${ssid}</div>
      </div>

      <div class="result-box" style="flex:1; margin-bottom:0;">
        <div class="result-label">SECURITY</div>
        <div class="result-value">${security || "WPA"}</div>
      </div>
    </div>

    <div class="result-box" style="margin-top:10px;">
      <div class="result-label">PASSWORD</div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:4px;">
        <span id="wifiPassword" class="password-value" data-password="${password}" data-show="0" style="font-weight:700; letter-spacing:1px;">
          ••••••••••
        </span>
        <i id="eyeIcon" class="fa-solid fa-eye eye-btn" style="cursor:pointer; padding:4px;" onclick="togglePassword()"></i>
      </div>
    </div>

    <div class="action-grid" style="display:flex; flex-direction:column; gap:8px; margin-top:14px;">
      <button class="action-btn primary" onclick="copyText('${password}')">
        📋 Copy Password
      </button>

      <button class="action-btn success" onclick="shareText('Wi-Fi Network: ${ssid}\\nPassword: ${password}')">
        📤 Share
      </button>

      <button class="newscan-btn" onclick="newScan()" style="margin-top:4px;">
        🔄 Scan Another QR
      </button>
    </div>

  </div>
  `;

  smoothToResult();
}

// ===== Share Helper =====

function shareText(text){
  if(navigator.share){
    navigator.share({
      title: 'ZXing Decoder',
      text: text,
      url: window.location.href
    }).catch(()=>{});
  }else{
    copyText(text);
    showToast("Details copied to clipboard!");
  }
}

// ===== Smooth Scroll Helper =====

function smoothToResult(){
  result.scrollIntoView({
    behavior:"smooth",
    block:"center"
  });
}
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if (menuToggle && mainNav) {

menuToggle.addEventListener("click", () => {

const isOpen = mainNav.classList.toggle("show");

menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");

menuToggle.querySelector("i").className =
isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";

});

mainNav.querySelectorAll("a").forEach(link => {

link.addEventListener("click", () => {

mainNav.classList.remove("show");

menuToggle.setAttribute("aria-expanded", "false");

menuToggle.querySelector("i").className = "fa-solid fa-bars";

});

});

}
