'use babel';

import ResultsListView from './results-list-view';
import ProgressBar from './ProgressBar';

import { CompositeDisposable } from 'atom';
import cli from 'dependents-editor-backend';
import assign from 'object-assign';

export default {
  _runCommand(data = {}) {
    // When activation happens before statusBar service consumption
    if (this._progressBar) {
      this._progressBar.start(data.statusMessage);
    }

    delete data.statusMessage;

    if (this._config) {
      fetchingConfig = Promise.resolve();

    } else {
      fetchingConfig = this._runCLICommand({
        filename: this._getCurrentFilename(),
        getConfig: true
      })
      .then(config => this._config = config);
    }

    return fetchingConfig.then(() => this._runCLICommand(data));
  },

  _runCLICommand(data) {
    return new Promise((resolve, reject) => {
      setImmediate(() => {
        const commandRunning = cli(assign({
          editor: 'Atom'
        }, data));

        commandRunning.then(resolve, reject);

        commandRunning.fin(() => {
          if (this._progressBar) {
            this._progressBar.stop();
          }
        });
      });
    });
  },

  consumeStatusBar(statusBar) {
    this._progressBar = new ProgressBar(statusBar);
  },

  activate(state) {
    this.resultsView = new ResultsListView(state.atomDependentsViewState);
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'dependents:findDependents': () => this.findDependents(),
      'dependents:findDrivers': () => this.findDrivers(),
      'dependents:jumpToDependency': () => this.jumpToDependency(),
      'dependents:getTree': () => this.getTree(),
      'dependents:copyPath': () => this.copyPath()
    }));

    this._onEditorClick = e => {
      if (!e.altKey) {
        return;
      }

      let line;

      for (let i = 0; i < e.path.length; i++) {
        if (e.path[i].classList.contains('line')) {
          line = e.path[i];
          break;
        }
      }

      const clickedElementText = e.path[0].innerText;
      const lineText = line.innerText;
      const clickedLocation = lineText.indexOf(clickedElementText);

      this.jumpToDependency({
        line: lineText,
        clickPosition: clickedLocation
      });
    };

    document.addEventListener('click', this._onEditorClick);
  },

  findDependents() {
    this._runCommand({
      filename: this._getCurrentFilename(),
      findDependents: true,
      statusMessage: 'Finding Dependents'
    })
    .then(dependents => {
      if (!dependents.length) {
        atom.notifications.addInfo('Dependents: No dependents found for this file');
        return;
      }

      this._handleFileResults(dependents);
    })
    .catch(err => this._showError(err));
  },

  findDrivers() {
    this._runCommand({
      filename: this._getCurrentFilename(),
      findDrivers: true,
      statusMessage: 'Finding Entry Points'
    })
    .then(drivers => {
      if (!drivers.length) {
        atom.notifications.addInfo('Dependents: No relevant entry points found for this file');
        return;
      }

      this._handleFileResults(drivers);
    })
    .catch(err => this._showError(err));
  },

  getTree() {
    this._runCommand({
      filename: this._getCurrentFilename(),
      getTree: true,
      statusMessage: 'Generating Tree'
    })
    .then(tree => {
      atom.workspace.open().then(editor => {
        editor.insertText(JSON.stringify(tree, null, '\t'));
      });
    })
    .catch(err => this._showError(err));
  },

  jumpToDependency({line, clickPosition} = {}) {
    if (!line) {
      const editor = atom.workspace.getActiveTextEditor();
      const {row, column} = editor.getCursorBufferPosition();
      line = editor.getBuffer().lines[row];
      clickPosition = column;
    }

    this._runCommand({
      filename: this._getCurrentFilename(),
      lookup: true,
      args: [line],
      lookupPosition: clickPosition,
      statusMessage: 'Jumping to Dependency'
    })
    .then(filepath => {
      // For glob imports returning an array of paths to jump to
      const paths = filepath instanceof Array ? filepath : [filepath];
      this._handleFileResults(paths);
    })
    .catch(err => this._showError(err));
  },

  copyPath() {
    this._runCommand({
      filename: this._getCurrentFilename(),
      getPath: true,
      statusMessage: 'Copying Path'
    })
    .then(path => {
      atom.clipboard.write(path);
      this._showSuccess(`${path} copied to clipboard`);
    })
    .catch(err => this._showError(err));
  },

  _handleFileResults(results) {
    if (results.length === 1) {
      return atom.workspace.open(results[0]);
    }

    this._showFileResults(results);
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
    return editor && editor.buffer && editor.buffer.file ? editor.buffer.file.path : '';
  },

  deactivate() {
    this.subscriptions.dispose();
    this.resultsView.destroy();
    document.removeEventListener('click', this._onEditorClick);
    this._progressBar.destroy();
  }
};
