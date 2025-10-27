import { churchtoolsClient } from '@churchtools/churchtools-client';
// import { ctStyleguide } from '@churchtools/styleguide';
import { ctUtils } from '@churchtools/utils';
import Lara from '@primeuix/themes/lara';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import type { Person } from './utils/ct-types';

// only import reset.css in development mode to keep the production bundle small and to simulate CT environment
if (import.meta.env.MODE === 'development') {
    import('./utils/tailwind.css');
    import('./utils/reset.css');
    document.body.innerHTML +=
        '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css" integrity="sha512-2SwdPD6INVrV/lHTZbO2nodKhrnDdJK9/kg2XD1r9uGqPo1cUbujc+IYdlYdEErWNu69gVcYgdxlmVmzTWnetw==" crossorigin="anonymous" referrerpolicy="no-referrer" />';
}

declare const window: Window &
    typeof globalThis & {
        settings: {
            base_url?: string;
        };
    };

const baseUrl = window.settings?.base_url ?? import.meta.env.VITE_BASE_URL;
churchtoolsClient.setBaseUrl(baseUrl);

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
// @ts-expect-error window.t will be supplied by churchtools environment
const t = window.t ?? ((e: string) => e);
app.use(ctUtils, {
    baseUrl,
    pinia,
    t: t,
});
// app.use(ctStyleguide, { baseUrl, t: t });
app.use(VueQueryPlugin);
app.use(PrimeVue, {
    theme: {
        preset: Lara,
        options: {
            darkModeSelector: 'system',
        },
    },
});

const username = import.meta.env.VITE_USERNAME;
const password = import.meta.env.VITE_PASSWORD;
if (import.meta.env.MODE === 'development' && username && password) {
    const login = () =>
        churchtoolsClient.post('/login', {
            username,
            password,
        });

    await churchtoolsClient
        .get<Person>('/whoami')
        .then(whoami => {
            if (whoami.id > 0) console.log('Logged in as #' + whoami.id);
            else return login();
        })
        .catch(login);
}

const KEY = import.meta.env.VITE_KEY;
export { KEY };

app.mount('#app');
