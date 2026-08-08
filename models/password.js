import bcryptjs from "bcryptjs";
import { InternalServerError } from "infra/errors";

async function hash(password) {
  const salt = await bcryptjs.genSalt(getNumberOfRounds());
  const hashedPassword = await bcryptjs.hash(password + getPepper(), salt);
  return hashedPassword;
}

async function compare(password, hashedPassword) {
  return await bcryptjs.compare(password + getPepper(), hashedPassword);
}

function getPepper() {
  const pepper = process.env.PASSWORD_PEPPER;
  if (!pepper) throw new InternalServerError("PASSWORD_PEPPER is not defined");
  return pepper;
}

function getNumberOfRounds() {
  return process.env.VERCEL_ENV === "production" ? 14 : 1;
}

const password = {
  hash,
  compare,
};

export default password;
