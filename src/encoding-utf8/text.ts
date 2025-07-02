import { isNodejs } from "../platform/index.js";
import TextInNode from "./text.node.js";
import TextInBrowser from "./text.browser.js";
let TextCoder: typeof TextInNode | typeof TextInBrowser;
if (isNodejs) {
  TextCoder = TextInNode;
} else {
  TextCoder = TextInBrowser;
}
export default TextCoder;
