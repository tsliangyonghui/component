<template>
  <div role="tree" class="el-tree">
    <!-- <m-tree-node v-for="child in root.childNodes" :node="child" :props="props" :key="getNodeKey(child)">
    </m-tree-node> -->
  </div>
</template>

<script>
import { getNodeKey } from './model/util'
import TreeStore from './model/tree-store'
import MTreeNode from './tree-node.vue'
import Emitter from '@/mixins/emitter'
export default {
  name: 'MTree',
  mixins: [Emitter],
  components: {
    MTreeNode
  },
  props: {
    data: {
      type: Array
    },
    emptyText: {
      type: String,
      default() {
        return ''
      }
    },
    renderAfterExpand: {
      type: Boolean,
      default: true
    },
    nodeKey: String,
    checkStrictly: Boolean,
    defaultExpandAll: Boolean,
    expandOnClickNode: {
      type: Boolean,
      default: true
    },
    checkOnClickNode: Boolean,
    checkDescendants: {
      type: Boolean,
      default: false
    },
    autoExpandParent: {
      type: Boolean,
      default: true
    },
    defaultCheckedKeys: Array,
    defaultExpandedKeys: Array,
    currentNodeKey: [String, Number],
    renderContent: Function,
    showCheckbox: {
      type: Boolean,
      default: false
    },
    draggable: {
      type: Boolean,
      default: false
    },
    allowDrag: Function,
    allowDrop: Function,
    props: {
      default() {
        return {
          children: 'children',
          label: 'label',
          disabled: 'disabled'
        }
      }
    },
    lazy: {
      type: Boolean,
      default: false
    },
    highlightCurrent: Boolean,
    load: Function,
    filterNodeMethod: Function,
    accordion: Boolean,
    indent: {
      type: Number,
      default: 18
    },
    iconClass: String
  },
  data() {
    return {
      store: null,
      root: null
    }
  },
  methods: {
    getNodeKey(node) {
      return getNodeKey(this.nodeKey, node.data)
    }
  },
  created() {
    this.store = new TreeStore({
      key: this.nodeKey,
      data: this.data,
      lazy: this.lazy,
      props: this.props,
      load: this.load,
      currentNodeKey: this.currentNodeKey,
      checkStrictly: this.checkStrictly,
      checkDescendants: this.checkDescendants,
      defaultCheckedKeys: this.defaultCheckedKeys,
      defaultExpandedKeys: this.defaultExpandedKeys,
      autoExpandParent: this.autoExpandParent,
      defaultExpandAll: this.defaultExpandAll,
      filterNodeMethod: this.filterNodeMethod
    })
  }
}
</script>
<style>
</style>