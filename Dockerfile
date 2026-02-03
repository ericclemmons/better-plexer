# Better Plexer Sandbox Container
# Based on the official Cloudflare Sandbox image

FROM docker.io/cloudflare/sandbox:0.7.0

# Add opencode install location to PATH
ENV PATH="/root/.opencode/bin:${PATH}"

# Install OpenCode CLI
RUN curl -fsSL https://opencode.ai/install -o /tmp/install-opencode.sh \
    && bash /tmp/install-opencode.sh \
    && rm /tmp/install-opencode.sh \
    && opencode --version

# Install Node.js and additional tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    jq \
    gh \
    nodejs \
    npm \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Create PTY server directory and install dependencies
WORKDIR /opt/pty-server
COPY pty-server.mjs ./
RUN npm init -y && npm install @lydell/node-pty ws

# Copy SKILLS.md into container
COPY SKILLS.md /home/user/SKILLS.md

# Set up workspace
WORKDIR /home/user

# Expose ports
EXPOSE 4096
EXPOSE 7681
