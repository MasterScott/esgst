import { DOM } from '../class/DOM';
import { EventDispatcher } from '../class/EventDispatcher';
import { Events } from '../constants/Events';
import { Namespaces } from '../constants/Namespaces';
import { ISession, Session } from '../class/Session';
import { User } from './User';
import { Utils } from '../lib/jsUtils';

class IHeader {
  constructor() {
    /** @type {IHeaderNodes} */
    this.nodes = {
      inner: null,
      leftNav: null,
      nav: null,
      outer: null,
      rightNav: null,
    };

    /** @type {Object<string, IHeaderButtonContainer>} */
    this.buttonContainers = {};
  }

  /**
   * @param {IHeaderButtonContainer} buttonContainer
   * @param {number} newCounter
   * @param {boolean} [isFlashing]
   */
  // eslint-disable-next-line no-unused-vars
  async updateCounter(buttonContainerId, newCounter, isFlashing) {}

  /**
   * @param {number|string} newPoints
   */
  // eslint-disable-next-line no-unused-vars
  async updatePoints(newPoints) {}

  /**
   * @param {ILevel} newLevel
   */
  // eslint-disable-next-line no-unused-vars
  async updateLevel(newLevel) {}

  /**
   * @param {string} newReputationText
   */
  // eslint-disable-next-line no-unused-vars
  async updateReputation(newReputationText) {}

  /**
   * @param {string} text
   * @returns {number}
   */
  static extractCounter(text) {
    return parseInt(text.replace(/,/g, ''));
  }

  /**
   * @param {string} text
   * @returns {ILevel}
   */
  static extractLevel(text) {
    const full = parseFloat(text.replace(/[^\d.]/g, ''));
    const base = Math.trunc(full);

    return { base, full };
  }

  /**
   * @param {string} text
   * @returns {number}
   */
  static extractPoints(text) {
    return parseInt(text.replace(/,/g, '').match(/\d+/)[0]);
  }

  /**
   * @param {string} text
   * @returns {IHeaderButtonContainerReputation}
   */
  static extractReputation(text) {
    const matches = text.match(/\(\+(.+?)\/-(.+?)\)/);

    return {
      positive: parseInt(matches[1].replace(/,/g, '')),
      negative: parseInt(matches[2].replace(/,/g, '')),
    };
  }

  /**
   * @param {string} string
   * @returns {string}
   */
  static generateId(name) {
    return name
      .replace(/[^A-Za-z\s].*/, '') // Only gets the name until a non-letter character
      .trim()
      .split(' ')
      .filter(word => word)
      .map(word => `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`) // Applies CamelCase format
      .join('')
      .replace(/^(.)/, (fullMatch, group1) => group1.toLowerCase()); // Applies camelCase format
  }
}

class SgHeader extends IHeader {
  constructor() {
    super();
  }

