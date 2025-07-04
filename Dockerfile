from iron-alpine3.22
workdir /app
copy ./dist/src .
cmd node main