const leasefromDp = new Pikaday({
	field: document.getElementById('leaseFromDp'),
	format: 'D/M/YYYY',
	toString(date, format) {

		const day = date.getDate();
		const month = date.getMonth() + 1;
		const year = date.getFullYear();
		return `${day}-${month}-${year}`;
	},
});

const dateOfBirthDp = new Pikaday({
	field: document.getElementById('birthDp'),
	format: 'D/M/YYYY',
	toString(date, format) {

		const day = date.getDate();
		const month = date.getMonth() + 1;
		const year = date.getFullYear();
		return `${day}-${month}-${year}`;
	},
});