  /**
   * @param {IHeaderButtonContainerParams} params
   */
  addButtonContainer(params) {
    const [context, position] = params.context ? [params.context, params.position] : (params.side === 'left' ? [this.nodes.leftNav, 'beforeEnd'] : [this.nodes.rightNav, 'afterBegin']);

    let buttonContainerNode = null;

    if (params.isDropdown) {
      buttonContainerNode = DOM.build(context, position, [
        ['div', { class: 'nav__button-container' }, [
          ['div', { class: 'nav__relative-dropdown is-hidden' }, [
            ['div', { class: 'nav__absolute-dropdown' }],
          ]],
          ['a', { class: 'nav__button nav__button--is-dropdown', href: params.url || null, onclick: params.onClick, target: params.openInNewTab ? '_blank' : null }, [
            ...(params.buttonIcon ? [
              ['i', { class: params.buttonIcon }],
            ] : []),
            ...(params.buttonImage ? [
              ['img', { src: params.buttonImage }],
            ] : []),
            params.buttonName,
          ]],
          ['div', { class: 'nav__button nav__button--is-dropdown-arrow' }, [
            ['i', { class: 'fa fa-angle-down' }],
          ]],
        ]],
      ]);
    } else if (params.isNotification) {
      buttonContainerNode = DOM.build(context, position, [
        ['div', { class: `nav__button-container nav__button-container--notification ${params.isActive ? 'nav__button-container--active' : 'nav__button-container--inactive'}` }, [
          ['a', { class: 'nav__button', href: params.url, target: params.openInNewTab ? '_blank' : null, title: params.buttonName }, [
            ...(params.buttonIcon ? [
              ['i', { class: params.buttonIcon }],
            ] : []),
            ...(params.buttonImage ? [
              ['img', { src: params.buttonImage }],
            ] : []),
            ...(params.isActive && params.counter ? [
              ['div', { class: `nav__notification ${params.isFlashing ? 'fade_infinite' : ''}` }, params.counter.toLocaleString('en-US')],
            ] : []),
          ]],
        ]],
      ]);
    } else {
      buttonContainerNode = DOM.build(context, position, [
        ['div', { class: 'nav__button-container' }, [
          ['a', { class: 'nav__button', href: params.url, target: params.openInNewTab ? '_blank' : null }, params.buttonName],
        ]],
      ]);
    }

    const buttonContainer = this.parseButtonContainer(buttonContainerNode);

    for (const id in params.dropdownItems) {
      const dropdownItemParams = params.dropdownItems[id];

      dropdownItemParams.buttonContainerId = buttonContainer.data.id;

      this.addDropdownItem(dropdownItemParams);
    }

    return buttonContainer;
  }

  /**
   * @param {IHeaderDropdownItemParams} params
   */
  addDropdownItem(params) {
    const buttonContainer = this.buttonContainers[params.buttonContainerId];

    if (!buttonContainer) {
      throw 'Invalid button container id.';
    }

    if (!buttonContainer.data.isDropdown) {
      throw 'Button container is not dropdown.';
    }

    const dropdownItemNode = DOM.build(buttonContainer.nodes.absoluteDropdown, 'beforeEnd', [
      [params.url ? 'a' : 'div', { class: `nav__row ${params.url ? '' : 'is-clickable'}`, href: params.url || null, onclick: params.onClick, target: params.openInNewTab ? '_blank' : null }, [
        ['i', { class: params.icon }],
        ['div', { class: 'nav__row__summary' }, [
          ['p', { class: 'nav__row__summary__name' }, params.name],
          ['p', { class: 'nav__row__summary__description' }, params.description],
        ]],
      ]],
    ]);

    return this.parseDropdownItem(buttonContainer.dropdownItems, dropdownItemNode);
  }

  /**
   * @param {HTMLElement} context
   */
  parse(context) {
    const outerNode = context.querySelector('header');

    if (!outerNode) {
      throw 'No header present.';
    }

    if (outerNode.dataset.esgstParsed) {
      throw 'Header already parsed.';
    }

    this.nodes.outer = outerNode;
    this.nodes.inner = this.nodes.outer;
    this.nodes.nav = this.nodes.inner.querySelector('nav');
    this.nodes.leftNav = this.nodes.nav.querySelector('.nav__left-container');
    this.nodes.rightNav = this.nodes.nav.querySelector('.nav__right-container');

    const buttonContainerNodes = Array.from(this.nodes.nav.querySelectorAll('.nav__button-container'));

    for (const buttonContainerNode of buttonContainerNodes) {
      this.parseButtonContainer(buttonContainerNode);
    }

    if (this.buttonContainers['account'] && Session.namespace === Namespaces.SG) {
      Session.isLoggedIn = true;
      Session.xsrfToken = ISession.extractXsrfToken(this.buttonContainers['account'].dropdownItems['logout'].nodes.outer.dataset.form);
    }

    this.nodes.outer.dataset.esgstParsed = 'true';
  }

