'use babel';

import { CompositeDisposable } from 'atom';
import cli from 'dependents-editor-backend';
import ResultsListView from './results-list-view';

export default {
  activate(state) {
    cli({
      filename: this._getCurrentFilename(),
      getConfig: true
    })
    .then(config => this._config = config);

    this.resultsView = new ResultsListView(state.atomDependentsViewState);
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'dependents:findDependents': () => this.findDependents(),
      'dependents:findDrivers': () => this.findDrivers(),
      'dependents:jumpToDependency': () => this.jumpToDependency(),
      'dependents:getTree': () => this.getTree(),
      'dependents:copyPath': () => this.copyPath()
    }));
  },

  findDependents() {
    const filename = this._getCurrentFilename();

    if (!filename) return;

    cli({
      filename,
      findDependents: true
    })
    .then(dependents => {
      if (!dependents.length) {
        atom.notifications.addInfo('Dependents: No dependents found for this file');
        return;
      }

      this._showFileResults(dependents);
    })
    .catch(err => this._showError(err));
  },

  findDrivers() {
    cli({
      filename: this._getCurrentFilename(),
      findDrivers: true
    })
    .then(drivers => {
      if (!drivers.length) {
        atom.notifications.addInfo('Dependents: No relevant entry points found for this file');
        return;
      }

      this._showFileResults(drivers);
    })
    .catch(err => this._showError(err));
  },

  getTree() {
    cli({
      filename: this._getCurrentFilename(),
      getTree: true
    })
    .then(tree => {
      atom.workspace.open().then(editor => {
        editor.insertText(JSON.stringify(tree, null, '\t'));
      });
    })
    .catch(err => this._showError(err));
  },

  jumpToDependency() {},

  copyPath() {
    cli({
      filename: this._getCurrentFilename(),
      getPath: true
    })
    .then(path => {
      atom.clipboard.write(path);
      this._showSuccess(`${path} copied to clipboard`);
    })
    .catch(err => this._showError(err));
  },

  _showFileResults(files) {
    const items = files.map(filepath => ({
      filepath,
      displayName: filepath.replace(this._config.directory + '/', '')
    }));

    this.resultsView.setItems(items);
    this.resultsView.show();
  },

  _showSuccess(message) {
    atom.notifications.addSuccess(`Dependents: ${message}`);
  },

  _showError(err) {
    atom.notifications.addError(`Dependents: ${err.message || err}`);
  },

  _getCurrentFilename() {
    const editor = atom.workspace.getActivePaneItem();
    return editor ? editor.buffer.file.path : '';
  },

  deactivate() {
    this.subscriptions.dispose();
    this.resultsView.destroy();
  }
};
