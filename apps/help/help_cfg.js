/**
* 请注意，系统不会读取help_default.js ！！！！
* 【请勿直接修改此文件，且可能导致后续冲突】
*
* 如需自定义可将文件【复制】一份，并重命名为 help.js
*
* */

// 帮助配置
export const helpCfg = {
  // 帮助标题
  title: '随机图帮助',

  // 帮助副标题
  subTitle: 'Miao-Yunzai & Image-Plugin',

  // 帮助表格列数，可选：2-5，默认3
  // 注意：设置列数过多可能导致阅读困难，请参考实际效果进行设置
  colCount: 2,

  // 单列宽度，默认265
  // 注意：过窄可能导致文字有较多换行，请根据实际帮助项设定
  colWidth: 265,

  // 皮肤选择，可多选，或设置为all
  // 皮肤包放置于 resources/help/theme
  // 皮肤名为对应文件夹名
  // theme: 'all', // 设置为全部皮肤
  // theme: ['default','theme2'], // 设置为指定皮肤
  theme: 'all',

  // 排除皮肤：在存在其他皮肤时会忽略该项内设置的皮肤
  // 默认忽略default：即存在其他皮肤时会忽略自带的default皮肤
  // 如希望default皮肤也加入随机池可删除default项
  themeExclude: ['default'],

  // 是否启用背景毛玻璃效果，若渲染遇到问题可设置为false关闭
  bgBlur: true,

  // style
  style: {
    fontColor: '#ceb78b',
    descColor: '#eee',
    contBgColor: 'rgba(6, 21, 31, .5)',
    contBgBlur: 3,
    headerBgColor: 'rgba(6, 21, 31, .4)',
    rowBgColor1: 'rgba(6, 21, 31, .2)',
    rowBgColor2: 'rgba(6, 21, 31, .35)'
  }
}

// 帮助菜单内容
export const helpList = [{
  group: '随机角色图片',
  list: [{
    icon: 7,
    title: '#甘雨照片 椰羊照片',
    desc: '查看指定角色的图片'
  }, {
    icon: 6,
    title: '#随机图片 随机图片',
    desc: '查看随机角色图片'
  }]
}, {
  group: '管理命令，仅管理员可用',
  auth: 'master',
  list: [{
    icon: 85,
    title: '#随机图设置',
    desc: '配置随机图功能'
  }, {
    icon: 66,
    title: '#随机图插件(强制)?更新',
    desc: '更新随机图插件'
  }, {
    icon: 67,
    title: '#随机图片数据更新',
    desc: '更新随机图片数据'
  }, {
    icon: 68,
    title: '#随机图片更新',
    desc: '更新本地图片仓库'
  }]
}]
