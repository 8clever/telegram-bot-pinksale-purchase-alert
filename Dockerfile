from node:iron-alpine3.22
run corepack enable
workdir /app
copy yarn.lock yarn.lock
copy package.json package.json
run yarn workspaces focus --production
copy static static
copy dist/src .
cmd yarn node main