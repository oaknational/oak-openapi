# Pinned by digest, not tag: a tag can be repointed by its publisher at any time.
# Dependabot keeps the digest and the comment in step.
FROM node:24@sha256:f6d02cf1353049cf3658e6ce9ec03c6877a6479495f122062d195e2279d01055

# enable Corepack & activate pnpm
RUN corepack enable \
 && corepack prepare pnpm@10 --activate

WORKDIR /app

# copy manifest & install deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml schema.prisma ./
RUN pnpm install --frozen-lockfile

# copy the rest of your code
COPY . .

# run bulk and then list the out/ directory
CMD ["sh", "-c", "pnpm bulk && ls -la out"]
