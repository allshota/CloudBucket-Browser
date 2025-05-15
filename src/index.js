document.addEventListener('DOMContentLoaded', () => {
  const fileList = document.getElementById('fileList');
  const breadcrumb = document.getElementById('breadcrumb');
  const selectAllBtn = document.getElementById('selectAllBtn');
  const deselectAllBtn = document.getElementById('deselectAllBtn');
  const downloadSelectedBtn = document.getElementById('downloadSelectedBtn');

  let currentPath = '';
  let selectedFiles = new Set();

  // 初始化页面
  loadFiles(currentPath);

  // 事件监听器
  breadcrumb.addEventListener('click', handleBreadcrumbClick);
  selectAllBtn.addEventListener('click', selectAll);
  deselectAllBtn.addEventListener('click', deselectAll);
  downloadSelectedBtn.addEventListener('click', downloadSelected);

  // 加载文件列表
  async function loadFiles(path) {
    fileList.innerHTML = '<div class="loading">加载中...</div>';
    selectedFiles.clear();
    updateButtonStates();

    try {
      const response = await fetch(`/api/list?prefix=${encodeURIComponent(path)}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: `HTTP错误: ${response.status}`, 
          details: '无法获取详细错误信息' 
        }));
        
        throw new Error(`请求失败: ${errorData.error}\n${errorData.details || ''}`);
      }
      
      const data = await response.json();
      updateBreadcrumb(path);
      renderFileList(data, path);
    } catch (error) {
      fileList.innerHTML = `
        <div class="error">
          <h3>加载失败</h3>
          <p>${error.message}</p>
          <button onclick="location.reload()">重试</button>
        </div>`;
      console.error('加载文件列表失败:', error);
    }
  }

  // 渲染文件列表
  function renderFileList(data, path) {
    if (data.length === 0) {
      fileList.innerHTML = '<div class="empty">此目录为空</div>';
      return;
    }

    fileList.innerHTML = '';
    
    // 对象按类型和名称排序（目录在前）
    const sortedData = [...data].sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) {
        return a.isDirectory ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    // 如果不在根目录，添加一个返回上级的选项
    if (path !== '') {
      const parentDirItem = document.createElement('div');
      parentDirItem.className = 'file-item';
      parentDirItem.innerHTML = `
        <div class="file-icon folder">📁</div>
        <div class="file-name">..</div>
      `;
      parentDirItem.addEventListener('click', () => {
        const parentPath = path.split('/').slice(0, -1).join('/');
        loadFiles(parentPath);
      });
      fileList.appendChild(parentDirItem);
    }

    sortedData.forEach(item => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';

      const isDirectory = item.isDirectory;
      const icon = isDirectory ? '📁' : '📄';
      const key = path ? `${path}/${item.name}` : item.name;

      if (isDirectory) {
        fileItem.innerHTML = `
          <input type="checkbox" class="file-checkbox" data-key="${key}" disabled>
          <div class="file-icon folder">${icon}</div>
          <div class="file-name">${item.name}</div>
          <div class="file-actions">
            <button class="enter-btn">进入</button>
          </div>
        `;
      } else {
        fileItem.innerHTML = `
          <input type="checkbox" class="file-checkbox" data-key="${key}">
          <div class="file-icon file">${icon}</div>
          <div class="file-name">${item.name}</div>
          <div class="file-actions">
            <button class="download-btn">下载</button>
            <button class="copy-link-btn" title="复制下载地址">复制链接</button>
          </div>
        `;
      }

      const checkbox = fileItem.querySelector('.file-checkbox');
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          selectedFiles.add(key);
        } else {
          selectedFiles.delete(key);
        }
        updateButtonStates();
      });

      // 设置按钮点击事件
      if (isDirectory) {
        const enterBtn = fileItem.querySelector('.enter-btn');
        enterBtn.addEventListener('click', () => {
          loadFiles(key);
        });

        // 点击文件夹名称也能进入目录
        fileItem.querySelector('.file-name').addEventListener('click', () => {
          loadFiles(key);
        });
      } else {
        const downloadBtn = fileItem.querySelector('.download-btn');
        downloadBtn.addEventListener('click', () => {
          downloadFile(key);
        });
        
        // 添加复制下载地址功能
        const copyLinkBtn = fileItem.querySelector('.copy-link-btn');
        copyLinkBtn.addEventListener('click', () => {
          copyDownloadLink(key);
        });
      }

      fileList.appendChild(fileItem);
    });
  }

  // 更新面包屑导航
  function updateBreadcrumb(path) {
    breadcrumb.innerHTML = '<span class="breadcrumb-item" data-path="">根目录</span>';
    
    if (path) {
      let currentPath = '';
      const parts = path.split('/');
      
      parts.forEach((part, index) => {
        currentPath += (index > 0 ? '/' : '') + part;
        const item = document.createElement('span');
        item.className = 'breadcrumb-item';
        item.setAttribute('data-path', currentPath);
        item.textContent = part;
        breadcrumb.appendChild(item);
      });
    }
  }

  // 处理面包屑导航点击
  function handleBreadcrumbClick(e) {
    if (e.target.classList.contains('breadcrumb-item')) {
      const path = e.target.getAttribute('data-path');
      loadFiles(path);
    }
  }

  // 选择所有文件
  function selectAll() {
    const checkboxes = document.querySelectorAll('.file-checkbox:not([disabled])');
    checkboxes.forEach(checkbox => {
      checkbox.checked = true;
      selectedFiles.add(checkbox.getAttribute('data-key'));
    });
    updateButtonStates();
  }

  // 取消选择所有文件
  function deselectAll() {
    const checkboxes = document.querySelectorAll('.file-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    selectedFiles.clear();
    updateButtonStates();
  }

  // 下载选中的文件
  function downloadSelected() {
    if (selectedFiles.size === 0) return;
    
    if (selectedFiles.size === 1) {
      downloadFile(Array.from(selectedFiles)[0]);
      return;
    }

    alert('多文件下载功能将在后续版本添加');
  }

  // 下载单个文件
  function downloadFile(key) {
    window.location.href = `/api/download?key=${encodeURIComponent(key)}`;
  }
  
  // 复制下载链接
  function copyDownloadLink(key) {
    const downloadUrl = new URL(`/api/download?key=${encodeURIComponent(key)}`, window.location.origin).href;
    
    // 创建一个临时的toast元素，用于显示提示信息
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = '正在复制链接...';
    document.body.appendChild(toast);
    
    // 使用Clipboard API复制文本
    try {
      navigator.clipboard.writeText(downloadUrl)
        .then(() => {
          toast.textContent = '下载链接已复制到剪贴板';
          toast.classList.add('show');
          
          setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
          }, 3000);
        })
        .catch(err => {
          console.error('复制失败:', err);
          fallbackCopy();
        });
    } catch (e) {
      console.error('Clipboard API不可用:', e);
      fallbackCopy();
    }
    
    // 降级复制方法
    function fallbackCopy() {
      const textarea = document.createElement('textarea');
      textarea.value = downloadUrl;
      textarea.style.position = 'fixed';  // 防止滚动到底部
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          toast.textContent = '下载链接已复制到剪贴板';
        } else {
          toast.textContent = '复制失败，请手动复制：' + downloadUrl;
        }
      } catch (err) {
        toast.textContent = '复制失败，请手动复制：' + downloadUrl;
        console.error('复制失败:', err);
      }
      
      document.body.removeChild(textarea);
      toast.classList.add('show');
      
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 3000);
    }
  }

  // 更新按钮状态
  function updateButtonStates() {
    downloadSelectedBtn.disabled = selectedFiles.size === 0;
  }
}); 