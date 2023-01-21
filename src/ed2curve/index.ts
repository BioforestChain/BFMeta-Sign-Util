export * from "./ed2curve";
import { convertPublicKey, convertSecretKey } from "./ed2curve";

export const ed2curveHelper: BFMetaSignUtil.Ed2curveHelperInterface = {
  convertPublicKey,
  convertSecretKey,
};
