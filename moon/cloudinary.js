/* ============================================================
 * CROOKED MOON — Cloudinary photo upload helper
 * ============================================================
 *
 * Esposto come window.cmCloud:
 *   cmCloud.upload(input) → Promise<{url, publicId, bytes, format}>
 *     - input può essere: Blob, File, o stringa data URL base64
 *     - se input è già un URL Cloudinary, ritorna {url:input, publicId:null}
 *   cmCloud.isCloudUrl(s) → boolean
 *   cmCloud.isDataUrl(s)  → boolean
 *   cmCloud.isConfigured() → boolean
 *
 * Le credenziali sono pubbliche per design (unsigned upload preset).
 * La sicurezza dipende dalle restrizioni del preset stesso (formati
 * ammessi, dimensione max) — vedi console Cloudinary → Settings →
 * Upload → preset "crooked_moon".
 * ============================================================ */
(function(){
'use strict';

var CLOUD_NAME = 'dxepwrped';
var UPLOAD_PRESET = 'crooked_moon';
var UPLOAD_URL = 'https://api.cloudinary.com/v1_1/' + CLOUD_NAME + '/image/upload';
var UPLOAD_TIMEOUT_MS = 60000;

var CLOUD_URL_RX = /^https:\/\/res\.cloudinary\.com\//;
var DATA_URL_RX = /^data:image\//;

function isCloudUrl(s){return typeof s==='string' && CLOUD_URL_RX.test(s);}
function isDataUrl(s){return typeof s==='string' && DATA_URL_RX.test(s);}
function isConfigured(){return !!CLOUD_NAME && !!UPLOAD_PRESET;}

function dataUrlToBlob(dataUrl){
  var parts = dataUrl.split(',');
  if(parts.length<2) throw new Error('Invalid data URL');
  var meta = parts[0];
  var b64 = parts[1];
  var m = meta.match(/data:([^;]+)/);
  var mime = m ? m[1].replace(/;.*$/,'') : 'application/octet-stream';
  var bin = atob(b64);
  var n = bin.length;
  var arr = new Uint8Array(n);
  for(var i=0;i<n;i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], {type:mime});
}

function upload(input){
  return new Promise(function(resolve, reject){
    if(!isConfigured()){reject(new Error('Cloudinary non configurato')); return;}
    var blob;
    try{
      if(typeof input === 'string'){
        if(isCloudUrl(input)){resolve({url:input, publicId:null, bytes:null, format:null}); return;}
        if(!isDataUrl(input)){reject(new Error('Stringa non riconosciuta come data URL o URL Cloudinary')); return;}
        blob = dataUrlToBlob(input);
      } else if(input && (input instanceof Blob || (typeof File !== 'undefined' && input instanceof File))){
        blob = input;
      } else {
        reject(new Error('Input deve essere Blob, File o data URL')); return;
      }
    } catch(e){ reject(e); return; }

    var fd = new FormData();
    fd.append('file', blob);
    fd.append('upload_preset', UPLOAD_PRESET);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', UPLOAD_URL, true);
    xhr.timeout = UPLOAD_TIMEOUT_MS;
    xhr.onload = function(){
      if(xhr.status >= 200 && xhr.status < 300){
        try{
          var res = JSON.parse(xhr.responseText);
          if(res && res.secure_url){
            resolve({url:res.secure_url, publicId:res.public_id||null, bytes:res.bytes||null, format:res.format||null});
          } else {
            reject(new Error('Risposta Cloudinary inattesa: '+xhr.responseText.slice(0,200)));
          }
        } catch(e){ reject(e); }
      } else {
        reject(new Error('Upload fallito ('+xhr.status+'): '+xhr.responseText.slice(0,200)));
      }
    };
    xhr.onerror = function(){ reject(new Error('Errore di rete durante upload Cloudinary')); };
    xhr.ontimeout = function(){ reject(new Error('Timeout upload Cloudinary (>'+UPLOAD_TIMEOUT_MS+'ms)')); };
    xhr.send(fd);
  });
}

window.cmCloud = {
  upload: upload,
  isCloudUrl: isCloudUrl,
  isDataUrl: isDataUrl,
  isConfigured: isConfigured,
  cloudName: CLOUD_NAME,
  preset: UPLOAD_PRESET
};
})();