  /**
   * @param {HTMLElement} buttonContainerNode
   * @returns {IHeaderButtonContainer}
   */
  parseButtonContainer(buttonContainerNode) {
    /** @type {IHeaderButtonContainer} */
    const buttonContainer = {
      nodes: {
        outer: buttonContainerNode,
      },
      data: {
        id: '',
        buttonName: '',
        counter: 0,
        isFlashing: false,
        level: {
          base: 0,
          full: 0,
        },
        points: 0,
        reputation: {
          positive: 0,
          negative: 0,
        },
      },
    };

    const relativeDropdownNode = buttonContainer.nodes.outer.querySelector('.nav__relative-dropdown');

    if (relativeDropdownNode) {
      buttonContainer.nodes.relativeDropdown = relativeDropdownNode;
      buttonContainer.nodes.absoluteDropdown = buttonContainer.nodes.relativeDropdown.querySelector('.nav__absolute-dropdown');

      buttonContainer.dropdownItems = {};

      const dropdownItemNodes = buttonContainer.nodes.absoluteDropdown.querySelectorAll('.nav__row:not(.category)');

      for (const dropdownItemNode of dropdownItemNodes) {
        this.parseDropdownItem(buttonContainer.dropdownItems, dropdownItemNode);
      }

      buttonContainer.nodes.button = buttonContainer.nodes.outer.querySelector('.nav__button--is-dropdown');
      buttonContainer.nodes.arrow = buttonContainer.nodes.outer.querySelector('.nav__button--is-dropdown-arrow');
      buttonContainer.nodes.arrowIcon = buttonContainer.nodes.arrow.querySelector('.fa');

      const pointsNode = buttonContainer.nodes.button.querySelector('.nav__points');

      if (pointsNode) {
        buttonContainer.nodes.points = pointsNode;

        buttonContainer.data.points = IHeader.extractPoints(buttonContainer.nodes.points.textContent);

        if (Session.namespace === Namespaces.SG) {
          Session.counters.points = buttonContainer.data.points;
        }
      }

      const levelNode = buttonContainer.nodes.button.querySelector('[title]');

      if (levelNode) {
        buttonContainer.nodes.level = levelNode;

        buttonContainer.data.level = IHeader.extractLevel(buttonContainer.nodes.level.title);

        if (Session.namespace === Namespaces.SG) {
          Session.counters.level = buttonContainer.data.level;
        }
      }

      buttonContainer.data.isDropdown = true;
    } else {
      const buttonNode = buttonContainer.nodes.outer.querySelector('.nav__button');

      if (buttonNode) {
        buttonContainer.nodes.button = buttonNode;
      } else {
        buttonContainer.data.buttonName = 'Avatar';

        buttonContainer.user = new User(Namespaces.SG);
        buttonContainer.user.parse(buttonContainer.nodes.outer);

        if (Session.namespace === Namespaces.SG) {
          Session.user = Object.assign({}, buttonContainer.user.data);
        }
      }
    }

    if (buttonContainer.nodes.button) {
      buttonContainer.nodes.buttonName = buttonContainer.nodes.button;

      const buttonIconNode = buttonContainer.nodes.button.querySelector('.fa');

      if (buttonIconNode) {
        buttonContainer.nodes.buttonIcon = buttonIconNode;

        buttonContainer.data.buttonIcon = buttonContainer.nodes.buttonIcon.className;
      }

      const buttonImageNode = buttonContainer.nodes.button.querySelector('img');

      if (buttonImageNode) {
        buttonContainer.nodes.buttonImage = buttonImageNode;

        buttonContainer.data.buttonImage = buttonContainer.nodes.buttonImage.className;
      }

      buttonContainer.data.url = buttonContainer.nodes.button.getAttribute('href');
      buttonContainer.data.buttonName = buttonContainer.nodes.buttonName.title || buttonContainer.nodes.buttonName.textContent.trim();
    }

    if (buttonContainer.nodes.outer.classList.contains('nav__button-container--notification')) {
      buttonContainer.nodes.counter = buttonContainer.nodes.outer.querySelector('.nav__notification');

      if (buttonContainer.nodes.counter) {
        buttonContainer.data.counter = IHeader.extractCounter(buttonContainer.nodes.counter.textContent);
        buttonContainer.data.isFlashing = buttonContainer.nodes.counter.classList.contains('fade_infinite');
      }

      buttonContainer.data.isActive = buttonContainer.nodes.outer.classList.contains('nav__button-container--active');
      buttonContainer.data.isNotification = true;
    }

    buttonContainer.data.id = IHeader.generateId(buttonContainer.data.buttonName);

    if (Session.namespace === Namespaces.SG) {
      switch (buttonContainer.data.id) {
        case 'giveawaysCreated': {
          Session.counters.created = buttonContainer.data.counter;

          break;
        }

        case 'giveawaysWon': {
          Session.counters.won = buttonContainer.data.counter;
          Session.counters.wonDelivered = buttonContainer.data.isFlashing;

          break;
        }

        case 'messages': {
          Session.counters.messages = buttonContainer.data.counter;

          break;
        }

        default: {
          break;
        }
      }
    }

    this.buttonContainers[buttonContainer.data.id] = buttonContainer;

    return buttonContainer;
  }

