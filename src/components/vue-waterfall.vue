<!--
 * @Author: xiaoai
 * @LastEditors: xiaoai
 * @Description: Whatever is worth doing is worth doing well(任何值得做的事就值得把它做好)
 * @Date: 2019-03-16 15:34:20
 * @LastEditTime: 2019-03-24 21:15:45
 -->
<template>
  <div :class="componentsClassNs">
    <div :class="componentsClassNs + '__container'" :style="containerStyles">
      <div
        :class="componentsClassNs + '__item'"
        v-for="(item, index) in list"
        :key="index"
        :style="item.styles"
      >
        <slot :items="item"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { throttle, extend } from '../utils/utils'
export default {
  name: 'vueWaterfall',
  props: {
    waterfallList: {
      type: Array,
      default() {
        return []
      }
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    columnWidth: {
      type: Number,
      default: 400
    },
    columnMargin: {
      type: Number,
      default: 10
    },
    isColumnHeight: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      list: [],
      defaultDataList: [],
      waterfallIns: null,
      componentsClassNs: 'vue-waterfall',
      isFirstReender: true,
      totalHeight: 0,
      currentPage: 1,
      layoutData: {}
    }
  },
  computed: {
    containerStyles() {
      return {
        height: this.totalHeight + 'px'
      }
    }
  },
  methods: {
    bindEvent() {
      const scrollFn = () => {
        let scrollHeight = document.documentElement.scrollTop
        let page = Math.ceil(scrollHeight / window.innerHeight)
        let maxPage = this.layoutData[Math.max.apply(null,Object.keys(this.layoutData))]
        this.currentPage = page === 0 ? 1 : page > maxPage ? maxPage : page
        
        // console.log(scrollHeight / window.innerHeight, this.currentPage)
      }
      window.addEventListener('scroll', scrollFn)
    }
  },
  created() {
    if (!this.isColumnHeight) {
      this.list = this.waterfallList.slice(0)
      this.isFirstReender = true
    } else {
      this.isFirstReender = false
    }
  },
  mounted() {

    this.waterfallIns = new Waterfall({ ins: this })
    
    this.list = this.waterfallIns.initData().getWaterfallData()

    this.layoutData = extend(true, {}, this.waterfallIns.layoutData)

    // console.log(this.layoutData)
    
    this.totalHeight = this.waterfallIns.getWaterfallTotalHeight()
    this.isFirstReender = false
    const resizeFn = throttle(() => {
      this.list = this.waterfallIns.initData().getWaterfallData()
      this.totalHeight = this.waterfallIns.getWaterfallTotalHeight()
    }, 500)
    window.addEventListener('resize', resizeFn)
    this.bindEvent()
  }
}

/**
 * 计算布局信息
 */
function Waterfall({ ins }) {
  this.ins = ins
}

Waterfall.prototype = {
  constructor: Waterfall,
  initData() {
    let $waterfallItemEl

    !this.ins.isColumnHeight && ($waterfallItemEl = document.querySelectorAll(`.${this.ins.componentsClassNs} .${this.ins.componentsClassNs}__item`))

    // 计算当前页面一行可以显示的个数
    let columnNum = Math.floor(document.body.clientWidth / (this.ins.columnWidth + this.ins.columnMargin * 2))
    // 存储屏幕最大支持显示的个数集合,里面存储当前行的高度信息
    let colHeightArray = new Array(columnNum).fill(0)

    let remainingWidth = document.body.clientWidth - ((this.ins.columnWidth + this.ins.columnMargin) * columnNum)

    let aveWidth = remainingWidth / columnNum

    this.onePageHeight = 0
    this.currentPage = 1
    this.layoutData = {}

    this.ins.totalHeight = 0

    this.ins.waterfallList.forEach((item, index) => {
      let _columnWidth = this.ins.columnWidth + (this.ins.autoResize ? aveWidth : 0)
      let _columnHeight = this.ins.isColumnHeight ? Number.parseInt(item.styles.height) : $waterfallItemEl[index].clientHeight

      item.styles['width'] = `${_columnWidth}px`
      // 构造第一排的数据
      if (index < columnNum) {
        colHeightArray[index] = _columnHeight + this.ins.columnMargin;
        item.styles['transform'] = `translateX(${(_columnWidth * index) + (this.ins.columnMargin * index)}px) translateY(0)`
        item.page = this.currentPage
        this.setLayoutData(item)
      } else {
        // 获取上一行的最小高度元素高度
        let minHeight = Math.min.apply(null, colHeightArray)
        let maxHeight = Math.max.apply(null, colHeightArray)
        // 设置页面一页显示的高度
        index === columnNum && (this.onePageHeight = this.setOnePageHeight(maxHeight))
        // 获取上一行的最小高度下标
        let minIndex = this.getMinDataIndex(colHeightArray, minHeight)
        // 计算x轴偏移量
        let translatexValue = minIndex === 0 ? minIndex * _columnWidth : minIndex * _columnWidth + this.ins.columnMargin * minIndex

        item.styles['transform'] = `translateX(${translatexValue}px) translateY(${minHeight}px)`
        // 更新高度
        colHeightArray[minIndex] += (_columnHeight + this.ins.columnMargin);
        
        if (maxHeight >= (this.onePageHeight * this.currentPage)) {
          this.currentPage++
        }

        item.page = this.currentPage
        this.setLayoutData(item)
      }
    })
    this.ins.totalHeight = Math.max.apply(null, colHeightArray)
    return this
  },
  setLayoutData(item) {
    if (!this.layoutData[this.currentPage]) {
      this.layoutData[this.currentPage] = [item]
    } else {
      this.layoutData[this.currentPage].push(item)
    }
  },
  setOnePageHeight(columnHeight = 0) {
    return window.innerHeight + (columnHeight * 3)
  },
  getMinDataIndex(data, value) {
    let i = 0
    while (true) {
      if (data[i] === value) break;
      i++
    }
    return i
  },
  getWaterfallData() {
    return this.ins.waterfallList.slice(0)
  },
  getWaterfallTotalHeight() {
    return this.ins.totalHeight
  }
}
</script>

<style>
.vue-waterfall__container {
  position: relative;
}
.vue-waterfall .vue-waterfall__item {
  text-align: center;
  position: absolute;
  top: 0;
  left: 0;
  transition: all 0.5s;
}
</style>
