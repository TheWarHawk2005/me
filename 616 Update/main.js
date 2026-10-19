// LOAD NAVBAR
fetch('/navigation/navbar.html')
	.then(response => response.text())
	.then(data => {
		document.querySelector('nav').innerHTML = data;
	})
	.catch(error => console.error('Error loading navbar:', error));

// LOAD FOOTER
fetch('/navigation/footer.html')
	.then(response => response.text())
	.then(data => {
		document.querySelector('footer').innerHTML = data;
	})
	.catch(error => console.error('Error loading navbar:', error));

fetch('')