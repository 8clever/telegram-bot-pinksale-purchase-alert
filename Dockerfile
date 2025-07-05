from node:iron-alpine3.22
run corepack enable
workdir /app
copy package.json package.json
copy yarn.lock yarn.lock
run yarn
copy static static
copy dist/src .
cmd yarn node main