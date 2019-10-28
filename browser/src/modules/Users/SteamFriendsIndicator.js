import { Module } from '../../class/Module';
import { Shared } from '../../class/Shared';
import { Settings } from '../../class/Settings';
import { DOM } from '../../class/DOM';

class UsersSteamFriendsIndicator extends Module {
  constructor() {
    super();
    this.info = {
      description: [
        ['ul', [
          ['li', [
            `Adds an icon (`,
            ['i', { class: 'fa fa-user' }],
            `) next to the a user's username (in any page) to indicate that they are on your Steam friends list.`
          ]],
          ['li', `If you hover over the icon, it shows the date when you became friends.`]
        ]]
      ],
      id: 'sfi',
      inputItems: [
        {
          id: 'sfi_icon',
          prefix: `Icon: `
        }
      ],
      name: 'Steam Friends Indicator',
      sg: true,
      st: true,
      sync: 'Steam Friends',
      syncKeys: ['SteamFriends'],
      type: 'users',
      featureMap: {
        user: this.addIcons.bind(this)
      }
    };
  }

  addIcons(users) {
    for (const user of users) {
      if (user.saved && user.saved.steamFriend && !user.context.parentElement.querySelector('.esgst-sfi-icon')) {
        DOM.build(user.context, 'afterEnd', [
          ['span', { class: 'esgst-sfi-icon esgst-user-icon', title: Shared.common.getFeatureTooltip('sfi', `You have been friends with ${user.username} on Steam since ${Shared.common.getTimestamp(user.saved.steamFriend * 1e3)}`) }, [
            ['i', { class: `fa fa-${Settings.sfi_icon}` }]
          ]]
        ]);
      }
    }
  }
}

const usersSteamFriendsIndicator = new UsersSteamFriendsIndicator();

export { usersSteamFriendsIndicator };