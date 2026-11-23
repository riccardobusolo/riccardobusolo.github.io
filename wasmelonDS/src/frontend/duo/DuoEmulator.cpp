// Aero Arcade — due Nintendo DS nella stessa pagina, collegati con il wireless
// locale di melonDS (LocalMP). Ogni console gira nel suo thread: il wireless del
// DS ha tempi strettissimi, e due thread dello stesso processo si parlano senza
// ritardi. La pagina chiede un fotogramma a entrambe, poi legge schermi e audio.
#include <emscripten/emscripten.h>
#include <emscripten/bind.h>
#include <cstring>
#include <ctime>
#include <string>
#include <codecvt>
#include <unistd.h>
#include <locale>
#include "DuoEmulator.h"
#include "LocalMP.h"
#include "FreeBIOS.h"
#include "NDSCart.h"
#include "SPI_Firmware.h"
#include "GPU.h"
#include "SPU.h"
#include "GPU3D_Soft.h"
#include "Savestate.h"
#include "ARCodeFile.h"
#include <sstream>

using namespace melonDS;

namespace duo {
  LocalMP& localMP() {
    static LocalMP mp;
    return mp;
  }

  class DuoEmulator {
  public:
    Instance inst[2];
    std::string names[2] = { "Player1", "Player2" };

    DuoEmulator() {
      for (int i = 0; i < 2; i++) {
        inst[i].id = i;
        inst[i].nds = new NDS({}, &inst[i]);
      }
    }
    ~DuoEmulator() {
      for (auto& in : inst) {
        in.quit = true;
        in.go.release();
        if (in.thread.joinable()) in.thread.join();
        delete in.nds;
      }
    }

    void setNickname(int i, std::string n) { if (i >= 0 && i < 2) names[i] = n; }
    bool threaded3D = true;
    // opzioni per le prove: 3D su thread separato, attesa massima dei pacchetti wireless (ms)
    void setOptions(bool t3d, int recvTimeout, int p) { pace = p; threaded3D = t3d; if (recvTimeout > 0) localMP().SetRecvTimeout(recvTimeout); }

    Firmware makeFirmware(int i) {
      Firmware fw(0);
      // indirizzo MAC diverso per ogni console (come fa melonDS con più istanze)
      auto& h = fw.GetHeader();
      MacAddress mac = h.MacAddr;
      if (i > 0) { mac[3] += i; mac[4] += i * 0x44; mac[5] += i * 0x10; }
      mac[0] &= 0xFC;
      h.MacAddr = mac;
      h.UpdateChecksum();
      std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t> conv;
      std::u16string nick = conv.from_bytes(names[i]);
      if (nick.size() > 10) nick.resize(10);
      for (auto& ud : fw.GetUserData()) {
        memset(ud.Nickname, 0, sizeof(ud.Nickname));
        memcpy(ud.Nickname, nick.data(), nick.size() * sizeof(char16_t));
        ud.NameLength = (u16)nick.size();
      }
      fw.UpdateChecksums();
      return fw;
    }

    static void setClock(NDS* nds) {
      std::time_t t = std::time(nullptr);
      std::tm* l = std::localtime(&t);
      nds->RTC.SetDateTime(l->tm_year, l->tm_mon + 1, l->tm_mday, l->tm_hour, l->tm_min, l->tm_sec);
    }

    // ROM e salvataggio arrivano dalla pagina (copiati nella memoria con malloc)
    bool loadRom(int i, uintptr_t romPtr, int romLen, uintptr_t savePtr, int saveLen) {
      if (i < 0 || i > 1) return false;
      NDS* nds = inst[i].nds;
      nds->SetARM7BIOS(bios_arm7_bin);
      nds->SetARM9BIOS(bios_arm9_bin);
      nds->SetFirmware(makeFirmware(i));
      nds->SPI.GetPowerMan()->SetBatteryLevelOkay(true);
      auto cart = NDSCart::ParseROM((const u8*)romPtr, (u32)romLen, &inst[i]);
      if (!cart) return false;
      nds->SetNDSCart(std::move(cart));
      if (savePtr && saveLen > 0) nds->SetNDSSave((const u8*)savePtr, (u32)saveLen);
      nds->Reset();
      // 3D in un thread a parte per ogni console: le due console non si rubano tempo
      if (auto* soft = dynamic_cast<SoftRenderer*>(&nds->GetRenderer3D())) soft->SetThreaded(threaded3D, nds->GPU);
      nds->SetupDirectBoot("game");
      setClock(nds);
      return true;
    }

    void start() {
      for (auto& in : inst) {
        if (in.thread.joinable()) continue;
        in.nds->Start();
        Instance* p = &in;
        in.thread = std::thread([p]() { runLoop(p); });
      }
    }

