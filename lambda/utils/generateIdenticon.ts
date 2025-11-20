import Identicon from "identicon.js";
import crypto from "crypto";

const generateIdenticon = (input: string, size: number = 64): string => {
  const hash = crypto.createHash("md5").update(input).digest("hex");
  const data = new Identicon(hash, size).toString();
  return `data:image/png;base64,${data}`;
};

export default generateIdenticon;
