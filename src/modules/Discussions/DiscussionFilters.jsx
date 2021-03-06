import { Button } from '../../class/Button';
import { Filters } from '../Filters';
import { Process } from '../../class/Process';
import { Utils } from '../../lib/jsUtils';
import { common } from '../Common';
import { Settings } from '../../class/Settings';
import { Shared } from '../../class/Shared';
import { DOM } from '../../class/DOM';

const
	checkMissingDiscussions = common.checkMissingDiscussions.bind(common),
	createHeadingButton = common.createHeadingButton.bind(common),
	createLock = common.createLock.bind(common),
	endless_load = common.endless_load.bind(common),
	getValue = common.getValue.bind(common),
	setValue = common.setValue.bind(common)
	;

class DiscussionsDiscussionFilters extends Filters {
	constructor() {
		super('df');
		this.info = {
			description: [
				['ul', [
					['li', 'Allows you to filter discussions.']
				]]
			],
			features: {
				df_s: {
					description: [
						['ul', [
							['li', [
								`Adds a button (`,
								['i', { class: 'fa fa-eye' }],
								' if the discussion is hidden and ',
								['i', { class: 'fa fa-eye-slash' }],
								` if it is not) next to a discussion's title (in any page) that allows you to hide the discussion.`
							]],
							['li', [
								`Adds a button (`,
								['i', { class: 'fa fa-comments' }],
								' ',
								['i', { class: 'fa fa-eye-slash' }],
								`) to the page heading of this menu that allows you to view all of the discussions that have been hidden.`
							]],
						]]
					],
					name: 'Single Filters',
					sg: true,
					features: {
						df_s_s: {
							name: `Show switch to temporarily hide / unhide discussions filtered by the filters in the main page heading, along with a counter.`,
							sg: true
						}
					}
				},
				df_m: {
					description: [
						['ul', [
							['li', 'Allows you to hide multiple discussions in a page using many different filters.'],
							['li', [
								`Adds a toggle switch with a button (`,
								['i', { class: 'fa fa-sliders' }],
								`) to the main page heading of any `,
								['a', { href: `https://www.steamgifts.com/discussions` }, 'discussions'],
								' page. The switch allows you to turn the filters on/off and the button allows you to manage your presets.'
							]],
							['li', `Adds a collapsible panel below the same main page heading that allows you to change/save the rules of a preset. The filters are separated in 2 categories:`],
							['ul', [
								['li', `Basic filters are related to a numeric value (such as the number of comments of a discussion) and have a slider that you can use to set the range of the filter (any discussions that do not apply to the range will be hidden).`],
								['li', `Type filters are related to a boolean value (such as whether or not a discussion was created by yourself) and have a checkbox that changes states when you click on it. The checkbox has 3 states:`],
								['ul', [
									['li', [
										`"Show all" (`,
										['i', { class: 'fa fa-check-square' }],
										`) does not hide any discussions that apply to the filter (this is the default state).`
									]],
									['li', [
										`"Show only" (`,
										['i', { class: 'fa fa-square' }],
										`) hides any discussions that do not apply to the filter.`
									]],
									['li', [
										`"Hide all" (`,
										['i', { class: 'fa fa-square-o' }],
										`) hides any discussions that apply to the filter.`
									]]
								]]
							]],
							['li', `A preset contains all of your rules and can be saved to be reused later. You can save as many presets as you want. Each preset contains 3 types of rules:`],
							['ul', [
								['li', `Basic rules are the ones that you can change directly in the filter panel, using the sliders/checkboxes as explained in the previous item.`],
								['li', 'Exception rules are the ones that you can change by clicking on the icon '],
								['i', { class: 'fa fa-gear' }],
								` in the filter panel. They are exceptions to the basic rules. For example, if you set the basic rule of the "Created" filter to "hide all" and you add an exception rule for the "Comments" filter to the 0-50 range, none of your created discussions that have 0-50 comments will be hidden, because they apply to the exception.`
							]],
							['li', [
								`Override rules are the ones that you can change by clicking on the icon (`,
								['i', { class: 'fa fa-exclamation esgst-faded' }],
								' if set to overridable and ',
								['i', { class: 'fa fa-exclamation' }],
								` if set to non-overridable) next to each filter. They are enforcements of the basic rules. Continuing the previous example, if you set the override rule of the "Created" filter to "non-overridable", then all of your created discussions will be hidden, because even if they apply to the exception, the basic rule is being enforced by the override rule, so the exception cannot override it.`
							]]
						]]
					],
					features: {
						df_m_f: {
							name: 'Fix filter bar at the top of the page.',
							sg: true
						},
						df_m_b: {
							name: 'Hide basic filters.',
							sg: true
						},
						df_m_a: {
							name: 'Hide advanced filters.',
							sg: true
						},
						df_comments: {
							description: [
								['ul', [
									['li', 'Allows you to filter discussions by number of comments.']
								]]
							],
							name: 'Comments',
							sg: true
						},
						df_addonsTools: {
							description: [
								['ul', [
									['li', 'Allows you to filter discussions categorized as "Add-ons / Tools".']
								]]
							],
							name: 'Add-ons / Tools',
							sg: true
						},
						df_announcements: {
							description: [
								['ul', [
									['li', 'Allows you to filter discussions categorized as "Announcements".']
								]]
							],
							name: 'Announcements',
							sg: true
						},
						df_bugsSuggestions: {
							description: [
								['ul', [
									['li', 'Allows you to filter discussions categorized as "Bugs / Suggestions".']
								]]
							],
							name: 'Bugs / Suggestions',
							sg: true
						},
						df_deals: {
							description: [
								['ul', [
									['li', 'Allows you to filter discussions categorized as "Deals".']
								]]
							],
							name: 'Deals',
							sg: true
						},
						df_gameShowcase: {
							description: [
								['ul', [
									['li', 'Allows you to filter discussions categorized as "Game Showcase".']
								]]
							],
							name: 'Game Showcase',
							sg: true
						},
						df_general: {
							description: [
								['ul', [
									['li', 'Allows you to filter discussions categorized as "General".']
								]]
							],
							name: 'General',
							sg: true
						},
						df_groupRecruitment: {
							description: [
								['ul', [
									['li', 'Allows you to filter discussions categorized as "Group Recruitment".']
								]]
							],
							name: 'Group Recruitment',
							sg: true
						},
						df_hardware: {
							description: [
								['ul', [
									['li', 'Allows you to filter discussions categorized as "Hardware".']
								]]
							],
							name: 'Hardware',
							sg: true
						},
						df_help: {
							description: [
								['ul', [
									['li', 'Allows you to filter discussions categorized as "Help".']
								]]
							],
							name: 'Help',
							sg: true
						},
						df_letsPlayTogether: {
							description: [
								['ul', [
									['li', 'Allows you to filter discussions categorized as "Let\'s Play Together".']
								]]
							],
							name: 'Let\'s Play Together',
							sg: true
						},
						df_moviesTV: {
							description: [
								['ul', [
									['li', 'Allows you to filter discussions categorized as "Movies / TV".']
								]]
							],
							name: 'Movies / TV',
							sg: true
						},
						df_offTopic: {
							description: [
								['ul', [
									['li', 'Allows you to filter discussions categorized as "Off Topic".']
								]]
							],
							name: 'Off Topic',
							sg: true
						},
						df_puzzlesEvents: {
							description: [
								['ul', [
									['li', 'Allows you to filter discussions categorized as "Puzzles / Events".']
								]]
							],
							name: 'Puzzles / Events',
							sg: true
						},
						df_uncategorized: {
							description: [
								['ul', [
									['li', 'Allows you to filter discussions categorized as "Uncategorized".']
								]]
							],
							name: 'Uncategorized',
							sg: true
						},
						df_userProjects: {
							description: [
								['ul', [
									['li', 'Allows you to filter discussions categorized as "User Projects".']
								]]
							],
							name: 'User Projects',
							sg: true
						},
						df_whitelistRecruitment: {
							description: [
								['ul', [
									['li', 'Allows you to filter discussions categorized as "Whitelist Recruitment".']
								]]
							],
							name: 'Whitelist Recruitment',
							sg: true
						},
						df_created: {
							description: [
								['ul', [
									['li', 'Allows you to filter discussions created by yourself.']
								]]
							],
							name: 'Created',
							sg: true
						},
						df_poll: {
							description: [
								['ul', [
									['li', 'Allows you to filter discussions that contain polls.']
								]]
							],
							name: 'Poll',
							sg: true
						},
						df_bookmarked: {
							description: [
								['ul', [
									['li', 'Allows you to filter discussions that you have bookmarked.']
								]]
							],
							name: 'Bookmarked',
							sg: true
						},
						df_visited: {
							dependencies: ['gdttt'],
							description: [
								['ul', [
									['li', 'Allows you to filter discussions that you have visited.']
								]]
							],
							name: 'Visited',
							sg: true
						},
						df_subscribed: {
							dependencies: ['tds'],
							description: [
								['ul', [
									['li', 'Allows you to filter discussions that you have subcribed.']
								]]
							],
							name: 'Subscribed',
							sg: true
						},
						df_unread: {
							dependencies: ['ct'],
							description: [
								['ul', [
									['li', 'Allows you to filter discussions that you have read.']
								]]
							],
							name: 'Unread',
							sg: true
						},
						df_authors: {
							description: [
								['ul', [
									['li', 'Allows you to filter discussions by author.']
								]]
							],
							name: 'Authors',
							sg: true
						}
					},
					name: 'Multiple Filters',
					sg: true
				}
			},
			id: 'df',
			name: 'Discussion Filters',
			sg: true,
			type: 'discussions'
		};
	}

