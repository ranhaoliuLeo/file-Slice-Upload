<template>
    <div id="app">
        <input type="file" @change="handleFileChange" />
        <el-button @click="handleUpload">上传</el-button>
    </div>
</template>

<script>
import request from './uitles'

// 定义一个文件大小
const SIZE = 10 * 1024 * 1024;

export default {
    name: 'App',
    data() {
        return {
            file: '',
            data: []
        }
    },
    methods: {
        // 获取input内的文件信息
        handleFileChange(e) {
            console.log(e.target.files[0])
            const file = e.target.files[0];
            this.file = file
        },
        // 处理相关的切片信息，并且上传
        async handleUpload() {
            if(!this.file) return 
            const fileChunkList = this.createFileChunk(this.file);
            this.data = fileChunkList.map(({ file }, index) => ({
                chunk: file,
                hash: this.file.name + '-' + index
            }));

            // 对切片做一些处理并且并发
            const requestList = this.data.map(({chunk, hash}) => {
                const formData = new FormData();
                formData.append('chunk', chunk);
                formData.append('hash', hash);
                formData.append('filename', this.file.name);
                return formData;
            }).map((formData) => {
                return request({
                    url: 'http://localhost:3000',
                    data: formData
                })
            })
            // 合并发送成功后，将会发起合并请求
            Promise.all(requestList).then(() => {
                this.mergeRequest()
            })
        },
        // 发起合并请求
        mergeRequest() {
            request({
                url: "http://localhost:3000/merge",
                headers: {
                    "content-type": "application/json"
                    },
                data: JSON.stringify({
                    filename: this.file.name
                })
            });
        },
        // 创建文件切片
        createFileChunk(file) {
            const fileChunkList = [];
            let cur = 0;
            while(cur < file.size) {
                fileChunkList.push({file: this.file.slice(cur, cur + SIZE)})
                cur = cur + SIZE
            }
            return fileChunkList;
        },

    },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
