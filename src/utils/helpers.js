import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const signToken = ({ data, secret, expiresIn }) => {
  return jwt.sign(data, secret || process.env.JWT_SECRET, {
    expiresIn: expiresIn || `${process.env.JWT_EXPIRES_IN}`,
  });
};
