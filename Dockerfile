from node:iron-alpine3.22
workdir /app
copy node_modules node_modules
copy static static
copy package.json package.json
copy dist/src .
cmd node main