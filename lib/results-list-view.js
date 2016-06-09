'use babel';

import {SelectListView} from 'atom-space-pen-views';

export default class ResultsListView extends SelectListView {
  constructor(serializedState) {
    super();

    this.addClass('dependents overlay from-top');
    this.panel = atom.workspace.addModalPanel({
      item: this,
      visible: false
    });
  }

  show() {
    this.panel.show();
    this.focusFilterEditor();
  }

  hide() {
    this.panel.hide();
  }

  viewForItem(item) {
    return `<li>${item.displayName}</li>`;
  }

  confirmed(item) {
    atom.workspace.open(item.filepath).then(() => this.hide());
  }

  cancelled() {
    this.hide();
  }

  destroy() {
    this.panel.dispose();
  }
}
