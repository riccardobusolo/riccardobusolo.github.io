function e(e,t){var n=t,r=e,i=function(e){return r.querySelector(e)},a=i(`.ap-pill`),o=i(`.ap-play`),s=i(`.ap-cover`),c=i(`.ap-cover-img`),l=i(`.ap-title`),u=i(`.ap-artist`),d=i(`.ap-cur`),f=i(`.ap-dur`),p=i(`.ap-seek`),m=i(`.ap-vol-slider`),h=i(`.ap-mute`),g=i(`.ap-file`),ee=i(`.ap-eq`),_={get:function(e){try{return JSON.parse(localStorage.getItem(`aeroPlayer:`+e))}catch{return null}},set:function(e,t){try{localStorage.setItem(`aeroPlayer:`+e,JSON.stringify(t))}catch{}}},v=new Audio,y=new Audio;v.crossOrigin=`anonymous`,v.preload=y.preload=`metadata`;var b=v;function x(e,t){[v,y].forEach(function(n){n.addEventListener(e,function(e){n===b&&t(e)})})}function te(e){if(e.noAnalyse||!e.src)return!1;if(/^blob:|^data:/.test(e.src))return!0;try{return new URL(e.src,location.href).protocol!==`file:`}catch{return!1}}var S=n.slice(),C=0,w=!1,T=!1;function E(e){return!isFinite(e)||e<0?`--:--`:(e=Math.floor(e),String(Math.floor(e/60)).padStart(2,`0`)+`:`+String(e%60).padStart(2,`0`))}function D(e,t){C=(e+S.length)%S.length;var n=S[C];if(l.textContent=n.title||`Senza titolo`,l.title=n.title||``,u.textContent=n.artist||``,n.cover?(c.src=n.cover,s.classList.add(`ap-has-img`)):(c.removeAttribute(`src`),s.classList.remove(`ap-has-img`)),k(p,0),d.textContent=`00:00`,f.textContent=`--:--`,T=!!t,n.src){var r=te(n)?v:y;r!==b&&(b.pause(),b=r),b.src=n.src,t&&O()}}function O(){if(T=!0,b.src){b===v&&ie(),W&&W.state===`suspended`&&W.resume();var e=b.play();e&&e.catch&&e.catch(function(){})}}function ne(){b.paused?O():b.pause()}x(`play`,function(){r.classList.add(`ap-playing`),o.setAttribute(`aria-label`,`Pausa`)}),x(`pause`,function(){T=!1,r.classList.remove(`ap-playing`),o.setAttribute(`aria-label`,`Riproduci`)}),x(`loadedmetadata`,function(){f.textContent=E(b.duration)}),x(`timeupdate`,function(){w||(d.textContent=E(b.currentTime),k(p,b.duration?b.currentTime/b.duration:0))}),x(`error`,function(){var e=S[C];b===v&&e&&e.src&&!/^blob:|^data:/.test(e.src)&&(e.noAnalyse=!0,D(C,T))}),x(`ended`,function(){D(C+1,!0),S.length===1&&O()}),o.addEventListener(`click`,ne),i(`.ap-prev`).addEventListener(`click`,function(){b.currentTime>3?b.currentTime=0:D(C-1,!b.paused)}),i(`.ap-next`).addEventListener(`click`,function(){D(C+1,!b.paused)});function k(e,t){return t=Math.max(0,Math.min(1,t)),e.style.setProperty(`--v`,t),e.setAttribute(`aria-valuenow`,Math.round(t*100)),t}function A(e,t,n){var r=e.querySelector(`.ap-track`);function i(e){var t=r.getBoundingClientRect();return Math.max(0,Math.min(1,(e.clientX-t.left)/t.width))}e.addEventListener(`pointerdown`,function(r){if(r.button!==0)return;r.stopPropagation(),r.preventDefault(),e.setPointerCapture(r.pointerId),e.classList.add(`ap-active`),t(k(e,i(r)));function a(n){t(k(e,i(n)))}function o(t){e.classList.remove(`ap-active`),e.removeEventListener(`pointermove`,a),e.removeEventListener(`pointerup`,o),e.removeEventListener(`pointercancel`,o),n&&n(k(e,i(t)))}e.addEventListener(`pointermove`,a),e.addEventListener(`pointerup`,o),e.addEventListener(`pointercancel`,o)}),e.addEventListener(`keydown`,function(r){var i=parseFloat(e.style.getPropertyValue(`--v`))||0,a=r.shiftKey?.1:.02;if(r.key===`ArrowRight`||r.key===`ArrowUp`)i+=a;else if(r.key===`ArrowLeft`||r.key===`ArrowDown`)i-=a;else return;r.preventDefault(),i=k(e,i),t(i),n&&n(i)})}A(p,function(e){w=!0,d.textContent=E(e*(b.duration||0))},function(e){w=!1,b.duration&&(b.currentTime=e*b.duration)});function j(e){v.volume=y.volume=e,v.muted=y.muted=e===0,r.classList.toggle(`ap-muted`,e===0),r.classList.toggle(`ap-vol-low`,e>0&&e<.45),h.setAttribute(`aria-label`,e===0?`Attiva audio`:`Disattiva audio`)}var M=_.get(`vol`),N=typeof M==`number`?M:.7;k(m,N),j(N),A(m,function(e){j(e),e>0&&(N=e)},function(e){_.set(`vol`,e)}),h.addEventListener(`click`,function(){var e=b.muted||b.volume===0?N||.7:0;k(m,e),j(e),_.set(`vol`,e)});function P(e){var t=Array.prototype.filter.call(e,function(e){return/^audio\//.test(e.type)||/\.(mp3|wav|ogg|m4a|aac|flac|opus)$/i.test(e.name)});if(t.length){var n=S.length;t.forEach(function(e){S.push({title:e.name.replace(/\.[^.]+$/,``),artist:`File locale`,src:URL.createObjectURL(e),cover:``})}),D(n,!0)}}s.addEventListener(`click`,function(){g.click()}),g.addEventListener(`change`,function(){P(g.files),g.value=``}),r.addEventListener(`dragover`,function(e){e.dataTransfer&&Array.prototype.indexOf.call(e.dataTransfer.types,`Files`)>-1&&(e.preventDefault(),r.classList.add(`ap-dropping`))}),r.addEventListener(`dragleave`,function(){r.classList.remove(`ap-dropping`)}),r.addEventListener(`drop`,function(e){e.preventDefault(),r.classList.remove(`ap-dropping`),P(e.dataTransfer.files)});var F=_.get(`pos`),I=null;function L(){var e=parseFloat(r.dataset.scale)||1,t=Math.min(e,(window.innerWidth-8)/860);return r.style.setProperty(`--ap-s`,t),t}function re(e,t){var n=r.offsetWidth,i=r.offsetHeight,a=12*L();return{x:Math.max(-a,Math.min(window.innerWidth-n+a,e)),y:Math.max(-a,Math.min(window.innerHeight-i+a,t))}}function R(e,t){F=re(e,t),r.style.transform=`translate(`+F.x+`px,`+F.y+`px)`}function z(){L(),F||={x:6,y:window.innerHeight-r.offsetHeight-6},R(F.x,F.y)}a.addEventListener(`pointerdown`,function(e){e.button!==0||e.target.closest(`button, .ap-slider`)||(e.preventDefault(),I={dx:e.clientX-F.x,dy:e.clientY-F.y},a.setPointerCapture(e.pointerId),r.classList.add(`ap-dragging`))}),a.addEventListener(`pointermove`,function(e){I&&R(e.clientX-I.dx,e.clientY-I.dy)});function B(){I&&(I=null,r.classList.remove(`ap-dragging`),_.set(`pos`,F))}a.addEventListener(`pointerup`,B),a.addEventListener(`pointercancel`,B),a.addEventListener(`dblclick`,function(e){e.target.closest(`button, .ap-slider`)||ne()}),window.addEventListener(`resize`,z),z();var V=[.18,.3,.4,.45,.68,.88,1,.72,.5,.38],H=V.map(function(){var e=document.createElement(`span`);return ee.appendChild(e),e}),U=V.slice(),W=null,G=null,K=null;function ie(){if(!W)try{W=new(window.AudioContext||window.webkitAudioContext);var e=W.createMediaElementSource(v);G=W.createAnalyser(),G.fftSize=1024,G.smoothingTimeConstant=.55,G.minDecibels=-100,G.maxDecibels=-25,K=new Uint8Array(G.frequencyBinCount),e.connect(G),G.connect(W.destination)}catch{G=null}}var q=null,J=.35,Y=V.map(function(){return .2});function ae(){for(var e=H.length,t=W.sampleRate/G.fftSize,n=45,r=11e3,i=[],a=0;a<e;a++){var o=n*(r/n)**+(a/e),s=n*(r/n)**+((a+1)/e),c=Math.max(1,Math.floor(o/t)),l=Math.max(c+1,Math.ceil(s/t));i.push([c,Math.min(l,K.length)])}return i}function X(e){var t=!b.paused,n=t&&G&&b===v,i=null;if(n){G.getByteFrequencyData(K),q||=ae(),i=[];for(var a=0,o=0;o<q.length;o++){for(var s=0,c=q[o],l=c[0];l<c[1];l++)s+=K[l];var u=s/(c[1]-c[0])/255*(1+o*.06);i.push(u),u>a&&(a=u)}J=Math.max(a,J*.993,.12);for(var d=0;d<i.length;d++)Y[d]=Math.max(i[d],Y[d]*.996,.05)}for(var f=0;f<H.length;f++){var p=t?n?.08+.92*(i[f]/(Y[f]*.65+J*.35))**1.4:.25+.6*Math.abs(Math.sin(e/(260+f*37)+f*1.7))*(.6+.4*Math.sin(e/900+f)):V[f]*.55;p=Math.min(1,p),U[f]+=(p-U[f])*(t?p>U[f]?.6:.18:.08),H[f].style.transform=`scaleY(`+U[f].toFixed(3)+`)`}!t&&U.every(function(e,t){return Math.abs(e-V[t]*.55)<.002})||r.hidden?Z=!1:requestAnimationFrame(X)}var Z=!1;function Q(){Z||(Z=!0,requestAnimationFrame(X))}[v,y].forEach(function(e){e.addEventListener(`play`,Q),e.addEventListener(`pause`,Q)}),Q();var $=_.get(`idx`);return D(typeof $==`number`&&$<S.length?$:0,!1),x(`play`,function(){_.set(`idx`,C)}),{pause:function(){b.pause()},layout:z}}var t=null,n=null;function r(r){if(!n){let i=document.createElement(`template`);i.innerHTML=`<div id="aero-player" role="region" aria-label="Lettore musicale" data-scale="0.5">
  <div class="ap-stage">
    <div class="ap-pill" title="Trascina per spostare">

      <!-- sfondo, colline, nuvola -->
      <div class="ap-clip">
        <svg class="ap-cloud" viewBox="0 0 120 50" aria-hidden="true">
          <defs>
            <linearGradient id="apCloudG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#ffffff"/>
              <stop offset="1" stop-color="#dff3ff"/>
            </linearGradient>
          </defs>
          <path fill="url(#apCloudG)" d="M14 46 C2 46 2 30 14 30 C14 18 30 14 37 22 C42 8 64 6 70 20 C78 12 96 16 94 30 C110 28 114 46 100 46 Z"/>
        </svg>

        <svg class="ap-hills" viewBox="0 0 820 200" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="apHillA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#9af2db"/>
              <stop offset="1" stop-color="#4fd2b4"/>
            </linearGradient>
            <linearGradient id="apHillB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#c4fa7e"/>
              <stop offset=".5" stop-color="#83e640"/>
              <stop offset="1" stop-color="#4fc92a"/>
            </linearGradient>
            <linearGradient id="apHillC" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#a6f25e"/>
              <stop offset="1" stop-color="#58cf2c"/>
            </linearGradient>
          </defs>
          <path fill="url(#apHillA)" opacity=".85" d="M0 140 C110 126 220 154 360 148 S610 116 820 132 V200 H0 Z"/>
          <path fill="url(#apHillB)" d="M0 166 C120 150 250 176 420 164 S690 140 820 152 V200 H0 Z"/>
          <path fill="none" stroke="#ffffff" stroke-opacity=".55" stroke-width="2.5" d="M0 166 C120 150 250 176 420 164 S690 140 820 152"/>
          <path fill="url(#apHillC)" opacity=".9" d="M0 186 C170 172 330 190 520 182 S730 170 820 178 V200 H0 Z"/>
        </svg>

        <div class="ap-gloss"></div>
      </div>

      <!-- bolle -->
      <div class="ap-bubbles" aria-hidden="true">
        <i style="--x:175px;--y:8px;--r:16px;--d:0s"></i>
        <i style="--x:212px;--y:31px;--r:5px;--d:1.2s"></i>
        <i style="--x:591px;--y:10px;--r:20px;--d:.6s"></i>
        <i style="--x:558px;--y:16px;--r:6px;--d:2s"></i>
        <i style="--x:536px;--y:24px;--r:3.5px;--d:1.6s"></i>
        <i style="--x:27px;--y:114px;--r:14px;--d:.9s"></i>
        <i style="--x:101px;--y:162px;--r:14px;--d:2.4s"></i>
        <i style="--x:74px;--y:176px;--r:4px;--d:.3s"></i>
        <i style="--x:748px;--y:158px;--r:19px;--d:1.4s"></i>
        <i style="--x:721px;--y:174px;--r:5px;--d:2.8s"></i>
        <i style="--x:791px;--y:112px;--r:5.5px;--d:.2s"></i>
      </div>

      <!-- comandi -->
      <button class="ap-btn ap-prev" type="button" aria-label="Traccia precedente">
        <svg viewBox="0 0 40 40"><path d="M19 10 L19 30 L5 20 Z M34 10 L34 30 L20 20 Z" fill="url(#apIconG)"/></svg>
      </button>

      <button class="ap-btn ap-play" type="button" aria-label="Riproduci">
        <svg class="ap-ico-play" viewBox="0 0 40 40"><path d="M13 8 L32 20 L13 32 Z" fill="#fff"/></svg>
        <svg class="ap-ico-pause" viewBox="0 0 40 40"><rect x="10" y="8" width="7.5" height="24" rx="3.7" fill="#fff"/><rect x="22.5" y="8" width="7.5" height="24" rx="3.7" fill="#fff"/></svg>
      </button>

      <button class="ap-btn ap-next" type="button" aria-label="Traccia successiva">
        <svg viewBox="0 0 40 40">
          <defs>
            <linearGradient id="apIconG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#2aa6e6"/>
              <stop offset="1" stop-color="#0b67ad"/>
            </linearGradient>
          </defs>
          <path d="M6 10 L6 30 L20 20 Z M21 10 L21 30 L35 20 Z" fill="url(#apIconG)"/>
        </svg>
      </button>

      <!-- info traccia -->
      <div class="ap-info">
        <button class="ap-cover" type="button" aria-label="Scegli un file audio" title="Carica un brano dal tuo computer">
          <svg class="ap-cover-svg" viewBox="0 0 60 60" aria-hidden="true">
            <defs>
              <linearGradient id="apSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#2b94e4"/>
                <stop offset="1" stop-color="#c3ebff"/>
              </linearGradient>
              <linearGradient id="apGrass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#a8f25a"/>
                <stop offset="1" stop-color="#3fb827"/>
              </linearGradient>
            </defs>
            <rect width="60" height="60" fill="url(#apSky)"/>
            <path fill="#fff" d="M22 26 C16 26 16 19 22 19 C22 13 31 12 33 17 C36 11 46 13 45 20 C51 20 51 26 46 26 Z"/>
            <path fill="url(#apGrass)" d="M0 44 C14 36 30 38 60 42 V60 H0 Z"/>
            <path fill="#59cc2f" opacity=".7" d="M0 52 C20 46 40 50 60 47 V60 H0 Z"/>
          </svg>
          <img class="ap-cover-img" alt="">
        </button>
        <div class="ap-meta">
          <div class="ap-title">Aero Arcade Radio</div>
          <div class="ap-artist">Premi play</div>
        </div>
        <div class="ap-eq" aria-hidden="true"></div>
      </div>

      <!-- volume -->
      <div class="ap-vol">
        <button class="ap-mute" type="button" aria-label="Disattiva audio">
          <svg viewBox="0 0 32 32">
            <path d="M4 12 H10 L17 6 V26 L10 20 H4 Z" fill="url(#apIconG)"/>
            <path class="ap-w1" d="M21 12.5 C23 14.5 23 17.5 21 19.5" stroke="#1b86c9" stroke-width="2.4" fill="none" stroke-linecap="round"/>
            <path class="ap-w2" d="M24.5 9.5 C28.5 13.5 28.5 18.5 24.5 22.5" stroke="#1b86c9" stroke-width="2.4" fill="none" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="ap-slider ap-vol-slider" role="slider" tabindex="0" aria-label="Volume" aria-valuemin="0" aria-valuemax="100">
          <div class="ap-track"><div class="ap-fill"></div></div>
          <div class="ap-knob"></div>
        </div>
      </div>

      <!-- avanzamento -->
      <div class="ap-time ap-cur">00:00</div>
      <div class="ap-slider ap-seek" role="slider" tabindex="0" aria-label="Avanzamento" aria-valuemin="0" aria-valuemax="100">
        <div class="ap-track"><div class="ap-fill"></div></div>
        <div class="ap-knob"></div>
      </div>
      <div class="ap-time ap-dur">--:--</div>

      <input class="ap-file" type="file" accept="audio/*" multiple hidden>
    </div>
  </div>
</div>`,n=i.content.firstElementChild,document.body.append(n),t=e(n,r)}n.hidden&&(n.hidden=!1,t?.layout())}function i(e=!1){n&&(n.hidden=!0,e&&t?.pause())}export{e as createPlayer,i as hidePlayer,r as showPlayer};