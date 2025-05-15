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
        throw new Error(`请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      updateBreadcrumb(path);
      renderFileList(data, path);
    } catch (error) {
      fileList.innerHTML = `<div class="error">加载失败: ${error.message}</div>`;
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

      fileItem.innerHTML = `
        <input type="checkbox" class="file-checkbox" data-key="${key}" ${isDirectory ? 'disabled' : ''}>
        <div class="file-icon ${isDirectory ? 'folder' : 'file'}">${icon}</div>
        <div class="file-name">${item.name}</div>
        <div class="file-actions">
          ${isDirectory 
            ? '<button class="enter-btn">进入</button>' 
            : '<button class="download-btn">下载</button>'}
        </div>
      `;

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

  // 更新按钮状态
  function updateButtonStates() {
    downloadSelectedBtn.disabled = selectedFiles.size === 0;
  }
}); 