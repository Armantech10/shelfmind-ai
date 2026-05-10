FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN npm run build

# Use a lighter image for production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy necessary files from the builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
# Note: if using next.config.ts or js, you should copy it too, but we can just run start since next start works.

EXPOSE 3000

CMD ["npm", "start"]
