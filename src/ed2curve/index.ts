export * from "./ed2curve.js";
import { convertPublicKey, convertSecretKey } from "./ed2curve.js";

export const ed2curveHelper: BFMetaSignUtil.Ed2curveHelperInterface = {
  convertPublicKey,
  convertSecretKey,
};
