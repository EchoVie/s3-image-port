<script setup lang="ts">
import type { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";
import { s3SettingsSchema } from "~/types";

const toast = useToast();
const settings = useSettingsStore();
const { s3: state } = storeToRefs(settings);
const { t } = useI18n();

const form = ref();
const showAccessKeyId = ref(false);
const showSecretAccessKey = ref(false);

const isTestingConnectivity = ref(false);

type Schema = z.output<typeof s3SettingsSchema>;

async function onSubmit(_event: FormSubmitEvent<Schema>) {
  isTestingConnectivity.value = true;
  toast.add({
    title: t("settings.s3.submitFormButton.message.try.title"),
  });
  try {
    await settings.test();
    isTestingConnectivity.value = false;

    toast.add({
      title: t(`settings.s3.submitFormButton.message.success.title`),
    });
  } catch (error) { 
    toast.add({
      title: t(`settings.s3.submitFormButton.message.fail.title`),
    });
  }
}
</script>

<template>
  <UForm
    ref="form"
    :schema="s3SettingsSchema"
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <UFormGroup
      v-slot="{ error }"
      :label="$t('settings.s3.form.bucketName.title')"
      :description="$t('settings.s3.form.bucketName.description')"
      name="bucket"
      required
      :error="!state.bucket && $t('settings.s3.form.bucketName.error')"
    >
      <UInput
        v-model="state.bucket"
        :trailing-icon="
          error ? 'i-heroicons-exclamation-triangle-20-solid' : undefined
        "
      />
    </UFormGroup>

    <UFormGroup
      v-slot="{ error }"
      :label="$t('settings.s3.form.accessKeyId.title')"
      name="accKeyId"
      required
      :error="!state.accKeyId && $t('settings.s3.form.accessKeyId.error')"
    >
      <UButtonGroup class="w-full">
        <UInput
          v-model="state.accKeyId"
          class="w-full"
          :type="showAccessKeyId ? 'text' : 'password'"
          :trailing-icon="
            error ? 'i-heroicons-exclamation-triangle-20-solid' : undefined
          "
        />
        <UButton
          :icon="showAccessKeyId ? 'i-heroicons-eye' : 'i-heroicons-eye-slash'"
          color="gray"
          @click="showAccessKeyId = !showAccessKeyId"
        />
      </UButtonGroup>
    </UFormGroup>

    <UFormGroup
      v-slot="{ error }"
      :label="$t('settings.s3.form.secretAccessKey.title')"
      name="secretAccKey"
      required
      :error="
        !state.secretAccKey && $t('settings.s3.form.secretAccessKey.error')
      "
    >
      <UButtonGroup class="w-full">
        <UInput
          v-model="state.secretAccKey"
          class="w-full"
          :type="showSecretAccessKey ? 'text' : 'password'"
          :trailing-icon="
            error ? 'i-heroicons-exclamation-triangle-20-solid' : undefined
          "
        />
        <!-- prettier-ignore-attribute :icon -->
        <UButton
          :icon="showSecretAccessKey ? 'i-heroicons-eye' : 'i-heroicons-eye-slash'"
          color="gray"
          @click="showSecretAccessKey = !showSecretAccessKey"
        />
      </UButtonGroup>
    </UFormGroup>

    <UFormGroup
      v-slot="{ error }"
      :label="$t('settings.s3.form.region.title')"
      :description="$t('settings.s3.form.region.description')"
      name="region"
      required
      :error="!state.region && $t('settings.s3.form.region.error')"
    >
      <UInput
        v-model="state.region"
        :trailing-icon="
          error ? 'i-heroicons-exclamation-triangle-20-solid' : undefined
        "
      />
    </UFormGroup>

    <UFormGroup
      :label="$t('settings.s3.form.keyPrefix.title')"
      :description="$t('settings.s3.form.keyPrefix.description')"
      name="keyPrefix"
      required
      :error="!state.keyPrefix && $t('settings.s3.form.keyPrefix.error')"
    >
      <UInput
        v-model="state.keyPrefix"
        :placeholder="$t('settings.s3.form.keyPrefix.placeholder')"
      />
    </UFormGroup>

    <UFormGroup
      :label="$t('settings.s3.form.endpoint.title')"
      :description="$t('settings.s3.form.endpoint.description')"
      name="endpoint"
    >
      <UInput v-model="state.endpoint" />
    </UFormGroup>

    <UFormGroup :label="$t('settings.s3.form.publicUrl.title')" name="pubUrl">
      <template #description>
        <div>
          <span class="inline-flex items-center">
            {{ $t("settings.s3.form.publicUrl.description") }}
            <UPopover mode="hover">
              <UButton
                icon="i-mingcute-information-line"
                size="2xs"
                color="primary"
                square
                variant="link"
              />
              <template #panel>
                <UCard
                  :ui="{
                    body: {
                      base: 'max-w-[90vw] md:w-[40rem] space-y-3',
                    },
                  }"
                >
                  <!-- prettier-ignore -->
                  <p>{{ $t("settings.s3.form.publicUrl.descriptionExtended.line1") }}</p>
                  <!-- prettier-ignore -->
                  <p>{{ $t("settings.s3.form.publicUrl.descriptionExtended.line2") }}</p>
                </UCard>
              </template>
            </UPopover>
          </span>
        </div>
      </template>
      <UInput v-model="state.pubUrl" />
    </UFormGroup>

    <div class="flex flex-row justify-end">
      <UButton type="submit" :loading="isTestingConnectivity">
        {{ $t("settings.s3.submitFormButton.title") }}
      </UButton>
    </div>
  </UForm>
</template>
