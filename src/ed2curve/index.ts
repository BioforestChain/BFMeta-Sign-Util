export * from "./ed2curve";
import { convertPublicKey, convertSecretKey } from "./ed2curve";

export const ed2curveHelper: BFChainSignUtil.Ed2curveHelperInterface = {
  convertPublicKey,
  convertSecretKey,
};
