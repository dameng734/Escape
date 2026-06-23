@echo off
setlocal
set "ZIG=%~dp0..\..\.tools\zig\zig-x86_64-windows-0.16.0\zig.exe"
"%ZIG%" c++ -std=c++20 -O3 -DNDEBUG -Wall -Wextra -Werror ^
  "%~dp0..\cpp_pipeline\core.cpp" ^
  "%~dp0..\cpp_pipeline\solver.cpp" ^
  "%~dp0independent_generator.cpp" ^
  -o "%~dp0independent_generator.exe"
exit /b %errorlevel%
