# C-Math Plotter

An interactive function plotter powered by a cross-platform C math engine.

[![C](https://img.shields.io/badge/C-00599C?style=for-the-badge&logo=c&logoColor=white)](https://en.cppreference.com/w/c)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111111)](https://developer.mozilla.org/docs/Web/JavaScript)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit-46A546?style=for-the-badge)](https://c-math-plotter.onrender.com)

## Live Demo

**[Open C-Math Plotter](https://c-math-plotter.onrender.com)**

The free Render instance may take about 30 seconds to wake up on the first load.

## Overview

C-Math Plotter combines a hand-written recursive-descent math parser in C with a responsive browser-based graphing interface. The C HTTP server serves the frontend and calculates function values without requiring a separate web server.

### Key Features

- Cross-platform HTTP server using Winsock on Windows and POSIX sockets on Linux.
- Mathematical expression parser with implicit multiplication, such as `2x`, `3sin(x)`, and `(x+1)(x-1)`.
- Numerical evaluation of `f(x)` and its derivative `f'(x)`.
- Definite integral computed with composite Simpson's rule.
- Interactive HiDPI Canvas with zoom, drag-to-pan, curve hover coordinates, and a dashed derivative curve.
- Collapsible on-screen math keyboard with cursor-aware insertion.
- PNG graph export, responsive dark dashboard, and backend connection status.
- Serves the frontend and `/plot` JSON API from the same server.

## Supported Math Syntax

| Category | Syntax | Example / Notes |
| --- | --- | --- |
| Addition | `+` | `x + 2` |
| Subtraction and unary signs | `-`, unary `+` | `x - 2`, `-x` |
| Multiplication | `*` or implicit | `2*x`, `2x`, `3sin(x)`, `(x+1)(x-1)` |
| Division | `/` | `x/2` |
| Exponentiation | `^` | `x^2`, `2^3` |
| Grouping | `( )` | `(x+1)^2` |
| Variable | `x`, `X` | The input value at the selected x-coordinate |
| Constants | `pi`, `e` | π and Euler's number |
| Trigonometry | `sin(x)`, `cos(x)`, `tan(x)` | Arguments are in radians |
| Roots and absolute value | `sqrt(x)`, `abs(x)` | Square root and absolute value |
| Logarithms | `ln(x)`, `log(x)` | Natural logarithm and base-10 logarithm |
| Exponential | `exp(x)` | e raised to the given expression |

Use parentheses to make grouping and operator precedence explicit.

## Architecture & Project Structure

The browser sends expression and graph-range parameters to the C server's `GET /plot` endpoint. The server returns JSON containing the evaluated value, derivative, integral, and sampled graph points. The frontend renders those results on the Canvas. The same server serves `/`, `/style.css`, `/script.js`, and `/favicon.jpeg`; `/favicon.ico` is an alias for the JPEG favicon.

The server listens on the `PORT` environment variable, defaulting to `8080`. When the page is served by the C server, the frontend uses the same-origin `/plot` path. When opened from `file://` or the default VS Code Live Server ports, it falls back to `http://localhost:8080`.

```text
C-MATH-PLOTTER/
├── programme.c   # Math parser, HTTP server, static files, and /plot API
├── index.html    # Dashboard and interactive math keyboard
├── style.css     # Responsive dark theme and dashboard styling
├── script.js     # API client, canvas rendering, and interactions
├── favicon.jpeg  # Lime integral mark on a dark background
├── Dockerfile    # Multi-stage Debian build and runtime image
└── README.md
```

## Getting Started

### Windows (MinGW/GCC)

From the project directory:

```powershell
gcc programme.c -o server.exe -lws2_32 -lm
.\server.exe
```

Then open [http://localhost:8080](http://localhost:8080). To use another port, set `PORT` before starting the server:

```powershell
$env:PORT = "8081"
.\server.exe
```

### Linux or macOS (GCC)

```sh
gcc programme.c -o server -lm
./server
```

Then open [http://localhost:8080](http://localhost:8080). A custom port can be set for one run:

```sh
PORT=8081 ./server
```

### Docker

Build and run the included multi-stage image:

```sh
docker build -t c-math-plotter .
docker run --rm -p 8080:8080 -e PORT=8080 c-math-plotter
```

Open [http://localhost:8080](http://localhost:8080).

## Deployment

Deploy the repository as a Docker-based Web Service on Render, using the repository root as the build context. Render supplies the `PORT` environment variable; the C server reads it and binds to `0.0.0.0`, while serving both the frontend and API from the same service.
