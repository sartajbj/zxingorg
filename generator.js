const input = document.getElementById("qrInput");
const button = document.getElementById("generateBtn");
const preview = document.getElementById("qrPreview");

button.addEventListener("click", () => {

const value = input.value.trim();

if (!value) {
alert("Please enter text or URL.");
return;
}

preview.innerHTML = "";

new QRCode(preview, {
text: value,
width: 260,
height: 260,
correctLevel: QRCode.CorrectLevel.H
});

setTimeout(() => {

const img = preview.querySelector("img") || preview.querySelector("canvas");

if (!img) return;

const download = document.createElement("a");

download.className = "primary-btn";
download.style.marginTop = "20px";
download.style.display = "inline-flex";

download.innerHTML = "⬇ Download PNG";

if (img.tagName === "IMG") {

download.href = img.src;

} else {

download.href = img.toDataURL("image/png");

}

download.download = "qr-code.png";

preview.appendChild(download);

}, 200);

});
