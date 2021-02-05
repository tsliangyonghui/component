<script>
import Upload from './upload'
function noop() { }
export default {
  name: 'MUpload',
  components: {
    Upload
  },
  provide() {
    return {
      uploader: this
    }
  },
  inject: {
    mForm: {
      default: ''
    }
  },
  props: {
    action: {
      type: String,
      required: true
    },
    headers: {
      type: Object,
      default() {
        return {}
      }
    },
    data: Object,
    multiple: Boolean,
    name: {
      type: String,
      default: 'file'
    },
    drag: Boolean,
    dragger: Boolean,
    withCredentials: Boolean,
    showFileList: {
      type: Boolean,
      default: true
    },
    accept: String,
    type: {
      type: String,
      default: 'select'
    },
    beforeUpload: Function,
    beforeRemove: Function,
    onRemove: {
      type: Function,
      default: noop
    },
    onChange: {
      type: Function,
      default: noop
    },
    onPreview: {
      type: Function
    },
    onSuccess: {
      type: Function,
      default: noop
    },
    onProgress: {
      type: Function,
      default: noop
    },
    onError: {
      type: Function,
      default: noop
    },
    fileList: {
      type: Array,
      default() {
        return []
      }
    },
    autoUpload: {
      type: Boolean,
      default: true
    },
    listType: {
      type: String,
      default: 'text' // text,picture,picture-card
    },
    httpRequest: Function,
    disabled: Boolean,
    limit: Number,
    onExceed: {
      type: Function,
      default: noop
    }
  },
  data() {
    return {
      uploadFiles: [],
      dragOver: false,
      draging: false,
      tempIndex: 1
    }
  },
  methods: {
    handleStart(rawFile) {
      rawFile.uid = Date.now() + this.tempIndex++
      const file = {
        status: 'ready',
        name: rawFile.name,
        size: rawFile.size,
        percentage: 0,
        uid: rawFile.uid,
        raw: rawFile
      }
      if (this.listType === 'picture-card' || this.listType === 'picture') {
        try {
          file.url = URL.createObjectURL(rawFile)
        } catch (err) {
          console.error('[Element Error][Upload]', err)
          return
        }
      }
      this.uploadFiles.push(file)
      this.onChange(file, this.uploadFiles)
    },
    handleProgress(ev, rawFile) {
      const file = this.getFile(rawFile)
      this.onProgress(ev, file, this.uploadFiles)
      file.status = 'uploading'
      file.percentage = ev.percent || 0
    },
    handleSuccess(res, rawFile) {
      const file = this.getFile(rawFile)

      if (file) {
        file.status = 'success'
        file.response = res

        this.onSuccess(res, file, this.uploadFiles)
        this.onChange(file, this.uploadFiles)
      }
    },
    handleError(err, rawFile) {
      const file = this.getFile(rawFile)
      const fileList = this.uploadFiles

      file.status = 'fail'

      fileList.splice(fileList.indexOf(file), 1)

      this.onError(err, file, this.uploadFiles)
      this.onChange(file, this.uploadFiles)
    },
    handleRemove(file, raw) {
      if (raw) {
        file = this.getFile(raw)
      }
      const doRemove = () => {
        this.abort(file)
        const fileList = this.uploadFiles
        fileList.splice(fileList.indexOf(file), 1)
        this.onRemove(file, fileList)
      }

      if (!this.beforeRemove) {
        doRemove()
      } else if (typeof this.beforeRemove === 'function') {
        const before = this.beforeRemove(file, this.uploadFiles)
        if (before && before.then) {
          before.then(() => {
            doRemove()
          }, noop)
        } else if (before !== false) {
          doRemove()
        }
      }
    },
    getFile(rawFile) {
      const fileList = this.uploadFiles
      let target
      fileList.every(item => {
        target = rawFile.uid === item.uid ? item : null
        return !target
      })
      return target
    },
    abort(file) {
      this.$refs['upload-inner'].abort(file)
    }
  },
  beforeDestroy() {
    this.uploadFiles.forEach(file => {
      if (file.url && file.url.indexOf('blob:') === 0) {
        URL.revokeObjectURL(file.url)
      }
    })
  },
  render(h) {
    let uploadList

    if (this.showFileList) {
      uploadList = (
        <UploadList
          disabled={this.uploadDisabled}
          listType={this.listType}
          files={this.uploadFiles}
          on-remove={this.handleRemove}
          handlePreview={this.onPreview}>
          {
            (props) => {
              if (this.$scopedSlots.file) {
                return this.$scopedSlots.file({
                  file: props.file
                })
              }
            }
          }
        </UploadList>
      )
    }

    const uploadData = {
      props: {
        type: this.type,
        drag: this.drag,
        action: this.action,
        multiple: this.multiple,
        'before-upload': this.beforeUpload,
        'with-credentials': this.withCredentials,
        headers: this.headers,
        name: this.name,
        data: this.data,
        accept: this.accept,
        fileList: this.uploadFiles,
        autoUpload: this.autoUpload,
        listType: this.listType,
        disabled: this.uploadDisabled,
        limit: this.limit,
        'on-exceed': this.onExceed,
        'on-start': this.handleStart,
        'on-progress': this.handleProgress,
        'on-success': this.handleSuccess,
        'on-error': this.handleError,
        'on-preview': this.onPreview,
        'on-remove': this.handleRemove,
        'http-request': this.httpRequest
      },
      ref: 'upload-inner'
    }

    const trigger = this.$slots.trigger || this.$slots.default
    const uploadComponent = <upload {...uploadData}>{trigger}</upload>

    return (
      <div>
        { this.listType === 'picture-card' ? uploadList : ''}
        {
          this.$slots.trigger
            ? [uploadComponent, this.$slots.default]
            : uploadComponent
        }
        {this.$slots.tip}
        { this.listType !== 'picture-card' ? uploadList : ''}
      </div>
    )
  }
}
</script>
<style >
.el-upload {
  display: inline-block;
  text-align: center;
  cursor: pointer;
  outline: none;
}

