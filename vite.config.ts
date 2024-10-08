import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path, { resolve } from 'path'
import dts from 'vite-plugin-dts'
import cesium from 'vite-plugin-cesium'
import ElementPlus from 'unplugin-element-plus/vite'
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vue(),
      dts({
        insertTypesEntry: true,
        cleanVueFileName: true,
        include: ['package/**/*']
      }),
      mode !== 'production' && cesium(),
      ElementPlus({})
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.vue'],
      alias: {
        '@': path.resolve(__dirname, './src'),
        '~': path.resolve(__dirname, './package')
      }
    },
    build: {
      outDir: 'lib',
      lib: {
        entry: resolve(__dirname, 'package/index.ts'),
        name: 'ZCesium',
        fileName: (format) => `ZCesium.${format}.js`
      },
      rollupOptions: {
        external: ['cesium', 'vue'],

      }
    }
  }
})
