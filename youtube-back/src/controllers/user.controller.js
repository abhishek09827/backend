import {asyncHandler} from "../utils/asyncHandler.js"
import { upload } from "../controllers/multer.middleware.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCLoudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
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
    const existedUser = User.findOne({
        $or: [{username}, {email}]
    })
    if (existedUser) {
        throw new ApiError(409, "User already exist")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    const avatar = await uploadOnCLoudinary(avatarLocalPath)
    const coverImage = await uploadOnCLoudinary(coverImageLocalPath)
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
    if (createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Created")
        )

})

export default registerUser 