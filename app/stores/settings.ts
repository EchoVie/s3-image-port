import { skipHydrate } from "pinia";
import type { AppSettings, S3Settings } from "~/types";
import { appSettingsSchema, s3SettingsSchema } from "~/types";
import * as checkOp from "~/utils/testOps";
import key2UrlUtil from "~/utils/key2Url";

export const useSettingsStore = defineStore("settings", () => {
  // MARK: states
  const s3 = useLocalStorage("s3-settings", {
    endpoint: "",
    bucket: "",
    accKeyId: "",
    secretAccKey: "",
    region: "",
    keyPrefix: "",
    pubUrl: "",
  } satisfies S3Settings as S3Settings);
  const app = useLocalStorage("app-settings", {
    enableAutoRefresh: true,
    enableFuzzySearch: true,
    fuzzySearchThreshold: 0.6,
    convertType: "none",
    compressionMaxSize: "",
    compressionMaxWidthOrHeight: "",
    keyTemplate: "{{prefix}}/{{random}}.{{ext}}",
    noLongerShowRootPage: true,
  } satisfies AppSettings as AppSettings);

  const validity = computed(() => ({
    app: appSettingsSchema.safeParse(app.value).success,
    s3: s3SettingsSchema.safeParse(s3.value).success,
    all:
      appSettingsSchema.safeParse(app.value).success &&
      s3SettingsSchema.safeParse(s3.value).success,
  }));

  const test = async () => {
    try {
      await checkOp.list(s3.value)
    } catch (e) {
      throw new Error("Error occurred while checking if object exists:");
    }
  };

  const list = (onlyOnce?: boolean) => {
    return listObj(s3.value, onlyOnce);
  };

  const del = (key: string) => {
    return deleteObj(key, s3.value);
  };

  const upload = (file: File | Blob, key: string) => {
    return uploadObj(file, key, s3.value);
  };

  const key2Url = (key: string) => {
    return key2UrlUtil(key, s3.value);
  };

  return {
    s3: skipHydrate(s3),
    app: skipHydrate(app),
    validity: skipHydrate(validity),

    test,
    list,
    del,
    upload,
    key2Url,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot));
}
