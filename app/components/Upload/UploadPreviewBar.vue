<template>
  <div class="w-full">
    <div
      class="w-full flex flex-row justify-between items-center gap-2 p-3 rounded-md bg-gray-200/50 dark:bg-gray-800/80 hover:bg-gray-500/15 hover:text-primary-500 dark:hover:text-primary-400 transition-colors max-w-full cursor-default"
    >
      <UPopover mode="hover" class="flex-grow min-w-0">
        <span
          class="space-x-2 max-w-full overflow-hidden whitespace-nowrap text-ellipsis"
        >
          <UIcon
            name="i-mingcute-pic-line"
            class="align-middle -translate-y-[0.1em]"
          />
          <span>{{ file.name }}</span>
        </span>
        <template #panel>
          <div class="p-4 flex flex-col gap-4">
            <UploadPreviewInfo
              :key-str="key"
              :processed-size
              @process-file="onProcessFile"
            />
            <img :src="previewImage" class="w-72" />
          </div>
        </template>
      </UPopover>
      <span class="transition-all flex gap-1 flex-shrink-0">
        <UButton
          size="sm"
          color="white"
          variant="solid"
          icon="i-heroicons-x-mark-20-solid"
          @click="$emit('deleteFile')"
        />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UploadFileConfig } from "~/types";
const settingsStore = useSettingsStore();

defineEmits(["deleteFile"]);

const props = defineProps<{ file: File }>();

const { file } = toRefs(props);
const config = ref<UploadFileConfig>({
  compressionMaxSize: settingsStore.app.compressionMaxSize,
  compressionMaxWidthOrHeight: settingsStore.app.compressionMaxWidthOrHeight,
  convertType: settingsStore.app.convertType,
  keyTemplate: settingsStore.app.keyTemplate,
});

const key = computed(() =>
  genKey(file.value, {
    keyTemplate: config.value.keyTemplate,
    type: config.value.convertType,
    prefix: settingsStore.s3.keyPrefix,
  }),
);

const processedFile = shallowRef<File | null>(null);

const processedSize = computed(() =>
  processedFile.value?.size
    ? humanFileSize(processedFile.value.size)
    : undefined,
);

const processFile = async () => {
  processedFile.value = await compressAndConvert(file.value, config.value);
};

const onProcessFile = async (callback: () => void) => {
  await processFile();
  callback();
};

type FinishEachCb = (key: string, name: string, success: boolean) => void;
const upload = async (finishedEachCb?: FinishEachCb) => {
  try {
    debug("Uploaded", key.value);
    await processFile();
    await uploadObj(processedFile.value!, key.value, settingsStore.s3);
    finishedEachCb && finishedEachCb(key.value, file.value.name, true);
    return { key: key.value, name: file.value.name, success: true };
  } catch (e) {
    console.error(e);
    finishedEachCb && finishedEachCb(key.value, file.value.name, false);
    return { key: key.value, name: file.value.name, success: false };
  }
};

defineExpose({ key, upload });

const previewImage = computed(() => {
  if (!file.value) return "";
  return URL.createObjectURL(file.value);
});
onBeforeUnmount(() => {
  URL.revokeObjectURL(previewImage.value);
});
</script>
