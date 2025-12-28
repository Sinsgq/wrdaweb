document.addEventListener('DOMContentLoaded', function () {
    var enterText = document.getElementById('enter-text');
    var mainContent = document.getElementById('main-content');

    enterText.addEventListener('click', function () {
        mainContent.style.display = 'block';
        enterText.style.display = 'none'; // Hide the "Click to Enter" text
    });
});