  /**
   * @param {Object<string, IHeaderDropdownItem>} dropdownItems
   * @param {HTMLElement} dropdownItemNode
   * @returns {IHeaderDropdownItem}
   */
  parseDropdownItem(dropdownItems, dropdownItemNode) {
    /** @type {IHeaderDropdownItem} */
    const dropdownItem = {
      nodes: {
        outer: dropdownItemNode,
        icon: null,
        name: null,
      },
      data: {
        id: '',
        icon: '',
        name: '',
        url: '',
      },
    };

    dropdownItem.nodes.icon = dropdownItem.nodes.outer.querySelector('.fa');
    dropdownItem.nodes.summary = dropdownItem.nodes.outer.querySelector('.nav__row__summary');
    dropdownItem.nodes.name = dropdownItem.nodes.summary.querySelector('.nav__row__summary__name');
    dropdownItem.nodes.description = dropdownItem.nodes.summary.querySelector('.nav__row__summary__description');

    dropdownItem.data.url = dropdownItem.nodes.outer.getAttribute('href') || '';
    dropdownItem.data.icon = dropdownItem.nodes.icon.className;
    dropdownItem.data.name = dropdownItem.nodes.name.textContent.trim();
    dropdownItem.data.description = dropdownItem.nodes.description.textContent.trim();

    dropdownItem.data.id = IHeader.generateId(dropdownItem.data.name);

    dropdownItems[dropdownItem.data.id] = dropdownItem;

    return dropdownItem;
  }

