'use babel';

import AtomDependentsView from './atom-dependents-view';
import { CompositeDisposable } from 'atom';

export default {

  atomDependentsView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomDependentsView = new AtomDependentsView(state.atomDependentsViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomDependentsView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-dependents:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomDependentsView.destroy();
  },

  serialize() {
    return {
      atomDependentsViewState: this.atomDependentsView.serialize()
    };
  },

  toggle() {
    console.log('AtomDependents was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
