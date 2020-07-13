<template>
  <div>
    <vueWaterfall :columnWidth="300" :waterfallList="waterfallList">
      <template v-slot:default="slotProps">
        <div class="waterfll-item">{{slotProps.items.name}}</div>
      </template>
    </vueWaterfall>
  </div>
</template>
<script>
import vueWaterfall from './components/vue-waterfall'
export default {
  name: "app",
  components: { vueWaterfall },
  data() {
    return {
      waterfallList: []
    }
  },
  methods: {
    initDefaultData() {
      let defaultData = new Array(50).fill(0)
      let count = 0
      while (count <= 50) {
        defaultData[count] = {
          name: count,
          styles: {
            height: 100 + Math.floor(Math.random() * (200 + 1)) + 'px',
            background: '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).substr(-6)
          }
        }
        count++
      }
      return defaultData.slice(0)
    }
  },
  created() {
    this.waterfallList = this.initDefaultData()
  }
};
</script>

<style>
.waterfll-item {
  -webkit-text-fill-color: #bd292900;
  -webkit-text-stroke: 1px #ffffff;
  height: 100%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 66px;
}
</style>

