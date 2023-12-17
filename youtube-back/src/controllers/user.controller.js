import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Jwt } from "jsonwebtoken"
const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Somrthing went wrong while generating token")
    }
}


const registerUser = asyncHandler(async (req,res) => {
    //get user details
    //validation
    //check if user already exist
    //check for images and avatar
    //upload to cloudinary
    //create user object = create entry in db
    //remove password and refresh token field from respone
    //check for user creation
    //return res
    const {fullName, email, username, password} = req.body
    // if (fullName === "") {
    //     throw new ApiError(400,"fullname is required")
    // }
    if(
        [fullName, email, username, password].some(
            (field) => field?.trim() ===""
        )
    ){
        throw new ApiError(400,"All fields is required")
    }
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })
    if (existedUser) {
        throw new ApiError(409, "User already exist")
    }
    const avatarLocalPath = req .files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }
    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()

    })
    
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Created")
        )

})
const loginUser = asyncHandler(
    async (req,res) => {
        // req body -> data
        //username or email
        //paswd check
        //access and refresh token
        //send cookie
        const {email, username, password} = req.body
        if(!(username || email)){
            throw new ApiError(400,"username or email is required")
        }
        const user = await User.findOne({
            $or: [{username},{email}]
        })
        if (!user) {
            throw new ApiError(404, "user does not exist")
        }
        console.log(user);
        

        const isPaswdValid = await user.isPasswordCorrect(password)
        if (!isPaswdValid) {
            throw new ApiError(401, "Invalid password")
        }
        const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)
        const loggedInUser = await User.findById(user._id).
        select("-password -refreshToken")

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(200,
                {
                    user : loggedInUser, accessToken,
                    refreshToken
                },
                "User logged in successfully")
        )

    })

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            },
        },
            {
                new: true
            }
        
    )
    
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200, "User logged out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =   req.cookies.refreshToken || req.body.refreshToken
    if(incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }
    try {
        const decodedToken = Jwt.verify(
            incomingRefreshToken,
            process.env.ACCESS_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401, "Invalid request Token")
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
        const options= {
            httpOnly: true,
            secure: true
            
        }
        const {accessToken, newrefreshToken} =  await generateAccessAndRefreshToken(user._id)
    
        return res.status(200)
        .cookie("accesToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new ApiResponse(200, 
                {
                    accessToken, refreshToken: newrefreshToken
                }, "Access token refreshed")
    )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})
export {registerUser,loginUser,logoutUser,refreshAccessToken} 