const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Adjust the path as necessary
const { HttpUnAuthorizedError } = require("../helpers/errors/httpErrors"); // Assuming this is your custom error class

const authentication = async (req, res, next) => {
  try {
    // Extract token from the 'Authorization' header
    const extractToken = req.headers.authorization;

    if (extractToken && extractToken.split(" ").length > 1) {
      // Split the 'Authorization' header to get the token
      const token = extractToken.split(" ")[1];
      let decoded;
      if (!token || token === "null") {
        throw new HttpUnAuthorizedError();
      } else {
        try {
          // Verify the token using the secret key
          decoded = jwt.verify(token, process.env.JWT_SECRET, {
            ignoreExpiration: true,
          });
        } catch (error) {
          throw new HttpUnAuthorizedError();
        }

        if (!decoded || !decoded.id) {
          throw new HttpUnAuthorizedError();
        } else {
          // Check if the token has expired
          const currentTime = Math.floor(Date.now() / 1000);
          if (decoded.exp && decoded.exp < currentTime) {
            throw new HttpUnAuthorizedError();
          } else {
            // Retrieve user information using user ID from the token
            const findUser = await User.findById(decoded.id);
            if (findUser) {
              // Check the user's details
              if (
                findUser._id.toString() === decoded.id &&
                findUser.name === decoded.name &&
                findUser.email === decoded.email &&
                findUser.phone === decoded.phone
              ) {
                req.user = findUser;
                next();
              } else {
                throw new HttpUnAuthorizedError();
              }
            } else {
              throw new HttpUnAuthorizedError();
            }
          }
        }
      }
    } else {
      // If 'Authorization' header is missing or improperly formatted, throw Unauthorized error
      throw new HttpUnAuthorizedError();
    }
  } catch (error) {
    next(error);
  }
};

const adminCheck = async (req, res, next) => {
  const { email } = req.user;

  const adminUser = await User.findOne({ email }).exec();

  if (adminUser.role !== "admin") {
    res.status(403).json({
      err: "Admin resource. Access denied.",
    });
  } else {
    next();
  }
};

module.exports = { authentication, adminCheck };
