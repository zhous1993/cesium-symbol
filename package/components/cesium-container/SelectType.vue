<script setup lang="ts">
import {ElRow,ElCol, ElButton} from 'element-plus'
import {  reactive, ref, defineEmits } from 'vue'
import { ICONTYPE } from './type'
import vMove from './hooks/mouseMove.directive';
const props = defineProps<{drawList: any[]}>()
console.log(props)

let type = ref<Number>(1)

let listData = reactive<{
  list: ICONTYPE[]
}>({
  list: []
})

const iconList:ICONTYPE[] = [{
  iconUrl: 'icon1.svg',
  text: '图标1',
  type: 'Icon',
        category: 'point'
},{
  iconUrl: 'icon2.svg',
  text: '图标2',
  type: 'Icon',
        category: 'point'
},{
  iconUrl: 'icon3.svg',
  text: '图标3',
  type: 'Icon',
        category: 'point'
},{
  iconUrl: 'icon4.svg',
  text: '图标4',
  type: 'Icon',
        category: 'point'
},{
  iconUrl: 'icon5.svg',
  text: '图标5',
  type: 'Icon',
        category: 'point'
},{
  iconUrl: 'icon6.svg',
  text: '图标6',
  type: 'Icon',
        category: 'point'
},{
  iconUrl: 'icon7.svg',
  text: '图标7',
  type: 'Icon',
        category: 'point'
}]
listData.list = iconList

function clickType(item: Number): void {
  type.value = item;
  if(item === 4) {
    console.log(props.drawList)
  } else if (item === 3) {
    let arr:ICONTYPE[] = [
      {
        iconUrl: 'polyline.png',
        text: '折线',
        type: 'Polyline',
        category: 'polyline'
      },
      {
        iconUrl: 'arc.png',
        text: '曲线',
        type: 'Curve',
        category: 'polyline'
      },
      {
        iconUrl: 'free-line.png',
        text: '自由曲线',
        type: 'Freeline',
        category: 'polyline'
      },
      {
        iconUrl: 'eMap-plot17.png',
        text: '多边形',
        type: 'Polygon',
        category: 'polygon'
      },
      {
        iconUrl: 'eMap-plot18.png',
        text: '圆',
        type: 'Circle',
        category: 'polygon'
      },
      {
        iconUrl: 'eMap-plot21.png',
        text: '扇形',
        type: 'Sector',
        category: 'polygon'
      },
      {
        iconUrl: 'eMap-plot24.png',
        text: '双箭头',
        type: 'PincerArrow',
        category: 'polygon'
      },
      {
        iconUrl: 'eMap-plot25.png',
        text: '燕尾箭头',
        type: 'SwallowtailArrow',
        category: 'polygon'
      },
      {
        iconUrl: 'eMap-plot27.png',
        text: '细直箭头',
        type: 'StraightLineArrow',
        category: 'polygon'
      },
      {
        iconUrl: 'eMap-plot28.png',
        text: '单曲箭头',
        type: 'CurveLineArrow',
        category: 'polygon'

      },
      {
        iconUrl: 'eMap-plot31.png',
        text: '突击方向',
        type: 'StraightArrow',
        category: 'polygon'
      }
    ]
    listData.list = arr
  } else {
    listData.list = iconList
  }
}

function loadImg(url: string | undefined) {
  return new URL(`./icon/${url}`, import.meta.url).href
}
defineEmits(['selectType', 'toggle', 'delete'])
</script>

<template>
  <div class="select-type" v-move>
    <div class="select-type_left" >
      <div :class="{'selected': type === 1}" @click.stop="clickType(1)">常用标绘</div>
      <div :class="{'selected': type === 2}" @click.stop="clickType(2)">应急标绘符号</div>
      <div :class="{'selected': type === 3}" @click.stop="clickType(3)">标绘工具箱</div>
      <div :class="{'selected': type === 4}" @click.stop="clickType(4)">管理标绘</div>
    </div>
    <div class="select-type_content">
      <template v-if="type !== 4">
        <el-row :gutter="16" justify="start" align="middle">
          <el-col class="icon-item" :span="8" v-for="item in listData.list" :key="item.iconUrl" @click..prevent="$emit('selectType', item)">
            <img :src="loadImg(item.iconUrl)">
            <div>{{ item.text }}</div>
          </el-col>
        </el-row>
      </template>
      <template v-else>
        <el-row v-for="(item, index) in props.drawList" :key="item.id">
          <el-col :span="8">
            <el-button text type="primary" @click.stop="$emit('toggle', item)">{{ item.entity && !item?.entity.show ?  '显示' : '隐藏'}}</el-button>
          </el-col>

          <el-col :span="8"><span>符号--{{ index+1 }}</span></el-col>
            <el-col :span="8">
              <el-button text  type="danger" @click.stop="$emit('delete', item)">删除</el-button>

            </el-col>
        </el-row>
      </template>
    </div>
  </div>
</template>

<style scoped>
.select-type {
  background-color: #fff;
  width: 320px;
  height: 500px;
  border-radius: 20px;
  border: 1px solid #dedede;
  display: flex;
  overflow: hidden;
}
.select-type_left{
  width: 40px;
  height: 100%;
  overflow: hidden;
}
.select-type_left div{
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 5px 0 0 5px;
  /* height: 54px;
  line-height: 54px; */
}
.selected{
  cursor: auto;
  background-color: #dedede;
}
.select-type_content{
  flex: 1;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  border-left: 1px solid #dedede;
}
.icon-item:hover{
  border-radius: 5px;
  border: 1px solid #0092ff;
  cursor: pointer;
}
</style>
