const account = [
	{
		name: 'Samuel Öettinger',
		role: 'English Teacher'
	}
];

/* Storage */
const avatarStorage = 'sideboard_avatars';
const nameToken = document.querySelector('.name');
const roleToken = document.querySelector('.role');
const avatarBtn = document.getElementById('avatarBtn');
const avatarImg = document.getElementById('avatarImage');
const avatarInitials = document.getElementById('avatarInitials');

/* Set the name and role */
if (nameToken) nameToken.textContent = account[0]?.name || ''; // Default name if not set
if (roleToken) roleToken.textContent = account[0]?.role || 'Guest'; // Default role if not set

function setAvatar(dataUrl) {
	/* If there is no avatar image or initials, return */
	if (!avatarImg || !avatarInitials) return;
	
	/* If there is no data URL, set the avatar initials */
	if (dataUrl) {
		avatarImg.hidden = true
		avatarImg.removeAttribute('src')
		avatarInitials.hidden = false
		return
	}

	/* Set the avatar image */
	avatarImg.src = dataUrl;
	avatarImg.hidden = false;
	avatarInitials.hidden = true;
}

/* If there is a saved avatar, set it */
const savedAvatar = localStorage.getItem(avatarStorage);
if (savedAvatar) setAvatar(savedAvatar);

/* If the avatar button is clicked, open the file picker */
avatarBtn.addEventListener('click', ()=>{
	avatarInput?.click(); // Open the file picker
});

/* If the file is selected, set the avatar */
avatarInput.addEventListener('change', (event)=>{
	/* Get the file */
	const file = event.target.files?.[0];
	if (!file) return; // If there is no file, return
	if (!file.type.startsWith('image/')) return; // If the file is not an image, return

	/* Read the file as a data URL */
	const reader = new FileReader();
	reader.onload = ()=>{
		const dataUrl = String(reader.result || ''); // Get the data URL
		setAvatar(dataUrl); // Set the avatar
		localStorage.setItem(avatarStorage, dataUrl); // Save the avatar to localStorage
	}
	reader.readAsDataURL(file); // Read the file as a data URL
	event.target.value = ''; // Clear the file input
})