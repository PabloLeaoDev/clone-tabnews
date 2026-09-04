import controller from "infra/controller.js";
import user from "models/user.js";
import { createRouter } from "next-connect";

const router = createRouter();

router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller);

async function getHandler(request, response) {
  const { username } = request.query;
  const userFound = await user.findOneByUsername(username);
  return response.status(200).json(userFound);
}

async function patchHandler(request, response) {
  const { username } = request.query;
  const { body: userInputValues } = request;

  const updatedUser = await user.update(username, userInputValues);
  return response.status(200).json(updatedUser);
}