  /**
   * @param {IHeaderButtonContainer} buttonContainer
   * @param {number} newCounter
   * @param {boolean} [isFlashing]
   */
  async updateCounter(buttonContainerId, newCounter, isFlashing) {
    const buttonContainer = this.buttonContainers[buttonContainerId];

    if (!buttonContainer) {
      throw 'Invalid button container id.';
    }

    if (!buttonContainer.nodes.counter) {
      buttonContainer.nodes.counter = DOM.build(buttonContainer.nodes.outer, 'beforeEnd', [
        ['div', { class: 'nav__notification' }],
      ]);
    }

    const oldCounter = buttonContainer.data.counter;

    if (oldCounter === newCounter && isFlashing === buttonContainer.data.isFlashing) {
      return;
    }

    if (newCounter) {
      buttonContainer.nodes.outer.classList.remove('nav__button-container--inactive');
      buttonContainer.nodes.outer.classList.add('nav__button-container--active');
      buttonContainer.nodes.counter.classList.remove('is-hidden');
      buttonContainer.nodes.counter.textContent = newCounter.toLocaleString('en-US');
    } else {
      buttonContainer.nodes.outer.classList.remove('nav__button-container--active');
      buttonContainer.nodes.outer.classList.add('nav__button-container--inactive');
      buttonContainer.nodes.counter.classList.add('is-hidden');
      buttonContainer.nodes.counter.textContent = '';
    }

    if (isFlashing) {
      buttonContainer.nodes.counter.classList.add('fade_infinite');
    } else {
      buttonContainer.nodes.counter.classList.remove('fade_infinite');
    }

    buttonContainer.data.counter = newCounter;
    buttonContainer.data.isFlashing = isFlashing;

    switch (buttonContainerId) {
      case 'giveawaysCreated': {
        Session.counters.created = newCounter;

        await EventDispatcher.dispatch(Events.CREATED_UPDATED, oldCounter, newCounter);

        break;
      }

      case 'giveawaysWon': {
        Session.counters.won = newCounter;
        Session.counters.wonDelivered = isFlashing;

        await EventDispatcher.dispatch(Events.WON_UPDATED, oldCounter, newCounter, isFlashing);

        break;
      }

      case 'messages': {
        Session.counters.messages = newCounter;

        await EventDispatcher.dispatch(Events.MESSAGES_UPDATED, oldCounter, newCounter);

        break;
      }

      default: {
        break;
      }
    }
  }

  /**
   * @param {number|string} newPoints
   */
  async updatePoints(newPoints) {
    const accountContainer = this.buttonContainers['account'];

    if (!accountContainer || !accountContainer.nodes.points) {
      return;
    }

    const oldPoints = accountContainer.data.points;

    if (typeof newPoints === 'string') {
      newPoints = parseInt(newPoints.replace(/,/g, ''));
    }

    if (oldPoints === newPoints) {
      return;
    }

    accountContainer.nodes.points.textContent = newPoints.toLocaleString('en-US');

    accountContainer.data.points = newPoints;
    Session.counters.points = newPoints;

    await EventDispatcher.dispatch(Events.POINTS_UPDATED, oldPoints, newPoints);
  }

  /**
   * @param {ILevel} newLevel
   */
  async updateLevel(newLevel) {
    const accountContainer = this.buttonContainers['account'];

    if (!accountContainer || !accountContainer.nodes.level) {
      return;
    }

    const oldLevel = accountContainer.data.level;

    if (oldLevel.full === newLevel.full) {
      return;
    }

    accountContainer.nodes.level.textContent = `Level ${newLevel.base}`;
    accountContainer.nodes.level.title = newLevel.full;

    accountContainer.data.level = newLevel;
    Session.counters.level = newLevel;

    await EventDispatcher.dispatch(Events.LEVEL_UPDATED, oldLevel, newLevel);
  }
}

class StHeader extends IHeader {
  constructor() {
    super();
  }

