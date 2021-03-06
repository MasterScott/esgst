import { Popup } from './Popup';
import { Shared } from './Shared';
import { Settings } from './Settings';
import { FetchRequest } from './FetchRequest';

class _MessageNotifier {
	async notify(notifiedMessages) {
		const now = Date.now();
		if (now - notifiedMessages.lastCheck <= 86400000) {
			// It's been less than 24 hours since the last check.
			return;
		}
		try {
			const messages = (await FetchRequest.get('https://raw.githubusercontent.com/rafaelgssa/esgst/master/messages.json')).json;
			for (const message of messages) {
				if (now - message.timestamp > 2592000000) {
					// Message is older than 30 days.
					continue;
				}
				if (notifiedMessages.ids.includes(message.id)) {
					continue;
				}
				if (message.dependency && !Settings.get(dependency)) {
					continue;
				}
				new Popup({
					icon: 'fa-warning',
					title: message.message,
				}).open();
				notifiedMessages.ids.push(message.id);
			}
			notifiedMessages.lastCheck = now;
			await Shared.common.setValue('notifiedMessages', JSON.stringify(notifiedMessages));
		} catch (err) {}
	}
}

const MessageNotifier = new _MessageNotifier();

export { MessageNotifier };