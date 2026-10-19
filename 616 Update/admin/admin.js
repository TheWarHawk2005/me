import PocketBase from '/pocketbase/pocketbase.es.js'

const url = 'https://harrison-web-dev.pockethost.io/'
const client = new PocketBase(url)
client.authStore.clear()

// DOCUMENT ELEMENTS

const orgID = '8ryubtt6l37qz46'
const loginDiv = document.getElementById('login-container')
const dashboardDiv = document.getElementById('dashboard-container')
const bannerTextEle = document.getElementById('banner-text')
const bannerMobileEle = document.getElementById('mobile-banner-text')
const bannerColorEle = document.getElementById('banner-color')

document.getElementById('login').addEventListener('click', async () => {
	window.location.hash = '' // clear location hash on login
	await login(
		document.getElementById('email').value,
		document.getElementById('password').value
	).then(async (response) => {
		await loadDashboard()
		showPage('profile-content')
	})
})

window.addEventListener('hashchange', async () => {
	showPage(window.location.hash.slice(1))
})

async function login(email, password) {
	try {
		const authData = await client.collection('users').authWithPassword(
			email,
			password
		);

		console.log('Logged in:', authData.record);
		console.log('User ID:', client.authStore.record.id);
		console.log('Organizations:', client.authStore.record.organizations);

		return authData.record;
	} catch (err) {
		console.error('Login failed:', err);
		throw err;
	}
}

/* ----------------------------- LOAD DASHBOARD ----------------------------- */
// most functions will be within this context

async function loadDashboard() {
	// show dashboard
	loginDiv.style.display = 'none'
	dashboardDiv.style.display = 'grid'

	const auth = client.authStore.baseModel					// get auth'd user's profile information
	const siteContent = await client.collection('site_content') // get settings of linked organization
		.getFirstListItem(`organization = "${orgID}"`)


	dashboardDiv.querySelectorAll('.user-avatar').forEach(ele => { ele.src = client.files.getURL(auth, auth.avatar) })
	dashboardDiv.querySelectorAll('.user-name').forEach(ele => { ele.innerHTML = auth.name })
	dashboardDiv.querySelectorAll('input[data-read-write-auth]').forEach(ele => { // Get all inputs looking for a auth value
		try {
			if (ele.type === 'text') {
				ele.value = auth[ele.dataset.readWriteAuth]
			}
		} catch (err) {
			console.error(`Can't fill value ${ele.dataset.readWriteAuth}`)
			console.error(auth)
			ele.value = ''
			return
		}
	})
	dashboardDiv.querySelectorAll('input[data-read-write]').forEach(ele => { // Get all inputs looking for a database value
		try {
			ele.value = siteContent[ele.dataset.readWrite]
		} catch (ele) {
			console.error(`Can't fill value ${ele.dataset.readWrite}`)
			console.error(siteContent)
			ele.value = ''
			return
		}
	})


	dashboardDiv.querySelectorAll('input').forEach((ele) => {
		ele.addEventListener('change', (event) => {
			event.target.classList.add('changed')

			//hardcoded avatar preview
			if (ele.id == 'input-profile-avatar') {
				const src = URL.createObjectURL(ele.files[0])
				document.getElementById('profile-avatar').src = src
			}
		})
	})

	document.getElementById('update-site-content').addEventListener('click', async () => {
		try {
			const response = await updateSiteContent(client.authStore.record.id, siteContent.id)
			console.log(response)
			document.querySelectorAll('input').forEach((ele) => {
				ele.classList.remove('changed')
			})

		} catch (err) {
			console.error('Update failed:', err);
			throw err;
		}
	})
}

async function showPage(pageId) {
	const page = document.getElementById(pageId) // get page container
	document.querySelectorAll('.page').forEach(ele => {
		ele.style.display = 'none'
	})
	page.style.display = 'block'
}

async function updateSiteContent(userId, siteContentId) {
	const authBody = {}
	const siteContentBody = {}

	document.querySelectorAll('.page input.changed[data-read-write-auth]').forEach(async (ele) => { // get all changed profile settings
		const key = ele.dataset.readWriteAuth
		if (ele.type === 'file') {
			const file = ele.files?.[0]
			if (file) { authBody[key] = file }
		} else {
			authBody[key] = ele.value
		}
	});
	document.querySelectorAll('.page input.changed[data-read-write]').forEach(async ele => { // get all changed settings
		const key = ele.dataset.readWrite
		siteContentBody[key] = ele.value
	})

	const authRecord = await client.collection('users').update(userId, authBody)
	const siteContentRecord = await client.collection('site_content').update(siteContentId, siteContentBody)
}

// REQUEST ACCESS
const requestAccess = function () {
	if (client.authStore.baseModel) {
		loginDiv.style.display = 'none'
		dashboardDiv.style.display = 'block'

		return
	}
	console.warn('client.authStore.baseModel not found. User is not logged in.')
}

// document.getElementById('get-post-data').addEventListener('click', async () => {
// 	const records = await client.collection('posts').getFullList({
// 		sort: '-created',
// 	});
// 	console.log(records)
// })

// document.getElementById('request-authstore').addEventListener('click', async () => {
// 	const email = document.getElementById('email').value
// 	const pass = document.getElementById('password').value

// 	const authData = await client.collection("users").authWithPassword(email.toString(), pass.toString()) //returns in authData and also fills out authStore
// 	document.getElementById('authstore-output').innerHTML = JSON.stringify(client.authStore)
// })

// document.getElementById('load-user').addEventListener('click', async () => {
// 	// load user from authstore
// 	if (client.authStore.baseModel) {
// 		const auth = client.authStore.baseModel
// 		document.getElementById('user-avatar').src = client.files.getURL(auth, auth.avatar)
// 		document.getElementById('user-name').innerHTML = auth.name
// 		document.getElementById('user-email').innerHTML = auth.email
// 	} else console.error('log in with request authstore')
// })