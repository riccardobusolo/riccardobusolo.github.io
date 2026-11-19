#pragma once
#include <thread>
#include <atomic>
#include <mutex>
#include <semaphore>
#include <vector>
#include "NDS.h"

namespace duo {
  struct Instance {
    int id = 0;
    melonDS::NDS* nds = nullptr;
    std::thread thread;
    std::binary_semaphore go{0};
    std::atomic<bool> busy{false};
    std::atomic<bool> quit{false};
    std::atomic<melonDS::u32> keys{0};
    std::atomic<bool> touching{false};
    std::atomic<melonDS::u32> touchXY{0};
    std::mutex fbLock;
    melonDS::u32 top[256 * 192] {};
    melonDS::u32 btm[256 * 192] {};
    melonDS::s16 audio[4096 * 2] {};
    std::atomic<melonDS::u32> audioSamples{0};
    std::mutex saveLock;
    std::vector<melonDS::u8> save;
    std::atomic<bool> saveDirty{false};
    std::atomic<melonDS::u32> frames{0};
    std::atomic<float> lastMs{0};
  };
}
