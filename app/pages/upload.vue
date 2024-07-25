<template>
  <UContainer class="space-y-8 w-full">
    <UContainer class="!px-0">
      <UploadWrapper v-model:uploadedLinks="uploadedLinks" class="w-full" />
    </UContainer>
    <PhotoGrid :photos="items" />
  </UContainer>
</template>
 
<script setup lang="ts">
import type { UploadedFileLinkObj } from "~/types";
const settings = useSettingsStore();

onMounted(() => {
  if (!settings.validity.s3) {
    useWrongSettingToast("s3");
    console.error("Invalid S3 settings");
  }
  if (!settings.validity.app) {
    useWrongSettingToast("app");
    console.error("Invalid App settings");
  }
});

const uploadedLinks: Ref<UploadedFileLinkObj[]> = ref([]);

const items = computed(() =>
  uploadedLinks.value.map((link, index) => ({ url: link.link, Key: index })),
);
</script>
