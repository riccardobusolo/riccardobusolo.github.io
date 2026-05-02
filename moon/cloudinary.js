/* ============================================================
 * CROOKED MOON — Cloudinary asset upload helper
 * ============================================================
 *
 * Esposto come window.cmCloud:
 *   cmCloud.upload(input, opts?) → Promise<{url, publicId, bytes, format, resourceType}>
 *     - input: Blob | File | stringa data URL | stringa URL Cloudinary (no-op)
 *     - opts.resourceType: 'image' (default) | 'video' (audio incluso) | 'auto' | 'raw'
 *   cmCloud.uploadAuto(input) → Promise — alias con resourceType:'auto'
 *   cmCloud.isCloudUrl(s) → boolean
 *   cmCloud.isDataUrl(s)  → boolean (data URL di un'immagine)
 *   cmCloud.isConfigured() → boolean
 *
 * Le credenziali sono pubbliche per design (unsigned upload preset).
 * Il preset "crooked_moon" deve avere "Resource type" impostato su
 * "auto" o accettare image+video — altrimenti gli upload audio
 * falliscono. La sicurezza dipende dalle restrizioni del preset
 * (formati, dimensione max) — vedi console Cloudinary.
 * ============================================================ */
(function(){
'use strict';

var CLOUD_NAME = 'dxepwrped';
var UPLOAD_PRESET = 'crooked_moon';
var UPLOAD_TIMEOUT_MS = 120000;

/* Limiti hard di Cloudinary per il piano Free. Servono come guardrail
   per non sprecare il roundtrip e per dare un messaggio chiaro all'utente
   prima dell'errore generico del server. */
var LIMITS = {
  image: 10 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  raw:   10 * 1024 * 1024,
  auto: 100 * 1024 * 1024
};

var CLOUD_URL_RX = /^https:\/\/res\.cloudinary\.com\//;
var DATA_URL_RX = /^data:image\//;

function fmtBytes(b){
  if(!b&&b!==0)return '?';
  if(b<1024)return b+' B';
  if(b<1024*1024)return (b/1024).toFixed(1)+' KB';
  return (b/1024/1024).toFixed(1)+' MB';
}

function isCloudUrl(s){return typeof s==='string' && CLOUD_URL_RX.test(s);}
function isDataUrl(s){return typeof s==='string' && DATA_URL_RX.test(s);}
function isConfigured(){return !!CLOUD_NAME && !!UPLOAD_PRESET;}

function endpointFor(resourceType){
  return 'https://api.cloudinary.com/v1_1/' + CLOUD_NAME + '/' + resourceType + '/upload';
}

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

function upload(input, opts){
  opts = opts || {};
  var resourceType = opts.resourceType || 'image';
  var srcName = (input && typeof input === 'object' && input.name) ? input.name : '';
  return new Promise(function(resolve, reject){
    if(!isConfigured()){reject(new Error('Cloudinary non configurato')); return;}
    var blob;
    try{
      if(typeof input === 'string'){
        if(isCloudUrl(input)){resolve({url:input, publicId:null, bytes:null, format:null, resourceType:resourceType}); return;}
        if(!isDataUrl(input)){reject(new Error('Stringa non riconosciuta come data URL o URL Cloudinary')); return;}
        blob = dataUrlToBlob(input);
      } else if(input && (input instanceof Blob || (typeof File !== 'undefined' && input instanceof File))){
        blob = input;
      } else {
        reject(new Error('Input deve essere Blob, File o data URL')); return;
      }
    } catch(e){ reject(e); return; }

    /* Pre-check dimensione: blocchiamo prima del POST se il blob (già
       compresso lato client) supera il limite Cloudinary. Marchiamo
       l'errore con cmTooBig=true così i caller possono distinguerlo
       da una failure di rete e mostrare un alert dedicato. */
    var limit = LIMITS[resourceType] || LIMITS.image;
    if(blob.size > limit){
      var kind = resourceType === 'video' ? 'audio' : 'immagine';
      var label = srcName ? '"'+srcName+'" ('+kind+')' : 'Il file '+kind;
      var err = new Error(label+' è troppo grande: '+fmtBytes(blob.size)+' (max '+fmtBytes(limit)+' su Cloudinary). Riduci risoluzione o qualità e riprova.');
      err.cmTooBig = true;
      err.actualBytes = blob.size;
      err.maxBytes = limit;
      err.resourceType = resourceType;
      reject(err);
      return;
    }

    var fd = new FormData();
    fd.append('file', blob);
    fd.append('upload_preset', UPLOAD_PRESET);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', endpointFor(resourceType), true);
    xhr.timeout = UPLOAD_TIMEOUT_MS;
    xhr.onload = function(){
      if(xhr.status >= 200 && xhr.status < 300){
        try{
          var res = JSON.parse(xhr.responseText);
          if(res && res.secure_url){
            resolve({url:res.secure_url, publicId:res.public_id||null, bytes:res.bytes||null, format:res.format||null, resourceType:res.resource_type||resourceType});
          } else {
            reject(new Error('Risposta Cloudinary inattesa: '+xhr.responseText.slice(0,200)));
          }
        } catch(e){ reject(e); }
      } else {
        reject(new Error('Upload fallito ('+xhr.status+', '+resourceType+'): '+xhr.responseText.slice(0,300)));
      }
    };
    xhr.onerror = function(){ reject(new Error('Errore di rete durante upload Cloudinary')); };
    xhr.ontimeout = function(){ reject(new Error('Timeout upload Cloudinary (>'+UPLOAD_TIMEOUT_MS+'ms)')); };
    xhr.send(fd);
  });
}

function uploadAuto(input){return upload(input, {resourceType:'auto'});}

window.cmCloud = {
  upload: upload,
  uploadAuto: uploadAuto,
  isCloudUrl: isCloudUrl,
  isDataUrl: isDataUrl,
  isConfigured: isConfigured,
  cloudName: CLOUD_NAME,
  preset: UPLOAD_PRESET,
  limits: LIMITS,
  fmtBytes: fmtBytes
};
})();
