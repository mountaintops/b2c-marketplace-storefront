function updateImage() {
  const images = document.querySelectorAll('.branding-logo');
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  images.forEach(image => {
    const imageSource = image.src;
    if (typeof imageSource === 'string') {
      if (imageSource.includes('proxydetect.live')) {
        image.src = isDarkMode ? 'https://proxydetect.live/img/logo-v4-dark.png' : 'https://proxydetect.live/img/logo-v4.png';
      } else {
        image.src = isDarkMode ? '/app/img/v17-white.svg' : '/app/img/v17.svg';
      }
    }
  });
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateImage);

document.addEventListener('DOMContentLoaded', () => {
  updateImage();

  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  const message = searchParams.get("message");
  const messageStatus = searchParams.get("messageStatus");
  if (message && messageStatus) {
    const decodedMessage = decodeURIComponent(message);
    const decodedMessageStatus = decodeURIComponent(messageStatus);
    const notification = document.getElementById('status-message-redirect');
    if (notification) {
      notification.style.display = 'block';
      const messageEl = notification.querySelector('div.statusMessage');
      if (messageEl) {
        messageEl.innerText = decodedMessage;
      }
      notification.classList.add(decodedMessageStatus);
    }
  }

  const navbarBurger = document.querySelector('.navbar-burger');
  if (navbarBurger) {
    navbarBurger.addEventListener('click', () => {
      const navbarMenu = document.getElementById('navbarMenu');
      navbarMenu.classList.toggle('is-menu-active');
    });
  }

  if (typeof hljs !== 'undefined' && hljs.highlightAll) {
    hljs.highlightAll();
  }

  const ids = ['ipToHostingCommand', 'ipToASNCommand',
    'sourceDownloadCommand', 'databaseDownloadCommand',
    'whoisDatabaseDownloadCommand', 'ramDatabaseDownloadCommand',
    'whoisDataDownloadCommand'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      hljs.highlightElement(el);
    }
  });
});