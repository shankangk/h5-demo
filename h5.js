const h5 = {
  // 百度地图弹窗选择地理位置
  function openBaiduMapModal() {
      const style = `
        html, body {
            height: 100%;
            margin: 0;
        }
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 9999;
        }
        .map-container {
            width: 100%;
            height: 100%;
            position: relative;
        }
        .search-box {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 70%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 16px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
            background-color: white;
            z-index: 10001;
            box-sizing: border-box;
        }
        .search-result {
            position: absolute;
            top: 60px;
            left: 50%;
            transform: translateX(-50%);
            width: 70%;
            max-height: 30vh;
            background-color: white;
            overflow-y: auto;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
            z-index: 10000;
        }
        .search-result ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .search-result li {
            padding: 10px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
        }
        .search-result li:hover {
            background-color: #f0f0f0;
        }
        .save-button {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            padding: 15px;
            background-color: #007bff;
            color: white;
            font-size: 18px;
            text-align: center;
            cursor: pointer;
            border: none;
            border-radius: 0 0 5px 5px;
            box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);
        }
        .save-button:hover {
            background-color: #0056b3;
        }
    `;
      const styleSheet = document.createElement("style");
      styleSheet.type = "text/css";
      styleSheet.innerText = style;
      document.head.appendChild(styleSheet);

      // 遮罩层
      const modalOverlay = document.createElement('div');
      modalOverlay.classList.add('modal-overlay');

      const mapContainer = document.createElement('div');
      mapContainer.classList.add('map-container');
      mapContainer.setAttribute('id', 'baiduMap');

      modalOverlay.appendChild(mapContainer);
      document.body.appendChild(modalOverlay);

      // 搜索输入框
      const searchBox = document.createElement('input');
      searchBox.classList.add('search-box');
      searchBox.type = 'text';
      searchBox.placeholder = '搜索地点';
      modalOverlay.appendChild(searchBox);

      // 列表
      const searchResultContainer = document.createElement('div');
      searchResultContainer.classList.add('search-result');
      searchResultContainer.style.display = 'none'; // 初始隐藏
      modalOverlay.appendChild(searchResultContainer);

      // 保存按钮
      const saveButton = document.createElement('button');
      saveButton.innerText = '确认选择';
      saveButton.classList.add('save-button');
      modalOverlay.appendChild(saveButton);

      // 地图初始化
      const map = new BMap.Map("baiduMap");
      map.enableScrollWheelZoom(true);

      const geolocation = new BMap.Geolocation();
      geolocation.getCurrentPosition(function (result) {
        if (this.getStatus() === BMAP_STATUS_SUCCESS) {
          const point = new BMap.Point(result.point.lng, result.point.lat);
          map.centerAndZoom(point, 15);  // 设置地图中心为当前定位位置
          const marker = new BMap.Marker(point);
          map.addOverlay(marker);  // 在当前位置打点

          let selectedLocation = { lng: result.point.lng, lat: result.point.lat };

          // 点击选择位置
          map.addEventListener("click", function (e) {
            const { lng, lat } = e.point;
            selectedLocation = { lng, lat };
            console.log(`Selected Location: ${lng}, ${lat}`);
            // 清除点 打点
            map.clearOverlays();
            const newMarker = new BMap.Marker(e.point);
            map.addOverlay(newMarker);
          });

          // 保存按钮事件
          saveButton.addEventListener('click', function () {
            if (selectedLocation) {
              console.log('保存的地理位置:', selectedLocation);
              document.body.removeChild(modalOverlay);
              return selectedLocation;
            } else {
              alert("请选择一个位置！");
            }
          });

        } else {
          alert('无法获取当前位置');
        }
      });

      // 搜索服务
      const localSearch = new BMap.LocalSearch(map, {
        onSearchComplete: function (results) {
          if (localSearch.getStatus() == BMAP_STATUS_SUCCESS) {
            // 清空列表
            searchResultContainer.innerHTML = '';
            const ul = document.createElement('ul');

            for (let i = 0; i < results.getCurrentNumPois(); i++) {
              const poi = results.getPoi(i);
              const li = document.createElement('li');
              li.textContent = poi.title + ' - ' + poi.address;
              li.addEventListener('click', function () {
                const point = poi.point;
                map.centerAndZoom(point, 15);  // 将地图中心移动到选择的地点
                selectedLocation = { lng: point.lng, lat: point.lat };
                map.clearOverlays();
                const newMarker = new BMap.Marker(point);
                map.addOverlay(newMarker);
                // 隐藏搜索结果
                searchResultContainer.style.display = 'none';
              });
              ul.appendChild(li);
            }
            searchResultContainer.appendChild(ul);
            // 显示搜索结果
            searchResultContainer.style.display = 'block';
          }
        }
      });

      // 输入框输入事件，执行搜索
      searchBox.addEventListener('input', function () {
        const searchValue = searchBox.value;
        if (searchValue) {
          // 搜索地点名称
          localSearch.search(searchValue);
        } else {
          // 隐藏搜索结果
          searchResultContainer.style.display = 'none';
        }
      });
    },
  /**
   * 视频压缩 需要配合ffmpeg.min.js使用
   * @param {string} inputFile 输入文件
   * @param {function} callback 压缩完成后的回调函数，接收一个Blob对象作为参数
   */
  // compressVideo(selectedFile, async (compressedBlob) => {
  // 	console.log('压缩后的视频流', compressedBlob);
  // });
  async compressVideo(inputFile, callback) {
    const { createFFmpeg, fetchFile } = FFmpeg;
    const ffmpeg = createFFmpeg({ log: true });

    try {
      await ffmpeg.load();
      ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(inputFile));
      await ffmpeg.run('-i', 'input.mp4', '-vcodec', 'libx264', '-crf', '28', 'output.mp4');
      const data = ffmpeg.FS('readFile', 'output.mp4');
      const compressedBlob = new Blob([data.buffer], { type: 'video/mp4' });
      callback(compressedBlob);
    } catch (error) {
      console.error('视频压缩失败:', error);
    }
  },
  // loading.open('提示信息') 默认显示 请稍后...
  // loading.close()
  loading: {
    open: function (message = '请稍等...') {
      const overlay = document.createElement('div');
      overlay.id = 'loading-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';
      overlay.style.flexDirection = 'column';
      overlay.style.zIndex = '9999';

      // 转圈
      const spinner = document.createElement('div');
      spinner.style.border = '5px solid #f3f3f3';
      spinner.style.borderTop = '5px solid #3498db';
      spinner.style.borderRadius = '50%';
      spinner.style.width = '20px';
      spinner.style.height = '20px';
      spinner.style.animation = 'spin 2s linear infinite';

      // 提示文字
      const messageDiv = document.createElement('div');
      messageDiv.innerText = message;
      messageDiv.style.marginTop = '15px';
      messageDiv.style.color = '#fff';
      messageDiv.style.fontSize = '16px';
      messageDiv.style.textAlign = 'center';

      overlay.appendChild(spinner);
      overlay.appendChild(messageDiv);

      document.body.appendChild(overlay);

      const style = document.createElement('style');
      style.type = 'text/css';
      const keyframes = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
      style.innerHTML = keyframes;
      document.head.appendChild(style);
    },

    close: function () {
      const overlay = document.getElementById('loading-overlay');
      if (overlay) {
        document.body.removeChild(overlay);
      }
    },
  },
  /**
   * 图片添加水印
   * @param {string} imageSrc 图片地址
   * @param {Array} watermarks 水印数组对象，每个元素包含水印的属性 如：text文字, x距离左边距离, y距离顶部距离, font字体样式, color字体颜色, textAlign, textBaseline
   * @param {Function} callback 回调函数，返回添加水印后的图片地址
   * */
  // addWatermarkToImage(imageUrl, watermarks, function(watermarkedImageUrl) {
  //   console.log(watermarkedImageUrl);
  // });
  addWatermarkToImage: function (imageSrc, watermarks, callback) {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // 防止图片不同源
    img.onload = function () {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      watermarks.forEach((watermark) => {
        ctx.font = watermark.font || '20px';
        ctx.fillStyle = watermark.color || 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = watermark.textAlign || 'left';
        ctx.textBaseline = watermark.textBaseline || 'bottom';
        ctx.fillText(watermark.text, watermark.x || 20, watermark.y || canvas.height - 20);
      });

      const watermarkedImage = canvas.toDataURL('image/png');
      callback(watermarkedImage);
    };
    img.src = imageSrc;
  },
  // 选择图片并回显 传入上传按钮id以及需要预览的盒子的id
  uploadAndPreview: function (uploadId, previewId) {
    const uploadDiv = document.getElementById(uploadId);
    const previewImage = document.getElementById(previewId);

    uploadDiv.addEventListener('click', function () {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';

      fileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            previewImage.src = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      });

      document.body.appendChild(fileInput);
      fileInput.click();
      document.body.removeChild(fileInput);
    });
  },

  // 根据路径打开图片
  openImage: function (src, previewId) {
    const preview = document.getElementById(previewId);
    if (src) {
      preview.src = src;
    } else {
      alert('请输入有效的图片路径。');
    }
  },

  // 获取当前位置信息
  // 使用示例
  // getCurrentLocation()
  // .then((location) => {
  //   console.log("纬度：" + location.latitude + ", 经度：" + location.longitude);
  // })
  // .catch((error) => {
  //   alert(error.message);
  // });
  getCurrentLocation: function () {
    return new Promise((resolve, reject) => {
      // 检查浏览器是否支持地理位置
      if (navigator.geolocation) {
        // 获取当前位置
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // 提取纬度和经度
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            // 解析Promise并返回经纬度
            resolve({ latitude, longitude });
          },
          (error) => {
            // 处理错误并拒绝Promise
            let errorMsg;
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMsg = '用户拒绝了位置请求，请允许访问位置以获取您的位置信息。';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMsg = '位置信息不可用。';
                break;
              case error.TIMEOUT:
                errorMsg = '获取位置信息超时。';
                break;
              case error.UNKNOWN_ERROR:
                errorMsg = '发生未知错误。';
                break;
            }
            // 拒绝Promise并返回错误信息
            reject(new Error(errorMsg));
          },
        );
      } else {
        // 浏览器不支持地理位置
        reject(new Error('Geolocation is not supported by this browser.'));
      }
    });
  },

  // 扫码信息 必须同时要引入html5-qrcode.min.js文件
  // 使用示例
  // startScanning().then(qrCodeMessage => {
  //   alert('扫描结果: ' + qrCodeMessage);
  // }).catch(error => {
  //   alert('扫描出错: ' + error.message);
  // });
  startScanning: function (id) {
    return new Promise((resolve, reject) => {
      let html5QrcodeScanner = null;

      // 创建扫描器实例
      if (!html5QrcodeScanner) {
        html5QrcodeScanner = new Html5QrcodeScanner(
          id ?? 'reader', // HTML元素的ID，用于放置扫描器 默认使用reader
          {
            fps: 10, // 每秒帧数
            qrbox: 250, // 扫描框的大小（正方形）
          },
        );

        html5QrcodeScanner.render(
          (qrCodeMessage) => {
            // 扫描成功，返回结果并清除扫描器
            resolve(qrCodeMessage);
            html5QrcodeScanner.clear();
            html5QrcodeScanner = null;
          },
          (error) => {
            // 扫描失败，打印错误信息
            console.warn(`扫描失败: ${error}`);
          },
        );
      } else {
        reject(new Error('扫描器已经在运行'));
      }
    });
  },

  // 本地录音
  setupRecording: function (startRecordingButtonId, stopRecordingButtonId, playRecordingButtonId) {
    let mediaRecorder;
    let chunks = [];

    const startRecordingButton = document.getElementById(startRecordingButtonId);
    const stopRecordingButton = document.getElementById(stopRecordingButtonId);
    const playRecordingButton = document.getElementById(playRecordingButtonId);

    let audioElement;

    startRecordingButton.addEventListener('click', () => {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then((stream) => {
          mediaRecorder = new MediaRecorder(stream);

          mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
          mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, {
              type: 'audio/wav',
            });
            chunks = [];
            if (!audioElement) {
              audioElement = document.createElement('audio');
            }
            audioElement.src = URL.createObjectURL(blob);
            playRecordingButton.style.display = 'block';
          };

          mediaRecorder.start();
          startRecordingButton.disabled = true;
          stopRecordingButton.disabled = false;
        })
        .catch((err) => console.error('录音失败：', err));
    });
    stopRecordingButton.addEventListener('click', () => {
      mediaRecorder.stop();
      startRecordingButton.disabled = false;
      stopRecordingButton.disabled = true;
    });
    playRecordingButton.addEventListener('click', () => {
      if (audioElement) {
        audioElement.play();
      }
    });
  },

  // post请求
  postData: function (api, data) {
    // 定义POST接口请求的URL
    const apiUrl = api; // 'https://xxx.com/api'替换为你的接口URL

    // 定义POST请求的数据 {key:value}
    const postData = data;
    const res = fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    return res;
  },

  // 获取两个经纬度之间的距离
  getDistanceBetweenPoints: function (lat1, lon1, lat2, lon2) {
    function degreesToRadians(degrees) {
      return (degrees * Math.PI) / 180;
    }
    const earthRadiusKm = 6371; // 地球半径，单位：公里

    const dLat = degreesToRadians(lat2 - lat1);
    const dLon = degreesToRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = earthRadiusKm * c; // 结果单位：公里
    return distance;
  },

  // 拨打电话
  callPhone: function (phoneNumber) {
    window.location.href = `tel:${phoneNumber}`;
  },

  // 播放声音
  playSound: function (audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch((error) => console.error('播放声音失败：', error));
  },

  // 页面跳转
  jumpTo: function (url) {
    window.location.href = url;
  },

  // toast提示 默认时间1.5s
  toast: function (message, duration = 1500) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    toast.style.display = 'block';
    toast.style.position = 'fixed';
    toast.style.top = '20%';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    toast.style.color = '#fff';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.fontSize = '16px';
    toast.style.zIndex = '9999';
    setTimeout(() => {
      toast.style.display = 'none';
      document.body.removeChild(toast);
    }, duration);
  },

  // 获取当前经纬度
  // 使用示例 https下
  // getLocation()
  //   .then((position) => {
  //       console.log("纬度：" + position.latitude + ", 经度：" + position.longitude);
  //   })
  //   .catch((error) => {
  //       console.error("错误：" + error);
  //   });
  // 或者
  // const res = await getLocation()
  getGeolocation: function () {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            resolve({ latitude, longitude });
          },
          (error) => {
            let errorMsg;
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMsg = '用户拒绝了位置请求，请允许访问位置以获取您的位置信息。';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMsg = '位置信息不可用。';
                break;
              case error.TIMEOUT:
                errorMsg = '获取位置信息超时。';
                break;
              case error.UNKNOWN_ERROR:
                errorMsg = '发生未知错误。';
                break;
            }
            reject(errorMsg);
          },
        );
      } else {
        reject('Geolocation is not supported by this browser.');
      }
    });
  },

  // 根据地址获取经纬度
  getGeolocationByAddress: function (address) {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK') {
          const location = results[0].geometry.location;
          resolve({ latitude: location.lat(), longitude: location.lng() });
        } else {
          reject('获取不成功: ' + status);
        }
      });
    });
  },

  // 本地缓存对象
  setStorage: function (key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getStorage: function (key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  removeStorage: function (key) {
    localStorage.removeItem(key);
  },
  // 缓存到cookie

  // 上传文件
  uploadFile: function (url, file) {
    const formData = new FormData();
    formData.append('file', file);
    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => resolve(data))
        .catch((error) => reject(error));
    });
  },

  // 父子页面通信
  sendMessage: function (message) {
    const event = new CustomEvent('message', { detail: message });
    window.dispatchEvent(event);
  },
  // 接收
  // 示例
  // receiveMessage().then((message) => console.log(message));
  receiveMessage: function () {
    return new Promise((resolve) => {
      const messageHandler = (event) => {
        window.removeEventListener('message', messageHandler);
        resolve(event.detail);
      };
      window.addEventListener('message', messageHandler);
    });
  },

  // 复制
  copyToClipboard: function (text) {
    return navigator.clipboard
      .writeText(text)
      .then(() => {
        alert('文本已复制到剪贴板！');
      })
      .catch((err) => {
        alert('复制失败：', err);
      });
  },

  // 选择文件
  selectFile: function (acceptTypes = []) {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = acceptTypes.join(',');
      input.style.display = 'none';
      input.onchange = () => {
        if (input.files.length > 0) {
          resolve(input.files[0]);
        } else {
          reject('未选择文件');
        }
      };
      input.click();
    });
  },

  // 选择视频
  selectVideo: function () {
    return this.selectFile(['video/*']);
  },

  // 打开视频
  openVideo: function (url, width, height) {
    const video = document.createElement('video');
    video.src = url;
    video.controls = true;
    video.style.width = width ?? '100%';
    video.style.height = height ?? 'auto';
    document.body.appendChild(video);
    video.play().catch((error) => {
      console.error('播放视频失败:', error);
    });
  },

  // 弹窗查看图片
  openImage: function (imageUrl, width, height) {
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.left = '50%';
    popup.style.top = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.zIndex = '1000';
    popup.style.backgroundColor = '#fff';
    popup.style.padding = '10px';
    popup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.width = width;
    img.style.height = height;
    img.style.maxWidth = '90vw';
    img.style.maxHeight = '90vh';

    const closeButton = document.createElement('button');
    closeButton.innerText = '关闭';
    closeButton.style.display = 'block';
    closeButton.style.margin = '10px auto 0';
    closeButton.onclick = () => {
      document.body.removeChild(popup);
    };

    popup.appendChild(img);
    popup.appendChild(closeButton);

    document.body.appendChild(popup);
  },

  // 下载文件
  downloadFile: function (url) {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.download = 'name';
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },

  // 更新页面title
  updateTitle: function (title) {
    document.title = title;
  },

  // 语音识别
  // 示例50.voiceRecognize.html
  initSpeechRecognition: function (onResultCallback, onErrorCallback) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'zh-CN';

    recognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript;
      if (onResultCallback) onResultCallback(transcript);
    };

    recognition.onerror = function (event) {
      if (onErrorCallback) onErrorCallback(event.error);
    };

    return {
      start: () => {
        recognition.start();
        console.log('开始语音识别。');
      },
      stop: () => {
        recognition.stop();
        console.log('停止语音识别。');
      },
    };
  },

  // datePicker
  // const calendar = new h5.datePicker();
  // 	calendar.init({
  // 		'trigger': '#datetimeInput', /*触发弹出日期选择 选择日期自动填充到这个id中*/
  // 		'type': 'datetime',/*模式：date日期；datetime日期时间；time时间；ym年月；*/
  // 		'minDate': '1900-1-1',/*最小日期*/
  // 		'maxDate': '2100-12-31',/*最大日期*/
  // 		'onSubmit': function () {/*确认时触发事件*/
  // 		},
  // 		'onClose': function () {/*取消时触发事件*/
  // 		}
  // 	});
  datePicker: (function () {
    var MobileCalendar = function () {
      this.gearDate;
      this.minY = 1900;
      this.minM = 1;
      this.minD = 1;
      this.maxY = 2099;
      this.maxM = 12;
      this.maxD = 31;
      this.value = '';
    };

    var cssHtm =
      '.gearYM,.gearDate,.gearDatetime,.gearTime{font-family:Helvetica Neue,Helvetica,Arial,sans-serif;font-size:10px;background-color:rgba(0,0,0,0.2);display:block;position:fixed;top:0;left:0;width:100%;height:100%;z-index:9900;overflow:hidden;-webkit-animation-fill-mode:both;animation-fill-mode:both}.date_ctrl{vertical-align:middle;background-color:#d5d8df;color:#000;margin:0;height:auto;width:100%;position:absolute;left:0;bottom:0;z-index:9901;overflow:hidden;-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}.slideInUp{animation:slideInUp .3s ease;-webkit-animation:slideInUp .3s ease;}@-webkit-keyframes slideInUp{from{-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}to{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}.ym_roll,.date_roll,.datetime_roll,.time_roll{display:-webkit-box;width:100%;height:auto;overflow:hidden;font-weight:bold;background-color:transparent;-webkit-mask:-webkit-gradient(linear,0% 50%,0% 100%,from(#debb47),to(rgba(36,142,36,0)));-webkit-mask:-webkit-linear-gradient(top,#debb47 50%,rgba(36,142,36,0))}.ym_roll>div,.date_roll>div,.datetime_roll>div,.time_roll>div{font-size:2.3em;height:6em;float:left;background-color:transparent;position:relative;overflow:hidden;-webkit-box-flex:4}.ym_roll>div .gear,.date_roll>div .gear,.datetime_roll>div .gear,.time_roll>div .gear{width:100%;float:left;position:absolute;z-index:9902;margin-top:-6em}.date_roll_mask{-webkit-mask:-webkit-gradient(linear,0% 40%,0% 0%,from(#debb47),to(rgba(36,142,36,0)));-webkit-mask:-webkit-linear-gradient(bottom,#debb47 50%,rgba(36,142,36,0));padding:0 0 3em 0}.date_roll>div:nth-child(2){-webkit-box-flex:2}.date_roll>div:nth-child(1),.datetime_roll>div:nth-child(1){-webkit-box-flex:4}.datetime_roll>div:first-child{-webkit-box-flex:6}.datetime_roll>div:last-child{-webkit-box-flex:6}.date_grid{position:relative;top:2em;width:100%;height:2em;margin:0;box-sizing:border-box;z-index:0;border-top:1px solid #abaeb5;border-bottom:1px solid #abaeb5}.date_grid>div{color:#000;position:absolute;right:0;top:0;font-size:.8em;line-height:2.5em}.date_roll>div:nth-child(3) .date_grid>div{left:42%}.datetime_roll>div .date_grid>div{right:0}.datetime_roll>div:first-child .date_grid>div{left:auto;right:0%}.datetime_roll>div:last-child .date_grid>div{left:50%}.time_roll>div:nth-child(1) .date_grid>div{right:1em}.ym_roll>div:nth-child(1) .date_grid>div{right:.1em}.ym_roll>div .date_grid>div,.time_roll>div .date_grid>div{right:5em}.date_btn{color:#0575f2;font-size:1.6em;font-weight:bold;line-height:1em;text-align:center;padding:.8em 1em}.date_btn_box:before,.date_btn_box:after{content:"";position:absolute;height:1px;width:100%;display:block;background-color:#96979b;z-index:15;-webkit-transform:scaleY(0.33);transform:scaleY(0.33)}.date_btn_box{display:-webkit-box;-webkit-box-pack:justify;-webkit-box-align:stretch;background-color:#f1f2f4;position:relative}.date_btn_box:before{left:0;top:0;-webkit-transform-origin:50% 20%;transform-origin:50% 20%}.date_btn_box:after{left:0;bottom:0;-webkit-transform-origin:50% 70%;transform-origin:50% 70%}.date_roll>div:nth-child(1) .gear{text-indent:20%}.date_roll>div:nth-child(2) .gear{text-indent:-20%}.date_roll>div:nth-child(3) .gear{text-indent:-55%}.datetime_roll>div .gear{width:100%;text-indent:-25%}.datetime_roll>div:first-child .gear{text-indent:-10%}.datetime_roll>div:last-child .gear{text-indent:-50%}.ym_roll>div .gear,.time_roll>div .gear{width:100%;text-indent:-70%}.ym_roll>div:nth-child(1) .gear,.time_roll>div:nth-child(1) .gear{width:100%;text-indent:10%}.tooth{height:2em;line-height:2em;text-align:center}';
    var cssEle = document.createElement('style');
    cssEle.type = 'text/css';
    cssEle.appendChild(document.createTextNode(cssHtm));
    document.getElementsByTagName('head')[0].appendChild(cssEle);

    MobileCalendar.prototype = {
      init: function (params) {
        this.type = params.type;
        this.trigger = document.querySelector(params.trigger);
        if (this.trigger.getAttribute('data-lcalendar') != null) {
          var arr = this.trigger.getAttribute('data-lcalendar').split(',');
          var minArr = arr[0].split('-');
          this.minY = ~~minArr[0];
          this.minM = ~~minArr[1];
          this.minD = ~~minArr[2];
          var maxArr = arr[1].split('-');
          this.maxY = ~~maxArr[0];
          this.maxM = ~~maxArr[1];
          this.maxD = ~~maxArr[2];
        }
        if (params.minDate) {
          var minArr = params.minDate.split('-');
          this.minY = ~~minArr[0];
          this.minM = ~~minArr[1];
          this.minD = ~~minArr[2];
        }
        if (params.maxDate) {
          var maxArr = params.maxDate.split('-');
          this.maxY = ~~maxArr[0];
          this.maxM = ~~maxArr[1];
          this.maxD = ~~maxArr[2];
        }
        this.onClose = params.onClose;
        this.onSubmit = params.onSubmit;
        this.onChange = params.onChange;
        this.bindEvent(this.type);
      },
      bindEvent: function (type) {
        var _self = this;
        var isTouched = false,
          isMoved = false;
        var pree;
        //呼出日期插件
        function popupDate(e) {
          _self.gearDate = document.createElement('div');
          _self.gearDate.className = 'gearDate';
          _self.gearDate.innerHTML =
            '<div class="date_ctrl slideInUp">' +
            '<div class="date_btn_box">' +
            '<div class="date_btn lcalendar_cancel">取消</div>' +
            '<div class="date_btn lcalendar_finish">确定</div>' +
            '</div>' +
            '<div class="date_roll_mask">' +
            '<div class="date_roll">' +
            '<div>' +
            '<div class="gear date_yy" data-datetype="date_yy"></div>' +
            '<div class="date_grid">' +
            '<div>年</div>' +
            '</div>' +
            '</div>' +
            '<div>' +
            '<div class="gear date_mm" data-datetype="date_mm"></div>' +
            '<div class="date_grid">' +
            '<div>月</div>' +
            '</div>' +
            '</div>' +
            '<div>' +
            '<div class="gear date_dd" data-datetype="date_dd"></div>' +
            '<div class="date_grid">' +
            '<div>日</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div><div class="date_bg" style="width:100%;height:100%;"></div>';
          document.body.appendChild(_self.gearDate);
          dateCtrlInit();
          var lcalendar_cancel = _self.gearDate.querySelector('.lcalendar_cancel');
          lcalendar_cancel.addEventListener('touchstart', closeMobileCalendar);
          var lcalendar_finish = _self.gearDate.querySelector('.lcalendar_finish');
          lcalendar_finish.addEventListener('touchstart', finishMobileDate);
          var lcalendar_bg = _self.gearDate.querySelector('.date_bg');
          lcalendar_bg.addEventListener('click', closeMobileCalendar);
          var date_yy = _self.gearDate.querySelector('.date_yy');
          var date_mm = _self.gearDate.querySelector('.date_mm');
          var date_dd = _self.gearDate.querySelector('.date_dd');
          date_yy.addEventListener('touchstart', gearTouchStart);
          date_mm.addEventListener('touchstart', gearTouchStart);
          date_dd.addEventListener('touchstart', gearTouchStart);
          date_yy.addEventListener('touchmove', gearTouchMove);
          date_mm.addEventListener('touchmove', gearTouchMove);
          date_dd.addEventListener('touchmove', gearTouchMove);
          date_yy.addEventListener('touchend', gearTouchEnd);
          date_mm.addEventListener('touchend', gearTouchEnd);
          date_dd.addEventListener('touchend', gearTouchEnd);
          //-------------------------------------------------------------
          lcalendar_cancel.addEventListener('click', closeMobileCalendar);
          lcalendar_finish.addEventListener('click', finishMobileDate);
          date_yy.addEventListener('mousedown', gearTouchStart);
          date_mm.addEventListener('mousedown', gearTouchStart);
          date_dd.addEventListener('mousedown', gearTouchStart);
          date_yy.addEventListener('mousemove', gearTouchMove);
          date_mm.addEventListener('mousemove', gearTouchMove);
          date_dd.addEventListener('mousemove', gearTouchMove);
          date_yy.addEventListener('mouseup', gearTouchEnd);
          date_mm.addEventListener('mouseup', gearTouchEnd);
          date_dd.addEventListener('mouseup', gearTouchEnd);
          _self.gearDate.querySelector('.date_roll_mask').addEventListener('mouseleave', gearTouchOut);
          _self.gearDate.querySelector('.date_roll_mask').addEventListener('mouseup', gearTouchOut);
        }
        //初始化年月日插件默认值
        function dateCtrlInit() {
          var date = new Date();
          var dateArr = {
            yy: date.getYear(),
            mm: date.getMonth(),
            dd: date.getDate() - 1,
          };
          if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(_self.trigger.value)) {
            rs = _self.trigger.value.match(/(^|-)\d{1,4}/g);
            dateArr.yy = rs[0] - _self.minY;
            dateArr.mm = rs[1].replace(/-/g, '') - 1;
            dateArr.dd = rs[2].replace(/-/g, '') - 1;
          } else {
            dateArr.yy = dateArr.yy + 1900 - _self.minY;
          }
          _self.gearDate.querySelector('.date_yy').setAttribute('val', dateArr.yy);
          _self.gearDate.querySelector('.date_mm').setAttribute('val', dateArr.mm);
          _self.gearDate.querySelector('.date_dd').setAttribute('val', dateArr.dd);
          setDateGearTooth();
        }
        //呼出年月插件
        function popupYM(e) {
          _self.gearDate = document.createElement('div');
          _self.gearDate.className = 'gearDate';
          _self.gearDate.innerHTML =
            '<div class="date_ctrl slideInUp">' +
            '<div class="date_btn_box">' +
            '<div class="date_btn lcalendar_cancel">取消</div>' +
            '<div class="date_btn lcalendar_finish">确定</div>' +
            '</div>' +
            '<div class="date_roll_mask">' +
            '<div class="ym_roll">' +
            '<div>' +
            '<div class="gear date_yy" data-datetype="date_yy"></div>' +
            '<div class="date_grid">' +
            '<div>年</div>' +
            '</div>' +
            '</div>' +
            '<div>' +
            '<div class="gear date_mm" data-datetype="date_mm"></div>' +
            '<div class="date_grid">' +
            '<div>月</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div><div class="date_bg" style="width:100%;height:100%;"></div>';
          document.body.appendChild(_self.gearDate);
          ymCtrlInit();
          var lcalendar_cancel = _self.gearDate.querySelector('.lcalendar_cancel');
          lcalendar_cancel.addEventListener('touchstart', closeMobileCalendar);
          var lcalendar_finish = _self.gearDate.querySelector('.lcalendar_finish');
          lcalendar_finish.addEventListener('touchstart', finishMobileYM);
          var lcalendar_bg = _self.gearDate.querySelector('.date_bg');
          lcalendar_bg.addEventListener('click', closeMobileCalendar);
          var date_yy = _self.gearDate.querySelector('.date_yy');
          var date_mm = _self.gearDate.querySelector('.date_mm');
          date_yy.addEventListener('touchstart', gearTouchStart);
          date_mm.addEventListener('touchstart', gearTouchStart);
          date_yy.addEventListener('touchmove', gearTouchMove);
          date_mm.addEventListener('touchmove', gearTouchMove);
          date_yy.addEventListener('touchend', gearTouchEnd);
          date_mm.addEventListener('touchend', gearTouchEnd);
          //-------------------------------------------------------------
          lcalendar_cancel.addEventListener('click', closeMobileCalendar);
          lcalendar_finish.addEventListener('click', finishMobileYM);
          date_yy.addEventListener('mousedown', gearTouchStart);
          date_mm.addEventListener('mousedown', gearTouchStart);
          date_yy.addEventListener('mousemove', gearTouchMove);
          date_mm.addEventListener('mousemove', gearTouchMove);
          date_yy.addEventListener('mouseup', gearTouchEnd);
          date_mm.addEventListener('mouseup', gearTouchEnd);
          _self.gearDate.querySelector('.date_roll_mask').addEventListener('mouseleave', gearTouchOut);
          _self.gearDate.querySelector('.date_roll_mask').addEventListener('mouseup', gearTouchOut);
        }
        //初始化年月插件默认值
        function ymCtrlInit() {
          var date = new Date();
          var dateArr = {
            yy: date.getYear(),
            mm: date.getMonth(),
          };
          if (/^\d{4}-\d{1,2}$/.test(_self.trigger.value)) {
            rs = _self.trigger.value.match(/(^|-)\d{1,4}/g);
            dateArr.yy = rs[0] - _self.minY;
            dateArr.mm = rs[1].replace(/-/g, '') - 1;
          } else {
            dateArr.yy = dateArr.yy + 1900 - _self.minY;
          }
          _self.gearDate.querySelector('.date_yy').setAttribute('val', dateArr.yy);
          _self.gearDate.querySelector('.date_mm').setAttribute('val', dateArr.mm);
          setDateGearTooth();
        }
        //呼出日期+时间插件
        function popupDateTime(e) {
          _self.gearDate = document.createElement('div');
          _self.gearDate.className = 'gearDatetime';
          _self.gearDate.innerHTML =
            '<div class="date_ctrl slideInUp">' +
            '<div class="date_btn_box">' +
            '<div class="date_btn lcalendar_cancel">取消</div>' +
            '<div class="date_btn lcalendar_finish">确定</div>' +
            '</div>' +
            '<div class="date_roll_mask">' +
            '<div class="datetime_roll">' +
            '<div>' +
            '<div class="gear date_yy" data-datetype="date_yy"></div>' +
            '<div class="date_grid">' +
            '<div>年</div>' +
            '</div>' +
            '</div>' +
            '<div>' +
            '<div class="gear date_mm" data-datetype="date_mm"></div>' +
            '<div class="date_grid">' +
            '<div>月</div>' +
            '</div>' +
            '</div>' +
            '<div>' +
            '<div class="gear date_dd" data-datetype="date_dd"></div>' +
            '<div class="date_grid">' +
            '<div>日</div>' +
            '</div>' +
            '</div>' +
            '<div>' +
            '<div class="gear time_hh" data-datetype="time_hh"></div>' +
            '<div class="date_grid">' +
            '<div>时</div>' +
            '</div>' +
            '</div>' +
            '<div>' +
            '<div class="gear time_mm" data-datetype="time_mm"></div>' +
            '<div class="date_grid">' +
            '<div>分</div>' +
            '</div>' +
            '</div>' +
            '</div>' + //date_roll
            '</div>' + //date_roll_mask
            '</div><div class="date_bg" style="width:100%;height:100%;"></div>';
          document.body.appendChild(_self.gearDate);
          dateTimeCtrlInit();
          var lcalendar_cancel = _self.gearDate.querySelector('.lcalendar_cancel');
          lcalendar_cancel.addEventListener('touchstart', closeMobileCalendar);
          var lcalendar_finish = _self.gearDate.querySelector('.lcalendar_finish');
          lcalendar_finish.addEventListener('touchstart', finishMobileDateTime);
          var lcalendar_bg = _self.gearDate.querySelector('.date_bg');
          lcalendar_bg.addEventListener('click', closeMobileCalendar);
          var date_yy = _self.gearDate.querySelector('.date_yy');
          var date_mm = _self.gearDate.querySelector('.date_mm');
          var date_dd = _self.gearDate.querySelector('.date_dd');
          var time_hh = _self.gearDate.querySelector('.time_hh');
          var time_mm = _self.gearDate.querySelector('.time_mm');
          date_yy.addEventListener('touchstart', gearTouchStart);
          date_mm.addEventListener('touchstart', gearTouchStart);
          date_dd.addEventListener('touchstart', gearTouchStart);
          time_hh.addEventListener('touchstart', gearTouchStart);
          time_mm.addEventListener('touchstart', gearTouchStart);
          date_yy.addEventListener('touchmove', gearTouchMove);
          date_mm.addEventListener('touchmove', gearTouchMove);
          date_dd.addEventListener('touchmove', gearTouchMove);
          time_hh.addEventListener('touchmove', gearTouchMove);
          time_mm.addEventListener('touchmove', gearTouchMove);
          date_yy.addEventListener('touchend', gearTouchEnd);
          date_mm.addEventListener('touchend', gearTouchEnd);
          date_dd.addEventListener('touchend', gearTouchEnd);
          time_hh.addEventListener('touchend', gearTouchEnd);
          time_mm.addEventListener('touchend', gearTouchEnd);
          //-------------------------------------------------------------
          lcalendar_cancel.addEventListener('click', closeMobileCalendar);
          lcalendar_finish.addEventListener('click', finishMobileDateTime);
          date_yy.addEventListener('mousedown', gearTouchStart);
          date_mm.addEventListener('mousedown', gearTouchStart);
          date_dd.addEventListener('mousedown', gearTouchStart);
          time_hh.addEventListener('mousedown', gearTouchStart);
          time_mm.addEventListener('mousedown', gearTouchStart);
          date_yy.addEventListener('mousemove', gearTouchMove);
          date_mm.addEventListener('mousemove', gearTouchMove);
          date_dd.addEventListener('mousemove', gearTouchMove);
          time_hh.addEventListener('mousemove', gearTouchMove);
          time_mm.addEventListener('mousemove', gearTouchMove);
          date_yy.addEventListener('mouseup', gearTouchEnd);
          date_mm.addEventListener('mouseup', gearTouchEnd);
          date_dd.addEventListener('mouseup', gearTouchEnd);
          time_hh.addEventListener('mouseup', gearTouchEnd);
          time_mm.addEventListener('mouseup', gearTouchEnd);
          _self.gearDate.querySelector('.date_roll_mask').addEventListener('mouseleave', gearTouchOut);
          _self.gearDate.querySelector('.date_roll_mask').addEventListener('mouseup', gearTouchOut);
        }
        //初始化年月日时分插件默认值
        function dateTimeCtrlInit() {
          var date = new Date();
          var dateArr = {
            yy: date.getYear(),
            mm: date.getMonth(),
            dd: date.getDate() - 1,
            hh: date.getHours(),
            mi: date.getMinutes(),
          };
          if (/^\d{4}-\d{1,2}-\d{1,2}\s\d{2}:\d{2}$/.test(_self.trigger.value)) {
            rs = _self.trigger.value.match(/(^|-|\s|:)\d{1,4}/g);
            dateArr.yy = rs[0] - _self.minY;
            dateArr.mm = rs[1].replace(/-/g, '') - 1;
            dateArr.dd = rs[2].replace(/-/g, '') - 1;
            dateArr.hh = parseInt(rs[3].replace(/\s0?/g, ''));
            dateArr.mi = parseInt(rs[4].replace(/:0?/g, ''));
          } else {
            dateArr.yy = dateArr.yy + 1900 - _self.minY;
          }
          _self.gearDate.querySelector('.date_yy').setAttribute('val', dateArr.yy);
          _self.gearDate.querySelector('.date_mm').setAttribute('val', dateArr.mm);
          _self.gearDate.querySelector('.date_dd').setAttribute('val', dateArr.dd);
          setDateGearTooth();
          _self.gearDate.querySelector('.time_hh').setAttribute('val', dateArr.hh);
          _self.gearDate.querySelector('.time_mm').setAttribute('val', dateArr.mi);
          setTimeGearTooth();
        }
        //呼出时间插件
        function popupTime(e) {
          _self.gearDate = document.createElement('div');
          _self.gearDate.className = 'gearDate';
          _self.gearDate.innerHTML =
            '<div class="date_ctrl slideInUp">' +
            '<div class="date_btn_box">' +
            '<div class="date_btn lcalendar_cancel">取消</div>' +
            '<div class="date_btn lcalendar_finish">确定</div>' +
            '</div>' +
            '<div class="date_roll_mask">' +
            '<div class="time_roll">' +
            '<div>' +
            '<div class="gear time_hh" data-datetype="time_hh"></div>' +
            '<div class="date_grid">' +
            '<div>时</div>' +
            '</div>' +
            '</div>' +
            '<div>' +
            '<div class="gear time_mm" data-datetype="time_mm"></div>' +
            '<div class="date_grid">' +
            '<div>分</div>' +
            '</div>' +
            '</div>' +
            '</div>' + //time_roll
            '</div>' +
            '</div><div class="date_bg" style="width:100%;height:100%;"></div>';
          document.body.appendChild(_self.gearDate);
          timeCtrlInit();
          var lcalendar_cancel = _self.gearDate.querySelector('.lcalendar_cancel');
          lcalendar_cancel.addEventListener('touchstart', closeMobileCalendar);
          var lcalendar_finish = _self.gearDate.querySelector('.lcalendar_finish');
          lcalendar_finish.addEventListener('touchstart', finishMobileTime);
          var lcalendar_bg = _self.gearDate.querySelector('.date_bg');
          lcalendar_bg.addEventListener('click', closeMobileCalendar);
          var time_hh = _self.gearDate.querySelector('.time_hh');
          var time_mm = _self.gearDate.querySelector('.time_mm');
          time_hh.addEventListener('touchstart', gearTouchStart);
          time_mm.addEventListener('touchstart', gearTouchStart);
          time_hh.addEventListener('touchmove', gearTouchMove);
          time_mm.addEventListener('touchmove', gearTouchMove);
          time_hh.addEventListener('touchend', gearTouchEnd);
          time_mm.addEventListener('touchend', gearTouchEnd);
          //-------------------------------------------------------------
          lcalendar_cancel.addEventListener('click', closeMobileCalendar);
          lcalendar_finish.addEventListener('click', finishMobileTime);
          time_hh.addEventListener('mousedown', gearTouchStart);
          time_mm.addEventListener('mousedown', gearTouchStart);
          time_hh.addEventListener('mousemove', gearTouchMove);
          time_mm.addEventListener('mousemove', gearTouchMove);
          time_hh.addEventListener('mouseup', gearTouchEnd);
          time_mm.addEventListener('mouseup', gearTouchEnd);
          _self.gearDate.querySelector('.date_roll_mask').addEventListener('mouseleave', gearTouchOut);
          _self.gearDate.querySelector('.date_roll_mask').addEventListener('mouseup', gearTouchOut);
        }
        //初始化时分插件默认值
        function timeCtrlInit() {
          var d = new Date();
          var e = {
            hh: d.getHours(),
            mm: d.getMinutes(),
          };
          if (/^\d{2}:\d{2}$/.test(_self.trigger.value)) {
            rs = _self.trigger.value.match(/(^|:)\d{2}/g);
            e.hh = parseInt(rs[0].replace(/^0?/g, ''));
            e.mm = parseInt(rs[1].replace(/:0?/g, ''));
          }
          _self.gearDate.querySelector('.time_hh').setAttribute('val', e.hh);
          _self.gearDate.querySelector('.time_mm').setAttribute('val', e.mm);
          setTimeGearTooth();
        }
        //重置日期节点个数
        function setDateGearTooth() {
          var passY = _self.maxY - _self.minY + 1;
          var date_yy = _self.gearDate.querySelector('.date_yy');
          var itemStr = '';
          if (date_yy && date_yy.getAttribute('val')) {
            //得到年份的值
            var yyVal = parseInt(date_yy.getAttribute('val'));
            //p 当前节点前后需要展示的节点个数
            for (var p = 0; p <= passY - 1; p++) {
              itemStr += "<div class='tooth'>" + (_self.minY + p) + '</div>';
            }
            date_yy.innerHTML = itemStr;
            var top = Math.floor(parseFloat(date_yy.getAttribute('top')));
            if (!isNaN(top)) {
              top % 2 == 0 ? (top = top) : (top = top + 1);
              top > 8 && (top = 8);
              var minTop = 8 - (passY - 1) * 2;
              top < minTop && (top = minTop);
              date_yy.style['-webkit-transform'] = 'translate3d(0,' + top + 'em,0)';
              date_yy.setAttribute('top', top + 'em');
              yyVal = Math.abs(top - 8) / 2;
              date_yy.setAttribute('val', yyVal);
            } else {
              date_yy.style['-webkit-transform'] = 'translate3d(0,' + (8 - yyVal * 2) + 'em,0)';
              date_yy.setAttribute('top', 8 - yyVal * 2 + 'em');
            }
          } else {
            return;
          }
          var date_mm = _self.gearDate.querySelector('.date_mm');
          if (date_mm && date_mm.getAttribute('val')) {
            itemStr = '';
            //得到月份的值
            var mmVal = parseInt(date_mm.getAttribute('val'));
            var maxM = 11;
            var minM = 0;
            //当年份到达最大值
            if (yyVal == passY - 1) {
              maxM = _self.maxM - 1;
            }
            //当年份到达最小值
            if (yyVal == 0) {
              minM = _self.minM - 1;
            }
            //p 当前节点前后需要展示的节点个数
            for (var p = 0; p < maxM - minM + 1; p++) {
              itemStr += "<div class='tooth'>" + (minM + p + 1) + '</div>';
            }
            date_mm.innerHTML = itemStr;
            if (mmVal > maxM) {
              mmVal = maxM;
              date_mm.setAttribute('val', mmVal);
            } else if (mmVal < minM) {
              mmVal = maxM;
              date_mm.setAttribute('val', mmVal);
            }
            date_mm.style['-webkit-transform'] = 'translate3d(0,' + (8 - (mmVal - minM) * 2) + 'em,0)';
            date_mm.setAttribute('top', 8 - (mmVal - minM) * 2 + 'em');
          } else {
            return;
          }
          var date_dd = _self.gearDate.querySelector('.date_dd');
          if (date_dd && date_dd.getAttribute('val')) {
            itemStr = '';
            //得到日期的值
            var ddVal = parseInt(date_dd.getAttribute('val'));
            //返回月份的天数
            var maxMonthDays = calcDays(yyVal, mmVal);
            //p 当前节点前后需要展示的节点个数
            var maxD = maxMonthDays - 1;
            var minD = 0;
            //当年份月份到达最大值
            if (yyVal == passY - 1 && _self.maxM == mmVal + 1) {
              maxD = _self.maxD - 1;
            }
            //当年、月到达最小值
            if (yyVal == 0 && _self.minM == mmVal + 1) {
              minD = _self.minD - 1;
            }
            for (var p = 0; p < maxD - minD + 1; p++) {
              itemStr += "<div class='tooth'>" + (minD + p + 1) + '</div>';
            }
            date_dd.innerHTML = itemStr;
            if (ddVal > maxD) {
              ddVal = maxD;
              date_dd.setAttribute('val', ddVal);
            } else if (ddVal < minD) {
              ddVal = minD;
              date_dd.setAttribute('val', ddVal);
            }
            date_dd.style['-webkit-transform'] = 'translate3d(0,' + (8 - (ddVal - minD) * 2) + 'em,0)';
            date_dd.setAttribute('top', 8 - (ddVal - minD) * 2 + 'em');
          } else {
            return;
          }
        }
        //重置时间节点个数
        function setTimeGearTooth() {
          var time_hh = _self.gearDate.querySelector('.time_hh');
          if (time_hh && time_hh.getAttribute('val')) {
            var i = '';
            var hhVal = parseInt(time_hh.getAttribute('val'));
            for (var g = 0; g <= 23; g++) {
              i += "<div class='tooth'>" + g + '</div>';
            }
            time_hh.innerHTML = i;
            time_hh.style['-webkit-transform'] = 'translate3d(0,' + (8 - hhVal * 2) + 'em,0)';
            time_hh.setAttribute('top', 8 - hhVal * 2 + 'em');
          } else {
            return;
          }
          var time_mm = _self.gearDate.querySelector('.time_mm');
          if (time_mm && time_mm.getAttribute('val')) {
            var i = '';
            var mmVal = parseInt(time_mm.getAttribute('val'));
            for (var g = 0; g <= 59; g++) {
              i += "<div class='tooth'>" + g + '</div>';
            }
            time_mm.innerHTML = i;
            time_mm.style['-webkit-transform'] = 'translate3d(0,' + (8 - mmVal * 2) + 'em,0)';
            time_mm.setAttribute('top', 8 - mmVal * 2 + 'em');
          } else {
            return;
          }
        }
        //求月份最大天数
        function calcDays(year, month) {
          if (month == 1) {
            year += _self.minY;
            if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0 && year % 4000 != 0)) {
              return 29;
            } else {
              return 28;
            }
          } else {
            if (month == 3 || month == 5 || month == 8 || month == 10) {
              return 30;
            } else {
              return 31;
            }
          }
        }
        //触摸开始
        function gearTouchStart(e) {
          if (isMoved || isTouched) return;
          isTouched = true;
          e.preventDefault();
          var target = e.target;
          while (true) {
            if (!target.classList.contains('gear')) {
              target = target.parentElement;
            } else {
              break;
            }
          }
          clearInterval(target['int_' + target.id]);
          target['old_' + target.id] = e.targetTouches ? e.targetTouches[0].screenY : e.pageY;
          target['o_t_' + target.id] = new Date().getTime();
          var top = target.getAttribute('top');
          if (top) {
            target['o_d_' + target.id] = parseFloat(top.replace(/em/g, ''));
          } else {
            target['o_d_' + target.id] = 0;
          }
          pree = e;
        }
        //手指移动
        function gearTouchMove(e) {
          if (!isTouched) return;
          isMoved = true;
          e.preventDefault();
          if (pree) var target = pree.target;
          else var target = e.target;
          while (true) {
            if (!target.classList.contains('gear')) {
              target = target.parentElement;
            } else {
              break;
            }
          }
          target['new_' + target.id] = e.targetTouches ? e.targetTouches[0].screenY : e.pageY;
          target['n_t_' + target.id] = new Date().getTime();
          //var f = (target["new_" + target.id] - target["old_" + target.id]) * 18 / target.clientHeight;
          var f = ((target['new_' + target.id] - target['old_' + target.id]) * 18) / 370;
          target['pos_' + target.id] = target['o_d_' + target.id] + f;
          target.style['-webkit-transform'] = 'translate3d(0,' + target['pos_' + target.id] + 'em,0)';
          target.setAttribute('top', target['pos_' + target.id] + 'em');
        }
        //离开屏幕
        function gearTouchEnd(e) {
          if (!isTouched || !isMoved) {
            isTouched = isMoved = false;
            return;
          }
          isTouched = isMoved = false;
          e.preventDefault();
          if (pree) var target = pree.target;
          else var target = e.target;
          while (true) {
            if (!target.classList.contains('gear')) {
              target = target.parentElement;
            } else {
              break;
            }
          }
          var flag =
            (target['new_' + target.id] - target['old_' + target.id]) /
            (target['n_t_' + target.id] - target['o_t_' + target.id]);
          if (Math.abs(flag) <= 0.2) {
            target['spd_' + target.id] = flag < 0 ? -0.08 : 0.08;
          } else {
            if (Math.abs(flag) <= 0.5) {
              target['spd_' + target.id] = flag < 0 ? -0.16 : 0.16;
            } else {
              target['spd_' + target.id] = flag / 2;
            }
          }
          if (!target['pos_' + target.id]) {
            target['pos_' + target.id] = 0;
          }
          rollGear(target);
          pree = null;
        }
        //离开区域
        function gearTouchOut(e) {
          gearTouchEnd(pree);
        }
        //缓动效果
        function rollGear(target) {
          var d = 0;
          var stopGear = false;
          var passY = _self.maxY - _self.minY + 1;
          clearInterval(target['int_' + target.id]);
          target['int_' + target.id] = setInterval(function () {
            var pos = target['pos_' + target.id];
            var speed = target['spd_' + target.id] * Math.exp(-0.1 * d);
            pos += speed;
            if (Math.abs(speed) > 0.1) {
            } else {
              speed = 0.1;
              var b = Math.round(pos / 2) * 2;
              if (Math.abs(pos - b) < 0.05) {
                stopGear = true;
              } else {
                if (pos > b) {
                  pos -= speed;
                } else {
                  pos += speed;
                }
              }
            }
            if (pos > 8) {
              pos = 8;
              stopGear = true;
            }
            switch (target.dataset.datetype) {
              case 'date_yy':
                var minTop = 8 - (passY - 1) * 2;
                if (pos < minTop) {
                  pos = minTop;
                  stopGear = true;
                }
                if (stopGear) {
                  var gearVal = Math.abs(pos - 8) / 2;
                  setGear(target, gearVal);
                  clearInterval(target['int_' + target.id]);
                }
                break;
              case 'date_mm':
                var date_yy = _self.gearDate.querySelector('.date_yy');
                //得到年份的值
                var yyVal = parseInt(date_yy.getAttribute('val'));
                var maxM = 11;
                var minM = 0;
                //当年份到达最大值
                if (yyVal == passY - 1) {
                  maxM = _self.maxM - 1;
                }
                //当年份到达最小值
                if (yyVal == 0) {
                  minM = _self.minM - 1;
                }
                var minTop = 8 - (maxM - minM) * 2;
                if (pos < minTop) {
                  pos = minTop;
                  stopGear = true;
                }
                if (stopGear) {
                  var gearVal = Math.abs(pos - 8) / 2 + minM;
                  setGear(target, gearVal);
                  clearInterval(target['int_' + target.id]);
                }
                break;
              case 'date_dd':
                var date_yy = _self.gearDate.querySelector('.date_yy');
                var date_mm = _self.gearDate.querySelector('.date_mm');
                //得到年份的值
                var yyVal = parseInt(date_yy.getAttribute('val'));
                //得到月份的值
                var mmVal = parseInt(date_mm.getAttribute('val'));
                //返回月份的天数
                var maxMonthDays = calcDays(yyVal, mmVal);
                var maxD = maxMonthDays - 1;
                var minD = 0;
                //当年份月份到达最大值
                if (yyVal == passY - 1 && _self.maxM == mmVal + 1) {
                  maxD = _self.maxD - 1;
                }
                //当年、月到达最小值
                if (yyVal == 0 && _self.minM == mmVal + 1) {
                  minD = _self.minD - 1;
                }
                var minTop = 8 - (maxD - minD) * 2;
                if (pos < minTop) {
                  pos = minTop;
                  stopGear = true;
                }
                if (stopGear) {
                  var gearVal = Math.abs(pos - 8) / 2 + minD;
                  setGear(target, gearVal);
                  clearInterval(target['int_' + target.id]);
                }
                break;
              case 'time_hh':
                if (pos < -38) {
                  pos = -38;
                  stopGear = true;
                }
                if (stopGear) {
                  var gearVal = Math.abs(pos - 8) / 2;
                  setGear(target, gearVal);
                  clearInterval(target['int_' + target.id]);
                }
                break;
              case 'time_mm':
                if (pos < -110) {
                  pos = -110;
                  stopGear = true;
                }
                if (stopGear) {
                  var gearVal = Math.abs(pos - 8) / 2;
                  setGear(target, gearVal);
                  clearInterval(target['int_' + target.id]);
                }
                break;
              default:
            }
            target['pos_' + target.id] = pos;
            target.style['-webkit-transform'] = 'translate3d(0,' + pos + 'em,0)';
            target.setAttribute('top', pos + 'em');
            d++;
          }, 30);
        }
        //控制插件滚动后停留的值
        function setGear(target, val) {
          val = Math.round(val);
          target.setAttribute('val', val);
          if (/date/.test(target.dataset.datetype)) {
            setDateGearTooth();
          } else {
            setTimeGearTooth();
          }
        }
        //取消
        function closeMobileCalendar(e) {
          e.preventDefault();
          isTouched = isMoved = false;
          if (_self.onClose) _self.onClose();
          var evt = new CustomEvent('input');
          _self.trigger.dispatchEvent(evt);
          document.body.removeChild(_self.gearDate);
        }
        //日期确认
        function finishMobileDate(e) {
          var passY = _self.maxY - _self.minY + 1;
          var date_yy = parseInt(Math.round(_self.gearDate.querySelector('.date_yy').getAttribute('val')));
          var date_mm = parseInt(Math.round(_self.gearDate.querySelector('.date_mm').getAttribute('val'))) + 1;
          date_mm = date_mm > 9 ? date_mm : '0' + date_mm;
          var date_dd = parseInt(Math.round(_self.gearDate.querySelector('.date_dd').getAttribute('val'))) + 1;
          date_dd = date_dd > 9 ? date_dd : '0' + date_dd;
          _self.trigger.value = (date_yy % passY) + _self.minY + '-' + date_mm + '-' + date_dd;
          _self.value = _self.trigger.value;
          if (_self.onSubmit) _self.onSubmit();
          closeMobileCalendar(e);
        }
        //年月确认
        function finishMobileYM(e) {
          var passY = _self.maxY - _self.minY + 1;
          var date_yy = parseInt(Math.round(_self.gearDate.querySelector('.date_yy').getAttribute('val')));
          var date_mm = parseInt(Math.round(_self.gearDate.querySelector('.date_mm').getAttribute('val'))) + 1;
          date_mm = date_mm > 9 ? date_mm : '0' + date_mm;
          _self.trigger.value = (date_yy % passY) + _self.minY + '-' + date_mm;
          _self.value = _self.trigger.value;
          if (_self.onSubmit) _self.onSubmit();
          closeMobileCalendar(e);
        }
        //日期时间确认
        function finishMobileDateTime(e) {
          var passY = _self.maxY - _self.minY + 1;
          var date_yy = parseInt(Math.round(_self.gearDate.querySelector('.date_yy').getAttribute('val')));
          var date_mm = parseInt(Math.round(_self.gearDate.querySelector('.date_mm').getAttribute('val'))) + 1;
          date_mm = date_mm > 9 ? date_mm : '0' + date_mm;
          var date_dd = parseInt(Math.round(_self.gearDate.querySelector('.date_dd').getAttribute('val'))) + 1;
          date_dd = date_dd > 9 ? date_dd : '0' + date_dd;
          var time_hh = parseInt(Math.round(_self.gearDate.querySelector('.time_hh').getAttribute('val')));
          time_hh = time_hh > 9 ? time_hh : '0' + time_hh;
          var time_mm = parseInt(Math.round(_self.gearDate.querySelector('.time_mm').getAttribute('val')));
          time_mm = time_mm > 9 ? time_mm : '0' + time_mm;
          _self.trigger.value =
            (date_yy % passY) +
            _self.minY +
            '-' +
            date_mm +
            '-' +
            date_dd +
            ' ' +
            (time_hh.length < 2 ? '0' : '') +
            time_hh +
            (time_mm.length < 2 ? ':0' : ':') +
            time_mm;
          _self.value = _self.trigger.value;
          if (_self.onSubmit) _self.onSubmit();
          closeMobileCalendar(e);
        }
        //时间确认
        function finishMobileTime(e) {
          var time_hh = parseInt(Math.round(_self.gearDate.querySelector('.time_hh').getAttribute('val')));
          time_hh = time_hh > 9 ? time_hh : '0' + time_hh;
          var time_mm = parseInt(Math.round(_self.gearDate.querySelector('.time_mm').getAttribute('val')));
          time_mm = time_mm > 9 ? time_mm : '0' + time_mm;
          _self.trigger.value = (time_hh.length < 2 ? '0' : '') + time_hh + (time_mm.length < 2 ? ':0' : ':') + time_mm;
          _self.value = _self.trigger.value;
          if (_self.onSubmit) _self.onSubmit();
          closeMobileCalendar(e);
        }
        _self.trigger.addEventListener(
          'click',
          {
            ym: popupYM,
            date: popupDate,
            datetime: popupDateTime,
            time: popupTime,
          }[type],
        );
      },
    };
    return MobileCalendar;
  })(),

  // 弹窗
  // function confirmAction() {
  //   console.log('Confirmed');
  // }
  // function cancelAction() {
  //   console.log('Canceled');
  // }
  // function showDialog() {
  //   h5.showDialog('提示', '你确定要进行此操作吗？', confirmAction, cancelAction);
  // }
  showDialog: function (title, message, confirmAction, cancelAction) {
    const style = document.createElement('style');
    style.textContent = `
        .dialog-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .dialog-box {
            background: white;
            padding-top: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            width: 100%;
            text-align: center;
            overflow: hidden;
        }
        .dialog-title {
            font-size: 20px;
            margin-bottom: 20px;
        }
        .dialog-message {
            margin-bottom: 20px;
        }
        .dialog-buttons{
            display: flex;
            border-top: 1px solid #ccc;
        }
        .dialog-buttons button {
            padding: 15px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            width: 50%;
            background-color: #fff;
        }
        .dialog-buttons .confirm {
            border-right: 1px solid #ccc;
        }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';

    const dialogBox = document.createElement('div');
    dialogBox.className = 'dialog-box';

    const dialogTitle = document.createElement('div');
    dialogTitle.className = 'dialog-title';
    dialogTitle.textContent = title;

    const dialogMessage = document.createElement('div');
    dialogMessage.className = 'dialog-message';
    dialogMessage.textContent = message;

    const dialogButtons = document.createElement('div');
    dialogButtons.className = 'dialog-buttons';

    const confirmButton = document.createElement('button');
    confirmButton.className = 'confirm';
    confirmButton.textContent = '确认';
    confirmButton.onclick = () => {
      confirmAction();
      document.body.removeChild(overlay);
    };

    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel';
    cancelButton.textContent = '取消';
    cancelButton.onclick = () => {
      cancelAction();
      document.body.removeChild(overlay);
    };

    dialogButtons.appendChild(confirmButton);
    dialogButtons.appendChild(cancelButton);

    dialogBox.appendChild(dialogTitle);
    dialogBox.appendChild(dialogMessage);
    dialogBox.appendChild(dialogButtons);

    overlay.appendChild(dialogBox);

    document.body.appendChild(overlay);
  },
};
