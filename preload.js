const { shell } = require('electron')

//获取作品ID
function getID(searchWord){
    return new Promise( (resolve, reject) => {
        var urlReg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g
        var v_url = urlReg.exec(searchWord)[0]
        var v_xhr = new XMLHttpRequest()
        v_xhr.open("GET",v_url,true)
        v_xhr.send()
        v_xhr.onload = () => {
            if (v_xhr.status >= 200 && v_xhr.status < 400) {
                var myregexp = /video\/(\d*)/
                resolve(myregexp.exec(v_xhr.responseURL)[1])
            } else {
                reject(v_xhr.status)
            }
        }
    })
}

//获取作品信息
function getInfo (d) {
    //官方接口
    var url = 'https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids='
    url += d
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest()
        xhr.open('get', url, true)
        xhr.responseType = 'json'
        xhr.onload = function() {
            var status = xhr.status
            if (status == 200) {
                resolve(xhr.response)
            } else {
                reject(xhr.status)
            }
        }
        xhr.send()
    })
}

//下载作品
function getVideo (url,title) {
	var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/92.0.4515.107");
    xhr.responseType = 'blob';
    xhr.onload = function (e) {
			//如果请求执行成功
        if (this.status == 200) {
            var blob = this.response;
            var filename = 'C:\\' + title + '.mp4';
            var a = document.createElement('a');
            blob.type = "application/octet-stream";
            //创键临时url
            var url = URL.createObjectURL(blob);
            a.href = url;
            a.download=filename;
            a.click();
            //释放URL对象
            window.URL.revokeObjectURL(url);
        }
    };
    xhr.send();
}

window.exports = {
   "tiktok": {
      mode: "list",
      args: {
         enter: (action, callbackSetList) => {
			return
         },

         search: (action, searchWord, callbackSetList) => {
            if (!searchWord) return callbackSetList()
            var d = ''
            getID (searchWord).then(function(datas){
                d = datas
                getInfo (d).then(function(data) {
                    desc = data['item_list'][0]['desc']
                    author = data['item_list'][0]['author']['nickname']
                    play = data['item_list'][0]['video']['play_addr']['url_list'][0]

                    callbackSetList([
                       {
                          title: desc,                                                      //标题
                          description: author+'      '+'点击下载无水印视频',                 //详情
                          icon:'logo.png',                                                 // 图标
                          url: play
                       }
                    ])

                }, function(status) {
                    callbackSetList([
                        {
                           title: '视频错误',                                              //标题
                           description: 'Error:'+status+'      '+'该视频可能已被删除',      //详情
                           icon:'error.png', 		                                      // 图标
                           url: ''
                        }
                     ])
                    //alert(status + '访问失败');
                })
            }, function(status) {//error
                callbackSetList([
                    {
                       title: '链接错误',			                                   //标题
                       description: 'Error:'+status+'      '+'请输入正确的抖音链接',    //详情
                       icon:'error.png', 		                                      // 图标
                       url: ''
                    }
                 ])
				//alert(status + '访问失败');
			})
         },
		 
         select: (action, itemData, callbackSetList) => {
            window.utools.hideMainWindow()
            const url = itemData.url
			n = url.replace("playwm","play");
			getVideo (n,desc)
            //播放视频，涉及无版权取消功能
			//window.utools.ubrowser.goto(desc,desc)
			//.goto(n,"Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/92.0.4515.107",desc)
			//.run({ width: 800, height: 600 })
			//shell.openExternal(itemData.url).then(() => {
			//  window.utools.outPlugin()
			//})
            //window.utools.outPlugin()
         },
         placeholder: "请输入链接"
      } 
   }
}