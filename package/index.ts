import { App } from 'vue';
import components from './components/components';

// 这部分，如果你有一些配置参数要导出就可以用这个

// 所有组件
export * from './components/components';

// 完整引入组件
const install = (app: App) => {
  components.forEach((component) => {
    app.use(component as unknown as { install: () => any });
  });
};

export default {
  install,
//   ...ButtonTypes
};