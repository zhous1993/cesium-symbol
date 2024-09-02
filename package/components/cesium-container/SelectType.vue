<script setup lang="ts">
import { Flex, Row , Col } from 'ant-design-vue';
import { Directive, reactive, ref, defineEmits } from 'vue'
import { ICONTYPE } from './type'
const props = defineProps<{drawList: any[]}>()
console.log(props)
const vMove: Directive<any, void> = (el: HTMLElement) => {
  // let moveElement = el.firstElementChild as HTMLElement
  function mouseDown(e: MouseEvent) {
    let X = e.clientX - el.offsetLeft
    let Y = e.clientY - el.offsetTop
    function mouseMove(e: MouseEvent) {
      el.style.left = e.clientX - X + 'px'
      el.style.top = e.clientY - Y + 'px'
    }
    document.addEventListener('mousemove', mouseMove)
    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', mouseMove)
    })
  }
  el.addEventListener('mousedown', mouseDown)
}
let type = ref<Number>(1)

let listData = reactive<{
  list: ICONTYPE[]
}>({
  list: []
})

const iconList = [{
  iconUrl: 'icon1.svg',
  text: '图标1',
  type: 'Icon'
},{
  iconUrl: 'icon2.svg',
  text: '图标2',
  type: 'Icon'
},{
  iconUrl: 'icon3.svg',
  text: '图标3',
  type: 'Icon'
},{
  iconUrl: 'icon4.svg',
  text: '图标4',
  type: 'Icon'
},{
  iconUrl: 'icon5.svg',
  text: '图标5',
  type: 'Icon'
},{
  iconUrl: 'icon6.svg',
  text: '图标6',
  type: 'Icon'
},{
  iconUrl: 'icon7.svg',
  text: '图标7',
  type: 'Icon'
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
        type: 'Polyline'
      },
      {
        iconUrl: 'arc.png',
        text: '曲线',
        type: 'Curve'
      },
      {
        iconUrl: 'free-line.png',
        text: '自由曲线',
        type: 'Freeline'
      },
      {
        iconUrl: 'eMap-plot17.png',
        text: '多边形',
        type: 'Polygon'
      },
      {
        iconUrl: 'eMap-plot18.png',
        text: '圆',
        type: 'Circle'
      },
      {
        iconUrl: 'eMap-plot21.png',
        text: '扇形',
        type: 'Sector'
      },
      {
        iconUrl: 'eMap-plot24.png',
        text: '双箭头',
        type: 'PincerArrow'
      },
      {
        iconUrl: 'eMap-plot25.png',
        text: '燕尾箭头',
        type: 'SwallowtailArrow'
      },
      {
        iconUrl: 'eMap-plot27.png',
        text: '细直箭头',
        type: 'StraightLineArrow'
      },
      {
        iconUrl: 'eMap-plot28.png',
        text: '单曲箭头',
        type: 'CurveLineArrow'
      },
      {
        iconUrl: 'eMap-plot31.png',
        text: '突击方向',
        type: 'AttackArrow'
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
    <a-flex class="select-type_left" vertical justify="space-around" align="center">
      <div :class="{'selected': type === 1}" @click.stop="clickType(1)">常用标绘</div>
      <div :class="{'selected': type === 2}" @click.stop="clickType(2)">应急标绘符号</div>
      <div :class="{'selected': type === 3}" @click.stop="clickType(3)">标绘工具箱</div>
      <div :class="{'selected': type === 4}" @click.stop="clickType(4)">管理标绘</div>
    </a-flex>
    <div class="select-type_content">
      <template v-if="type !== 4">
        <a-row :gutter="[16, 24]">
          <a-col class="icon-item" :span="8" v-for="item in listData.list" :key="item.iconUrl" @click..prevent="$emit('selectType', item)">
            <img :src="loadImg(item.iconUrl)">
            <div>{{ item.text }}</div>
          </a-col>
        </a-row>
      </template>
      <template v-else>
        <a-row v-for="(item, index) in props.drawList" :key="item.id">
          <a-col>
            <a-button type="link" @click.stop="$emit('toggle', item)">{{ item.entity && !item?.entity.show ?  '显示' : '隐藏'}}</a-button>
            <span>符号--{{ index+1 }}</span>
            <a-button  type="link" @click.stop="$emit('delete', item)">删除</a-button>
          </a-col>
        </a-row>
      </template>
    </div>
  </div>
</template>

<style scoped>
.select-type {
  background-color: #fff;
  width: 300px;
  height: 500px;
  border-radius: 20px;
  border: 1px solid #dedede;
  display: flex;
}
.select-type_left{
  width: 40px;
  height: 100%;
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
