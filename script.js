const app = {
	baseURL: 'http://localhost:12506/api/',
	imgsURL: 'http://127.0.0.1:8887/',
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
			let buttons = document.querySelectorAll('.btn-lease');
			buttons.forEach((b) => {
				b.addEventListener('click', (e) => app.getVehicleID(e));
			});
			//if there arent any vehicles
		} else {
			container.innerHTML = 'Currently we have no vehicles available for rent';
		}
	},
	showForm: (v) => {
		//select the parent DOM element
		let container = document.querySelector('.vehicle-container');

		console.log(v);

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

		const leasefromDp = app.createPikaday('leasefromDp');

		const dateOfBirthDp = app.createPikaday('birthDp');

		const btn = document.querySelector('#set-request');
		console.log(btn);
		btn.addEventListener('click', () => {
			setUser(dateOfBirthDp);
			setRequest(leasefromDp, dateOfBirthDp, v);
		});
	},
	setRequest: (leasefromDp, dateOfBirthDp, vehicle) => {
		if (validateInput()) {
		} else {
			app.err();
		}
	},
	setUser: (dateOfBirthDp) => {
		let firstName = document.querySelector('#first-name');
		let lastName = document.querySelector('#last-name');
	},
	getVehicleID: (e) => {
		localStorage.setItem('vID', e.target.id.replace('btn-', ''));
		//console.log(localStorage.getItem('vID'));
	},
	validateInput: (firstName, lastName, dateOfBirth, leaseFrom, leasePeriod) => {
		if (firstName && lastName && dateOfBirth && leaseFrom && leasePeriod) {
			return true;
		} else {
			return false;
		}
	},
	createPikaday: (id) => {
		return new Pikaday({
			field: document.getElementById(`${id}`),
			format: 'D/M/YYYY',
			toString(date, format) {
				const day = date.getDate();
				const month = date.getMonth() + 1;
				const year = date.getFullYear();
				return `${day}-${month}-${year}`;
			},
		});
	},
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

app.init();
