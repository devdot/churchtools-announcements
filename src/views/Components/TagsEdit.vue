<script setup lang="ts">
import { Button, InputGroup, InputText, Tag } from 'primevue';
import { ref } from 'vue';

const model = defineModel<string[]>({ default: [] });

const newTag = ref('');
const add = function () {
    model.value.push(newTag.value);
    newTag.value = '';
};

const remove = function (key: number) {
    model.value.splice(key, 1);
};
</script>
<template>
    <div class="flex items-center gap-2">
        <Tag
            v-for="(tag, key) in model"
            :key="tag + '_' + key"
            icon="fa-solid fa-times"
            severity="secondary"
            :value="tag"
            @click="remove(key)"
        />
        <InputGroup>
            <InputText
                v-model="newTag"
                fluid
                placeholder="Tag hinzufügen"
                size="small"
                @keydown.enter="add"
            />
            <Button icon="fa-solid fa-plus" size="small" @click="add" />
        </InputGroup>
    </div>
</template>
