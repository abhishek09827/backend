// https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj?origin=share --- Model Link
// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import mongoose from "mongoose";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './env'
})



connectDB()
.then(
() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Conneceted to port : ${process.env.PORT}`);
    })
}
)
.catch((err) => {
    console.log("Mongo Conn failed");
})







/* First Approach
(async ()=> {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log(error)
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`${process.env.PORT} is being listened`)
        })
    } catch (error) {
        console.log(error)
    }
})()
*/