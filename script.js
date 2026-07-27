/* ==========================
ZXingOrg v1.0
========================== */

const fileInput = document.getElementById("fileInput");
const chooseFileBtn = document.getElementById("chooseFileBtn");
const previewWrapper = document.getElementById("previewWrapper");
const previewImage = document.getElementById("previewImage");
const uploadArea = document.getElementById("uploadArea");
const pasteBtn = document.getElementById("pasteBtn");

/* Choose Image */

chooseFileBtn.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", loadImage);

/* Load Image */

function loadImage(e){

const file=e.target.files[0];

if(!file) return;

const reader=new FileReader();

reader.onload=function(event){

previewImage.src=event.target.result;

previewWrapper.classList.remove("hidden");

}

reader.readAsDataURL(file);

}

/* Drag & Drop */

["dragenter","dragover"].forEach(eventName=>{

uploadArea.addEventListener(eventName,e=>{

e.preventDefault();

uploadArea.style.borderColor="#2563eb";

});

});

["dragleave","drop"].forEach(eventName=>{

uploadArea.addEventListener(eventName,e=>{

e.preventDefault();

uploadArea.style.borderColor="#cbd5e1";

});

});

uploadArea.addEventListener("drop",e=>{

const file=e.dataTransfer.files[0];

if(!file) return;

const reader=new FileReader();

reader.onload=function(event){

previewImage.src=event.target.result;

previewWrapper.classList.remove("hidden");

}

reader.readAsDataURL(file);

});

/* Paste Image */

document.addEventListener("paste",async(e)=>{

const items=e.clipboardData.items;

for(const item of items){

if(item.type.indexOf("image")!==-1){

const blob=item.getAsFile();

const reader=new FileReader();

reader.onload=function(event){

previewImage.src=event.target.result;

previewWrapper.classList.remove("hidden");

}

reader.readAsDataURL(blob);

}

}

});

pasteBtn.addEventListener("click",()=>{

alert("Press Ctrl + V to paste a QR image.");

});
/* ==========================
ZXing Decoder Engine
========================== */

const codeReader = new ZXing.BrowserMultiFormatReader();

const resultCard = document.getElementById("resultCard");
const resultType = document.getElementById("resultType");
const decodedText = document.getElementById("decodedText");
const copyBtn = document.getElementById("copyBtn");

async function decodeImage(file){

    try{

        const imageUrl = URL.createObjectURL(file);

        const result = await codeReader.decodeFromImageUrl(imageUrl);

        resultCard.classList.remove("hidden");

        decodedText.value = result.text;

        resultType.innerText = result.getBarcodeFormat();

        URL.revokeObjectURL(imageUrl);

    }catch(err){

        resultCard.classList.remove("hidden");

        resultType.innerText="No QR Code Found";

        decodedText.value="Unable to decode this image.";

    }

}

/* File Upload */

fileInput.addEventListener("change",(e)=>{

    const file=e.target.files[0];

    if(file){

        decodeImage(file);

    }

});

/* Copy */

copyBtn.addEventListener("click",()=>{

    navigator.clipboard.writeText(decodedText.value);

    copyBtn.innerText="Copied ✓";

    setTimeout(()=>{

        copyBtn.innerText="Copy Result";

    },2000);

});