    // Ogni console gira di continuo al suo ritmo (60 fotogrammi al secondo), come
    // in melonDS sul PC. Se si fermassero tra un fotogramma e l'altro, la console
    // che ospita la partita aspetterebbe invano le risposte dell'altra (che sta
    // ferma) e il collegamento rallenterebbe tutto.
    static inline std::atomic<int> pace{1};
    // velocità (avanti veloce): 1 = normale, 0 = senza limite
    static inline std::atomic<float> speed{1};
    // pausa di entrambe le console (la pagina aspetta isHeld prima di salvare/caricare)
    static inline std::atomic<bool> holdReq{false};

    // trucchi Action Replay: codici separati da '|', parole esadecimali separate da spazi
    static void applyCheats(NDS* nds, const std::string& all) {
      std::vector<ARCode> list;
      std::stringstream ss(all);
      std::string one;
      while (std::getline(ss, one, '|')) {
        ARCode code; code.Name = "aero"; code.Enabled = true;
        std::stringstream ws(one);
        std::string w;
        while (ws >> w) {
          char* end = nullptr;
          unsigned long v = strtoul(w.c_str(), &end, 16);
          if (end && *end == 0 && w.size() <= 8) code.Code.push_back((u32)v);
        }
        if (!code.Code.empty() && code.Code.size() % 2 == 0) list.push_back(std::move(code));
      }
      nds->AREngine.Cheats = std::move(list);
    }
    static void runLoop(Instance* in) {
      in->go.acquire(); // partenza
      double next = emscripten_get_now();
      const double period = 1000.0 / 59.8261; // frequenza vera del DS
      while (!in->quit) {
        NDS* nds = in->nds;
        if (holdReq) {
          in->parked = true;
          while (holdReq && !in->quit) usleep(2000);
          in->parked = false;
          next = emscripten_get_now();
          continue;
        }
        if (in->resetReq.exchange(false)) {
          nds->Reset();
          nds->SetupDirectBoot("game");
          setClock(nds);
        }
        if (in->cheatsReq.exchange(false)) {
          std::lock_guard<std::mutex> g(in->cheatLock);
          applyCheats(nds, in->cheats);
        }
        nds->SetKeyMask(~in->keys.load() & 0xfff);
        if (in->touching) {
          u32 xy = in->touchXY;
          nds->TouchScreen((u16)(xy & 0xffff), (u16)(xy >> 16));
        } else nds->ReleaseScreen();
        double t0 = emscripten_get_now();
        nds->RunFrame();
        in->lastMs = (float)(emscripten_get_now() - t0);
        {
          std::lock_guard<std::mutex> g(in->fbLock);
          auto& gpu = nds->GPU;
          memcpy(in->top, gpu.Framebuffer[gpu.FrontBuffer][0].get(), 256 * 192 * 4);
          memcpy(in->btm, gpu.Framebuffer[gpu.FrontBuffer][1].get(), 256 * 192 * 4);
          int want = nds->SPU.GetOutputSize();
          s16 tmp[4096 * 2];
          if (want > 4096) want = 4096;
          int got = nds->SPU.ReadOutput(tmp, want);
          // accodo l'audio (la pagina lo raccoglie quando vuole)
          u32 have = in->audioSamples;
          if (have + got > 4096) have = 0;
          memcpy(in->audio + have * 2, tmp, got * 2 * sizeof(s16));
          in->audioSamples = have + got;
        }
        in->frames++;
        // ritmo: aspetto il prossimo fotogramma; se resto molto indietro riparto da adesso
        float sp = speed.load();
        next += sp > 0 ? period / sp : 0;
        double now = emscripten_get_now();
        if (!pace || sp <= 0) next = now;
        else if (next - now > 0) usleep((useconds_t)((next - now) * 1000));
        else if (now - next > period * 4) next = now;
      }
    }

    // un fotogramma a entrambe le console, insieme (se la precedente ha finito)
    int frame() {
      int started = 0;
      for (auto& in : inst) if (!in.busy.exchange(true)) { in.go.release(); started++; }
      return 1;
    }

    void setKeys(int i, int mask) { inst[i & 1].keys = (u32)mask; }
    void touch(int i, int x, int y) { inst[i & 1].touchXY = (u32)(x & 0xffff) | ((u32)(y & 0xffff) << 16); inst[i & 1].touching = true; }
    void release(int i) { inst[i & 1].touching = false; }

