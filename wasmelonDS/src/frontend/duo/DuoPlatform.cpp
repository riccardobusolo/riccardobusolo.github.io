// Piattaforma melonDS per il browser: file (MEMFS), thread (pthread), e il
// multiplayer locale (LocalMP) tra le due console della stessa pagina.
#include <emscripten/emscripten.h>
#include <thread>
#include <semaphore>
#include <mutex>
#include <chrono>
#include <unistd.h>
#include <cstdio>
#include <cstdarg>
#include <cstring>
#include "WasmPlatformUtil.h"
#include "DuoEmulator.h"
#include "LocalMP.h"
#include "Platform.h"

namespace duo { melonDS::LocalMP& localMP(); }

namespace melonDS::Platform {
  static int inst(void* ud) { return ud ? ((duo::Instance*)ud)->id : 0; }

  void SignalStop(StopReason reason, void* userdata) { Log(LogLevel::Error, "Stop %d (console %d)\n", (int)reason, inst(userdata)); }
  std::string GetLocalFilePath(const std::string& filename) { return filename; }
  FileHandle* OpenFile(const std::string& path, FileMode mode) {
    return (FileHandle*)fopen(path.c_str(), wasmelon::get_file_mode_str(mode, wasmelon::does_file_exist(path)).c_str());
  }
  FileHandle* OpenLocalFile(const std::string& path, FileMode mode) { return OpenFile(path, mode); }
  bool FileExists(const std::string& name) { return wasmelon::does_file_exist(name); }
  bool LocalFileExists(const std::string& name) { return FileExists(name); }
  bool CheckFileWritable(const std::string& name) { if (FILE* f = fopen(name.c_str(), "a")) { fclose(f); return true; } return false; }
  bool CheckLocalFileWritable(const std::string& name) { return CheckFileWritable(name); }
  bool CloseFile(FileHandle* file) { return fclose((FILE*)file) == 0; }
  bool IsEndOfFile(FileHandle* file) { return feof((FILE*)file); }
  bool FileReadLine(char* str, int count, FileHandle* file) { return fgets(str, count, (FILE*)file) != nullptr; }
  bool FileSeek(FileHandle* file, s64 offset, FileSeekOrigin origin) { return fseek((FILE*)file, offset, (int)origin) == 0; }
  void FileRewind(FileHandle* file) { rewind((FILE*)file); }
  u64 FileRead(void* data, u64 size, u64 count, FileHandle* file) { return fread(data, size, count, (FILE*)file); }
  bool FileFlush(FileHandle* file) { return fflush((FILE*)file) == 0; }
  u64 FileWrite(const void* data, u64 size, u64 count, FileHandle* file) { return fwrite(data, size, count, (FILE*)file); }
  u64 FileWriteFormatted(FileHandle* file, const char* fmt, ...) {
    if (!fmt) return 0; va_list a; va_start(a, fmt); u64 r = vfprintf((FILE*)file, fmt, a); va_end(a); return r;
  }
  u64 FileLength(FileHandle* file) { long p = ftell((FILE*)file); fseek((FILE*)file, 0, SEEK_END); u64 s = ftell((FILE*)file); fseek((FILE*)file, p, SEEK_SET); return s; }
  void Log(LogLevel level, const char* fmt, ...) { if (!fmt) return; va_list a; va_start(a, fmt); vprintf(fmt, a); va_end(a); }

  Thread* Thread_Create(std::function<void()> func) { return (Thread*)new std::thread(func); }
  void Thread_Free(Thread* t) { auto* th = (std::thread*)t; if (th->joinable()) th->detach(); delete th; }
  void Thread_Wait(Thread* t) { ((std::thread*)t)->join(); }

