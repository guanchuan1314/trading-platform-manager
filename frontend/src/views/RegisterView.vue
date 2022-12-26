<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { mdiAccount, mdiAsterisk } from "@mdi/js";
import SectionFullScreen from "@/components/SectionFullScreen.vue";
import CardBox from "@/components/CardBox.vue";
import FormField from "@/components/FormField.vue";
import FormControl from "@/components/FormControl.vue";
import BaseButton from "@/components/BaseButton.vue";
import BaseButtons from "@/components/BaseButtons.vue";
import LayoutGuest from "@/layouts/LayoutGuest.vue";
import Axios from "@/models/axios.js";

const axios = new Axios();
const form = reactive({
  username: "",
  password: "",
});

const router = useRouter();

const register = async () => {
  try {
    let response = await axios.post("/api/main/register", form);
    if (response.data.status == "success") {
      router.push("/login");
    }
  } catch (e) {}
};
</script>

<template>
  <LayoutGuest>
    <SectionFullScreen v-slot="{ cardClass }" bg="purplePink">
      <CardBox :class="cardClass" is-form @submit.prevent="submit">
        <FormField label="Username" help="Please enter your username">
          <FormControl
            v-model="form.username"
            :icon="mdiAccount"
            name="username"
            autocomplete="nofill"
          />
        </FormField>

        <FormField label="Password" help="Please enter your password">
          <FormControl
            v-model="form.password"
            :icon="mdiAsterisk"
            type="password"
            name="password"
            autocomplete="nofill"
          />
        </FormField>
        <template #footer>
          <BaseButtons>
            <BaseButton color="info" label="Register" @click="register()" />
          </BaseButtons>
        </template>
      </CardBox>
    </SectionFullScreen>
  </LayoutGuest>
</template>
