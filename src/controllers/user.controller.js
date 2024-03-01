import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "ok", // message should be passed as a string encoded. This here was an error
  });
});

export { registerUser };
