const app = {
	//API URL
	baseURL: 'http://localhost:12506/api/',
	
	//A Chrome webserver URL, this hosts the images from local harddrive
	imgsURL: 'http://127.0.0.1:8887/',

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
			.catch(app.err);
	},

	//fetches the single vehicle data what selected and calls the showForm method what loads the data into the DOM
	getVehicle: () => {
		let vID = localStorage.getItem('vID');
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
		console.log(vehicles);

		//if there are vehicles available;
		if (vehicles) {
			//for each vehicle pass the HTML into the parent element
			vehicles.forEach((v) => {
				container.innerHTML += `<div class="col-lg-4 col-md-6 mb-2 pb-5"><div id="vehicle-${v.vId}" class="mx-1 border border-secondary rounded bg-light"><a href="#"
				><img src="${app.imgsURL}${v.img}" alt="Image" class="img-fluid"/></a><div class="item-1-contents"><div class="text-center"><h3><a href="#">${v.make} ${v.model}</a></h3>
				  <div class="lease-price p-2"><span class="spec">$250</span>/month</div></div>
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
				</ul><div class="d-flex "><a href="form.html" id="btn-${v.vId}" class="btn btn-primary mx-auto mb-3 btn-lease">Lease Now</a></div></div></div></div>`;
			});
			//select all the buttons with an event what triggers the getVehicleID method and opens the form.html page
			let buttons = document.querySelectorAll('.btn-lease');
			buttons.forEach((b) => {
				b.addEventListener('click', (e) => app.getVehicleID(e));
			});
			//if there arent any vehicles
		} else {
			container.innerHTML = 'Currently we have no vehicles available for rent';
		}
	},

	//loads the form.html
	showForm: (v) => {
		//console.log(v);

		//selects the DOM elements
		let container = document.querySelector('.vehicle-container');
		let dateOfBirthDp = app.createPikaday('birthDp');
		let firstName = document.querySelector('#first-name');
		let lastName = document.querySelector('#last-name');
		let leasefromDp = app.createPikaday('leasefromDp');
		let dropDown = document.querySelector('#lease-last');
		let options = document.querySelectorAll('.dropdown-item');
		let leaseLast;

		//loads the html into the parent element
		container.innerHTML = `<div id="vehicle-${v.vId}" class="mx-1 border border-secondary rounded bg-light"><a href="#"
			><img src="${app.imgsURL}${v.img}" alt="Image" class="img-fluid"/></a><div class="item-1-contents"><div class="text-center"><h3><a href="#">${v.make} ${v.model}</a></h3>
			  <div class="lease-price p-2"><span class="spec">$250</span>/month</div></div>
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

		//get the send request button and listen on a click event
		document
			.querySelector('#set-request')
			.addEventListener('click', async function (e) {
				e.preventDefault();

				//if the input is valid calls the post methods:
					//-inserts a new user what gives back the new ID
					//-inserts a new request with the userID
				if (
					app.validateInput(
						firstName.value,
						lastName.value,
						dateOfBirthDp.toString(),
						leasefromDp.toString(),
						leaseLast
					)
				) {
					let user = await app.setUser(
						firstName.value,
						lastName.value,
						dateOfBirthDp.toString()
					);
					//console.log(user);
					let request = await app.setRequest(
						leasefromDp.toString(),
						leaseLast,
						v.vId,
						user.uid
					);
					if(request){
						alert("Your request just sent!");
					}
					//console.log(request);
				} else {
					console.warn('Wrong input!');
				}
			});
	},

	//insert request POST method
	setRequest: async function (leaseFrom, leaseLast, vehicleID, userID) {
		//console.log(leaseFrom, leaseLast, vehicleID, userID);
		let url = app.baseURL + 'Request';
		let req = new Request(url, {
			method: 'POST',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				leaseBegin: leaseFrom,
				leaseLast: leaseLast,
				userID: userID,
				vehicleID: vehicleID,
			}),
		});
		return await (await fetch(req).catch(app.err)).json();
	},
	
	//insert user POST method
	setUser: async function (fName, lName, Dp) {
		let url = app.baseURL + 'User';
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
			}),
		});

		return await (await fetch(req).catch(app.err)).json();
	},

	//saves the selected vehicle ID into a local storage
	getVehicleID: (e) => {
		localStorage.setItem('vID', e.target.id.replace('btn-', ''));
		//console.log(localStorage.getItem('vID'));
	},

	//validates the input
	validateInput: (firstName, lastName, dateOfBirth, leaseFrom, leaseLast) => {
		//console.log(firstName, lastName, dateOfBirth, leaseFrom, leaseLast);
		if (firstName && lastName && dateOfBirth && leaseFrom && leaseLast) {
			return true;
		} else {
			return false;
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
