# Aero Arcade: due DS nello stesso browser, collegati con il wireless locale di melonDS
project(DuoEmulator)

add_executable(duo
  DuoEmulator.cpp
  DuoPlatform.cpp
  WasmPlatformUtil.cpp
  ${CMAKE_CURRENT_SOURCE_DIR}/../../net/LocalMP.cpp
)
target_include_directories(duo PUBLIC "${CMAKE_CURRENT_SOURCE_DIR}" "${CMAKE_CURRENT_SOURCE_DIR}/.." "${CMAKE_CURRENT_SOURCE_DIR}/../.." "${CMAKE_CURRENT_SOURCE_DIR}/../../net")
target_compile_options(duo PRIVATE -pthread -O3)
set_target_properties(duo PROPERTIES CXX_STANDARD 20 CXX_STANDARD_REQUIRED ON SUFFIX ".js")
set_target_properties(duo PROPERTIES LINK_FLAGS "-lembind -pthread -O3 -sPTHREAD_POOL_SIZE=8 -sINITIAL_MEMORY=512MB -sMODULARIZE=1 -sEXPORT_NAME=createDuo -sENVIRONMENT=web,worker -sEXPORTED_RUNTIME_METHODS=HEAPU8,HEAP16,HEAPU32 -sEXPORTED_FUNCTIONS=_malloc,_free -sSTACK_SIZE=1MB -sDEFAULT_PTHREAD_STACK_SIZE=1MB")
target_link_libraries(duo PRIVATE core)
