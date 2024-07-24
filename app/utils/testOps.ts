import type { S3Settings } from "~/types";

const checkGrantedToList = async (s3Settings: S3Settings) => {
  try {
    debug("Checking if granted to list...");
    await listObj(s3Settings, false);
    debug("Granted to list!");
    return true;
  } catch (e) {
    return false;
  }
};

export { checkGrantedToList as list };
