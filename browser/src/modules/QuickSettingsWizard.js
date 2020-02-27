import { Shared } from '../class/Shared';
import { settingsModule } from './Settings';

class QuickSettingsWizard {
  constructor() {
    this.profile = {};
    this.steps = [];
  }

  async init() {
    for (const step of this.steps) {
      if (!step.check()) {
        continue;
      }
      try {
        await Shared.common.createAsyncConfirmation(step.message);
        step.onYes();
      } catch (err) {
        step.onNo();
      }
    }
    console.log(settingsModule.toSave);
  }
}

const quickSettingsWizard = new QuickSettingsWizard();

export { quickSettingsWizard };