FROM node:22

# enable Corepack & activate pnpm
RUN corepack enable \
 && corepack prepare pnpm@8 --activate

WORKDIR /app

# copy manifest & install deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# copy the rest of your code
COPY . .

# run bulk and then list the out/ directory
CMD ["sh", "-c", "pnpm bulk && ls -la out"]