	async init() {
		if (Settings.get('df_s')) {
			if (Settings.get('df_s_s')) {
				this.addSingleButton('fa-comments');
			}
			this.esgst.discussionFeatures.push(this.df_addButtons.bind(this));
		}
		if (Settings.get('df_m') && this.esgst.discussionsPath && !this.esgst.editDiscussionPath) {
			if (!Shared.esgst.hasAddedFilterContainer) {
				Shared.esgst.style.insertAdjacentText("beforeend", `
					.esgst-gf-container {
						position: ${Settings.get('df_m_f') ? 'sticky' : 'static'};
						top: ${Shared.esgst.commentsTop}px;
					}
				`);
			}
			createHeadingButton({
				element: this.filters_addContainer(this.esgst.mainPageHeading),
				id: 'df'
			});
		}
		if (!this.esgst.giveawaysPath || !this.esgst.activeDiscussions || Settings.get('adots') || Settings.get('oadd')) return;
		await checkMissingDiscussions();
	}

	df_menu(obj, button) {
		obj.process = new Process({
			button,
			popup: {
				icon: 'fa-comments',
				title: 'Hidden Discussions',
				addProgress: true,
				addScrollable: 'left'
			},
			urls: {
				id: 'df',
				init: this.df_initUrls.bind(this),
				request: {
					request: this.df_requestUrl.bind(this)
				}
			}
		});
	}

