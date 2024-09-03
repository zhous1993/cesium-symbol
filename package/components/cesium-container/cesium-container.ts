import { App } from 'vue';

import CesiumContainer from './CesiumContainer.vue';

CesiumContainer.install = (app: App) => {
  // 组件注册，按需引入
  app.component('z-cesium', CesiumContainer);
  return app;
};

export default CesiumContainer;