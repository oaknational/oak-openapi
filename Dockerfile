# Pinned by digest, not tag: a tag can be repointed by its publisher at any time.
# Dependabot keeps the digest and the comment in step.
FROM node:26@sha256:f5d1cc40abc10c2843339a2134d07817cf33c405cb16bfd052b0ed790254c3a3

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