  /**
   * @param {IHeaderButtonContainerParams} params
   */
  addButtonContainer(params) {
    const [context, position] = params.context ? [params.context, params.position] : [this.nodes.logo, 'afterEnd'];

    let buttonContainerNode = null;

    if (params.isDropdown) {
      buttonContainerNode = DOM.build(context, position, [
        ['div', { class: 'nav_btn_container' }, [
          ['div', { class: 'dropdown is_hidden' }, [
            ['div'],
          ]],
          ['a', { class: 'nav_btn nav_btn_left', href: params.url || null, onclick: params.onClick, target: params.openInNewTab ? '_blank' : null }, [
            ...(params.buttonIcon ? [
              ['i', { class: params.buttonIcon }],
            ] : []),
            ...(params.buttonImage ? [
              ['img', { src: params.buttonImage }],
            ] : []),
            ['span', [
              params.buttonName,
              ...(params.isNotification ? [
                ['span', { class: 'message_count' }, params.counter.toLocaleString('en-US')],
              ] : []),
            ]],
          ]],
          ['div', { class: 'nav_btn nav_btn_right nav_btn_dropdown' }, [
            ['i', { class: 'fa fa-angle-down' }],
          ]],
        ]],
      ]);
    } else if (params.isNotification) {
      buttonContainerNode = DOM.build(context, position, [
        ['div', { class: 'nav_btn_container' }, [
          ['a', { class: 'nav_btn', href: params.url, target: params.openInNewTab ? '_blank' : null }, [
            ...(params.buttonIcon ? [
              ['i', { class: params.buttonIcon }],
            ] : []),
            ...(params.buttonImage ? [
              ['img', { src: params.buttonImage }],
            ] : []),
            ['span', { class: 'message_count' }, params.counter.toLocaleString('en-US')],
          ]],
        ]],
      ]);
    } else {
      buttonContainerNode = DOM.build(context, position, [
        ['div', { class: 'nav_btn_container' }, [
          ['a', { class: 'nav_btn', href: params.url, target: params.openInNewTab ? '_blank' : null }, [
            ...(params.buttonIcon ? [
              ['i', { class: params.buttonIcon }],
            ] : []),
            ...(params.buttonImage ? [
              ['img', { src: params.buttonImage }],
            ] : []),
            ['span', [
              params.buttonName,
              ...(params.isNotification ? [
                ['span', { class: 'message_count' }, params.counter.toLocaleString('en-US')],
              ] : []),
            ]],
          ]],
        ]],
      ]);
    }

    const buttonContainer = this.parseButtonContainer(buttonContainerNode);

    for (const id in params.dropdownItems) {
      const dropdownItemParams = params.dropdownItems[id];

      dropdownItemParams.buttonContainerId = buttonContainer.data.id;

      this.addDropdownItem(dropdownItemParams);
    }

    return buttonContainer;
  }

  /**
   * @param {IHeaderDropdownItemParams} params
   */
  addDropdownItem(params) {
    const buttonContainer = this.buttonContainers[params.buttonContainerId];

    if (!buttonContainer) {
      throw 'Invalid button container id.';
    }

    if (!buttonContainer.data.isDropdown) {
      throw 'Button container is not dropdown.';
    }

    const dropdownItemNode = DOM.build(buttonContainer.nodes.absoluteDropdown, 'beforeEnd', [
      [params.url ? 'a' : 'div', { class: 'dropdown_btn', href: params.url || null, onclick: params.onClick, target: params.openInNewTab ? '_blank' : null }, [
        ['i', { class: params.icon }],
        ['span', params.name],
      ]],
    ]);

    return this.parseDropdownItem(buttonContainer.dropdownItems, dropdownItemNode);
  }

  /**
   * @param {HTMLElement} context
   */
  parse(context) {
    const outerNode = context.querySelector('header');

    if (!outerNode) {
      throw 'No header present.';
    }

    if (outerNode.dataset.esgstParsed) {
      throw 'Header already parsed.';
    }

    this.nodes.outer = outerNode;
    this.nodes.inner = this.nodes.outer.querySelector('.header_inner_wrap');
    this.nodes.nav = this.nodes.inner.querySelector('nav');
    this.nodes.leftNav = this.nodes.nav;
    this.nodes.rightNav = this.nodes.nav;
    this.nodes.logo = this.nodes.nav.querySelector('.nav_logo');

    const buttonContainerNodes = Array.from(this.nodes.nav.querySelectorAll('.nav_btn_container, .nav_avatar'));

    for (const buttonContainerNode of buttonContainerNodes) {
      this.parseButtonContainer(buttonContainerNode);
    }

    if (this.buttonContainers['myProfile'] && Session.namespace === Namespaces.ST) {
      Session.isLoggedIn = true;
      Session.xsrfToken = ISession.extractXsrfToken(this.buttonContainers['myProfile'].dropdownItems['logout'].nodes.outer.dataset.form);
    }

    this.nodes.outer.dataset.esgstParsed = 'true';
  }

