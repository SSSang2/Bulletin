cmake_minimum_required(VERSION 3.8)
project(routes)

set(CMAKE_CXX_STANDARD 11)

set(SOURCE_FILES
        products.js)

add_executable(routes ${SOURCE_FILES})