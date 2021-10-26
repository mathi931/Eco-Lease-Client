const app = {
	//API URL
	baseURL: 'http://localhost:5000/api/',

	//triggers the app
	init: () => {
		document.addEventListener('DOMContentLoaded', app.load);
		console.log('HTML loaded');
	},

	load: () => {
		//the page had finished loading its HTML
		app.getData();
	},

	getData: () => {
		//based on the current page
		let page = document.body.id;
		switch (page) {
			case 'vehicles':
				app.getVehicles();
				break;
			case 'form':
				app.getVehicle();
				break;
			default:
				break;
		}
	},

	//fetches the vehicles data and calls the showVehicles method what loads the data into the DOM
	getVehicles: () => {
		let url = app.baseURL + 'Vehicles';
		let req = new Request(url, {
			method: 'GET',
			mode: 'cors',
		});
		fetch(req)
			.then((resp) => resp.json())
			.then(app.showVehicles)
			.catch(() => (window.location = 'error.html'));
	},

	//fetches the single vehicle data what selected and calls the showForm method what loads the data into the DOM
	getVehicle: () => {
		let vID = localStorage.getItem('vID');
		//console.log(vID);
		if (vID) {
			let url = app.baseURL + `Vehicles/${vID}`;
			let req = new Request(url, {
				method: 'GET',
				mode: 'cors',
			});
			fetch(req)
				.then((resp) => resp.json())
				.then(app.showForm)
				.catch(app.err);
		} else {
			app.err();
		}
	},

	//loads the index.html page with the available vehicles
	showVehicles: (unfilteredVehicles) => {
		//select the parent DOM element
		let container = document.querySelector('.vehicle-container');

		//filter the vehicles to show only the available ones
		let vehicles = [...unfilteredVehicles].filter(
			(v) => v.status === 'Available'
		);
		//console.log(vehicles);

		//if there are vehicles available;
		if (vehicles) {
			//for each vehicle pass the HTML into the parent element
			vehicles.forEach((v) => {
				//console.log(v);
				container.innerHTML += `<div class="col-lg-4 col-md-6 mb-2 pb-5"><div id="vehicle-${v.vId}" class="mx-1 border border-secondary rounded bg-light"><a href="#"
				><img src="${app.baseURL}Files/${v.img}" alt="Image" class="img-fluid"/></a><div class="item-1-contents"><div class="text-center"><h3><a href="#">${v.make} ${v.model}</a></h3>
				  <div class="lease-price p-2"><span class="spec">$${v.price}</span>/month</div></div>
				<ul class="specs list-unstyled ">
				  <li>
					<span>Registered:</span>
					<span class="spec">${v.registered}</span>
				  </li>
				  <li>
					<span>Plate Number:</span>
					<span class="spec">${v.plateNo}</span>
				  </li>
				  <li>
					<span>Km:</span>
					<span class="spec">${v.km}</span>
				  </li>
				</ul><div class="d-flex "><a href="form.html" id="btn-${v.vid}" class="btn btn-primary mx-auto mb-3 btn-lease">Lease Now</a></div></div></div></div>`;
			});
			//select all the buttons with an event what triggers the getVehicleID method and opens the form.html page
			let buttons = document.querySelectorAll('.btn-lease');
			buttons.forEach((b) => {
				//console.log(b);
				b.addEventListener('click', (e) => app.getVehicleID(e));
			});
			//if there arent any vehicles
		} else {
			container.innerHTML = 'Currently we have no vehicles available for rent';
		}
	},

	//loads the form.html
	showForm: (v) => {
		console.log(v);

		//selects the DOM elements
		let container = document.querySelector('.vehicle-container');
		let dateOfBirthDp = app.createPikaday('birthDp');
		let firstName = document.querySelector('#first-name');
		let lastName = document.querySelector('#last-name');
		let email = document.querySelector('#email');
		let phoneNo = document.querySelector('#phoneNo');
		let leasefromDp = app.createPikaday('leasefromDp');
		let dropDown = document.querySelector('#lease-last');
		let options = document.querySelectorAll('.dropdown-item');
		let errorContainer = document.querySelector('#error-cont');
		let leaseLast;

		//loads the html into the parent element
		container.innerHTML = `<div id="vehicle-${v.vId}" class="mx-1 border border-secondary rounded bg-light"><a href="#"
			><img src="${app.baseURL}Files/${v.img}" alt="Image" class="img-fluid"/></a><div class="item-1-contents"><div class="text-center"><h3><a href="#">${v.make} ${v.model}</a></h3>
			  <div class="lease-price p-2"><span class="spec">$${v.price}</span>/month</div></div>
			<ul class="specs list-unstyled ">
			  <li>
				<span>Registered:</span>
				<span class="spec">${v.registered}</span>
			  </li>
			  <li>
				<span>Plate Number:</span>
				<span class="spec">${v.plateNo}</span>
			  </li>
			  <li>
				<span>Km:</span>
				<span class="spec">${v.km}</span>
			  </li>
			</ul></div></div>`;

		//dropdown selection event, on selection -> if there is selected date changes the LeaseLast variable to the counted new value
		//what depends on the selection
		options.forEach((o) => {
			o.addEventListener('click', (e) => {
				e.preventDefault();
				dropDown.innerHTML = e.target.innerHTML;
				if (leasefromDp.toString()) {
					leaseLast = app.countDate(
						leasefromDp.toString(),
						e.target.innerHTML[0]
					);
				}
			});
		});

		//get the reserve button and listen on a click event
		document
			.querySelector('#set-request')
			.addEventListener('click', async function (e) {
				e.preventDefault();

				//clears old errors
				errorContainer.innerHTML = '';

				//if the input is valid calls the post methods:
				//-inserts a new customer what gives back the new ID
				//-inserts a new reservation with the customerID
				//after a successfull insterted reservation changes the vehicles status to "reserved"
				//gets the errors what is an array, if there is error, signify to the user
				let errors = app.validateInput(
					firstName.value,
					lastName.value,
					email.value,
					phoneNo.value,
					dateOfBirthDp.toString(),
					leasefromDp.toString(),
					leaseLast
				);

				//if there is errors
				if (errors.length == 0) {
					let customer = await app.setCustomer(
						firstName.value,
						lastName.value,
						email.value,
						phoneNo.value,
						dateOfBirthDp.toString()
					);

					//console.log(customer);
					let reservation = await app.setReservation(
						leasefromDp.toString(),
						leaseLast,
						v.vid,
						customer.cid
					);

					if (reservation) {
						alert('Your reservation just sent!');

						let status = await app.putVehicle(v.vId);
						if (status) console.log(`changed status to ${v.status}!`);
					}
				} else {
					errors.forEach((error) => {
						errorContainer.innerHTML += `<p>${error}</p>`;
					});
				}
			});
	},

	//insert reservation POST method
	setReservation: async function (leaseFrom, leaseLast, vehicleID, customerID) {
		//console.log(leaseFrom, leaseLast, vehicleID, customerID);
		let url = app.baseURL + 'Reservations';
		let req = new Request(url, {
			method: 'POST',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				leaseBegin: leaseFrom,
				leaseLast: leaseLast,
				status: 'Pending',
				customer: {
					cid: customerID,
				},
				vehicle: {
					vid: vehicleID,
				},
			}),
		});
		return await (await fetch(req).catch(app.err)).json();
	},

	//insert customer POST method
	setCustomer: async function (fName, lName, mail, phone, Dp) {
		let url = `${app.baseURL}Customers`;
		let req = new Request(url, {
			method: 'POST',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				firstName: fName,
				lastName: lName,
				dateOfBirth: Dp,
				email: mail,
				phoneNo: phone,
			}),
		});

		return await (await fetch(req).catch(app.err)).json();
	},

	//put request to change vehicle status after reservation
	putVehicle: async function (id) {
		let url = `${app.baseURL}Vehicles?id=${id}`;
		let req = new Request(url, {
			method: 'PUT',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		if (await fetch(req).catch(app.err)) {
			return true;
		}
	},

	//saves the selected vehicle ID into a local storage
	getVehicleID: (e) => {
		//console.log(e.target);
		localStorage.setItem('vID', e.target.id.replace('btn-', ''));
		console.log(localStorage.getItem('vID'));
	},

	//validates the input
	validateInput: (
		firstName,
		lastName,
		email,
		phoneNo,
		dateOfBirth,
		leaseFrom,
		leaseLast
	) => {
		//if the input invalid, pushes the message to an array what is returned by the function
		let messages = [];
		let currentYear = new Date().getFullYear();

		if (firstName.length < 3 || firstName.length > 20) {
			messages.push('First Name length must be between 3-20 characters!');
		}

		if (lastName.length < 3 || lastName.length > 20) {
			messages.push('Last Name length must be between 3-20 characters!');
		}

		if (!validateEmail(email)) {
			messages.push('Invalid Email address!');
		}

		if (phoneNo.length < 5 || phoneNo.length > 15) {
			messages.push('Invalid Phone number!');
		}

		if (
			dateOfBirth.substring(0, 4) < currentYear - 120 ||
			dateOfBirth.substring(0, 4) > currentYear - 17
		) {
			messages.push('Age must be atleast 18 and max 120');
		}

		if (leaseFrom.length == 0 || Date.parse(leaseFrom) < Date.now()) {
			messages.push(
				'Leasing can not begin in the past and date must be selected'
			);
		}

		if (document.querySelector('#lease-last').textContent.includes('Lease')) {
			messages.push('Must select a lease period');
		}

		return messages;

		function validateEmail(email) {
			const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(String(email).toLowerCase());
		}
	},

	//counts the lease period
	countDate: (date, increse) => {
		let newDate = new Date(date);
		const day = newDate.getDate();
		const month = newDate.getMonth() + 1;
		const year = newDate.getFullYear() + parseInt(increse);
		return `${year}-${month}-${day}`;
	},

	//creates the datepicker with toString property
	createPikaday: (id) => {
		return new Pikaday({
			field: document.querySelector(`#${id}`),
			toString(date, format) {
				const day = date.getDate();
				const month = date.getMonth() + 1;
				const year = date.getFullYear();
				return `${year}-${month}-${day}`;
			},
		});
	},

	//customizable error
	err: (err) => {
		let container = document.querySelector('.vehicle-container');
		container.innerHTML = `<div class="error-msg">Error!\n${err}</div>`;
		console.log(err);
		setTimeout(() => {
			let div = document.querySelector('.error-msg');
			div.parentElement.removeChild(div);
		}, 5000);
	},
};

//starts the app
app.init();
