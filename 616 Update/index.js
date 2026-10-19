const SITECONTENT_ID = 'nu53nq2jvrbdzmo'

const clientWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)

loadSiteContentData(SITECONTENT_ID)

async function loadSiteContentData(siteContentId) { // loads public data from CMS dashboard like posts and announcements 
	const siteContent = await fetch(`https://harrison-web-dev.pockethost.io/api/collections/site_content/records/${siteContentId}`)
		.then(response => {
			if (!response.ok) {
				throw new Error(`HTTP error: ${response.status}`);
			}
			return response.json();
		})
		.then(data => {
			console.log("Site content:", data);
			return data
		})
		.catch(error => {
			console.error("Error:", error);
		});

	console.log(siteContent)

	/* ------------------------- ANNOUNCEMENT BANNER ------------------------- */
	const desktopBanner = document.getElementById('desktop-announcement-banner');
	const mobileBanner = document.getElementById('mobile-announcement-banner');
	const announcementBanner = document.getElementById('announcement-banner');

	announcementBanner.style.backgroundColor = siteContent.banner_color || 'black'

	// Desktop
	if (siteContent.banner_text?.trim()) {
		desktopBanner.innerHTML = siteContent.banner_text;
	}

	// Mobile
	if (siteContent.mobile_banner_text?.trim()) {
		mobileBanner.innerHTML = siteContent.mobile_banner_text;
	}
}
