import JSZip from 'jszip';
import browser from './browser';

let storage = null;
let isFirstRun = false;
let isUpdate = false;

browser.runtime.onInstalled.addListener(details => {
  if (details.reason === `install`) {
    isFirstRun = true;
  } else if (details.reason === `update`) {
    isUpdate = true;
  }
});

browser.storage.local.get(`settings`).then(async result => {
  /**
   *
   * @type {object}
   * @property {boolean} activateTab_sg
   * @property {boolean} activateTab_st
   */
  const settings = result.settings ? JSON.parse(result.settings) : {};
  if (settings.activateTab_sg || settings.activateTab_st) {
    // Get the currently active tab.
    const currentTab = (await queryTabs({active: true}))[0];
    if (settings.activateTab_sg) {
      // Set the SG tab as active.
      await activateTab(`steamgifts`);
    }
    if (settings.activateTab_st) {
      // Set the ST tab as active.
      await activateTab(`steamtrades`);
    }
    // Go back to the previously active tab.  
    if (currentTab && currentTab.id) {
      await updateTab(currentTab.id, {active: true});
    }
  }
  if (settings.notifyNewVersion_sg || settings.notifyNewVersion_st) {
    const url = [];
    if (settings.notifyNewVersion_sg) {
      url.push(`*://*.steamgifts.com/*`);
    }
    if (settings.notifyNewVersion_st) {
      url.push(`*://*.steamtrades.com/*`);
    }
    browser.runtime.onUpdateAvailable.addListener(details => {
      browser.tabs.query({ url }).then(tabs => {
        const tab = tabs[0];
        if (tab) {
          browser.tabs.sendMessage(tab.id, JSON.stringify({
            action: `update`,
            values: details
          })).then(() => {});
        } else {
          browser.runtime.reload();
        }
      });
    });
  }
});

function sendMessage(action, sender, values) {
  browser.tabs.query({url: [`*://*.steamgifts.com/*`, `*://*.steamtrades.com/*`]}).then(tabs => {
    tabs.forEach(tab => {
      if (tab.id === sender.tab.id) return;
      browser.tabs.sendMessage(tab.id, JSON.stringify({
        action: action,
        values: values
      })).then(() => {});
    });
  });
}

async function getZip(data, fileName) {
  const zip = new JSZip();
  zip.file(fileName, data);
  return (await zip.generateAsync({
    compression: `DEFLATE`,
    compressionOptions: {
      level: 9
    },
    type: `blob`
  }));
}

async function readZip(data) {
  const zip = new JSZip(),
    /** @property {Object} files */
    contents = await zip.loadAsync(data),
    keys = Object.keys(contents.files),
    output = [];
  for (const key of keys) {
    output.push({
      name: key,
      value: await zip.file(key).async(`string`)
    });
  }
  return output;
}