.el-upload__input {
  display: none;
}

.el-upload__tip {
  font-size: 12px;
  color: #606266;
  margin-top: 7px;
}

.el-upload iframe {
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  opacity: 0;
  filter: alpha(opacity=0);
}

.el-upload--picture-card {
  background-color: #fbfdff;
  border: 1px dashed #c0ccda;
  border-radius: 6px;
  box-sizing: border-box;
  width: 148px;
  height: 148px;
  cursor: pointer;
  line-height: 146px;
  vertical-align: top;
}

.el-upload--picture-card i {
  font-size: 28px;
  color: #8c939d;
}

.el-upload--picture-card:hover,
.el-upload:focus {
  border-color: #409eff;
  color: #409eff;
}

.el-upload:focus .el-upload-dragger {
  border-color: #409eff;
}

.el-upload-dragger {
  background-color: #fff;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  box-sizing: border-box;
  width: 360px;
  height: 180px;
  text-align: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.el-upload-dragger .el-icon-upload {
  font-size: 67px;
  color: #c0c4cc;
  margin: 40px 0 16px;
  line-height: 50px;
}

.el-upload-dragger + .el-upload__tip {
  text-align: center;
}

.el-upload-dragger ~ .el-upload__files {
  border-top: 1px solid #dcdfe6;
  margin-top: 7px;
  padding-top: 5px;
}

.el-upload-dragger .el-upload__text {
  color: #606266;
  font-size: 14px;
  text-align: center;
}

.el-upload-dragger .el-upload__text em {
  color: #409eff;
  font-style: normal;
}

.el-upload-dragger:hover {
  border-color: #409eff;
}

.el-upload-dragger.is-dragover {
  background-color: rgba(32, 159, 255, 0.06);
  border: 2px dashed #409eff;
}

.el-upload-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.el-upload-list__item {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  margin-top: 5px;
  position: relative;
  box-sizing: border-box;
  border-radius: 4px;
  width: 100%;
}

.el-upload-list__item .el-progress {
  position: absolute;
  top: 20px;
  width: 100%;
}

.el-upload-list__item .el-progress__text {
  position: absolute;
  right: 0;
  top: -13px;
}

.el-upload-list__item .el-progress-bar {
  margin-right: 0;
  padding-right: 0;
}

.el-upload-list__item:first-child {
  margin-top: 10px;
}

.el-upload-list__item .el-icon-upload-success {
  color: #67c23a;
}

.el-upload-list__item .el-icon-close {
  display: none;
  position: absolute;
  top: 5px;
  right: 5px;
  cursor: pointer;
  opacity: 0.75;
  color: #606266;
}

.el-upload-list__item .el-icon-close:hover {
  opacity: 1;
}

.el-upload-list__item .el-icon-close-tip {
  display: none;
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 12px;
  cursor: pointer;
  opacity: 1;
  color: #409eff;
}

.el-upload-list__item:hover {
  background-color: #f5f7fa;
}

.el-upload-list__item:hover .el-icon-close {
  display: inline-block;
}

.el-upload-list__item:hover .el-progress__text {
  display: none;
}

.el-upload-list__item.is-success .el-upload-list__item-status-label {
  display: block;
}

.el-upload-list__item.is-success .el-upload-list__item-name:focus,
.el-upload-list__item.is-success .el-upload-list__item-name:hover {
  color: #409eff;
  cursor: pointer;
}

.el-upload-list__item.is-success:focus:not(:hover) .el-icon-close-tip {
  display: inline-block;
}

.el-upload-list__item.is-success:active,
.el-upload-list__item.is-success:not(.focusing):focus {
  outline-width: 0;
}

.el-upload-list__item.is-success:active .el-icon-close-tip,
.el-upload-list__item.is-success:focus .el-upload-list__item-status-label,
.el-upload-list__item.is-success:hover .el-upload-list__item-status-label,
.el-upload-list__item.is-success:not(.focusing):focus .el-icon-close-tip {
  display: none;
}

.el-upload-list.is-disabled
  .el-upload-list__item:hover
  .el-upload-list__item-status-label {
  display: block;
}

.el-upload-list__item-name {
  color: #606266;
  display: block;
  margin-right: 40px;
  overflow: hidden;
  padding-left: 4px;
  text-overflow: ellipsis;
  transition: color 0.3s;
  white-space: nowrap;
}

.el-upload-list__item-name [class^="el-icon"] {
  height: 100%;
  margin-right: 7px;
  color: #909399;
  line-height: inherit;
}

.el-upload-list__item-status-label {
  position: absolute;
  right: 5px;
  top: 0;
  line-height: inherit;
  display: none;
}

.el-upload-list__item-delete {
  position: absolute;
  right: 10px;
  top: 0;
  font-size: 12px;
  color: #606266;
  display: none;
}

.el-upload-list__item-delete:hover {
  color: #409eff;
}

.el-upload-list--picture-card {
  margin: 0;
  display: inline;
  vertical-align: top;
}

.el-upload-list--picture-card .el-upload-list__item {
  overflow: hidden;
  background-color: #fff;
  border: 1px solid #c0ccda;
  border-radius: 6px;
  box-sizing: border-box;
  width: 148px;
  height: 148px;
  margin: 0 8px 8px 0;
  display: inline-block;
}

.el-upload-list--picture-card .el-upload-list__item .el-icon-check,
.el-upload-list--picture-card .el-upload-list__item .el-icon-circle-check {
  color: #fff;
}

.el-upload-list--picture-card .el-upload-list__item .el-icon-close,
.el-upload-list--picture-card
  .el-upload-list__item:hover
  .el-upload-list__item-status-label {
  display: none;
}

.el-upload-list--picture-card .el-upload-list__item:hover .el-progress__text {
  display: block;
}

.el-upload-list--picture-card .el-upload-list__item-name {
  display: none;
}

.el-upload-list--picture-card .el-upload-list__item-thumbnail {
  width: 100%;
  height: 100%;
}

.el-upload-list--picture-card .el-upload-list__item-status-label {
  position: absolute;
  right: -15px;
  top: -6px;
  width: 40px;
  height: 24px;
  background: #13ce66;
  text-align: center;
  transform: rotate(45deg);
  box-shadow: 0 0 1pc 1px rgba(0, 0, 0, 0.2);
}

.el-upload-list--picture-card .el-upload-list__item-status-label i {
  font-size: 12px;
  margin-top: 11px;
  transform: rotate(-45deg);
}

.el-upload-list--picture-card .el-upload-list__item-actions {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  cursor: default;
  text-align: center;
  color: #fff;
  opacity: 0;
  font-size: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s;
}

.el-upload-list--picture-card .el-upload-list__item-actions:after {
  display: inline-block;
  content: "";
  height: 100%;
  vertical-align: middle;
}

.el-upload-list--picture-card .el-upload-list__item-actions span {
  display: none;
  cursor: pointer;
}

.el-upload-list--picture-card .el-upload-list__item-actions span + span {
  margin-left: 15px;
}

.el-upload-list--picture-card
  .el-upload-list__item-actions
  .el-upload-list__item-delete {
  position: static;
  font-size: inherit;
  color: inherit;
}

.el-upload-list--picture-card .el-upload-list__item-actions:hover {
  opacity: 1;
}

.el-upload-list--picture-card .el-upload-list__item-actions:hover span {
  display: inline-block;
}

.el-upload-list--picture-card .el-progress {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  bottom: auto;
  width: 126px;
}

.el-upload-list--picture-card .el-progress .el-progress__text {
  top: 50%;
}

.el-upload-list--picture .el-upload-list__item {
  overflow: hidden;
  z-index: 0;
  background-color: #fff;
  border: 1px solid #c0ccda;
  border-radius: 6px;
  box-sizing: border-box;
  margin-top: 10px;
  padding: 10px 10px 10px 90px;
  height: 92px;
}

.el-upload-list--picture .el-upload-list__item .el-icon-check,
.el-upload-list--picture .el-upload-list__item .el-icon-circle-check {
  color: #fff;
}

.el-upload-list--picture
  .el-upload-list__item:hover
  .el-upload-list__item-status-label {
  background: transparent;
  box-shadow: none;
  top: -2px;
  right: -12px;
}

.el-upload-list--picture .el-upload-list__item:hover .el-progress__text {
  display: block;
}

.el-upload-list--picture
  .el-upload-list__item.is-success
  .el-upload-list__item-name {
  line-height: 70px;
  margin-top: 0;
}

.el-upload-list--picture
  .el-upload-list__item.is-success
  .el-upload-list__item-name
  i {
  display: none;
}

.el-upload-list--picture .el-upload-list__item-thumbnail {
  vertical-align: middle;
  display: inline-block;
  width: 70px;
  height: 70px;
  float: left;
  position: relative;
  z-index: 1;
  margin-left: -80px;
  background-color: #fff;
}

.el-upload-list--picture .el-upload-list__item-name {
  display: block;
  margin-top: 20px;
}

.el-upload-list--picture .el-upload-list__item-name i {
  font-size: 70px;
  line-height: 1;
  position: absolute;
  left: 9px;
  top: 10px;
}

.el-upload-list--picture .el-upload-list__item-status-label {
  position: absolute;
  right: -17px;
  top: -7px;
  width: 46px;
  height: 26px;
  background: #13ce66;
  text-align: center;
  transform: rotate(45deg);
  box-shadow: 0 1px 1px #ccc;
}

.el-upload-list--picture .el-upload-list__item-status-label i {
  font-size: 12px;
  margin-top: 12px;
  transform: rotate(-45deg);
}

.el-upload-list--picture .el-progress {
  position: relative;
  top: -7px;
}

.el-upload-cover {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 10;
  cursor: default;
}

.el-upload-cover:after {
  display: inline-block;
  content: "";
  height: 100%;
  vertical-align: middle;
}

.el-upload-cover img {
  display: block;
  width: 100%;
  height: 100%;
}

.el-upload-cover__label {
  position: absolute;
  right: -15px;
  top: -6px;
  width: 40px;
  height: 24px;
  background: #13ce66;
  text-align: center;
  transform: rotate(45deg);
  box-shadow: 0 0 1pc 1px rgba(0, 0, 0, 0.2);
}

.el-upload-cover__label i {
  font-size: 12px;
  margin-top: 11px;
  transform: rotate(-45deg);
  color: #fff;
}

.el-upload-cover__progress {
  display: inline-block;
  vertical-align: middle;
  position: static;
  width: 243px;
}

.el-upload-cover__progress + .el-upload__inner {
  opacity: 0;
}

.el-upload-cover__content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.el-upload-cover__interact {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.72);
  text-align: center;
}

.el-upload-cover__interact .btn {
  display: inline-block;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  vertical-align: middle;
  transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1),
    opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  margin-top: 60px;
}

.el-upload-cover__interact .btn i {
  margin-top: 0;
}

.el-upload-cover__interact .btn span {
  opacity: 0;
  transition: opacity 0.15s linear;
}

.el-upload-cover__interact .btn:not(:first-child) {
  margin-left: 35px;
}

.el-upload-cover__interact .btn:hover {
  transform: translateY(-13px);
}

.el-upload-cover__interact .btn:hover span {
  opacity: 1;
}

.el-upload-cover__interact .btn i {
  color: #fff;
  display: block;
  font-size: 24px;
  line-height: inherit;
  margin: 0 auto 5px;
}

.el-upload-cover__title {
  position: absolute;
  bottom: 0;
  left: 0;
  background-color: #fff;
  height: 36px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 400;
  text-align: left;
  padding: 0 10px;
  margin: 0;
  line-height: 36px;
  font-size: 14px;
  color: #303133;
}

.el-upload-cover + .el-upload__inner {
  opacity: 0;
  position: relative;
  z-index: 1;
}
</style>