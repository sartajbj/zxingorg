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

// ===== Wi-Fi Result Upgrade (Compact UX) =====

function renderWifiCard(ssid, password, security){
  result.style.display = "block";
 
  result.innerHTML = `
  <div class="result-card compact-card">

    <!-- Compact Header -->
    <div class="success-header" style="margin-bottom: 12px; padding-bottom: 8px;">
      <i class="fa-solid fa-circle-check" style="font-size: 20px;"></i>
      <div>
        <div style="font-weight:700; font-size:16px; line-height: 1.2;">Decode Succeeded</div>
        <small style="color:#64748b; font-size:12px;">Wi-Fi QR Code Detected</small>
      </div>
    </div>

    <!-- Side-by-Side Compact Meta Box -->
    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
      <div class="result-box" style="flex: 2; padding: 8px 12px; margin: 0;">
        <div class="result-label" style="font-size: 10px; margin-bottom: 2px;">NETWORK NAME</div>
        <div class="result-value" style="font-weight:700; font-size: 14px;">${ssid}</div>
      </div>

      <div class="result-box" style="flex: 1; padding: 8px 12px; margin: 0;">
        <div class="result-label" style="font-size: 10px; margin-bottom: 2px;">SECURITY</div>
        <div class="result-value" style="font-size: 13px;">${security || "WPA"}</div>
      </div>
    </div>

    <!-- Password Box -->
    <div class="result-box" style="padding: 8px 12px; margin-bottom: 12px;">
      <div class="result-label" style="font-size: 10px; margin-bottom: 2px;">PASSWORD</div>
      <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
        <span id="wifiPassword" class="password-value" data-password="${password}" data-show="0" style="font-weight:700; font-size: 15px; letter-spacing:1px;">
          ••••••••••
        </span>
        <i id="eyeIcon" class="fa-solid fa-eye eye-btn" style="cursor:pointer; padding:4px; font-size: 14px;" onclick="togglePassword()"></i>
      </div>
    </div>

    <!-- Compact Action Grid -->
    <div class="action-grid-compact" style="display: flex; gap: 6px; flex-wrap: wrap;">
      <button class="action-btn primary" onclick="copyText('${password}')" style="flex: 1; min-width: 120px;">
        📋 Copy Password
      </button>

          <button class="action-btn success" onclick="shareText('Wi-Fi Network: ${ssid}\nPassword: ${password}')">
        📲 Share
    </button>

    <!-- ZXing Site Share Widget -->
    <div style="margin: 10px 0; padding: 10px; border-top: 1px dashed #cbd5e1; border-bottom: 1px dashed #cbd5e1; text-align: center; background-color: #f8fafc; border-radius: 10px; width: 100%;">
        <div style="font-size: 12px; margin-bottom: 2px;">⭐⭐⭐⭐⭐</div>
        <div style="font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 8px;">Loved this tool?</div>
        <button type="button" onclick="if(navigator.share){navigator.share({title:'ZXing Org',text:'Decode QR codes instantly!',url:window.location.origin});}else{navigator.clipboard.writeText(window.location.origin);alert('Link copied!');}" style="background: #2563eb; color: #ffffff; border: none; padding: 8px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;">
            🌐 Share ZXing Org
        </button>
    </div>

    <button class="action-btn secondary" onclick="newScan()" style="flex: 1;">
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
