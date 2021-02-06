const Discord = require('discord.js');

const client = new Discord.Client();
const { Users, CurrencyShop } = require('./dbObjects');
const { Op } = require('sequelize');
const currency = new Discord.Collection();
const PREFIX = '!';

Reflect.defineProperty(currency, 'add', {
	/* eslint-disable-next-line func-name-matching */
	value: async function add(id, amount) {
		const user = currency.get(id);
		if (user) {
			user.balance += Number(amount);
			return user.save();
		}
		const newUser = await Users.create({ user_id: id, balance: amount });
		currency.set(id, newUser);
		return newUser;
	},
});

Reflect.defineProperty(currency, 'getBalance', {
	/* eslint-disable-next-line func-name-matching */
	value: function getBalance(id) {
		const user = currency.get(id);
		return user ? user.balance : 0;
	},
});

client.once('ready', async () => {
  const storedBalances = await Users.findAll();
  storedBalances.forEach(b => currency.set(b.user_id, b));
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
	if (message.author.bot) return;


	if (!message.content.startsWith(PREFIX)) return;
	const input = message.content.slice(PREFIX.length).trim();
	if (!input.length) return;
	const [, command, commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);

	if (command === 'balance') {
    const target = message.mentions.users.first() || message.author;
  return message.channel.send(`${target.tag} has ${currency.getBalance(target.id)} bumps`);
	} else if (command === 'leaderboard') {
    return message.channel.send(
    	currency.sort((a, b) => b.balance - a.balance)
    		.filter(user => client.users.cache.has(user.user_id))
    		.first(10)
    		.map((user, position) => `(${position + 1}) ${(client.users.cache.get(user.user_id).tag)}: ${user.balance} bumps`)
    		.join('\n'),
    	{ code: true }
    );
	}
});
//Message scraping function
scraper()
  function scraper(){client.once('message', message => {
  if (message.content === '!d bump') {
    currency.add(message.author.id, 1)
		setTimeout(() => scraper(), 7200000)} //If message is d! bump reward with 1 currency
	else scraper() //If message isnt !d bump run the function scraper
})};

client.login('your-token-here');
