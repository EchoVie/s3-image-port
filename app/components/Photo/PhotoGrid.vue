<template>
  <div ref="imageWrapper" class="flex flex-wrap gap-2">
    <PhotoCard
      v-for="(photo, index) in currentDisplayed"
      :key="photo.Key"
      ref="photoCardRefs"
      :photo="photo"
      :select-mode="selectedPhotos.length > 0"
      class="transition-all"
      :style="{
        width: `${imageSize[index]![0]}px`,
        height: `${imageSize[index]![1]}px`,
      }"
      @delete-photo="(key) => $emit('deletePhoto', key)"
    />
  </div>
  <UPagination
    v-if="photos.length > 0"
    v-model="page"
    class="mx-auto max-w-fit"
    :total="photos.length"
    :page-count="imagePerPage"
  />
</template>

<script lang="ts" setup>
import type { PhotoCard } from "#components";
import type { Photo } from "~/types";

const props = defineProps<{ photos: Photo[] }>();
const selectedPhotos = defineModel<string[]>({ required: true });
defineExpose({ clearSelectedPhotos });
defineEmits<{ deletePhoto: [key: string] }>();

const photoCardRefs = ref<(InstanceType<typeof PhotoCard> | null)[]>([]);
const imageWrapper = ref<HTMLElement | null>(null);

watchEffect(() => {
  selectedPhotos.value = photoCardRefs.value
    .filter((ref) => ref?.selected)
    .map((ref) => ref?.key)
    .filter((keyOrUd) => keyOrUd !== undefined) as string[];
});

function clearSelectedPhotos() {
  selectedPhotos.value.length = 0;
  for (const ref of photoCardRefs.value) {
    ref && (ref.selected = false);
  }
}

const { photos } = toRefs(props);
const page = ref(1);
const imagePerPage = 16;

const currentDisplayed = computed(() =>
  photos.value.slice(
    (page.value - 1) * imagePerPage,
    page.value * imagePerPage,
  ),
);

type Size = [number, number];
const defaultImageSize: Size = [384, 208];
const gap = 8;

const wrapperWidth = useElementSize(imageWrapper).width;
useResizeObserver(imageWrapper, (entries) => {
  const entry = entries[0];
  if (!entry) return;
  const { width } = entry.contentRect;
  wrapperWidth.value = width;
});
const deBouncedWrapperWidth = refDebounced(wrapperWidth, 300);

// Calculate the natural size of images
const imageNaturalSize = computed(() => {
  const sortedPhotoCardRefs = currentDisplayed.value.map((photo) => {
    return photoCardRefs.value.find((ref) => ref?.key === photo.Key);
  });
  // get the natural size of each image, if not ready, returns default size
  return sortedPhotoCardRefs.map((ref) => {
    return ref?.naturalSize ?? defaultImageSize;
  });
});

const imageSize = useMasonry(imageNaturalSize, deBouncedWrapperWidth, {
  gap,
  defaultSize: defaultImageSize,
  maxItems: imagePerPage,
});
</script>
