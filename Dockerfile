FROM hazmi35/node:16-dev-alpine as build-stage

# NOTE: Change these as you want
LABEL name "discordbot-template (build-stage)"
LABEL maintainer "Hazmi35 <contact@hzmi.xyz>"

# Copy package.json and lockfile
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Project files
COPY . .

# Build TypeScript Project
RUN npm run build

# Prune devDependencies
RUN npm prune --production

# Get ready for production
FROM hazmi35/node:16-alpine

# NOTE: Change these as you want
LABEL name "discordbot-template"
LABEL maintainer "Hazmi35 <contact@hzmi.xyz>"

# Copy needed files
COPY --from=build-stage /tmp/build/package.json .
COPY --from=build-stage /tmp/build/package-lock.json .
COPY --from=build-stage /tmp/build/node_modules ./node_modules
COPY --from=build-stage /tmp/build/dist ./dist

# Mark logs folder as Docker Volume
VOLUME ["/app/logs"]

# Start the app with node
CMD ["node", "dist/index.js"]