async function doFetch(parameters, request, sender, callback) {
  if (request.fileName) {
    parameters.body = await getZip(parameters.body, request.fileName);
  }

  let domain = request.url.match(/https?:\/\/(.+?)(\/.*)?$/)[1];
  let url = request.url.match(/(https?:\/\/.+?)(\/.*)?$/)[1];

  // get no-container cookies
  let cookies = await getCookies({
    domain: domain
  });

  const cookieHeader = parameters.headers.get(`Cookie`);
  let setCookies = [];
  if (cookieHeader) {
    setCookies = cookieHeader
      .split(/;\s/)
      .map(x => {
        const parts = x.match(/(.+?)=(.+?)/);
        return {
          name: parts[1],
          url: url,
          value: parts[2]
        };
      })
      .filter(x => x && !cookies.filter(y => x.name === y.name).length);
    for (const cookie of setCookies) {
      await setCookie(cookie);
    }
  }

  if (!request.manipulateCookies) {
    let response = null;
    let responseText = null;
    try {
      response = await window.fetch(request.url, parameters);
      responseText = request.blob
        ? (await readZip(await response.blob()))[0].value
        : await response.text();
      if (!response.ok) {
        throw responseText;
      }
    } catch (error) {
      callback(JSON.stringify({ error }));
      return;
    }
    for (const cookie of setCookies) {
      await deleteCookie({
        name: cookie.name,
        url: url
      });
    }
    callback(JSON.stringify({
      finalUrl: response.url,
      redirected: response.redirected,
      responseText: responseText
    }));
    return;
  }
  browser.tabs.get(sender.tab.id).then(async tab => {
    /**
     * @property {string} tab.cookieStoreId
     */
    if (tab.cookieStoreId === `firefox-default`) {
      let response = null;
      let responseText = null;
      try {
        response = await window.fetch(request.url, parameters);
        responseText = request.blob
          ? (await readZip(await response.blob()))[0].value
          : await response.text();
        if (!response.ok) {
          throw responseText;
        }
      } catch (error) {
        callback(JSON.stringify({ error }));
        return;
      }
      for (const cookie of setCookies) {
        await deleteCookie({
          name: cookie.name,
          url: url
        });
      }
      callback(JSON.stringify({
        finalUrl: response.url,
        redirected: response.redirected,
        responseText: responseText
      }));
      return;
    }

    // get container cookies
    let containerCookies = await getCookies({
      domain: domain,
      storeId: tab.cookieStoreId
    });

    // delete no-container cookies
    for (let i = cookies.length - 1; i > -1; i--) {
      let cookie = cookies[i];
      await deleteCookie({
        name: cookie.name,
        url: url
      });
    }
    // set container cookies to no-container scope
    for (let i = containerCookies.length - 1; i > -1; i--) {
      let cookie = containerCookies[i];
      cookie.url = request.url;
      /** @property {boolean} cookie.hostOnly */
      delete cookie.hostOnly;
      delete cookie.session;
      delete cookie.storeId;
      await setCookie(cookie);
    }

    // request
    let response = null;
    let responseText = null;
    try {
      response = await fetch(request.url, parameters);
      responseText = request.blob
        ? (await readZip(await response.blob()))[0].value
        : await response.text();
      if (!response.ok) {
        throw responseText;
      }
    } catch (error) {
      callback(JSON.stringify({ error }));
      return;
    }

    // delete container cookies from no-container scope
    for (let i = containerCookies.length - 1; i > -1; i--) {
      let cookie = containerCookies[i];
      await deleteCookie({
        name: cookie.name,
        url: url
      });
    }
    // restore no-container cookies
    for (let i = cookies.length - 1; i > -1; i--) {
      let cookie = cookies[i];
      cookie.url = request.url;
      delete cookie.hostOnly;
      delete cookie.session;
      delete cookie.storeId;
      await setCookie(cookie);
    }

    for (const cookie of setCookies) {
      await deleteCookie({
        name: cookie.name,
        url: url
      });
    }
    callback(JSON.stringify({
      finalUrl: response.url,
      redirected: response.redirected,
      responseText: responseText
    }));
  });
}

function getCookies(details) {
  return browser.cookies.getAll(details);
}

function setCookie(details) {
  return browser.cookies.set(details);
}

function deleteCookie(details) {
  return browser.cookies.remove(details);
}

const locks = {};

function do_lock(lock) {
  return new Promise(resolve => {
    _do_lock(lock, resolve);
  });
}

function _do_lock(lock, resolve) {
  const now = Date.now();
  let locked = locks[lock.key];
  if (!locked || !locked.uuid || locked.timestamp < now - (lock.threshold + 15000)) {
    locks[lock.key] = {
      timestamp: now,
      uuid: lock.uuid
    };
    setTimeout(() => {
      locked = locks[lock.key];
      if (!locked || locked.uuid !== lock.uuid) {
        setTimeout(() => _do_lock(lock, resolve), 0);
      } else {
        resolve();
      }
    }, lock.threshold / 2);
  } else {
    setTimeout(() => _do_lock(lock, resolve), lock.threshold / 3);
  }
}