	async df_initUrls(obj) {
		obj.discussions = obj.popup.getScrollable([
			['div', { class: 'table esgst-text-left' }, [
				['div', { class: 'table__heading' }, [
					['div', { class: 'table__column--width-fill' }, 'Summary'],
					['div', { class: 'table__column--width-small text-center' }, 'Comments']
				]],
				['div', { class: 'table__rows' }]
			]]
		]).lastElementChild;
		const discussions = JSON.parse(getValue('discussions'));
		let hidden = [];
		for (const key in discussions) {
			if (discussions.hasOwnProperty(key)) {
				if (discussions[key].hidden) {
					const discussion = {
						code: key,
						hidden: parseInt(discussions[key].hidden)
					};
					hidden.push(discussion);
				}
			}
		}
		hidden = Utils.sortArray(hidden, true, 'hidden');
		obj.ids = [];
		for (const discussion of hidden) {
			obj.ids.push(discussion.code);
			obj.items.push(`/discussion/${discussion.code}/`);
		}
	}

	async df_requestUrl(obj, details, response, responseHtml) {
		const breadcrumbs = responseHtml.getElementsByClassName('page__heading__breadcrumbs');
		const categoryLink = breadcrumbs[0].firstElementChild.nextElementSibling.nextElementSibling;
		const usernameLink = responseHtml.getElementsByClassName('comment__username')[0].firstElementChild;
		DOM.insert(obj.discussions, 'beforeEnd', (
			<div>
				<div class="table__row-outer-wrap">
					<div class="table__row-inner-wrap">
						<div>
							{responseHtml.getElementsByClassName('global__image-outer-wrap')[0]}
						</div>
						<div class="table__column--width-fill">
							<h3>
								<a
									class="table__column__heading"
									href={`/discussion/${obj.ids[obj.index]}/`}
								>
									{categoryLink.nextElementSibling.nextElementSibling.firstElementChild.textContent}
								</a>
							</h3>
							<p>
								<a
									class="table__column__secondary-link"
									href={categoryLink.getAttribute('href')}
								>
									{categoryLink.textContent}
								</a>
								{' - '}
								{responseHtml.querySelector(`.comment [data-timestamp]`)}
								{' by '}
								<a
									class="table__column__secondary-link"
									href={usernameLink.getAttribute('href')}
								>
									{usernameLink.textContent}
								</a>
							</p>
							<div class="table__column--width-small text-center">
								<a
									class="table__column__secondary-link"
									href={`/discussion/${obj.ids[obj.index]}/`}
								>
									{breadcrumbs[1].textContent.match(/(.+) Comments?/)[1]}
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		));
		await endless_load(obj.discussions);
		if (!this.esgst.giveawaysPath && !this.esgst.discussionsPath) {
			if (Settings.get('gdttt')) {
				await this.esgst.modules.commentsCommentTracker.ct_addDiscussionPanels(obj.discussions, true);
				await this.esgst.modules.generalGiveawayDiscussionTicketTradeTracker.gdttt_checkVisited(obj.discussions);
			} else if (Settings.get('ct')) {
				await this.esgst.modules.commentsCommentTracker.ct_addDiscussionPanels(obj.discussions, true);
			}
			await this.esgst.modules.discussions.discussions_load(obj.discussions);
		}
	}

