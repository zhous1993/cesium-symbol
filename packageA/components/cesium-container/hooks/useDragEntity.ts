import { ref } from 'vue'
import * as Cesium from 'cesium'
import { getCatesian3FromPX } from '../units/thirdPart/utils'
export const useDragEntity = (viewer: Cesium.Viewer, cb: () => void) => {
    let isDraging = ref(true)
    let handler: any = ref<any>()
    viewer.scene.screenSpaceCameraController.enableRotate = false;
    viewer.scene.screenSpaceCameraController.enableZoom = false;
    viewer.scene.screenSpaceCameraController.enableTranslate = false;
    viewer.scene.screenSpaceCameraController.enableTilt = false;
    viewer.scene.screenSpaceCameraController.enableLook = false;
    const createHandler = () => {
        handler.value = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
        handler.value.setInputAction((evt: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
            let pick = viewer.scene.pick(evt.position);
            if (Cesium.defined(pick) && pick.id.id == entity.id) {
                isDraging.value = true
                viewer.scene.screenSpaceCameraController.enableRotate = false;
                viewer.scene.screenSpaceCameraController.enableZoom = false;
                viewer.scene.screenSpaceCameraController.enableTranslate = false;
                viewer.scene.screenSpaceCameraController.enableTilt = false;
                viewer.scene.screenSpaceCameraController.enableLook = false;
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN)
        handler.value.setInputAction((evt: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
            let pickPosition = getCatesian3FromPX(evt.endPosition, viewer)
            if (isDraging.value && Cesium.defined(pickPosition)) {
                entity.position = pickPosition
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        handler.value.setInputAction((evt: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
            isDraging.value = false
            console.log(isDraging)
            viewer.scene.screenSpaceCameraController.enableRotate = true;
            viewer.scene.screenSpaceCameraController.enableZoom = true;
            viewer.scene.screenSpaceCameraController.enableTranslate = true;
            viewer.scene.screenSpaceCameraController.enableTilt = true;
            viewer.scene.screenSpaceCameraController.enableLook = true;
            distory()
        }, Cesium.ScreenSpaceEventType.LEFT_UP)
    }
    const distory = () => {
        handler.value && handler.value.destroy()
        handler.value = null
    }
    return { createHandler }
}