function do_unlock(lock) {
  if (locks[lock.key] && locks[lock.key].uuid === lock.uuid) {
    delete locks[lock.key];
  }
}

browser.runtime.onMessage.addListener((request, sender) => {
  return new Promise(resolve => {
    let key, keys, parameters, values;
    switch (request.action) {
      case `do_lock`:
        do_lock(request.lock).then(resolve);
        break;
      case `do_unlock`:
        do_unlock(request.lock);
        resolve();
        break;
      case `delValues`:
        keys = JSON.parse(request.keys);
        browser.storage.local.remove(keys).then(() => {
          keys.forEach(key => {
            delete storage[key];
          });
          sendMessage(`delValues`, sender, keys);
          resolve();
        });
        break;
      case `fetch`:
        parameters = JSON.parse(request.parameters);
        parameters.headers = new Headers(parameters.headers);
        // noinspection JSIgnoredPromiseFromCall
        doFetch(parameters, request, sender, resolve);
        break;
      case `getStorage`:
        if (storage) {
          storage.isFirstRun = isFirstRun;
          storage.isUpdate = isUpdate;
          isFirstRun = false;
          isUpdate = false;
          resolve(JSON.stringify(storage));
        } else {
          browser.storage.local.get(null).then(stg => {
            storage = stg;
            storage.isFirstRun = isFirstRun;
            storage.isUpdate = isUpdate;
            isFirstRun = false;
            isUpdate = false;
            resolve(JSON.stringify(storage));
          });
        }
        break;
      case `reload`:
        browser.runtime.reload();
        resolve();
        break;
      case `setValues`:
        values = JSON.parse(request.values);
        browser.storage.local.set(values).then(() => {
          for (key in values) {
            if (values.hasOwnProperty(key)) {
              storage[key] = values[key];
            }
          }
          sendMessage(`setValues`, sender, values);
          resolve();
        });
        break;
      case `tabs`:
        // noinspection JSIgnoredPromiseFromCall
        getTabs(request);
        break;
    }
  });
});

async function getTabs(request) {
  let items = [
    {id: `inbox_sg`, pattern: `*://*.steamgifts.com/messages*`, url: `https://www.steamgifts.com/messages`},
    {id: `inbox_st`, pattern: `*://*.steamtrades.com/messages*`, url: `https://www.steamtrades.com/messages`},
    {
      id: `wishlist`,
      pattern: `*://*.steamgifts.com/giveaways/search?*type=wishlist*`,
      url: `https://www.steamgifts.com/giveaways/search?type=wishlist`
    },
    {id: `won`, pattern: `*://*.steamgifts.com/giveaways/won*`, url: `https://www.steamgifts.com/giveaways/won`},
  ];
  let any = false;
  for (let i = 0, n = items.length; i < n; i++) {
    let item = items[i];
    if (!request[item.id]) {
      continue;
    }
    let tab = (await queryTabs({url: item.pattern}))[0];
    if (tab && tab.id) {
      await updateTab(tab.id, {active: true});
      if (request.refresh) {
        browser.tabs.reload(tab.id);
      }
    } else if (request.any) {
      any = true;
    } else {
      window.open(item.url);
    }
  }
  if (any) {
    let tab = (await queryTabs({url: `*://*.steamgifts.com/*`}))[0];
    if (tab && tab.id) {
      await updateTab(tab.id, {active: true});
    }
  }
}

function queryTabs(query) {
  return browser.tabs.query(query);
}

function updateTab(id, parameters) {
  return browser.tabs.update(id, parameters);
}

async function activateTab(host) {
  const tab = (await queryTabs({url: `*://*.${host}.com/*`}))[0];
  if (tab && tab.id) {
    await updateTab(tab.id, {active: true});
  }
}