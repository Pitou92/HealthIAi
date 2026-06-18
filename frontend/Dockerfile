FROM node:20

# Avoid interactive prompts
ENV CI=1

# Install essential dependencies for React Native DevTools
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libasound2 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgbm1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5173

CMD ["npx", "expo", "start", "--web", "--port", "5173"]
