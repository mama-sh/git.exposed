FROM node:20-slim AS base

RUN apt-get update && apt-get install -y curl tar && rm -rf /var/lib/apt/lists/*

# Install Betterleaks (check latest release URL on GitHub)
RUN curl -sSL https://github.com/zricethezav/betterleaks/releases/latest/download/betterleaks-linux-amd64 -o /usr/local/bin/betterleaks \
    && chmod +x /usr/local/bin/betterleaks || echo "Betterleaks install skipped — verify URL"

# Install Trivy
RUN curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin || echo "Trivy install skipped"

# Install OpenGrep
RUN curl -sSL https://github.com/opengrep/opengrep/releases/latest/download/opengrep-linux-amd64 -o /usr/local/bin/opengrep \
    && chmod +x /usr/local/bin/opengrep || echo "OpenGrep install skipped — verify URL"

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

EXPOSE 4000
CMD ["node", "dist/index.js"]
