import { ButtonSet } from '../../class/ButtonSet';
import { DOM } from '../../class/DOM';
import { FetchRequest } from '../../class/FetchRequest';
import { Module } from '../../class/Module';
import { Shared } from '../../class/Shared';

class GiveawaysFollowedGamesPage extends Module {
	constructor() {
		super();
		this.info = {
			description: [
				['ul', [
					['li', 'Adds a new giveaway page where you can see open giveaways for all of your followed games.'],
					['li', 'To access this page, use the sidebar navigation from the main page.']
				]]
			],
			id: 'fgp',
			name: 'Followed Games Page',
			sg: true,
			type: 'giveaways',
		};
	}

	init() {
		Shared.esgst.customPages.fgp = {
			check: Shared.common.isCurrentPath('Browse Giveaways'),
			load: async () => await this.load(),
		};
		const sidebarLink = document.querySelector('.sidebar__navigation__item__link[href="/giveaways/search?type=wishlist"]');
		if (sidebarLink) {
			DOM.insert(sidebarLink.parentElement, 'afterEnd', (
				<li class="sidebar__navigation__item">
					<a class="sidebar__navigation__item__link" href="/giveaways/search?esgst=fgp">
						<div class="sidebar__navigation__item__name">Followed</div>
						<div class="sidebar__navigation__item__underline"></div>
					</a>
				</li>
			));
		}
	}

	async load() {
		const obj = {
			container: Shared.esgst.pagination.previousElementSibling,
			context: null,
			count: 0,
			leftovers: [],
			page: 1,
			perPage: 50,
			reachedEnd: false,
			set: null,
			url: `${Shared.esgst.path}/search?page=`,
		};
		obj.context = DOM.insert(obj.container, 'inner', <div/>);
		obj.set = new ButtonSet({
			color1: 'green',
			color2: 'grey',
			icon1: '',
			icon2: '',
			title1: 'Load More',
			title2: 'Loading...',
			callback1: async () => await this.loadNextPage(obj),
		});
		obj.container.appendChild(obj.set.set);
		obj.set.trigger();
	}

	async loadNextPage(obj) {
		const context = DOM.insert(obj.context, 'beforeEnd', <div/>);
		obj.count = 0;
		while (obj.leftovers.length > 0 && obj.count < obj.perPage) {
			const leftover = obj.leftovers.splice(0, 1)[0];
			context.appendChild(leftover);
			obj.count += 1;
		}
		if (obj.count === obj.perPage) {
			await Shared.common.endless_load(context, true);
			return;
		}
		if (obj.reachedEnd) {
			obj.set.set.remove();
			return;
		}
		do {
			const response = await FetchRequest.get(`${obj.url}${obj.page}`);
			const html = response.html;
			const elements = html.querySelectorAll('.giveaway__row-outer-wrap');
			for (const element of elements) {
				const gameInfo = await Shared.esgst.modules.games.games_getInfo(element);
				if (gameInfo && Shared.esgst.games[gameInfo.type][gameInfo.id] && Shared.esgst.games[gameInfo.type][gameInfo.id].followed) {
					if (obj.count < obj.perPage) {
						context.appendChild(element.cloneNode(true));
						obj.count += 1;
					} else {
						obj.leftovers.push(element.cloneNode(true));
					}
				}
			}
			obj.page += 1;
			const pagination = html.querySelector('.pagination__navigation');
			obj.reachedEnd = !pagination || pagination.lastElementChild.classList.contains(Shared.esgst.selectedClass);
		} while (!obj.reachedEnd && obj.count < obj.perPage);
		await Shared.common.endless_load(context, true);
	}
}

const giveawaysFollowedGamesPage = new GiveawaysFollowedGamesPage();

export { giveawaysFollowedGamesPage };
