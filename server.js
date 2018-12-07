const https = require('https')
const fs = require('fs')
const express = require('express')
const helmet = require('helmet')

const app = express();

const infoFile = './ips.json'
// attempt to read .env
if (fs.existsSync('./.env')) {
    console.log('loading .env')
    const env = fs.readFileSync('./.env').toString().split('\n')
    env.forEach(line => {
        const [key, ...valSplit] = line.split('=')
        const val = valSplit.join('=')
        process.env[key] = val
        console.log(`[env] setting ${key} as ${process.env[key]}`)
    })
} else {
    console.log('env not found!')
}

if (!fs.existsSync(infoFile)) {
    console.log(`creating ${infoFile}`)
    fs.writeFileSync(infoFile, '{}')
}

// hide some headers
app.use(helmet())

// logging middleware
app.use((req, res, next) => {
    const now = new Date()
    const { url, ip, headers, method } = req
    const addr = headers['x-forwarded-for'] || ip
    console.log(`${now} :: ${method} on ${url} by ${addr}`)
    next();
})

// auth middleware
app.use((req, res, next) => {
    const auth = req.headers['authorization']
    if (auth !== process.env.SHARED_SECRET) {
        res.redirect('https://jsonplaceholder.typicode.com/todos')
    } else {
        next()
    }
})


app.post('/key/:machine', (req, res) => {
    const saved = require(infoFile)
    const ip = req.headers['x-forwarded-for'] || req.ip
    const active = new Date()
    const {machine} = req.params
    console.log(`${active} :: IP save request from ${machine} @ ${ip}`)
    const data = { ip, active }
    saved[machine] ? saved[machine].push(data) : saved[machine] = [data]
    fs.writeFileSync(infoFile, JSON.stringify(saved))
    res.json(saved[machine])
})

app.get('/all', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.ip
    console.log(`${new Date()} :: IP retrieval request from ${ip}`)
    res.json(require(infoFile))
})

const server = https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
}, app)

const port = process.env.PORT || 5001

server.listen(port)

server.on('listening', () => console.log(`server listening on ${port}`))