    // copia gli schermi (ARGB per il canvas) nel buffer della pagina
    int readScreens(int i, uintptr_t dst) {
      Instance& in = inst[i & 1];
      u32* out = (u32*)dst;
      std::lock_guard<std::mutex> g(in.fbLock);
      for (int k = 0; k < 256 * 192; k++) {
        u32 c = in.top[k];
        out[k] = (c & 0xff00ff00) | ((c & 0xff) << 16) | ((c >> 16) & 0xff);
        u32 d = in.btm[k];
        out[256 * 192 + k] = (d & 0xff00ff00) | ((d & 0xff) << 16) | ((d >> 16) & 0xff);
      }
      return (int)in.frames.load();
    }
    int readAudio(int i, uintptr_t dst) {
      Instance& in = inst[i & 1];
      std::lock_guard<std::mutex> g(in.fbLock);
      u32 n = in.audioSamples;
      memcpy((void*)dst, in.audio, n * 2 * sizeof(s16));
      in.audioSamples = 0;
      return (int)n;
    }
    int saveSize(int i) { std::lock_guard<std::mutex> g(inst[i & 1].saveLock); return (int)inst[i & 1].save.size(); }
    bool saveDirty(int i) { return inst[i & 1].saveDirty.load(); }
    int readSave(int i, uintptr_t dst) {
      Instance& in = inst[i & 1];
      std::lock_guard<std::mutex> g(in.saveLock);
      memcpy((void*)dst, in.save.data(), in.save.size());
      in.saveDirty = false;
      return (int)in.save.size();
    }
    void hold(bool on) { holdReq = on; }
    // vero quando entrambe le console (avviate) sono ferme tra due fotogrammi
    bool isHeld() {
      if (!holdReq) return false;
      for (auto& in : inst) if (in.thread.joinable() && !in.parked) return false;
      return true;
    }
    void setSpeed(float s) { speed = s; }
    void reset(int i) { inst[i & 1].resetReq = true; }
    void setCheats(int i, std::string codes) {
      Instance& in = inst[i & 1];
      { std::lock_guard<std::mutex> g(in.cheatLock); in.cheats = codes; }
      in.cheatsReq = true;
    }
    // stati salvati: solo a console ferme (hold + isHeld)
    int saveState(int i) {
      Instance& in = inst[i & 1];
      Savestate s(16 * 1024 * 1024);
      if (s.Error) return 0;
      if (!in.nds->DoSavestate(&s)) return 0;
      s.Finish();
      if (s.Error) return 0;
      const u8* b = (const u8*)s.Buffer();
      in.state.assign(b, b + s.Length());
      return (int)in.state.size();
    }
    int readState(int i, uintptr_t dst) {
      Instance& in = inst[i & 1];
      memcpy((void*)dst, in.state.data(), in.state.size());
      int n = (int)in.state.size();
      in.state.clear(); in.state.shrink_to_fit();
      return n;
    }
    bool loadState(int i, uintptr_t ptr, int len) {
      Instance& in = inst[i & 1];
      Savestate s((void*)ptr, (u32)len, false);
      if (s.Error) return false;
      bool ok = in.nds->DoSavestate(&s);
      return ok && !s.Error;
    }
    int framesDone(int i) { return (int)inst[i & 1].frames.load(); }
    float frameMs(int i) { return inst[i & 1].lastMs.load(); }
  };
}

EMSCRIPTEN_BINDINGS(DuoEmulator) {
  emscripten::class_<duo::DuoEmulator>("DuoEmulator")
    .constructor()
    .function("setNickname", &duo::DuoEmulator::setNickname)
    .function("setOptions", &duo::DuoEmulator::setOptions)
    .function("loadRom", &duo::DuoEmulator::loadRom)
    .function("start", &duo::DuoEmulator::start)
    .function("frame", &duo::DuoEmulator::frame)
    .function("setKeys", &duo::DuoEmulator::setKeys)
    .function("touch", &duo::DuoEmulator::touch)
    .function("release", &duo::DuoEmulator::release)
    .function("readScreens", &duo::DuoEmulator::readScreens)
    .function("readAudio", &duo::DuoEmulator::readAudio)
    .function("saveSize", &duo::DuoEmulator::saveSize)
    .function("saveDirty", &duo::DuoEmulator::saveDirty)
    .function("readSave", &duo::DuoEmulator::readSave)
    .function("hold", &duo::DuoEmulator::hold)
    .function("isHeld", &duo::DuoEmulator::isHeld)
    .function("setSpeed", &duo::DuoEmulator::setSpeed)
    .function("reset", &duo::DuoEmulator::reset)
    .function("setCheats", &duo::DuoEmulator::setCheats)
    .function("saveState", &duo::DuoEmulator::saveState)
    .function("readState", &duo::DuoEmulator::readState)
    .function("loadState", &duo::DuoEmulator::loadState)
    .function("framesDone", &duo::DuoEmulator::framesDone)
    .function("frameMs", &duo::DuoEmulator::frameMs);
}
