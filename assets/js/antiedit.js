document.addEventListener('contextmenu', (mouseEvent) =>
    mouseEvent.preventDefault()
)
document.onkeydown = function (keyEvent) {
    if (keyEvent.keyCode == 123) {
        return false
    }
    if (keyEvent.ctrlKey && keyEvent.shiftKey && keyEvent.keyCode == 73) {
        return false
    }
    if (keyEvent.ctrlKey && keyEvent.shiftKey && keyEvent.keyCode == 74) {
        return false
    }
    if (keyEvent.ctrlKey && keyEvent.keyCode == 85) {
        return false
    }
}