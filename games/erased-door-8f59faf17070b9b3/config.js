// 仅含公开服务地址，不含任何密钥。
window.STORY_API_BASE = ['localhost','127.0.0.1'].includes(location.hostname) ? new URL('./api/',location.href).href : 'https://songjihu.top/play/erased-door-8f59faf17070b9b3/api/';