  /**
   * @param {HTMLElement} buttonContainerNode
   * @returns {IHeaderButtonContainer}
   */
  parseButtonContainer(buttonContainerNode) {
    /** @type {IHeaderButtonContainer} */
    const buttonContainer = {
      nodes: {
        outer: buttonContainerNode,
      },
      data: {
        id: '',
        buttonName: '',
        counter: 0,
        isFlashing: false,
        level: {
          base: 0,
          full: 0,
        },
        points: 0,
        reputation: {
          positive: 0,
          negative: 0,
        },
      },
    };

    const relativeDropdownNode = buttonContainer.nodes.outer.querySelector('.dropdown');

    if (relativeDropdownNode) {
      buttonContainer.nodes.relativeDropdown = relativeDropdownNode;
      buttonContainer.nodes.absoluteDropdown = buttonContainer.nodes.relativeDropdown.querySelector(':scope > div');

      buttonContainer.dropdownItems = {};

      const dropdownItemNodes = buttonContainer.nodes.absoluteDropdown.querySelectorAll('.dropdown_btn');

      for (const dropdownItemNode of dropdownItemNodes) {
        this.parseDropdownItem(buttonContainer.dropdownItems, dropdownItemNode);
      }

      buttonContainer.nodes.button = buttonContainer.nodes.outer.querySelector('.nav_btn_left');
      buttonContainer.nodes.arrow = buttonContainer.nodes.outer.querySelector('.nav_btn_right');
      buttonContainer.nodes.arrowIcon = buttonContainer.nodes.arrow.querySelector('.fa');

      const reputationNode = buttonContainer.nodes.button.querySelector('.is_faded');

      if (reputationNode) {
        buttonContainer.nodes.reputation = reputationNode;

        buttonContainer.data.reputation = IHeader.extractReputation(buttonContainer.nodes.reputation.textContent);

        if (Session.namespace === Namespaces.ST) {
          Session.counters.reputation = buttonContainer.data.reputation;
        }
      }

      buttonContainer.data.isDropdown = true;
    } else {
      const buttonNode = buttonContainer.nodes.outer.querySelector('.nav_btn');

      if (buttonNode) {
        buttonContainer.nodes.button = buttonNode;
      } else {
        buttonContainer.data.buttonName = 'Avatar';

        buttonContainer.user = new User(Namespaces.ST);
        buttonContainer.user.parse(buttonContainer.nodes.outer);

        if (Session.namespace === Namespaces.ST) {
          Session.user = Object.assign({}, buttonContainer.user.data);
        }
      }
    }

    if (buttonContainer.nodes.button) {
      buttonContainer.nodes.buttonName = (!buttonContainer.data.isDropdown && buttonContainer.nodes.button.querySelector('span')) || buttonContainer.nodes.button;

      const buttonIconNode = buttonContainer.nodes.button.querySelector('.fa');

      if (buttonIconNode) {
        buttonContainer.nodes.buttonIcon = buttonIconNode;

        buttonContainer.data.buttonIcon = buttonContainer.nodes.buttonIcon.className;
      }

      const buttonImageNode = buttonContainer.nodes.button.querySelector('img');

      if (buttonImageNode) {
        buttonContainer.nodes.buttonImage = buttonImageNode;

        buttonContainer.data.buttonImage = buttonContainer.nodes.buttonImage.className;
      }

      const counterNode = buttonContainer.nodes.buttonName.querySelector('.message_count');

      if (counterNode) {
        buttonContainer.nodes.counter = counterNode;

        if (buttonContainer.nodes.counter) {
          buttonContainer.data.counter = IHeader.extractCounter(buttonContainer.nodes.counter.textContent);
        }

        buttonContainer.data.isNotification = true;
      }

      buttonContainer.data.url = buttonContainer.nodes.button.getAttribute('href');
      buttonContainer.data.buttonName = buttonContainer.nodes.buttonName.title || buttonContainer.nodes.buttonName.textContent.trim();
    }

    buttonContainer.data.id = IHeader.generateId(buttonContainer.data.buttonName);

    if (Session.namespace === Namespaces.ST) {
      switch (buttonContainer.data.id) {
        case 'messages': {
          Session.counters.messages = buttonContainer.data.counter;

          break;
        }

        default: {
          break;
        }
      }
    }

    this.buttonContainers[buttonContainer.data.id] = buttonContainer;

    return buttonContainer;
  }

