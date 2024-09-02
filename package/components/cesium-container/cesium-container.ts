import { App } from 'vue';

import ZCesium from './ZCesium.vue';

ZCesium.install = (app: App) => {
  // 组件注册，按需引入
  app.component('z-cesium', ZCesium);
  return app;
};

export default ZCesium;