	df_addButtons(discussions, main) {
		for (const discussion of discussions) {
			if (!discussion.heading.parentElement.getElementsByClassName('esgst-df-button')[0]) {
				new Button(discussion.headingContainer.firstElementChild, 'beforeBegin', {
					callbacks: [this.df_hideDiscussion.bind(this, discussion, main), null, this.df_unhideDiscussion.bind(this, discussion, main), null],
					className: 'esgst-df-button',
					icons: ['fa-eye-slash esgst-clickable', 'fa-circle-o-notch fa-spin', 'fa-eye esgst-clickable', 'fa-circle-o-notch fa-spin'],
					id: 'df_s',
					index: discussion.saved && discussion.saved.hidden ? 2 : 0,
					titles: ['Hide discussion', 'Hiding discussion...', 'Unhide discussion', 'Unhiding discussion...']
				});
			}
		}
	}

	async df_hideDiscussion(discussion, main) {
		let deleteLock = await createLock('discussionLock', 300);
		let discussions = JSON.parse(getValue('discussions', '{}'));
		if (!discussions[discussion.code]) {
			discussions[discussion.code] = {};
		}
		discussions[discussion.code].hidden = discussions[discussion.code].lastUsed = Date.now();
		await setValue('discussions', JSON.stringify(discussions));
		deleteLock();
		if (!main || !this.esgst.discussionPath) {
			discussion.outerWrap.remove();
		}
		return true;
	}

	async df_unhideDiscussion(discussion, main) {
		let deleteLock = await createLock('discussionLock', 300);
		let discussions = JSON.parse(getValue('discussions', '{}'));
		if (discussions[discussion.code]) {
			delete discussions[discussion.code].hidden;
			discussions[discussion.code].lastUsed = Date.now();
		}
		await setValue('discussions', JSON.stringify(discussions));
		deleteLock();
		if (!main || !this.esgst.discussionPath) {
			discussion.outerWrap.remove();
		}
		return true;
	}

	getFilters() {
		return {
			comments: {
				check: true,
				minValue: 0,
				name: 'Comments',
				type: 'integer'
			},
			addonsTools: {
				check: true,
				name: 'Add-ons / Tools',
				type: 'boolean'
			},
			announcements: {
				check: true,
				name: 'Announcements',
				type: 'boolean'
			},
			bugsSuggestion: {
				check: true,
				name: 'Bugs / Suggestion',
				type: 'boolean'
			},
			deals: {
				check: true,
				name: 'Deals',
				type: 'boolean'
			},
			gameShowcase: {
				check: true,
				name: 'Game / Showcase',
				type: 'boolean'
			},
			general: {
				check: true,
				name: 'General',
				type: 'boolean'
			},
			groupRecruitment: {
				check: true,
				name: 'Group Recruitment',
				type: 'boolean'
			},
			hardware: {
				check: true,
				name: 'Hardware',
				type: 'boolean'
			},
			help: {
				check: true,
				name: 'Help',
				type: 'boolean'
			},
			letsPlayTogether: {
				check: true,
				name: 'Let\'s Play Together',
				type: 'boolean'
			},
			moviesTV: {
				check: true,
				name: 'Movies / TV',
				type: 'boolean'
			},
			offTopic: {
				check: true,
				name: 'Off Topic',
				type: 'boolean'
			},
			puzzlesEvents: {
				check: true,
				name: 'Puzzles / Events',
				type: 'boolean'
			},
			uncategorized: {
				check: true,
				name: 'Uncategorized',
				type: 'boolean'
			},
			userProjects: {
				check: true,
				name: 'User Projects',
				type: 'boolean'
			},
			whitelistRecruitment: {
				check: true,
				name: 'Whitelist Recruitment',
				type: 'boolean'
			},
			created: {
				check: true,
				name: 'Created',
				type: 'boolean'
			},
			poll: {
				check: true,
				name: 'Poll',
				type: 'boolean'
			},
			bookmarked: {
				check: true,
				name: 'Bookmarked',
				type: 'boolean'
			},
			visited: {
				check: Settings.get('gdttt'),
				name: 'Visited',
				type: 'boolean'
			},
			subscribed: {
				check: Settings.get('tds'),
				name: 'Subscribed',
				type: 'boolean'
			},
			unread: {
				check: Settings.get('ct'),
				name: 'Unread',
				type: 'boolean'
			},
			authors: {
				check: true,
				list: true,
				name: 'Authors',
				type: 'string'
			}
		};
	}
}

const discussionsDiscussionFilters = new DiscussionsDiscussionFilters();

export { discussionsDiscussionFilters };