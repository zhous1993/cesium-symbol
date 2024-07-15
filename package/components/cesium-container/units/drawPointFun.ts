import { Ref } from "vue";
import * as Cesium from 'cesium'
import { ICONTYPE } from '../type'
export function useDrawPoint(viewer: Ref<Cesium.Viewer | undefined>, data: ICONTYPE) {
    const dataSource1 = new Cesium.CustomDataSource("dataSource1");
    let dataSourcePromise = null;
    const img_path = new URL(`../icon/${data.iconUrl}`, import.meta.url).href;
    const lon = data.lon ?  Number(data.lon) : 0;
    const lat = data.lat ?  Number(data.lat) : 0;
    dataSource1.entities.add(new Cesium.Entity({
        position: Cesium.Cartesian3.fromDegrees(lon, lat),
        billboard: {
            image: img_path,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            scale: 1,   // 标注点icon缩放比例
        },
        label: {
            show: true, //是否显示标注点文本
            scale: 0.6, 
            font: "normal 900 24px MicroSoft YaHei", //字体
            fillColor: Cesium.Color.fromCssColorString("#3976bd"),  //字体颜色
            text: data.remark, //从接口获取点的标记文本
            pixelOffset: new Cesium.Cartesian2(0, -50), //文字显示的偏移量
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER, //水平居中
            verticalOrigin: Cesium.VerticalOrigin.CENTER, //垂直居中
            style: Cesium.LabelStyle.FILL,
            showBackground: true,  //设置文本背景
            backgroundColor: Cesium.Color.fromCssColorString("#ffffff") //设置文本背景颜色,
        }
    })
    )
    // viewer.value!.flyTo(dataSource1)
    // 点聚合
    dataSourcePromise = viewer.value!.dataSources.add(dataSource1);
    dataSourcePromise.then((dataSource) => {
        const pixelRange = 100;
        const minimumClusterSize = 2;
        const enabled = true;
        dataSource.clustering.enabled = enabled; //聚合开启
        dataSource.clustering.pixelRange = pixelRange; //设置像素范围，以扩展显示边框
        dataSource.clustering.minimumClusterSize = minimumClusterSize; //设置最小的聚合点数目，超过此数目才能聚合
        dataSource.clustering.clusterEvent.addEventListener((clusteredEntities, cluster) => {
            // 关闭自带的显示聚合数量的标签
            cluster.label.show = false;
            cluster.billboard.show = true;
            cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
            // 根据聚合的多少显示图标的大小
            if (clusteredEntities.length >= 20) {
                cluster.billboard.width = 72;
                cluster.billboard.height = 72;
            } else {
                cluster.billboard.width = 40;
                cluster.billboard.height = 40;
            }
        })
    })
    return Symbol()
}