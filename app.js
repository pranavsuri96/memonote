if (typeof document !== 'undefined') {
    document.getElementById('save-note').addEventListener('click', () => {
        const noteContent = document.getElementById('note-content').value;

        if (!noteContent.trim()) {
            alert('Please write something in the note!');
            return;
        }

        // Check if a note ID already exists in sessionStorage
        let noteId = sessionStorage.getItem('currentNoteId');

        if (!noteId) {
            // Generate a unique ID for the note if it doesn't exist
            noteId = Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('currentNoteId', noteId);
        }

        // Save the note content in localStorage
        localStorage.setItem(noteId, noteContent);

        // Generate a shareable link
        const shareLink = `${window.location.origin}?note=${noteId}`;
        document.getElementById('share-link').value = shareLink;

        // Show the share link
        document.getElementById('note-link').classList.remove('hidden');
    });

    document.getElementById('copy-link').addEventListener('click', () => {
        const shareLinkInput = document.getElementById('share-link');

        // Select the text in the input field
        shareLinkInput.select();
        shareLinkInput.setSelectionRange(0, 99999); // For mobile compatibility

        // Copy the text to the clipboard
        navigator.clipboard.writeText(shareLinkInput.value)
            .then(() => {
                alert('Link copied to clipboard!');
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
            });
    });

    // Check if the page has a note ID in the URL
    window.onload = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const noteId = urlParams.get('note');

        if (noteId) {
            const noteContent = localStorage.getItem(noteId);

            if (noteContent) {
                document.getElementById('note-content').value = noteContent;
                sessionStorage.setItem('currentNoteId', noteId); // Set the note ID for the session
            } else {
                alert('Note not found!');
            }
        }
    };
}
