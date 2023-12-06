const express = require('express')
require('dotenv').config()
const app = express()
const port = process.env.PORT

app.get('/', (req,res)=>{
    res.send('Hello') 
}) 

app.get('/colors', (req,res)=>{
    const json = [
        {
            color: "red",
            value: "#f00"
        },
        {
            color: "green",
            value: "#0f0"
        },
        {
            color: "blue",
            value: "#00f"
        },
        {
            color: "cyan",
            value: "#0ff"
        },
        {
            color: "magenta",
            value: "#f0f"
        },
        {
            color: "yellow",
            value: "#ff0"
        },
        {
            color: "black",
            value: "#000"
        }
    ]
    res.send(json)
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})