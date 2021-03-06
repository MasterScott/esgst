import { Module } from '../../class/Module';
import { Shared } from '../../class/Shared';

class GeneralFixedHeader extends Module {
	constructor() {
		super();
		this.info = {
			description: [
				['ul', [
					['li', 'Keeps the header of any page at the top of the window while you scroll down the page.']
				]]
			],
			id: 'fh',
			name: 'Fixed Header',
			sg: true,
			st: true,
			type: 'general'
		};
	}

	init() {
		if (!Shared.header) {
			return;
		}

		Shared.header.nodes.outer.classList.add('esgst-fh');
	}
}

const generalFixedHeader = new GeneralFixedHeader();

export { generalFixedHeader };