FROM node:20

# Avoid interactive prompts
ENV CI=1

# Install essential dependencies for React Native DevTools
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npx", "expo", "start", "--web", "--port", "5173"]
