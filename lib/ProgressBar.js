'use babel';

export default class ProgressBar {
  constructor(statusBar) {
    this._statusElement = document.createElement('div');
    this._statusElement.id = 'dependents-progress-bar';
    this._statusElement.style.display = 'inline-block';
    this._setMessage('');

    this._statusBarTile = statusBar.addLeftTile({
      item: this._statusElement,
      priority: 100
    });
  }

  start(message = '') {
    this._setMessage(message);
  }

  _setMessage(message = '') {
    this._statusElement.textContent = message;
  }

  stop() {
    this._setMessage('');
  }

  destroy() {
    this._statusBarTile.destroy();
    this._statusElement = null;
  }
}
