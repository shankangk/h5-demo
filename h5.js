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
};
