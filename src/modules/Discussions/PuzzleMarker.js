import Module from '../../class/Module';
import { common } from '../Common';

const
  createLock = common.createLock.bind(common),
  getValue = common.getValue.bind(common),
  setValue = common.setValue.bind(common)
  ;

class DiscussionsPuzzleMarker extends Module {
  constructor() {
    super();
    this.info = {
      description: [
        [`ul`, [
          [`li`, [
            `Adds a checkbox in front of a discussion categorized as "Puzzles" (in any page) that changes states (`,
            [`i`, { class: `fa fa-circle-o esgst-grey` }],
            `  by default, `,
            [`i`, { class: `fa fa-times-circle esgst-red` }],
            `  for "unsolved", `,
            [`i`, { class: `fa fa-exclamation-circle esgst-orange` }],
            `  for "in progress" and `,
            [`i`, { class: `fa fa-check-circle esgst-green` }],
            `for "solved") and allows you to mark the puzzle as unsolved/in progress / solved.`
          ]]
        ]]
      ],
      features: {
        pm_a: {
          name: `Show the checkbox for all discussions, regardless of their category.`,
          sg: true
        }
      },
      id: `pm`,
      name: `Puzzle Marker`,
      sg: true,
      type: `discussions`
    };
  }

  async pm_change(code, status) {
    let deleteLock = await createLock(`commentLock`, 300);
    let discussions = JSON.parse(getValue(`discussions`));
    if (!discussions[code]) {
      discussions[code] = {
        readComments: {}
      };
    }
    if (status === `off`) {
      delete discussions[code].status;
    } else {
      discussions[code].status = status;
    }
    discussions[code].lastUsed = Date.now();
    await setValue(`discussions`, JSON.stringify(discussions));
    deleteLock();
    return true;
  }
}

export default DiscussionsPuzzleMarker;