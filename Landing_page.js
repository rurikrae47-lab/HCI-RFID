// Support Modal Functionality
const sForm = document.getElementById('supportForm');
if (sForm) {
    sForm.onsubmit = function(e) {
        e.preventDefault();
        document.getElementById('supportContent').style.display = 'none';
        document.getElementById('supportSuccess').style.display = 'block';
    };
}

document.getElementById('modal-support').addEventListener('change', function() {
    if (!this.checked) {
        setTimeout(() => {
            document.getElementById('supportContent').style.display = 'block';
            document.getElementById('supportSuccess').style.display = 'none';
        }, 300);
    }
});
