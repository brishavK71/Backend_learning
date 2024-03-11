import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    //ADDING VALUES INSIDE AN OBJECT IN DATABASE

    user.refreshToken = refreshToken;

    //SAVING refreshtoken in DB

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Access and Refresh Token"
    );
  }
};
//GET USER DETAILS FROM FRONTEND
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  console.log("email :", email);

  //begineers method
  // if (fullName === "") {
  // throw new ApiError(400, "fullname is required")
  // }

  //VALIDATION CHECK
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //CHECK IF USER ALREADY EXISTS

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "user with email or username already exists");
  }

  //REFERENCING IMAGE FILE PATH FROM MULTER
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // COVERIMAGE UNDEFINED ERROR SOLVING
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar is required");
  }

  //UPLOADING AVATAR TO CLOUDINARY // it takes a while to upload large files such as video so we use "await"

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  //VALIDATING AVATAR
  if (!avatar) {
    throw new ApiError(400, "avatar is required");
  }

  //CREATING OBJECT FOR DATABASE ENTRY
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username?.toLowerCase(),
  });

  //VALIDATING USER CREATION AND REMOVING "password" and "refreshToken" field from reponse
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "Email or username is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User doesn't exists");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect password");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // WHENEVER WE SEND COOKIES WE NEED TO DESIGN OPTIONS
  const options = {
    httpOnly: true, //
    secure: true, // THIS ALLOWS ONLY THE BACKEND SERVER TO MODIFY THE COOKIE
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken.options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true, //
    secure: true, // THIS ALLOWS ONLY THE BACKEND SERVER TO MODIFY THE COOKIE
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out successfully "));
});

export { registerUser, loginUser, logoutUser };
