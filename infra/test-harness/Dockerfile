FROM ghcr.io/cli/cli:latest

RUN apk add --no-cache bash git jq

WORKDIR /workspace

COPY run-harness.sh /usr/local/bin/run-harness
RUN chmod +x /usr/local/bin/run-harness

ENTRYPOINT ["/usr/local/bin/run-harness"]