  using sem_t2 = std::counting_semaphore<0x7fffffff>;
  Semaphore* Semaphore_Create() { return (Semaphore*)new sem_t2(0); }
  void Semaphore_Free(Semaphore* s) { delete (sem_t2*)s; }
  void Semaphore_Reset(Semaphore* s) { while (((sem_t2*)s)->try_acquire()) {} }
  void Semaphore_Wait(Semaphore* s) { ((sem_t2*)s)->acquire(); }
  bool Semaphore_TryWait(Semaphore* s, int timeout_ms) {
    if (timeout_ms <= 0) return ((sem_t2*)s)->try_acquire();
    return ((sem_t2*)s)->try_acquire_for(std::chrono::milliseconds(timeout_ms));
  }
  void Semaphore_Post(Semaphore* s, int count) { ((sem_t2*)s)->release(count); }

  Mutex* Mutex_Create() { return (Mutex*)new std::mutex(); }
  void Mutex_Free(Mutex* m) { delete (std::mutex*)m; }
  void Mutex_Lock(Mutex* m) { ((std::mutex*)m)->lock(); }
  void Mutex_Unlock(Mutex* m) { ((std::mutex*)m)->unlock(); }
  bool Mutex_TryLock(Mutex* m) { return ((std::mutex*)m)->try_lock(); }

  void Sleep(u64 usecs) { usleep((useconds_t)usecs); }
  u64 GetMSCount() { return (u64)emscripten_get_now(); }
  u64 GetUSCount() { return (u64)(emscripten_get_now() * 1000.0); }

  void WriteNDSSave(const u8* savedata, u32 savelen, u32, u32, void* userdata) {
    auto* in = (duo::Instance*)userdata; if (!in) return;
    std::lock_guard<std::mutex> g(in->saveLock);
    in->save.assign(savedata, savedata + savelen);
    in->saveDirty = true;
  }
  void WriteGBASave(const u8*, u32, u32, u32, void*) {}
  void WriteFirmware(const Firmware&, u32, u32, void*) {}
  void WriteDateTime(int, int, int, int, int, int, void*) {}

  // ---- multiplayer locale: le due console si parlano dentro la stessa pagina
  void MP_Begin(void* ud) { duo::localMP().Begin(inst(ud)); }
  void MP_End(void* ud) { duo::localMP().End(inst(ud)); }
  int MP_SendPacket(u8* d, int len, u64 ts, void* ud) { return duo::localMP().SendPacket(inst(ud), d, len, ts); }
  int MP_RecvPacket(u8* d, u64* ts, void* ud) { return duo::localMP().RecvPacket(inst(ud), d, ts); }
  int MP_SendCmd(u8* d, int len, u64 ts, void* ud) { return duo::localMP().SendCmd(inst(ud), d, len, ts); }
  int MP_SendReply(u8* d, int len, u64 ts, u16 aid, void* ud) { return duo::localMP().SendReply(inst(ud), d, len, ts, aid); }
  int MP_SendAck(u8* d, int len, u64 ts, void* ud) { return duo::localMP().SendAck(inst(ud), d, len, ts); }
  int MP_RecvHostPacket(u8* d, u64* ts, void* ud) { return duo::localMP().RecvHostPacket(inst(ud), d, ts); }
  u16 MP_RecvReplies(u8* d, u64 ts, u16 mask, void* ud) { return duo::localMP().RecvReplies(inst(ud), d, ts, mask); }

  int Net_SendPacket(u8*, int, void*) { return 0; }
  int Net_RecvPacket(u8*, void*) { return 0; }
  void Camera_Start(int, void*) {}
  void Camera_Stop(int, void*) {}
  void Camera_CaptureFrame(int, u32*, int, int, bool, void*) {}
  void Addon_RumbleStart(u32, void*) {}
  void Addon_RumbleStop(void*) {}
  DynamicLibrary* DynamicLibrary_Load(const char*) { return nullptr; }
  void DynamicLibrary_Unload(DynamicLibrary*) {}
  void* DynamicLibrary_LoadFunction(DynamicLibrary*, const char*) { return nullptr; }
}
