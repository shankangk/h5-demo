const h5 = {
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
};
