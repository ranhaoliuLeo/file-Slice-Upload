// 自定义一个xhr请求，方便做简易兼容 or 统一处理
export function request({url, method = 'post', data, headers = {}, requestList}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        Object.keys(headers).forEach(key => {
            xhr.setRequestHeader(key, headers[key])
        })
        xhr.send(data);
        xhr.onload = function(e) {
            resolve({
                data: e.target.response
            })
        }
    })
}