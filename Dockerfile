FROM debian:bookworm-slim AS build

RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libc6-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src
COPY programme.c .
RUN gcc programme.c -o server -lm

FROM debian:bookworm-slim

WORKDIR /app
COPY --from=build /src/server ./server
COPY index.html style.css script.js favicon.jpeg ./

ENV PORT=8080
EXPOSE 8080
USER nobody
CMD ["./server"]
