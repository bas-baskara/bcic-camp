'use strict'
const Koa = require('koa')
const serve = require('koa-static')
const fs = require('fs')
const path = require('path')

const app = new Koa()
const staticDirPath = path.join(__dirname, 'public')

app.use(serve(__dirname + '/public'))

app.use(async (ctx, next) => {
    await next()

    const data = fs.createReadStream(path.resolve(__dirname, 'public', 'index.html'))
    ctx.type = 'html'
    ctx.body = data

    console.log('url', ctx.url)
    console.log('type', ctx.type)
})

app.listen(4444)