  /**
   * @param {Object<string, IHeaderDropdownItem>} dropdownItems
   * @param {HTMLElement} dropdownItemNode
   * @returns {IHeaderDropdownItem}
   */
  parseDropdownItem(dropdownItems, dropdownItemNode) {
    /** @type {IHeaderDropdownItem} */
    const dropdownItem = {
      nodes: {
        outer: dropdownItemNode,
        icon: null,
        name: null,
      },
      data: {
        id: '',
        icon: '',
        name: '',
        url: '',
      },
    };

    dropdownItem.nodes.icon = dropdownItem.nodes.outer.querySelector('.fa');
    dropdownItem.nodes.name = dropdownItem.nodes.outer.querySelector('span');

    dropdownItem.data.url = dropdownItem.nodes.outer.getAttribute('href') || '';
    dropdownItem.data.icon = dropdownItem.nodes.icon.className;
    dropdownItem.data.name = dropdownItem.nodes.name.textContent.trim();

    dropdownItem.data.id = IHeader.generateId(dropdownItem.data.name);

    dropdownItems[dropdownItem.data.id] = dropdownItem;

    return dropdownItem;
  }

  /**
   * @param {IHeaderButtonContainer} buttonContainer
   * @param {number} newCounter
   */
  async updateCounter(buttonContainerId, newCounter) {
    const buttonContainer = this.buttonContainers[buttonContainerId];

    if (!buttonContainer) {
      throw 'Invalid button container id.';
    }

    if (!buttonContainer.nodes.counter) {
      buttonContainer.nodes.counter = DOM.build(buttonContainer.nodes.buttonName, 'beforeEnd', [
        ['span', { class: 'message_count' }],
      ]);
    }

    const oldCounter = buttonContainer.data.counter;

    if (oldCounter === newCounter) {
      return;
    }

    if (newCounter) {
      buttonContainer.nodes.counter.classList.remove('is_hidden');
      buttonContainer.nodes.counter.textContent = newCounter.toLocaleString('en-US');
    } else {
      buttonContainer.nodes.counter.classList.add('is_hidden');
      buttonContainer.nodes.counter.textContent = '';
    }

    buttonContainer.data.counter = newCounter;

    switch (buttonContainerId) {
      case 'messages': {
        Session.counters.messages = newCounter;

        await EventDispatcher.dispatch(Events.MESSAGES_UPDATED, oldCounter, newCounter);

        break;
      }

      default: {
        break;
      }
    }
  }

  /**
   * @param {string} newReputationText
   */
  async updateReputation(newReputationText) {
    const myProfileContainer = this.buttonContainers['myProfile'];

    if (!myProfileContainer) {
      return;
    }

    const reputationNode = myProfileContainer.nodes.reputation;

    if (!reputationNode || reputationNode.textContent === newReputationText) {
      return;
    }

    const oldReputation = Session.counters.reputation;

    reputationNode.textContent = newReputationText;
    Session.counters.reputation = IHeader.extractReputation(newReputationText);

    const newReputation = Session.counters.reputation;

    await EventDispatcher.dispatch(Events.REPUTATION_UPDATED, oldReputation, newReputation);
  }
}

/**
 * @param {number} namespace
 * @returns {IHeader}
 */
function Header(namespace = Session.namespace) {
  switch (namespace) {
    case Namespaces.SG: {
      return new SgHeader();
    }

    case Namespaces.ST: {
      return new StHeader();
    }

    default: {
      throw 'Invalid namespace.';
    }
  }
}

export { IHeader, Header };